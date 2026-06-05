"""Fail-closed HDFC/UPI parser scaffold."""

from hdfc_upi_parser.core.email_parser import (
    BankType,
    MultiBankEmailParser,
    PaymentDetails,
    parse_payment_email,
)
from hdfc_upi_parser.core.payment_matcher import MatchResult, PaymentMatcher

__all__ = [
    "BankType",
    "MatchResult",
    "MultiBankEmailParser",
    "PaymentDetails",
    "PaymentMatcher",
    "parse_payment_email",
]

__version__ = "0.1.0"

