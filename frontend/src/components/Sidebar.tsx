import {
  LayoutDashboard,
  Camera,
  Bell,
  Car,
  ListChecks,
  History,
  Map,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    section: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Cameras",
        path: "/cameras",
        icon: Camera,
      },
      {
        name: "Alerts",
        path: "/alerts",
        icon: Bell,
      },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      {
        name: "Vehicles",
        path: "/vehicles",
        icon: Car,
      },
      {
        name: "Watchlist",
        path: "/watchlist",
        icon: ListChecks,
      },
      {
        name: "Detection History",
        path: "/history",
        icon: History,
      },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      {
        name: "GIS Map",
        path: "/map",
        icon: Map,
      },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800/70 bg-[#0a0e16]">
      
      {/* Brand */}
      <div className="border-b border-slate-800/70 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
            <ShieldCheck size={19} className="text-blue-400" />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">
              GUJARAT
            </h1>

            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-500">
              CCTV INTELLIGENCE
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div key={group.section} className="mb-7">
            
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-600">
              {group.section}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                      }`
                    }
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      className="transition-transform group-hover:scale-105"
                    />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className="border-t border-slate-800/70 p-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>

          <div>
            <p className="text-xs font-medium text-slate-300">
              System Operational
            </p>

            <p className="text-[10px] text-slate-600">
              All services healthy
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}