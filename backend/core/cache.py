"""In-memory TTL cache keyed by deterministic payload hash."""

import hashlib
import json
import time
from typing import Any, Dict, Optional, Tuple


class TTLPlanCache:
    """Thread-safe TTL in-memory cache for generated AI plans."""

    def __init__(self, ttl_seconds: int = 3600) -> None:
        self.ttl_seconds = ttl_seconds
        self._store: Dict[str, Tuple[float, Any]] = {}
        self._hits = 0
        self._misses = 0

    @staticmethod
    def generate_hash(payload: Dict[str, Any]) -> str:
        """Create a deterministic SHA-256 hash from normalized dictionary payload."""
        normalized_str = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(normalized_str.encode("utf-8")).hexdigest()

    def get(self, cache_key: str) -> Optional[Any]:
        """Retrieve unexpired cached item by key."""
        entry = self._store.get(cache_key)
        if not entry:
            self._misses += 1
            return None

        created_at, value = entry
        if time.time() - created_at > self.ttl_seconds:
            # Expired
            del self._store[cache_key]
            self._misses += 1
            return None

        self._hits += 1
        return value

    def set(self, cache_key: str, value: Any) -> None:
        """Store item in cache with current timestamp."""
        self._store[cache_key] = (time.time(), value)

    def stats(self) -> Dict[str, Any]:
        """Return cache health and usage statistics."""
        now = time.time()
        active_keys = sum(1 for created_at, _ in self._store.values() if now - created_at <= self.ttl_seconds)
        return {
            "active_entries": active_keys,
            "total_entries": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "ttl_seconds": self.ttl_seconds,
        }

    def clear(self) -> None:
        """Clear all cached entries."""
        self._store.clear()


plan_cache = TTLPlanCache()
