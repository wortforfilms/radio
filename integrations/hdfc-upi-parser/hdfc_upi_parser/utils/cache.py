"""Tiny in-memory cache for local development."""

from __future__ import annotations

import time
from typing import Any, Dict, Tuple


class Cache:
    def __init__(self) -> None:
        self._items: Dict[str, Tuple[float, Any]] = {}

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        self._items[key] = (time.time() + ttl, value)

    def get(self, key: str) -> Any:
        expires_at, value = self._items.get(key, (0, None))
        if expires_at < time.time():
            self._items.pop(key, None)
            return None
        return value


cache = Cache()

