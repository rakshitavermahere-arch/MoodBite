import hashlib
import os
import secrets
from datetime import timedelta

import jwt
from fastapi import HTTPException, Request
from pwdlib import PasswordHash

from db import db, utc_now


password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("moodbite-dummy-password-never-used")


def hash_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def make_token() -> str:
    return secrets.token_urlsafe(48)


def issue_access_token(user_id: str, session_id: str) -> str:
    now = utc_now()
    payload = {
        "sub": user_id,
        "sid": session_id,
        "iss": os.environ["JWT_ISSUER"],
        "iat": now,
        "exp": now + timedelta(minutes=int(os.environ["ACCESS_MINUTES"])),
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        os.environ["JWT_SECRET"],
        algorithms=["HS256"],
        issuer=os.environ["JWT_ISSUER"],
    )


def validate_password(password: str) -> None:
    if len(password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters")
    if not any(ch.islower() for ch in password) or not any(ch.isupper() for ch in password):
        raise HTTPException(status_code=400, detail="Password must include upper and lowercase letters")
    if not any(ch.isdigit() for ch in password):
        raise HTTPException(status_code=400, detail="Password must include a number")


def require_csrf(request: Request) -> None:
    cookie = request.cookies.get("csrf_token")
    header = request.headers.get("x-csrf-token")
    if not cookie or not header or not secrets.compare_digest(cookie, header):
        raise HTTPException(status_code=403, detail="Security token is missing or invalid")


async def enforce_rate_limit(key: str, limit: int, window_seconds: int = 60) -> None:
    now = utc_now()
    doc = await db.rate_limits.find_one({"key": key}, {"_id": 0})
    if not doc or doc["expires_at"] <= now.replace(tzinfo=None):
        await db.rate_limits.update_one(
            {"key": key},
            {"$set": {"count": 1, "expires_at": now + timedelta(seconds=window_seconds)}},
            upsert=True,
        )
        return
    if doc["count"] >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again shortly")
    await db.rate_limits.update_one({"key": key}, {"$inc": {"count": 1}})


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
