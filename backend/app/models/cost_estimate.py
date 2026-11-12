from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON
)

from sqlalchemy.sql import func

from app.database.connection import Base


class CostEstimate(Base):
    __tablename__ = "cost_estimates"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Trip information
    destination = Column(
        String(100),
        nullable=False
    )

    start_location = Column(
        String(100),
        nullable=False
    )

    days = Column(
        Integer,
        nullable=False
    )

    travellers = Column(
        Integer,
        nullable=False
    )

    # Travel preferences
    budget = Column(
        Float,
        nullable=False
    )

    has_own_vehicle = Column(
        Boolean,
        default=False,
        nullable=False
    )

    vehicle_type = Column(
        String(50),
        nullable=True
    )

    transport_mode = Column(
        String(50),
        nullable=True
    )

    accommodation_type = Column(
        String(50),
        nullable=False
    )

    food_type = Column(
        String(50),
        nullable=False
    )

    # Cost information
    total_cost = Column(
        Float,
        nullable=False
    )

    cost_per_traveller = Column(
        Float,
        nullable=False
    )

    remaining_budget = Column(
        Float,
        nullable=False
    )

    within_budget = Column(
        Boolean,
        nullable=False
    )

    cost_breakdown = Column(
        JSON,
        nullable=False
    )

    route_details = Column(
        JSON,
        nullable=False
    )

    # Creation date
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )