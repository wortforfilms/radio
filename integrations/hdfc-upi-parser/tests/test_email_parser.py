import unittest

from hdfc_upi_parser.core.email_parser import BankType, MultiBankEmailParser, SAMPLE_HDFC_EMAIL


class EmailParserTests(unittest.TestCase):
    def test_hdfc_sample_parses_candidate_payment(self) -> None:
        parser = MultiBankEmailParser()
        payment = parser.parse(SAMPLE_HDFC_EMAIL["subject"], SAMPLE_HDFC_EMAIL["body"])

        self.assertIsNotNone(payment)
        assert payment is not None
        self.assertEqual(payment.bank, BankType.HDFC)
        self.assertEqual(payment.amount, 500.0)
        self.assertEqual(payment.utr, "HDFC26052714302512345")
        self.assertEqual(payment.vpa, "customer@okhdfcbank")
        self.assertEqual(payment.extracted_order_id, "ORD123456")
        self.assertEqual(payment.to_dict()["verification_status"], "candidate_only")

    def test_non_credit_email_fails_closed(self) -> None:
        parser = MultiBankEmailParser()
        self.assertIsNone(parser.parse("Newsletter", "No payment alert in this email."))


if __name__ == "__main__":
    unittest.main()
