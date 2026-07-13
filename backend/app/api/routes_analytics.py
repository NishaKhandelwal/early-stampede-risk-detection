"""
api/routes_analytics.py
Author : Rishika

Endpoint:
    GET /analytics   - aggregated stats for dashboards/charts

Query params (all optional):
    camera_id   - filter to one camera/stream
    limit       - how many recent snapshots to include (default 200)
"""

from flask import Blueprint, request, jsonify
from app.database.db import get_analytics_summary

analytics_bp = Blueprint("analytics_bp", __name__)


@analytics_bp.route("/analytics", methods=["GET"])
def analytics():
    camera_id = request.args.get("camera_id", default=None, type=str)
    limit = request.args.get("limit", default=200, type=int)

    summary = get_analytics_summary(camera_id=camera_id, limit=limit)

    return jsonify(summary), 200
