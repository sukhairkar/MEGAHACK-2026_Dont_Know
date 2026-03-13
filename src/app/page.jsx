"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapView to disable SSR
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map...</div>
});

// --- Main Page Component ---
export default function Home() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Initial fetch using the dummy data logic or calling the API with sample
    const fetchInitialData = async () => {
      try {
        const sampleText = `First Information Report (FIR)
District: Brihanmumbai City, P.S.: Samta Nagar, Year: 2026
FIR No.: 0249, Date: 05/03/2026
IPC Sections: 420, 467, 468, 409, 120-B
Place: Plot No 19, Akuli Road, Kandivali East, Mumbai.
Complainant: Jasmine Vrajlal Shah
Accused: Shashikant R Shinde, Anuradha S Shinde, Ratan R Kalaro
Details: Fraud involving 100 shares of M/S TITAN INDUSTRIES LIMITED...`;

        const response = await fetch("/api/analyze-fir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sampleText }),
        });
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error("Initial load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Tactical <span className="gradient-text">Crime Intelligence Hub</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Live Database Feed: <span className="text-emerald-400 font-semibold underline decoration-emerald-500/30">Samta Nagar Jurisdiction</span>. 
          Real-world hotspot mapping and surveillance intelligence.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-6">
          {loading ? (
            <div className="glass p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium text-slate-200">Processing Real-time Intelligence</p>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                  Geocoding incident location and querying nearby surveillance sources...
                </p>
              </div>
            </div>
          ) : analysis && !analysis.error ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              {/* Dynamic Leaflet Map */}
              <div className="glass overflow-hidden border-indigo-500/10">
                <MapView 
                  center={[
                    parseFloat(analysis.incident_information?.latitude || 19.2045), 
                    parseFloat(analysis.incident_information?.longitude || 72.8710)
                  ]} 
                  markers={[
                    ...(analysis.nearby_police_stations || []).map(p => ({ ...p, type: 'Police Station' })),
                    ...(analysis.nearby_cctv_sources || []).map(p => ({ ...p, type: 'Surveillance Node' }))
                  ]}
                  hotspots={analysis.crime_hotspot_heatmap || []}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 border-l-4 border-l-indigo-500">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Target Address</h3>
                  <p className="text-sm text-slate-200">
                    {typeof analysis.incident_information.address === 'object' && analysis.incident_information.address !== null
                      ? Object.values(analysis.incident_information.address).filter(Boolean).join(", ")
                      : analysis.incident_information.address || "Unknown"}
                  </p>
                </div>
                <div className="glass p-4 border-l-4 border-l-emerald-500">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Coordinates</h3>
                  <div className="flex flex-col gap-1 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">LAT:</span>
                      <span className="text-slate-200">{analysis.incident_information.latitude}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">LNG:</span>
                      <span className="text-slate-200">{analysis.incident_information.longitude}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Plus Code</span>
                      <span className="text-[11px] text-slate-300 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        {analysis.incident_information.plus_code}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="glass p-4 border-l-4 border-l-fuchsia-500">
                  <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Legal Sections</h3>
                  <div className="flex flex-col gap-3">
                    {analysis.ipc_sections.map((s, i) => (
                      <div key={i} className="group relative">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-fuchsia-500/10 border border-fuchsia-500/30 px-2 py-0.5 rounded text-fuchsia-300 text-[10px] font-bold">
                            {s.section}
                          </span>
                          <span className="text-xs text-slate-200 font-semibold">{s.offence}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight group-hover:text-slate-300 transition-colors">
                          {s.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 underline decoration-indigo-500/50 underline-offset-8">
                  Investigation Roadmap
                </h3>
                <div className="space-y-6">
                  {analysis.investigation_roadmap.map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all cursor-default">
                          {i + 1}
                        </div>
                        {i < analysis.investigation_roadmap.length - 1 && (
                          <div className="w-px h-full bg-indigo-500/10 mt-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 pt-1.5 group-hover:text-white transition-colors leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6 border-indigo-500/10">
                   <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Strategic Suggestions</h3>
                   <ul className="space-y-4">
                     {analysis.ai_investigation_suggestions.map((suggest, i) => (
                       <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                         {suggest}
                       </li>
                     ))}
                   </ul>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass p-4 bg-white/[0.02] border-t-2 border-t-indigo-500/50">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Verified Surveillance nodes</h3>
                    <div className="space-y-3">
                      {(analysis.nearby_cctv_sources || []).slice(0, 8).map((cctv, i) => (
                        <div key={i} className="flex justify-between items-start text-xs border-b border-white/5 pb-2">
                          <div className="flex flex-col gap-0.5">
                            <span className={`font-medium ${cctv.is_real ? 'text-indigo-400' : 'text-slate-300'} truncate max-w-[120px]`}>
                              {cctv.name}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                              {cctv.is_real ? '📍 Verified' : '🤖 Suggested'}
                            </span>
                          </div>
                          <span className="text-slate-500 font-mono shrink-0">{cctv.distance_meters}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass p-4 bg-white/[0.02]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Escape Risk</h3>
                    <div className="space-y-3">
                      {analysis.possible_escape_routes.map((route, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                          <span className="text-slate-300">{route.route_name}</span>
                          <span className="text-fuchsia-400 font-bold uppercase tracking-tighter">{route.direction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
