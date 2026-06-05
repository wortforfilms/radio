"""Email account contract."""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class EmailAccount:
    name: str
    bank: str
    username: Optional[str]
    host: str = "imap.gmail.com"
    port: int = 993
    verification_status: str = "blocked_credentials_null"

