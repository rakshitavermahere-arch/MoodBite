import os
import uuid
from urllib.parse import urlparse

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from auth import current_user
from catalog import FOOD_BY_ID
from commerce import get_or_create_state
from db import db, utc_now
from groups import get_group_for_member
from security import require_csrf


router = APIRouter(prefix="/api", tags=["payments"])


class QuoteRequest(BaseModel):
    group_id: str | None = None


class DeliveryAddress(BaseModel):
    line: str = Field(min_length=8, max_length=200)
    city: str = Field(min_length=2, max_length=80)
    pincode: str = Field(pattern=r"^\d{6}$")


class StripeCheckoutRequest(BaseModel):
    origin_url: str
    idempotency_key: str = Field(min_length=16, max_length=100)
    group_id: str | None = None
    address: DeliveryAddress


def stripe_available() -> bool:
    return os.environ["STRIPE_MODE"] == "available" and all(
        os.environ.get(name) for name in ("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET")
    )


def validate_origin(origin_url: str) -> str:
    parsed = urlparse(origin_url)
    allowed = {urlparse(value).netloc for value in os.environ["CORS_ORIGINS"].split(",")}
    if parsed.scheme not in {"http", "https"} or parsed.netloc not in allowed:
        raise HTTPException(status_code=400, detail="Invalid checkout origin")
    return f"{parsed.scheme}://{parsed.netloc}"


async def source_items(user_id: str, group_id: str | None) -> tuple[list[dict], str | None]:
    if group_id:
        group = await get_group_for_member(group_id, user_id)
        if group["host_user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Only the group host can start checkout")
        return group.get("items", []), group_id
    state = await get_or_create_state(user_id)
    return state.get("cart", []), None


async def build_quote(user_id: str, group_id: str | None = None) -> dict:
    raw_items, group_reference = await source_items(user_id, group_id)
    quantities: dict[str, int] = {}
    for item in raw_items:
        product_id = item.get("product_id")
        if product_id not in FOOD_BY_ID:
            continue
        quantity = min(20, max(1, int(item.get("quantity", 1))))
        quantities[product_id] = quantities.get(product_id, 0) + quantity
    line_items = []
    for product_id, quantity in quantities.items():
        food = FOOD_BY_ID[product_id]
        line_items.append({
            "product_id": product_id,
            "name": food["name"],
            "restaurant": food["restaurant"],
            "quantity": quantity,
            "unit_price": food["price"],
            "line_total": food["price"] * quantity,
        })
    if not line_items:
        raise HTTPException(status_code=400, detail="Your cart is empty")
    state = await get_or_create_state(user_id)
    subtotal = sum(item["line_total"] for item in line_items)
    delivery = 29
    taxes = round(subtotal * 0.05)
    eco_enabled = bool(state.get("eco_enabled", True))
    eco_discount = min(10, subtotal) if eco_enabled else 0
    total = subtotal + delivery + taxes - eco_discount
    return {
        "items": line_items,
        "subtotal": subtotal,
        "delivery": delivery,
        "taxes": taxes,
        "eco_enabled": eco_enabled,
        "eco_discount": eco_discount,
        "total": total,
        "currency": "INR",
        "group_id": group_reference,
    }


@router.get("/payments/availability")
async def payment_availability():
    available = stripe_available()
    return {
        "stripe": {
            "available": available,
            "mode": os.environ["STRIPE_MODE"],
            "reason": None if available else "Stripe checkout is unavailable for this project's current country configuration",
        },
        "razorpay": {
            "available": False,
            "reason": "Razorpay credentials are not configured",
        },
    }


@router.post("/checkout/quote")
async def checkout_quote(payload: QuoteRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    return await build_quote(user["user_id"], payload.group_id)


@router.post("/payments/stripe/create")
async def create_stripe_checkout(payload: StripeCheckoutRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    if not stripe_available():
        raise HTTPException(status_code=503, detail="Stripe checkout is not available in this environment")
    existing = await db.orders.find_one(
        {"user_id": user["user_id"], "idempotency_key": payload.idempotency_key},
        {"_id": 0},
    )
    if existing:
        return {"checkout_url": existing.get("checkout_url"), "session_id": existing.get("provider_session_id"), "order_id": existing["order_id"]}
    quote = await build_quote(user["user_id"], payload.group_id)
    origin = validate_origin(payload.origin_url)
    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
    order_id = f"MB-{uuid.uuid4().hex[:10].upper()}"
    line_items = [
        {
            "price_data": {
                "currency": "inr",
                "product_data": {"name": item["name"], "metadata": {"product_id": item["product_id"]}},
                "unit_amount": item["unit_price"] * 100,
            },
            "quantity": item["quantity"],
        }
        for item in quote["items"]
    ]
    line_items.extend([
        {"price_data": {"currency": "inr", "product_data": {"name": "Delivery fee"}, "unit_amount": quote["delivery"] * 100}, "quantity": 1},
        {"price_data": {"currency": "inr", "product_data": {"name": "Estimated taxes and charges"}, "unit_amount": quote["taxes"] * 100}, "quantity": 1},
    ])
    discounts = []
    if quote["eco_discount"]:
        coupon = stripe.Coupon.create(
            amount_off=quote["eco_discount"] * 100,
            currency="inr",
            duration="once",
            name="MoodBite Eco packaging credit",
        )
        discounts = [{"coupon": coupon.id}]
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/payment/cancel",
        client_reference_id=order_id,
        customer_email=user["email"],
        discounts=discounts,
        metadata={"order_id": order_id, "user_id": user["user_id"]},
        idempotency_key=payload.idempotency_key,
    )
    doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "idempotency_key": payload.idempotency_key,
        "provider": "stripe",
        "provider_session_id": session.id,
        "checkout_url": session.url,
        "items": quote["items"],
        "amount": quote["total"],
        "currency": "INR",
        "status": "payment_pending",
        "payment_status": "pending",
        "group_id": payload.group_id,
        "address": payload.address.model_dump(),
        "eco": quote["eco_enabled"],
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }
    await db.orders.insert_one(doc.copy())
    return {"checkout_url": session.url, "session_id": session.id, "order_id": order_id}


@router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    order = await db.orders.find_one({"provider_session_id": session_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Payment session not found")
    if order["payment_status"] == "pending" and stripe_available():
        try:
            stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid":
                await mark_order_paid(order["order_id"], session.payment_intent)
                order = await db.orders.find_one({"order_id": order["order_id"]}, {"_id": 0})
            elif session.status == "expired":
                await db.orders.update_one({"order_id": order["order_id"], "payment_status": "pending"}, {"$set": {"status": "payment_expired", "payment_status": "expired", "updated_at": utc_now()}})
        except stripe.error.StripeError:
            pass
    return {"session_id": session_id, "order_id": order["order_id"], "status": order["status"], "payment_status": order["payment_status"]}


async def mark_order_paid(order_id: str, payment_intent: str | None):
    result = await db.orders.update_one(
        {"order_id": order_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "confirmed", "payment_status": "paid", "provider_payment_id": payment_intent, "updated_at": utc_now()}},
    )
    if result.modified_count:
        order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
        if not order.get("group_id"):
            await db.app_states.update_one({"user_id": order["user_id"]}, {"$set": {"cart": [], "updated_at": utc_now()}})
        if order.get("eco"):
            await db.app_states.update_one(
                {"user_id": order["user_id"]},
                {"$inc": {"eco_stats.packaging": 2, "eco_stats.score": 12, "eco_stats.ecoOrders": 1}, "$set": {"updated_at": utc_now()}},
            )


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    if not stripe_available():
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, signature, os.environ["STRIPE_WEBHOOK_SECRET"])
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    if await db.payment_events.find_one({"provider": "stripe", "event_id": event["id"]}, {"_id": 0, "event_id": 1}):
        return {"ok": True}
    data = event["data"]["object"]
    event_type = event["type"]
    if event_type == "checkout.session.completed" and data.get("payment_status") == "paid":
        order = await db.orders.find_one({"provider_session_id": data["id"]}, {"_id": 0, "order_id": 1})
        if order:
            await mark_order_paid(order["order_id"], data.get("payment_intent"))
    elif event_type in {"checkout.session.expired", "checkout.session.async_payment_failed"}:
        await db.orders.update_one(
            {"provider_session_id": data["id"], "payment_status": "pending"},
            {"$set": {"status": "payment_failed", "payment_status": "failed", "updated_at": utc_now()}},
        )
    await db.payment_events.insert_one({"provider": "stripe", "event_id": event["id"], "received_at": utc_now()})
    return {"ok": True}
