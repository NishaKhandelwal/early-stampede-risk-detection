import cv2
import numpy as np
from ultralytics import YOLO

class DetectionService:
    def __init__(self, model_path="yolov8n.pt"):
        """
        Initializes the YOLOv8 model for person detection.
        """
        # This will download the yolov8n.pt weight automatically on first run
        self.model = YOLO(model_path)
        # Class index 0 corresponds to 'person' in the COCO dataset
        self.person_class_id = 0 

    def detect_people(self, frame: np.ndarray):
        """
        Processes a single frame to detect people.
        Returns:
            count (int): Number of people detected
            boxes (list): Bounding boxes [[x1, y1, x2, y2], ...]
            annotated_frame (np.ndarray): Frame with bounding boxes drawn
        """
        if frame is None:
            return 0, [], frame

        # Run inference (stream=True optimizes memory allocation for loops)
        results = self.model(frame, verbose=False)
        
        count = 0
        boxes = []
        annotated_frame = frame.copy()

        for result in results:
            for box in result.boxes:
                # Filter only 'person' class
                if int(box.cls[0]) == self.person_class_id:
                    count += 1
                    # Extract coordinates as integers
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    confidence = float(box.conf[0])
                    boxes.append([x1, y1, x2, y2])

                    # Draw bounding box on the frame
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(
                        annotated_frame, 
                        f"Person: {confidence:.2f}", 
                        (x1, max(15, y1 - 10)), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        0.5, 
                        (0, 255, 0), 
                        2
                    )

        # Draw total count directly onto the frame overhead
        cv2.putText(
            annotated_frame, 
            f"Live Count: {count}", 
            (20, 40), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1.0, 
            (0, 0, 255), 
            3
        )

        return count, boxes, annotated_frame