import os

from datetime import timedelta

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.admin_auth_service import (
    authenticate_admin,
    create_access_token
)

load_dotenv()

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Authentication"]
)


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)


@router.post("/login")
async def admin_login(request: AdminLoginRequest):

    # Verify administrator credentials
    authenticated = authenticate_admin(
        request.username,
        request.password
    )

    if not authenticated:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    # Generate JWT token
    access_token = create_access_token(request.username)

    expire_minutes = int(
        os.getenv("JWT_EXPIRE_MINUTES", "60")
    )

    return {
        "success": True,
        "message": "Admin login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expire_minutes * 60
    }