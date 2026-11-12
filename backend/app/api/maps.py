from fastapi import APIRouter, HTTPException
import httpx
import asyncio
import time
from pydantic import BaseModel
from app.services.ai_service import extract_trip_locations

router = APIRouter(
    prefix="/api/maps",
    tags=["Maps"]
    
)

# Geocoding cache
GEOCODE_CACHE = {}

# Prevent simultaneous requests to Nominatim
NOMINATIM_LOCK = asyncio.Lock()

# Track the previous request time
LAST_NOMINATIM_REQUEST = 0.0

# Alternative names for Sri Lankan locations
LOCATION_ALIASES = {
    "sigiriya rock fortress": ["Sigiriya", "Sigiriya Rock"],
    "pidurangala rock": ["Pidurangala", "Pidurangala Rock"],
    "dambulla cave temple": ["Dambulla Cave Temple", "Dambulla"],
    "kandalama lake": ["Kandalama Lake", "Kandalama"],
    "elephant rock viewpoint": ["Elephant Rock", "Elephant Rock viewpoint"],
}

# Local coordinates for popular Sri Lankan attractions
LOCAL_COORDINATES = {
    "kandy lake": {
        "lat": 7.2936,
        "lon": 80.6414
    },
    "temple of the sacred tooth relic": {
        "lat": 7.2936,
        "lon": 80.6414
    },
    "temple of the tooth": {
        "lat": 7.2936,
        "lon": 80.6414
    },
    "peradeniya botanical gardens": {
        "lat": 7.2711,
        "lon": 80.5956
    },
    "udawattekele sanctuary": {
        "lat": 7.2994,
        "lon": 80.6389
    },
    "sigiriya": {
        "lat": 7.9570,
        "lon": 80.7603
    },
    "sigiriya rock fortress": {
        "lat": 7.9570,
        "lon": 80.7603
    },
    "pidurangala rock": {
        "lat": 7.9668,
        "lon": 80.7603
    },
    "dambulla cave temple": {
        "lat": 7.8567,
        "lon": 80.6492
    },
    "galle fort": {
        "lat": 6.0269,
        "lon": 80.2170
    },
        "kandy market": {
        "lat": 7.2933,
        "lon": 80.6350
    },
    "mackwoods tea plantation": {
    "lat": 7.0247,
    "lon": 80.7185
    },
    "mackwoods tea estate": {
        "lat": 7.0247,
        "lon": 80.7185
    },
    "mackwoods labookellie tea centre": {
        "lat": 7.0247,
        "lon": 80.7185
    },
    "damro labookellie tea centre": {
        "lat": 7.0247,
        "lon": 80.7185
    },
}


@router.get("/geocode")
async def geocode_location(name: str):

    global LAST_NOMINATIM_REQUEST

    cache_key = name.strip().lower()

    # 1. Check local coordinate database first
    if cache_key in LOCAL_COORDINATES:

        result = {
            "name": name,
            "lat": LOCAL_COORDINATES[cache_key]["lat"],
            "lon": LOCAL_COORDINATES[cache_key]["lon"]
        }

        GEOCODE_CACHE[cache_key] = result

        print(f"LOCAL COORDINATE FOUND: {name}")

        return result


    # 2. Check geocoding cache
    if cache_key in GEOCODE_CACHE:

        print(f"GEOCODE CACHE HIT: {name}")

        return GEOCODE_CACHE[cache_key]

    url = "https://nominatim.openstreetmap.org/search"

    search_names = LOCATION_ALIASES.get(
        cache_key,
        [name]
    )

    headers = {
        "User-Agent": "TripPlannerAI/1.0 (travel itinerary application)"
    }

    try:
        async with NOMINATIM_LOCK:

            # Check cache again after acquiring the lock
            if cache_key in GEOCODE_CACHE:
                return GEOCODE_CACHE[cache_key]

            async with httpx.AsyncClient(timeout=20) as client:

                for search_name in search_names:

                    # Wait before sending another request
                    elapsed = (
                        time.monotonic() - LAST_NOMINATIM_REQUEST
                    )

                    wait_time = 1.1 - elapsed

                    if wait_time > 0:
                        await asyncio.sleep(wait_time)

                    params = {
                        "format": "jsonv2",
                        "limit": 1,
                        "q": f"{search_name}, Sri Lanka"
                    }

                    response = await client.get(
                        url,
                        params=params,
                        headers=headers
                    )

                    LAST_NOMINATIM_REQUEST = time.monotonic()

                    response.raise_for_status()

                    data = response.json()

                    if data:

                        result = {
                            "name": name,
                            "lat": float(data[0]["lat"]),
                            "lon": float(data[0]["lon"])
                        }

                        # Save coordinates for future requests
                        GEOCODE_CACHE[cache_key] = result

                        print(f"GEOCODE SUCCESS: {name}")

                        return result

            raise HTTPException(
                status_code=404,
                detail=f"Location not found: {name}"
            )

    except httpx.HTTPStatusError as error:

        print(
            "NOMINATIM ERROR:",
            error.response.status_code
        )

        raise HTTPException(
            status_code=502,
            detail="Map service temporarily unavailable."
        )

    except httpx.RequestError as error:

        print("MAP CONNECTION ERROR:", str(error))

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the map service."
        )

class ItineraryRequest(BaseModel):
    itinerary: str


@router.post("/extract-locations")
def extract_locations(request: ItineraryRequest):

    try:
        locations = extract_trip_locations(
            request.itinerary
        )

        return {
            "success": True,
            "data": locations
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Location extraction failed: {str(error)}"
        )

# --------------------------------------------------
# ACTUAL ROAD DISTANCE USING OSRM
# --------------------------------------------------

@router.get("/route-distance")
async def get_route_distance(
    start_location: str,
    destination: str
):
    try:
        # Get starting location coordinates
        start = await geocode_location(start_location)

        # Get destination coordinates
        end = await geocode_location(destination)

        # OSRM requires longitude,latitude order
        route_url = (
            f"https://router.project-osrm.org/route/v1/driving/"
            f"{start['lon']},{start['lat']};"
            f"{end['lon']},{end['lat']}"
        )

        async with httpx.AsyncClient(timeout=30) as client:

            response = await client.get(
                route_url,
                params={
                    "overview": "false",
                    "alternatives": "false"
                }
            )

            response.raise_for_status()

            data = response.json()

        if data.get("code") != "Ok" or not data.get("routes"):
            raise HTTPException(
                status_code=404,
                detail="No driving route found between these locations."
            )

        route = data["routes"][0]

        distance_km = round(
            route["distance"] / 1000,
            2
        )

        duration_minutes = round(
            route["duration"] / 60
        )

        return {
            "success": True,
            "start_location": start_location,
            "destination": destination,
            "distance_km": distance_km,
            "duration_minutes": duration_minutes,
            "distance_source": "OpenStreetMap OSRM",
            "coordinates": {
                "start": start,
                "destination": end
            }
        }

    except HTTPException:
        raise

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=502,
            detail="Routing service temporarily unavailable."
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the routing service."
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Route calculation failed: {str(error)}"
        )