import cv2

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("❌ Webcam could not be opened")
    exit()

print("✅ Webcam opened successfully")

while True:

    ret, frame = cap.read()

    if not ret:
        print("❌ Could not read frame")
        break

    cv2.imshow("CAM-FRONT Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()