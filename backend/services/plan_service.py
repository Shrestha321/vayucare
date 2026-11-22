"""Plan orchestration service managing caching, AI synthesis, and DB persistence."""

import datetime
import json
import logging
import uuid
from typing import List, Optional
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.cache import plan_cache
from backend.models.db_models import UserPlanModel
from backend.models.schemas import (
    AQISeverity,
    PlanSummaryResponse,
    UserProfileInput,
    VayuCarePlanResponse,
)
from backend.services.gemini_service import compute_aqi_severity, generate_plan_with_gemini

logger = logging.getLogger("vayucare.plans")


class PlanService:
    """Orchestrates plan generation, deterministic caching, and persistence."""

    @staticmethod
    async def generate_or_retrieve_plan(
        profile: UserProfileInput, session: AsyncSession
    ) -> VayuCarePlanResponse:
        """Check cache first, generate via Gemini/scientific engine on miss, and persist."""
        normalized_dict = profile.model_dump()
        cache_key = plan_cache.generate_hash(normalized_dict)

        # 1. Cache Check
        cached_plan = plan_cache.get(cache_key)
        if cached_plan:
            logger.info("Serving plan from in-memory cache for key %s", cache_key[:10])
            # Return fresh copy with is_cached=True
            return cached_plan.model_copy(update={"is_cached": True})

        # 2. Generate Plan
        severity = compute_aqi_severity(profile.aqi)
        raw_plan_data = await generate_plan_with_gemini(profile, severity)

        plan_id = str(uuid.uuid4())
        share_slug = uuid.uuid4().hex[:12]
        now_iso = datetime.datetime.utcnow().isoformat()

        response = VayuCarePlanResponse(
            id=plan_id,
            share_slug=share_slug,
            created_at=now_iso,
            is_cached=False,
            profile=profile,
            aqi_severity=severity,
            daily_routines=raw_plan_data["daily_routines"],
            iaq_hacks=raw_plan_data["iaq_hacks"],
            sustainable_alternatives=raw_plan_data["sustainable_alternatives"],
            overall_impact=raw_plan_data["overall_impact"],
        )

        # 3. Store in Cache
        plan_cache.set(cache_key, response)

        # 4. Persist in Database
        db_plan = UserPlanModel(
            id=plan_id,
            share_slug=share_slug,
            city=profile.city,
            neighborhood=profile.neighborhood,
            aqi=profile.aqi,
            housing_type=profile.housing_type.value,
            profile_json=profile.model_dump_json(),
            plan_json=response.model_dump_json(),
            is_favorite=False,
        )
        session.add(db_plan)
        await session.commit()
        logger.info("Persisted new plan %s with slug %s to database", plan_id, share_slug)

        return response

    @staticmethod
    async def get_plan_by_id(session: AsyncSession, plan_id: str) -> Optional[VayuCarePlanResponse]:
        """Fetch saved plan by primary UUID."""
        stmt = select(UserPlanModel).where(UserPlanModel.id == plan_id)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return None
        return VayuCarePlanResponse.model_validate_json(record.plan_json)

    @staticmethod
    async def get_plan_by_slug(session: AsyncSession, share_slug: str) -> Optional[VayuCarePlanResponse]:
        """Fetch saved plan by public share slug."""
        stmt = select(UserPlanModel).where(UserPlanModel.share_slug == share_slug)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return None
        return VayuCarePlanResponse.model_validate_json(record.plan_json)

    @staticmethod
    async def list_plans(
        session: AsyncSession, limit: int = 50, offset: int = 0
    ) -> List[PlanSummaryResponse]:
        """List saved plans with metadata summaries."""
        stmt = (
            select(UserPlanModel)
            .order_by(desc(UserPlanModel.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(stmt)
        records = result.scalars().all()

        summaries: List[PlanSummaryResponse] = []
        for r in records:
            profile_data = json.loads(r.profile_json)
            members = profile_data.get("household_members", [])
            severity = compute_aqi_severity(r.aqi)
            summaries.append(
                PlanSummaryResponse(
                    id=r.id,
                    share_slug=r.share_slug,
                    created_at=r.created_at.isoformat(),
                    city=r.city,
                    neighborhood=r.neighborhood,
                    aqi=r.aqi,
                    aqi_severity=severity,
                    household_size=len(members),
                    is_favorite=r.is_favorite,
                )
            )
        return summaries

    @staticmethod
    async def toggle_favorite(session: AsyncSession, plan_id: str, is_favorite: bool) -> bool:
        """Update favorite bookmark status for a plan."""
        stmt = select(UserPlanModel).where(UserPlanModel.id == plan_id)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return False
        record.is_favorite = is_favorite
        await session.commit()
        return True

    @staticmethod
    async def delete_plan(session: AsyncSession, plan_id: str) -> bool:
        """Delete saved plan from database."""
        stmt = select(UserPlanModel).where(UserPlanModel.id == plan_id)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return False
        await session.delete(record)
        await session.commit()
        return True
