"""Security middleware, headers, and rate-limiting controls."""

import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("vayucare.security")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Applies hardened HTTP security headers to all outgoing responses."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter per client identifier."""

    def __init__(self, limit: int = 60, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """Check if client request is within rate limit.
        
        Returns:
            Tuple of (is_allowed, remaining_requests).
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Evict old requests
        valid_timestamps = [ts for ts in self._requests[client_id] if ts > window_start]
        self._requests[client_id] = valid_timestamps

        if len(valid_timestamps) >= self.limit:
            return False, 0

        self._requests[client_id].append(now)
        remaining = self.limit - len(self._requests[client_id])
        return True, remaining


rate_limiter = InMemoryRateLimiter()


def get_client_ip(request: Request) -> str:
    """Extract reliable client IP from headers or connection client."""
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch unhandled server exceptions and return sanitized JSON without leaking stack traces."""
    logger.error("Unhandled server error processing %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing your request. Please try again shortly.",
            "status_code": 500,
        },
    )
