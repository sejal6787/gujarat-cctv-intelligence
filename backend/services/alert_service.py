from sqlalchemy.orm import Session

from models.alert import Alert
from models.watchlist import Watchlist
from models.detection import Detection


def check_watchlist_and_create_alert(
    detection: Detection,
    db: Session,
):
    if not detection.plate_number:
        return None

    watchlist_entry = (
        db.query(Watchlist)
        .filter(
            Watchlist.plate_number == detection.plate_number,
            Watchlist.is_active == True,
        )
        .first()
    )

    if not watchlist_entry:
        return None

    alert = Alert(
        detection_id=detection.id,
        plate_number=detection.plate_number,
        severity="high",
        message=f"Watchlist vehicle detected: {detection.plate_number}",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert
