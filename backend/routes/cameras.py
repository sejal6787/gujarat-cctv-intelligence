from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import engine
from models.camera import Camera


router = APIRouter()


def get_db():
    with Session(engine) as session:
        yield session


@router.post("/cameras")
def create_camera(
    name: str,
    location: str,
    stream_url: str | None = None,
    db: Session = Depends(get_db),
):
    camera = Camera(
        name=name,
        location=location,
        stream_url=stream_url,
    )

    db.add(camera)
    db.commit()
    db.refresh(camera)

    return camera


@router.get("/cameras")
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return cameras