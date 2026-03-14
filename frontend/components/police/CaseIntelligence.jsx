"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ForensicChatbot from "@/components/ForensicChatbot";

// Dynamically import MapView to disable SSR
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map Intelligence...</div>
});

const CCTV_SOURCES = [
  "ATM Camera (High Angle)",
  "Traffic Signal Camera (RLVD/Speed)",
  "Mall Entrance/Exit Surveillance",
  "Petrol Pump Forecourt Camera",
  "Bank Security (Counter/Entrance)",
  "Commercial Complex Perimeter",
  "Residential Society Main Gate"
];

export default function CaseIntelligence({ firData }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCCTVLocation, setSelectedCCTVLocation] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!firData?.firstInformationContents) return;

    const analyzeCase = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/analyze-fir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: firData.firstInformationContents }),
        });
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error("Case analysis failed:", error);
      } finally {
        setLoading(false);
      }
    };

    analyzeCase();
  }, [firData?.id, firData?.firstInformationContents]);

  const handleGeneratePDF = async (location) => {
    if (!location || !analysis) return;
    setIsGeneratingPDF(true);
    try {
      const payload = {
        date: new Date().toLocaleDateString(),
        receiver_name: "The Manager / Security Head",
        organization: location.split('(')[0].trim(),
        address: typeof analysis.incident_information?.address === 'object' 
          ? Object.values(analysis.incident_information.address).filter(Boolean).join(", ")
          : analysis.incident_information?.address || firData.occurrenceAddress,
        phone: "+91-XXXXXXXXXX",
        officer_name: firData.investigationOfficerName || "Yogesh Sitaram Raut",
        officer_address: `${firData.policeStation}, Mumbai`,
        court_name: "Borivali Metropolitan Court",
        court_location: "Borivali West",
        cctv_date: firData.dateFrom || new Date().toLocaleDateString(),
        cctv_time: `${firData.timeFrom || "00:00"} to ${firData.timeTo || "23:59"} HRS`,
        cctv_location: location,
        mobile: "+91-98200XXXXX",
        email: "police.station@mahapolice.gov.in"
      };

      const res = await fetch("/api/generate-cctv-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("PDF Generation Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CCTV_Request_${location.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("PDF Generate Error:", e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] bg-slate-900/50 rounded-xl border border-white/5">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-bold text-slate-200 uppercase tracking-widest">Generating Tactical Intelligence</p>
          <p className="text-slate-500 max-w-xs mx-auto text-[10px] font-bold uppercase tracking-widest">
            Cross-referencing legal codes and mapping escape risks...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Tactical Map */}
      <div className="glass border-indigo-500/20 p-1 overflow-hidden">
        <MapView 
          center={[
            parseFloat(analysis.incident_information?.latitude || firData.latitude || 19.2045), 
            parseFloat(analysis.incident_information?.longitude || firData.longitude || 72.8710)
          ]} 
          markers={[
            ...(analysis.nearby_police_stations || []).map(p => ({ ...p, type: 'Police Station' })),
            ...(analysis.nearby_cctv_sources || []).map(p => ({ ...p, type: 'Surveillance Node' })),
          ]}
          hotspots={analysis.crime_hotspot_heatmap || []}
          onCCTVSelect={(source) => setSelectedCCTVLocation(source)}
          cctvSources={CCTV_SOURCES}
          selectedSource={selectedCCTVLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Investigation Roadmap */}
        <div className="glass p-6 border-l-4 border-l-indigo-500 bg-black/20">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Investigation Roadmap
          </h3>
          <div className="space-y-4">
            {(analysis.investigation_roadmap || []).map((step, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">
                    {i + 1}
                  </div>
                  {i < analysis.investigation_roadmap.length - 1 && (
                    <div className="w-px h-full bg-indigo-500/10 mt-2"></div>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Suspect & Escape Analysis */}
        <div className="space-y-6">
          <div className="glass p-6 border-l-4 border-l-red-500 bg-red-500/[0.02]">
            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Tactical Escape Risk</h3>
            <div className="space-y-4">
              {(analysis.escape_risk_analysis || []).map((risk, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block">{risk.type}</span>
                  <p className="text-xs text-slate-100 font-bold leading-snug">{risk.suggestion}</p>
                  <p className="text-[10px] text-slate-500 italic mt-1">{risk.tactical_reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Suspect Intelligence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-black">Build</span>
                <p className="text-xs text-slate-100 font-bold">{analysis.suspect_appearance?.height_build || "Unknown"}</p>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-black">Vehicle</span>
                <p className="text-xs text-amber-300 font-bold">{analysis.suspect_appearance?.vehicle_details || "Unknown"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] text-slate-500 uppercase font-black">Clothing</span>
                <p className="text-xs text-slate-100 font-bold">{analysis.suspect_appearance?.clothing || "Unknown"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Legal Suggestions */}
      <div className="glass p-8 border-t-4 border-t-fuchsia-600 bg-fuchsia-600/[0.02]">
        <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-8">AI Legal Suggestions (BNS / IPC)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(analysis.ipc_sections || []).map((s, i) => (
            <div key={i} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-fuchsia-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-fuchsia-600 text-white text-[9px] font-black px-2 py-1 rounded">SECTION {s.section}</div>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{s.act}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-2">{s.offence}</h4>
              <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">"{s.description}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CCTV Requisition */}
      <section className="glass p-6 border-t-4 border-t-cyan-500 bg-cyan-500/[0.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            Surveillance Requisition (CCTV)
          </h3>
          <button 
            disabled={!selectedCCTVLocation || isGeneratingPDF}
            onClick={() => handleGeneratePDF(selectedCCTVLocation)}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-black text-[9px] uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(6,182,212,0.3)]"
          >
            {isGeneratingPDF ? "Generating..." : "Download Request Letter"}
          </button>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedCCTVLocation}
            onChange={(e) => setSelectedCCTVLocation(e.target.value)}
            className="flex-1 bg-black/40 border border-slate-700 rounded-none px-4 py-2 text-[10px] text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 transition-all"
          >
            <option value="">Select Surveillance Node Type...</option>
            {CCTV_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-[3000]">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-full font-black uppercase tracking-widest text-[9px] transition-all bg-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 border-2 border-indigo-400/20"
          >
            Tactical AI Advisor
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </button>
        )}
      </div>

      <ForensicChatbot 
        context={{ ...analysis, fir_text: firData.firstInformationContents }} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}
