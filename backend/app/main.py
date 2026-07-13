"""
main.py
Author : Rishika

Entrypoint for the backend. Creates the Flask app, registers every
API blueprint, initializes the database, and enables CORS so the
frontend (running on a different port) can call these APIs.

Run with:
    python app/main.py
(from inside the backend/ folder, with your venv activated)
"""

from flask import Flask, jsonify
from flask_cors import CORS

from app.core.settings import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, MAX_CONTENT_LENGTH
from app.database.db import init_db

from app.api.routes_detection import detection_bp
from app.api.routes_alerts import alerts_bp
from app.api.routes_analytics import analytics_bp
from app.api.routes_stream import stream_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # allow the React frontend to call these APIs from another port

    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # Initialize SQLite tables (safe to call every startup - CREATE TABLE IF NOT EXISTS)
    init_db()

    # Register all route blueprints
    app.register_blueprint(detection_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(stream_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "early-stampede-risk-detection backend"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
