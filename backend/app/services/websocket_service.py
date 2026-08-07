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
connected_dashboards = 0
@socketio.on("connect", namespace="/dashboard")
def dashboard_connect():
    global connected_dashboards
    connected_dashboards += 1
    print(f"Dashboard Connected ({connected_dashboards})")

@socketio.on("disconnect", namespace="/dashboard")
def dashboard_disconnect():
    global connected_dashboards
    connected_dashboards -= 1
    print(f"Dashboard Disconnected ({connected_dashboards})")

def emit_dashboard_update(data):
    """
    Sends latest analytics to every connected dashboard.
    """
    socketio.emit(
        "dashboard_update",
        data,
        namespace="/dashboard",
        callback=lambda: print("Dashboard update delivered"),
    )
def emit_live_frame(camera_id, frame):
    """
    Sends an annotated frame to all connected dashboard clients.
    """
    if connected_dashboards == 0:
        return

    encode_param = [
        int(cv2.IMWRITE_JPEG_QUALITY),
        65,
    ]

    success, buffer = cv2.imencode(
        ".jpg",
        frame,
        encode_param,
    )

    if not success:
        return

    frame_b64 = base64.b64encode(buffer).decode("utf-8")

    socketio.emit(
        "live_frame",
        {
            "camera_id": camera_id,
            "image": frame_b64,
        },
        namespace="/dashboard",
        callback=lambda: print("Dashboard update delivered"),
    )
    
def emit_processing_complete(camera_id):

    socketio.emit(
        "processing_complete",
        {
            "camera_id": camera_id,
        },
        namespace="/dashboard",
        callback=lambda: print("Dashboard update delivered"),
    )
def emit_new_alert(alert):
    """
    Sends a newly generated alert immediately.
    """
    socketio.emit(
        "new_alert",
        alert,
        namespace="/dashboard",
        callback=lambda: print("Dashboard update delivered"),
    )