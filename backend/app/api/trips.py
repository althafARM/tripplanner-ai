from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.services.logging_service import log_info, log_error
from app.services.ai_service import generate_itinerary

from app.services.monitoring_service import (
    start_ai_request,
    record_ai_request
)

from app.database.connection import get_db
from app.models.trip import Trip
from app.models.user import User
from app.services.user_auth_service import require_user


router = APIRouter(
    prefix="/api/trips",
    tags=["AI Travel Planner"]
)


# -----------------------------
# TRIP GENERATION REQUEST
# -----------------------------

class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_location: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: str
    travel_style: str
    travellers: int = Field(ge=1, le=20)


# -----------------------------
# SAVE TRIP REQUEST
# -----------------------------

class SaveTripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_location: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: str = Field(max_length=100)
    travel_style: str = Field(max_length=500)
    travellers: int = Field(ge=1, le=20)
    itinerary: str = Field(min_length=1)

class UpdateTripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_location: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: str = Field(max_length=100)
    travel_style: str = Field(max_length=500)
    travellers: int = Field(ge=1, le=20)

# -----------------------------
# GENERATE AI ITINERARY
# -----------------------------

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


# -----------------------------
# SAVE GENERATED TRIP
# -----------------------------

@router.post("/save")
def save_trip(
    request: SaveTripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    try:
        new_trip = Trip(
            user_id=current_user.id,
            destination=request.destination,
            start_location=request.start_location,
            days=request.days,
            budget=request.budget,
            travel_style=request.travel_style,
            travellers=request.travellers,
            itinerary=request.itinerary
        )

        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)

        log_info(
            f"Trip saved successfully for user {current_user.id}."
        )

        return {
            "success": True,
            "message": "Trip saved successfully.",
            "trip": {
                "id": new_trip.id,
                "destination": new_trip.destination,
                "created_at": new_trip.created_at
            }
        }

    except SQLAlchemyError as error:

        db.rollback()
        log_error(f"Trip saving failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to save trip. Please try again."
        )


# -----------------------------
# GET LOGGED-IN USER'S TRIPS
# -----------------------------

@router.get("/my-trips")
def get_my_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "total": len(trips),
        "trips": [
            {
                "id": trip.id,
                "destination": trip.destination,
                "start_location": trip.start_location,
                "days": trip.days,
                "budget": trip.budget,
                "travel_style": trip.travel_style,
                "travellers": trip.travellers,
                "itinerary": trip.itinerary,
                "created_at": trip.created_at
            }
            for trip in trips
        ]
    }

# -----------------------------
# REGENERATE SAVED TRIP ITINERARY
# -----------------------------

@router.post("/{trip_id}/regenerate")
def regenerate_saved_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id
        )
        .first()
    )

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found."
        )

    start_time = start_ai_request()

    try:
        new_itinerary = generate_itinerary(
            destination=trip.destination,
            start_location=trip.start_location,
            days=trip.days,
            budget=trip.budget,
            travel_style=trip.travel_style,
            travellers=trip.travellers
        )

        trip.itinerary = new_itinerary

        db.commit()
        db.refresh(trip)

        record_ai_request(start_time, success=True)

        log_info(
            f"Itinerary regenerated for trip {trip_id}."
        )

        return {
            "success": True,
            "message": "Itinerary regenerated successfully.",
            "trip": {
                "id": trip.id,
                "destination": trip.destination,
                "itinerary": trip.itinerary
            }
        }

    except RuntimeError as error:
        db.rollback()

        record_ai_request(start_time, success=False)
        log_error(f"Itinerary regeneration failed: {error}")

        raise HTTPException(
            status_code=503,
            detail=str(error)
        )

    except Exception as error:
        db.rollback()

        record_ai_request(start_time, success=False)
        log_error(f"Itinerary regeneration error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to regenerate itinerary. Please try again."
        )
    
# -----------------------------
# DELETE SAVED TRIP
# -----------------------------

@router.put("/{trip_id}")
def update_trip(
    trip_id: int,
    request: UpdateTripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id
        )
        .first()
    )

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found."
        )

    try:
        trip.destination = request.destination
        trip.start_location = request.start_location
        trip.days = request.days
        trip.budget = request.budget
        trip.travel_style = request.travel_style
        trip.travellers = request.travellers

        db.commit()
        db.refresh(trip)

        return {
            "success": True,
            "message": "Trip updated successfully.",
            "trip": {
                "id": trip.id,
                "destination": trip.destination,
                "start_location": trip.start_location,
                "days": trip.days,
                "budget": trip.budget,
                "travel_style": trip.travel_style,
                "travellers": trip.travellers
            }
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update trip."
        )
        
@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id
        )
        .first()
    )

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found."
        )

    try:
        db.delete(trip)
        db.commit()

        log_info(
            f"Trip {trip_id} deleted by user {current_user.id}."
        )

        return {
            "success": True,
            "message": "Trip deleted successfully."
        }

    except SQLAlchemyError as error:

        db.rollback()
        log_error(f"Trip deletion failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to delete trip."
        )

    