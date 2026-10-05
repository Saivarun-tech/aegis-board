import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import UserSession
from app.models.user import User


password_hasher = PasswordHasher()

SESSION_COOKIE_NAME = "aegis_session"
SESSION_DURATION_DAYS = 7


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except Exception:
        return False


def create_session(
    db: Session,
    user: User,
) -> str:
    raw_token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=SESSION_DURATION_DAYS),
    )

    db.add(session)
    db.commit()

    return raw_token


def get_current_user(
    aegis_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not aegis_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    token_hash = hashlib.sha256(
        aegis_session.encode("utf-8")
    ).hexdigest()

    session = db.scalar(
        select(UserSession).where(
            UserSession.token_hash == token_hash
        )
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session.",
        )

    now = datetime.now(timezone.utc)

    if session.expires_at <= now:
        db.delete(session)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired.",
        )

    user = db.get(User, session.user_id)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account unavailable.",
        )

    return user