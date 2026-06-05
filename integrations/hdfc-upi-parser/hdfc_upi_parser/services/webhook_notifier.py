"""Webhook notification helper."""

from __future__ import annotations

from hdfc_upi_parser.utils.crypto import hmac_sha256


def build_signature(secret: str | None, payload: bytes) -> str | None:
    if not secret:
        return None
    return hmac_sha256(secret, payload)

