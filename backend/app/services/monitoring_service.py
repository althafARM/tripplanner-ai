import time
from threading import Lock
from datetime import datetime, timezone

# AI monitoring statistics
ai_stats = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "total_response_time": 0.0,
    "average_response_time": 0.0,
    "last_request_time": None
}

# Prevent simultaneous requests from corrupting statistics
stats_lock = Lock()


def start_ai_request():
    """Record the starting time of an AI request."""
    return time.time()


def record_ai_request(start_time, success=True):
    """Update AI request monitoring statistics."""

    response_time = time.time() - start_time

    with stats_lock:
        ai_stats["total_requests"] += 1

        if success:
            ai_stats["successful_requests"] += 1
        else:
            ai_stats["failed_requests"] += 1

        ai_stats["total_response_time"] += response_time

        ai_stats["average_response_time"] = (
            ai_stats["total_response_time"]
            / ai_stats["total_requests"]
        )

        ai_stats["last_request_time"] = datetime.now(
            timezone.utc
        ).isoformat()


def get_ai_stats():
    """Return current AI monitoring statistics."""

    with stats_lock:
        return {
            "total_requests": ai_stats["total_requests"],
            "successful_requests": ai_stats["successful_requests"],
            "failed_requests": ai_stats["failed_requests"],
            "average_response_time": round(
                ai_stats["average_response_time"], 2
            ),
            "last_request_time": ai_stats["last_request_time"]
        }