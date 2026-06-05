"""Webhook delivery contract."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class WebhookDelivery:
    event_id: str
    endpoint: str
    status: str
    delivered_at: Optional[datetime] = None
    signature_verified: bool = False

