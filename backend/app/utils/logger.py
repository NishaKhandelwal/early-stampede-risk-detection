"""
utils/logger.py
Simple shared logger so every module prints consistent, readable logs
instead of scattered print() statements.
Author : Rishika
"""

import logging
import sys


def get_logger(name="stampede"):
    logger = logging.getLogger(name)

    if not logger.handlers:  # avoid duplicate handlers on reload
        logger.setLevel(logging.INFO)

        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
