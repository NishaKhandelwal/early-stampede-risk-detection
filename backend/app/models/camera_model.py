
"""
app/models/camera_model.py
Author : Nisha

Camera model used by the stream management layer.

This is intentionally lightweight. The actual live-stream processing
is handled by FrameProcessor; this model only stores the configuration
and current state of a camera.
"""


class Camera:
    """
    Represents one configured camera/stream.

    A Camera object does not process frames itself.
    It only stores camera information and runtime status.
    """

    def __init__(
        self,
        camera_id,
        source_url,
        source_type="rtsp",
        process_every_n=3,
    ):
        self.camera_id = camera_id
        self.source_url = source_url
        self.source_type = source_type
        self.process_every_n = process_every_n

        # Runtime state
        self.status = "stopped"

    def mark_running(self):
        """Mark the camera as actively processing."""
        self.status = "running"

    def mark_stopped(self):
        """Mark the camera as stopped."""
        self.status = "stopped"

    def mark_error(self):
        """Mark the camera as having a stream error."""
        self.status = "error"

    def to_dict(self):
        """Return camera information in API-friendly format."""
        return {
            "camera_id": self.camera_id,
            "source_url": self.source_url,
            "source_type": self.source_type,
            "process_every_n": self.process_every_n,
            "status": self.status,
        }

