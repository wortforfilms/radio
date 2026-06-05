"""Webhook signature helpers."""

from __future__ import annotations

import hmac
from hashlib import sha256


def hmac_sha256(secret: str, payload: bytes) -> str:
    return hmac.new(secret.encode("utf-8"), payload, sha256).hexdigest()


def verify_hmac_sha256(secret: str | None, payload: bytes, signature: str | None) -> bool:
    if not secret or not signature:
        return False
    return hmac.compare_digest(hmac_sha256(secret, payload), signature)

