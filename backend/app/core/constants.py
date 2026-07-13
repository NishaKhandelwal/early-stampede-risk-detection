"""
core/constants.py
Shared string/constant values used across the backend.
Author : Rishika
"""

# Risk levels (must match risk_service.py's RiskService constants)
RISK_HIGH = "HIGH RISK"
RISK_WARNING = "WARNING"
RISK_NORMAL = "NORMAL"

# Only alerts at/above this risk level get stored in the alerts table
ALERTABLE_RISK_LEVELS = {RISK_WARNING, RISK_HIGH}

# Camera source types
SOURCE_VIDEO = "video"
SOURCE_RTSP = "rtsp"
SOURCE_WEBCAM = "webcam"
