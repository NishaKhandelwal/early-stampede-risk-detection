"""
api/routes_stream.py
Author : Rishika

Endpoints for controlling LIVE CCTV/RTSP/webcam streams (as opposed
to one-off video uploads, which go through /upload-video).

    POST /stream/start   - start processing a live stream in the background
    POST /stream/stop    - stop a running stream
    GET  /stream/status  - list currently active streams
"""

from flask import Blueprint, request, jsonify

from app.streaming.frame_processor import start_stream, stop_stream, get_active_streams

stream_bp = Blueprint("stream_bp", __name__)


@stream_bp.route("/stream/start", methods=["POST"])
def stream_start():
    """
    Body (JSON):
    {
        "camera_id": "CAM-01",
        "source_url": "rtsp://camera_ip/live"   (or 0 for local webcam)
    }
    """
    data = request.get_json(silent=True) or {}
    camera_id = data.get("camera_id")
    source_url = data.get("source_url")

    if not camera_id or source_url is None:
        return jsonify({"error": "camera_id and source_url are required"}), 400

    success, message = start_stream(camera_id, source_url)
    status_code = 200 if success else 409

    return jsonify({"success": success, "message": message}), status_code


@stream_bp.route("/stream/stop", methods=["POST"])
def stream_stop():
    """
    Body (JSON):
    {
        "camera_id": "CAM-01"
    }
    """
    data = request.get_json(silent=True) or {}
    camera_id = data.get("camera_id")

    if not camera_id:
        return jsonify({"error": "camera_id is required"}), 400

    success, message = stop_stream(camera_id)
    status_code = 200 if success else 404

    return jsonify({"success": success, "message": message}), status_code


@stream_bp.route("/stream/status", methods=["GET"])
def stream_status():
    return jsonify({"active_streams": get_active_streams()}), 200
