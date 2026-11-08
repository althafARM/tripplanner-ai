import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Create logs directory inside the backend folder
BASE_DIR = Path(__file__).resolve().parents[2]
LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "app.log"

# Configure application logger
logger = logging.getLogger("tripplanner")
logger.setLevel(logging.INFO)

# Prevent duplicate handlers
if not logger.handlers:

    handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8"
    )

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )

    handler.setFormatter(formatter)

    logger.addHandler(handler)


def log_info(message):
    logger.info(message)


def log_error(message):
    logger.error(message)


def log_warning(message):
    logger.warning(message)