"use client";

export default function RoadmapView({ analysis }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      {/* Map Placeholder */}
      <div className="glass h-64 relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <div className="text-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-indigo-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <p className="text-sm font-medium text-slate-300">Interactive Investigation Map</p>
            <p className="text-xs text-slate-500">{analysis.incident_information.address}</p>
          </div>
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-indigo-600/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Location Active</span>
          <span className="bg-fuchsia-600/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Hotspot Identified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-4 border-l-4 border-l-indigo-500">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Primary Address</h3>
          <p className="text-sm text-slate-200">{analysis.incident_information.address || "Unknown"}</p>
        </div>
        <div className="glass p-4 border-l-4 border-l-fuchsia-500">
          <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">IPC Sections</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {analysis.ipc_sections.map((s, i) => (
              <span key={i} className="bg-fuchsia-500/10 border border-fuchsia-500/30 px-2 py-0.5 rounded fuchsia-300">
                {s.section}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 underline decoration-indigo-500/50 underline-offset-4">
          Investigation Roadmap
        </h3>
        <div className="space-y-4">
          {analysis.investigation_roadmap.map((step, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all cursor-default">
                  {i + 1}
                </div>
                {i < analysis.investigation_roadmap.length - 1 && (
                  <div className="w-px h-full bg-white/10 mt-2"></div>
                )}
              </div>
              <p className="text-sm text-slate-300 pt-1.5 group-hover:text-white transition-colors">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6 border-indigo-500/20 bg-indigo-500/[0.02]">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">AI Suggestions</h3>
        <ul className="space-y-3">
          {analysis.ai_investigation_suggestions.map((suggest, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              {suggest}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nearby CCTV</h3>
          <div className="space-y-2">
            {analysis.nearby_cctv_sources.slice(0, 3).map((cctv, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{cctv.name}</span>
                <span className="text-indigo-400 font-mono">{cctv.distance_meters}m</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Escape Routes</h3>
          <div className="space-y-2">
            {analysis.possible_escape_routes.map((route, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{route.route_name}</span>
                <span className="text-fuchsia-400 uppercase">{route.direction}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
