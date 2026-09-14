import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

const watchlist = [
  {
    plate: "GJ01AB1234",
    category: "VEHICLE OF INTEREST",
    priority: "CRITICAL",
    description: "Active investigation",
    lastSeen: "14:23:09",
    status: "ACTIVE",
  },
  {
    plate: "GJ05RK7812",
    category: "SUSPICIOUS VEHICLE",
    priority: "HIGH",
    description: "Flagged by authorised agency",
    lastSeen: "14:18:42",
    status: "ACTIVE",
  },
  {
    plate: "GJ03MN4421",
    category: "VEHICLE OF INTEREST",
    priority: "MEDIUM",
    description: "Under observation",
    lastSeen: "13:57:16",
    status: "ACTIVE",
  },
  {
    plate: "GJ06PQ9123",
    category: "MONITORING",
    priority: "LOW",
    description: "Routine monitoring",
    lastSeen: "13:41:08",
    status: "ACTIVE",
  },
];

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

  const filtered = watchlist.filter((vehicle) => {
    return (
      vehicle.plate.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.category.toLowerCase().includes(search.toLowerCase())
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
          <p className="mt-3 text-3xl font-semibold">128</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">CRITICAL</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">08</p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">HIGH PRIORITY</p>
          <p className="mt-3 text-3xl font-semibold text-orange-400">17</p>
        </div>

        <div className="rounded-xl border border-[#1B2330] bg-[#0D111A] p-5">
          <p className="text-xs text-slate-500">MATCHES TODAY</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">06</p>
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
              key={vehicle.plate}
              className="flex items-center justify-between px-6 py-5 transition hover:bg-[#101722]"
            >
              {/* VEHICLE */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1B2330] bg-[#080B12]">
                  <Car size={17} className="text-slate-500" />
                </div>

                <div>
                  <p className="font-mono text-sm font-semibold tracking-wide text-slate-200">
                    {vehicle.plate}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {vehicle.category}
                  </p>
                </div>
              </div>

              {/* PRIORITY */}
              <div>
                <p className="text-[10px] tracking-wider text-slate-600">
                  PRIORITY
                </p>

                <span
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider ${priorityStyle(
                    vehicle.priority
                  )}`}
                >
                  {vehicle.priority === "CRITICAL" ? (
                    <ShieldAlert size={11} />
                  ) : vehicle.priority === "HIGH" ? (
                    <AlertTriangle size={11} />
                  ) : (
                    <CheckCircle2 size={11} />
                  )}

                  {vehicle.priority}
                </span>
              </div>

              {/* DESCRIPTION */}
              <div className="w-52">
                <p className="text-[10px] tracking-wider text-slate-600">
                  DESCRIPTION
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {vehicle.description}
                </p>
              </div>

              {/* LAST SEEN */}
              <div>
                <p className="text-[10px] tracking-wider text-slate-600">
                  LAST DETECTED
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {vehicle.lastSeen}
                </p>
              </div>

              {/* STATUS */}
              <div className="text-right">
                <p className="text-[10px] tracking-wider text-slate-600">
                  STATUS
                </p>

                <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 size={12} />
                  {vehicle.status}
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