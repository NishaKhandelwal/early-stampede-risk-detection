"""
app/api/routes_alerts.py
Author : Rishika

Alert history API.

Endpoint:
GET /alerts

Query params:
limit       - number of recent alerts to return (default 50, max 1000)
risk_level  - optional filter: WARNING or HIGH RISK
"""

from flask import Blueprint, request, jsonify

from app.database.db import (
    get_alerts,
    acknowledge_alert,
    acknowledge_all_alerts,
)


alerts_bp = Blueprint("alerts_bp", __name__)


@alerts_bp.route("/alerts", methods=["GET"])
def list_alerts():
    """
    Return recent alert history.

    Examples:
        GET /alerts
        GET /alerts?limit=20
        GET /alerts?risk_level=WARNING
        GET /alerts?risk_level=HIGH%20RISK&limit=10
    """

    limit = request.args.get("limit", default=50, type=int)
    risk_level = request.args.get("risk_level", default=None, type=str)

    # -----------------------------------------------------------
    # Validate limit
    # -----------------------------------------------------------

    if limit is None:
        return jsonify({
            "success": False,
            "error": "limit must be an integer"
        }), 400

    if limit < 1:
        return jsonify({
            "success": False,
            "error": "limit must be a positive integer"
        }), 400

    if limit > 1000:
        return jsonify({
            "success": False,
            "error": "limit cannot exceed 1000"
        }), 400

    # -----------------------------------------------------------
    # Validate risk level
    # -----------------------------------------------------------

    if risk_level is not None:
        risk_level = risk_level.strip().upper()

        allowed_risk_levels = {
            "WARNING",
            "HIGH RISK",
        }

        if risk_level not in allowed_risk_levels:
            return jsonify({
                "success": False,
                "error": "risk_level must be WARNING or HIGH RISK"
            }), 400

    # -----------------------------------------------------------
    # Fetch alerts
    # -----------------------------------------------------------

    alerts = get_alerts(
        limit=limit,
        risk_level=risk_level,
    )

    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": alerts,
    }), 200
@alerts_bp.route("/alerts/<int:alert_id>/acknowledge", methods=["POST"])
def acknowledge_single_alert(alert_id):
    success = acknowledge_alert(alert_id)

    if not success:
        return jsonify({
            "success": False,
            "error": "Alert not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Alert acknowledged",
        "alert_id": alert_id,
    }), 200
@alerts_bp.route("/alerts/acknowledge-all", methods=["POST"])
def acknowledge_all():
    count = acknowledge_all_alerts()

    return jsonify({
        "success": True,
        "message": "All alerts acknowledged",
        "count": count,
    }), 200