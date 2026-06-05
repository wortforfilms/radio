import unittest
from datetime import UTC, datetime, timedelta

from hdfc_upi_parser.core.email_parser import BankType, PaymentDetails
from hdfc_upi_parser.core.payment_matcher import PaymentMatcher
from hdfc_upi_parser.models.order import Order


class PaymentMatcherTests(unittest.TestCase):
    def test_matcher_returns_candidate_not_paid(self) -> None:
        payment = PaymentDetails(
            amount=500.0,
            utr="HDFC26052714302512345",
            extracted_order_id="123456",
            bank=BankType.HDFC,
        )
        order = Order("ORD123456", 500.0, expires_at=datetime.now(UTC) + timedelta(minutes=5))

        result = PaymentMatcher().match(payment, [order])

        self.assertEqual(result.status, "candidate")
        self.assertEqual(result.order_id, "ORD123456")
        self.assertEqual(result.reason, "candidate match only")

    def test_ambiguous_matches_are_blocked(self) -> None:
        payment = PaymentDetails(amount=500.0, utr="HDFC26052714302512345", bank=BankType.HDFC)
        orders = [
            Order("ORD1", 500.0, expires_at=datetime.now(UTC) + timedelta(minutes=5)),
            Order("ORD2", 500.0, expires_at=datetime.now(UTC) + timedelta(minutes=5)),
        ]

        result = PaymentMatcher().match(payment, orders)

        self.assertEqual(result.status, "blocked")
        self.assertEqual(result.reason, "ambiguous candidate orders")


if __name__ == "__main__":
    unittest.main()
