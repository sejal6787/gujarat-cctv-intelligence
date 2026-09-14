import {
  Car,
  Camera,
  Clock3,
  MapPin,
  Search,
  ScanLine,
} from "lucide-react";
import { useState } from "react";

const detections = [
  {
    id: "DET-001",
    plate: "GJ01AB1234",
    camera: "CAM-017",
    location: "Ahmedabad Junction",
    time: "14:23:09",
    confidence: "96%",
    type: "WATCHLIST MATCH",
  },
  {
    id: "DET-002",
    plate: "GJ05RK7812",
    camera: "CAM-023",
    location: "SG Highway Entry",
    time: "14:18:42",
    confidence: "94%",
    type: "VEHICLE DETECTION",
  },
  {
    id: "DET-003",
    plate: "GJ03MN4421",
    camera: "CAM-031",
    location: "Ring Road North",
    time: "13:57:16",
    confidence: "92%",
    type: "WATCHLIST MATCH",
  },
  {
    id: "DET-004",
    plate: "GJ06PQ9123",
    camera: "CAM-042",
    location: "City Centre Junction",
    time: "13:41:08",
    confidence: "89%",
    type: "VEHICLE DETECTION",
  },
  {
    id: "DET-005",
    plate: "GJ01XY6621",
    camera: "CAM-049",
    location: "Airport Approach Road",
    time: "13:29:44",
    confidence: "91%",
    type: "VEHICLE DETECTION",
  },
];

export default function History() {
  const [search, setSearch] = useState("");

  const filtered = detections.filter((detection) => {
    const query = search.toLowerCase();

    return (
      detection.plate.toLowerCase().includes(query) ||
      detection.camera.toLowerCase().includes(query) ||
      detection.location.toLowerCase().includes(query)
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
          <p className="mt-3 text-3xl font-semibold">1,284</p>
          <p className="mt-1 text-xs text-slate-600">detections</p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">ANPR MATCHES</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">936</p>
          <p className="mt-1 text-xs text-slate-600">plates recognised</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">WATCHLIST MATCHES</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">06</p>
          <p className="mt-1 text-xs text-slate-600">generated today</p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">AVG CONFIDENCE</p>
          <p className="mt-3 text-3xl font-semibold">93.4%</p>
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
            const watchlist = detection.type === "WATCHLIST MATCH";

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
                        {detection.plate}
                      </p>

                      {watchlist && (
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
                    {detection.camera}
                  </p>
                </div>

                {/* LOCATION */}
                <div className="w-48">
                  <p className="text-[10px] tracking-wider text-slate-600">
                    LOCATION
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={12} />
                    {detection.location}
                  </p>
                </div>

                {/* TIME */}
                <div>
                  <p className="text-[10px] tracking-wider text-slate-600">
                    TIMESTAMP
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                    <Clock3 size={12} />
                    {detection.time}
                  </p>
                </div>

                {/* CONFIDENCE */}
                <div className="text-right">
                  <p className="text-[10px] tracking-wider text-slate-600">
                    CONFIDENCE
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {detection.confidence}
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