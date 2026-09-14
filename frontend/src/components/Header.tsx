import { Search, Bell, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/70 bg-[#080b12]/90 px-8 backdrop-blur">
      
      {/* Search */}
      <div className="relative w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
        />

        <input
          type="text"
          placeholder="Search vehicle, camera or alert..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-4 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          LIVE SYSTEM
        </div>

        <button className="relative text-slate-500 transition hover:text-slate-200">
          <Bell size={18} />

          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            4
          </span>
        </button>

        <div className="flex items-center gap-2 border-l border-slate-800 pl-5">
          <CircleUserRound size={19} className="text-slate-500" />

          <div>
            <p className="text-xs font-medium text-slate-300">
              Control Room
            </p>

            <p className="text-[10px] text-slate-600">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}