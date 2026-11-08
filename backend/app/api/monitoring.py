import psutil
from app.database.connection import check_db_connection
import time
from app.services.monitoring_service import get_ai_stats
from fastapi import APIRouter, Depends
from app.services.admin_auth_service import require_admin
from pathlib import Path
from app.services.logging_service import LOG_FILE

router = APIRouter(
    prefix="/api/monitoring",
    tags=["System Monitoring"],
    dependencies=[Depends(require_admin)]
)

# Record when the monitoring module starts
start_time = time.time()


@router.get("/system")
async def get_system_status():

    # CPU usage
    cpu_usage = psutil.cpu_percent(interval=0.5)

    # RAM usage
    memory = psutil.virtual_memory()

    # Disk usage
    disk = psutil.disk_usage("/")

    # System uptime since this application started
    uptime = time.time() - start_time

    return {
        "status": "healthy",
        "cpu": {
            "usage_percent": cpu_usage
        },
        "memory": {
            "total_gb": round(memory.total / (1024 ** 3), 2),
            "used_gb": round(memory.used / (1024 ** 3), 2),
            "usage_percent": memory.percent
        },
        "disk": {
            "total_gb": round(disk.total / (1024 ** 3), 2),
            "used_gb": round(disk.used / (1024 ** 3), 2),
            "usage_percent": disk.percent
        },
        "uptime_seconds": round(uptime, 2)
    }

@router.get("/ai")
async def get_ai_monitoring():

    return {
        "status": "healthy",
        "ai_monitoring": get_ai_stats()
    }
@router.get("/logs")
async def get_application_logs():

    try:
        if not Path(LOG_FILE).exists():
            return {
                "status": "success",
                "total_logs": 0,
                "logs": []
            }

        with open(LOG_FILE, "r", encoding="utf-8") as file:
            lines = file.readlines()

        latest_logs = [
            line.strip()
            for line in lines[-50:]
        ]

        return {
            "status": "success",
            "total_logs": len(latest_logs),
            "logs": latest_logs
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }

@router.get("/database")
async def get_database_status():

    connected = check_db_connection()

    return {
        "database": "PostgreSQL",
        "status": "connected" if connected else "disconnected",
        "healthy": connected
    }