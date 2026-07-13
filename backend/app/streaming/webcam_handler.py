"""
streaming/webcam_handler.py
Author : Rishika

Local webcam is just RTSPCamera with source=0 (or another device index).
Kept as a separate thin wrapper so route code reads clearly
("WebcamCamera" vs "RTSPCamera") even though the underlying
cv2.VideoCapture behaviour is identical.
"""

from app.streaming.rtsp_handler import RTSPCamera


class WebcamCamera(RTSPCamera):
    def __init__(self, device_index=0, camera_id="webcam"):
        super().__init__(source_url=device_index, camera_id=camera_id)
