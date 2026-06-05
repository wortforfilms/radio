import unittest

from hdfc_upi_parser.services.order_service import OrderService


class OrderServiceTests(unittest.TestCase):
    def test_duplicate_order_fails(self) -> None:
        service = OrderService()
        service.create_order("ORD1", 10.0)
        with self.assertRaises(ValueError):
            service.create_order("ORD1", 10.0)


if __name__ == "__main__":
    unittest.main()

