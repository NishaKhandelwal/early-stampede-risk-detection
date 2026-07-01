import cv2

from app.services.detection_service import DetectionService


detector = DetectionService()

image = cv2.imread("datasets/sample_images/stamp.jpg")

result = detector.detect_people(image)

print(result)