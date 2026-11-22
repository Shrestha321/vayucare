"""API routes for personalized smog plan generation, caching, and management."""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import get_client_ip, rate_limiter
from backend.models.db_models import get_db_session
from backend.models.schemas import (
    PlanFavoriteUpdate,
    PlanSummaryResponse,
    UserProfileInput,
    VayuCarePlanResponse,
)
from backend.services.plan_service import PlanService

logger = logging.getLogger("vayucare.routes.plan")
router = APIRouter(prefix="/api/plans", tags=["Smog Action Plans"])


@router.post("/generate", response_model=VayuCarePlanResponse, status_code=status.HTTP_201_CREATED)
async def generate_action_plan(
    profile: UserProfileInput,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> VayuCarePlanResponse:
    """Generate a personalized winter smog action plan with empirical impact modeling.
    
    Checks in-memory TTL cache for identical payloads to avoid redundant LLM invocations.
    Rate limited per client IP to safeguard resources.
    """
    client_ip = get_client_ip(request)
    allowed, remaining = rate_limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning("Rate limit exceeded for client IP %s", client_ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached for smog plan generation. Please wait 60 seconds before generating a new plan.",
        )

    try:
        response = await PlanService.generate_or_retrieve_plan(profile, db)
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to generate plan: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to synthesize plan at this moment. Please verify your inputs and retry.",
        )


@router.get("", response_model=List[PlanSummaryResponse])
async def list_saved_plans(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> List[PlanSummaryResponse]:
    """Retrieve saved plans metadata for listing and comparison."""
    return await PlanService.list_plans(db, limit=limit, offset=offset)


@router.get("/{plan_id}", response_model=VayuCarePlanResponse)
async def get_plan_by_id(
    plan_id: str, db: AsyncSession = Depends(get_db_session)
) -> VayuCarePlanResponse:
    """Retrieve a complete saved plan by its UUID."""
    plan = await PlanService.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan with id '{plan_id}' was not found.",
        )
    return plan


@router.get("/share/{slug}", response_model=VayuCarePlanResponse)
async def get_plan_by_share_slug(
    slug: str, db: AsyncSession = Depends(get_db_session)
) -> VayuCarePlanResponse:
    """Retrieve a shared plan via its public sharing token."""
    plan = await PlanService.get_plan_by_slug(db, slug)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared plan link is invalid or has expired.",
        )
    return plan


@router.patch("/{plan_id}/favorite", status_code=status.HTTP_200_OK)
async def toggle_plan_favorite(
    plan_id: str,
    update: PlanFavoriteUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Bookmark or unbookmark a plan as favorite."""
    success = await PlanService.toggle_favorite(db, plan_id, update.is_favorite)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan with id '{plan_id}' not found.",
        )
    return {"id": plan_id, "is_favorite": update.is_favorite}


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan_by_id(
    plan_id: str, db: AsyncSession = Depends(get_db_session)
) -> None:
    """Delete a saved plan."""
    success = await PlanService.delete_plan(db, plan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan with id '{plan_id}' not found.",
        )
