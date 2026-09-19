from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import engine
from database.connection import Base
from models.camera import Camera
from models.watchlist import Watchlist
from models.detection import Detection
from models.alert import Alert
from models.user import User
from routes.cameras import router as cameras_router
from routes.watchlist import router as watchlist_router
from routes.alerts import router as alerts_router
from routes.detection import router as detection_router
from routes.vehicles import router as vehicles_router



Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://netra-frontend-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras_router)
app.include_router(watchlist_router)
app.include_router(alerts_router)
app.include_router(detection_router)
app.include_router(vehicles_router)




@app.get("/")
def home():
    return {"message": "Gujarat CCTV Intelligence Platform"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-test")
def db_test():
    try:
        with engine.connect():
            return {"database": "connected"}
    except Exception as e:
        return {"database": "error", "details": str(e)}