from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import engine
from models.detection import Detection


router = APIRouter()


def get_db():
    with Session(engine) as session:
        yield session


@router.get("/vehicles/{plate_number}/detections")
def get_vehicle_detections(
    plate_number: str,
    db: Session = Depends(get_db),
):
    detections = (
        db.query(Detection)
        .filter(Detection.plate_number == plate_number)
        .order_by(Detection.detected_at.desc())
        .all()
    )

    return detections