import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import type {
  WatchlistVehicle,
  Alert,
  Detection,
} from "../services/api";



function priorityStyle(priority: string) {
  if (priority === "CRITICAL") {
    return "border-red-500/30 bg-red-500/5 text-red-400";
  }

  if (priority === "HIGH") {
    return "border-orange-500/30 bg-orange-500/5 text-orange-400";
  }

  if (priority === "MEDIUM") {
    return "border-yellow-500/20 bg-yellow-500/5 text-yellow-400";
  }

  return "border-blue-500/20 bg-blue-500/5 text-blue-400";
}

export default function Watchlist() {
  const [search, setSearch] = useState("");
    const [watchlist, setWatchlist] = useState<WatchlistVehicle[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [detections, setDetections] = useState<Detection[]>([]);



  useEffect(() => {
  api.getWatchlist().then(setWatchlist).catch(console.error);
  api.getAlerts().then(setAlerts).catch(console.error);
  api.getDetections().then(setDetections).catch(console.error);
}, []);

  const filtered = watchlist.filter((vehicle) => {
  const query = search.toLowerCase();

  return (
    vehicle.plate_number.toLowerCase().includes(query) ||
    vehicle.reason?.toLowerCase().includes(query)
  );
});

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-blue-400">
            AUTHORISED INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Watchlist
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Authorised vehicle watchlist and matching configuration.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-500">
          <Plus size={15} />
          Add Vehicle
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">TOTAL ENTRIES</p>
          <p className="mt-3 text-3xl font-semibold">{watchlist.length}</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">CRITICAL</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">
            {alerts.filter(
    (alert) =>
      alert.severity.toLowerCase() === "critical" &&
      watchlist.some(
        (vehicle) =>
          vehicle.is_active &&
          vehicle.plate_number === alert.plate_number
      )
  ).length}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">HIGH PRIORITY</p>
          <p className="mt-3 text-3xl font-semibold text-orange-400">
            {alerts.filter(
    (alert) =>
      alert.severity.toLowerCase() === "high" &&
      watchlist.some(
        (vehicle) =>
          vehicle.is_active &&
          vehicle.plate_number === alert.plate_number
      )
  ).length}
          </p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">MATCHES TODAY</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">
  {alerts.filter(
  (alert) =>
    new Date(alert.created_at).toDateString() === new Date().toDateString()
).length}
</p>
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
          placeholder="Search registration number or category..."
          className="w-full rounded-xl border border-[#1B2330] bg-[#0D111A] py-3.5 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
        />
      </div>

      {/* WATCHLIST TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#1B2330] bg-[#0D111A]">
        <div className="border-b border-[#1B2330] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Registered Vehicles</h2>

              <p className="mt-1 text-xs text-slate-500">
                Vehicles authorised for automated detection matching.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              {filtered.length} SHOWN
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#1B2330]">
          {filtered.map((vehicle) => (
            <div
              key={vehicle.plate_number}
              className="flex items-center justify-between px-6 py-5 transition hover:bg-[#101722]"
            >
              {/* VEHICLE */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1B2330] bg-[#080B12]">
                  <Car size={17} className="text-slate-500" />
                </div>

                <div>
                  <p className="font-mono text-sm font-semibold tracking-wide text-slate-200">
                   {vehicle.plate_number}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                  {vehicle.reason || "No reason provided"}
                </p>
                </div>
              </div>

              {/* PRIORITY */}
<div>
  <p className="text-[10px] tracking-wider text-slate-600">
    PRIORITY
  </p>

  {(() => {
    const vehicleAlerts = alerts.filter(
      (alert) => alert.plate_number === vehicle.plate_number
    );

    const hasCritical = vehicleAlerts.some(
      (alert) => alert.severity.toLowerCase() === "critical"
    );

    const hasHigh = vehicleAlerts.some(
      (alert) => alert.severity.toLowerCase() === "high"
    );

    const priority = hasCritical
      ? "CRITICAL"
      : hasHigh
      ? "HIGH"
      : "NORMAL";

    return (
      <span
        className={`mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider ${priorityStyle(
          priority
        )}`}
      >
        {priority === "CRITICAL" ? (
          <ShieldAlert size={11} />
        ) : priority === "HIGH" ? (
          <AlertTriangle size={11} />
        ) : (
          <CheckCircle2 size={11} />
        )}

        {priority}
      </span>
    );
  })()}
</div>
              {/* DESCRIPTION */}
              <div className="w-52">
                <p className="text-[10px] tracking-wider text-slate-600">
                  DESCRIPTION
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {vehicle.reason || "No reason provided"}
                </p>
              </div>

              {/* LAST SEEN */}
              <div>
                <p className="text-[10px] tracking-wider text-slate-600">
                  LAST DETECTED
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {(() => {
                     const latestDetection = detections
                       .filter(
                        (detection) =>
                       detection.plate_number === vehicle.plate_number
                        )
                        .sort(
                         (a, b) =>
                         new Date(b.detected_at).getTime() -
                         new Date(a.detected_at).getTime()
                        )[0];

                       return latestDetection
                        ? new Date(latestDetection.detected_at).toLocaleString()
                       : "No detection";
                    })()}
                </p>
              </div>

              {/* STATUS */}
              <div className="text-right">
                <p className="text-[10px] tracking-wider text-slate-600">
                  STATUS
                </p>

                <p
                  className={`mt-1 flex items-center justify-end gap-1.5 text-xs ${
                     vehicle.is_active ? "text-emerald-400" : "text-slate-500"
                      }`}
                >
                  {vehicle.is_active ? (
  <CheckCircle2 size={12} />
) : (
  <AlertTriangle size={12} />
)}
                    {vehicle.is_active ? "ACTIVE" : "INACTIVE"}
                </p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-600">
              No watchlist vehicles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}