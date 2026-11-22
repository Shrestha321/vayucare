"""Health, readiness, and cache diagnostic endpoints."""

import time
from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.cache import plan_cache
from backend.core.config import get_settings
from backend.models.db_models import get_db_session

router = APIRouter(tags=["Health & Diagnostics"])
settings = get_settings()
_START_TIME = time.time()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, Any]:
    """Basic service liveness check and runtime stats."""
    return {
        "status": "healthy",
        "service": "VayuCare API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": int(time.time() - _START_TIME),
        "cache": plan_cache.stats(),
    }


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db_session)) -> Dict[str, Any]:
    """Readiness probe checking database connectivity and responsiveness."""
    try:
        result = await db.execute(text("SELECT 1"))
        alive = result.scalar() == 1
        return {
            "status": "ready" if alive else "degraded",
            "database": "connected" if alive else "disconnected",
        }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "database": "error",
            "detail": "Database ping failed",
        }
