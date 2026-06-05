import unittest

from hdfc_upi_parser.services.health_check import health_check


class ApiContractTests(unittest.TestCase):
    def test_health_check_is_not_production_ready(self) -> None:
        result = health_check()
        self.assertEqual(result["status"], "draft")
        self.assertFalse(result["production_ready"])


if __name__ == "__main__":
    unittest.main()

