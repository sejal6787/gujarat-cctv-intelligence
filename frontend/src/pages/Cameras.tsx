import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { Camera as CameraType } from "../services/api";


import {
  Camera,
  Circle,
  Maximize2,
  MapPin,
  ScanLine,
  Wifi,
} from "lucide-react";


export default function Cameras() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const [cameras, setCameras] = useState<CameraType[]>([]);

useEffect(() => {
  api.getCameras().then(setCameras).catch(console.error);
}, []);

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const matchesSearch =
        String(camera.id).toLowerCase().includes(search.toLowerCase()) ||
        camera.name.toLowerCase().includes(search.toLowerCase()) ||
        camera.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || camera.status === statusFilter;

      const matchesSource =
        sourceFilter === "ALL" || camera.type === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [cameras, search, statusFilter, sourceFilter]);

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-blue-400">
            SURVEILLANCE NETWORK
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Camera Monitoring
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Live surveillance feeds and AI monitoring across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#1B2330] bg-[#0D111A] px-4 py-2.5">
          <Wifi size={15} className="text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">
            47 / 50 STREAMS ACTIVE
          </span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-3 rounded-xl border border-[#1B2330] bg-[#0D111A] p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search camera ID or location..."
          className="min-w-0 flex-1 rounded-lg border border-[#1B2330] bg-[#080B12] px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#1B2330] bg-[#080B12] px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-[#1B2330] bg-[#080B12] px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="ALL">All Sources</option>
          <option value="IP Camera">IP Camera</option>
          <option value="RTSP">RTSP</option>
          <option value="ONVIF">ONVIF</option>
        </select>

        <div className="whitespace-nowrap px-3 text-xs text-slate-500">
          {filteredCameras.length} cameras
        </div>
      </div>

      {/* CAMERA GRID */}
      <div className="grid grid-cols-2 gap-5">
        {filteredCameras.map((camera) => {
          const online = camera.status === "ONLINE";

          return (
            <div
              key={camera.id}
              className="group overflow-hidden rounded-xl border border-[#1B2330] bg-[#0D111A]"
            >
              {/* VIDEO AREA */}
              <div className="relative aspect-video overflow-hidden bg-[#080B12]">
                {/* Simulated CCTV feed */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#172033_0%,#0A0E16_55%,#080B12_100%)]" />

                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-1/4 top-0 h-full border-l border-slate-500" />
                  <div className="absolute left-2/4 top-0 h-full border-l border-slate-500" />
                  <div className="absolute left-3/4 top-0 h-full border-l border-slate-500" />
                  <div className="absolute top-1/3 left-0 w-full border-t border-slate-500" />
                  <div className="absolute top-2/3 left-0 w-full border-t border-slate-500" />
                </div>

                {/* CCTV scan effect */}
                {online && (
                  <div className="absolute left-0 right-0 top-1/2 border-t border-blue-400/20" />
                )}

                {/* Top overlay */}
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1.5 backdrop-blur">
                    <Circle
                      size={7}
                      fill="currentColor"
                      className={
                        online ? "text-emerald-400" : "text-red-400"
                      }
                    />

                    <span className="text-[10px] font-semibold tracking-wider text-slate-200">
                      {camera.status}
                    </span>
                  </div>

                  <div className="rounded-md bg-black/60 px-2.5 py-1.5 text-[10px] text-slate-400 backdrop-blur">
                    25 FPS
                  </div>
                </div>

                {/* Center camera icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {online ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/5">
                        <Camera size={24} className="text-blue-400/70" />
                      </div>

                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                        Live Feed
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Circle size={28} className="text-red-400/60" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-400/70">
                        Signal Lost
                      </span>
                    </div>
                  )}
                </div>

                {/* AI detection badge */}
                {online && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-blue-400/20 bg-black/60 px-2.5 py-1.5 backdrop-blur">
                    <ScanLine size={13} className="text-blue-400" />
                    <span className="text-[10px] text-blue-300">
                      AI ANALYSIS ACTIVE
                    </span>
                  </div>
                )}

                {/* Expand button */}
                <button className="absolute bottom-4 right-4 rounded-md border border-white/10 bg-black/60 p-2 text-slate-400 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:text-white">
                  <Maximize2 size={14} />
                </button>
              </div>

              {/* CAMERA INFO */}
              <div className="flex items-center justify-between border-t border-[#1B2330] px-5 py-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-100">
                      {camera.id}
                    </p>

                    <span className="text-xs text-slate-600">•</span>

                    <p className="text-xs text-slate-500">
                      {camera.type}
                    </p>
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={13} />
                    {camera.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] tracking-wider text-slate-600">
                    LOCATION
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {camera.location}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}