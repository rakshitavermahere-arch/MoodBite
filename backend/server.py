import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from auth import router as auth_router
from catalog import FOODS, MOODS, RESTAURANTS, TIFFIN
from commerce import router as commerce_router
from concierge import router as concierge_router
from db import client, create_indexes, db
from groups import router as groups_router
from payments import router as payments_router
from reviews import router as reviews_router


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("moodbite")


@asynccontextmanager
async def lifespan(_: FastAPI):
    await create_indexes()
    yield
    client.close()


app = FastAPI(title="MoodBite API", version="2.0.0", lifespan=lifespan)

origins = [value.strip() for value in os.environ["CORS_ORIGINS"].split(",") if value.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token", "Stripe-Signature"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.path.startswith("/api/auth") or request.url.path.startswith("/api/payments"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(Exception)
async def unhandled_error(request: Request, error: Exception):
    logger.exception("Unhandled request error on %s", request.url.path, exc_info=error)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please retry"})


class StatusCheckCreate(BaseModel):
    client_name: str = Field(min_length=1, max_length=100)


class StatusCheck(BaseModel):
    id: str
    client_name: str
    timestamp: str


@app.get("/api/")
async def api_health():
    return {"message": "MoodBite API", "version": "2.0.0"}


@app.get("/api/catalog")
async def catalog():
    return {"moods": MOODS, "foods": FOODS, "restaurants": RESTAURANTS, "tiffin": TIFFIN}


@app.post("/api/status", response_model=StatusCheck, status_code=201)
async def create_status(payload: StatusCheckCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "client_name": payload.client_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.status_checks.insert_one(doc.copy())
    return StatusCheck(**doc)


@app.get("/api/status", response_model=list[StatusCheck])
async def get_status():
    docs = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return [StatusCheck(**doc) for doc in docs]


app.include_router(auth_router)
app.include_router(concierge_router)
app.include_router(commerce_router)
app.include_router(groups_router)
app.include_router(reviews_router)
app.include_router(payments_router)
