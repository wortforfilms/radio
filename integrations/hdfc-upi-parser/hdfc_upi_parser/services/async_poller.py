"""Async poller placeholder."""

from hdfc_upi_parser.services.sync_poller import SyncEmailPoller


class AsyncEmailPoller:
    async def poll_once(self) -> dict:
        return SyncEmailPoller().poll_once()

