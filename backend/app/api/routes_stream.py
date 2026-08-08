
"""
app/api/routes_stream.py
Author : Rishika

API endpoints for managing live CCTV/RTSP/webcam streams.

Endpoints
---------
POST /stream/register
    Register a camera without starting its stream.

POST /stream/start
    Start a registered camera stream.

POST /stream/stop
    Stop a running camera stream.

DELETE /stream/<camera_id>
    Remove a registered camera.

GET /stream/status
    List all registered cameras and their current status.

GET /stream/status/<camera_id>
    Get the status of one camera.
"""

from flask import Blueprint, request, jsonify

from app.services.stream_service import (
    register_camera,
    start_camera,
    stop_camera,
    remove_camera,
    get_all_cameras,
    get_camera_status,
    get_stream_summary,
)

stream_bp = Blueprint("stream_bp", __name__)


@stream_bp.route("/stream/register", methods=["POST"])
def stream_register():
    """
    Register a camera.

    Body:
    {
        "camera_id": "CAM-01",
        "source_url": "rtsp://camera_ip/live",
        "source_type": "rtsp",
        "process_every_n": 3
    }

    For webcam:
    {
        "camera_id": "WEBCAM-01",
        "source_url": 0,
        "source_type": "webcam"
    }
    """

    data = request.get_json(silent=True) or {}

    camera_id = data.get("camera_id")
    source_url = data.get("source_url")
    source_type = data.get("source_type", "rtsp")
    process_every_n = data.get("process_every_n", 3)

    if not camera_id or source_url is None:
        return jsonify({
            "error": "camera_id and source_url are required"
        }), 400

    if source_type not in ("rtsp", "webcam", "video"):
        return jsonify({
            "error": "source_type must be rtsp, webcam, or video"
        }), 400

    try:
        process_every_n = int(process_every_n)

        if process_every_n < 1:
            raise ValueError

    except (TypeError, ValueError):
        return jsonify({
            "error": "process_every_n must be a positive integer"
        }), 400

    success, message, camera = register_camera(
        camera_id=camera_id,
        source_url=source_url,
        source_type=source_type,
        process_every_n=process_every_n,
    )

    status_code = 201 if success else 409

    response = {
        "success": success,
        "message": message,
    }

    if camera is not None:
        response["camera"] = camera.to_dict()

    return jsonify(response), status_code


@stream_bp.route("/stream/start", methods=["POST"])
def stream_start():
    """
    Start a registered camera.

    Body:
    {
        "camera_id": "CAM-01"
    }
    """

    data = request.get_json(silent=True) or {}

    camera_id = data.get("camera_id")

    if not camera_id:
        return jsonify({
            "error": "camera_id is required"
        }), 400

    success, message = start_camera(camera_id)

    status_code = 200 if success else 404

    if "already running" in message.lower():
        status_code = 409

    return jsonify({
        "success": success,
        "message": message,
    }), status_code


@stream_bp.route("/stream/stop", methods=["POST"])
def stream_stop():
    """
    Stop a running camera.

    Body:
    {
        "camera_id": "CAM-01"
    }
    """

    data = request.get_json(silent=True) or {}

    camera_id = data.get("camera_id")

    if not camera_id:
        return jsonify({
            "error": "camera_id is required"
        }), 400

    success, message = stop_camera(camera_id)

    status_code = 200 if success else 404

    return jsonify({
        "success": success,
        "message": message,
    }), status_code
@stream_bp.route("/stream/status", methods=["GET"])
def stream_status():
    """
    Return camera and stream summary.
    """

    return jsonify(get_stream_summary()), 200
@stream_bp.route("/stream/status/<camera_id>", methods=["GET"])
def single_stream_status(camera_id):
    """
    Return the status of one registered camera.
    """

    camera = get_camera_status(camera_id)

    if camera is None:
        return jsonify({
            "error": "Camera not found"
        }), 404

    return jsonify({
        "camera": camera
    }), 200


@stream_bp.route("/stream/<camera_id>", methods=["DELETE"])
def stream_remove(camera_id):
    """
    Remove a registered camera.

    A camera must be stopped before it can be removed.
    """

    success, message = remove_camera(camera_id)

    status_code = 200 if success else 404

    if "stop the camera" in message.lower():
        status_code = 409

    return jsonify({
        "success": success,
        "message": message,
    }), status_code
