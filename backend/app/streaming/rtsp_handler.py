"""
streaming/rtsp_handler.py
Author : Rishika

Wraps cv2.VideoCapture for RTSP/IP camera streams with basic
reconnect logic, since RTSP streams drop/hang far more often than
local video files.

Usage:
    cam = RTSPCamera("rtsp://camera_ip/live", camera_id="CAM-01")
    cam.connect()
    frame = cam.read_frame()   # returns None if temporarily unavailable
    cam.release()
"""

import cv2
import time

from app.utils.logger import get_logger

logger = get_logger("rtsp")


class RTSPCamera:
    def __init__(self, source_url, camera_id="default", max_retries=5, retry_delay=2):
        """
        Parameters
        ----------
        source_url : str
            RTSP URL, e.g. "rtsp://username:password@camera_ip:554/stream"
            (also works with 0 for a local webcam, or a video file path -
            cv2.VideoCapture treats them all the same way).
        camera_id : str
            Label used in logs/alerts to identify this source.
        max_retries : int
            How many times to attempt reconnecting after a dropped stream.
        retry_delay : int
            Seconds to wait between reconnect attempts.
        """
        self.source_url = source_url
        self.camera_id = camera_id
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.cap = None

    def connect(self):
        self.cap = cv2.VideoCapture(self.source_url)
        if not self.cap.isOpened():
            logger.warning(f"[{self.camera_id}] Could not open source: {self.source_url}")
            return False
        logger.info(f"[{self.camera_id}] Connected to {self.source_url}")
        return True

    def is_connected(self):
        return self.cap is not None and self.cap.isOpened()

    def read_frame(self):
        """
        Reads one frame. If the stream drops, attempts to reconnect
        up to max_retries times before giving up (returns None).
        """
        if not self.is_connected():
            if not self._reconnect():
                return None

        ret, frame = self.cap.read()

        if not ret or frame is None:
            logger.warning(f"[{self.camera_id}] Frame read failed, attempting reconnect...")
            if self._reconnect():
                ret, frame = self.cap.read()
                if ret:
                    return frame
            return None

        return frame

    def _reconnect(self):
        for attempt in range(1, self.max_retries + 1):
            logger.info(f"[{self.camera_id}] Reconnect attempt {attempt}/{self.max_retries}")
            if self.cap is not None:
                self.cap.release()
            self.cap = cv2.VideoCapture(self.source_url)
            if self.cap.isOpened():
                logger.info(f"[{self.camera_id}] Reconnected successfully")
                return True
            time.sleep(self.retry_delay)

        logger.error(f"[{self.camera_id}] Failed to reconnect after {self.max_retries} attempts")
        return False

    def release(self):
        if self.cap is not None:
            self.cap.release()
            logger.info(f"[{self.camera_id}] Released")
