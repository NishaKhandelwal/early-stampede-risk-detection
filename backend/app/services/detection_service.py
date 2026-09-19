import time
import cv2
from ultralytics import YOLO


class DetectionService:

    def __init__(
        self,
        model_path="yolov8n.pt",
        confidence_threshold=0.50
    ):
        """
        Initialize YOLO model.

        Parameters
        ----------
        model_path : str
            Path to pretrained YOLO model.

        confidence_threshold : float
            Minimum confidence to accept detections.
        """

        self.model = YOLO(model_path)

        # COCO Dataset
        self.PERSON_CLASS = 0

        self.confidence_threshold = confidence_threshold
    def detect_people(self, frame):

        """
        Detect persons in the ORIGINAL frame.

        Ultralytics handles the required preprocessing internally,
        while returned bounding boxes remain aligned with the
        original frame coordinate system.
        """

        start_time = time.time()

        original_height, original_width = frame.shape[:2]

        results = self.model(
            frame,
            verbose=False
        )

        detections = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # Ignore non-person classes
                if class_id != self.PERSON_CLASS:
                    continue

                # Ignore weak detections
                if confidence < self.confidence_threshold:
                    continue

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )

                detections.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": round(confidence, 2)
                })

        inference_time = round(
            time.time() - start_time,
            3
        )

        return {
            "people_count": len(detections),
            "detections": detections,
            "frame_width": original_width,
            "frame_height": original_height,
            "inference_time": inference_time
        }