"""
api/routes_detection.py
Author : Rishika

Endpoints:
    POST /upload-video    - upload a video file, run full AI pipeline
                             on sampled frames, return a summary
    POST /process-frame   - upload a single image/frame, run detection
                             + density (+ motion/risk if a previous
                             frame is also supplied)
"""

import os
from app.utils.dashboard_payload import create_dashboard_payload
import cv2
import time
from flask import Blueprint, request, jsonify
from app.services.websocket_service import (
    emit_dashboard_update,
    emit_live_frame,
    emit_processing_complete,
    emit_new_alert,
)
from app.utils.config import (
    allowed_video_file,
    allowed_image_file,
    save_uploaded_file,
)
from app.utils.helpers import run_pipeline_on_frame, reset_motion_service
from app.database.db import save_alert, save_analytics_snapshot
from app.core.settings import (
    FRAME_SAMPLE_RATE,
    OUTPUT_FOLDER,
)
from app.core.constants import ALERTABLE_RISK_LEVELS
from app.utils.logger import get_logger

logger = get_logger("routes_detection")

detection_bp = Blueprint("detection_bp", __name__)


@detection_bp.route("/upload-video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No 'video' file part in the request"}), 400

    file = request.files["video"]
    camera_id = request.form.get("camera_id", "uploaded-video")

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_video_file(file.filename):
        return jsonify({"error": "Unsupported video format"}), 400

    saved_path = save_uploaded_file(file, file.filename)
    logger.info(f"Video saved to {saved_path}")
    start_time = time.time()

    cap = cv2.VideoCapture(saved_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 20

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    output_filename = f"{camera_id}_processed.mp4"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    writer = cv2.VideoWriter(
        output_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height)
    )
    if not cap.isOpened():
        return jsonify({"error": "Could not open uploaded video"}), 400

    reset_motion_service(camera_id)

    frame_index = 0
    processed_count = 0
    FRAME_STREAM_INTERVAL = 3
    people_counts = []
    motion_history = []
    density_history = []
    risk_events = []
    last_result = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_index += 1
        if frame_index % FRAME_SAMPLE_RATE != 0:
            continue

        result = run_pipeline_on_frame(frame, camera_id=camera_id, annotate=True)
        processed_count += 1
        if processed_count % 20 == 0:
            print(f"Processed {processed_count} sampled frames...")
        people_counts.append(result["people_count"])
        motion_history.append(result["motion_score"] or 0)
        density_history.append(result["density_score"])
        history = {
            "people": people_counts[-30:],
            "density": density_history[-30:],
            "motion": motion_history[-30:],
        }
        last_result = result
        emit_dashboard_update(
            create_dashboard_payload(
                result,
                history=history
            )
        )
        writer.write(result["annotated_frame"])
        if (
            processed_count % FRAME_STREAM_INTERVAL == 0
            and result["annotated_frame"] is not None
        ):
            emit_live_frame(
                camera_id,
                result["annotated_frame"]
            )

        save_analytics_snapshot(
            camera_id=camera_id,
            people_count=result["people_count"],
            density_score=result["density_score"],
            density_level=result["density_level"],
            motion_score=result["motion_score"],
            motion_level=result["motion_level"],
            risk_level=result["risk_level"],
        )

        if result["risk_level"] in ALERTABLE_RISK_LEVELS:
            save_alert(
                camera_id=camera_id,
                risk_level=result["risk_level"],
                message=result["risk_message"],
                people_count=result["people_count"],
                density_level=result["density_level"],
                motion_level=result["motion_level"],
            )
            alert = {
                "camera_id": camera_id,
                "risk_level": result["risk_level"],
                "message": result["risk_message"],
                "people_count": result["people_count"],
                "density_level": result["density_level"],
                "motion_level": result["motion_level"],
            }

            emit_new_alert(alert)
            
            risk_events.append({
                "frame": frame_index,
                "risk_level": result["risk_level"],
                "people_count": result["people_count"],
            })

    cap.release()
    writer.release()
    emit_processing_complete(camera_id)
    os.remove(saved_path)  # cleanup - don't keep uploaded videos around

    if processed_count == 0:
        print(f"Total processing time: {time.time()-start_time:.2f} sec")
        return jsonify({"error": "No frames could be processed from this video"}), 400
    

    summary = {
        "camera_id": camera_id,

        "processed_video":
            f"http://127.0.0.1:5000/outputs/{output_filename}",
        "total_frames_processed": processed_count,

        "max_people_count": max(people_counts),

        "avg_people_count": round(
            sum(people_counts) / len(people_counts),
            2
        ),
        "final_risk_level": last_result["risk_level"],
        "final_density_level": last_result["density_level"],
        "final_density_score": last_result["density_score"],
        "final_motion_level": last_result["motion_level"],
        "final_motion_score": last_result["motion_score"],
        "motion_history": motion_history,
        "people_history": people_counts,
        "density_history": density_history,
        "risk_message": last_result["risk_message"],
        "risk_events": risk_events,
    }
    
    return jsonify(summary), 200


@detection_bp.route("/process-frame", methods=["POST"])
def process_frame():
    """
    Accepts a single image (multipart form field "frame") and runs
    detection + density on it. Optionally accepts a second field
    "prev_frame" so motion + risk can also be computed for that pair.
    camera_id is used to keep motion state isolated between callers -
    pass a consistent camera_id across repeated calls if you want
    motion tracking to work frame-to-frame.
    """
    if "frame" not in request.files:
        return jsonify({"error": "No 'frame' file part in the request"}), 400

    frame_file = request.files["frame"]
    camera_id = request.form.get("camera_id", "default")
    annotate = request.form.get("annotate", "false").lower() == "true"

    if not allowed_image_file(frame_file.filename):
        return jsonify({"error": "Unsupported image format"}), 400

    import numpy as np
    file_bytes = np.frombuffer(frame_file.read(), np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Could not decode image"}), 400

    result = run_pipeline_on_frame(frame, camera_id=camera_id, annotate=annotate)

    response = {
        "camera_id": result["camera_id"],
        "people_count": result["people_count"],
        "detections": result["detections"],
        "density_score": result["density_score"],
        "density_level": result["density_level"],
        "motion_score": result["motion_score"],
        "motion_level": result["motion_level"],
        "risk_level": result["risk_level"],
        "risk_message": result["risk_message"],
        "inference_time": result["inference_time"],
    }

    if result["risk_level"] in ALERTABLE_RISK_LEVELS:
        save_alert(
            camera_id=camera_id,
            risk_level=result["risk_level"],
            message=result["risk_message"],
            people_count=result["people_count"],
            density_level=result["density_level"],
            motion_level=result["motion_level"],
        )
        alert = {
            "camera_id": camera_id,
            "risk_level": result["risk_level"],
            "message": result["risk_message"],
            "people_count": result["people_count"],
            "density_level": result["density_level"],
            "motion_level": result["motion_level"],
        }

        emit_new_alert(alert)

    save_analytics_snapshot(
        camera_id=camera_id,
        people_count=result["people_count"],
        density_score=result["density_score"],
        density_level=result["density_level"],
        motion_score=result["motion_score"],
        motion_level=result["motion_level"],
        risk_level=result["risk_level"],
    )

    if annotate and result["annotated_frame"] is not None:
        import base64
        _, buffer = cv2.imencode(".jpg", result["annotated_frame"])
        response["annotated_frame_base64"] = base64.b64encode(buffer).decode("utf-8")

    return jsonify(response), 200
