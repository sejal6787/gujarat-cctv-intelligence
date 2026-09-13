# ML Pipeline Handover Document

Welcome to the machine learning core of our Gujarat Police Hackathon platform. We have built an incredibly resilient, real-time computer vision pipeline that processes CCTV feeds, isolates Indian license plates, and pushes high-confidence reads straight to the backend. 

This document is your complete guide to integrating the ML service with the rest of the stack.

## System Architecture and Component Flow

Our AI module operates as a completely decoupled microservice. Here is exactly how data flows from the camera straight to your database.

1. **Video Ingestion:** The `VideoIngestor` class connects directly to an RTSP stream or local MP4 file. It pulls frames and gracefully skips a configurable number of them to ensure the pipeline never falls behind real time.
2. **Vehicle Tracking:** We pass the raw frames into `VehicleTracker`. This uses YOLOv8 paired with ByteTrack. ByteTrack handles the temporal logic by assigning a unique ID to every car or motorcycle that enters the frame. This stops us from sending the same vehicle to the backend multiple times.
3. **Plate Recognition:** Once a vehicle track is stable, the `PlateRecognizer` crops the vehicle from the frame. It runs a secondary YOLO pass to find the license plate and then applies OpenCV filters like CLAHE and Otsu's Binarization to sharpen blurry or low-light images. Finally, PaddleOCR extracts the raw text.
4. **Validation:** The raw text runs through an aggressive cleanup function that fixes common OCR errors (like reading a zero as the letter O) and validates it against standard Indian license plate formats using Python regex.
5. **Asynchronous Dispatch:** The `EventDispatcher` takes the validated plate and pushes it to a background worker thread. This thread safely POSTs the JSON payload to your FastAPI backend without ever blocking the camera feed.

## Schema and Payload Contract

Every time the ML pipeline reads a plate with high confidence, it fires an HTTP POST request to your backend endpoint (by default, `http://localhost:8000/api/detections`).

The payload looks exactly like this:

```json
{
  "plate_number": "GJ01AB1234",
  "camera_id": "CAM-001",
  "timestamp": "2026-09-14T12:31:42Z",
  "confidence": 0.94,
  "snapshot_path": "/absolute/path/to/snapshots/GJ01AB1234_2026-09-14T12-31-42Z.jpg"
}
```

### Data Details
* **plate_number:** The sanitized, regex-validated string. You can trust this data is clean and formatted correctly.
* **camera_id:** This string acts as your primary key for geospatial mapping. Your backend should map `CAM-001` to its specific PostGIS coordinates in the database to track where the vehicle was spotted.
* **timestamp:** Formatted strictly in UTC ISO-8601. You can parse this directly into your Postgres timestamp columns without timezone headaches.
* **confidence:** A float representing the OCR confidence. We only dispatch if this is above our threshold (typically 0.8).
* **snapshot_path:** The absolute path on the local disk where the cropped image of the vehicle plate is saved.

## Static Asset and Snapshot Serving

Because the ML pipeline saves physical image files to the `snapshots/` directory, the frontend React dashboard needs a way to view them. 

The easiest way for the backend team to handle this is to mount a static route in FastAPI that points directly to this directory. You can add a single line to your `main.py` in the FastAPI app:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/snapshots", StaticFiles(directory="/path/to/cctv-pipeline/snapshots"), name="snapshots")
```

Once you do this, the frontend can just render the image by fetching `http://localhost:8000/snapshots/GJ01AB1234_2026-09-14T12-31-42Z.jpg`.

## Configuration Guide

You will find several tuneable parameters at the top of `pipeline.py`. Here is how to adjust them for your specific hardware.

* **PROCESS_EVERY_N_FRAMES:** Set to 3 by default. This tells the ingestor to only process 1 out of every 3 frames. If you are running on a powerful GPU, you can lower this to 1. If you are on a weak CPU, push it to 5 or 10.
* **OCR_BUFFER_SIZE:** Set to 3. When a vehicle is tracked, we wait until we get 3 successful OCR reads for that specific car. We then pick the absolute best one and dispatch it. This temporal voting window massively increases accuracy.
* **OCR_CONFIDENCE_THRESHOLD:** Set to 0.8. We drop any OCR reads below 80% confidence. If you notice too many missed plates at night, try dropping this to 0.6.
* **PLATE_MODEL_PATH:** The path to our custom Indian license plate model (`indian_plate_v1.pt`). 
* **RTSP Streams:** To switch from the dummy `sample.mp4` to a live camera feed, simply scroll to the bottom of the script and change `source_video = "sample.mp4"` to your RTSP URL like `rtsp://admin:password@192.168.1.100:554/stream`.

## Edge Case Handling and Fallbacks

We designed this system to be bulletproof in production environments.

* **Dropped Frames and Disconnections:** If a camera goes offline, the `VideoIngestor` catches the failure, safely releases OpenCV resources, and shuts down gracefully instead of throwing a massive stack trace.
* **Low-Light and Blur:** Before PaddleOCR even sees the image, OpenCV applies Contrast Limited Adaptive Histogram Equalization (CLAHE). This rescues details hidden in shadows or washed out by headlights.
* **Character Confusion:** Indian plates follow strict patterns. The post-processor actively fixes common OCR mistakes. If it sees `GJ01` read as `GJOI`, it knows position 2 and 3 must be numbers, so it automatically swaps the letters back to digits. 
* **Backend Outages:** If the FastAPI backend crashes, the `DetectionDispatcher` catches the connection error. It will hold up to 500 payloads in a thread-safe queue and retry every 2 seconds until the backend wakes up.

## Quickstart and Verification

If you want to spin up the ML pipeline locally to test your endpoints, just follow these exact steps.

1. **Set up your environment:**
```bash
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. **Set up a dummy server to catch payloads (optional):**
If the FastAPI backend is not ready yet, you can test the pipeline using netcat to listen on port 8000.
```bash
# On Linux/Mac
nc -l 8000 
# On Windows, you can use a quick python http server in a separate terminal:
python -m http.server 8000
```

3. **Run the pipeline:**
```bash
python pipeline.py
```

You will immediately see the video feed pop up with bounding boxes tracking vehicles, and you will see the JSON payloads printing to the terminal as they are dispatched!
