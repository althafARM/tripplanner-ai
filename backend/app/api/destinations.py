from fastapi import APIRouter

router = APIRouter(
    prefix="/api/destinations",
    tags=["Destinations"]
)

destinations = [
    {
        "id": 1,
        "name": "Ella",
        "location": "Badulla, Sri Lanka",
        "category": "Nature",
        "description": "Beautiful mountains, waterfalls and scenic train journeys.",
        "budget": "Medium",
        "image": "https://th.bing.com/th/id/R.ba828cf81ed566828bf667eb75f435f0?rik=MC7z7fiiUVIsKQ&pid=ImgRaw&r=0"
    },
    {
        "id": 2,
        "name": "Sigiriya",
        "location": "Matale, Sri Lanka",
        "category": "Adventure",
        "description": "Explore the famous Sigiriya Rock Fortress.",
        "budget": "Medium",
        "image": "https://tkatours.com/wp-content/uploads/2022/09/sigiriya5.jpg"
    },
    {
        "id": 3,
        "name": "Galle",
        "location": "Southern Province, Sri Lanka",
        "category": "Beach",
        "description": "Enjoy beaches, historic buildings and beautiful sunsets.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"
    },
     {
        "id": 4,
        "name": "Kandy",
        "location": "Central Province, Sri Lanka",
        "category": "Culture",
        "description": "Discover the Temple of the Tooth and beautiful Kandy Lake.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800"
    },
    {
        "id": 5,
        "name": "Nuwara Eliya",
        "location": "Central Province, Sri Lanka",
        "category": "Nature",
        "description": "Explore tea plantations, cool weather and beautiful landscapes.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800"
    },
    {
        "id": 6,
        "name": "Mirissa",
        "location": "Southern Province, Sri Lanka",
        "category": "Beach",
        "description": "Enjoy tropical beaches, surfing and whale watching.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    },
    {
        "id": 7,
        "name": "Arugam Bay",
        "location": "Eastern Province, Sri Lanka",
        "category": "Adventure",
        "description": "Experience surfing, beaches and coastal adventures.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"
    },
    {
        "id": 8,
        "name": "Horton Plains",
        "location": "Central Province, Sri Lanka",
        "category": "Nature",
        "description": "Explore beautiful grasslands, hiking trails and World's End.",
        "budget": "Medium",
        "image": "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800"
    }
]


@router.get("/")
async def get_destinations():
    return {
        "success": True,
        "total": len(destinations),
        "destinations": destinations
    }


@router.get("/{destination_id}")
async def get_destination(destination_id: int):
    for destination in destinations:
        if destination["id"] == destination_id:
            return {
                "success": True,
                "destination": destination
            }

    return {
        "success": False,
        "message": "Destination not found"
    }