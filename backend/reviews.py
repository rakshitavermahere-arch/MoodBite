import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from auth import current_user
from catalog import RESTAURANT_BY_ID
from db import db, utc_now
from security import require_csrf


router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    order_id: str
    restaurant_id: str
    food_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=10, max_length=800)


def serialize_review(doc: dict) -> dict:
    created = doc["created_at"]
    return {
        "review_id": doc["review_id"],
        "order_id": doc["order_id"],
        "restaurant_id": doc["restaurant_id"],
        "food_id": doc.get("food_id"),
        "rating": doc["rating"],
        "comment": doc["comment"],
        "user": {"name": doc["user_name"], "picture": doc.get("user_picture")},
        "created_at": created.isoformat() if hasattr(created, "isoformat") else created,
    }


@router.get("/restaurant/{restaurant_id}")
async def restaurant_reviews(restaurant_id: str):
    if restaurant_id not in RESTAURANT_BY_ID:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    docs = await db.reviews.find({"restaurant_id": restaurant_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    count = len(docs)
    average = round(sum(item["rating"] for item in docs) / count, 1) if count else None
    return {"average": average, "count": count, "reviews": [serialize_review(item) for item in docs]}


@router.get("/eligibility/{restaurant_id}")
async def review_eligibility(restaurant_id: str, user: dict = Depends(current_user)):
    restaurant = RESTAURANT_BY_ID.get(restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    delivered = await db.orders.find(
        {
            "user_id": user["user_id"],
            "status": "delivered",
            "$or": [{"restaurant_id": restaurant_id}, {"restaurant": restaurant["name"]}],
        },
        {"_id": 0, "order_id": 1},
    ).to_list(50)
    order_ids = [item["order_id"] for item in delivered]
    reviewed = await db.reviews.find({"user_id": user["user_id"], "order_id": {"$in": order_ids}}, {"_id": 0, "order_id": 1}).to_list(50)
    reviewed_ids = {item["order_id"] for item in reviewed}
    eligible = next((order_id for order_id in order_ids if order_id not in reviewed_ids), None)
    return {"eligible": bool(eligible), "order_id": eligible}


@router.post("", status_code=201)
async def create_review(payload: ReviewCreate, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    restaurant = RESTAURANT_BY_ID.get(payload.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    order = await db.orders.find_one(
        {"order_id": payload.order_id, "user_id": user["user_id"], "status": "delivered"},
        {"_id": 0},
    )
    if not order or (order.get("restaurant_id") != payload.restaurant_id and order.get("restaurant") != restaurant["name"]):
        raise HTTPException(status_code=403, detail="Only delivered orders from this restaurant can be reviewed")
    if payload.food_id:
        ordered_ids = {item.get("product_id") for item in order.get("items", []) if isinstance(item, dict)}
        if ordered_ids and payload.food_id not in ordered_ids:
            raise HTTPException(status_code=400, detail="The selected food was not part of this order")
    if await db.reviews.find_one({"user_id": user["user_id"], "order_id": payload.order_id}, {"_id": 0, "review_id": 1}):
        raise HTTPException(status_code=409, detail="This order has already been reviewed")
    doc = {
        "review_id": f"review_{uuid.uuid4().hex[:16]}",
        "order_id": payload.order_id,
        "restaurant_id": payload.restaurant_id,
        "food_id": payload.food_id,
        "rating": payload.rating,
        "comment": payload.comment.strip(),
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_picture": user.get("picture"),
        "created_at": utc_now(),
    }
    await db.reviews.insert_one(doc.copy())
    return serialize_review(doc)
