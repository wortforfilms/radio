"""Multi-bank UPI email parser.

Parsing returns candidate payment details only. It is not settlement proof.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Iterable, List, Optional, Tuple


class BankType(Enum):
    """Supported bank families."""

    HDFC = "hdfc"
    SBI = "sbi"
    ICICI = "icici"
    AXIS = "axis"
    KOTAK = "kotak"
    YES = "yes"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class PaymentDetails:
    """Candidate payment details parsed from an email body."""

    amount: float
    utr: str
    vpa: Optional[str] = None
    sender_name: Optional[str] = None
    transaction_date: Optional[datetime] = None
    remark: Optional[str] = None
    account_number: Optional[str] = None
    extracted_order_id: Optional[str] = None
    bank: BankType = BankType.UNKNOWN
    confidence_score: float = 0.0
    raw_data: Dict[str, Any] = field(default_factory=dict)

    def is_valid(self) -> bool:
        """Return true only when amount and UTR are parseable."""

        return self.amount > 0 and bool(self.utr) and len(self.utr) >= 10

    def to_dict(self) -> Dict[str, Any]:
        """Serialize with `None` retained as explicit NULL-compatible values."""

        return {
            "amount": self.amount,
            "utr": self.utr,
            "vpa": self.vpa,
            "sender_name": self.sender_name,
            "transaction_date": self.transaction_date.isoformat()
            if self.transaction_date
            else None,
            "remark": self.remark,
            "account_number": self.account_number,
            "extracted_order_id": self.extracted_order_id,
            "bank": self.bank.value,
            "confidence_score": self.confidence_score,
            "verification_status": "candidate_only",
        }


class BaseBankParser:
    """Regex parser base class for bank payment alert formats."""

    bank = BankType.UNKNOWN
    credit_keywords: Tuple[str, ...] = ("credited", "received", "payment received")
    patterns: Dict[str, Tuple[str, ...]] = {}

    def __init__(self) -> None:
        self._compiled = {
            key: tuple(re.compile(pattern, re.IGNORECASE | re.MULTILINE) for pattern in patterns)
            for key, patterns in self.patterns.items()
        }

    def is_credit(self, subject: str, body: str) -> bool:
        text = f"{subject} {body}".lower()
        return any(keyword in text for keyword in self.credit_keywords)

    def parse(self, subject: str, body: str) -> Optional[PaymentDetails]:
        if not self.is_credit(subject, body):
            return None

        extracted: Dict[str, Any] = {}
        for field_name, patterns in self._compiled.items():
            extracted[field_name] = self._first_match(patterns, body)

        amount = self._parse_amount(extracted.get("amount"))
        utr = self._normalize_utr(extracted.get("utr")) or self._extract_utr_alternative(body)
        if amount is None or not utr:
            return None

        remark = self._clean_text(extracted.get("remark"))
        payment = PaymentDetails(
            amount=amount,
            utr=utr,
            vpa=self._clean_text(extracted.get("vpa")),
            sender_name=self._clean_text(extracted.get("sender_name")),
            transaction_date=self._parse_datetime(extracted.get("date"), extracted.get("time")),
            remark=remark,
            account_number=self._clean_text(extracted.get("account_number")),
            extracted_order_id=self._extract_order_id(remark),
            bank=self.bank,
            raw_data=extracted,
        )
        return PaymentDetails(**{**payment.__dict__, "confidence_score": self.confidence(payment)})

    @staticmethod
    def _first_match(patterns: Iterable[re.Pattern[str]], text: str) -> Optional[str]:
        for pattern in patterns:
            match = pattern.search(text)
            if match:
                return match.group(1).strip()
        return None

    @staticmethod
    def _clean_text(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = re.sub(r"\s+", " ", value).strip(" .:-\n\t")
        return cleaned or None

    @staticmethod
    def _parse_amount(value: Optional[str]) -> Optional[float]:
        if value is None:
            return None
        try:
            amount = float(value.replace(",", "").strip())
            return amount if amount > 0 else None
        except ValueError:
            return None

    @staticmethod
    def _normalize_utr(value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        normalized = re.sub(r"[^A-Z0-9]", "", value.upper())
        return normalized if len(normalized) >= 10 else None

    @staticmethod
    def _extract_utr_alternative(body: str) -> Optional[str]:
        for pattern in (r"\b([0-9]{12,})\b", r"\b([A-Z]{2,}[A-Z0-9]{10,})\b"):
            match = re.search(pattern, body, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None

    @staticmethod
    def _parse_datetime(date_text: Optional[str], time_text: Optional[str]) -> Optional[datetime]:
        if not date_text:
            return None
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y", "%Y-%m-%d"):
            try:
                parsed = datetime.strptime(date_text.strip(), fmt)
                if time_text:
                    for time_fmt in ("%H:%M:%S", "%H:%M"):
                        try:
                            parsed_time = datetime.strptime(time_text.strip(), time_fmt).time()
                            return parsed.replace(
                                hour=parsed_time.hour,
                                minute=parsed_time.minute,
                                second=parsed_time.second,
                            )
                        except ValueError:
                            continue
                return parsed
            except ValueError:
                continue
        return None

    @staticmethod
    def _extract_order_id(remark: Optional[str]) -> Optional[str]:
        if not remark:
            return None
        for pattern in (
            r"\b(?:ORD|ORDER|INV|REF)[-_:# ]?([A-Z0-9]{4,})\b",
            r"#([A-Z0-9]{6,})\b",
        ):
            match = re.search(pattern, remark, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None

    @staticmethod
    def confidence(payment: PaymentDetails) -> float:
        score = 0.0
        if payment.utr:
            score += 0.35
        if payment.amount > 0:
            score += 0.30
        if payment.vpa:
            score += 0.15
        if payment.transaction_date:
            score += 0.10
        if payment.extracted_order_id:
            score += 0.10
        return min(score, 1.0)


class HDFCParser(BaseBankParser):
    bank = BankType.HDFC
    credit_keywords = (
        "credited",
        "credit of",
        "received",
        "amount credited",
        "payment received",
        "money credited",
    )
    patterns = {
        "amount": (
            r"(?:Rs\.?|INR)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",
            r"credited with\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",
            r"Amount[:\s]+(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",
        ),
        "utr": (
            r"UTR[:\s]+([A-Z0-9-]{10,})",
            r"Transaction(?:\s+ID|\s+Id)?[:\s]+([A-Z0-9-]{10,})",
            r"Reference(?:\s+No)?[:\s]+([A-Z0-9-]{10,})",
        ),
        "vpa": (
            r"(?:From\s+VPA|VPA|Sender)[:\s]+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+)",
        ),
        "sender_name": (
            r"Sender Name[:\s]+([A-Za-z][A-Za-z\s.]{1,80})(?:\n|$)",
            r"From[:\s]+([A-Za-z][A-Za-z\s.]{1,80})(?:\n|$)",
        ),
        "date": (
            r"(?:Date|on|dated)[:\s]+(\d{2}[/-]\d{2}[/-]\d{2,4})",
            r"on\s+(\d{4}-\d{2}-\d{2})",
        ),
        "time": (
            r"(?:Time|at)[:\s]+(\d{2}:\d{2}(?::\d{2})?)",
        ),
        "remark": (
            r"(?:Remarks?|Narration|Description)[:\s]+(.+?)(?:\n|$)",
        ),
        "account_number": (
            r"(?:A/C|account)[^\n]*?([0-9]{4})\b",
        ),
    }


class SBIParser(BaseBankParser):
    bank = BankType.SBI
    credit_keywords = ("credited", "credit alert", "amount credited")
    patterns = {
        "amount": (r"(?:Rs\.?|INR)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",),
        "utr": (r"(?:UTR|Transaction Reference)[:\s]+([A-Z0-9-]{10,})",),
        "vpa": (r"VPA[:\s]+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+)",),
        "remark": (r"Description[:\s]+(.+?)(?:\n|$)",),
    }


class ICICIParser(BaseBankParser):
    bank = BankType.ICICI
    credit_keywords = ("credit", "received", "payment received")
    patterns = {
        "amount": (r"(?:Rs\.?|INR)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",),
        "utr": (r"(?:UTR|Transaction ID)[:\s]+([A-Z0-9-]{10,})",),
        "vpa": (r"VPA[:\s]+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+)",),
        "remark": (r"Narration[:\s]+(.+?)(?:\n|$)",),
    }


class AxisParser(BaseBankParser):
    bank = BankType.AXIS
    credit_keywords = ("credited", "credit alert")
    patterns = {
        "amount": (r"(?:Rs\.?|INR)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",),
        "utr": (r"UTR[:\s]+([A-Z0-9-]{10,})",),
        "vpa": (r"VPA[:\s]+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+)",),
    }


class MultiBankEmailParser:
    """Detect bank and parse candidate payment details."""

    def __init__(self) -> None:
        self.parsers = {
            BankType.HDFC: HDFCParser(),
            BankType.SBI: SBIParser(),
            BankType.ICICI: ICICIParser(),
            BankType.AXIS: AxisParser(),
        }
        self.bank_patterns = {
            BankType.HDFC: (r"hdfc", r"hdfc bank", r"hdfcbank"),
            BankType.SBI: (r"\bsbi\b", r"state bank", r"state bank of india"),
            BankType.ICICI: (r"icici", r"icici bank"),
            BankType.AXIS: (r"axis", r"axis bank"),
        }

    def detect_bank(self, subject: str, body: str) -> BankType:
        text = f"{subject} {body}".lower()
        for bank, patterns in self.bank_patterns.items():
            if any(re.search(pattern, text) for pattern in patterns):
                return bank
        return BankType.UNKNOWN

    def parse(self, subject: str, body: str, auto_detect: bool = True) -> Optional[PaymentDetails]:
        if auto_detect:
            bank = self.detect_bank(subject, body)
            parser = self.parsers.get(bank)
            if parser:
                return parser.parse(subject, body)

        for parser in self.parsers.values():
            result = parser.parse(subject, body)
            if result:
                return result
        return None

    def parse_with_confidence(self, subject: str, body: str) -> List[Tuple[PaymentDetails, float]]:
        results: List[Tuple[PaymentDetails, float]] = []
        for parser in self.parsers.values():
            result = parser.parse(subject, body)
            if result:
                results.append((result, result.confidence_score))
        return sorted(results, key=lambda item: item[1], reverse=True)


def parse_payment_email(subject: str, body: str) -> Optional[Dict[str, Any]]:
    """Parse one email into candidate payment details."""

    payment = MultiBankEmailParser().parse(subject, body)
    return payment.to_dict() if payment else None


SAMPLE_HDFC_EMAIL = {
    "subject": "HDFC Bank Account Alert: Credit of Rs. 500.00",
    "body": """
Dear Customer,

Your account XXXXXX1234 has been credited with Rs. 500.00 on 27-05-2026 at 14:30:25.

Transaction Details:
UTR: HDFC26052714302512345
From VPA: customer@okhdfcbank
Remarks: Payment for Order ORD123456

Status: Success
""",
}

