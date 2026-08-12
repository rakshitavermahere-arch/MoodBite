import io
import os
import secrets
import string
import uuid
from datetime import timedelta
from urllib.parse import urlparse

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from auth import current_user, resolve_user
from catalog import FOOD_BY_ID
from db import as_utc, db, utc_now
from security import require_csrf


router = APIRouter(prefix="/api/groups", tags=["groups"])


class GroupCreateRequest(BaseModel):
    name: str = Field(default="Campus food run", min_length=2, max_length=80)
    origin_url: str


class GroupItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=20)


class GroupItemQuantity(BaseModel):
    quantity: int = Field(ge=1, le=20)


class SettlementRequest(BaseModel):
    status: str


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {}

    async def connect(self, group_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(group_id, set()).add(websocket)

    def disconnect(self, group_id: str, websocket: WebSocket):
        self.connections.get(group_id, set()).discard(websocket)

    async def broadcast(self, group_id: str, payload: dict):
        dead = []
        for websocket in self.connections.get(group_id, set()):
            try:
                await websocket.send_json(payload)
            except Exception:
                dead.append(websocket)
        for websocket in dead:
            self.disconnect(group_id, websocket)


manager = ConnectionManager()


def make_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "MB-" + "".join(secrets.choice(alphabet) for _ in range(6))


def validate_origin(origin_url: str) -> str:
    parsed = urlparse(origin_url)
    allowed = {urlparse(value).netloc for value in os.environ["CORS_ORIGINS"].split(",")}
    if parsed.scheme not in {"http", "https"} or parsed.netloc not in allowed:
        raise HTTPException(status_code=400, detail="Invalid invite origin")
    return f"{parsed.scheme}://{parsed.netloc}"


def group_payload(group: dict) -> dict:
    contributions = {member["user_id"]: 0 for member in group.get("members", [])}
    enriched_items = []
    for item in group.get("items", []):
        food = FOOD_BY_ID.get(item["product_id"])
        if not food:
            continue
        total = food["price"] * item["quantity"]
        contributions[item["user_id"]] = contributions.get(item["user_id"], 0) + total
        enriched_items.append({**item, **food, "item_id": item["item_id"], "line_total": total})
    subtotal = sum(contributions.values())
    delivery = 29 if subtotal else 0
    taxes = round(subtotal * 0.05)
    return {
        "group_id": group["group_id"],
        "code": group["code"],
        "name": group["name"],
        "host_user_id": group["host_user_id"],
        "members": group.get("members", []),
        "items": enriched_items,
        "settlements": group.get("settlements", {}),
        "contributions": contributions,
        "subtotal": subtotal,
        "delivery": delivery,
        "taxes": taxes,
        "total": subtotal + delivery + taxes,
        "status": group["status"],
        "invite_url": group["invite_url"],
        "expires_at": as_utc(group["expires_at"]).isoformat(),
    }


async def get_group_for_member(group_id: str, user_id: str) -> dict:
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group order not found")
    if user_id not in [member["user_id"] for member in group.get("members", [])]:
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    return group


async def publish(group_id: str):
    group = await db.groups.find_one({"group_id": group_id}, {"_id": 0})
    if group:
        await manager.broadcast(group_id, {"type": "group.updated", "group": group_payload(group)})


@router.post("")
async def create_group(payload: GroupCreateRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    origin = validate_origin(payload.origin_url)
    await db.groups.update_many(
        {"host_user_id": user["user_id"], "status": "active"},
        {"$set": {"status": "closed", "closed_at": utc_now()}},
    )
    code = make_code()
    while await db.groups.find_one({"code": code}, {"_id": 0, "code": 1}):
        code = make_code()
    group_id = f"group_{uuid.uuid4().hex[:16]}"
    now = utc_now()
    group = {
        "group_id": group_id,
        "code": code,
        "name": payload.name.strip(),
        "host_user_id": user["user_id"],
        "members": [{"user_id": user["user_id"], "name": user["name"], "picture": user.get("picture"), "role": "host", "joined_at": now.isoformat()}],
        "items": [],
        "settlements": {},
        "status": "active",
        "invite_url": f"{origin}/group/join/{code}",
        "created_at": now,
        "expires_at": now + timedelta(hours=24),
    }
    await db.groups.insert_one(group.copy())
    return group_payload(group)


@router.get("/current")
async def current_group(user: dict = Depends(current_user)):
    group = await db.groups.find_one(
        {"members.user_id": user["user_id"], "status": "active", "expires_at": {"$gt": utc_now()}},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    return group_payload(group) if group else None


@router.get("/invite/{code}")
async def invite_preview(code: str):
    group = await db.groups.find_one({"code": code.upper()}, {"_id": 0})
    if not group or group["status"] != "active" or as_utc(group["expires_at"]) <= utc_now():
        raise HTTPException(status_code=404, detail="Invite is invalid or expired")
    host = next(member for member in group["members"] if member["user_id"] == group["host_user_id"])
    return {"code": group["code"], "name": group["name"], "host": host["name"], "member_count": len(group["members"]), "expires_at": as_utc(group["expires_at"]).isoformat()}


@router.get("/invite/{code}/qr")
async def invite_qr(code: str):
    group = await db.groups.find_one({"code": code.upper()}, {"_id": 0, "invite_url": 1, "status": 1, "expires_at": 1})
    if not group or group["status"] != "active" or as_utc(group["expires_at"]) <= utc_now():
        raise HTTPException(status_code=404, detail="Invite is invalid or expired")
    image = qrcode.make(group["invite_url"])
    stream = io.BytesIO()
    image.save(stream, format="PNG")
    stream.seek(0)
    return StreamingResponse(stream, media_type="image/png", headers={"Cache-Control": "no-store"})


@router.post("/join/{code}")
async def join_group(code: str, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    group = await db.groups.find_one({"code": code.upper()}, {"_id": 0})
    if not group or group["status"] != "active" or as_utc(group["expires_at"]) <= utc_now():
        raise HTTPException(status_code=404, detail="Invite is invalid or expired")
    if user["user_id"] not in [member["user_id"] for member in group["members"]]:
        member = {"user_id": user["user_id"], "name": user["name"], "picture": user.get("picture"), "role": "participant", "joined_at": utc_now().isoformat()}
        await db.groups.update_one({"group_id": group["group_id"], "status": "active"}, {"$push": {"members": member}})
        await publish(group["group_id"])
    refreshed = await db.groups.find_one({"group_id": group["group_id"]}, {"_id": 0})
    return group_payload(refreshed)


@router.get("/{group_id}")
async def get_group(group_id: str, user: dict = Depends(current_user)):
    return group_payload(await get_group_for_member(group_id, user["user_id"]))


@router.post("/{group_id}/items")
async def add_item(group_id: str, payload: GroupItemRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    if payload.product_id not in FOOD_BY_ID:
        raise HTTPException(status_code=404, detail="Food item not found")
    group = await get_group_for_member(group_id, user["user_id"])
    if group["status"] != "active":
        raise HTTPException(status_code=409, detail="This group cart is no longer editable")
    existing = next((item for item in group.get("items", []) if item["user_id"] == user["user_id"] and item["product_id"] == payload.product_id), None)
    if existing:
        quantity = min(20, existing["quantity"] + payload.quantity)
        await db.groups.update_one({"group_id": group_id, "items.item_id": existing["item_id"]}, {"$set": {"items.$.quantity": quantity, "updated_at": utc_now()}})
    else:
        item = {"item_id": f"gitem_{uuid.uuid4().hex[:12]}", "user_id": user["user_id"], "product_id": payload.product_id, "quantity": payload.quantity, "added_at": utc_now().isoformat()}
        await db.groups.update_one({"group_id": group_id}, {"$push": {"items": item}, "$set": {"updated_at": utc_now()}})
    await publish(group_id)
    return group_payload(await get_group_for_member(group_id, user["user_id"]))


@router.patch("/{group_id}/items/{item_id}")
async def update_item(group_id: str, item_id: str, payload: GroupItemQuantity, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    await get_group_for_member(group_id, user["user_id"])
    result = await db.groups.update_one(
        {"group_id": group_id, "status": "active", "items": {"$elemMatch": {"item_id": item_id, "user_id": user["user_id"]}}},
        {"$set": {"items.$.quantity": payload.quantity, "updated_at": utc_now()}},
    )
    if result.modified_count != 1:
        raise HTTPException(status_code=403, detail="You can only update your own active group items")
    await publish(group_id)
    return group_payload(await get_group_for_member(group_id, user["user_id"]))


@router.delete("/{group_id}/items/{item_id}")
async def remove_item(group_id: str, item_id: str, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    await get_group_for_member(group_id, user["user_id"])
    result = await db.groups.update_one(
        {"group_id": group_id, "status": "active", "items": {"$elemMatch": {"item_id": item_id, "user_id": user["user_id"]}}},
        {"$pull": {"items": {"item_id": item_id, "user_id": user["user_id"]}}, "$set": {"updated_at": utc_now()}},
    )
    if result.modified_count != 1:
        raise HTTPException(status_code=403, detail="You can only remove your own active group items")
    await publish(group_id)
    return group_payload(await get_group_for_member(group_id, user["user_id"]))


@router.post("/{group_id}/settlements/{member_id}")
async def update_settlement(group_id: str, member_id: str, payload: SettlementRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    group = await get_group_for_member(group_id, user["user_id"])
    if member_id == group["host_user_id"]:
        raise HTTPException(status_code=400, detail="The host does not settle with themselves")
    allowed = {"sent"} if user["user_id"] == member_id else {"received", "owed"} if user["user_id"] == group["host_user_id"] else set()
    if payload.status not in allowed:
        raise HTTPException(status_code=403, detail="You cannot make this settlement change")
    await db.groups.update_one({"group_id": group_id}, {"$set": {f"settlements.{member_id}": payload.status, "updated_at": utc_now()}})
    await publish(group_id)
    return group_payload(await get_group_for_member(group_id, user["user_id"]))


@router.post("/{group_id}/close")
async def close_group(group_id: str, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    group = await get_group_for_member(group_id, user["user_id"])
    if group["host_user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the host can close this group")
    await db.groups.update_one({"group_id": group_id}, {"$set": {"status": "closed", "closed_at": utc_now()}})
    await publish(group_id)
    return {"ok": True}


@router.websocket("/{group_id}/ws")
async def group_socket(websocket: WebSocket, group_id: str):
    try:
        user = await resolve_user(websocket)
        group = await get_group_for_member(group_id, user["user_id"])
    except HTTPException:
        await websocket.close(code=4401)
        return
    await manager.connect(group_id, websocket)
    await websocket.send_json({"type": "group.initial", "group": group_payload(group)})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(group_id, websocket)
