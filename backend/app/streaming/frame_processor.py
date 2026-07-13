"""
streaming/frame_processor.py
Author : Rishika

Runs in a background thread: continuously pulls frames from an
RTSP/webcam source, sends each frame through the full AI pipeline
(run_pipeline_on_frame), and logs analytics snapshots + alerts to
the database. This is what makes CCTV streams "live" instead of
just one-off video uploads.

A registry (_active_streams) tracks all currently-running streams
so API routes can start/stop them by camera_id.
"""

import threading
import time

from app.streaming.rtsp_handler import RTSPCamera
from app.utils.helpers import run_pipeline_on_frame, reset_motion_service
from app.database.db import save_alert, save_analytics_snapshot
from app.core.constants import ALERTABLE_RISK_LEVELS
from app.utils.logger import get_logger

logger = get_logger("frame_processor")

# camera_id -> {"thread": Thread, "camera": RTSPCamera, "stop_flag": Event}
_active_streams = {}


class FrameProcessor(threading.Thread):
    def __init__(self, camera_id, source_url, process_every_n=3):
        """
        Parameters
        ----------
        camera_id : str
            Unique id for this stream (used in DB rows and to stop it later).
        source_url : str
            RTSP URL / webcam index / video file path.
        process_every_n : int
            Only run the (expensive) AI pipeline on every Nth frame,
            to avoid maxing out the CPU/GPU on a live stream.
        """
        super().__init__(daemon=True)
        self.camera_id = camera_id
        self.source_url = source_url
        self.process_every_n = process_every_n
        self.stop_flag = threading.Event()
        self.camera = RTSPCamera(source_url, camera_id=camera_id)

    def run(self):
        reset_motion_service(self.camera_id)

        if not self.camera.connect():
            logger.error(f"[{self.camera_id}] Could not start stream - connection failed")
            return

        frame_index = 0
        logger.info(f"[{self.camera_id}] Stream processing started")

        while not self.stop_flag.is_set():
            frame = self.camera.read_frame()

            if frame is None:
                time.sleep(1)
                continue

            frame_index += 1
            if frame_index % self.process_every_n != 0:
                continue  # skip this frame, just keep the stream moving

            try:
                result = run_pipeline_on_frame(frame, camera_id=self.camera_id)
            except Exception as e:
                logger.error(f"[{self.camera_id}] Pipeline error: {e}")
                continue

            # Log every processed frame for analytics/trend charts
            save_analytics_snapshot(
                camera_id=self.camera_id,
                people_count=result["people_count"],
                density_score=result["density_score"],
                density_level=result["density_level"],
                motion_score=result["motion_score"],
                motion_level=result["motion_level"],
                risk_level=result["risk_level"],
            )

            # Only log an ALERT row when risk is WARNING or HIGH RISK
            if result["risk_level"] in ALERTABLE_RISK_LEVELS:
                save_alert(
                    camera_id=self.camera_id,
                    risk_level=result["risk_level"],
                    message=result["risk_message"],
                    people_count=result["people_count"],
                    density_level=result["density_level"],
                    motion_level=result["motion_level"],
                )

        self.camera.release()
        logger.info(f"[{self.camera_id}] Stream processing stopped")

    def stop(self):
        self.stop_flag.set()


def start_stream(camera_id, source_url, process_every_n=3):
    if camera_id in _active_streams:
        return False, "Stream with this camera_id is already running"

    processor = FrameProcessor(camera_id, source_url, process_every_n)
    processor.start()

    _active_streams[camera_id] = processor
    return True, "Stream started"


def stop_stream(camera_id):
    processor = _active_streams.get(camera_id)
    if not processor:
        return False, "No active stream with this camera_id"

    processor.stop()
    del _active_streams[camera_id]
    return True, "Stream stopped"


def get_active_streams():
    return list(_active_streams.keys())
