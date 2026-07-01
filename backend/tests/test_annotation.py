import cv2

from app.services.detection_service import DetectionService
from app.services.density_service import DensityService
from app.services.annotation_service import AnnotationService

detector = DetectionService()
density = DensityService()
annotator = AnnotationService()

frame = cv2.imread("datasets/sample_images/stamp.jpg")

result = detector.detect_people(frame)

density_score, density_level = density.calculate_density(
    result["people_count"],
    frame
)

output = annotator.annotate_frame(
    frame,
    result["detections"],
    result["people_count"],
    density_level,
    density_score,
    fps=30
)

cv2.imwrite("output.jpg", output)

print("Annotated image saved successfully!")