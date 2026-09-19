from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import engine
from models.watchlist import Watchlist


router = APIRouter()


def get_db():
    with Session(engine) as session:
        yield session


@router.post("/watchlist")
def create_watchlist_entry(
    plate_number: str,
    reason: str | None = None,
    db: Session = Depends(get_db),
):
    entry = Watchlist(
        plate_number=plate_number,
        reason=reason,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry

@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    entries = db.query(Watchlist).all()
    return entries
