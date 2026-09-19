from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import engine
from models.detection import Detection
from services.alert_service import check_watchlist_and_create_alert


router = APIRouter()


def get_db():
    with Session(engine) as session:
        yield session


class DetectionRequest(BaseModel):
    camera_id: int
    plate_number: str | None = None
    vehicle_type: str | None = None
    confidence: float | None = None
    timestamp: datetime | None = None
    snapshot_path: str | None = None


@router.post("/detections")
def create_detection(
    data: DetectionRequest,
    db: Session = Depends(get_db),
):
    detection = Detection(
        camera_id=data.camera_id,
        plate_number=data.plate_number,
        vehicle_type=data.vehicle_type,
        confidence=data.confidence,
        detected_at=data.timestamp or datetime.utcnow(),
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)

    alert = check_watchlist_and_create_alert(detection, db)

    return {
        "detection": {
            "id": detection.id,
            "camera_id": detection.camera_id,
            "plate_number": detection.plate_number,
            "vehicle_type": detection.vehicle_type,
            "confidence": detection.confidence,
            "detected_at": detection.detected_at,
        },
        "alert": {
            "id": alert.id,
            "detection_id": alert.detection_id,
            "plate_number": alert.plate_number,
            "severity": alert.severity,
            "message": alert.message,
            "is_resolved": alert.is_resolved,
            "created_at": alert.created_at,
        } if alert else None,
    }


@router.get("/detections")
def get_detections(db: Session = Depends(get_db)):
    detections = db.query(Detection).all()
    return detections