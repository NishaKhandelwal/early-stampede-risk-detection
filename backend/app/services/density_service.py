"""
---------------------------------------------------------
Density Service
---------------------------------------------------------
Author : Nisha

Purpose
-------
Calculates crowd density based on the number of detected
people and the frame area.

Responsibilities
----------------
✔ Count detected people
✔ Calculate density score
✔ Classify density level
✔ Return structured results

This service DOES NOT perform object detection.
It only analyzes detection results.
---------------------------------------------------------
"""


class DensityService:
    """
    Service responsible for estimating crowd density.
    """

    def __init__(self):
        """
        Initialize density thresholds.
        """

        self.low_threshold = 0.10
        self.medium_threshold = 0.30

    ##########################################################

    def calculate_density(self, detections, frame_shape):
        """
        Calculate crowd density.

        Parameters
        ----------
        detections : list
            List of detected people.

        frame_shape : tuple
            Frame shape from OpenCV image.

        Returns
        -------
        dict
            Density information.
        """

        height, width = frame_shape[:2]

        frame_area = width * height

        people_count = len(detections)

        if frame_area == 0:
            density_score = 0.0
        else:
            density_score = people_count / frame_area

        density_level = self._classify_density(density_score)

        return {
            "people_count": people_count,
            "density_score": density_score,
            "density_level": density_level
        }

    ##########################################################

    def _classify_density(self, density_score):
        """
        Convert density score into a human-readable label.
        """

        if density_score < self.low_threshold:
            return "LOW"

        elif density_score < self.medium_threshold:
            return "MEDIUM"

        return "HIGH"