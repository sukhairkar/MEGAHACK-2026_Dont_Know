"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-800 animate-pulse rounded-xl" />
});

export default function RoadmapView({ analysis }) {
  if (!analysis) return null;

  const markers = [
    ...(analysis.nearby_police_stations || []).map(p => ({ ...p, type: 'Police Station' })),
    ...(analysis.nearby_cctv_sources || []).map(p => ({ ...p, type: 'Surveillance Node' }))
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      {/* Real Interactive Map for Historical Records */}
      <div className="glass overflow-hidden h-[350px] border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
        <MapView 
          center={[
            parseFloat(analysis.incident_information?.latitude || 19.2045), 
            parseFloat(analysis.incident_information?.longitude || 72.8710)
          ]} 
          markers={markers}
          hotspots={analysis.crime_hotspot_heatmap || []}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-5 border-l-4 border-l-indigo-500 bg-white/[0.01]">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Verified Crime Scene</h3>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">{analysis.incident_information.address || "Unknown Location"}</p>
        </div>
        <div className="glass p-5 border-l-4 border-l-fuchsia-500 bg-white/[0.01]">
          <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-2">Legal Classification</h3>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {analysis.ipc_sections.length > 0 ? (
              analysis.ipc_sections.map((s, i) => (
                <div key={i} className="flex flex-col">
                   <span className="font-bold text-slate-100 bg-fuchsia-500/20 px-2 py-1 rounded border border-fuchsia-500/30">
                     Section {s.section}
                   </span>
                </div>
              ))
            ) : (
              <span className="text-slate-500 italic">No legal sections identified.</span>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Deep Dive (Added descriptions for Roadmap Library) */}
      <div className="glass p-6 border-t-2 border-t-fuchsia-600/50">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Forensic Legal Analysis</h3>
         <div className="space-y-4">
           {analysis.ipc_sections.map((s, i) => (
             <div key={i} className="border-b border-white/5 pb-4 last:border-0">
               <p className="text-[11px] font-bold text-fuchsia-400 mb-1">{s.offence}</p>
               <p className="text-xs text-slate-300 italic leading-relaxed">"{s.description}"</p>
             </div>
           ))}
         </div>
      </div>

      <div className="glass p-6 bg-white/[0.01] border-l-4 border-l-indigo-600">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 underline decoration-indigo-500/30 underline-offset-8">
          Historical Investigation Roadmap
        </h3>
        <div className="space-y-5">
          {analysis.investigation_roadmap.map((step, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[11px] font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  {i + 1}
                </div>
                {i < analysis.investigation_roadmap.length - 1 && (
                  <div className="w-px h-full bg-indigo-500/10 mt-2"></div>
                )}
              </div>
              <p className="text-xs text-slate-300 pt-1 group-hover:text-white transition-colors leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6 border-indigo-500/10 bg-indigo-500/[0.01]">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Tactical Suggestions</h3>
        <ul className="space-y-3">
          {analysis.ai_investigation_suggestions.length > 0 ? (
            analysis.ai_investigation_suggestions.map((suggest, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></span>
                {suggest}
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500 italic">No suggestions available for this case.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
