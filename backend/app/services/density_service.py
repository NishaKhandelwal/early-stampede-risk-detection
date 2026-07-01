"""
---------------------------------------------------------
Annotation Service
---------------------------------------------------------
Author : Member 1

Responsibilities
----------------
✔ Draw bounding boxes
✔ Draw confidence scores
✔ Draw people count
✔ Draw density
✔ Draw FPS
✔ Draw timestamp
✔ Draw camera name

This service NEVER performs AI detection.
---------------------------------------------------------
"""

import cv2
from datetime import datetime


class AnnotationService:

    def __init__(self):
        self.green = (0, 255, 0)
        self.red = (0, 0, 255)
        self.yellow = (0, 255, 255)
        self.white = (255, 255, 255)
        self.black = (0, 0, 0)

        self.font = cv2.FONT_HERSHEY_SIMPLEX

    #########################################################

    def annotate_frame(
        self,
        frame,
        detections,
        people_count,
        density_level,
        density_score,
        fps=0,
        camera_name="CAM-01"
    ):
        """
        Draw all overlays on the frame.
        """

        annotated = frame.copy()

        # ---------------------------------------------------
        # Draw Bounding Boxes
        # ---------------------------------------------------

        for person in detections:

            x1, y1, x2, y2 = person["bbox"]

            confidence = person["confidence"]

            cv2.rectangle(
                annotated,
                (x1, y1),
                (x2, y2),
                self.green,
                2
            )

            label = f"Person {confidence:.2f}"

            cv2.putText(
                annotated,
                label,
                (x1, y1 - 10),
                self.font,
                0.5,
                self.green,
                2
            )

        # ---------------------------------------------------
        # Dashboard Panel
        # ---------------------------------------------------

        cv2.rectangle(
            annotated,
            (10, 10),
            (360, 180),
            self.black,
            -1
        )

        cv2.rectangle(
            annotated,
            (10, 10),
            (360, 180),
            self.green,
            2
        )

        cv2.putText(
            annotated,
            "EARLY STAMPEDE RISK DETECTION",
            (20, 35),
            self.font,
            0.6,
            self.green,
            2
        )

        cv2.putText(
            annotated,
            f"Camera : {camera_name}",
            (20, 65),
            self.font,
            0.5,
            self.white,
            1
        )

        cv2.putText(
            annotated,
            f"People : {people_count}",
            (20, 90),
            self.font,
            0.6,
            self.yellow,
            2
        )

        cv2.putText(
            annotated,
            f"Density : {density_level}",
            (20, 115),
            self.font,
            0.6,
            self.yellow,
            2
        )

        cv2.putText(
            annotated,
            f"Density Score : {density_score:.6f}",
            (20, 140),
            self.font,
            0.5,
            self.white,
            1
        )

        cv2.putText(
            annotated,
            f"FPS : {fps:.2f}",
            (20, 165),
            self.font,
            0.5,
            self.white,
            1
        )

        # ---------------------------------------------------
        # Timestamp
        # ---------------------------------------------------

        timestamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        cv2.putText(
            annotated,
            timestamp,
            (650, 30),
            self.font,
            0.6,
            self.green,
            2
        )

        return annotated