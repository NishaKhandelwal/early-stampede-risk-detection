"""
motion_service.py
Motion Analysis Module - Member: Sonia
Detects crowd motion intensity using Dense Optical Flow (Farneback method).

Pipeline:
Frame 1 -> Frame 2 -> Optical Flow -> Motion Vectors -> Motion Score -> Motion Level
"""

import cv2
import numpy as np


class MotionService:
    """
    Computes motion score and motion level between consecutive video frames
    using Dense Optical Flow (cv2.calcOpticalFlowFarneback).
    """

    def __init__(self, low_threshold=1.5, high_threshold=4.0):
        """
        Args:
            low_threshold (float): below this average magnitude -> LOW motion
            high_threshold (float): above this average magnitude -> HIGH motion
        """
        self.low_threshold = low_threshold
        self.high_threshold = high_threshold
        self.prev_gray = None  # used for continuous video/webcam/RTSP streams

    @staticmethod
    def _to_gray(frame):
        """Convert a BGR frame to grayscale (no-op if already grayscale)."""
        if len(frame.shape) == 3:
            return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return frame

    def reset(self):
        """Reset internal previous-frame state (e.g. when starting a new stream)."""
        self.prev_gray = None

    def compute_optical_flow(self, prev_frame, next_frame):
        """
        Compute dense optical flow between two frames.

        Args:
            prev_frame (np.ndarray): earlier frame (BGR or grayscale)
            next_frame (np.ndarray): later frame (BGR or grayscale)

        Returns:
            np.ndarray: flow field of shape (H, W, 2), each pixel holding (dx, dy)
        """
        prev_gray = self._to_gray(prev_frame)
        next_gray = self._to_gray(next_frame)

        flow = cv2.calcOpticalFlowFarneback(
            prev_gray, next_gray,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0
        )
        return flow

    def compute_motion_score(self, flow):
        """
        Reduce a flow field to a single motion score using the average
        magnitude of all pixel motion vectors.

        Args:
            flow (np.ndarray): output of compute_optical_flow

        Returns:
            float: motion score (higher = more motion)
        """
        magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        motion_score = float(np.mean(magnitude))
        return round(motion_score, 3)

    def classify_motion(self, motion_score):
        """
        Classify a motion score into LOW / MEDIUM / HIGH.

        Returns:
            str: "LOW", "MEDIUM", or "HIGH"
        """
        if motion_score < self.low_threshold:
            return "LOW"
        elif motion_score < self.high_threshold:
            return "MEDIUM"
        else:
            return "HIGH"

    def analyze_frame_pair(self, prev_frame, next_frame):
        """
        Full pipeline for two explicit frames: flow -> score -> level.

        Returns:
            dict: {"motion_score": float, "motion_level": str}
        """
        flow = self.compute_optical_flow(prev_frame, next_frame)
        score = self.compute_motion_score(flow)
        level = self.classify_motion(score)
        return {"motion_score": score, "motion_level": level}

    def analyze_stream_frame(self, frame):
        """
        Convenience method for live video/webcam/RTSP streams: keeps track
        of the previous frame internally so the caller just passes frames
        one at a time as they arrive.

        Returns:
            dict or None: {"motion_score": float, "motion_level": str},
                          or None on the very first frame (no previous
                          frame exists yet to compare against)
        """
        gray = self._to_gray(frame)

        if self.prev_gray is None:
            self.prev_gray = gray
            return None

        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray, gray,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0
        )
        score = self.compute_motion_score(flow)
        level = self.classify_motion(score)

        self.prev_gray = gray
        return {"motion_score": score, "motion_level": level}


def draw_motion_overlay(frame, flow, step=16):
    """
    Optional visualization helper: draws sparse motion vector arrows on a
    frame for debugging/demo purposes.

    Args:
        frame (np.ndarray): the frame to draw on (BGR)
        flow (np.ndarray): optical flow array from compute_optical_flow
        step (int): pixel spacing between drawn arrows

    Returns:
        np.ndarray: a copy of frame with motion vectors drawn on it
    """
    h, w = frame.shape[:2]
    output = frame.copy()

    for y in range(0, h, step):
        for x in range(0, w, step):
            dx, dy = flow[y, x]
            end_point = (int(x + dx), int(y + dy))
            cv2.arrowedLine(output, (x, y), end_point, (0, 255, 0), 1, tipLength=0.3)

    return output


if __name__ == "__main__":
    # Quick manual test: run against a video file, or webcam if no path given
    import sys

    source = sys.argv[1] if len(sys.argv) > 1 else 0  # 0 = default webcam
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print("Error: could not open video source:", source)
        sys.exit(1)

    motion_service = MotionService()
    print("Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        result = motion_service.analyze_stream_frame(frame)

        if result is not None:
            text = f"Motion: {result['motion_level']} ({result['motion_score']})"
            cv2.putText(frame, text, (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        cv2.imshow("Motion Analysis", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
