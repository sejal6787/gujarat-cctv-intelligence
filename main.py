import cv2
import json
import time
import re
import numpy as np
import threading
from queue import Queue, Full
from datetime import datetime, timezone
import requests
from ultralytics import YOLO
from paddleocr import PaddleOCR

# Configurations
API_ENDPOINT = "http://localhost:8000/api/detections"
VEHICLE_MODEL_PATH = 'yolov8n.pt'
PLATE_MODEL_PATH = 'indian_plate_v1.pt'

# 1. The Non-Blocking API Dispatcher
class DetectionDispatcher:
    def __init__(self, endpoint: str, max_queue_size: int = 500):
        self.endpoint = endpoint
        self.queue = Queue(maxsize=max_queue_size)
        
        # We use a daemon thread so it automatically shuts down when the main program exits.
        # This thread runs continuously in the background, entirely decoupled from the video loop.
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()

    def _worker_loop(self):
        """Background thread that consumes payloads from the queue and POSTs them."""
        while True:
            # Blocks until an item is available in the queue
            payload = self.queue.get()
            
            # Retry mechanism logic
            success = False
            while not success:
                try:
                    response = requests.post(self.endpoint, json=payload, timeout=3.0)
                    if response.status_code in (200, 201):
                        print(f"[API] Successfully pushed plate: {payload.get('plate_number')}")
                        success = True
                    else:
                        print(f"[API] Backend returned {response.status_code}. Retrying in 2 seconds...")
                        time.sleep(2)
                except requests.RequestException as e:
                    print(f"[API] Connection failed: {e}. Retrying in 2 seconds...")
                    time.sleep(2)
            
            # Mark the task as done so the queue knows it has been processed
            self.queue.task_done()

    def push(self, payload: dict):
        """Puts a payload into the queue without blocking."""
        try:
            # put_nowait ensures the main video loop NEVER blocks. 
            # If the queue is full (backend down for a long time), we drop the payload 
            # to prevent memory leaks and keep the video stream real-time.
            self.queue.put_nowait(payload)
        except Full:
            print("[!] Queue is full. Dropping payload to prevent memory leak.")

# 2. Indian License Plate Regex & Post-Processing
def clean_and_validate_plate(raw_text: str) -> str | None:
    """
    Cleans OCR noise and enforces standard Indian license plate formats.
    Returns the cleaned plate string, or None if invalid.
    """
    # Strip whitespace and special characters
    text = re.sub(r'[^A-Za-z0-9]', '', raw_text).upper()
    
    if len(text) < 9:
        return None
        
    text_list = list(text)
    char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8', 'G': '6'}
    num_to_char = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B', '6': 'G'}

    # Attempt character-to-number and number-to-character fixes based on standard Indian plate positions
    # Position 0, 1: State code (Chars)
    for i in range(2):
        if i < len(text_list) and text_list[i] in num_to_char: 
            text_list[i] = num_to_char[text_list[i]]
            
    # Position 2, 3: RTO code (Numbers)
    for i in range(2, 4):
        if i < len(text_list) and text_list[i] in char_to_num: 
            text_list[i] = char_to_num[text_list[i]]
            
    cleaned_text = "".join(text_list)
    
    # Regex validation against standard formats (e.g., GJ01AB1234)
    # ^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$
    if re.match(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{4})$', cleaned_text):
        return cleaned_text
        
    return None

# 3. The Main Execution Loop
def main():
    print("[*] Initializing Pipeline...")
    # Initialize models
    vehicle_model = YOLO(VEHICLE_MODEL_PATH)
    plate_model = YOLO(PLATE_MODEL_PATH)
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    
    # Initialize Dispatcher
    dispatcher = DetectionDispatcher(API_ENDPOINT, max_queue_size=500)
    
    # Video Ingestion
    video_source = "sample.mp4"
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"[!] Cannot open {video_source}")
        return

    # Track stable frames per vehicle ID to prevent edge-of-frame blurriness
    # Dictionary: {track_id: consecutive_frames_visible}
    track_stability = {}
    
    # Keep track of IDs we've already dispatched so we only send once per vehicle
    dispatched_ids = set()

    print("[*] Starting Video Execution Loop...")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Vehicle detection & tracking
        results = vehicle_model.track(
            frame, 
            persist=True, 
            classes=[2, 3, 5, 7], # car, motorcycle, bus, truck
            tracker="bytetrack.yaml", 
            verbose=False
        )
        
        track_result = results[0]
        
        if track_result.boxes is not None and track_result.boxes.id is not None:
            boxes = track_result.boxes.xyxy.cpu().numpy()
            track_ids = track_result.boxes.id.int().cpu().tolist()
            
            # Maintain stability count
            active_ids = set(track_ids)
            for tid in active_ids:
                track_stability[tid] = track_stability.get(tid, 0) + 1
                
            # Cleanup lost tracks
            lost_ids = set(track_stability.keys()) - active_ids
            for tid in lost_ids:
                del track_stability[tid]
                
            for box, track_id in zip(boxes, track_ids):
                # Unpack vehicle box
                vx1, vy1, vx2, vy2 = map(int, box)
                
                # Draw vehicle bounding box for demo visualization
                cv2.rectangle(frame, (vx1, vy1), (vx2, vy2), (0, 255, 0), 2)
                cv2.putText(frame, f"ID: {track_id}", (vx1, vy1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # We only execute Plate OCR if the vehicle has been stable for at least 3 frames
                # and if we haven't already dispatched it to the backend API.
                if track_stability[track_id] >= 3 and track_id not in dispatched_ids:
                    
                    vehicle_crop = frame[vy1:vy2, vx1:vx2]
                    if vehicle_crop.size == 0: continue
                    
                    # Plate detection
                    plate_results = plate_model(vehicle_crop, verbose=False)
                    for pr in plate_results:
                        if pr.boxes is None or len(pr.boxes) == 0: continue
                        
                        for pbox in pr.boxes:
                            px1, py1, px2, py2 = map(int, pbox.xyxy[0])
                            plate_crop = vehicle_crop[py1:py2, px1:px2]
                            
                            if plate_crop.size == 0: continue
                                
                            # OCR execution
                            ocr_result = ocr.ocr(plate_crop, cls=True)
                            if not ocr_result or not ocr_result[0]: continue
                            
                            for line in ocr_result[0]:
                                raw_text, confidence = line[1][0], line[1][1]
                                
                                if confidence > 0.8:
                                    validated_plate = clean_and_validate_plate(raw_text)
                                    
                                    if validated_plate:
                                        # Construct payload
                                        payload = {
                                            "plate_number": validated_plate,
                                            "camera_id": "CAM-001",
                                            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                                            "confidence": float(confidence)
                                        }
                                        
                                        # Push to background queue (non-blocking)
                                        dispatcher.push(payload)
                                        
                                        # Mark as dispatched
                                        dispatched_ids.add(track_id)
                                        
                                        # Visual Feedback on frame
                                        cv2.putText(frame, validated_plate, (vx1, vy2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Show the video feed with bounding boxes
        cv2.imshow("CCTV Intelligence Pipeline", frame)
        
        # Press 'q' to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[*] Pipeline Terminated.")

if __name__ == "__main__":
    import os
    if not os.path.exists(PLATE_MODEL_PATH):
        print(f"[!] Warning: {PLATE_MODEL_PATH} not found.")
        print("[!] Train the model first before running main.py.")
    
    # We create a dummy video for execution loop test if missing
    if not os.path.exists("sample.mp4"):
        print("[!] 'sample.mp4' not found. Ensure you have a valid video source.")
        
    main()
