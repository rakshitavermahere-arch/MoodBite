import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


async def create_indexes() -> None:
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_id", unique=True)
    await db.user_sessions.create_index("token_hash", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.reset_tokens.create_index("token_hash", unique=True)
    await db.reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.app_states.create_index("user_id", unique=True)
    await db.groups.create_index("group_id", unique=True)
    await db.groups.create_index("code", unique=True)
    await db.groups.create_index("expires_at", expireAfterSeconds=0)
    await db.reviews.create_index([("user_id", 1), ("order_id", 1)], unique=True)
    await db.orders.create_index("order_id", unique=True)
    await db.orders.create_index(
        [("user_id", 1), ("idempotency_key", 1)],
        unique=True,
        partialFilterExpression={"idempotency_key": {"$type": "string"}},
    )
    await db.payment_events.create_index([("provider", 1), ("event_id", 1)], unique=True)
    await db.rate_limits.create_index("expires_at", expireAfterSeconds=0)
