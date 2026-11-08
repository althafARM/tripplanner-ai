from typing import Literal
from app.services.monitoring_service import (
    start_ai_request,
    record_ai_request
)
from app.services.logging_service import log_info, log_error
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_service import generate_chat_response

router = APIRouter(
    prefix="/api",
    tags=["AI Travel Assistant"]
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    start_time = start_ai_request()

    try:
        answer = generate_chat_response(
            request.message,
            request.history
        )

        record_ai_request(start_time, success=True)

        # Save successful request in application logs
        log_info("AI Chat request completed successfully.")

        return {"response": answer}

    except Exception as error:

        record_ai_request(start_time, success=False)

        # Save error in application logs
        log_error(f"AI Chat Error: {error}")

        raise HTTPException(
            status_code=500,
            detail="AI assistant is temporarily unavailable."
        )