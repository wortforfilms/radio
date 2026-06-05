import unittest

from hdfc_upi_parser.core.email_parser import SAMPLE_HDFC_EMAIL, MultiBankEmailParser
from hdfc_upi_parser.core.payment_matcher import PaymentMatcher
from hdfc_upi_parser.services.order_service import OrderService


class EndToEndTests(unittest.TestCase):
    def test_email_to_candidate_match(self) -> None:
        service = OrderService()
        order = service.create_order("ORD123456", 500.0)
        payment = MultiBankEmailParser().parse(SAMPLE_HDFC_EMAIL["subject"], SAMPLE_HDFC_EMAIL["body"])
        assert payment is not None

        result = PaymentMatcher().match(payment, [order])

        self.assertEqual(result.status, "candidate")


if __name__ == "__main__":
    unittest.main()

