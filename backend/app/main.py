from app.api.destinations import router as destinations_router
from fastapi import FastAPI

from app.api.admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.trips import router as trips_router
from app.api.chat import router as chat_router
from app.api.monitoring import router as monitoring_router
from app.api.users import router as users_router
from app.database.connection import Base, engine
from app.models import User, Trip, CostEstimate

from app.api.maps import router as maps_router
from app.api.costs import router as costs_router
from app.api.cost_estimates import router as cost_estimates_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
title="TripPlanner AI API",
description="AI-powered personalised travel planning platform",
version="1.0.0"
)

# Allow frontend communication

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://tripplanner-ai-arm.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destinations_router)
app.include_router(trips_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(monitoring_router)
app.include_router(users_router)
app.include_router(maps_router)
app.include_router(costs_router)
app.include_router(cost_estimates_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to TripPlanner AI",
        "status": "Running",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "application": "TripPlanner AI"
    }

@app.get("/api/info")
async def application_info():
    return {
        "name": "TripPlanner AI",
        "description": "Your Journey, Intelligently Planned",
        "features": [
        "AI Travel Planning",
        "Destination Discovery",
        "Smart Budget Planning",
        "Personalised Itineraries",
        "RAG Travel Assistant",
        "Real-time Travel Information"
        ]
    }
