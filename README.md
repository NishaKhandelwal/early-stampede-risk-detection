# 🚨 Early Stampede Risk Detection System

> AI-powered crowd monitoring and early stampede risk detection using computer vision on CCTV, webcam and uploaded video.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-red)
![OpenCV](https://img.shields.io/badge/OpenCV-ComputerVision-green)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![SQLite](https://img.shields.io/badge/SQLite-Storage-003B57)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Overview

The **Early Stampede Risk Detection System** is a surveillance prototype that analyses **crowd-level behaviour** from CCTV (RTSP), webcams or uploaded videos. It does not identify individuals. It estimates how crowded a scene is and how fast the crowd is moving, combines the two into a risk level, and alerts operators in real time.

It is a **decision-support tool**, not a stampede predictor. Risk levels are indicators that help authorities react earlier; they do not replace human judgement.

Developed as an Engineering Final Year Project (Project-2).

---

## 🎯 Objectives

- Detect and count people in video streams
- Estimate crowd density independent of video resolution
- Measure crowd motion intensity with dense optical flow
- Combine density and motion into a NORMAL / WARNING / HIGH RISK level
- Push alerts to a live dashboard with on-screen, siren and voice notifications
- Store alerts and analytics history for later review
- Manage multiple cameras from a single interface

---

## 🏗 System Architecture

```mermaid
flowchart TD
    A[Source: RTSP / Webcam / Uploaded video] --> B[Frame sampling - OpenCV]
    B --> C[YOLOv8n person detection]
    C --> D[Density: people per megapixel]
    B --> E[Motion: Farneback optical flow]
    D --> F[Rule-based risk assessment]
    E --> F
    F --> G[Alert logic: cooldown + escalation]
    G --> H[(SQLite: alerts + analytics)]
    G --> I[Flask-SocketIO /dashboard]
    I --> J[React dashboard]
```

The pipeline is chained in `backend/app/utils/helpers.py` (`run_pipeline_on_frame`). The YOLO model is loaded once and shared, while motion state is kept **per camera** so frames from different cameras are never compared with each other.

---

## ✨ Features

**Detection and analytics**
- YOLOv8n person detection (COCO, confidence ≥ 0.50) with bounding-box annotation
- People count and density in people per megapixel
- Dense optical-flow motion score (Farneback)
- Rolling history (last 30 processed frames) for dashboard graphs

**Risk and alerting**
- Transparent rule-based risk levels
- Per-camera alert state: 30 s cooldown for repeated alerts, immediate alert when the risk level changes
- Alerts saved to SQLite, pushed over WebSocket, and acknowledgeable from the UI
- Browser siren and text-to-speech announcements

**Streaming and cameras**
- Register, start, stop and remove cameras at runtime (RTSP, webcam, video file)
- One background thread per camera with automatic reconnect for dropped streams
- Video upload that returns an annotated output video and a summary

**Dashboard (React)**
- Dashboard: live annotated feed, crowd metrics, risk status, motion pulse, alert log, camera overview
- Live Monitoring: grid of running cameras
- Alerts: history plus live alerts, acknowledge and acknowledge-all
- Analytics: crowd, density, motion and risk trends per camera
- Camera Management: register and control cameras

---

## 🚦 Risk Assessment

Density and motion are each classified LOW / MEDIUM / HIGH, then combined:

| Density | Motion | Risk level |
|---------|--------|------------|
| HIGH | HIGH | **HIGH RISK** |
| MEDIUM or higher | MEDIUM or higher | **WARNING** |
| anything else | | **NORMAL** |

Default thresholds (tune per camera view):

| Metric | LOW | MEDIUM | HIGH |
|--------|-----|--------|------|
| Density (people per megapixel) | < 10 | 10 to < 25 | ≥ 25 |
| Motion (mean optical-flow magnitude) | < 1.5 | 1.5 to < 4.0 | ≥ 4.0 |

Only WARNING and HIGH RISK are stored as alerts. The first frame of any stream has no motion value, so no risk is computed for it.

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Flask, Flask-SocketIO, Flask-CORS |
| Computer vision | OpenCV (headless), Ultralytics YOLOv8n, NumPy |
| Storage | SQLite (WAL mode) |
| Frontend | React, Vite, Axios, Socket.IO client, lucide-react |
| Model | YOLOv8 Nano pretrained on COCO |

---

## 📂 Project Structure

```
early-stampede-risk-detection/
├── README.md
├── requirements.txt
├── backend/
│   ├── app/
│   │   ├── main.py              # Flask app + Socket.IO entrypoint
│   │   ├── api/                 # routes_detection, routes_stream, routes_alerts,
│   │   │                        # routes_analytics, routes_files
│   │   ├── core/                # settings.py, constants.py
│   │   ├── database/            # db.py (SQLite helpers)
│   │   ├── models/              # camera_model.py
│   │   ├── services/            # detection, density, motion, risk, annotation,
│   │   │                        # stream_service, websocket_service, heatmap_service
│   │   ├── streaming/           # rtsp_handler, webcam_handler, frame_processor
│   │   └── utils/               # helpers (pipeline), config, logger, dashboard_payload
│   ├── tests/
│   ├── uploads/                 # created at runtime
│   └── outputs/                 # processed videos, created at runtime
├── frontend/
│   └── src/
│       ├── pages/               # Dashboard, LiveMonitoring, Alerts, Analytics, CameraManagement
│       ├── components/          # Sidebar, CameraCard, LiveFeedViewer, UploadPanel
│       ├── analytics/           # AnalyticsCharts
│       ├── context/             # AlertContext (WebSocket state)
│       └── services/            # api, cameraService, analyticsService, websocket,
│                                # risk, voiceAlerts
├── datasets/
├── docs/
└── screenshots/
```

---

## ⚙ Installation

**Prerequisites:** Python 3.11, Node.js 18+, and a working internet connection on first run (YOLOv8n weights are downloaded automatically).

```bash
git clone https://github.com/your-username/early-stampede-risk-detection.git
cd early-stampede-risk-detection
```

Create and activate a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies

```bash
pip install -r requirements.txt
```

### Run the backend

```bash
cd backend
python app/main.py
```

The API and WebSocket server start on **http://localhost:5000**.

### Run the frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Then:

```bash
cd frontend
npm install
npm run dev
```

> The WebSocket URL is currently set directly in `frontend/src/services/websocket.js` (`http://localhost:5000/dashboard`). Change it there if the backend runs elsewhere.

---

## 📷 Input Sources

| Source | `source_type` | `source_url` example |
|--------|---------------|----------------------|
| RTSP / IP camera | `rtsp` | `rtsp://user:pass@192.168.1.10:554/stream` |
| Local webcam | `webcam` | `0` (device index) |
| Video file | `video` | `path/to/video.mp4` |
| Uploaded video | n/a | via `POST /upload-video` |
| Single image | n/a | via `POST /process-frame` |

Uploads accept mp4, avi, mov and mkv up to 200 MB. Images accept jpg, jpeg and png.

---

## 🔌 API Reference

### REST

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/upload-video` | Upload a video (`video`, optional `camera_id`), run the full pipeline, return a summary and processed-video URL |
| POST | `/process-frame` | Process one image (`frame`, optional `camera_id`, `annotate`) |
| POST | `/stream/register` | Register a camera (not started) |
| POST | `/stream/start` | Start a registered camera |
| POST | `/stream/stop` | Stop a running camera |
| GET | `/stream/status` | List cameras and stream summary |
| GET | `/stream/status/<camera_id>` | Status of one camera |
| DELETE | `/stream/<camera_id>` | Remove a stopped camera |
| GET | `/alerts` | Alert history (`limit`, `risk_level`) |
| POST | `/alerts/<id>/acknowledge` | Acknowledge one alert |
| POST | `/alerts/acknowledge-all` | Acknowledge all alerts |
| POST | `/test-alert` | Create a demo alert (`?risk_level=WARNING` or `HIGH RISK`) |
| GET | `/analytics` | Analytics history and summary (`camera_id`, `limit` up to 1000) |
| GET | `/outputs/<filename>` | Download a processed video |

Example: register and start a webcam

```bash
curl -X POST http://localhost:5000/stream/register \
  -H "Content-Type: application/json" \
  -d '{"camera_id":"CAM-FRONT","source_url":0,"source_type":"webcam","process_every_n":3}'

curl -X POST http://localhost:5000/stream/start \
  -H "Content-Type: application/json" \
  -d '{"camera_id":"CAM-FRONT"}'
```

### WebSocket (Socket.IO, namespace `/dashboard`)

| Event | Payload |
|-------|---------|
| `dashboard_update` | Latest metrics and history for a camera |
| `live_frame` | `camera_id` and base64 JPEG of the annotated frame |
| `new_alert` | Newly created alert |
| `processing_complete` | A video source has finished |

---

## ⚙ Configuration

| Setting | Location | Default |
|---------|----------|---------|
| Frame sample rate for uploaded videos | `backend/app/core/settings.py` (`FRAME_SAMPLE_RATE`) | every 15th frame |
| Frames processed per camera stream | `process_every_n` when registering | every 3rd frame |
| Upload size limit | `settings.py` (`MAX_CONTENT_LENGTH`) | 200 MB |
| Alert cooldown | `streaming/frame_processor.py` (`ALERT_COOLDOWN_SECONDS`) | 30 s |
| Detection confidence | `services/detection_service.py` | 0.50 |
| Density thresholds | `services/density_service.py` | 10 / 25 |
| Motion thresholds | `services/motion_service.py` | 1.5 / 4.0 |
| Database file | `settings.py` (`DB_PATH`) | `backend/app/database/stampede.db` |

---

## 🧪 Testing and Results

Functional testing used 80 processing runs between 24 July and 19 September 2026 on a laptop (Intel i5-12450HX, 16 GB RAM, Windows), covering uploads, webcam, RTSP and video-file cameras. The densest test footage showed 13 to 27 people per frame.

No labelled dataset was used, so **accuracy, false-alert rate and missed-event rate have not been measured**. See Limitations.

Manual test scripts are in `backend/tests/` (for example `test_detection.py` and `test_annotation.py`). Note that `backend/test_webcam.py` uses `cv2.imshow`, which needs the non-headless `opencv-python` package rather than `opencv-python-headless`.

---

## ⚠ Limitations

- No quantitative validation against ground-truth counts or labelled risk events
- Density is measured in image space, so camera angle and perspective affect it
- Thresholds are manual and need calibration for each camera view
- The motion score is a global average; it cannot separate crowd movement from vehicles or camera shake, and it depends on the frame-sampling interval
- YOLOv8n can miss small, distant or heavily occluded people
- A dense but stationary crowd (HIGH density, LOW motion) is classified NORMAL
- Risk is evaluated per frame with no temporal smoothing
- The camera registry is in memory and resets when the backend restarts
- No authentication, and CORS is open (prototype only)
- Webcam capture uses `CAP_DSHOW`, which is Windows-specific
- Alert cooldown applies to registered camera streams, not to uploaded-video processing
- Concurrent inference across many cameras has not been load-tested
- `heatmap_service.py` exists but is not yet part of the pipeline

---

## 🔒 Privacy and Ethics

- No facial recognition
- No identity tracking
- No personal information collected
- Crowd-level analysis only

The system supports human operators and does not replace them.

---

## 📈 Future Work

- Calibrate thresholds and evaluate on public crowd datasets (UMN, PETS2009, UCSD, ShanghaiTech) with MAE for counting and precision, recall and F1 for risk
- Flow direction, divergence and turbulence analysis
- Temporal smoothing, then LSTM or GRU risk models compared against the rule baseline
- Person tracking (ByteTrack)
- Heatmap overlay integration
- Perspective-aware density zones and per-zone risk
- Persistent camera registry, authentication and role-based access
- SMS and email alerts, mobile app
- Edge deployment (Jetson, Raspberry Pi) and cloud deployment

---

## 👥 Team

| Member | Responsibility |
|--------|----------------|
| **Nisha** | AI detection: YOLOv8 integration, person detection, density estimation, annotation, stream service |
| **Sonia** | Motion analysis: optical flow, motion scoring, risk classification |
| **Rishika** | Backend: Flask APIs, database, streaming, WebSocket service, pipeline integration |
| **Srutilekha** | Frontend dashboard: live monitoring, alerts, analytics, camera management |

---

## 🤝 Contributing

Each team member works on an independent branch.

```
main
ai-detection
motion-analysis
backend-api
frontend-dashboard
```

Open a Pull Request before merging into `main`.

---

## 📄 License

Developed for educational and research purposes under the MIT License.

---

## ⭐ Acknowledgements

- Ultralytics YOLOv8
- OpenCV
- Flask and Flask-SocketIO
- React and Vite
- COCO Dataset

---

## 📬 Contact

Engineering Final Year Project: **Early Stampede Risk Detection System**

For questions or contributions, please open an Issue or Pull Request on GitHub.