from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from math import ceil
from typing import Literal

from app.api.maps import get_route_distance


router = APIRouter(
    prefix="/api/costs",
    tags=["Travel Cost Estimation"]
)


# --------------------------------------------------
# ESTIMATED SRI LANKAN COST RATES (LKR)
# --------------------------------------------------

PUBLIC_TRANSPORT_RATES = {
    "train": 1500,
    "bus": 1200
}

VEHICLE_HIRE_RATES = {
    "car": 12000,
    "van": 18000,
    "tuk_tuk": 5000
}

ACCOMMODATION_RATES = {
    "budget": 5000,
    "standard": 10000,
    "luxury": 25000
}

FOOD_RATES = {
    "budget": 1500,
    "standard": 3000,
    "luxury": 6000
}

ATTRACTION_RATE = 1500
OTHER_EXPENSE_RATE = 1000


# --------------------------------------------------
# SRI LANKAN FUEL PRICES (LKR PER LITRE)
# Updated: November 2026
# --------------------------------------------------

FUEL_PRICES = {
    "petrol_92": 424,
    "petrol_95": 490,
    "auto_diesel": 397,
    "super_diesel": 543
}


# Default fuel types.
# Users can select another fuel type when necessary.

DEFAULT_VEHICLE_FUEL = {
    "car": "petrol_92",
    "van": "auto_diesel",
    "tuk_tuk": "petrol_92"
}


# Estimated fuel efficiency (km per litre).
# Actual mileage depends on the vehicle and driving conditions.

FUEL_EFFICIENCY = {
    "car": 12,
    "van": 8,
    "tuk_tuk": 28
}


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class CostEstimateRequest(BaseModel):

    destination: str = Field(min_length=2)

    start_location: str = "Colombo"

    days: int = Field(ge=1, le=30)

    travellers: int = Field(default=2, ge=1, le=20)

    budget: float = Field(gt=0)

    has_own_vehicle: bool = False

    vehicle_type: Literal[
        "car",
        "van",
        "tuk_tuk"
    ] | None = None

    fuel_type: Literal[
        "petrol_92",
        "petrol_95",
        "auto_diesel",
        "super_diesel"
    ] | None = None

    transport_mode: Literal[
        "train",
        "bus",
        "tuk_tuk",
        "car",
        "van"
    ] | None = "bus"

    accommodation_type: Literal[
        "budget",
        "standard",
        "luxury"
    ] = "budget"

    food_type: Literal[
        "budget",
        "standard",
        "luxury"
    ] = "standard"


# --------------------------------------------------
# COST CALCULATION
# --------------------------------------------------

@router.post("/estimate")
async def estimate_travel_cost(request: CostEstimateRequest):

    try:

        days = request.days
        travellers = request.travellers

        rooms = ceil(travellers / 2)

        transport_cost = 0
        fuel_cost = 0
        vehicle_hire_cost = 0

        selected_vehicle = None
        selected_fuel_type = None
        selected_fuel_price = 0

        route_data = None

        one_way_distance = 0
        round_trip_distance = 0
        estimated_driving_minutes = 0
        fuel_litres = 0

        # ------------------------------------------
        # CASE 1: OWN VEHICLE
        # ------------------------------------------

        if request.has_own_vehicle:

            if not request.vehicle_type:
                raise HTTPException(
                    status_code=400,
                    detail="Please select your own vehicle type."
                )

            selected_vehicle = request.vehicle_type

        # ------------------------------------------
        # CASE 2: PUBLIC OR HIRED TRANSPORT
        # ------------------------------------------

        else:

            if not request.transport_mode:
                raise HTTPException(
                    status_code=400,
                    detail="Please select a transport method."
                )

            selected_mode = request.transport_mode

            # Public transport
            if selected_mode in PUBLIC_TRANSPORT_RATES:

                transport_cost = (
                    PUBLIC_TRANSPORT_RATES[selected_mode]
                    * travellers
                    * days
                )

            # Hired vehicle
            else:

                selected_vehicle = selected_mode

                vehicle_hire_cost = (
                    VEHICLE_HIRE_RATES[selected_mode] * days
                )

        # ------------------------------------------
        # ROUTE DISTANCE AND FUEL CALCULATION
        # ------------------------------------------

        if selected_vehicle:

            route_data = await get_route_distance(
                request.start_location,
                request.destination
            )

            one_way_distance = route_data["distance_km"]

            # Return journey
            round_trip_distance = one_way_distance * 2

            estimated_driving_minutes = (
                route_data["duration_minutes"] * 2
            )

            # Select fuel type
            selected_fuel_type = (
                request.fuel_type
                or DEFAULT_VEHICLE_FUEL[selected_vehicle]
            )

            selected_fuel_price = FUEL_PRICES[
                selected_fuel_type
            ]

            # Vehicle fuel efficiency
            fuel_efficiency = FUEL_EFFICIENCY[
                selected_vehicle
            ]

            # Calculate litres required
            fuel_litres = (
                round_trip_distance / fuel_efficiency
            )

            # Calculate total fuel cost
            fuel_cost = (
                fuel_litres * selected_fuel_price
            )

        # ------------------------------------------
        # ACCOMMODATION
        # ------------------------------------------

        accommodation_cost = (
            ACCOMMODATION_RATES[request.accommodation_type]
            * rooms
            * days
        )

        # ------------------------------------------
        # FOOD
        # ------------------------------------------

        food_cost = (
            FOOD_RATES[request.food_type]
            * travellers
            * days
        )

        # ------------------------------------------
        # ATTRACTIONS
        # ------------------------------------------

        attraction_cost = (
            ATTRACTION_RATE
            * travellers
            * days
        )

        # ------------------------------------------
        # OTHER EXPENSES
        # ------------------------------------------

        other_cost = (
            OTHER_EXPENSE_RATE
            * travellers
            * days
        )

        # ------------------------------------------
        # TOTAL COST
        # ------------------------------------------

        total_cost = (
            transport_cost
            + fuel_cost
            + vehicle_hire_cost
            + accommodation_cost
            + food_cost
            + attraction_cost
            + other_cost
        )

        cost_per_traveller = total_cost / travellers

        remaining_budget = request.budget - total_cost

        # ------------------------------------------
        # SMART BUDGET ADVICE
        # ------------------------------------------

        budget_advice = build_budget_advice(
            total_cost=total_cost,
            budget=request.budget,
            days=days,
            has_own_vehicle=request.has_own_vehicle,
            accommodation_type=request.accommodation_type,
            food_type=request.food_type
        )

        # ------------------------------------------
        # COST BREAKDOWN
        # ------------------------------------------

        categories = {

            "transport": {
                "amount": round(transport_cost, 2),
                "status": "estimated",
                "source": "Estimated public transport fees"
            },

            "fuel": {
                "amount": round(fuel_cost, 2),
                "status": "estimated",
                "source": "OSRM road distance and estimated vehicle mileage",
                "fuel_type": selected_fuel_type,
                "fuel_price_per_litre": selected_fuel_price,
                "fuel_litres": round(fuel_litres, 2),
                "fuel_efficiency_km_per_litre": (
                    FUEL_EFFICIENCY[selected_vehicle]
                    if selected_vehicle else None
                )
            },

            "vehicle_hire": {
                "amount": round(vehicle_hire_cost, 2),
                "status": "estimated",
                "source": "Estimated daily vehicle hire rates"
            },

            "accommodation": {
                "amount": round(accommodation_cost, 2),
                "status": "estimated",
                "source": "TripPlanner AI accommodation estimates"
            },

            "food": {
                "amount": round(food_cost, 2),
                "status": "estimated",
                "source": "TripPlanner AI food cost estimates"
            },

            "attractions": {
                "amount": round(attraction_cost, 2),
                "status": "estimated",
                "source": "Estimated attraction entrance fees"
            },

            "other_expenses": {
                "amount": round(other_cost, 2),
                "status": "estimated",
                "source": "Estimated parking, tolls and emergency allowance"
            }
        }

        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return {

            "success": True,

            "trip_details": {

                "start_location": request.start_location,
                "destination": request.destination,
                "days": days,
                "travellers": travellers,

                "has_own_vehicle": request.has_own_vehicle,

                "vehicle_type": selected_vehicle,

                "fuel_type": selected_fuel_type,

                "transport_mode": (
                    None
                    if request.has_own_vehicle
                    else request.transport_mode
                ),

                "accommodation_type": request.accommodation_type,
                "food_type": request.food_type

            },

            "route_details": {

                "one_way_distance_km": round(
                    one_way_distance, 2
                ),

                "round_trip_distance_km": round(
                    round_trip_distance, 2
                ),

                "estimated_driving_minutes": (
                    estimated_driving_minutes
                ),

                "distance_source": (
                    "OpenStreetMap OSRM"
                    if selected_vehicle
                    else None
                ),

                "start_coordinates": (
                    {
                        "latitude": float(
                            route_data["coordinates"]["start"]["lat"]
                        ),
                        "longitude": float(
                            route_data["coordinates"]["start"]["lon"]
                        )
                    }
                    if selected_vehicle else None
                ),

                "destination_coordinates": (
                    {
                        "latitude": float(
                            route_data["coordinates"]["destination"]["lat"]
                        ),
                        "longitude": float(
                            route_data["coordinates"]["destination"]["lon"]
                        )
                    }
                    if selected_vehicle else None
                )

            },

            "cost_breakdown": categories,

            "budget_advice": budget_advice,
            
            "summary": {

                "total_estimated_cost": round(total_cost, 2),

                "cost_per_traveller": round(
                    cost_per_traveller, 2
                ),

                "budget": round(request.budget, 2),

                "remaining_budget": round(
                    remaining_budget, 2
                ),

                "within_budget": total_cost <= request.budget

            },

            "currency": "LKR",

            "price_information": {

                "price_type": "Estimated",

                "fuel_prices_last_updated": "2026-11-01",

                "fuel_price_source": (
                    "Sri Lankan fuel price revision reported "
                    "effective November 1, 2026"
                ),

                "message": (
                    "Fuel costs use OSRM road distance for a "
                    "return journey, published fuel prices and "
                    "estimated vehicle fuel efficiency. Fuel prices "
                    "and vehicle mileage should be updated when "
                    "they change. Other expenses use estimated "
                    "rates, not confirmed live prices."
                )

            }

        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Cost estimation failed: {str(error)}"
        )

# --------------------------------------------------
# SMART BUDGET ASSISTANT
# --------------------------------------------------

def build_budget_advice(
    total_cost: float,
    budget: float,
    days: int,
    has_own_vehicle: bool,
    accommodation_type: str,
    food_type: str
):

    difference = total_cost - budget

    if total_cost <= budget:

        return {
            "status": "within_budget",
            "can_afford_trip": True,
            "budget_difference": round(budget - total_cost, 2),
            "message": (
                "Great! Your estimated trip cost is within "
                "your available budget."
            ),
            "suggestions": []
        }

    suggestions = []

    suggestions.append(
        "Choose budget-friendly accommodation to reduce costs."
    )

    if food_type != "budget":
        suggestions.append(
            "Choose budget food options and affordable local restaurants."
        )

    if has_own_vehicle:
        suggestions.append(
            "Consider a shorter route to reduce fuel expenses."
        )
    else:
        suggestions.append(
            "Compare bus and train travel to find cheaper transportation."
        )

    if accommodation_type != "budget":
        suggestions.append(
            "Consider guesthouses or budget hotels."
        )

    if days > 1:
        suggestions.append(
            "Reduce the number of travel days to lower accommodation and food costs."
        )

    return {
        "status": "over_budget",
        "can_afford_trip": False,
        "budget_difference": round(difference, 2),
        "message": (
            f"Your trip is approximately LKR {difference:,.2f} "
            "over your available budget. Consider these "
            "alternatives before generating your itinerary."
        ),
        "suggestions": suggestions,
        "recommended_action": "revise_trip_budget"
    }