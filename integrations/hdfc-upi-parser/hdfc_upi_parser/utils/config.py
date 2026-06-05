"""Environment-backed configuration with NULL-safe defaults."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional


def env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name, default)
    if value in ("", "NULL", "null", "None"):
        return None
    return value


@dataclass(frozen=True)
class Config:
    env: str = env("ENV", "draft") or "draft"
    database_url: str = env("DATABASE_URL", "sqlite:///hdfc_upi_parser.db") or "sqlite:///hdfc_upi_parser.db"
    redis_url: Optional[str] = env("REDIS_URL")
    poll_interval_seconds: int = int(env("POLL_INTERVAL_SECONDS", "30") or "30")
    order_expiry_minutes: int = int(env("ORDER_EXPIRY_MINUTES", "30") or "30")
    amount_tolerance: float = float(env("AMOUNT_TOLERANCE", "0.01") or "0.01")
    webhook_secret: Optional[str] = env("WEBHOOK_SECRET")
    production_ready: bool = False

    def validate_for_live_polling(self) -> None:
        required = ["EMAIL_PRIMARY_USER", "EMAIL_PRIMARY_PASSWORD", "WEBHOOK_SECRET"]
        missing = [name for name in required if not env(name)]
        if missing:
            raise ValueError(f"live polling blocked; missing {', '.join(missing)}")


config = Config()

