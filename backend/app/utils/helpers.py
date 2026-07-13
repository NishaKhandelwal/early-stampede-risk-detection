"""
utils/helpers.py
Author : Rishika

This is the GLUE code. It takes Nisha's and Sonia's four services
and chains them into one function so the rest of the backend
(API routes, streaming) doesn't need to know how each service works
internally - it just calls run_pipeline_on_frame() and gets one
clean result back.

Pipeline:
    frame
      -> DetectionService.detect_people()        (Nisha)
      -> DensityService.calculate_density()       (Nisha)
      -> MotionService.analyze_stream_frame()      (Sonia)
      -> RiskService.assess_risk()                 (Sonia)
      -> AnnotationService.annotate_frame()         (Nisha, optional)
"""

from app.services.detection_service import DetectionService
from app.services.density_service import DensityService
from app.services.motion_service import MotionService
from app.services.risk_service import RiskService
from app.services.annotation_service import AnnotationService

from app.utils.logger import get_logger

logger = get_logger("pipeline")

# ---------------------------------------------------------------
# Singletons
# ---------------------------------------------------------------
# DetectionService loads a YOLO model - expensive to create, so we
# create ONE instance and reuse it for every request/frame instead
# of reloading the model every time.
# ---------------------------------------------------------------

detection_service = DetectionService()
density_service = DensityService()
risk_service = RiskService()
annotation_service = AnnotationService()

# MotionService keeps internal state (prev_gray) that is specific to
# ONE continuous stream. If we used a single shared instance for every
# camera, camera A's frames would get compared against camera B's
# frames - wrong results. So we keep one MotionService PER camera_id.
_motion_services = {}


def get_motion_service(camera_id):
    if camera_id not in _motion_services:
        _motion_services[camera_id] = MotionService()
    return _motion_services[camera_id]


def reset_motion_service(camera_id):
    """Call this when starting a fresh video/stream for a camera_id,
    so old motion state doesn't leak into the new one."""
    _motion_services[camera_id] = MotionService()


# ---------------------------------------------------------------
# The actual pipeline
# ---------------------------------------------------------------

def run_pipeline_on_frame(frame, camera_id="default", annotate=False):
    """
    Runs the full AI pipeline on a single frame.

    Parameters
    ----------
    frame : np.ndarray
        A single BGR frame (from cv2.imread, cv2.VideoCapture.read(), etc.)
    camera_id : str
        Identifies the video/camera source, so motion tracking state
        (which needs consecutive frames) isn't mixed up between sources.
    annotate : bool
        If True, also returns an annotated copy of the frame with
        bounding boxes / dashboard drawn on it.

    Returns
    -------
    dict
        {
            "camera_id": str,
            "people_count": int,
            "detections": list,
            "density_score": float,
            "density_level": "LOW"|"MEDIUM"|"HIGH",
            "motion_score": float | None,   (None on the very first frame)
            "motion_level": "LOW"|"MEDIUM"|"HIGH" | None,
            "risk_level": "NORMAL"|"WARNING"|"HIGH RISK" | None,
            "risk_message": str | None,
            "inference_time": float,
            "annotated_frame": np.ndarray | None
        }
    """

    # 1. Detection (Nisha)
    detection_result = detection_service.detect_people(frame)
    people_count = detection_result["people_count"]
    detections = detection_result["detections"]

    # 2. Density (Nisha)
    density_result = density_service.calculate_density(detections, frame.shape)
    density_level = density_result["density_level"]
    density_score = density_result["density_score"]

    # 3. Motion (Sonia) - needs a previous frame, so first frame of any
    #    stream will return None here. That's expected, not an error.
    motion_service = get_motion_service(camera_id)
    motion_result = motion_service.analyze_stream_frame(frame)

    motion_score = motion_result["motion_score"] if motion_result else None
    motion_level = motion_result["motion_level"] if motion_result else None

    # 4. Risk (Sonia) - only possible once we have both density AND motion
    risk_level = None
    risk_message = None
    if motion_level is not None:
        risk_result = risk_service.assess_risk(density_level, motion_level)
        risk_level = risk_result["risk_level"]
        risk_message = risk_result["message"]

    # 5. Annotation (Nisha) - optional, only if caller wants the drawn frame
    annotated_frame = None
    if annotate:
        annotated_frame = annotation_service.annotate_frame(
            frame,
            detections,
            people_count,
            density_level,
            density_score,
            fps=0,
            camera_name=camera_id,
        )

    result = {
        "camera_id": camera_id,
        "people_count": people_count,
        "detections": detections,
        "density_score": density_score,
        "density_level": density_level,
        "motion_score": motion_score,
        "motion_level": motion_level,
        "risk_level": risk_level,
        "risk_message": risk_message,
        "inference_time": detection_result["inference_time"],
        "annotated_frame": annotated_frame,
    }

    if risk_level in ("WARNING", "HIGH RISK"):
        logger.info(
            f"[{camera_id}] risk={risk_level} people={people_count} "
            f"density={density_level} motion={motion_level}"
        )

    return result
