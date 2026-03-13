"use client";

import { useState } from "react";

export default function FIRForm({ onAnalysisComplete, setLoading, loading }) {
  const [firText, setFirText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-fir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: firText }),
      });
      const data = await response.json();
      onAnalysisComplete(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleLoad = () => {
    setFirText(`First Information Report (FIR)
District: Brihanmumbai City, P.S.: Samta Nagar, Year: 2026
FIR No.: 0249, Date: 05/03/2026
IPC Sections: 420, 467, 468, 409, 120-B
Place: Plot No 19, Akuli Road, Kandivali East, Mumbai.
Complainant: Jasmine Vrajlal Shah
Accused: Shashikant R Shinde, Anuradha S Shinde, Ratan R Kalaro
Details: Fraud involving 100 shares of M/S TITAN INDUSTRIES LIMITED...`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">FIR Contents / Text</label>
        <textarea
          className="w-full h-64 bg-black/40 border border-white/10 rounded-lg p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          placeholder="Paste FIR text here or upload image..."
          value={firText}
          onChange={(e) => setFirText(e.target.value)}
        ></textarea>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading || !firText.trim()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all glow-primary flex items-center justify-center gap-2"
        >
          {loading ? "Analyzing..." : "Generate Roadmap"}
          {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>}
        </button>
        
        <button
          type="button"
          onClick={handleSampleLoad}
          className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-lg text-slate-300 transition-all flex items-center justify-center gap-2"
        >
          Try Sample
        </button>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">
          <span>Or Upload Documentation</span>
        </div>
        <div className="mt-3 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-slate-500 group-hover:text-indigo-400 transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p className="text-sm">Drag & drop FIR images or PDF</p>
          <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 10MB</p>
        </div>
      </div>
    </form>
  );
}
