from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database.connection import Base


class Trip(Base):
    __tablename__ = "trips"

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

    budget = Column(
        String(100),
        nullable=False
    )

    travel_style = Column(
        String(500),
        nullable=False
    )

    travellers = Column(
        Integer,
        nullable=False
    )

    itinerary = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )