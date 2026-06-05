# HDFC UPI Parser

Draft integration scaffold for parsing HDFC/UPI payment notification emails and feeding a separate payment-proof gate.

This package is **not production verified**. It does not claim settlement, receipt, webhook, or delivery proof. Parsed emails are only candidate evidence until the Radio payment proof lane verifies receipt, provider webhook signature, fulfillment, and audit records.

## PHKD Posture

- Unknown values remain `NULL`.
- Email parsing alone never marks an order paid.
- Duplicate UTRs are rejected.
- Unverifiable records remain blocked.
- Real credentials, provider exports, webhook secrets, and audit evidence are not included.

## Local Smoke

```bash
python3 -m unittest discover -s tests
```

## Evidence Flow

```text
Email Notification
  -> MultiBankEmailParser
  -> Candidate PaymentDetails
  -> PaymentMatcher
  -> Proof Import JSON/CSV
  -> Radio Gift / Payment Proof Lane
  -> NO_SHIP until receipt + webhook + fulfillment + audit pass
```

