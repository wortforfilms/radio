"""Order model contract."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Optional


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"
    REFUNDED = "REFUNDED"
    PARTIALLY_PAID = "PARTIALLY_PAID"


@dataclass
class Order:
    order_id: str
    amount: float
    status: OrderStatus = OrderStatus.PENDING
    expires_at: datetime = field(default_factory=lambda: datetime.now(UTC) + timedelta(minutes=30))
    amount_paid: float = 0.0
    transaction_utr: Optional[str] = None
    sender_vpa: Optional[str] = None
    sender_name: Optional[str] = None
    paid_at: Optional[datetime] = None

    def can_pay(self) -> bool:
        return self.status == OrderStatus.PENDING and self.expires_at > datetime.now(UTC)

    def mark_paid_candidate(self, utr: str, sender_vpa: Optional[str] = None) -> None:
        """Mark only after external proof lane verifies evidence."""

        self.transaction_utr = utr
        self.sender_vpa = sender_vpa
