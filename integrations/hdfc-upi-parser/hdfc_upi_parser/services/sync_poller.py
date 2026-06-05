"""Synchronous poller placeholder.

Live IMAP access is blocked until credentials and account evidence exist.
"""

from hdfc_upi_parser.utils.config import config


class SyncEmailPoller:
    def poll_once(self) -> dict:
        try:
            config.validate_for_live_polling()
        except ValueError as error:
            return {"status": "blocked", "reason": str(error), "emails_found": 0}
        return {"status": "not_implemented_live_adapter", "emails_found": 0}

