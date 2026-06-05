"""Middleware placeholders."""


def fail_closed_headers(response):
    response.headers["X-PHKD-Production-Ready"] = "false"
    return response

