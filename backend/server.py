from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage
from catalog import catalog_text, FOOD_BY_ID, TIFFIN_BY_ID, FOODS, TIFFIN

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger("moodbite")

SYSTEM_PROMPT = f"""You are MoodBite Concierge, a warm, upbeat AI food buddy for Indian college students.
You help students decide what to eat based on their mood, cravings, budget (in Rupees), dietary needs, situation and number of people.
You can recommend individual FOOD items and/or monthly TIFFIN meal plans from the catalog below. ONLY recommend items from this catalog using their exact ids.

{catalog_text()}

RULES:
- Read the user's mood, budget, diet (veg/non-veg), cuisine, situation.
- Respect budget: never recommend food items priced above the stated budget.
- If user wants recurring/monthly/home-style food or is in a PG/hostel with no time to cook, recommend TIFFIN plans.
- Recommend 2 to 4 items total. Give each a short, personal reason ("Recommended because ...").
- Keep the chat reply friendly, 1-2 sentences, a little playful, no emojis.

Respond ONLY with valid JSON, no markdown, in this exact shape:
{{"reply": "short friendly message", "food_ids": ["f1"], "tiffin_ids": ["t1"], "reasons": {{"f1": "why this fits", "t1": "why this fits"}}}}
"""


class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ConciergeRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    return {}


@api_router.get("/")
async def root():
    return {"message": "MoodBite API"}


@api_router.get("/catalog")
async def get_catalog():
    return {"foods": FOODS, "tiffin": TIFFIN}


@api_router.post("/concierge")
async def concierge(req: ConciergeRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")
    session_id = req.session_id or str(uuid.uuid4())
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=SYSTEM_PROMPT,
        ).with_model("openai", "gpt-5.4")
        resp = await chat.send_message(UserMessage(text=req.message))
        raw = resp if isinstance(resp, str) else str(resp)
    except Exception as e:
        logger.exception("concierge llm error")
        raise HTTPException(status_code=502, detail=f"AI concierge unavailable: {e}")

    data = _extract_json(raw)
    reasons = data.get("reasons", {}) or {}
    recs = []
    for fid in data.get("food_ids", []) or []:
        item = FOOD_BY_ID.get(fid)
        if item:
            recs.append({**item, "type": "food", "reason": reasons.get(fid, "A great pick for you.")})
    for tid in data.get("tiffin_ids", []) or []:
        item = TIFFIN_BY_ID.get(tid)
        if item:
            recs.append({**item, "type": "tiffin", "reason": reasons.get(tid, "A reliable everyday meal plan.")})

    reply = data.get("reply") or "Here are a few things I think you'll love."
    try:
        await db.concierge_logs.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "message": req.message,
            "reply": reply,
            "rec_ids": [r["id"] for r in recs],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass
    return {"session_id": session_id, "reply": reply, "recommendations": recs}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in checks:
        if isinstance(c['timestamp'], str):
            c['timestamp'] = datetime.fromisoformat(c['timestamp'])
    return checks


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
