import unittest

from hdfc_upi_parser.api.websocket import websocket_status


class WebsocketTests(unittest.TestCase):
    def test_websocket_fails_closed(self) -> None:
        self.assertEqual(websocket_status()["status"], "blocked")


if __name__ == "__main__":
    unittest.main()

