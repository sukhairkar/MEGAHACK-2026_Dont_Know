"use client";

import { useState, useEffect } from "react";
import RoadmapView from "@/components/RoadmapView";
import ForensicChatbot from "@/components/ForensicChatbot";

export default function RoadmapPage() {
  const [firs, setFirs] = useState([]);
  const [selectedFir, setSelectedFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const syncToFastAPI = async (currentFir) => {
    if (!currentFir) return;
    const payload = {
      case_id: currentFir.plus_code || currentFir.id,
      fir_text: currentFir.fir_text || "Historical Record",
      roadmap: Array.isArray(currentFir.investigation_roadmap) 
        ? currentFir.investigation_roadmap.map((step, idx) => ({
            step_id: idx+1, title: "Step", description: step, status: "pending", priority: "high"
          }))
        : [],
      generated_at: new Date().toISOString(),
      ipc_suggestions: currentFir.suggestions || []
    };
    try {
      await fetch("/api/save-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.warn("Backend Sync failed."); }
  };

  useEffect(() => {
    if (selectedFir) syncToFastAPI(selectedFir);
  }, [selectedFir]);

  useEffect(() => {
    const fetchFirs = async () => {
      try {
        const res = await fetch("/api/analyze-fir");
        const data = await res.json();
        if (Array.isArray(data)) {
          setFirs(data);
          // Auto-select the first one if available
          if (data.length > 0) setSelectedFir(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch FIR roadmaps:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFirs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
          Strategic <span className="gradient-text">Roadmap Library</span>
        </h1>
        <p className="text-slate-400">
          Accessing historical intelligence nodes and investigation roadmaps across all jurisdictions.
        </p>
      </header>

      {loading ? (
        <div className="glass p-20 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Fetching Tactical Data...</p>
        </div>
      ) : firs.length === 0 ? (
        <div className="glass p-20 text-center border-dashed border-white/5">
          <p className="text-slate-500 italic">No historical roadmaps found. Analyze an FIR to generate intelligence nodes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Case List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Recently Analyzed Cases</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {firs.map((fir) => (
                <button
                  key={fir.id}
                  onClick={() => setSelectedFir(fir)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    selectedFir?.id === fir.id
                      ? "bg-indigo-600/20 border-indigo-500/50 shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
                      : "glass border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded text-white uppercase">
                      FIR {fir.fir_no || "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(fir.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 ${selectedFir?.id === fir.id ? "text-indigo-300" : "text-slate-200"}`}>
                    {fir.police_station}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{fir.address}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main: Analysis Details */}
          <div className="lg:col-span-8">
            {selectedFir ? (
              <div className="animate-in slide-in-from-right duration-500">
                {/* Remap the stored flat structure to the nested 'analysis' structure RoadmapView expects */}
                <RoadmapView 
                   analysis={{
                     incident_information: { 
                       address: selectedFir.address,
                       latitude: selectedFir.latitude,
                       longitude: selectedFir.longitude,
                       plus_code: selectedFir.plus_code,
                       police_station: selectedFir.police_station,
                       district: selectedFir.district
                     },
                     ipc_sections: Array.isArray(selectedFir.ipc_sections) ? selectedFir.ipc_sections : [],
                     investigation_roadmap: Array.isArray(selectedFir.investigation_roadmap) ? selectedFir.investigation_roadmap : [],
                     ai_investigation_suggestions: Array.isArray(selectedFir.suggestions) ? selectedFir.suggestions : [],
                     nearby_cctv_sources: [], // we don't store Overpass results yet, show empty or placeholder
                     possible_escape_routes: []
                   }} 
                />
              </div>
            ) : (
              <div className="glass h-full flex items-center justify-center text-slate-500 italic">
                Select a case from the strategic library to view its investigation roadmap.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button (Disappears when open) */}
      {!isChatOpen && (
        <div className="fixed bottom-10 right-6 z-[2100]">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-500 bg-indigo-600 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)]"
          >
            Consult AI Strategist
          </button>
        </div>
      )}

      <ForensicChatbot 
        context={selectedFir} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}
