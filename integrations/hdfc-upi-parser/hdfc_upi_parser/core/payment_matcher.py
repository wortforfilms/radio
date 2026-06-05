"""Candidate payment matching.

The matcher never marks orders paid by itself. It only returns a candidate result
for a higher proof gate to verify.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Iterable, Optional, Protocol

from hdfc_upi_parser.core.email_parser import PaymentDetails


class OrderLike(Protocol):
    order_id: str
    amount: float
    status: str
    expires_at: datetime


@dataclass(frozen=True)
class MatchResult:
    status: str
    order_id: Optional[str]
    score: float
    reason: str
    utr: Optional[str] = None


class PaymentMatcher:
    """Deterministic payment matcher with fail-closed thresholds."""

    def __init__(self, amount_tolerance: float = 0.01, match_window_minutes: int = 15) -> None:
        self.amount_tolerance = amount_tolerance
        self.match_window = timedelta(minutes=match_window_minutes)

    def match(self, payment: PaymentDetails, orders: Iterable[OrderLike]) -> MatchResult:
        if not payment.is_valid():
            return MatchResult("blocked", None, 0.0, "payment candidate missing amount or UTR", payment.utr)

        candidates = []
        for order in orders:
            raw_status = getattr(order, "status", "")
            status = getattr(raw_status, "value", raw_status)
            if str(status).upper() != "PENDING":
                continue
            if getattr(order, "expires_at", datetime.min.replace(tzinfo=UTC)) < datetime.now(UTC):
                continue
            amount_delta = abs(float(getattr(order, "amount", 0)) - payment.amount)
            if amount_delta > self.amount_tolerance:
                continue
            score = 0.7
            if payment.extracted_order_id and payment.extracted_order_id in getattr(order, "order_id", ""):
                score = 0.95
            candidates.append((score, order))

        if not candidates:
            return MatchResult("blocked", None, 0.0, "no pending order matched amount/order id", payment.utr)

        candidates.sort(key=lambda item: item[0], reverse=True)
        best_score, best_order = candidates[0]
        if len(candidates) > 1 and candidates[1][0] == best_score:
            return MatchResult("blocked", None, best_score, "ambiguous candidate orders", payment.utr)
        return MatchResult("candidate", best_order.order_id, best_score, "candidate match only", payment.utr)
