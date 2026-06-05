"""Flask app factory.

Importing this module requires Flask. Core parser tests do not depend on Flask.
"""

from hdfc_upi_parser.services.health_check import health_check


def create_app():
    from flask import Flask, jsonify

    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify(health_check())

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=8000)

