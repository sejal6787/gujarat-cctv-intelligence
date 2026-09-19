# Netra

Netra is an AI-powered CCTV video intelligence platform designed to centralize camera monitoring, vehicle and license-plate intelligence, watchlist correlation, real-time alerting, and historical investigation.

The platform combines a React-based command dashboard, a FastAPI backend, PostgreSQL persistence, and an AI processing pipeline built around vehicle detection, tracking, and ANPR/OCR.

---

## Overview

Traditional CCTV systems often operate as isolated video sources, making it difficult for operators to continuously monitor large camera networks and quickly identify vehicles of interest.

Netra introduces an intelligence layer over CCTV infrastructure that converts video detections into structured events, correlates those events with configurable watchlists, and generates alerts for relevant matches.

The intended workflow is:

**CCTV / NVR / VMS → Video Processing → Vehicle & Plate Detection → Detection Event → Watchlist Correlation → Alert → Operator Investigation → Resolution**

---

## Key Features

- Centralized CCTV intelligence dashboard
- Camera monitoring and camera management
- Vehicle detection event management
- License-plate / ANPR pipeline integration
- Watchlist management
- Automatic watchlist correlation
- Real-time alert generation
- Alert resolution workflow
- Vehicle detection history
- Vehicle-based historical search
- Camera location visualization
- REST APIs for frontend and AI integration
- PostgreSQL-based persistent storage
- Modular architecture for future analytics and scaling

---

## Current Implementation

The current prototype implements the following integrated workflow:

1. Cameras are stored and managed through the backend.
2. Detection events can be submitted through the `/detections` API.
3. Detection events are stored in PostgreSQL.
4. Detected license plates are checked against the active watchlist.
5. A matching watchlist vehicle generates an alert.
6. Operators can view alerts through the frontend.
7. Operators can resolve alerts.
8. Vehicle detection history can be searched by license plate.
9. Watchlist entries can be viewed and managed.
10. Camera locations can be visualized through the frontend map.

---

## Architecture

```text
                   CCTV / NVR / VMS
                          |
                          v
                Video Ingestion Layer
                          |
                          v
              AI / Video Processing
                          |
            +-------------+-------------+
            |                           |
      Vehicle Detection            Plate Detection
            |                           |
            v                           v
        Tracking                     OCR / ANPR
            |                           |
            +-------------+-------------+
                          |
                          v
                 Detection Event
                          |
                          v
                FastAPI Backend
                          |
             +------------+------------+
             |                         |
             v                         v
       Watchlist Check           PostgreSQL
             |
             v
        Alert Generation
             |
             v
      Operator Dashboard
             |
       +-----+------+------+
       |            |      |
    Alerts      History   Map
       |
       v
    Resolution
Project Structure
gujarat-cctv-intelligence/
│
├── backend/
│   ├── database/
│   │   └── connection.py
│   │
│   ├── models/
│   │   ├── alert.py
│   │   ├── camera.py
│   │   ├── detection.py
│   │   ├── user.py
│   │   └── watchlist.py
│   │
│   ├── routes/
│   │   ├── alerts.py
│   │   ├── cameras.py
│   │   ├── detection.py
│   │   ├── vehicles.py
│   │   └── watchlist.py
│   │
│   ├── services/
│   │   └── alert_service.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
├── docs/
│   ├── HLD
│   └── workflow / architecture documents
│
├── main.py
├── pipeline.py
├── train_plate_model.py
├── requirements.txt
├── README.md
└── .gitignore
Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
React Leaflet
Leaflet
Lucide React
Backend
Python
FastAPI
Uvicorn
SQLAlchemy
Pydantic
REST APIs
Database
PostgreSQL
Psycopg
AI / Computer Vision
YOLO / Ultralytics
ByteTrack
PaddleOCR
OpenCV
NumPy
Indian license-plate format validation
Development Tools
Git
GitHub
Visual Studio Code
Python virtual environments
Node.js / npm
Setup
Prerequisites

Install the following before running the project:

Python 3.x
Node.js and npm
PostgreSQL
Git
Backend Setup

Open PowerShell in the project directory.

cd backend

Create a Python virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install backend dependencies:

pip install -r requirements.txt
Database Configuration

Create a PostgreSQL database named:

gujarat_cctv

Create a local environment file:

backend/.env

Use the following format:

DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/gujarat_cctv

Replace YOUR_PASSWORD with the password for the local PostgreSQL user.

Important

The real .env file must not be committed to GitHub.

Use:

backend/.env.example

as the configuration template.

Run the Backend

From the backend directory:

uvicorn main:app --reload

The backend will normally be available at:

http://127.0.0.1:8000

FastAPI interactive documentation:

http://127.0.0.1:8000/docs
Frontend Setup

Open another terminal.

cd frontend

Install frontend dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://127.0.0.1:5173
Frontend Pages

The command dashboard currently includes:

Dashboard
Cameras
Alerts
Vehicles
History
Watchlist
Map

The frontend communicates with the FastAPI backend through REST APIs.

The backend URL can be configured using:

VITE_API_BASE_URL=http://localhost:8000

If this variable is not provided, the frontend uses the local backend URL by default.

API Endpoints
Cameras
GET /cameras
POST /cameras

Used to retrieve and create camera records.

Watchlist
GET /watchlist
POST /watchlist

Used to retrieve and create watchlist entries.

Detections
GET /detections
POST /detections

Detection events can be submitted by the AI processing pipeline.

Alerts
GET /alerts
PATCH /alerts/{alert_id}/resolve

Used to retrieve alerts and resolve an alert.

Vehicle History
GET /vehicles/{plate_number}/detections

Returns historical detection events associated with a license plate.

Detection and Alert Workflow

A detection event can contain information such as:

{
  "camera_id": 1,
  "plate_number": "GJ01AB1234",
  "vehicle_type": "car",
  "confidence": 0.95,
  "timestamp": "2026-09-14T10:00:00"
}

The backend stores the detection and checks the detected license plate against the active watchlist.

If a match is found, the alert service creates an alert associated with the detection.

The workflow is:

Detection
    ↓
Store Detection
    ↓
Check Active Watchlist
    ↓
Match Found?
    ↓
Create Alert
    ↓
Operator Reviews Alert
    ↓
Resolve / Investigate
AI Processing Pipeline

The project contains an AI processing pipeline using:

Ultralytics / YOLO
ByteTrack
PaddleOCR
OpenCV
NumPy
HTTP integration with the FastAPI backend

The pipeline is designed to process video frames, identify vehicles, track objects, detect license plates, perform OCR, validate recognized plate text, and send structured detection events to the backend.

The AI pipeline communicates with the backend through:

POST /detections
Model files

AI model weights and large video assets are not stored in the repository.

Required model weights and input video sources must be supplied separately when running the complete AI inference pipeline.

Demo Data

The repository may contain development/demo records used to demonstrate the application workflow.

Demo records should not be interpreted as official department or organizer-provided surveillance data.

For final evaluation or submission, the system should be demonstrated using the data and requirements provided by the organizers.

Security Notes

Do not commit:

.env files
Database passwords
API keys
Private credentials
Large model weights
Sensitive surveillance data

Environment-specific configuration should remain local or be provided through secure deployment configuration.

Scalability and Future Extensions

The architecture is designed to support future expansion toward:

Distributed CCTV networks
Heterogeneous CCTV/NVR/VMS integration
Edge and regional processing
External watchlist integrations
Advanced vehicle analytics
Facial recognition integration
Additional intelligent video analytics
Event correlation across multiple cameras
Large-scale deployments
High-availability processing infrastructure

These capabilities are architectural extensions and are not represented as fully connected production services in the current prototype.

Documentation

Additional architecture and workflow documentation is available in the docs/ directory.

The documentation covers:

High-Level Design
System architecture
Video ingestion
AI analytics
Watchlist correlation
Alert management
Operator workflow
Scalability
Security
Interoperability
Deployment considerations
Project Status

Netra is currently a functional prototype integrating:

Frontend → FastAPI Backend → PostgreSQL → Detection Events → Watchlist Correlation → Alerts → Vehicle History

The architecture is designed to provide a foundation for integrating live CCTV sources and additional AI analytics in future development phases.
