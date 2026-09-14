const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE";
  type: string;
  latitude?: number;
  longitude?: number;
}

export interface Alert {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  plate: string;
  type: string;
  camera: string;
  location: string;
  time: string;
  confidence: string;
  status: "UNRESOLVED" | "ACKNOWLEDGED";
}

export interface Detection {
  id: string;
  plate: string;
  camera: string;
  location: string;
  time: string;
  confidence: string;
  type: string;
}

export interface WatchlistVehicle {
  plate: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  lastSeen: string;
  status: string;
}

export const api = {
  getCameras: () =>
    apiRequest<Camera[]>("/api/cameras"),

  getAlerts: () =>
    apiRequest<Alert[]>("/api/alerts"),

  getVehicleDetections: (plate: string) =>
    apiRequest<Detection[]>(
      `/api/vehicles/${encodeURIComponent(plate)}/detections`
    ),

  getWatchlist: () =>
    apiRequest<WatchlistVehicle[]>("/api/watchlist"),
};