"""Command-line interface."""

from __future__ import annotations

import argparse
import json

from hdfc_upi_parser.core.email_parser import SAMPLE_HDFC_EMAIL, MultiBankEmailParser
from hdfc_upi_parser.services.health_check import health_check


def main() -> None:
    parser = argparse.ArgumentParser(prog="hdfc-parser")
    parser.add_argument("command", choices=["status", "test"], nargs="?", default="status")
    args = parser.parse_args()

    if args.command == "test":
        result = MultiBankEmailParser().parse(SAMPLE_HDFC_EMAIL["subject"], SAMPLE_HDFC_EMAIL["body"])
        print(json.dumps(result.to_dict() if result else None, indent=2))
        return

    print(json.dumps(health_check(), indent=2))


if __name__ == "__main__":
    main()

