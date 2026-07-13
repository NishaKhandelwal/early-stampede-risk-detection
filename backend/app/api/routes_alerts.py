"""
api/routes_alerts.py
Author : Rishika

Endpoint:
    GET /alerts   - returns recent WARNING / HIGH RISK events

Query params (all optional):
    limit        - max number of alerts to return (default 50)
    risk_level   - filter to only "WARNING" or "HIGH RISK"
"""

from flask import Blueprint, request, jsonify
from app.database.db import get_alerts

alerts_bp = Blueprint("alerts_bp", __name__)


@alerts_bp.route("/alerts", methods=["GET"])
def list_alerts():
    limit = request.args.get("limit", default=50, type=int)
    risk_level = request.args.get("risk_level", default=None, type=str)

    alerts = get_alerts(limit=limit, risk_level=risk_level)

    return jsonify({
        "count": len(alerts),
        "alerts": alerts
    }), 200
