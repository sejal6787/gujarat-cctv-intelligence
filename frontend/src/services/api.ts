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
  id: number;
  name: string;
  location: string;
  stream_url?: string;
  is_active: boolean;
  status?: string;
  type?: string;
}

export interface Alert {
  id: number;
  detection_id: number;
  plate_number: string;
  severity: string;
  message?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Detection {
  id: number;
  camera_id: number;
  plate_number?: string;
  vehicle_type?: string;
  confidence?: number;
  detected_at: string;
}

export interface WatchlistVehicle {
  id: number;
  plate_number: string;
  reason?: string;
  is_active: boolean;
}

export const api = {
  getCameras: async () => {
  const cameras = await apiRequest<Camera[]>("/cameras");

  return cameras.map((camera) => ({
    ...camera,
    id: camera.id,
    status: camera.is_active ? "ONLINE" : "OFFLINE",
    type: camera.stream_url ? "IP Camera" : "Camera",
  }));
},

  getAlerts: () =>
    apiRequest<Alert[]>("/alerts"),

  getVehicleDetections: (plate: string) => 
  apiRequest<Detection[]>( 
    `/vehicles/${encodeURIComponent(plate)}/detections` 
  ),

getDetections: () =>
  apiRequest<Detection[]>("/detections"),
 
getWatchlist: () => 
  apiRequest<WatchlistVehicle[]>("/watchlist"),
};