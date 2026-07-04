# 🚨 Early Stampede Risk Detection System

> AI-powered crowd monitoring and early stampede risk detection using Computer Vision and CCTV surveillance.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-red)
![OpenCV](https://img.shields.io/badge/OpenCV-ComputerVision-green)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Project Overview

The **Early Stampede Risk Detection System** is an AI-powered surveillance prototype designed to detect potentially dangerous crowd conditions from CCTV cameras or uploaded video feeds.

Instead of identifying individuals, the system analyzes **crowd-level behavior** by estimating crowd density and movement patterns. The goal is to provide an **early warning system** that assists authorities in making timely decisions during large public gatherings.

This project is developed as an **Engineering Final Year Project** and demonstrates the feasibility of real-time crowd analytics using Computer Vision.

---

# 🎯 Objectives

- Detect people from CCTV/video streams
- Count the number of people
- Estimate crowd density
- Analyze crowd movement
- Detect abnormal crowd behavior
- Generate early stampede risk alerts
- Display live monitoring through a dashboard

---

# 🏗 System Architecture

```
               CCTV Camera
                     │
                     ▼
          Frame Extraction (OpenCV)
                     │
                     ▼
         YOLOv8 Person Detection
                     │
                     ▼
            Crowd Counting
                     │
                     ▼
         Crowd Density Estimation
                     │
                     ▼
       Optical Flow Motion Analysis
                     │
                     ▼
         Rule-Based Risk Assessment
                     │
                     ▼
            Flask Backend API
                     │
                     ▼
        Live Monitoring Dashboard
```

---

# ✨ Features

## AI Detection

- YOLOv8 Person Detection
- Bounding Box Annotation
- Confidence Filtering
- Crowd Counting

## Crowd Analytics

- Crowd Density Estimation
- Frame Statistics
- Live Metrics
- Density Classification

## Motion Analysis

- Optical Flow
- Crowd Motion Detection
- Panic Movement Detection
- Motion Scoring

## Risk Assessment

- SAFE
- WARNING
- HIGH RISK

using rule-based decision logic.

## Dashboard

- Live Video Feed
- Crowd Count
- Density Level
- Motion Score
- Alert Status
- Analytics

---

# 🛠 Technology Stack

## Backend

- Python
- Flask
- OpenCV
- YOLOv8 (Ultralytics)
- NumPy

## Frontend

- HTML
- CSS
- JavaScript
- React (Dashboard)

## AI Models

- YOLOv8 Nano (Pretrained)
- COCO Dataset

---

# 📂 Project Structure

```
early-stampede-risk-detection/
│
├── README.md
├── requirements.txt
├── backend/
│
│   ├── app/
│   │
│   ├── api/
│   ├── services/
│   ├── streaming/
│   ├── database/
│   ├── utils/
│   ├── models/
│   └── core/
│
├── frontend/
│
├── datasets/
│
├── notebooks/
│
├── docs/
│
└── screenshots/
```

---

# 👥 Team Structure

## Nisha – AI Detection Module

Responsible for:

- YOLOv8 Integration
- Person Detection
- Crowd Counting
- Density Estimation
- Frame Annotation
- Video Detection Pipeline

Files

```
detection_service.py
density_service.py
annotation_service.py
video_detection_service.py
statistics_service.py
logger_service.py
```

---

## Sonia – Motion Analysis

Responsible for:

- Optical Flow
- Crowd Motion Analysis
- Panic Detection
- Risk Classification

Files

```
motion_service.py
risk_service.py
```

---

## Rishika – Backend Development

Responsible for:

- Flask APIs
- Video Processing
- CCTV Integration
- Database
- Streaming

---

## Srutilekha – Frontend Dashboard

Responsible for:

- Dashboard UI
- Live Monitoring
- Alerts
- Analytics
- Frontend Integration

---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/your-username/early-stampede-risk-detection.git

cd early-stampede-risk-detection
```

Create virtual environment

Windows

```bash
python -m venv venv

venv\Scripts\activate
```

Linux

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# ▶ Running the Backend

```bash
cd backend

python app/main.py
```

---

# ▶ Running the Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📷 Input Sources

The system supports

- Sample Images
- Uploaded Videos
- Webcam
- RTSP Camera Streams
- CCTV Cameras

---

# 📊 Output

The system provides

- Annotated Video
- Person Count
- Crowd Density
- Motion Score
- Risk Level
- Live Dashboard

---

# 🚦 Risk Levels

| Density | Motion | Alert |
|----------|---------|--------|
| Low | Stable | SAFE |
| Medium | Moderate | WARNING |
| High | Chaotic | HIGH RISK |

---

# 🔒 Privacy & Ethics

This project follows privacy-preserving principles.

✔ No facial recognition

✔ No identity tracking

✔ No personal information collection

✔ Crowd-level analysis only

The system acts as a **decision-support tool** and does not replace human judgment.

---

# 📈 Future Enhancements

- Multi-Camera Monitoring
- Heatmaps
- Person Tracking (ByteTrack)
- Emotion Analysis (Optional DeepFace)
- SMS / Email Alerts
- Mobile Application
- Cloud Deployment
- Predictive AI Models

---

# 📚 Documentation

Project documentation can be found inside

```
docs/
```

including

- Architecture
- API Documentation
- Deployment Guide
- Setup Guide

---

# 📸 Screenshots

Project screenshots will be added inside

```
screenshots/
```

---

# 🤝 Contributing

Each team member works on an independent Git branch.

```
main

ai-detection

motion-analysis

backend-api

frontend-dashboard
```

Please create a Pull Request before merging into the main branch.

---

# 📄 License

This project is developed for educational and research purposes.

MIT License.

---

# ⭐ Acknowledgements

- Ultralytics YOLOv8
- OpenCV
- Flask
- React
- COCO Dataset
- Python Community

---

# 📬 Contact

Engineering Final Year Project

**Early Stampede Risk Detection System**

For questions or contributions, please create an Issue or Pull Request on GitHub.
