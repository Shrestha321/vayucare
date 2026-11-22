"""SQLAlchemy async ORM models and database session management."""

import datetime
import json
import uuid
from typing import AsyncGenerator
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from backend.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base declarative class for all ORM models."""
    pass


class UserPlanModel(Base):
    """Persisted user personalized smog action plan."""
    __tablename__ = "user_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    share_slug: Mapped[str] = mapped_column(String(32), unique=True, index=True, default=lambda: uuid.uuid4().hex[:12])
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    city: Mapped[str] = mapped_column(String(100), index=True)
    neighborhood: Mapped[str] = mapped_column(String(120))
    aqi: Mapped[int] = mapped_column(Integer)
    housing_type: Mapped[str] = mapped_column(String(50))
    profile_json: Mapped[str] = mapped_column(Text)
    plan_json: Mapped[str] = mapped_column(Text)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)


class CommunityPledgeModel(Base):
    """Community smog action pledges and emission cut pledges."""
    __tablename__ = "community_pledges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    author_name: Mapped[str] = mapped_column(String(60))
    neighborhood: Mapped[str] = mapped_column(String(100))
    city: Mapped[str] = mapped_column(String(80), index=True)
    action_type: Mapped[str] = mapped_column(String(50), index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    target_reduction_summary: Mapped[str] = mapped_column(String(150))
    pledge_count: Mapped[int] = mapped_column(Integer, default=1)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)


async def init_db() -> None:
    """Initialize database tables and seed sample community pledges if empty."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed community pledges if table is empty
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        count_stmt = select(func.count(CommunityPledgeModel.id))
        result = await session.execute(count_stmt)
        count = result.scalar_one_or_none() or 0
        if count == 0:
            seed_pledges = [
                CommunityPledgeModel(
                    id=str(uuid.uuid4()),
                    author_name="Rohit & RWA Defence Colony",
                    neighborhood="Defence Colony",
                    city="New Delhi",
                    action_type="stop_waste_burning",
                    title="Zero Biomass & Leaf Burning Night Patrol",
                    description="Our resident group equipped night watchmen with electric heaters so dry leaves and municipal trash are never burned for warmth. Night patrols monitor sector perimeter.",
                    target_reduction_summary="Eliminating ~400 kg toxic smoke/night in colony radius",
                    pledge_count=84,
                    upvotes=152,
                ),
                CommunityPledgeModel(
                    id=str(uuid.uuid4()),
                    author_name="Amina Khan & Gulberg Commuters",
                    neighborhood="Gulberg III",
                    city="Lahore",
                    action_type="commute_carpool",
                    title="Carpool Pods for 12 School Children",
                    description="Consolidated 6 separate SUV drop-offs into 2 CNG carpool shuttles for Gulberg-Mall Road morning school runs during peak smog hours (07:30 - 08:30).",
                    target_reduction_summary="Saved 340 vehicle-km/day, reducing localized tailpipe PM2.5",
                    pledge_count=28,
                    upvotes=97,
                ),
                CommunityPledgeModel(
                    id=str(uuid.uuid4()),
                    author_name="Pooja Sharma",
                    neighborhood="Indirapuram",
                    city="Ghaziabad",
                    action_type="iaq_senior_aid",
                    title="DIY Corsi-Rosenthal Purifiers for Senior Citizens",
                    description="Assembled 15 Corsi-Rosenthal boxes (MERV 13 + box fans) for ground-floor elderly neighbors with chronic bronchitis who cannot afford commercial HEPA filters.",
                    target_reduction_summary="Reduced elderly bedroom PM2.5 from 380 to 45 µg/m³",
                    pledge_count=42,
                    upvotes=119,
                ),
                CommunityPledgeModel(
                    id=str(uuid.uuid4()),
                    author_name="Kolkata Clean Air Collective",
                    neighborhood="Ballygunge",
                    city="Kolkata",
                    action_type="anti_idling_campaign",
                    title="No-Idle Zones Outside 5 Major School Gates",
                    description="Partnered with school administrations and local traffic police to strictly enforce 0-minute engine idling for school buses and parent vehicles during drop-off/pickup.",
                    target_reduction_summary="Curtailed 65% of localized peak NO2 & black carbon around gates",
                    pledge_count=61,
                    upvotes=88,
                ),
            ]
            session.add_all(seed_pledges)
            await session.commit()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency provider for async SQLAlchemy database session with automatic lifecycle cleanup."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
