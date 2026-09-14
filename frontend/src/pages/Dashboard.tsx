import { Camera, Car, Bell, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "Active Cameras",
    value: "47 / 50",
    detail: "3 offline",
    icon: Camera,
  },
  {
    label: "Vehicles Detected",
    value: "1,284",
    detail: "Today",
    icon: Car,
  },
  {
    label: "Active Alerts",
    value: "04",
    detail: "2 high priority",
    icon: Bell,
  },
  {
    label: "Critical Alerts",
    value: "02",
    detail: "Requires attention",
    icon: AlertTriangle,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      
      {/* Page heading */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">
          Command Center
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
          System Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Real-time CCTV intelligence and situational awareness.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-[#0d111a] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  {stat.label}
                </p>

                <Icon size={17} className="text-slate-600" />
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">
                {stat.value}
              </p>

              <p className="mt-1 text-[11px] text-slate-600">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-5">
        
        {/* Activity */}
        <div className="col-span-2 rounded-xl border border-slate-800 bg-[#0d111a]">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-200">
              Recent Intelligence
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Latest vehicle detections and system events
            </p>
          </div>

          <div className="divide-y divide-slate-800/70">
            {[
              ["14:32:09", "GJ01AB1234", "CAM-017", "MATCH"],
              ["14:31:44", "GJ05XY7890", "CAM-023", "CLEAR"],
              ["14:29:18", "GJ10CD4567", "CAM-031", "CLEAR"],
              ["14:27:52", "GJ01AB1234", "CAM-008", "MATCH"],
            ].map(([time, plate, camera, status]) => (
              <div
                key={`${time}-${camera}`}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-5">
                  <span className="font-mono text-[11px] text-slate-600">
                    {time}
                  </span>

                  <span className="font-mono text-sm text-slate-300">
                    {plate}
                  </span>

                  <span className="text-xs text-slate-600">
                    {camera}
                  </span>
                </div>

                <span
                  className={
                    status === "MATCH"
                      ? "text-[10px] font-semibold tracking-wider text-red-400"
                      : "text-[10px] font-semibold tracking-wider text-emerald-400"
                  }
                >
                  ● {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert summary */}
        <div className="rounded-xl border border-slate-800 bg-[#0d111a]">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-200">
              Priority Alerts
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Requires immediate attention
            </p>
          </div>

          <div className="space-y-3 p-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-red-400">
                  HIGH PRIORITY
                </span>

                <span className="text-[10px] text-slate-600">
                  14:32
                </span>
              </div>

              <p className="mt-2 font-mono text-sm text-slate-200">
                GJ01AB1234
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Stolen vehicle · CAM-017
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-amber-400">
                  MEDIUM
                </span>

                <span className="text-[10px] text-slate-600">
                  13:58
                </span>
              </div>

              <p className="mt-2 font-mono text-sm text-slate-200">
                GJ05XY7890
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Blacklisted vehicle · CAM-023
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}