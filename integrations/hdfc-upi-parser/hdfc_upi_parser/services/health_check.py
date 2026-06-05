"""Health checks."""

from hdfc_upi_parser.utils.metrics import payment_metrics


def health_check() -> dict:
    return {
        "status": "draft",
        "production_ready": False,
        "metrics": payment_metrics(),
    }

