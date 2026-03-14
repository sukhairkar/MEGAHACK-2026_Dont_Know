
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Loader,
  XCircle,
  FileWarning,
  Scale,
  Shield,
  Info,
  Plus,
  Trash2,
  Users,
  Box,
  MapPin,
  Gavel
} from 'lucide-react';
import { FIRDocumentPreview } from '@/components/police/FIRDocumentPreview';
import CaseIntelligence from '@/components/police/CaseIntelligence';

interface AccusedDetails {
  id?: string;
  name: string;
  alias?: string;
  presentAddress?: string;
  relativeName?: string;
}

interface PropertyDetails {
  id?: string;
  value: number;
  category: string;
  type: string;
  description: string;
}

interface FIRSection {
  id?: string;
  act: string;
  section: string;
}

interface ComplainantId {
  id?: string;
  idType: string;
  idNumber: string;
}

interface InquestReport {
  id?: string;
  uidbNumber: string;
}

interface FIRReport {
  id: string;
  firNumber: string;
  district: string;
  policeStation: string;
  year: number;
  firDateTime: string;
  infoType: string;
  
  occurrenceDay: string;
  dateFrom: string;
  dateTo?: string;
  timeFrom: string;
  timeTo?: string;
  occurrenceAddress: string;
  
  directionFromPS?: string;
  distanceFromPS?: string;
  beatNo?: string;
  infoReceivedDate?: string;
  gdEntryNo?: string;
  gdDateTime?: string;
  delayReason?: string;
  outsidePSName?: string;
  outsideDistrict?: string;
  
  firstInformationContents: string;
  notes?: string;

  complainantName: string;
  complainantMobile: string;
  complainantRelativeName?: string;
  complainantBirthDate?: string;
  complainantUidNumber?: string;
  complainantNationality: string;
  complainantPassportNumber?: string;
  complainantPassportIssueDate?: string;
  complainantPassportIssuePlace?: string;
  complainantOccupation?: string;
  complainantCurrentAddress: string;
  complainantPermanentAddress?: string;
  complainantIds: ComplainantId[];
  
  sections: FIRSection[];
  accused: AccusedDetails[];
  properties: PropertyDetails[];
  inquestReports: InquestReport[];

  investigationOfficerName?: string;
  investigationOfficerRank?: string;
  investigationOfficerNumber?: string;
  courtDispatchDateTime?: string;

  totalPropertyValue: number;
  status: string;
  priority: string;
  latitude?: number;
  longitude?: number;
  pdf_url?: string;
  createdAt: string;
}

export default function FIRDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fir, setFir] = useState<FIRReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'general' | 'legal' | 'complainant' | 'accused' | 'assets' | 'location' | 'intelligence'>('general');

  useEffect(() => {
    const fetchFIR = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/fir/${id}`);
        if (!response.ok) throw new Error('Failed to load FIR details');
        const data = await response.json();
        setFir(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FIR details');
      } finally {
        setLoading(false);
      }
    };
    fetchFIR();
  }, [params]);

  const handleUpdate = async () => {
    if (!fir) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/fir/${fir.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fir),
      });

      if (!response.ok) throw new Error('Sync failed');
      setSuccess('PDF Regenerated & Synchronized.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setUpdating(false);
    }
  };

  const addSection = () => {
    if (!fir) return;
    setFir({ ...fir, sections: [...fir.sections, { act: 'IPC', section: '' }] });
  };

  const removeSection = (index: number) => {
    if (!fir) return;
    setFir({ ...fir, sections: fir.sections.filter((_, i) => i !== index) });
  };

  const addAccused = () => {
    if (!fir) return;
    setFir({ ...fir, accused: [...fir.accused, { name: 'Unknown', alias: '' }] });
  };

  const addProperty = () => {
    if (!fir) return;
    setFir({ ...fir, properties: [...fir.properties, { category: '', type: '', value: 0, description: '' }] });
  };

  const addComplainantId = () => {
    if (!fir) return;
    setFir({ ...fir, complainantIds: [...fir.complainantIds, { idType: 'Aadhaar', idNumber: '' }] });
  };

  const addInquestReport = () => {
    if (!fir) return;
    setFir({ ...fir, inquestReports: [...fir.inquestReports, { uidbNumber: '' }] });
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!fir) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Record Not Found</div>;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-white font-black text-xs uppercase tracking-[0.3em]">FIR Construction Terminal <span className="text-slate-500">//</span> {fir.firNumber}</h1>
          <div className="flex gap-4">
             <button onClick={() => setViewMode('split')} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${viewMode === 'split' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>Dual View</button>
             <button onClick={() => setViewMode('preview')} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${viewMode === 'preview' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>Review PDF</button>
          </div>
        </div>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className={`flex flex-col bg-slate-950 border-r border-white/10 transition-all ${viewMode === 'preview' ? 'w-0 opacity-0' : 'w-[45%] min-w-[500px]'}`}>
          <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto scrollbar-hide">
            {(['general', 'complainant', 'legal', 'accused', 'assets', 'location'] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-none px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-cyan-500 border-b-2 border-cyan-500 bg-white/5' : 'text-slate-500'}`}
              >
                {tab}
              </button>
            ))}
            <button 
              onClick={() => setActiveTab('intelligence')} 
              className={`flex-none px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'intelligence' ? 'text-amber-500 border-b-2 border-amber-500 bg-white/5 shadow-[inset_0_-2px_10px_rgba(245,158,11,0.1)]' : 'text-slate-500 hover:text-amber-400'}`}
            >
              Intelligence Hub
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {success && <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">{success}</div>}
            
            {activeTab === 'general' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-2 text-slate-300">
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4" /> 1. Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="District" value={fir.district} onChange={(v) => setFir({...fir, district: v})} />
                    <FormInput label="FIR Number" value={fir.firNumber} onChange={(v) => setFir({...fir, firNumber: v})} />
                    <FormInput label="Police Station" value={fir.policeStation} onChange={(v) => setFir({...fir, policeStation: v})} />
                    <FormInput label="Year" value={fir.year?.toString()} onChange={(v) => setFir({...fir, year: parseInt(v) || 2026})} />
                    <FormInput label="FIR Date & Time" value={fir.firDateTime} onChange={(v) => setFir({...fir, firDateTime: v})} />
                  </div>
                </div>

                {/* 3. Occurrence of Offence */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Box className="w-4 h-4" /> 3. Occurrence of Offence</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Occurrence Day" value={fir.occurrenceDay} onChange={(v) => setFir({...fir, occurrenceDay: v})} />
                    <FormInput label="Information Received Date" value={fir.infoReceivedDate} onChange={(v) => setFir({...fir, infoReceivedDate: v})} />
                    <FormInput label="Date From" value={fir.dateFrom} onChange={(v) => setFir({...fir, dateFrom: v})} />
                    <FormInput label="Date To" value={fir.dateTo} onChange={(v) => setFir({...fir, dateTo: v})} />
                    <FormInput label="Time From" value={fir.timeFrom} onChange={(v) => setFir({...fir, timeFrom: v})} />
                    <FormInput label="Time To" value={fir.timeTo} onChange={(v) => setFir({...fir, timeTo: v})} />
                    <FormInput label="GD Entry No" value={fir.gdEntryNo} onChange={(v) => setFir({...fir, gdEntryNo: v})} />
                    <FormInput label="GD Date & Time" value={fir.gdDateTime} onChange={(v) => setFir({...fir, gdDateTime: v})} />
                  </div>
                </div>

                {/* 4. Type of Information */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">4. Type of Information</h3>
                  <FormInput label="Info Type (Oral/Written)" value={fir.infoType} onChange={(v) => setFir({...fir, infoType: v})} />
                </div>

                {/* 8. Delay */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">8. Reasons for Delay</h3>
                  <textarea 
                    className="w-full h-20 bg-black border border-slate-800 p-4 text-slate-300 text-xs focus:border-cyan-500 outline-none"
                    value={fir.delayReason || ''}
                    onChange={(e) => setFir({...fir, delayReason: e.target.value})}
                  />
                </div>

                {/* 12. Contents */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">12. First Information Contents</h3>
                  <textarea 
                    className="w-full h-64 bg-black border border-slate-800 p-4 text-slate-300 text-xs font-mono focus:border-cyan-500 outline-none leading-relaxed"
                    placeholder="ENTER FULL CASE NARRATIVE HERE..."
                    value={fir.firstInformationContents}
                    onChange={(e) => setFir({...fir, firstInformationContents: e.target.value})}
                  />
                </div>
              </div>
            )}

            {activeTab === 'complainant' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-2 text-slate-300">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> 6. Complainant Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Full Name" value={fir.complainantName} onChange={(v) => setFir({...fir, complainantName: v})} />
                    <FormInput label="Relative Name" value={fir.complainantRelativeName} onChange={(v) => setFir({...fir, complainantRelativeName: v})} />
                    <FormInput label="Birth Date" value={fir.complainantBirthDate} onChange={(v) => setFir({...fir, complainantBirthDate: v})} />
                    <FormInput label="Nationality" value={fir.complainantNationality} onChange={(v) => setFir({...fir, complainantNationality: v})} />
                    <FormInput label="UID / Aadhaar" value={fir.complainantUidNumber} onChange={(v) => setFir({...fir, complainantUidNumber: v})} />
                    <FormInput label="Mobile" value={fir.complainantMobile} onChange={(v) => setFir({...fir, complainantMobile: v})} />
                    <FormInput label="Occupation" value={fir.complainantOccupation} onChange={(v) => setFir({...fir, complainantOccupation: v})} />
                  </div>
                  <FormInput label="Current Address" value={fir.complainantCurrentAddress} onChange={(v) => setFir({...fir, complainantCurrentAddress: v})} />
                  <FormInput label="Permanent Address" value={fir.complainantPermanentAddress} onChange={(v) => setFir({...fir, complainantPermanentAddress: v})} />
                </div>

                {/* Passport Details */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Passport Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormInput label="Passport No" value={fir.complainantPassportNumber} onChange={(v) => setFir({...fir, complainantPassportNumber: v})} />
                    <FormInput label="Issue Date" value={fir.complainantPassportIssueDate} onChange={(v) => setFir({...fir, complainantPassportIssueDate: v})} />
                    <FormInput label="Issue Place" value={fir.complainantPassportIssuePlace} onChange={(v) => setFir({...fir, complainantPassportIssuePlace: v})} />
                  </div>
                </div>

                {/* Complainant IDs Table */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Other Identity Documents</h4>
                    <Button onClick={addComplainantId} variant="outline" className="h-6 text-[7px] border-slate-700 bg-transparent text-cyan-500 font-black"><Plus className="w-2 h-2 mr-1" /> Add ID</Button>
                  </div>
                  {fir.complainantIds.map((cid, i) => (
                    <div key={i} className="flex gap-3 items-end group">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                         <FormInput label="ID Type" value={cid.idType} onChange={(v) => {
                            const next = [...fir.complainantIds]; next[i].idType = v; setFir({...fir, complainantIds: next});
                         }} />
                         <FormInput label="ID Number" value={cid.idNumber} onChange={(v) => {
                            const next = [...fir.complainantIds]; next[i].idNumber = v; setFir({...fir, complainantIds: next});
                         }} />
                      </div>
                      <button onClick={() => setFir({...fir, complainantIds: fir.complainantIds.filter((_, idx) => idx !== i)})} className="mb-2 p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-2 text-slate-300">
                {/* 2. Sections */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Gavel className="w-4 h-4" /> 2. Penal Sections</h3>
                     <Button onClick={addSection} variant="outline" className="h-7 text-[8px] border-slate-700 bg-transparent text-cyan-500 font-black"><Plus className="w-3 h-3 mr-1" /> Add Act/Sec</Button>
                  </div>
                  <div className="space-y-3">
                    {fir.sections.map((s, i) => (
                      <div key={i} className="flex gap-3 items-end group">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <FormInput label="Act / Law" value={s.act} onChange={(v) => {
                            const newSecs = [...fir.sections]; newSecs[i].act = v; setFir({...fir, sections: newSecs});
                          }} />
                          <FormInput label="Section No" value={s.section} onChange={(v) => {
                            const newSecs = [...fir.sections]; newSecs[i].section = v; setFir({...fir, sections: newSecs});
                          }} />
                        </div>
                        <button onClick={() => removeSection(i)} className="mb-2 p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 11. Inquest Reports */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                     <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">11. Inquest / UIDB Case</h3>
                     <Button onClick={addInquestReport} variant="outline" className="h-7 text-[8px] border-slate-700 bg-transparent text-cyan-500 font-black"><Plus className="w-3 h-3 mr-1" /> Add Case</Button>
                  </div>
                  {fir.inquestReports.map((ir, i) => (
                    <div key={i} className="flex gap-3 items-end group">
                      <FormInput label="UIDB Number" value={ir.uidbNumber} onChange={(v) => {
                         const next = [...fir.inquestReports]; next[i].uidbNumber = v; setFir({...fir, inquestReports: next});
                      }} />
                      <button onClick={() => setFir({...fir, inquestReports: fir.inquestReports.filter((_, idx) => idx !== i)})} className="mb-2 p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                {/* 13. Action Taken */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4" /> 13. Action Taken (I.O.)</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <FormInput label="Investigating Officer" value={fir.investigationOfficerName} onChange={(v) => setFir({...fir, investigationOfficerName: v})} />
                      <FormInput label="Rank" value={fir.investigationOfficerRank} onChange={(v) => setFir({...fir, investigationOfficerRank: v})} />
                      <FormInput label="I.O. ID" value={fir.investigationOfficerNumber} onChange={(v) => setFir({...fir, investigationOfficerNumber: v})} />
                      <FormInput label="15. Court Dispatch Date/Time" value={fir.courtDispatchDateTime} onChange={(v) => setFir({...fir, courtDispatchDateTime: v})} />
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'accused' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 text-slate-300">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> 7. Accused Persons</h3>
                   <Button onClick={addAccused} variant="outline" className="h-7 text-[8px] border-slate-700 bg-transparent text-cyan-500 font-black"><Plus className="w-3 h-3 mr-1" /> Add Person</Button>
                </div>
                <div className="space-y-6">
                  {fir.accused.map((a, i) => (
                    <div key={i} className="p-4 bg-black/40 border border-slate-800 space-y-4 relative group">
                      <button onClick={() => setFir({...fir, accused: fir.accused.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                      <FormInput label="Legal Name" value={a.name} onChange={(v) => {
                        const next = [...fir.accused]; next[i].name = v; setFir({...fir, accused: next});
                      }} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Alias" value={a.alias} onChange={(v) => {
                          const next = [...fir.accused]; next[i].alias = v; setFir({...fir, accused: next});
                        }} />
                        <FormInput label="Relative Name" value={a.relativeName} onChange={(v) => {
                          const next = [...fir.accused]; next[i].relativeName = v; setFir({...fir, accused: next});
                        }} />
                      </div>
                      <FormInput label="Present Address" value={a.presentAddress} onChange={(v) => {
                        const next = [...fir.accused]; next[i].presentAddress = v; setFir({...fir, accused: next});
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-2 text-slate-300">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Box className="w-4 h-4" /> 9 & 10. Property Inventory</h3>
                   <Button onClick={addProperty} variant="outline" className="h-7 text-[8px] border-slate-700 bg-transparent text-cyan-500 font-black"><Plus className="w-3 h-3 mr-1" /> Add Property</Button>
                </div>
                <div className="space-y-4">
                  {fir.properties.map((p, i) => (
                    <div key={i} className="p-4 bg-black/20 border border-white/5 space-y-4 group">
                       <div className="grid grid-cols-2 gap-4">
                          <FormInput label="Category" value={p.category} onChange={(v) => { const next = [...fir.properties]; next[i].category = v; setFir({...fir, properties: next}); }} />
                          <FormInput label="Type" value={p.type} onChange={(v) => { const next = [...fir.properties]; next[i].type = v; setFir({...fir, properties: next}); }} />
                       </div>
                       <div className="grid grid-cols-2 gap-4 items-end">
                          <FormInput label="Value (₹)" value={p.value} onChange={(v) => { const next = [...fir.properties]; next[i].value = parseInt(v) || 0; setFir({...fir, properties: next}); }} />
                          <div className="flex justify-end">
                             <button onClick={() => setFir({...fir, properties: fir.properties.filter((_, idx) => idx !== i)})} className="p-2 text-slate-800 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                       <FormInput label="Item Description" value={p.description} onChange={(v) => { const next = [...fir.properties]; next[i].description = v; setFir({...fir, properties: next}); }} />
                    </div>
                  ))}
                  <div className="p-4 bg-cyan-950/10 border border-cyan-500/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Total Valuation</span>
                    <span className="text-xl font-black text-white">₹ {fir.properties.reduce((acc, p) => acc + (p.value || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-2 text-slate-300">
                {/* 5. Place of Occurrence */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4" /> 5. Place of Occurrence</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Direction from PS" value={fir.directionFromPS} onChange={(v) => setFir({...fir, directionFromPS: v})} />
                    <FormInput label="Distance from PS" value={fir.distanceFromPS} onChange={(v) => setFir({...fir, distanceFromPS: v})} />
                    <FormInput label="Beat No" value={fir.beatNo} onChange={(v) => setFir({...fir, beatNo: v})} />
                  </div>
                  <FormInput label="Full Address / Location" value={fir.occurrenceAddress} onChange={(v) => setFir({...fir, occurrenceAddress: v})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outside Jurisdiction (If Applicable)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Police Station Name" value={fir.outsidePSName} onChange={(v) => setFir({...fir, outsidePSName: v})} />
                    <FormInput label="District / State" value={fir.outsideDistrict} onChange={(v) => setFir({...fir, outsideDistrict: v})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <CaseIntelligence firData={fir} />
              </div>
            )}

            <div className="pt-8 border-t border-white/5">
              <Button 
                onClick={handleUpdate} 
                disabled={updating}
                className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-none shadow-[0_0_30px_-10px_rgba(6,182,212,0.5)] transition-all"
              >
                {updating ? <Loader className="w-4 h-4 animate-spin mr-3" /> : "Commit Case Updates & Regenerate PDF"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Live Preview */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-12 scrollbar-hide">
           <div className="max-w-[850px] mx-auto scale-[0.85] origin-top">
              <FIRDocumentPreview data={fir} isDraft={fir.status === 'Open'} isEditable={false} />
           </div>
        </main>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string; value?: any; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1 group">
      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-0.5 group-focus-within:text-cyan-500">{label}</label>
      <input 
         type="text" 
         value={value || ''} 
         onChange={(e) => onChange(e.target.value)} 
         className="w-full h-9 bg-black border border-slate-800 px-3 text-[10px] font-bold text-slate-300 outline-none focus:border-cyan-500 transition-all border-l-2 focus:border-l-cyan-500"
      />
    </div>
  );
}
