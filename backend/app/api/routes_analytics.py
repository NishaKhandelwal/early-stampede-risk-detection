"""
app/api/routes_analytics.py
Author : Rishika

Analytics/history endpoints for dashboard charts.

Endpoints:
GET /analytics
    Returns analytics history and aggregated statistics.

Optional query parameters:
camera_id
    Filter results to one camera.

limit
    Number of snapshots to return.
    Default: 200
    Maximum: 1000
"""

from flask import Blueprint, request, jsonify

from app.database.db import get_analytics_summary


analytics_bp = Blueprint("analytics_bp", __name__)


@analytics_bp.route("/analytics", methods=["GET"])
def analytics():

    camera_id = request.args.get(
        "camera_id",
        default=None,
        type=str,
    )

    limit = request.args.get(
        "limit",
        default=200,
        type=int,
    )

    if limit < 1:
        return jsonify({
            "success": False,
            "error": "limit must be a positive integer",
        }), 400

    if limit > 1000:
        return jsonify({
            "success": False,
            "error": "limit cannot exceed 1000",
        }), 400

    summary = get_analytics_summary(
        camera_id=camera_id,
        limit=limit,
    )

    summary["success"] = True

    return jsonify(summary), 200