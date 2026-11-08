import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_user_access_token(user_id: int) -> str:
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    if not secret_key:
        raise RuntimeError("JWT secret key is not configured.")

    expire_time = datetime.now(timezone.utc) + timedelta(
        minutes=expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "role": "user",
        "exp": expire_time
    }

    return jwt.encode(payload, secret_key, algorithm=algorithm)


def verify_user_token(token: str) -> dict | None:
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    if not secret_key:
        return None

    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[algorithm]
        )

        if payload.get("role") != "user":
            return None

        return payload

    except jwt.InvalidTokenError:
        return None

security = HTTPBearer(auto_error=False)


async def require_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="User authentication required."
        )

    payload = verify_user_token(credentials.credentials)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired user token."
        )

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user token."
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User account is unavailable."
        )

    return user