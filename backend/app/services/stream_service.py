
"""
app/services/stream_service.py
Author : Nisha

Service layer for managing configured camera streams.

This module sits between the API routes and the lower-level
FrameProcessor.

Responsibilities:
- Register cameras
- Start camera streams
- Stop camera streams
- Track camera status
- Return camera information

Actual frame processing remains inside frame_processor.py.
"""

from app.models.camera_model import Camera
from app.streaming.frame_processor import (
    start_stream,
    stop_stream,
    get_active_streams,
)

from app.utils.logger import get_logger

logger = get_logger("stream_service")


# camera_id -> Camera object
_cameras = {}


def register_camera(
    camera_id,
    source_url,
    source_type="rtsp",
    process_every_n=3,
):
    """
    Register a camera in the stream manager.

    Returns:
        (success, message, camera)
    """

    if camera_id in _cameras:
        return False, "Camera with this camera_id already exists", None

    camera = Camera(
        camera_id=camera_id,
        source_url=source_url,
        source_type=source_type,
        process_every_n=process_every_n,
    )

    _cameras[camera_id] = camera

    logger.info(f"[{camera_id}] Camera registered")

    return True, "Camera registered", camera


def get_camera(camera_id):
    """
    Return a registered camera.
    """
    return _cameras.get(camera_id)


def get_all_cameras():
    """
    Return all registered cameras.
    """

    active_streams = get_active_streams()

    cameras = []

    for camera in _cameras.values():

        # Keep model status synchronized with FrameProcessor registry.
        if camera.camera_id in active_streams:
            camera.mark_running()
        elif camera.status == "running":
            camera.mark_stopped()

        cameras.append(camera.to_dict())

    return cameras


def start_camera(camera_id):
    """
    Start processing a registered camera.
    """

    camera = _cameras.get(camera_id)

    if camera is None:
        return False, "Camera not found"

    if camera.camera_id in get_active_streams():
        return False, "Camera stream is already running"

    success, message = start_stream(
        camera_id=camera.camera_id,
        source_url=camera.source_url,
        source_type=camera.source_type,
        process_every_n=camera.process_every_n,
    )

    if success:
        camera.mark_running()
        logger.info(f"[{camera_id}] Camera started")

    return success, message


def stop_camera(camera_id):
    """
    Stop processing a registered camera.
    """

    camera = _cameras.get(camera_id)

    if camera is None:
        return False, "Camera not found"

    success, message = stop_stream(camera_id)

    if success:
        camera.mark_stopped()
        logger.info(f"[{camera_id}] Camera stopped")

    return success, message


def remove_camera(camera_id):
    """
    Remove a camera from the registry.

    A running camera cannot be removed.
    """

    camera = _cameras.get(camera_id)

    if camera is None:
        return False, "Camera not found"

    if camera_id in get_active_streams():
        return False, "Stop the camera before removing it"

    del _cameras[camera_id]

    logger.info(f"[{camera_id}] Camera removed")

    return True, "Camera removed"
def get_stream_summary():
    """
    Return a compact summary of registered and active cameras.
    """

    cameras = get_all_cameras()
    active_count = sum(
        1 for camera in cameras
        if camera["status"] == "running"
    )

    return {
        "total_cameras": len(cameras),
        "active_streams": active_count,
        "stopped_streams": len(cameras) - active_count,
        "cameras": cameras,
    }

def get_camera_status(camera_id):
    """
    Return the current status of one camera.
    """

    camera = _cameras.get(camera_id)

    if camera is None:
        return None

    if camera_id in get_active_streams():
        camera.mark_running()
    elif camera.status == "running":
        camera.mark_stopped()

    return camera.to_dict()

