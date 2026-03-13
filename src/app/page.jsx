"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ForensicChatbot from "@/components/ForensicChatbot";

// Dynamically import MapView to disable SSR
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map...</div>
});

// --- Main Page Component ---
export default function Home() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firText, setFirText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCCTVLocation, setSelectedCCTVLocation] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const CCTV_SOURCES = [
    "ATM Camera (High Angle)",
    "Traffic Signal Camera (RLVD/Speed)",
    "Mall Entrance/Exit Surveillance",
    "Petrol Pump Forecourt Camera",
    "Bank Security (Counter/Entrance)",
    "Commercial Complex Perimeter",
    "Residential Society Main Gate"
  ];

  const syncToFastAPI = async (currentAnalysis, text) => {
    if (!currentAnalysis || currentAnalysis.error) return;
    const payload = {
      case_id: currentAnalysis.incident_information?.plus_code || "case_001",
      fir_text: text,
      roadmap: (currentAnalysis.investigation_roadmap || []).map((step, idx) => ({
        step_id: idx + 1,
        title: step.split(": ")[0] || "Investigation Step",
        description: step,
        status: "pending",
        priority: "high"
      })),
      generated_at: new Date().toISOString(),
      ipc_suggestions: currentAnalysis.ai_investigation_suggestions || []
    };
    try {
      await fetch("/api/save-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("[Intelligence] Context synced to backend.");
    } catch (err) {
      console.warn("[Intelligence] Backend Sync failed.");
    }
  };

  useEffect(() => {
    setLoading(true);
    // Initial fetch using the dummy data logic or calling the API with sample
    const fetchInitialData = async () => {
      try {
        const sampleText = `--- LIVE DOCUMENT ANALYSIS: FIR 0288/2026 ---
DISTRICT: Brihanmumbai City, P.S.: Samta Nagar, Year: 2026.
FIR NO: 0288, DATE/TIME: ${new Date().toLocaleDateString()} 18:30.
SECTIONS: IPC 392, 394 (Robbery with Hurt).
LOCATION: Link Road, Mahavir Nagar, Kandivali West, Mumbai.
INVESTIGATION OFFICER: Inspector Yogesh Sitaram Raut (PCM492922).
COMPLAINANT: Sunita Sharma, Age 42.
ACCUSED: Two unknown persons on a black Pulsar motorcycle, wearing helmets.
DETAILS: Complainant was walking near Link Road, Mahavir Nagar at around 6:30 pm today when a black Pulsar motorcycle came from behind. One accused snatched a 25 grams gold mangalsutra (Value ₹1,50,000) from her neck and fled at high speed. Complainant sustained minor neck injuries during the scuffle.`;

        const response = await fetch("/api/analyze-fir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sampleText }),
        });
        const data = await response.json();
        setAnalysis(data);
        setFirText(sampleText);
        syncToFastAPI(data, sampleText);
      } catch (error) {
        console.error("Initial load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleGeneratePDF = async (location) => {
    if (!location) return;
    setIsGeneratingPDF(true);
    try {
      const payload = {
        date: new Date().toLocaleDateString(),
        receiver_name: "The Manager / Security Head",
        organization: location.split('(')[0].trim(),
        address: typeof analysis.incident_information.address === 'object' 
          ? Object.values(analysis.incident_information.address).filter(Boolean).join(", ")
          : analysis.incident_information.address,
        phone: "+91-XXXXXXXXXX",
        officer_name: "Yogesh Sitaram Raut",
        officer_address: `${analysis.incident_information.police_station}, Mumbai`,
        court_name: "Borivali Metropolitan Court",
        court_location: "Borivali West",
        cctv_date: analysis.incident_information.datetime || "05/03/2026",
        cctv_time: "18:00 to 20:00 HRS",
        cctv_location: location,
        mobile: "+91-98200XXXXX",
        email: "yogesh.raut@mahapolice.gov.in"
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

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Tactical <span className="gradient-text">Crime Intelligence Hub</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Live Database Feed: <span className="text-emerald-400 font-semibold underline decoration-emerald-500/30">
            {analysis?.incident_information?.police_station || 'Samta Nagar'} {analysis?.incident_information?.district ? `(${analysis.incident_information.district})` : ''} Jurisdiction
          </span>. 
          Real-world hotspot mapping and surveillance intelligence.
        </p>
      </header>

      {/* Intelligence Grid Start */}
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
              {analysis.is_emergency && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4 text-amber-200">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Intelligence Degraded (Offline Mode)</p>
                    <p className="text-xs opacity-70">AI rate limit reached. Using static forensic parsing. Tactical hotspots and nearby nodes are still active, but roadmap generated might be generic.</p>
                  </div>
                </div>
              )}
              
              {/* BLOCK 1: Map at Top */}
              <div className="glass border-indigo-500/10 p-1">
                <MapView 
                  center={[
                    parseFloat(analysis.incident_information?.latitude || 19.2045), 
                    parseFloat(analysis.incident_information?.longitude || 72.8710)
                  ]} 
                  markers={[
                    ...(analysis.nearby_police_stations || []).map(p => ({ ...p, type: 'Police Station' })),
                    ...(analysis.nearby_cctv_sources || []).map(p => ({ ...p, type: 'Surveillance Node' })),
                    ...(analysis.map_visualization?.anchor_location ? [{ ...analysis.map_visualization.anchor_location, type: 'Police Station' }] : [])
                  ]}
                  hotspots={analysis.crime_hotspot_heatmap || []}
                  onCCTVSelect={(source) => setSelectedCCTVLocation(source)}
                  cctvSources={CCTV_SOURCES}
                  selectedSource={selectedCCTVLocation}
                />
              </div>

              {/* BLOCK 2 & 3: Location Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 border-l-4 border-l-indigo-500 flex flex-col justify-center bg-white/[0.01]">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Target Address</h3>
                  <p className="text-lg text-slate-100 font-medium leading-relaxed">
                    {typeof analysis.incident_information.address === 'object' && analysis.incident_information.address !== null
                      ? Object.values(analysis.incident_information.address).filter(Boolean).join(", ")
                      : analysis.incident_information.address}
                  </p>
                  {analysis.incident_information.police_station && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3">
                      {analysis.nearby_police_stations?.length > 0 && (
                        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter block">Nearest Response Unit</span>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-200">
                              {[...analysis.nearby_police_stations].sort((a,b) => a.distance_meters - b.distance_meters)[0].name}
                            </p>
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {([...analysis.nearby_police_stations].sort((a,b) => a.distance_meters - b.distance_meters)[0].distance_meters / 1000).toFixed(2)} km
                            </span>
                          </div>
                        </div>
                      )}
                      {analysis.incident_information.district && (
                        <div className="bg-slate-500/10 p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block">District</span>
                          <p className="text-sm font-bold text-slate-300">{analysis.incident_information.district}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="glass p-6 border-l-4 border-l-emerald-500 bg-white/[0.01]">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Precise Location Intelligence</h3>
                  <div className="flex flex-col gap-3 font-mono">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">LATITUDE</span>
                      <span className="text-slate-200 bg-slate-800/50 px-3 py-1 rounded-md border border-white/5">{analysis.incident_information.latitude}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">LONGITUDE</span>
                      <span className="text-slate-200 bg-slate-800/50 px-3 py-1 rounded-md border border-white/5">{analysis.incident_information.longitude}</span>
                    </div>
                    <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tightest opacity-70">Digital Address (Plus Code)</span>
                      <span className="text-sm text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 text-center font-bold tracking-wider">
                        {analysis.incident_information.plus_code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CCTV Request Generator Section */}
              <section className="glass p-6 border-fuchsia-500/20 bg-fuchsia-500/[0.02] animate-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                    Surveillance Requisition (CCTV Request)
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                    Jurisdiction: {analysis.incident_information.police_station}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Generate an official request letter for CCTV footage based on the current <span className="text-fuchsia-400 font-bold">Tactical Selection</span> from the map intelligence.
                    </p>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex flex-col gap-2 bg-white/[0.03] p-3 rounded-lg">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Tactical Node Selection</label>
                        <select 
                          value={selectedCCTVLocation}
                          onChange={(e) => setSelectedCCTVLocation(e.target.value)}
                          className="w-full bg-black/40 border border-fuchsia-500/20 rounded-lg px-3 py-2 text-xs text-fuchsia-300 font-bold focus:outline-none focus:border-fuchsia-500/50 transition-all cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">Select Node Type...</option>
                          {CCTV_SOURCES.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.03] p-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Investigation Officer</span>
                        <span className="text-xs text-slate-300">Insp. Yogesh Raut</span>
                      </div>
                    </div>
                    <button 
                      disabled={!selectedCCTVLocation || isGeneratingPDF}
                      onClick={() => handleGeneratePDF(selectedCCTVLocation)}
                      className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale bg-fuchsia-600 text-white shadow-[0_10px_30px_rgba(192,38,211,0.3)] hover:shadow-[0_15px_40px_rgba(192,38,211,0.5)] active:scale-95"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating Official PDF...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Generate CCTV Request Letter
                        </>
                      )}
                    </button>
                  </div>
                  <div className="hidden lg:block border-l border-white/5 pl-8">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Tactical Intelligence Overview</h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-white/[0.01] rounded-lg border border-white/5">
                        <span className="text-[10px] text-fuchsia-500 font-bold block mb-1">AUTOMATED GEOCONTEXT</span>
                        <p className="text-[11px] text-slate-400 italic">The generated letter will automatically include the mapped coordinates and crime scene radius for legal validity.</p>
                      </div>
                      <div className="p-3 bg-white/[0.01] rounded-lg border border-white/5">
                        <span className="text-[10px] text-emerald-500 font-bold block mb-1">STAMP & SIGNATURE READY</span>
                        <p className="text-[11px] text-slate-400 italic">Template includes designated areas for official police stamps and case identifiers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FIR Intelligence Input (Moved Below Requisition) */}
              <section className="glass p-6 border-indigo-500/20 bg-indigo-500/[0.03]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Case Source Intelligence
                  </h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <button 
                        onClick={async () => {
                           setLoading(true);
                           try {
                             const res = await fetch("/api/analyze-fir", {
                               method: "POST",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ text: firText }),
                             });
                             const data = await res.json();
                             setAnalysis(data);
                             setIsEditing(false);
                             syncToFastAPI(data, firText);
                           } catch (e) { console.error(e); } finally { setLoading(false); }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase px-6 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        ✓ DONE & SYNC
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase px-4 py-2 rounded-lg border border-white/10 transition-all"
                      >
                        ✎ EDIT FIR
                      </button>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <textarea 
                    value={firText}
                    onChange={(e) => setFirText(e.target.value)}
                    className="w-full h-40 bg-black/40 border border-indigo-500/30 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono leading-relaxed"
                    placeholder="Enter FIR text for strategic analysis..."
                  />
                ) : (
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-slate-400 font-mono italic truncate">
                      {firText || "No intelligence source loaded."}
                    </p>
                  </div>
                )}
              </section>

              {/* Legal Sections */}
              <div className="glass p-8 border-t-4 border-t-fuchsia-600 bg-fuchsia-600/[0.02]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-2 h-7 bg-fuchsia-600 rounded-full"></span>
                    Legal Provisions & Penal Clauses
                  </h3>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowLegalDetails(!showLegalDetails)}
                      className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all duration-300 ${
                        showLegalDetails 
                        ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
                        : 'bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/10'
                      }`}
                    >
                      {showLegalDetails ? '✕ Hide All Details' : '👁 Show All Details'}
                    </button>
                    <span className="hidden md:inline-block text-[12px] text-fuchsia-400 font-bold uppercase tracking-widest bg-fuchsia-500/5 px-4 py-1.5 rounded-full border border-fuchsia-500/10">
                      BNS / IPC References
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {(analysis.ipc_sections || []).map((s, i) => (
                    <div 
                      key={i} 
                      className={`group relative glass p-6 rounded-xl border-white/5 transition-all duration-300 cursor-help ${
                        showLegalDetails 
                        ? 'border-fuchsia-500/40 bg-fuchsia-500/[0.05]' 
                        : 'hover:border-fuchsia-500/40 hover:bg-fuchsia-500/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-fuchsia-600 text-white text-xs font-black px-3 py-1.5 rounded shadow-[0_0_10px_rgba(192,38,211,0.3)]">
                           SECTION {s.section}
                        </div>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-tighter opacity-60">{s.act}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-100 group-hover:text-fuchsia-300 transition-colors mb-1">
                        {s.offence}
                      </h4>
                      <div className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out ${
                        showLegalDetails 
                        ? 'max-h-[500px] opacity-100' 
                        : 'max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100'
                      }`}>
                         <div className="pt-4 border-t border-fuchsia-500/20 space-y-4">
                           <p className="text-sm text-slate-300 leading-relaxed italic">"{s.description}"</p>
                           {s.punishment && (
                             <div className="bg-fuchsia-500/5 p-3 rounded-lg border border-fuchsia-500/10">
                               <span className="text-[11px] font-black text-fuchsia-400 uppercase tracking-tighter block mb-1.5">Max Punishment</span>
                               <p className="text-xs text-slate-200 font-medium leading-normal">{s.punishment}</p>
                             </div>
                           )}
                           {s.nature && (
                             <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                               <span className="text-[11px] font-black text-emerald-400 uppercase tracking-tighter block mb-1.5">Nature of Offence</span>
                               <p className="text-xs text-slate-200 font-medium leading-normal">{s.nature}</p>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation Roadmap */}
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
                  {/* CARD 1: Suspect Appearance */}
                  <div className="glass p-5 bg-white/[0.02] border-t-2 border-t-amber-500/50">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Suspect Appearance Info</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1 border-b border-white/5 pb-2.5">
                        <span className="text-[11px] text-slate-500 uppercase font-black tracking-tight">Build / Height</span>
                        <span className="text-base text-slate-100 font-medium">{analysis.suspect_appearance?.height_build || "Unknown"}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-b border-white/5 pb-2.5">
                        <span className="text-[11px] text-slate-500 uppercase font-black tracking-tight">Clothing</span>
                        <span className="text-base text-slate-100 font-medium">{analysis.suspect_appearance?.clothing || "Unknown"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500 uppercase font-black tracking-tight">Vehicle Intel</span>
                        <span className="text-lg text-amber-300 font-black tracking-wide leading-tight">{analysis.suspect_appearance?.vehicle_details || "Unknown"}</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Tactical Escape Risk */}
                  <div className="glass p-5 bg-white/[0.02] border-t-2 border-t-red-500/50">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Tactical Escape Risk</h3>
                    <div className="space-y-4">
                      {(analysis.escape_risk_analysis || []).map((risk, i) => (
                        <div key={i} className="space-y-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">
                            {risk.type}
                          </span>
                          <p className="text-sm text-slate-50 text-balance font-bold leading-snug">
                            {risk.suggestion}
                          </p>
                          <p className="text-xs text-slate-400 italic mt-1 leading-relaxed">
                            {risk.tactical_reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARD 3: Emergency Response Hubs */}
                  <div className="glass p-4 bg-white/[0.02] border-t-2 border-t-emerald-500/50">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Emergency Hubs</h3>
                    <div className="space-y-2">
                      {(analysis.nearby_police_stations || []).slice(0, 3).map((station, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                          <span className="text-slate-300 truncate max-w-[100px]">{station.name}</span>
                          <span className="text-slate-500 font-mono">{(station.distance_meters / 1000).toFixed(1)}km</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARD 4: Surveillance Nodes */}
                  <div className="glass p-4 bg-white/[0.02] border-t-2 border-t-indigo-500/50">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Camera Nodes</h3>
                    <div className="space-y-2">
                      {(analysis.nearby_cctv_sources || []).slice(0, 3).map((cctv, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                          <span className="text-slate-300 truncate max-w-[100px]">{cctv.name}</span>
                          <span className="text-slate-500 font-mono">{cctv.distance_meters}m</span>
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

      {/* Chatbot Toggle Button (Disappears when open) */}
      {!isChatOpen && (
        <div className="fixed bottom-3 right-2 z-[2100]">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="group relative flex items-center gap-3 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-500 bg-indigo-600 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)] hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            Consult AI Strategist
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </button>
        </div>
      )}

      <ForensicChatbot 
        context={{ ...analysis, fir_text: firText }} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}
