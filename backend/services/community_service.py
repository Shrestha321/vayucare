"""Community smog action board service."""

import logging
import uuid
from typing import List, Optional
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.db_models import CommunityPledgeModel
from backend.models.schemas import CommunityPledgeCreate, CommunityPledgeResponse

logger = logging.getLogger("vayucare.community")


class CommunityService:
    """Service handling community pledges and peer recommendations."""

    @staticmethod
    async def list_pledges(
        session: AsyncSession,
        city: Optional[str] = None,
        action_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CommunityPledgeResponse]:
        """Fetch community pledges with optional city and action type filters."""
        query = select(CommunityPledgeModel)
        if city:
            query = query.where(CommunityPledgeModel.city.ilike(f"%{city}%"))
        if action_type:
            query = query.where(CommunityPledgeModel.action_type == action_type)

        query = query.order_by(desc(CommunityPledgeModel.upvotes), desc(CommunityPledgeModel.created_at)).limit(limit).offset(offset)
        result = await session.execute(query)
        records = result.scalars().all()

        return [
            CommunityPledgeResponse(
                id=r.id,
                author_name=r.author_name,
                neighborhood=r.neighborhood,
                city=r.city,
                action_type=r.action_type,  # type: ignore
                title=r.title,
                description=r.description,
                target_reduction_summary=r.target_reduction_summary,
                pledge_count=r.pledge_count,
                upvotes=r.upvotes,
                created_at=r.created_at.isoformat(),
            )
            for r in records
        ]

    @staticmethod
    async def create_pledge(
        session: AsyncSession, data: CommunityPledgeCreate
    ) -> CommunityPledgeResponse:
        """Create and persist a new community pledge."""
        pledge_id = str(uuid.uuid4())
        record = CommunityPledgeModel(
            id=pledge_id,
            author_name=data.author_name,
            neighborhood=data.neighborhood,
            city=data.city,
            action_type=data.action_type.value,
            title=data.title,
            description=data.description,
            target_reduction_summary=data.target_reduction_summary,
            pledge_count=1,
            upvotes=1,
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)

        return CommunityPledgeResponse(
            id=record.id,
            author_name=record.author_name,
            neighborhood=record.neighborhood,
            city=record.city,
            action_type=record.action_type,  # type: ignore
            title=record.title,
            description=record.description,
            target_reduction_summary=record.target_reduction_summary,
            pledge_count=record.pledge_count,
            upvotes=record.upvotes,
            created_at=record.created_at.isoformat(),
        )

    @staticmethod
    async def upvote_pledge(session: AsyncSession, pledge_id: str) -> Optional[CommunityPledgeResponse]:
        """Increment upvote count for a community pledge."""
        stmt = select(CommunityPledgeModel).where(CommunityPledgeModel.id == pledge_id)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return None

        record.upvotes += 1
        await session.commit()
        await session.refresh(record)

        return CommunityPledgeResponse(
            id=record.id,
            author_name=record.author_name,
            neighborhood=record.neighborhood,
            city=record.city,
            action_type=record.action_type,  # type: ignore
            title=record.title,
            description=record.description,
            target_reduction_summary=record.target_reduction_summary,
            pledge_count=record.pledge_count,
            upvotes=record.upvotes,
            created_at=record.created_at.isoformat(),
        )
