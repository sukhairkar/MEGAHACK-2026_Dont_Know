
import React from 'react';
import { Shield, Landmark, Scale, ShieldCheck } from 'lucide-react';

interface FIRDocumentPreviewProps {
  data: any;
  isDraft?: boolean;
}

export const FIRDocumentPreview: React.FC<FIRDocumentPreviewProps> = ({ data, isDraft = true }) => {
  if (!data) return null;

  return (
    <div className="bg-white shadow-2xl mx-auto w-full max-w-[800px] min-h-[1100px] p-12 text-slate-900 font-serif relative overflow-hidden border border-slate-200">
      {/* Draft Watermark */}
      {isDraft && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] pointer-events-none opacity-[0.03] select-none">
          <h1 className="text-[120px] font-black tracking-tighter uppercase whitespace-nowrap">
            DRAFT REPORT
          </h1>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex justify-center mb-4">
          <Landmark className="w-12 h-12 text-slate-800" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Maharashtra Police</h1>
        <h2 className="text-lg font-bold">First Information Report (FIR)</h2>
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mt-2">Under Section 154 Cr.P.C.</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">District</span>
            <span className="font-bold border-b border-slate-200 block pb-1">{data.district || '__________'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">FIR Number</span>
            <span className="font-bold border-b border-slate-200 block pb-1">{data.firNumber || 'DRAFT'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 text-sm">
          <div>
            <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">Police Station</span>
            <span className="font-bold border-b border-slate-200 block pb-1">{data.policeStation || '__________'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">Year</span>
            <span className="font-bold border-b border-slate-200 block pb-1">{data.year || '__________'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">Date & Time of FIR</span>
            <span className="font-bold border-b border-slate-200 block pb-1">{data.firDateTime ? new Date(data.firDateTime).toLocaleString() : '__________'}</span>
          </div>
        </div>

        {/* Narrative Section - The core of real-time editing */}
        <div className="mt-10 border-2 border-slate-900 p-8 min-h-[300px] relative">
          <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Scale className="w-4 h-4" /> First Information Contents
          </div>
          <p className="text-slate-800 leading-relaxed italic text-lg line-clamp-none whitespace-pre-wrap">
            {data.firstInformationContents || data.notes || "No content provided."}
          </p>
        </div>

        {/* Complainant Section */}
        <div className="mt-10">
          <h3 className="text-xs font-black uppercase border-b-2 border-slate-900 pb-1 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" /> Complainant Details
          </h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="block text-[10px] uppercase font-black text-slate-300">Name</span>
              <span className="font-bold">{data.complainantName || '__________'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-black text-slate-300">Contact Signal</span>
              <span className="font-bold">{data.complainantMobile || '__________'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] uppercase font-black text-slate-300">Occurrence Address</span>
              <span className="font-bold italic">{data.occurrenceAddress || '__________'}</span>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="mt-10">
          <h3 className="text-xs font-black uppercase border-b-2 border-slate-900 pb-1 mb-4 flex items-center gap-2 text-slate-900">
            Property Valuation / Recoverable Assets
          </h3>
          <div className="bg-slate-50 p-6 border border-slate-200">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Valuation Estimate</p>
                <p className="text-2xl font-black text-slate-900">₹{(data.totalPropertyValue || 0).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Items Logged</p>
                <p className="text-xl font-black text-slate-900">{data.properties?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="mt-auto pt-20 flex justify-between items-end text-center opacity-50">
          <div className="w-48 border-t border-slate-900 pt-2">
            <p className="text-[8px] font-black uppercase">Signature / Thumb Impression of Complainant</p>
          </div>
          <div className="w-64 border-t border-slate-900 pt-2">
            <Landmark className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="text-[8px] font-black uppercase">Signature of Officer in Charge</p>
            <p className="text-[10px] font-bold">{data.policeStation}</p>
          </div>
        </div>
      </div>
      
      {/* Document Watermark Seal */}
      <div className="absolute bottom-12 left-10 opacity-[0.05] grayscale">
        <Landmark className="w-32 h-32" />
      </div>
    </div>
  );
};
