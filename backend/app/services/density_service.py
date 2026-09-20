"""
---------------------------------------------------------
Density Service
---------------------------------------------------------
Author : Nisha

Density is measured in PEOPLE PER MEGAPIXEL (1 MP = 1,000,000 px).
This makes the score independent of video resolution.

Example (1280x720 = 0.92 MP):
    8 people  -> ~8.7   -> LOW
    15 people -> ~16.3  -> MEDIUM
    30 people -> ~32.6  -> HIGH

Tune low_threshold / medium_threshold for your camera view.
---------------------------------------------------------
"""


class DensityService:

    def __init__(self, low_threshold=10.0, medium_threshold=25.0):
        self.low_threshold = low_threshold
        self.medium_threshold = medium_threshold

    def calculate_density(self, detections, frame_shape):
        height, width = frame_shape[:2]

        frame_area = width * height
        people_count = len(detections)

        if frame_area == 0:
            density_score = 0.0
        else:
            density_score = people_count / (frame_area / 1_000_000)

        density_score = round(density_score, 2)

        return {
            "people_count": people_count,
            "density_score": density_score,
            "density_level": self._classify_density(density_score),
        }

    def _classify_density(self, density_score):
        if density_score < self.low_threshold:
            return "LOW"
        elif density_score < self.medium_threshold:
            return "MEDIUM"
        return "HIGH"