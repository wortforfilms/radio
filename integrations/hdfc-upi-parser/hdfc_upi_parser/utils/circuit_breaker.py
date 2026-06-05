"""Minimal circuit breaker."""

class CircuitBreaker:
    def __init__(self, threshold: int = 3) -> None:
        self.threshold = threshold
        self.failures = 0

    @property
    def open(self) -> bool:
        return self.failures >= self.threshold

    def record_success(self) -> None:
        self.failures = 0

    def record_failure(self) -> None:
        self.failures += 1

