"""Order service for local candidate matching."""

from __future__ import annotations

from typing import Dict, Iterable, Optional

from hdfc_upi_parser.models.order import Order


class OrderService:
    def __init__(self, orders: Optional[Iterable[Order]] = None) -> None:
        self._orders: Dict[str, Order] = {order.order_id: order for order in orders or []}

    def create_order(self, order_id: str, amount: float) -> Order:
        if order_id in self._orders:
            raise ValueError(f"order already exists: {order_id}")
        if amount <= 0:
            raise ValueError("amount must be positive")
        order = Order(order_id=order_id, amount=amount)
        self._orders[order_id] = order
        return order

    def get_order(self, order_id: str) -> Optional[Order]:
        return self._orders.get(order_id)

    def pending_orders(self) -> list[Order]:
        return [order for order in self._orders.values() if order.can_pay()]

