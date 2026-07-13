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
    """Call this once at app startup to create tables if they don't exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            message TEXT,
            people_count INTEGER,
            density_level TEXT,
            motion_level TEXT,
            timestamp TEXT NOT NULL
        )
    """)

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

    conn.commit()
    conn.close()


# ---------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------

def save_alert(camera_id, risk_level, message, people_count, density_level, motion_level):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO alerts (camera_id, risk_level, message, people_count,
                             density_level, motion_level, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        camera_id, risk_level, message, people_count,
        density_level, motion_level, datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()


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
    Returns raw recent snapshots plus simple aggregates
    (avg people count, risk-level breakdown) for dashboards/charts.
    """
    conn = get_connection()
    cur = conn.cursor()

    if camera_id:
        cur.execute("""
            SELECT * FROM analytics WHERE camera_id = ?
            ORDER BY id DESC LIMIT ?
        """, (camera_id, limit))
    else:
        cur.execute("""
            SELECT * FROM analytics ORDER BY id DESC LIMIT ?
        """, (limit,))

    rows = [dict(row) for row in cur.fetchall()]
    conn.close()

    if not rows:
        return {
            "snapshots": [],
            "avg_people_count": 0,
            "max_people_count": 0,
            "risk_breakdown": {"NORMAL": 0, "WARNING": 0, "HIGH RISK": 0},
        }

    people_counts = [r["people_count"] for r in rows if r["people_count"] is not None]
    risk_breakdown = {"NORMAL": 0, "WARNING": 0, "HIGH RISK": 0}
    for r in rows:
        if r["risk_level"] in risk_breakdown:
            risk_breakdown[r["risk_level"]] += 1

    return {
        "snapshots": rows,
        "avg_people_count": round(sum(people_counts) / len(people_counts), 2) if people_counts else 0,
        "max_people_count": max(people_counts) if people_counts else 0,
        "risk_breakdown": risk_breakdown,
    }
