"""
database/db.py
Author : Rishika

Lightweight SQLite storage - no ORM, just plain sqlite3, so it's
easy to understand and needs zero extra setup (no separate DB server).

Two tables:
    alerts     - one row per WARNING/HIGH RISK moment detected
    analytics  - one row per processed frame (for trend charts)
"""

import sqlite3
import json
from datetime import datetime

from app.core.settings import DB_PATH


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Call this once at app startup to create/update tables."""
    conn = get_connection()
    cur = conn.cursor()

    # -----------------------------------------------------------
    # Alerts
    # -----------------------------------------------------------

    cur.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            message TEXT,
            people_count INTEGER,
            density_level TEXT,
            motion_level TEXT,
            timestamp TEXT NOT NULL,
            acknowledged INTEGER NOT NULL DEFAULT 0
        )
    """)

    # -----------------------------------------------------------
    # Analytics
    # -----------------------------------------------------------

    cur.execute("""
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id TEXT NOT NULL,
            people_count INTEGER,
            density_score REAL,
            density_level TEXT,
            motion_score REAL,
            motion_level TEXT,
            risk_level TEXT,
            timestamp TEXT NOT NULL
        )
    """)

    # -----------------------------------------------------------
    # Existing database compatibility
    # -----------------------------------------------------------
    # If the alerts table already existed before the
    # acknowledged column was introduced, add it safely.

    cur.execute("PRAGMA table_info(alerts)")
    alert_columns = [row["name"] for row in cur.fetchall()]

    if "acknowledged" not in alert_columns:
        cur.execute("""
            ALTER TABLE alerts
            ADD COLUMN acknowledged INTEGER NOT NULL DEFAULT 0
        """)

    conn.commit()
    conn.close()

# ---------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------

def save_alert(
    camera_id,
    risk_level,
    message,
    people_count,
    density_level,
    motion_level
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO alerts (
            camera_id,
            risk_level,
            message,
            people_count,
            density_level,
            motion_level,
            timestamp,
            acknowledged
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        camera_id,
        risk_level,
        message,
        people_count,
        density_level,
        motion_level,
        datetime.now().isoformat(),
        0
    ))

    alert_id = cur.lastrowid

    conn.commit()
    conn.close()

    return alert_id


def get_alerts(limit=50, risk_level=None):
    conn = get_connection()
    cur = conn.cursor()

    if risk_level:
        cur.execute("""
            SELECT * FROM alerts WHERE risk_level = ?
            ORDER BY id DESC LIMIT ?
        """, (risk_level, limit))
    else:
        cur.execute("""
            SELECT * FROM alerts ORDER BY id DESC LIMIT ?
        """, (limit,))

    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows


# ---------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------

def save_analytics_snapshot(camera_id, people_count, density_score, density_level,
                             motion_score, motion_level, risk_level):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO analytics (camera_id, people_count, density_score, density_level,
                                motion_score, motion_level, risk_level, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        camera_id, people_count, density_score, density_level,
        motion_score, motion_level, risk_level, datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()


def get_analytics_summary(camera_id=None, limit=200):
    """
    Returns analytics in a frontend-friendly format.

    Includes:
    - Raw snapshots
    - Crowd trend
    - Density trend
    - Motion trend
    - Risk timeline
    - Summary statistics
    """

    conn = get_connection()
    cur = conn.cursor()

    if camera_id:
        cur.execute("""
            SELECT *
            FROM analytics
            WHERE camera_id = ?
            ORDER BY id DESC
            LIMIT ?
        """, (camera_id, limit))
    else:
        cur.execute("""
            SELECT *
            FROM analytics
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))

    # Reverse so frontend receives oldest -> newest.
    rows = [dict(row) for row in cur.fetchall()]
    rows.reverse()

    conn.close()

    if not rows:
        return {
            "snapshots": [],
            "people_history": [],
            "density_history": [],
            "motion_history": [],
            "risk_timeline": [],
            "summary": {
                "avg_people": 0,
                "max_people": 0,
                "avg_density": 0,
                "avg_motion": 0,
            },
            "risk_breakdown": {
                "NORMAL": 0,
                "WARNING": 0,
                "HIGH RISK": 0,
            }
        }

    people_history = []
    density_history = []
    motion_history = []
    risk_timeline = []

    risk_breakdown = {
        "NORMAL": 0,
        "WARNING": 0,
        "HIGH RISK": 0,
    }

    people_values = []
    density_values = []
    motion_values = []

    for row in rows:

        timestamp = row["timestamp"]

        people = row["people_count"] or 0
        density = row["density_score"] or 0
        motion = row["motion_score"] or 0
        risk = row["risk_level"]

        people_values.append(people)
        density_values.append(density)
        motion_values.append(motion)

        people_history.append({
            "time": timestamp,
            "value": people
        })

        density_history.append({
            "time": timestamp,
            "value": round(density, 3)
        })

        motion_history.append({
            "time": timestamp,
            "value": round(motion, 3)
        })

        risk_timeline.append({
            "time": timestamp,
            "risk": risk
        })

        if risk in risk_breakdown:
            risk_breakdown[risk] += 1

    return {
        "snapshots": rows,

        "people_history": people_history,

        "density_history": density_history,

        "motion_history": motion_history,

        "risk_timeline": risk_timeline,

        "summary": {
            "avg_people": round(
                sum(people_values) / len(people_values),
                2
            ),

            "max_people": max(people_values),

            "avg_density": round(
                sum(density_values) / len(density_values),
                3
            ),

            "avg_motion": round(
                sum(motion_values) / len(motion_values),
                3
            ),
        },

        "risk_breakdown": risk_breakdown
    }
def acknowledge_alert(alert_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE alerts
        SET acknowledged = 1
        WHERE id = ?
    """, (alert_id,))

    updated = cur.rowcount

    conn.commit()
    conn.close()

    return updated > 0


def acknowledge_all_alerts():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE alerts
        SET acknowledged = 1
        WHERE acknowledged = 0
    """)

    updated = cur.rowcount

    conn.commit()
    conn.close()

    return updated