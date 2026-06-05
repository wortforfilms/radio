"""Background task placeholders."""


def poll_email_task() -> dict:
    return {"status": "blocked", "reason": "celery broker evidence is NULL"}

