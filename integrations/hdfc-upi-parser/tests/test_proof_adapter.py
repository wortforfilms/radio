import json
import subprocess
import sys
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

    def test_cli_exports_candidate_only_rows(self) -> None:
        result = subprocess.run(
            [sys.executable, "-m", "hdfc_upi_parser.cli.main", "proof-candidates"],
            check=True,
            capture_output=True,
            text=True,
        )

        output = json.loads(result.stdout)

        self.assertEqual(output["counts"]["candidateRows"], 1)
        self.assertEqual(output["counts"]["verifiedReceipts"], 0)
        self.assertEqual(output["counts"]["verifiedWebhooks"], 0)
        self.assertEqual(output["counts"]["fulfilledGifts"], 0)
        self.assertFalse(output["phkd"]["productionReady"])
        self.assertFalse(output["phkd"]["releaseAllowed"])
        self.assertTrue(output["records"][0]["candidateOnly"])
        self.assertEqual(output["records"][0]["kind"], "hdfc-email-candidate")


if __name__ == "__main__":
    unittest.main()
