"""VayuCare FastAPI application entrypoint."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import get_settings
from backend.core.security import SecurityHeadersMiddleware, generic_exception_handler
from backend.models.db_models import init_db
from backend.routes import community, health, plan, presets

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vayucare.main")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle events: database initialization and warmup."""
    logger.info("Initializing VayuCare database schema...")
    await init_db()
    logger.info("VayuCare database initialized successfully.")
    yield
    logger.info("VayuCare application shutdown.")


app = FastAPI(
    title="VayuCare API",
    description="GenAI-powered Smog & Indoor Air Quality (IAQ) Copilot for Families & Communities",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. CORS Configuration (Explicit origins, never wildcard with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Hardened Security Response Headers
app.add_middleware(SecurityHeadersMiddleware)

# 3. Sanitized Exception Handlers (Prevent stack trace leakage)
app.add_exception_handler(Exception, generic_exception_handler)

# 4. Include Routers
app.include_router(health.router)
app.include_router(presets.router)
app.include_router(plan.router)
app.include_router(community.router)


@app.get("/", tags=["Root"])
async def root_redirect() -> dict:
    """Root metadata response."""
    return {
        "app": "VayuCare API",
        "description": "AI-Powered Smog & IAQ Copilot for Families and Communities",
        "version": "1.0.0",
        "docs": "/docs",
    }
