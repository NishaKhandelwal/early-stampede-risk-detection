"""
core/settings.py
Central configuration for the whole backend.
Author : Rishika

All paths, thresholds, and constants that other modules need
should be read from here, instead of being hardcoded in routes
or services. Keeps config in ONE place.
"""

import os

# ---------------------------------------------------------------
# Base paths
# ---------------------------------------------------------------

# backend/app/core/settings.py -> go up 3 levels to reach backend/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
DB_PATH = os.path.join(BASE_DIR, "app", "database", "stampede.db")

# Make sure folders exist at import time
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# ---------------------------------------------------------------
# Upload rules
# ---------------------------------------------------------------

ALLOWED_VIDEO_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png"}

MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200 MB upload limit

# ---------------------------------------------------------------
# Video processing
# ---------------------------------------------------------------

# When processing an uploaded video, we don't need to run YOLO on
# EVERY frame (too slow). Process every Nth frame instead.
FRAME_SAMPLE_RATE = 15

# ---------------------------------------------------------------
# Risk thresholds are owned by risk_service.py / density_service.py /
# motion_service.py (Nisha & Sonia's code) - we do NOT duplicate
# them here. This file only owns backend-wide/API-level config.
# ---------------------------------------------------------------

FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
FLASK_DEBUG = True
