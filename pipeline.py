import cv2
import json
import os
import re
import numpy as np
import requests
import threading
from datetime import datetime, timezone
from pathlib import Path
from ultralytics import YOLO
from paddleocr import PaddleOCR
from typing import Dict, Any, Optional, List, Generator

# ---------------------------------------------------------
# CONSTANTS & CONFIGURATION
# ---------------------------------------------------------
VEHICLE_MODEL_PATH = 'yolov8n.pt'          # Base model for vehicles
PLATE_MODEL_PATH = 'indian_plate_v1.pt'    # Custom trained top-tier plate model
CONFIDENCE_THRESHOLD = 0.5
OCR_CONFIDENCE_THRESHOLD = 0.8
PROCESS_EVERY_N_FRAMES = 3                 # Optimization: Process 1 out of 3 frames
API_ENDPOINT = "http://localhost:8000/detections"
OCR_BUFFER_SIZE = 3                        # Frames to buffer before picking best OCR read

# Indian Plate Regex: e.g., GJ01AB1234
PLATE_REGEX = re.compile(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{4})$')

# ---------------------------------------------------------
# EVENT DISPATCHER
# ---------------------------------------------------------
class EventDispatcher:
    """Handles structured payload generation and asynchronous output."""
    def __init__(self, output_dir: str = 'snapshots'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.camera_id = "CAM-001"

    def _post_payload(self, payload: Dict[str, Any]):
        """Asynchronous HTTP POST worker."""
        try:
            response = requests.post(API_ENDPOINT, json=payload, timeout=5.0)
            if response.status_code in (200, 201):
                print(f"[+] Successfully posted payload to backend: {payload['plate_number']}")
            else:
                print(f"[!] Backend returned status {response.status_code}")
        except requests.RequestException as e:
            print(f"[!] Failed to post to backend: {e}")

    def dispatch(self, plate_number: str, confidence: float, snapshot: np.ndarray) -> Dict[str, Any]:
        """Saves snapshot and dispatches JSON payload asynchronously."""
        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        snapshot_filename = f"{plate_number}_{timestamp_str.replace(':', '-')}.jpg"
        snapshot_path = self.output_dir / snapshot_filename
        
        cv2.imwrite(str(snapshot_path), snapshot)

        payload = {
            "plate_number": plate_number,
            "camera_id": self.camera_id,
            "timestamp": timestamp_str,
            "confidence": float(confidence),
            "snapshot_path": str(snapshot_path.absolute())
        }

        print(f"\n[*] DISPATCHING EVENT:\n{json.dumps(payload, indent=2)}\n")
        
        # Dispatch asynchronously so it doesn't block the video processing loop
        threading.Thread(target=self._post_payload, args=(payload,), daemon=True).start()
        
        return payload

# ---------------------------------------------------------
# PLATE RECOGNIZER (OCR & VALIDATION)
# ---------------------------------------------------------
class PlateRecognizer:
    """Handles Plate cropping, Preprocessing, and PaddleOCR."""
    def __init__(self):
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        self.plate_model = YOLO(PLATE_MODEL_PATH)

    def preprocess_for_ocr(self, crop: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        contrast_enhanced = clahe.apply(gray)
        _, binary = cv2.threshold(contrast_enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def clean_plate_text(self, text: str) -> Optional[str]:
        text = text.upper()
        text = re.sub(r'[^A-Z0-9]', '', text)
        
        if not text:
            return None

        if len(text) >= 9:
            text_list = list(text)
            char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8', 'G': '6'}
            num_to_char = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B', '6': 'G'}

            for i in range(2):
                if i < len(text_list) and text_list[i] in num_to_char: 
                    text_list[i] = num_to_char[text_list[i]]
            for i in range(2, 4):
                if i < len(text_list) and text_list[i] in char_to_num: 
                    text_list[i] = char_to_num[text_list[i]]
            text = "".join(text_list)

        match = PLATE_REGEX.match(text)
        if match:
            return text
        return None

    def recognize(self, frame: np.ndarray, vehicle_box: List[int]) -> Optional[tuple]:
        x1, y1, x2, y2 = vehicle_box
        vehicle_crop = frame[y1:y2, x1:x2]
        
        if vehicle_crop.size == 0:
            return None

        results = self.plate_model(vehicle_crop, verbose=False)
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                px1, py1, px2, py2 = map(int, box.xyxy[0])
                plate_crop = vehicle_crop[py1:py2, px1:px2]
                
                if plate_crop.size == 0:
                    continue
                    
                processed_plate = self.preprocess_for_ocr(plate_crop)
                
                ocr_result = self.ocr.ocr(processed_plate, cls=True)
                if not ocr_result or not ocr_result[0]:
                    continue
                
                for line in ocr_result[0]:
                    text, confidence = line[1][0], line[1][1]
                    
                    if confidence > OCR_CONFIDENCE_THRESHOLD:
                        cleaned_text = self.clean_plate_text(text)
                        if cleaned_text:
                            return cleaned_text, confidence, plate_crop
        return None

# ---------------------------------------------------------
# VEHICLE TRACKER (YOLO + BYTETRACK)
# ---------------------------------------------------------
class VehicleTracker:
    def __init__(self):
        self.model = YOLO(VEHICLE_MODEL_PATH)
        self.vehicle_classes = [2, 3, 5, 7]

    def track(self, frame: np.ndarray) -> Any:
        results = self.model.track(
            frame, 
            persist=True, 
            classes=self.vehicle_classes,
            tracker="bytetrack.yaml", 
            verbose=False
        )
        return results[0]

# ---------------------------------------------------------
# VIDEO INGESTOR
# ---------------------------------------------------------
class VideoIngestor:
    def __init__(self, source: str):
        self.source = source
        self.cap = cv2.VideoCapture(source)
        if not self.cap.isOpened():
            raise ValueError(f"Unable to open video source: {source}")

    def get_frames(self) -> Generator[tuple[int, np.ndarray], None, None]:
        frame_idx = 0
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                print("[!] Stream disconnected or finished.")
                break
            
            if frame_idx % PROCESS_EVERY_N_FRAMES == 0:
                yield frame_idx, frame
                
            frame_idx += 1
            
    def release(self):
        self.cap.release()

# ---------------------------------------------------------
# PIPELINE RUNNER (ORCHESTRATOR)
# ---------------------------------------------------------
class PipelineRunner:
    def __init__(self, source: str):
        print("[*] Initializing AI Pipeline...")
        self.ingestor = VideoIngestor(source)
        self.tracker = VehicleTracker()
        self.recognizer = PlateRecognizer()
        self.dispatcher = EventDispatcher()
        
        self.processed_track_ids = set()
        # Buffer to store reads for a specific track ID: {track_id: [(text, conf, crop), ...]}
        self.ocr_buffers = {}

    def _dispatch_best_from_buffer(self, track_id: int):
        """Picks the best OCR read from the buffer and dispatches it."""
        if track_id not in self.ocr_buffers or not self.ocr_buffers[track_id]:
            return
            
        best_read = max(self.ocr_buffers[track_id], key=lambda x: x[1])
        plate_text, conf, plate_crop = best_read
        
        self.dispatcher.dispatch(plate_text, conf, plate_crop)
        self.processed_track_ids.add(track_id)
        del self.ocr_buffers[track_id]

    def run(self):
        print("[*] Pipeline started. Press Ctrl+C to exit.")
        try:
            for frame_idx, frame in self.ingestor.get_frames():
                
                track_results = self.tracker.track(frame)
                
                if track_results.boxes is None or track_results.boxes.id is None:
                    continue
                
                boxes = track_results.boxes.xyxy.cpu().numpy()
                track_ids = track_results.boxes.id.int().cpu().tolist()
                
                # Check for vehicles that left the frame to process their buffers early
                active_ids = set(track_ids)
                lost_ids = set(self.ocr_buffers.keys()) - active_ids
                for lost_id in lost_ids:
                    self._dispatch_best_from_buffer(lost_id)
                
                for box, track_id in zip(boxes, track_ids):
                    if track_id in self.processed_track_ids:
                        continue
                        
                    vehicle_box = list(map(int, box))
                    plate_data = self.recognizer.recognize(frame, vehicle_box)
                    
                    if plate_data:
                        if track_id not in self.ocr_buffers:
                            self.ocr_buffers[track_id] = []
                        
                        self.ocr_buffers[track_id].append(plate_data)
                        
                        # Trigger dispatch if buffer is full
                        if len(self.ocr_buffers[track_id]) >= OCR_BUFFER_SIZE:
                            self._dispatch_best_from_buffer(track_id)
                        
        except KeyboardInterrupt:
            print("\n[*] Pipeline stopped by user. Cleaning up buffers...")
            # Dispatch anything remaining in buffers
            for track_id in list(self.ocr_buffers.keys()):
                self._dispatch_best_from_buffer(track_id)
        finally:
            self.ingestor.release()
            print("[*] Resources released.")

# ---------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------
if __name__ == "__main__":
    import sys
    
    if not os.path.exists(PLATE_MODEL_PATH):
        print(f"[!] Warning: {PLATE_MODEL_PATH} not found.")
        print("[!] You must train the model first using train_plate_model.py")
        sys.exit(1)
        
    source_video = "sample.mp4" 
    
    if not os.path.exists(source_video):
        print(f"[!] Video source {source_video} not found. Please provide a valid CCTV video.")
        sys.exit(1)

    runner = PipelineRunner(source_video)
    runner.run()
