import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


const cameras = [
  {
    id: "CAM-017",
    name: "Ahmedabad Junction",
    position: [23.0225, 72.5714] as [number, number],
    status: "ONLINE",
  },
  {
    id: "CAM-023",
    name: "SG Highway Entry",
    position: [23.0469, 72.5169] as [number, number],
    status: "ONLINE",
  },
  {
    id: "CAM-031",
    name: "Ring Road North",
    position: [21.1702, 72.8311] as [number, number],
    status: "ONLINE",
  },
  {
    id: "CAM-008",
    name: "Railway Station Road",
    position: [22.3072, 73.1812] as [number, number],
    status: "OFFLINE",
  },
  {
    id: "CAM-042",
    name: "City Centre Junction",
    position: [22.3039, 70.8022] as [number, number],
    status: "ONLINE",
  },
  {
    id: "CAM-049",
    name: "Airport Approach Road",
    position: [23.0772, 72.6347] as [number, number],
    status: "ONLINE",
  },
];

const vehicleRoute: [number, number][] = [
  [22.997, 72.53],
  [23.008, 72.548],
  [23.018, 72.561],
  [23.0225, 72.5714],
  [23.034, 72.589],
  [23.0469, 72.5169],
];

export default function Map() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-blue-400">
            GEOSPATIAL INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            GIS Intelligence Map
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Camera network, detections and vehicle movement across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online Camera
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Alert
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Vehicle Route
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="relative overflow-hidden rounded-xl border border-[#1B2330] bg-[#0D111A]">
        <div className="h-155">
          <MapContainer
            center={[22.5, 72.5]}
            zoom={7}
            scrollWheelZoom={true}
            zoomControl={false}
            className="h-full w-full dark-gis-map"
          >
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />

            <ZoomControl position="bottomright" />

            {/* CAMERA MARKERS */}
            {cameras.map((camera) => {
              const online = camera.status === "ONLINE";

              return (
                <CircleMarker
                  key={camera.id}
                  center={camera.position}
                  radius={online ? 7 : 6}
                  pathOptions={{
                    color: online ? "#34D399" : "#F87171",
                    fillColor: online ? "#34D399" : "#F87171",
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-45">
                      <strong>{camera.id}</strong>
                      <br />
                      {camera.name}
                      <br />
                      Status: {camera.status}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* VEHICLE ROUTE */}
            <Polyline
              positions={vehicleRoute}
              pathOptions={{
                color: "#60A5FA",
                weight: 4,
                opacity: 0.9,
              }}
            />

            {/* CURRENT VEHICLE POSITION */}
            <CircleMarker
              center={vehicleRoute[vehicleRoute.length - 1]}
              radius={9}
              pathOptions={{
                color: "#60A5FA",
                fillColor: "#60A5FA",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div className="min-w-45">
                  <strong>GJ01AB1234</strong>
                  <br />
                  Vehicle of Interest
                  <br />
                  Last detected: 14:23:09
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        </div>

        {/* NETWORK OVERVIEW */}
        <div className="absolute left-5 top-5 z-1000 w-64 rounded-xl border border-[#1B2330] bg-[#0D111A]/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
            NETWORK OVERVIEW
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold">50</p>
              <p className="mt-1 text-[10px] text-slate-600">CAMERAS</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-emerald-400">47</p>
              <p className="mt-1 text-[10px] text-slate-600">ONLINE</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-red-400">04</p>
              <p className="mt-1 text-[10px] text-slate-600">ALERTS</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-blue-400">01</p>
              <p className="mt-1 text-[10px] text-slate-600">
                ACTIVE TRACK
              </p>
            </div>
          </div>
        </div>

        {/* ACTIVE VEHICLE PANEL */}
        <div className="absolute bottom-5 left-5 z-1000 w-72 rounded-xl border border-blue-500/20 bg-[#0D111A]/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-400">
            ACTIVE VEHICLE TRACK
          </p>

          <p className="mt-2 font-mono text-lg font-semibold">
            GJ01AB1234
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Vehicle of Interest
          </p>

          <div className="mt-4 border-t border-[#1B2330] pt-3">
            <p className="text-[10px] text-slate-600">LAST DETECTED</p>

            <p className="mt-1 text-sm text-slate-300">
              CAM-017 · Ahmedabad Junction
            </p>

            <p className="mt-1 text-xs text-slate-500">14:23:09</p>
          </div>
        </div>
      </div>
    </div>
  );
}