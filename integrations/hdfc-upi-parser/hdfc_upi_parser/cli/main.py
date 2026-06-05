"""Command-line interface."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from hdfc_upi_parser.core.email_parser import SAMPLE_HDFC_EMAIL, MultiBankEmailParser
from hdfc_upi_parser.services.health_check import health_check
from hdfc_upi_parser.services.proof_adapter import payment_candidate_to_proof_row


def _load_email_payload(path: str | None) -> list[dict[str, Any]]:
    if not path:
        return [SAMPLE_HDFC_EMAIL]

    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        if isinstance(payload.get("emails"), list):
            return payload["emails"]
        if isinstance(payload.get("records"), list):
            return payload["records"]
        return [payload]
    raise ValueError("input must be a JSON object, records object, emails object, or array")


def _candidate_rows_from_email_payloads(path: str | None) -> list[dict[str, Any]]:
    parser = MultiBankEmailParser()
    rows: list[dict[str, Any]] = []

    for payload in _load_email_payload(path):
        subject = str(payload.get("subject") or "")
        body = str(payload.get("body") or payload.get("text") or "")
        payment = parser.parse(subject, body)
        if payment:
            rows.append(payment_candidate_to_proof_row(payment))

    return rows


def main() -> None:
    parser = argparse.ArgumentParser(prog="hdfc-parser")
    parser.add_argument("command", choices=["status", "test", "proof-candidates"], nargs="?", default="status")
    parser.add_argument("--input", help="JSON email payload path for proof-candidates")
    args = parser.parse_args()

    if args.command == "test":
        result = MultiBankEmailParser().parse(SAMPLE_HDFC_EMAIL["subject"], SAMPLE_HDFC_EMAIL["body"])
        print(json.dumps(result.to_dict() if result else None, indent=2))
        return

    if args.command == "proof-candidates":
        rows = _candidate_rows_from_email_payloads(args.input)
        print(json.dumps({
            "records": rows,
            "counts": {
                "candidateRows": len(rows),
                "verifiedReceipts": 0,
                "verifiedWebhooks": 0,
                "fulfilledGifts": 0
            },
            "phkd": {
                "rule": "fail_closed",
                "productionReady": False,
                "releaseAllowed": False,
                "note": "HDFC email candidates are reconciliation hints only; they are not provider receipts, webhook proof, settlement proof, or delivery proof."
            }
        }, indent=2))
        return

    print(json.dumps(health_check(), indent=2))


if __name__ == "__main__":
    main()
