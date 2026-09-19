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
