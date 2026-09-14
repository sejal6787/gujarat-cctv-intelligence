import {
  Car,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useState } from "react";

const detections = [
  {
    time: "14:23:09",
    camera: "CAM-017",
    location: "Ahmedabad Junction",
    confidence: "96%",
  },
  {
    time: "14:11:42",
    camera: "CAM-023",
    location: "SG Highway Entry",
    confidence: "94%",
  },
  {
    time: "13:48:16",
    camera: "CAM-011",
    location: "Ashram Road",
    confidence: "92%",
  },
  {
    time: "13:26:51",
    camera: "CAM-006",
    location: "Navrangpura",
    confidence: "89%",
  },
];

export default function Vehicles() {
  const [plate, setPlate] = useState("GJ01AB1234");
  const [searchedPlate, setSearchedPlate] = useState("GJ01AB1234");

  const handleSearch = () => {
    if (plate.trim()) {
      setSearchedPlate(plate.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-blue-400">
          VEHICLE INTELLIGENCE
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Vehicle Search
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Search ANPR detections and reconstruct vehicle movement across cameras.
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 rounded-xl border border-[#1B2330] bg-[#0D111A] p-4">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Enter registration number..."
            className="w-full rounded-lg border border-[#1B2330] bg-[#080B12] py-3 pl-11 pr-4 font-mono text-sm uppercase text-slate-200 outline-none placeholder:font-sans placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>

        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Search Vehicle
        </button>
      </div>

      {/* VEHICLE PROFILE */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-xl border border-[#1B2330] bg-[#0D111A] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/5">
                <Car size={22} className="text-blue-400" />
              </div>

              <div>
                <p className="text-xs tracking-wider text-slate-600">
                  REGISTRATION NUMBER
                </p>

                <p className="mt-1 font-mono text-2xl font-semibold tracking-wide">
                  {searchedPlate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
              <ShieldCheck size={14} className="text-red-400" />

              <span className="text-xs font-medium text-red-400">
                WATCHLIST MATCH
              </span>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-6 border-t border-[#1B2330] pt-6">
            <div>
              <p className="text-[10px] tracking-wider text-slate-600">
                TOTAL DETECTIONS
              </p>
              <p className="mt-2 text-xl font-semibold">24</p>
            </div>

            <div>
              <p className="text-[10px] tracking-wider text-slate-600">
                CAMERAS SEEN
              </p>
              <p className="mt-2 text-xl font-semibold">08</p>
            </div>

            <div>
              <p className="text-[10px] tracking-wider text-slate-600">
                LAST DETECTED
              </p>
              <p className="mt-2 text-xl font-semibold">14:23:09</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target size={17} className="text-blue-400" />
            Current Status
          </div>

          <div className="mt-6">
            <p className="text-xs text-slate-600">LAST KNOWN LOCATION</p>

            <p className="mt-2 text-sm font-medium text-slate-200">
              Ahmedabad Junction
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={12} />
              Ahmedabad, Gujarat
            </p>
          </div>

          <div className="mt-6 border-t border-[#1B2330] pt-5">
            <p className="text-xs text-slate-600">MOVEMENT STATUS</p>

            <p className="mt-2 text-sm font-medium text-emerald-400">
              ACTIVE TRACK
            </p>
          </div>
        </div>
      </div>

      {/* DETECTION HISTORY */}
      <div className="overflow-hidden rounded-xl border border-[#1B2330] bg-[#0D111A]">
        <div className="border-b border-[#1B2330] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Detection History</h2>

              <p className="mt-1 text-xs text-slate-500">
                Cross-camera detections for {searchedPlate}.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              24 TOTAL EVENTS
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#1B2330]">
          {detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-5 transition hover:bg-[#101722]"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1B2330] bg-[#080B12]">
                  <Clock3 size={17} className="text-slate-500" />
                </div>

                <div>
                  <p className="font-medium text-slate-200">
                    {detection.time}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {detection.camera}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] tracking-wider text-slate-600">
                    LOCATION
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={12} />
                    {detection.location}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] tracking-wider text-slate-600">
                    ANPR CONFIDENCE
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {detection.confidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}