
import os

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
4. Suggest local food.
5. Include transportation suggestions.
6. Provide estimated daily expenses in LKR.
7. Consider travel time between attractions.
8. Use simple English.
9. Clearly identify estimated costs.
10. Do not claim live prices or hotel availability have been verified.

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

TRANSPORT
Explain transportation options.

ESTIMATED DAILY COST
Give an estimated cost in LKR.

Repeat this structure for every day.

Finish with a TRIP SUMMARY.
Include total estimated trip cost and useful travel tips.

Never skip a day or generate more days than requested.
Never use Markdown tables.
"""

    # Send request to Groq
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
