"""Metrics placeholders with fail-closed payment counters."""

def payment_metrics() -> dict:
    return {
        "parsed_candidates": 0,
        "verified_receipts": 0,
        "verified_webhooks": 0,
        "fulfilled_gifts": 0,
        "production_ready": False,
    }

