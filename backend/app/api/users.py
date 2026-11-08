from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User

from app.services.user_auth_service import (
    hash_password,
    verify_password,
    create_user_access_token,
    require_user
)

router = APIRouter(
    prefix="/api/users",
    tags=["User Authentication"]
)


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_user(
    request: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered."
        )

    new_user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@router.post("/login")
def login_user(
    request: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user or not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive."
        )

    token = create_user_access_token(user.id)

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@router.get("/me")
async def get_current_user(
    current_user: User = Depends(require_user)
):
    return {
        "success": True,
        "message": "User profile retrieved successfully.",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at
        }
    }