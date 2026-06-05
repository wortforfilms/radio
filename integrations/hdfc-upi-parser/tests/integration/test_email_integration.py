import unittest

from hdfc_upi_parser.services.sync_poller import SyncEmailPoller


class EmailIntegrationTests(unittest.TestCase):
    def test_live_polling_blocked_without_credentials(self) -> None:
        result = SyncEmailPoller().poll_once()
        self.assertEqual(result["status"], "blocked")


if __name__ == "__main__":
    unittest.main()

