"""Validation helpers used by parsers and proof importers."""

from __future__ import annotations

import re
from typing import Any, Dict, List


def validate_utr(utr: str | None) -> bool:
    return bool(utr and re.fullmatch(r"[A-Z0-9]{10,64}", utr.upper()))


def validate_vpa(vpa: str | None) -> bool:
    return bool(vpa and re.fullmatch(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+", vpa))


def validate_amount(amount: Any) -> bool:
    try:
        return float(amount) > 0
    except (TypeError, ValueError):
        return False


def validate_order_data(data: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    if not data.get("order_id"):
        errors.append("order_id is required")
    if not validate_amount(data.get("amount")):
        errors.append("amount must be greater than zero")
    return errors

