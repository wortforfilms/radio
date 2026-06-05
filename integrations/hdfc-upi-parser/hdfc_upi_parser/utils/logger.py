"""Logging helpers."""

import logging

payment_logger = logging.getLogger("hdfc_upi_parser")
if not payment_logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    payment_logger.addHandler(handler)
payment_logger.setLevel(logging.INFO)

