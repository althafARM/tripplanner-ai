import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

password_hash = PasswordHash.recommended()


def authenticate_admin(username: str, password: str) -> bool:
    """Verify administrator credentials."""

    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password_hash = os.getenv("ADMIN_PASSWORD_HASH")

    if not admin_username or not admin_password_hash:
        return False

    if username != admin_username:
        return False

    try:
        return password_hash.verify(password, admin_password_hash)
    except Exception:
        return False


def create_access_token(username: str) -> str:
    """Generate a JWT access token."""

    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    if not secret_key:
        raise RuntimeError("JWT secret key is not configured.")

    expire_time = datetime.now(timezone.utc) + timedelta(
        minutes=expire_minutes
    )

    payload = {
        "sub": username,
        "role": "admin",
        "exp": expire_time
    }

    return jwt.encode(
        payload,
        secret_key,
        algorithm=algorithm
    )


def verify_admin_token(token: str) -> dict | None:
    """Verify a JWT token and confirm admin access."""

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

        if payload.get("role") != "admin":
            return None

        if payload.get("sub") != os.getenv("ADMIN_USERNAME"):
            return None

        return payload

    except jwt.InvalidTokenError:
        return None

# Admin authentication dependency
security = HTTPBearer(auto_error=False)


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Admin authentication required."
        )

    payload = verify_admin_token(credentials.credentials)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin token."
        )

    return payload