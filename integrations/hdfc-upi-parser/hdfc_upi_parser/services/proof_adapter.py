"""Convert parsed payment candidates into Radio proof-import shaped rows."""

from __future__ import annotations

from typing import Any, Dict

from hdfc_upi_parser.core.email_parser import PaymentDetails


def payment_candidate_to_proof_row(payment: PaymentDetails) -> Dict[str, Any]:
    """Return a candidate-only row for the Radio payment proof import contract.

    This row can help operators reconcile a bank email with a later provider
    receipt, but it cannot satisfy receipt, webhook, fulfillment, or audit gates.
    """

    return {
        "kind": "hdfc-email-candidate",
        "source": "hdfc_upi_parser",
        "candidateOnly": True,
        "verificationStatus": "candidate_only",
        "bank": payment.bank.value,
        "amount": payment.amount,
        "currency": "INR",
        "utr": payment.utr,
        "payerVpa": payment.vpa,
        "senderName": payment.sender_name,
        "transactionDate": payment.transaction_date.isoformat()
        if payment.transaction_date
        else None,
        "remark": payment.remark,
        "extractedOrderId": payment.extracted_order_id,
        "checkoutProvider": None,
        "checkoutSessionId": None,
        "paymentReceiptId": None,
        "providerEventId": None,
        "signatureHeader": None,
        "webhookVerified": False,
        "deliveredAt": None,
        "AuditLog.created": False,
        "blocker": "candidate email parse is not payment receipt or settlement proof",
    }

