import cv2
import json
import os
import re
import numpy as np
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

# Indian Plate Regex: e.g., GJ01AB1234
# Group 1: State (2 chars), Group 2: RTO (2 digits), Group 3: Series (1-2 chars), Group 4: Number (4 digits)
PLATE_REGEX = re.compile(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{4})$')

# ---------------------------------------------------------
# EVENT DISPATCHER
# ---------------------------------------------------------
class EventDispatcher:
    """Handles structured payload generation and output."""
    def __init__(self, output_dir: str = 'snapshots'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.camera_id = "CAM-001"
        self.camera_lat = 23.0225
        self.camera_lon = 72.5714

    def dispatch(self, plate_number: str, confidence: float, snapshot: np.ndarray) -> Dict[str, Any]:
        """Saves snapshot and generates JSON payload."""
        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        snapshot_filename = f"{plate_number}_{timestamp_str.replace(':', '-')}.jpg"
        snapshot_path = self.output_dir / snapshot_filename
        
        cv2.imwrite(str(snapshot_path), snapshot)

        payload = {
            "plate_number": plate_number,
            "camera_id": self.camera_id,
            "timestamp": timestamp_str,
            "location": {
                "latitude": self.camera_lat,
                "longitude": self.camera_lon
            },
            "confidence_score": float(confidence),
            "snapshot_path": str(snapshot_path.absolute())
        }

        # In production, send this via HTTP POST or Kafka
        print(f"\n[+] DISPATCHED EVENT:\n{json.dumps(payload, indent=2)}\n")
        return payload

# ---------------------------------------------------------
# PLATE RECOGNIZER (OCR & VALIDATION)
# ---------------------------------------------------------
class PlateRecognizer:
    """Handles Plate cropping, Preprocessing, and PaddleOCR."""
    def __init__(self):
        # Initialize PaddleOCR (Use use_gpu=True if CUDA is available)
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        self.plate_model = YOLO(PLATE_MODEL_PATH)

    def preprocess_for_ocr(self, crop: np.ndarray) -> np.ndarray:
        """Applies OpenCV transformations to maximize OCR accuracy."""
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        contrast_enhanced = clahe.apply(gray)
        
        # Binarization
        _, binary = cv2.threshold(contrast_enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def clean_plate_text(self, text: str) -> Optional[str]:
        """Cleans OCR noise and enforces Indian license plate logic."""
        text = text.upper()
        # Remove all non-alphanumeric characters
        text = re.sub(r'[^A-Z0-9]', '', text)
        
        if not text:
            return None

        # Fix common OCR mistakes based on positional logic
        # First 2 are chars, Next 2 are numbers, Next 1-2 chars, Last 4 numbers
        if len(text) >= 9:
            text_list = list(text)
            
            # Helper for char/num swapping
            char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8', 'G': '6'}
            num_to_char = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B', '6': 'G'}

            # State code (First 2 chars)
            for i in range(2):
                if i < len(text_list) and text_list[i] in num_to_char: 
                    text_list[i] = num_to_char[text_list[i]]
            
            # RTO code (Next 2 digits)
            for i in range(2, 4):
                if i < len(text_list) and text_list[i] in char_to_num: 
                    text_list[i] = char_to_num[text_list[i]]
                
            text = "".join(text_list)

        match = PLATE_REGEX.match(text)
        if match:
            return text
        return None

    def recognize(self, frame: np.ndarray, vehicle_box: List[int]) -> Optional[tuple]:
        """Detects plate within vehicle box, runs OCR, and validates."""
        x1, y1, x2, y2 = vehicle_box
        vehicle_crop = frame[y1:y2, x1:x2]
        
        if vehicle_crop.size == 0:
            return None

        # Stage 2: Plate Detection within vehicle
        results = self.plate_model(vehicle_crop, verbose=False)
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Plate coordinates relative to vehicle_crop
                px1, py1, px2, py2 = map(int, box.xyxy[0])
                plate_crop = vehicle_crop[py1:py2, px1:px2]
                
                if plate_crop.size == 0:
                    continue
                    
                processed_plate = self.preprocess_for_ocr(plate_crop)
                
                # Stage 3: OCR
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
    """Handles Stage 1 detection and ByteTrack tracking."""
    def __init__(self):
        self.model = YOLO(VEHICLE_MODEL_PATH)
        # Class IDs for COCO: 2=car, 3=motorcycle, 5=bus, 7=truck
        self.vehicle_classes = [2, 3, 5, 7]

    def track(self, frame: np.ndarray) -> Any:
        """Runs tracking on the frame. Uses built-in ByteTrack."""
        # Built-in tracking method only, as requested.
        # persist=True maintains temporal state across frames.
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
    """Handles video streaming, connection resilience, and frame skipping."""
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
            
            # Dynamic frame skipping optimization
            if frame_idx % PROCESS_EVERY_N_FRAMES == 0:
                yield frame_idx, frame
                
            frame_idx += 1
            
    def release(self):
        self.cap.release()

# ---------------------------------------------------------
# PIPELINE RUNNER (ORCHESTRATOR)
# ---------------------------------------------------------
class PipelineRunner:
    """Main Orchestrator tying everything together."""
    def __init__(self, source: str):
        print("[*] Initializing AI Pipeline...")
        self.ingestor = VideoIngestor(source)
        self.tracker = VehicleTracker()
        self.recognizer = PlateRecognizer()
        self.dispatcher = EventDispatcher()
        
        # State memory to prevent duplicate events for the same vehicle
        self.processed_track_ids = set()

    def run(self):
        print("[*] Pipeline started. Press Ctrl+C to exit.")
        try:
            for frame_idx, frame in self.ingestor.get_frames():
                
                # 1. Track Vehicles
                track_results = self.tracker.track(frame)
                
                if track_results.boxes is None or track_results.boxes.id is None:
                    continue
                
                boxes = track_results.boxes.xyxy.cpu().numpy()
                track_ids = track_results.boxes.id.int().cpu().tolist()
                
                # 2. Process each tracked vehicle
                for box, track_id in zip(boxes, track_ids):
                    
                    if track_id in self.processed_track_ids:
                        continue
                        
                    vehicle_box = list(map(int, box))
                    
                    # 3. Plate Recognition
                    plate_data = self.recognizer.recognize(frame, vehicle_box)
                    
                    if plate_data:
                        plate_text, conf, plate_crop = plate_data
                        
                        # 4. Dispatch Event
                        self.dispatcher.dispatch(plate_text, conf, plate_crop)
                        self.processed_track_ids.add(track_id)
                        
        except KeyboardInterrupt:
            print("\n[*] Pipeline stopped by user.")
        finally:
            self.ingestor.release()
            print("[*] Resources released.")

# ---------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------
if __name__ == "__main__":
    import sys
    
    # Check for dummy / missing models
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
