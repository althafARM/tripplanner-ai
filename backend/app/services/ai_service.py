
import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# Initialise Groq client
client = Groq(api_key=api_key) if api_key else None


def generate_itinerary(
    destination: str,
    start_location: str,
    days: int,
    budget: str,
    travel_style: str,
    travellers: int
):
    if client is None:
        raise RuntimeError("Groq API key is not configured.")

    # Create AI prompt
    prompt = f"""
You are an expert travel planner specialising in Sri Lankan tourism.

Create a personalised {days}-day travel itinerary.

TRIP DETAILS:

Destination: {destination}
Starting location: {start_location}
Duration: {days} days
Total budget: {budget}
Travel style: {travel_style}
Number of travellers: {travellers}

IMPORTANT REQUIREMENTS:

1. Create exactly {days} days of travel activities.
2. Include morning, afternoon and evening activities.
3. Recommend suitable attractions and experiences.
4. Suggest local Sri Lankan food.
5. Follow the user's selected transportation method.
6. Do not calculate or display daily expenses or total trip costs.
   The separate Smart Budget Assistant calculates all trip costs.
7. Consider realistic travel times and distances.
8. Use simple English.
9. Do not invent or calculate fuel, food, accommodation,
   attraction or other expense totals.
10. Do not claim live prices, train schedules or hotel availability have been verified.
11. Avoid unnecessary travel between distant attractions on the same day.
12. Explain how travellers can reach each major attraction.
13. STRICT GEOGRAPHICAL ACCURACY:
    Recommend attractions located in the selected destination
    or its nearby surrounding areas.

14. Do not recommend attractions from distant cities or
    provinces as if they are nearby.

15. For a Kandy trip, prioritize Kandy attractions such as:
    - Temple of the Sacred Tooth Relic
    - Kandy Lake
    - Peradeniya Botanical Gardens
    - Udawattekele Sanctuary
    - Bahirawakanda Buddha Statue
    - Kandy Market

16. Do not recommend Mackwoods Tea Plantation as a
    nearby Kandy attraction. It is in the Nuwara Eliya area.

17. Only include distant attractions when the user
    explicitly requests a multi-destination trip.

18. Check geographical distances and realistic travel
    times before grouping attractions into the same day.

19. Organize each day's attractions geographically to
    minimize unnecessary travelling.

20. Keep the selected destination as the main focus
    throughout the itinerary.

21. The starting location and destination may be different.
    Include realistic travel between them, but do not treat
    the starting location as a sightseeing destination
    unless the user requests it.

TRANSPORTATION RULES:

Read the transport preference provided in the trip details.

A. OWN VEHICLE:
- Plan the journey using the traveller's own vehicle.
- Recommend suitable driving routes.
- Estimate fuel, parking and highway toll expenses where relevant.
- Consider driving distances and road conditions.

B. BOOK VEHICLE - TUK-TUK:
- Recommend suitable tuk-tuk journeys.
- Estimate tuk-tuk hire or fare costs.
- Consider passenger and luggage capacity.

C. BOOK VEHICLE - CAR:
- Recommend suitable car journeys.
- Estimate vehicle hire expenses.
- Consider passenger and luggage capacity.

D. BOOK VEHICLE - VAN:
- Recommend suitable van journeys.
- Consider group size and luggage.
- Estimate van hire expenses.

E. BOOK VEHICLE - BUS:
- Recommend suitable hired bus transportation.
- Consider passenger capacity.
- Estimate hire expenses.

F. TRAIN:
- Recommend suitable Sri Lankan railway routes.
- Mention departure and arrival stations where known.
- Explain how to travel from railway stations to attractions.
- Never invent exact train departure times or ticket availability.

G. BUS:
- Recommend suitable public bus transportation.
- Mention relevant bus routes or bus stations where known.
- Explain connections between destinations.
- Never invent exact departure times or ticket availability.

IMPORTANT:
- Do not recommend a different main transport method unless necessary.
- If another transport method is needed for a short journey, explain why.
- Clearly separate transport costs from other expenses.
- All prices must be labelled as estimates, not verified live prices.

MANDATORY OUTPUT FORMAT:

DAY 1 – [Day title]

MORNING
Describe morning activities.

AFTERNOON
Describe afternoon activities.

EVENING
Describe evening activities.

FOOD RECOMMENDATIONS
Recommend local food.

TRANSPORT PLAN

For each day, include:

1. Main transport method.
2. Starting point and destination.
3. Recommended route.
4. Estimated travel time.
5. Estimated transport cost in LKR.
6. Additional transport needed to reach attractions, if any.

If using a train or public bus:
- Mention the relevant railway station or bus station.
- Explain how to reach the attractions after arrival.
- Do not invent exact departure times.

If using a booked vehicle:
- Clearly mention the selected vehicle type.
- Estimate the hire cost.

If using an own vehicle:
- Estimate fuel, parking and toll costs where relevant.

TRAVEL TIPS

At the end of the itinerary:
- Provide useful travel tips.
- Mention important safety precautions.
- Suggest suitable items to pack.
- Do not calculate or display daily expenses.
- Do not calculate or display a total trip cost.
- Do not provide a remaining budget.
- Do not create a financial trip summary.

The Smart Budget Assistant separately calculates
all estimated travel expenses.

Never skip a day or generate more days than requested.
Never use Markdown tables.
"""

    # Send request to Groq
    import logging

    logger = logging.getLogger(__name__)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional AI travel planner. "
                        "Generate organised, realistic and personalised "
                        "travel itineraries."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            max_completion_tokens=2500
        )

    except Exception:
        logger.exception("GROQ ITINERARY GENERATION FAILED")
        raise

    # Extract AI response
    itinerary = response.choices[0].message.content

    if not itinerary:
        raise RuntimeError("The AI returned an empty itinerary.")

    return itinerary

def generate_chat_response(message: str, history=None):
    if client is None:
        raise RuntimeError("Groq API key is not configured.")

    messages = [
        {
            "role": "system",
            "content": """
            You are TripPlanner AI, a friendly and intelligent
            travel assistant.

            Your responsibilities:
            1. Answer travel-related questions.
            2. Recommend tourist attractions.
            3. Suggest hotels and restaurants.
            4. Explain transportation options.
            5. Provide travel tips and safety advice.
            6. Help users plan travel budgets.
            7. Give information about Sri Lankan destinations.

            IMPORTANT:
            - Remember the previous conversation.
            - Understand follow-up questions.
            - Use previous messages when answering.
            - Maintain the conversation context.
            - Use simple, friendly English.
            - Format answers using Markdown.
            - Never invent live prices or availability.
            """
        }
    ]

    # Add previous conversation messages
    if history:
        for item in history[-10:]:
            if item.role in ["user", "assistant"]:
                messages.append({
                    "role": item.role,
                    "content": item.content
                })

    # Add the latest user question
    messages.append({
        "role": "user",
        "content": message
    })

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.5,
        max_completion_tokens=1500
    )

    answer = response.choices[0].message.content

    if not answer:
        raise RuntimeError("The AI returned an empty response.")

    return answer

def extract_trip_locations(itinerary: str):
    if client is None:
        raise RuntimeError("Groq API key is not configured.")

    prompt = f"""
You are a Sri Lankan tourism location extraction assistant.

Read the travel itinerary below and identify all real sightseeing
attractions and tourist places that travellers are instructed to visit.

ITINERARY:
{itinerary}

RULES:
1. Extract only real sightseeing attractions and tourist places.
2. Include beaches, lakes, forts, museums, temples and viewpoints.
3. Include places mentioned in morning, afternoon and evening activities.
4. Do not include restaurants, hotels, shops or food items.
5. Do not include starting locations mentioned only for transportation.
6. Do not invent locations.
7. Remove duplicate locations.
8. Keep locations in the order they appear in the itinerary.
9. Group locations by travel day.
10. Use accurate, recognisable place names.

Return ONLY valid JSON in this format:

{{
    "days": [
        {{
            "day": 1,
            "locations": [
                "Galle Fort",
                "Dutch Reformed Church",
                "Maritime Museum"
            ]
        }}
    ]
}}
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You extract real tourist attractions from travel "
                    "itineraries. Return valid JSON only."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
        max_completion_tokens=1500
    )

    result = response.choices[0].message.content

    if not result:
        raise RuntimeError("AI could not extract travel locations.")

    try:
        locations = json.loads(result)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            "AI returned invalid location JSON."
        ) from error

    return locations