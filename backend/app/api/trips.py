from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.logging_service import log_info, log_error
from app.services.ai_service import generate_itinerary

from app.services.monitoring_service import (
    start_ai_request,
    record_ai_request
)

router = APIRouter(
    prefix="/api/trips",
    tags=["AI Travel Planner"]
)


class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_location: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: str
    travel_style: str
    travellers: int = Field(ge=1, le=20)


@router.post("/generate")
def create_itinerary(request: TripRequest):

    start_time = start_ai_request()

    try:
        itinerary = generate_itinerary(
            destination=request.destination,
            start_location=request.start_location,
            days=request.days,
            budget=request.budget,
            travel_style=request.travel_style,
            travellers=request.travellers
        )

        record_ai_request(start_time, success=True)

        # Record successful itinerary generation
        log_info(
            f"Itinerary generated successfully for {request.destination}."
        )

        return {
            "success": True,
            "destination": request.destination,
            "itinerary": itinerary
        }

    except RuntimeError as error:

        record_ai_request(start_time, success=False)

        log_error(f"Itinerary generation failed: {error}")

        raise HTTPException(
            status_code=503,
            detail=str(error)
        )

    except Exception as error:

        record_ai_request(start_time, success=False)

        log_error(f"AI generation error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate itinerary. Please try again."
        )