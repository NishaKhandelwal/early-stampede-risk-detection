"""
utils/config.py
Small file/upload helper functions.
Author : Rishika
"""

import os
import uuid

from app.core.settings import (
    ALLOWED_VIDEO_EXTENSIONS,
    ALLOWED_IMAGE_EXTENSIONS,
    UPLOAD_FOLDER,
)


def allowed_video_file(filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_VIDEO_EXTENSIONS


def allowed_image_file(filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_IMAGE_EXTENSIONS


def save_uploaded_file(file_storage, original_filename):
    """
    Saves a Flask FileStorage object to UPLOAD_FOLDER with a unique
    filename (so two people uploading "video.mp4" don't collide).

    Returns the full saved path.
    """
    ext = original_filename.rsplit(".", 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, unique_name)
    file_storage.save(save_path)
    return save_path
