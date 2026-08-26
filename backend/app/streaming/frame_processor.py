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
from app.services.websocket_service import (
    emit_dashboard_update,
    emit_new_alert,
    emit_live_frame,
    emit_processing_complete,
)
logger = get_logger("frame_processor")

# camera_id -> {"thread": Thread, "camera": RTSPCamera, "stop_flag": Event}
_active_streams = {}


class FrameProcessor(threading.Thread):
    def __init__(self, camera_id, source_url, source_type="rtsp", process_every_n=3):
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
        self.source_type = source_type
        self.process_every_n = process_every_n
        self.stop_flag = threading.Event()
        self.camera = RTSPCamera(source_url, camera_id=camera_id)

    def run(self):
        reset_motion_service(self.camera_id)

        if not self.camera.connect():
            logger.error(
                f"[{self.camera_id}] Could not start stream - connection failed"
            )
            return

        frame_index = 0

        logger.info(
            f"[{self.camera_id}] Stream processing started"
        )

        try:

            while not self.stop_flag.is_set():

                frame = self.camera.read_frame()

                if frame is None:

                    # Uploaded videos finish naturally.
                    if self.source_type == "video":
                        logger.info(
                            f"[{self.camera_id}] Video processing completed"
                        )

                        emit_processing_complete({
                            "camera_id": self.camera_id
                        })

                        break

                    # RTSP/webcam streams should keep retrying.
                    time.sleep(1)
                    continue

                frame_index += 1

                # Process only every Nth frame.
                if frame_index % self.process_every_n != 0:
                    continue

                try:

                    result = run_pipeline_on_frame(
                        frame,
                        camera_id=self.camera_id,
                        annotate=True,
                    )

                    annotated_frame = result.get("annotated_frame")

                    if annotated_frame is not None:
                        emit_live_frame(
                            self.camera_id,
                            annotated_frame,
                        )

                except Exception as e:

                    logger.error(
                        f"[{self.camera_id}] Pipeline error: {e}"
                    )

                    continue

                # --------------------------------------------------
                # Analytics
                # --------------------------------------------------

                save_analytics_snapshot(
                    camera_id=self.camera_id,
                    people_count=result["people_count"],
                    density_score=result["density_score"],
                    density_level=result["density_level"],
                    motion_score=result["motion_score"],
                    motion_level=result["motion_level"],
                    risk_level=result["risk_level"],
                )

                emit_dashboard_update({
                    "camera_id": self.camera_id,
                    "people_count": result["people_count"],
                    "density_score": result["density_score"],
                    "density_level": result["density_level"],
                    "motion_score": result["motion_score"],
                    "motion_level": result["motion_level"],
                    "risk_level": result["risk_level"],
                    "timestamp": result.get("timestamp"),
                })

                # --------------------------------------------------
                # Alerts
                # --------------------------------------------------

                if result["risk_level"] in ALERTABLE_RISK_LEVELS:

                    alert_id = save_alert(
                        camera_id=self.camera_id,
                        risk_level=result["risk_level"],
                        message=result["risk_message"],
                        people_count=result["people_count"],
                        density_level=result["density_level"],
                        motion_level=result["motion_level"],
                    )

                    emit_new_alert({
                        "id": alert_id,
                        "camera_id": self.camera_id,
                        "risk_level": result["risk_level"],
                        "message": result["risk_message"],
                        "people_count": result["people_count"],
                        "density_level": result["density_level"],
                        "motion_level": result["motion_level"],
                    })

        except Exception as e:

            logger.exception(
                f"[{self.camera_id}] Unexpected stream processing error: {e}"
            )

        finally:

            self.camera.release()

            # Remove this processor from the active registry
            # when the thread finishes naturally or is stopped.
            _active_streams.pop(self.camera_id, None)

            logger.info(
                f"[{self.camera_id}] Stream processing stopped"
            )
    def stop(self):
        """Request the background stream-processing thread to stop."""
        self.stop_flag.set()


def start_stream(
    camera_id,
    source_url,
    source_type="rtsp",
    process_every_n=3
):

    if camera_id in _active_streams:
        return False, "Stream with this camera_id is already running"

    logger.info(
        f"[{camera_id}] Starting stream | "
        f"type={source_type} | "
        f"source={source_url}"
    )

    processor = FrameProcessor(
        camera_id,
        source_url,
        source_type=source_type,
        process_every_n=process_every_n
    )

    _active_streams[camera_id] = processor

    processor.start()

    logger.info(
        f"[{camera_id}] Processor thread started"
    )

    return True, "Stream started"


def stop_stream(camera_id):
    processor = _active_streams.get(camera_id)

    if not processor:
        return False, "No active stream with this camera_id"

    processor.stop()

    if processor.is_alive():
        processor.join(timeout=2)

    _active_streams.pop(camera_id, None)

    return True, "Stream stopped"
def get_active_streams():
    return list(_active_streams.keys())
