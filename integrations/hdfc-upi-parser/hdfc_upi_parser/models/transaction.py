"""Transaction contracts."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class ProcessedTransaction:
    utr: str
    amount: float
    order_id: Optional[str]
    bank: str
    processed_at: datetime
    verification_status: str = "candidate_only"


@dataclass(frozen=True)
class FailedTransaction:
    reason: str
    raw_data: str
    utr: Optional[str] = None
    amount: Optional[float] = None
    bank: Optional[str] = None

