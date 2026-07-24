from flask import Blueprint, send_from_directory
from app.core.settings import OUTPUT_FOLDER

files_bp = Blueprint("files_bp", __name__)


@files_bp.route("/outputs/<filename>")
def get_output_video(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)