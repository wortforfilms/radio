import unittest

from hdfc_upi_parser.core.email_parser import SAMPLE_HDFC_EMAIL, MultiBankEmailParser
from hdfc_upi_parser.services.proof_adapter import payment_candidate_to_proof_row


class ProofAdapterTests(unittest.TestCase):
    def test_candidate_row_cannot_satisfy_payment_proof(self) -> None:
        payment = MultiBankEmailParser().parse(SAMPLE_HDFC_EMAIL["subject"], SAMPLE_HDFC_EMAIL["body"])
        assert payment is not None

        row = payment_candidate_to_proof_row(payment)

        self.assertTrue(row["candidateOnly"])
        self.assertEqual(row["verificationStatus"], "candidate_only")
        self.assertIsNone(row["paymentReceiptId"])
        self.assertIsNone(row["signatureHeader"])
        self.assertFalse(row["webhookVerified"])
        self.assertFalse(row["AuditLog.created"])


if __name__ == "__main__":
    unittest.main()

