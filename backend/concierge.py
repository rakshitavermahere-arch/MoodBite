import json
import logging
import os
import re
import uuid
from typing import Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from auth import current_user
from catalog import FOOD_BY_ID, TIFFIN_BY_ID, catalog_text
from db import db, utc_now
from security import enforce_rate_limit, require_csrf


router = APIRouter(prefix="/api/concierge", tags=["concierge"])
logger = logging.getLogger("moodbite.concierge")

SYSTEM_PROMPT = f"""You are MoodBite Concierge, a warm, concise food guide for Indian college students.
Use mood, cravings, cuisine, diet, spice preference, budget, time, context, and prior choices.
Recommend only exact FOOD or TIFFIN ids from this catalog:

{catalog_text()}

Rules:
- Never recommend a food above the stated per-item budget.
- For recurring, monthly, PG, hostel, or home-style needs, include TIFFIN plans.
- Recommend 2 to 4 items and give each a specific personal reason.
- Keep the reply natural and useful in 1-2 sentences, without emojis.
- Return valid JSON only:
{{"reply":"...","food_ids":["f1"],"tiffin_ids":["t1"],"reasons":{{"f1":"..."}}}}
"""


class ConciergeRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    session_id: Optional[str] = Field(default=None, max_length=100)


def extract_json(text: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?|```$", "", text.strip()).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
    return {}


@router.post("")
async def concierge(payload: ConciergeRequest, request: Request, user: dict = Depends(current_user)):
    require_csrf(request)
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    await enforce_rate_limit(
        f"concierge:{user['user_id']}",
        int(os.environ["LLM_RATE_LIMIT_PER_MINUTE"]),
    )
    session_id = payload.session_id or f"chat_{uuid.uuid4().hex[:16]}"
    session = await db.concierge_sessions.find_one({"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0})
    if payload.session_id and not session:
        raise HTTPException(status_code=404, detail="Conversation not found")
    state = await db.app_states.find_one({"user_id": user["user_id"]}, {"_id": 0, "saved": 1, "eco_enabled": 1})
    preference_context = ""
    if state:
        preference_context = f"\nThe user's saved choices are {state.get('saved', {})}. Eco packaging preference is {'enabled' if state.get('eco_enabled') else 'disabled'}. Use only when relevant."
    try:
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"moodbite:{user['user_id']}:{session_id}",
            system_message=SYSTEM_PROMPT,
        ).with_model("openai", "gpt-5.4")
        response = await chat.send_message(UserMessage(text=message + preference_context))
        raw = response if isinstance(response, str) else str(response)
    except Exception:
        logger.exception("AI provider request failed for session %s", session_id)
        raise HTTPException(status_code=502, detail="The concierge is temporarily unavailable. Please retry")
    data = extract_json(raw)
    recommendations = []
    reasons = data.get("reasons") or {}
    for food_id in (data.get("food_ids") or [])[:4]:
        food = FOOD_BY_ID.get(food_id)
        if food:
            recommendations.append({**food, "type": "food", "reason": reasons.get(food_id, "A strong match for your request.")})
    for tiffin_id in (data.get("tiffin_ids") or [])[:4 - len(recommendations)]:
        provider = TIFFIN_BY_ID.get(tiffin_id)
        if provider:
            recommendations.append({**provider, "type": "tiffin", "reason": reasons.get(tiffin_id, "A reliable everyday meal plan.")})
    if not recommendations:
        raise HTTPException(status_code=502, detail="The concierge returned no usable recommendations. Please retry")
    reply = data.get("reply") or "These options fit what you described."
    await db.concierge_sessions.update_one(
        {"session_id": session_id, "user_id": user["user_id"]},
        {
            "$setOnInsert": {"created_at": utc_now()},
            "$set": {"updated_at": utc_now()},
            "$push": {"messages": {"$each": [
                {"role": "user", "text": message, "created_at": utc_now().isoformat()},
                {"role": "assistant", "text": reply, "recommendation_ids": [item["id"] for item in recommendations], "created_at": utc_now().isoformat()},
            ], "$slice": -40}},
        },
        upsert=True,
    )
    return {"session_id": session_id, "reply": reply, "recommendations": recommendations}
