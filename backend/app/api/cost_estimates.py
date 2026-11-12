from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.cost_estimate import CostEstimate
from app.models.user import User
from app.services.user_auth_service import require_user


router = APIRouter(
    prefix="/api/cost-estimates",
    tags=["Saved Cost Estimates"]
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class SaveCostEstimateRequest(BaseModel):

    trip_details: dict

    route_details: dict

    cost_breakdown: dict

    summary: dict


# --------------------------------------------------
# SAVE COST ESTIMATE
# --------------------------------------------------

@router.post("/save")
def save_cost_estimate(
    request: SaveCostEstimateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    try:

        trip = request.trip_details
        summary = request.summary

        new_estimate = CostEstimate(

            user_id=current_user.id,

            destination=trip["destination"],

            start_location=trip["start_location"],

            days=trip["days"],

            travellers=trip["travellers"],

            budget=summary["budget"],

            has_own_vehicle=trip["has_own_vehicle"],

            vehicle_type=trip.get("vehicle_type"),

            transport_mode=trip.get("transport_mode"),

            accommodation_type=trip["accommodation_type"],

            food_type=trip["food_type"],

            total_cost=summary["total_estimated_cost"],

            cost_per_traveller=summary["cost_per_traveller"],

            remaining_budget=summary["remaining_budget"],

            within_budget=summary["within_budget"],

            cost_breakdown=request.cost_breakdown,

            route_details=request.route_details

        )

        db.add(new_estimate)

        db.commit()

        db.refresh(new_estimate)

        return {
            "success": True,
            "message": "Cost estimate saved successfully.",
            "estimate_id": new_estimate.id
        }

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save cost estimate: {str(error)}"
        )

# --------------------------------------------------
# GET ALL SAVED COST ESTIMATES
# --------------------------------------------------

@router.get("/")
def get_saved_cost_estimates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    estimates = (
        db.query(CostEstimate)
        .filter(CostEstimate.user_id == current_user.id)
        .order_by(CostEstimate.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "total": len(estimates),
        "estimates": [
            {
                "id": estimate.id,
                "destination": estimate.destination,
                "start_location": estimate.start_location,
                "days": estimate.days,
                "travellers": estimate.travellers,
                "total_cost": estimate.total_cost,
                "budget": estimate.budget,
                "remaining_budget": estimate.remaining_budget,
                "within_budget": estimate.within_budget,
                "created_at": estimate.created_at
            }
            for estimate in estimates
        ]
    }

# --------------------------------------------------
# DELETE A SAVED COST ESTIMATE
# --------------------------------------------------

@router.delete("/{estimate_id}")
def delete_cost_estimate(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    estimate = (
        db.query(CostEstimate)
        .filter(
            CostEstimate.id == estimate_id,
            CostEstimate.user_id == current_user.id
        )
        .first()
    )

    if not estimate:
        raise HTTPException(
            status_code=404,
            detail="Cost estimate not found."
        )

    db.delete(estimate)
    db.commit()

    return {
        "success": True,
        "message": "Cost estimate deleted successfully."
    }

# --------------------------------------------------
# GET ONE SAVED COST ESTIMATE - FULL DETAILS
# --------------------------------------------------

@router.get("/{estimate_id}")
def get_cost_estimate_details(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):

    estimate = (
        db.query(CostEstimate)
        .filter(
            CostEstimate.id == estimate_id,
            CostEstimate.user_id == current_user.id
        )
        .first()
    )

    if not estimate:
        raise HTTPException(
            status_code=404,
            detail="Cost estimate not found."
        )

    return {
        "success": True,
        "estimate": {
            "id": estimate.id,
            "destination": estimate.destination,
            "start_location": estimate.start_location,
            "days": estimate.days,
            "travellers": estimate.travellers,
            "budget": estimate.budget,
            "has_own_vehicle": estimate.has_own_vehicle,
            "vehicle_type": estimate.vehicle_type,
            "transport_mode": estimate.transport_mode,
            "accommodation_type": estimate.accommodation_type,
            "food_type": estimate.food_type,
            "total_cost": estimate.total_cost,
            "cost_per_traveller": estimate.cost_per_traveller,
            "remaining_budget": estimate.remaining_budget,
            "within_budget": estimate.within_budget,
            "cost_breakdown": estimate.cost_breakdown,
            "route_details": estimate.route_details,
            "created_at": estimate.created_at
        }
    }