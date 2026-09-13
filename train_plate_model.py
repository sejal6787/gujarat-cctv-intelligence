import os
import yaml
from ultralytics import YOLO

# ---------------------------------------------------------
# TOP-TIER INDIAN LICENSE PLATE MODEL TRAINING SCRIPT
# Architect: Elite Computer Vision & Edge AI Engineer
# ---------------------------------------------------------
# This script sets up a highly optimized training pipeline 
# for a custom YOLOv8 model tailored specifically for Indian 
# License Plates, focusing on high precision and edge-device 
# deployment compatibility.
# ---------------------------------------------------------

# 1. Dataset Configuration Definition
DATASET_YAML = 'indian_plates_dataset.yaml'
BASE_MODEL = 'yolov8n.pt' # Starting with nano for edge-inference speed, or yolov8s.pt for higher accuracy
OUTPUT_MODEL_NAME = 'indian_plate_v1.pt'

def create_dataset_config():
    """Generates the dataset configuration file."""
    config = {
        'path': './dataset', # Root dir
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'names': {
            0: 'indian_license_plate'
        }
    }
    
    with open(DATASET_YAML, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    print(f"[*] Dataset config created at {DATASET_YAML}")

def train_model():
    """
    Executes the training process with hyperparameter tuning 
    suitable for small object detection (license plates) in varying lighting.
    """
    if not os.path.exists('./dataset'):
        print("[!] Warning: './dataset' directory not found.")
        print("[!] Please ensure you have your images and labels prepared in YOLO format.")
        print("[!] Expected structure:\n    dataset/\n      images/train/\n      images/val/\n      labels/train/\n      labels/val/")
        # We won't exit here so the script can still compile/run, but training will fail if dataset is missing.

    print(f"[*] Loading base model {BASE_MODEL}...")
    model = YOLO(BASE_MODEL)
    
    print("[*] Commencing top-tier training pipeline...")
    # Optimal hyperparameters for License Plate Detection:
    # - High image size (imgsz=640) for small object clarity
    # - Cosine learning rate scheduler (cos_lr=True) for better convergence
    # - Augmentations: mosaic, mixup disabled (not great for rigid plates), but HSV changes enabled for day/night
    results = model.train(
        data=DATASET_YAML,
        epochs=100,             # Sufficient epochs with early stopping
        patience=20,            # Early stopping patience
        batch=16,               # Depends on VRAM, 16 is safe for 8GB GPUs
        imgsz=640,              # Standard resolution for clarity
        device=0,               # Use CUDA GPU 0
        optimizer='auto',       # SGD/AdamW based on heuristic
        lr0=0.01,               # Initial learning rate
        cos_lr=True,            # Cosine annealing
        hsv_h=0.015,            # Hue augmentation for lighting variances
        hsv_s=0.7,              # Saturation augmentation
        hsv_v=0.4,              # Value augmentation for night/day simulated CCTV
        degrees=5.0,            # Slight rotation (plates can be tilted)
        translate=0.1,          # Translation
        scale=0.5,              # Scaling
        mosaic=0.0,             # Mosaic is generally bad for reading localized small text plates
        mixup=0.0,              # No mixup
        name='indian_plate_training',
        exist_ok=True
    )
    
    # After training, export/move the best model
    best_model_path = os.path.join('runs', 'detect', 'indian_plate_training', 'weights', 'best.pt')
    
    if os.path.exists(best_model_path):
        os.rename(best_model_path, OUTPUT_MODEL_NAME)
        print(f"\n[+] SUCCESS! Top-tier model trained and saved as '{OUTPUT_MODEL_NAME}'.")
        print(f"[+] You can now run pipeline.py which depends on {OUTPUT_MODEL_NAME}.")
    else:
        print("\n[!] Training did not output a best model. Check logs.")

if __name__ == "__main__":
    create_dataset_config()
    # In a real environment with the dataset present, uncomment the next line to actually train.
    # train_model()
    print("[*] AI/ML Architect setup complete. Run train_model() when dataset is ready.")
