"""API routes for community smog action pledges and neighborhood initiatives."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.db_models import get_db_session
from backend.models.schemas import (
    CommunityPledgeCreate,
    CommunityPledgeResponse,
    PledgeActionType,
)
from backend.services.community_service import CommunityService

logger = logging.getLogger("vayucare.routes.community")
router = APIRouter(prefix="/api/community", tags=["Community Smog Action Board"])


@router.get("/pledges", response_model=List[CommunityPledgeResponse])
async def list_community_pledges(
    city: Optional[str] = Query(default=None, max_length=80),
    action_type: Optional[PledgeActionType] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> List[CommunityPledgeResponse]:
    """Retrieve community-level smog mitigation pledges and collective actions."""
    action_type_val = action_type.value if action_type else None
    return await CommunityService.list_pledges(
        db, city=city, action_type=action_type_val, limit=limit, offset=offset
    )


@router.post("/pledges", response_model=CommunityPledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_community_pledge(
    pledge_in: CommunityPledgeCreate,
    db: AsyncSession = Depends(get_db_session),
) -> CommunityPledgeResponse:
    """Publish a new community pledge or local emission reduction initiative."""
    return await CommunityService.create_pledge(db, pledge_in)


@router.post("/pledges/{pledge_id}/upvote", response_model=CommunityPledgeResponse)
async def upvote_community_pledge(
    pledge_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> CommunityPledgeResponse:
    """Upvote an existing community pledge."""
    updated = await CommunityService.upvote_pledge(db, pledge_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community pledge '{pledge_id}' not found.",
        )
    return updated
