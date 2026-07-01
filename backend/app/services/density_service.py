import numpy as np

class DensityService:
    def __init__(self, low_threshold=0.00002, high_threshold=0.00007):
        """
        Handles density classification based on bounded pixel dimensions.
        Threshold metrics default to standard video aspect ratio scaling.
        """
        self.low_threshold = low_threshold
        self.high_threshold = high_threshold

    def calculate_density(self, people_count: int, frame: np.ndarray):
        """
        Calculates normalized area density and tags safety parameters.
        Returns:
            density_score (float): calculated metrics
            density_level (str): LOW, MEDIUM, or HIGH
        """
        if frame is None or frame.size == 0:
            return 0.0, "LOW"

        # Obtain total frame pixel real estate area
        height, width, _ = frame.shape
        frame_area = height * width

        # Calculate raw density score
        density_score = people_count / frame_area

        # Rule-Based Classification Logic
        if density_score <= self.low_threshold:
            density_level = "LOW"
        elif density_score <= self.high_threshold:
            density_level = "MEDIUM"
        else:
            density_level = "HIGH"

        return float(density_score), density_level