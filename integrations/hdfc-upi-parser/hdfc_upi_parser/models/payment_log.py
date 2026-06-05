"""Payment audit log contract."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class PaymentLog:
    action: str
    status: str
    created_at: datetime
    utr: Optional[str] = None
    order_id: Optional[str] = None
    evidence_uri: Optional[str] = None

