import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from auth import current_user
from catalog import FOOD_BY_ID, TIFFIN_BY_ID
from db import db, utc_now
from security import require_csrf


router = APIRouter(prefix="/api", tags=["commerce"])


class CartItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=20)


class CartQuantityRequest(BaseModel):
    quantity: int = Field(ge=0, le=20)


class EcoPreferenceRequest(BaseModel):
    enabled: bool


class SaveRequest(BaseModel):
    item_type: str
    item_id: str


class MigrationRequest(BaseModel):
    cart: list[dict[str, Any]] = Field(default_factory=list)
    saved: dict[str, list[str]] = Field(default_factory=dict)
    eco: bool = True
    eco_stats: dict[str, int] = Field(default_factory=dict)
    subscriptions: list[dict[str, Any]] = Field(default_factory=list)
    orders: list[dict[str, Any]] = Field(default_factory=list)


class SubscriptionRequest(BaseModel):
    provider_id: str
    plan_id: str


def default_state(user_id: str) -> dict:
    return {
        "user_id": user_id,
        "cart": [],
        "saved": {"restaurants": [], "tiffin": []},
        "eco_enabled": True,
        "eco_stats": {"packaging": 0, "score": 0, "ecoOrders": 0},
        "subscriptions": [],
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }


async def get_or_create_state(user_id: str) -> dict:
    state = await db.app_states.find_one({"user_id": user_id}, {"_id": 0})
    if state:
        return state
    state = default_state(user_id)
    await db.app_states.insert_one(state.copy())
    return state


def canonical_cart(raw_items: list[dict]) -> list[dict]:
    quantities: dict[str, int] = {}
    for raw in raw_items:
        product_id = raw.get("product_id") or raw.get("id")
        if product_id not in FOOD_BY_ID:
            continue
        try:
            quantity = int(raw.get("quantity", raw.get("qty", 1)))
        except (TypeError, ValueError):
            quantity = 1
        quantities[product_id] = min(20, max(1, quantities.get(product_id, 0) + quantity))
    return [{"product_id": key, "quantity": value} for key, value in quantities.items()]


def enriched_cart(items: list[dict]) -> list[dict]:
    result = []
    for item in items:
        food = FOOD_BY_ID.get(item["product_id"])
        if food:
            result.append({**food, "product_id": food["id"], "quantity": item["quantity"]})
    return result


async def state_payload(user_id: str) -> dict:
    state = await get_or_create_state(user_id)
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {
        "cart": enriched_cart(state.get("cart", [])),
        "saved": state.get("saved", {"restaurants": [], "tiffin": []}),
        "eco": state.get("eco_enabled", True),
        "eco_stats": state.get("eco_stats", {"packaging": 0, "score": 0, "ecoOrders": 0}),
        "subscriptions": state.get("subscriptions", []),
        "orders": orders,
    }


async def replace_cart(user_id: str, cart: list[dict]) -> dict:
    await db.app_states.update_one(
        {"user_id": user_id},
        {"$set": {"cart": cart, "updated_at": utc_now()}},
        upsert=True,
    )
    return await state_payload(user_id)


@router.get("/app-state")
async def get_app_state(user: dict = Depends(current_user)):
    return await state_payload(user["user_id"])


@router.post("/app-state/migrate")
async def migrate_state(payload: MigrationRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    existing = await db.app_states.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if existing:
        return await state_payload(user["user_id"])
    state = default_state(user["user_id"])
    state["cart"] = canonical_cart(payload.cart)
    state["saved"] = {
        "restaurants": list(dict.fromkeys(payload.saved.get("restaurants", [])))[:100],
        "tiffin": [item for item in dict.fromkeys(payload.saved.get("tiffin", [])) if item in TIFFIN_BY_ID][:100],
    }
    state["eco_enabled"] = payload.eco
    state["eco_stats"] = {
        "packaging": max(0, int(payload.eco_stats.get("packaging", 0))),
        "score": max(0, int(payload.eco_stats.get("score", 0))),
        "ecoOrders": max(0, int(payload.eco_stats.get("ecoOrders", 0))),
    }
    for old in payload.subscriptions[:20]:
        provider_id = old.get("providerId") or old.get("provider_id")
        provider = TIFFIN_BY_ID.get(provider_id)
        if provider:
            state["subscriptions"].append({
                "subscription_id": f"sub_{uuid.uuid4().hex[:12]}",
                "provider_id": provider_id,
                "provider": provider["name"],
                "plan": old.get("plan", "Legacy plan"),
                "price": int(old.get("price", provider["monthly"])),
                "status": "legacy_active",
                "created_at": utc_now().isoformat(),
            })
    await db.app_states.insert_one(state.copy())
    for old in payload.orders[:30]:
        source_id = str(old.get("id", uuid.uuid4().hex[:8]))
        order_id = f"LEGACY-{user['user_id'][-6:]}-{source_id}"
        await db.orders.update_one(
            {"order_id": order_id},
            {"$setOnInsert": {
                "order_id": order_id,
                "user_id": user["user_id"],
                "restaurant": old.get("restaurant", "MoodBite order"),
                "items": old.get("items", []),
                "amount": int(old.get("total", 0)),
                "currency": "INR",
                "status": "delivered",
                "payment_status": "legacy",
                "legacy": True,
                "created_at": utc_now(),
            }},
            upsert=True,
        )
    return await state_payload(user["user_id"])


@router.post("/cart/items")
async def add_cart_item(payload: CartItemRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    if payload.product_id not in FOOD_BY_ID:
        raise HTTPException(status_code=404, detail="Food item not found")
    state = await get_or_create_state(user["user_id"])
    cart = canonical_cart(state.get("cart", []) + [payload.model_dump()])
    return await replace_cart(user["user_id"], cart)


@router.patch("/cart/items/{product_id}")
async def update_cart_item(product_id: str, payload: CartQuantityRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    state = await get_or_create_state(user["user_id"])
    found = False
    cart = []
    for item in state.get("cart", []):
        if item["product_id"] == product_id:
            found = True
            if payload.quantity > 0:
                cart.append({"product_id": product_id, "quantity": payload.quantity})
        else:
            cart.append(item)
    if not found:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return await replace_cart(user["user_id"], cart)


@router.delete("/cart/items/{product_id}")
async def remove_cart_item(product_id: str, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    state = await get_or_create_state(user["user_id"])
    cart = [item for item in state.get("cart", []) if item["product_id"] != product_id]
    return await replace_cart(user["user_id"], cart)


@router.delete("/cart")
async def clear_cart(request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    return await replace_cart(user["user_id"], [])


@router.put("/preferences/eco")
async def set_eco(payload: EcoPreferenceRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    await db.app_states.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"eco_enabled": payload.enabled, "updated_at": utc_now()}},
        upsert=True,
    )
    return await state_payload(user["user_id"])


@router.post("/saved/toggle")
async def toggle_saved(payload: SaveRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    if payload.item_type not in {"restaurants", "tiffin"}:
        raise HTTPException(status_code=400, detail="Unsupported saved item type")
    state = await get_or_create_state(user["user_id"])
    saved = state.get("saved", {"restaurants": [], "tiffin": []})
    values = list(saved.get(payload.item_type, []))
    if payload.item_id in values:
        values.remove(payload.item_id)
    else:
        values.append(payload.item_id)
    saved[payload.item_type] = values
    await db.app_states.update_one({"user_id": user["user_id"]}, {"$set": {"saved": saved, "updated_at": utc_now()}}, upsert=True)
    return await state_payload(user["user_id"])


@router.post("/subscriptions", status_code=202)
async def request_subscription(payload: SubscriptionRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    provider = TIFFIN_BY_ID.get(payload.provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Tiffin provider not found")
    plan = next((item for item in provider.get("plans", []) if item["id"] == payload.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Tiffin plan not found")
    state = await get_or_create_state(user["user_id"])
    existing = next((item for item in state.get("subscriptions", []) if item["provider_id"] == payload.provider_id and item.get("plan_id") == payload.plan_id and item["status"] in {"payment_required", "active"}), None)
    if existing:
        return {"subscription": existing, "state": await state_payload(user["user_id"])}
    subscription = {
        "subscription_id": f"sub_{uuid.uuid4().hex[:12]}",
        "provider_id": provider["id"],
        "provider": provider["name"],
        "plan_id": plan["id"],
        "plan": plan["name"],
        "price": round(plan["price"] * (1 - plan.get("discount", 0) / 100)),
        "status": "payment_required",
        "created_at": utc_now().isoformat(),
    }
    await db.app_states.update_one(
        {"user_id": user["user_id"]},
        {"$push": {"subscriptions": subscription}, "$set": {"updated_at": utc_now()}},
        upsert=True,
    )
    return {"subscription": subscription, "state": await state_payload(user["user_id"])}


@router.delete("/subscriptions/{subscription_id}")
async def cancel_subscription(subscription_id: str, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    result = await db.app_states.update_one(
        {"user_id": user["user_id"], "subscriptions.subscription_id": subscription_id},
        {"$set": {"subscriptions.$.status": "cancelled", "updated_at": utc_now()}},
    )
    if result.modified_count != 1:
        raise HTTPException(status_code=404, detail="Subscription request not found")
    return await state_payload(user["user_id"])