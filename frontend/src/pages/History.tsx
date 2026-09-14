import {
  Car,
  Camera,
  Clock3,
  MapPin,
  Search,
  ScanLine,
} from "lucide-react";

import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { 
  Detection, 
  Camera as CameraType,
  WatchlistVehicle, 
}  from "../services/api";


export default function History() {
  const [search, setSearch] = useState("");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistVehicle[]>([]);


  useEffect(() => {
  api.getDetections().then(setDetections).catch(console.error);
  api.getCameras().then(setCameras).catch(console.error);
  api.getWatchlist().then(setWatchlist).catch(console.error);
}, []);

  const todayDetections = detections.filter(
    (detection) =>
      new Date(detection.detected_at).toDateString() === new Date().toDateString()
  );

  const filtered = detections.filter((detection) => {
    const query = search.toLowerCase();

    return (
      detection.plate_number?.toLowerCase().includes(query) ||
      detection.camera_id.toString().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-blue-400">
            DETECTION INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Detection History
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search and review historical ANPR and vehicle detection events.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#1B2330] bg-[#0D111A] px-4 py-2.5">
          <ScanLine size={15} className="text-blue-400" />
          <span className="text-xs font-medium text-slate-400">
            LIVE INGESTION
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">TODAY</p>
          <p className="mt-3 text-3xl font-semibold">{todayDetections.length}</p>
          <p className="mt-1 text-xs text-slate-600">detections</p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">ANPR MATCHES</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">
            {todayDetections.filter((detection) => detection.plate_number).length}
          </p>
          <p className="mt-1 text-xs text-slate-600">plates recognised</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">WATCHLIST MATCHES</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">
            {todayDetections.filter((detection) => detection.plate_number === "GJ01AB1234").length}
          </p>
          <p className="mt-1 text-xs text-slate-600">generated today</p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">AVG CONFIDENCE</p>
          <p className="mt-3 text-3xl font-semibold">
            {todayDetections.length > 0
    ? (
        todayDetections.reduce(
          (sum, detection) => sum + (detection.confidence ?? 0),
          0
        ) / todayDetections.length
      * 100
      ).toFixed(1)
    : "0.0"}%
          </p>
          <p className="mt-1 text-xs text-slate-600">ANPR accuracy</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plate, camera or location..."
          className="w-full rounded-xl border border-[#1B2330] bg-[#0D111A] py-3.5 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
        />
      </div>

      {/* DETECTION TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#1B2330] bg-[#0D111A]">
        <div className="border-b border-[#1B2330] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Detection Events</h2>

              <p className="mt-1 text-xs text-slate-500">
                Chronological vehicle recognition events.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              {filtered.length} EVENTS
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#1B2330]">
          {filtered.map((detection) => {
  const isWatchlist = watchlist.some(
    (vehicle) =>
      vehicle.is_active &&
      vehicle.plate_number === detection.plate_number
  );

            return (
              <div
                key={detection.id}
                className="flex items-center justify-between px-6 py-5 transition hover:bg-[#101722]"
              >
                {/* PLATE */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1B2330] bg-[#080B12]">
                    <Car size={17} className="text-slate-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm font-semibold text-slate-200">
                        {detection.plate_number}
                      </p>

                      {isWatchlist && (
                        <span className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1 text-[9px] font-semibold tracking-wider text-red-400">
                          WATCHLIST
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      {detection.id}
                    </p>
                  </div>
                </div>

                {/* CAMERA */}
                <div>
                  <p className="text-[10px] tracking-wider text-slate-600">
                    CAMERA
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <Camera size={12} />
                    {cameras.find((camera) => camera.id === detection.camera_id)?.name ||
                      `Camera ${detection.camera_id}`}
                  </p>
                </div>

                {/* LOCATION */}
                <div className="w-48">
                  <p className="text-[10px] tracking-wider text-slate-600">
                    LOCATION
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={12} />
                    {cameras.find((camera) => camera.id === detection.camera_id)?.location ||
                    "Unknown location"}
                  </p>
                </div>

                {/* TIME */}
                <div>
                  <p className="text-[10px] tracking-wider text-slate-600">
                    TIMESTAMP
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                    <Clock3 size={12} />
                    {new Date(detection.detected_at).toLocaleString()}
                  </p>
                </div>

                {/* CONFIDENCE */}
                <div className="text-right">
                  <p className="text-[10px] tracking-wider text-slate-600">
                    CONFIDENCE
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {detection.confidence != null? `${Math.round(detection.confidence * 100)}%`: "N/A"}
                  </p>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-600">
              No detection events found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}