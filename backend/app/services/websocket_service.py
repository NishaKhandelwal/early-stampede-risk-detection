"""
services/websocket_service.py

Simple in-memory pub/sub for live dashboard updates.
"""

from flask_socketio import SocketIO
import cv2
import base64
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="threading",
    logger=True,
    engineio_logger=True,
    ping_interval=25,
    ping_timeout=60,
)

@socketio.on("connect", namespace="/dashboard")
def dashboard_connect():
    print("Dashboard Connected")

@socketio.on("disconnect", namespace="/dashboard")
def dashboard_disconnect():
    print("Dashboard Disconnected")

def emit_dashboard_update(data):
    """
    Sends latest analytics to every connected dashboard.
    """
    socketio.emit(
        "dashboard_update",
        data,
        namespace="/dashboard"
    )
def emit_live_frame(camera_id, frame):
    """
    Sends an annotated frame to all connected dashboard clients.
    """

    success, buffer = cv2.imencode(".jpg", frame)

    if not success:
        return

    frame_b64 = base64.b64encode(buffer).decode("utf-8")

    socketio.emit(
        "live_frame",
        {
            "camera_id": camera_id,
            "image": frame_b64,
        },
        namespace="/dashboard"
    )
    
def emit_processing_complete(camera_id):

    socketio.emit(
        "processing_complete",
        {
            "camera_id": camera_id,
        },
        namespace="/dashboard",
    )
def emit_new_alert(alert):
    """
    Sends a newly generated alert immediately.
    """
    socketio.emit(
        "new_alert",
        alert,
        namespace="/dashboard"
    )