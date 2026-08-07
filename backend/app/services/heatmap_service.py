import cv2
import numpy as np


class CrowdHeatmap:
    def __init__(self, decay=0.96):
        """
        decay:
            Lower = fades faster
            Higher = stays longer
        """

        self.heatmap = None
        self.decay = decay

    def initialize(self, frame_shape):
        """
        Create empty heatmap matching frame size.
        """

        h, w = frame_shape[:2]

        self.heatmap = np.zeros((h, w), dtype=np.float32)

    def update(self, detections, frame_shape):
        """
        detections:
            list of YOLO person bounding boxes

            (x1, y1, x2, y2)
        """

        if self.heatmap is None:
            self.initialize(frame_shape)

        # Gradually fade old hotspots
        self.heatmap *= self.decay

        for (x1, y1, x2, y2) in detections:

            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            cv2.circle(
                self.heatmap,
                (cx, cy),
                35,
                1,
                -1
            )

    def overlay(self, frame):

        if self.heatmap is None:
            return frame

        blurred = cv2.GaussianBlur(
            self.heatmap,
            (0, 0),
            sigmaX=25
        )

        normalized = cv2.normalize(
            blurred,
            None,
            0,
            255,
            cv2.NORM_MINMAX
        )

        colored = cv2.applyColorMap(
            normalized.astype(np.uint8),
            cv2.COLORMAP_JET
        )

        return cv2.addWeighted(
            frame,
            0.75,
            colored,
            0.45,
            0
        )

    def reset(self):
        if self.heatmap is not None:
            self.heatmap.fill(0)