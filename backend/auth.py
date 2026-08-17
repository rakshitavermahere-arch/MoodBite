import os
import uuid
from datetime import timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

from db import as_utc, db, utc_now
from security import (
    DUMMY_HASH,
    client_ip,
    decode_access_token,
    enforce_rate_limit,
    hash_token,
    issue_access_token,
    make_token,
    password_hash,
    require_csrf,
    validate_password,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])
COOKIE_SECURE = os.environ["COOKIE_SECURE"].lower() == "true"
COOKIE_SAMESITE = os.environ["COOKIE_SAMESITE"]


class UserPublic(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    picture: Optional[str] = None
    providers: list[str] = Field(default_factory=list)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionRequest(BaseModel):
    session_id: str = Field(min_length=10, max_length=500)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=500)
    password: str
    confirm_password: str


def public_user(doc: dict) -> UserPublic:
    return UserPublic(
        user_id=doc["user_id"],
        name=doc["name"],
        email=doc["email"],
        picture=doc.get("picture"),
        providers=doc.get("providers", []),
    )


def set_auth_cookies(response: Response, access_token: str, session_token: str, csrf_token: str) -> None:
    access_seconds = int(os.environ["ACCESS_MINUTES"]) * 60
    session_seconds = int(os.environ["SESSION_DAYS"]) * 24 * 60 * 60
    common = {"secure": COOKIE_SECURE, "samesite": COOKIE_SAMESITE, "path": "/"}
    response.set_cookie("access_token", access_token, httponly=True, max_age=access_seconds, **common)
    response.set_cookie("session_token", session_token, httponly=True, max_age=session_seconds, **common)
    response.set_cookie("csrf_token", csrf_token, httponly=False, max_age=session_seconds, **common)


def clear_auth_cookies(response: Response) -> None:
    for key in ("access_token", "session_token", "csrf_token"):
        response.delete_cookie(key, path="/", secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE)


async def create_session(user_id: str, response: Response, provider: str, raw_token: Optional[str] = None) -> None:
    session_id = f"sess_{uuid.uuid4().hex}"
    session_token = raw_token or make_token()
    if raw_token and await db.user_sessions.find_one({"token_hash": hash_token(raw_token)}, {"_id": 0, "session_id": 1}):
        raise HTTPException(status_code=409, detail="This authentication session has already been used")
    csrf_token = make_token()
    now = utc_now()
    await db.user_sessions.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "token_hash": hash_token(session_token),
        "provider": provider,
        "created_at": now,
        "expires_at": now + timedelta(days=int(os.environ["SESSION_DAYS"])),
        "revoked_at": None,
    })
    set_auth_cookies(response, issue_access_token(user_id, session_id), session_token, csrf_token)


async def resolve_user(request: Request) -> dict:
    user_id = None
    session = None
    token = request.cookies.get("access_token")
    authorization = request.headers.get("authorization", "")
    if not token and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    if token:
        try:
            payload = decode_access_token(token)
            session = await db.user_sessions.find_one(
                {"session_id": payload["sid"], "user_id": payload["sub"]},
                {"_id": 0},
            )
            user_id = payload["sub"]
        except Exception:
            session = None
    if not session:
        raw = request.cookies.get("session_token")
        if not raw and authorization.lower().startswith("bearer "):
            raw = authorization.split(" ", 1)[1]
        if raw:
            session = await db.user_sessions.find_one({"token_hash": hash_token(raw)}, {"_id": 0})
            user_id = session.get("user_id") if session else None
    if not session or session.get("revoked_at") or as_utc(session["expires_at"]) <= utc_now():
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def current_user(user: dict = Depends(resolve_user)) -> dict:
    return user


@router.post("/register", response_model=UserPublic, status_code=201)
async def register(payload: RegisterRequest, request: Request, response: Response):
    await enforce_rate_limit(
        f"register:{client_ip(request)}",
        int(os.environ["LOGIN_RATE_LIMIT_PER_MINUTE"]),
    )
    email = payload.email.lower().strip()
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    validate_password(payload.password)
    if await db.users.find_one({"email": email}, {"_id": 0, "user_id": 1}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user_id = f"user_{uuid.uuid4().hex[:16]}"
    doc = {
        "user_id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": password_hash.hash(payload.password),
        "picture": None,
        "providers": ["password"],
        "created_at": utc_now(),
    }
    await db.users.insert_one(doc)
    await create_session(user_id, response, "password")
    return public_user(doc)


@router.post("/login", response_model=UserPublic)
async def login(payload: LoginRequest, request: Request, response: Response):
    await enforce_rate_limit(
        f"login:{client_ip(request)}",
        int(os.environ["LOGIN_RATE_LIMIT_PER_MINUTE"]),
    )
    user = await db.users.find_one({"email": payload.email.lower().strip()}, {"_id": 0})
    stored_hash = user.get("password_hash") if user else None
    if not stored_hash:
        password_hash.verify(payload.password, DUMMY_HASH)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not password_hash.verify(payload.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await create_session(user["user_id"], response, "password")
    return public_user(user)


@router.post("/google/session", response_model=UserPublic)
async def google_session(payload: GoogleSessionRequest, response: Response):
    async with httpx.AsyncClient(timeout=20) as client:
        provider_response = await client.get(
            os.environ["GOOGLE_SESSION_DATA_URL"],
            headers={"X-Session-ID": payload.session_id},
        )
    if provider_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Google authentication could not be verified")
    data = provider_response.json()
    if not data.get("id") or not data.get("email") or not data.get("session_token"):
        raise HTTPException(status_code=401, detail="Google authentication response was incomplete")
    email = data["email"].lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user:
        providers = sorted(set(user.get("providers", []) + ["google"]))
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"name": data.get("name") or user["name"], "picture": data.get("picture"), "google_sub": data["id"], "providers": providers}},
        )
        user.update({"name": data.get("name") or user["name"], "picture": data.get("picture"), "providers": providers})
    else:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:16]}",
            "name": data.get("name") or email.split("@", 1)[0],
            "email": email,
            "picture": data.get("picture"),
            "google_sub": data["id"],
            "providers": ["google"],
            "created_at": utc_now(),
        }
        await db.users.insert_one(user.copy())
    await create_session(user["user_id"], response, "google", data["session_token"])
    return public_user(user)

@router.get("/csrf-token")
async def csrf_token(request: Request):
    return {"csrf_token": request.cookies.get("csrf_token")}

@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(current_user)):
    return public_user(user)


@router.post("/refresh", response_model=UserPublic)
async def refresh(request: Request, response: Response):
    require_csrf(request)
    raw = request.cookies.get("session_token")
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"token_hash": hash_token(raw)}, {"_id": 0})
    if not session or session.get("revoked_at") or as_utc(session["expires_at"]) <= utc_now():
        clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Session expired")
    await db.user_sessions.update_one({"session_id": session["session_id"]}, {"$set": {"revoked_at": utc_now()}})
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    await create_session(user["user_id"], response, session.get("provider", "password"))
    return public_user(user)


@router.post("/logout")
async def logout(request: Request, response: Response):
    require_csrf(request)
    raw = request.cookies.get("session_token")
    if raw:
        await db.user_sessions.update_one({"token_hash": hash_token(raw)}, {"$set": {"revoked_at": utc_now()}})
    access = request.cookies.get("access_token")
    if access:
        try:
            payload = decode_access_token(access)
            await db.user_sessions.update_one({"session_id": payload["sid"]}, {"$set": {"revoked_at": utc_now()}})
        except Exception:
            pass
    clear_auth_cookies(response)
    return {"ok": True}


@router.post("/forgot-password", status_code=202)
async def forgot_password(payload: ForgotPasswordRequest, request: Request):
    await enforce_rate_limit(f"forgot:{client_ip(request)}", 5)
    user = await db.users.find_one({"email": payload.email.lower().strip()}, {"_id": 0, "user_id": 1})
    if user:
        raw = make_token()
        await db.reset_tokens.insert_one({
            "token_hash": hash_token(raw),
            "user_id": user["user_id"],
            "created_at": utc_now(),
            "expires_at": utc_now() + timedelta(minutes=int(os.environ["RESET_TOKEN_MINUTES"])),
            "used_at": None,
        })
    return {"message": "If the account exists, reset instructions will be sent when email delivery is configured"}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    validate_password(payload.password)
    token = await db.reset_tokens.find_one({"token_hash": hash_token(payload.token)}, {"_id": 0})
    if not token or token.get("used_at") or as_utc(token["expires_at"]) <= utc_now():
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")
    updated = await db.reset_tokens.update_one(
        {"token_hash": token["token_hash"], "used_at": None},
        {"$set": {"used_at": utc_now()}},
    )
    if updated.modified_count != 1:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")
    await db.users.update_one(
        {"user_id": token["user_id"]},
        {"$set": {"password_hash": password_hash.hash(payload.password)}, "$addToSet": {"providers": "password"}},
    )
    await db.user_sessions.update_many({"user_id": token["user_id"], "revoked_at": None}, {"$set": {"revoked_at": utc_now()}})
    return {"message": "Password updated. Sign in with your new password"}
