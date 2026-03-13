'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle,
  Shield,
  Loader,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  Search,
  Landmark,
  Scale,
  Calendar,
  Briefcase,
  UserSquare2,
  Lock,
  MessageSquare,
  FileWarning,
  Gavel,
  History,
  UserCircle2,
  Package,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccusedDetails {
  id: string;
  name: string;
  alias?: string;
  presentAddress?: string;
  relativeName?: string;
}

interface PropertyDetails {
  id: string;
  value: number;
  category: string;
  type: string;
  description: string;
}

interface FIRReport {
  id: string;
  firNumber: string;
  district: string;
  policeStation: string;
  year: number;
  firDateTime: string;
  infoType: string;
  region: string;
  
  occurrenceDay: string;
  dateFrom: string;
  dateTo?: string;
  timeFrom: string;
  timeTo?: string;
  occurrenceAddress: string;
  directionFromPS: string;
  distanceFromPS: string;
  beatNo: string;

  infoReceivedDate: string;
  gdEntryNo: string;
  gdDateTime: string;
  delayReason?: string;

  outsidePSName?: string;
  outsideDistrict?: string;

  firstInformationContents: string;

  act: string;
  section: string;

  complainantName: string;
  complainantRelativeName: string;
  complainantBirthDate: string;
  complainantNationality: string;
  complainantUidNumber: string;
  complainantOccupation: string;
  complainantMobile: string;
  complainantCurrentAddress: string;
  complainantPermanentAddress: string;
  
  accused: AccusedDetails[];
  properties: PropertyDetails[];
  totalPropertyValue: number;

  status: 'Open' | 'Under Investigation' | 'Closed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  investigationOfficerName?: string;
  investigationOfficerRank?: string;
  investigationOfficerNumber?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FIRDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [firId, setFirId] = useState<string>('');
  const { user, loading: authLoading, isOfficer } = useAuth();

  const [fir, setFir] = useState<FIRReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    notes: '',
  });

  useEffect(() => {
    params.then(p => setFirId(p.id));
  }, [params]);

  useEffect(() => {
    if (authLoading || !firId) return;

    if (!isOfficer) {
      router.push('/police/login');
      return;
    }

    const fetchFir = async () => {
      try {
        const response = await fetch(`/api/fir/${firId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch FIR details');
        }
        const data = await response.json();
        setFir(data);
        setFormData({
          status: data.status,
          priority: data.priority,
          notes: data.notes || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FIR details');
      } finally {
        setLoading(false);
      }
    };

    fetchFir();
  }, [authLoading, isOfficer, router, firId]);


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fir) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/fir/${fir.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status || fir.status,
          priority: formData.priority || fir.priority,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update FIR');
      }

      setFir(data.fir);
      setSuccess('Case record updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FIR');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async () => {
    setUpdating(true);
    setError('');
    try {
      const response = await fetch(`/api/fir/${fir?.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Under Investigation',
          notes: (formData.notes ? formData.notes + '\n\n' : '') + `[OFFICIAL VERIFICATION] Complaint authenticated by Officer ${user?.email} on ${new Date().toLocaleString()}. Investigation procedures initiated.`,
        }),
      });
      if (!response.ok) throw new Error('Verification failed');
      const data = await response.json();
      setFir(data.fir);
      setSuccess('Case verified and investigation status set to ACTIVE');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Case Ledger...</p>
        </div>
      </div>
    );
  }

  if (!fir) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <FileWarning className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Case Record Not Found</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8">Unauthorized identifier or deleted record.</p>
        <Button onClick={() => router.push('/police/dashboard')} className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest px-8 h-12 rounded-none">
          Return to Command Center
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-500">OFFICIAL CASE RECORD</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span className="flex items-center gap-2"><Lock className="w-3 h-3" /> End-to-End Encrypted Access</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center border-2 border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all rounded-none">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">FIR #{fir.firNumber}</h1>
                 <div className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest ${
                    fir.status === 'Pending' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                    fir.status === 'Open' ? 'text-red-600 border-red-200 bg-red-50' :
                    fir.status === 'Under Investigation' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                    'text-emerald-600 border-emerald-200 bg-emerald-50'
                 }`}>
                    {fir.status}
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">District: {fir.district} / Division: {fir.policeStation} / Year: {fir.year}</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Priority</p>
             <span className={`text-sm font-black uppercase tracking-tight ${
                fir.priority === 'Critical' ? 'text-red-600' :
                fir.priority === 'High' ? 'text-orange-600' :
                fir.priority === 'Medium' ? 'text-yellow-600' :
                'text-blue-600'
             }`}>{fir.priority} Level</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-10">
        <div className="grid lg:grid-cols-12 gap-10">
           {/* Primary Case Content */}
           <div className="lg:col-span-8 space-y-10">
              {error && (
                <div className="p-5 bg-red-50 border-l-4 border-red-500 animate-fade-in text-red-700">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> System Error</p>
                  <p className="text-xs font-bold leading-normal">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-5 bg-emerald-50 border-l-4 border-emerald-500 animate-fade-in text-emerald-700">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> System Success</p>
                  <p className="text-xs font-bold leading-normal">{success}</p>
                </div>
              )}

              {/* Case Narrative */}
              <section className="space-y-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-500" /> First Information Contents</h3>
                 <div className="bg-white border-2 border-slate-200 p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Scale className="w-24 h-24" />
                    </div>
                    <p className="text-slate-800 text-lg font-serif leading-relaxed italic whitespace-pre-wrap relative z-10">
                       "{fir.firstInformationContents}"
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Captured via {fir.infoType || 'Secure Digital'} Entry</span>
                       <span className="flex items-center gap-2 text-slate-500"><Shield className="w-3 h-3" /> Verbatim Integrity Verified</span>
                    </div>
                 </div>
              </section>

              {/* Multi-Section Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                 <DetailsBlock title="Occurrence Context" icon={Calendar}>
                    <DetailEntry label="Incident Day/Date" value={`${fir.occurrenceDay}, ${new Date(fir.dateFrom).toLocaleDateString()}`} />
                    <DetailEntry label="Time Framework" value={`${fir.timeFrom || 'N/A'} - ${fir.timeTo || 'N/A'}`} />
                    <DetailEntry label="Spatial Identifier" value={fir.occurrenceAddress} fullWidth />
                    <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 border border-slate-100">
                       <DetailEntry label="Station Bearing" value={fir.directionFromPS || 'N/A'} />
                       <DetailEntry label="Division Beat" value={fir.beatNo || 'N/A'} />
                    </div>
                    {fir.delayReason && <DetailEntry label="Reason for Delay" value={fir.delayReason} fullWidth />}
                 </DetailsBlock>

                 <DetailsBlock title="Reporting Identity" icon={UserCircle2}>
                    <DetailEntry label="Full Legal Name" value={fir.complainantName} />
                    <DetailEntry label="Guardian/Relation" value={fir.complainantRelativeName || 'N/A'} />
                    <DetailEntry label="Contact Signal" value={fir.complainantMobile} />
                    <DetailEntry label="Aadhaar UID" value={fir.complainantUidNumber} />
                    <DetailEntry label="Current Residence" value={fir.complainantCurrentAddress} fullWidth />
                 </DetailsBlock>

                 <DetailsBlock title="Accused Characterization" icon={UserSquare2} fullWidth>
                    <div className="col-span-2 space-y-4">
                       {fir.accused && fir.accused.length > 0 ? (
                         fir.accused.map((a, idx) => (
                           <div key={a.id} className="p-4 bg-slate-50 border border-slate-200">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-[10px] font-black text-slate-900 uppercase">Suspect #0{idx + 1}</p>
                               <Badge variant="outline" className="text-[8px] border-slate-300">Active Identifier</Badge>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <DetailEntry label="Identity Name" value={a.name} />
                               <DetailEntry label="Known Alias" value={a.alias || 'N/A'} />
                               <DetailEntry label="Relative Name" value={a.relativeName || 'N/A'} />
                               <DetailEntry label="Last Known Location" value={a.presentAddress || 'N/A'} />
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-6 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                           No Identified Suspects Documented
                         </div>
                       )}
                    </div>
                 </DetailsBlock>

                 <DetailsBlock title="Recoverable Assets" icon={Package} fullWidth>
                    <div className="col-span-2 space-y-4">
                       <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-slate-900 p-4 border-l-4 border-cyan-500">
                             <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Total Valuation</p>
                             <p className="text-xl font-black text-white">₹{fir.totalPropertyValue.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-50 p-4 border border-slate-200 flex flex-col justify-center">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Logged</p>
                             <p className="text-lg font-black text-slate-900">{fir.properties?.length || 0}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-3">
                          {fir.properties && fir.properties.length > 0 ? (
                            fir.properties.map((p, idx) => (
                              <div key={p.id} className="flex items-center gap-6 p-4 bg-white border border-slate-200 shadow-sm">
                                 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center font-black text-slate-400">0{idx + 1}</div>
                                 <div className="flex-1 grid grid-cols-3 gap-4">
                                    <DetailEntry label="Category" value={p.category} />
                                    <DetailEntry label="Type/Make" value={p.type} />
                                    <DetailEntry label="Item Value" value={`₹${p.value.toLocaleString()}`} />
                                 </div>
                                 <div className="w-1/3">
                                    <DetailEntry label="Description" value={p.description || 'N/A'} />
                                 </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                              No Assets Logged in Record
                            </div>
                          )}
                       </div>
                    </div>
                 </DetailsBlock>
              </div>
           </div>

           {/* Side Controls & Administration */}
           <aside className="lg:col-span-4 space-y-10">
              {/* Action Panel */}
              <Card className="border-2 border-slate-900 rounded-none shadow-2xl bg-white overflow-hidden">
                 <div className="bg-slate-900 p-6 text-white">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-cyan-400" /> Command Actions
                    </h3>
                 </div>
                 <CardContent className="p-8 space-y-8">
                    {(fir.status === 'Open' || fir.status === 'Pending') && (
                      <div className="animate-pulse-subtle">
                        <Button 
                          onClick={handleVerify} 
                          disabled={updating}
                          className="w-full h-16 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-none shadow-lg mb-2"
                        >
                          {updating ? 'VERIFYING...' : 'AUTHENTICATE & INVESTIGATE'}
                        </Button>
                        <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">Sets status to 'Under Investigation'</p>
                      </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6 pt-4 border-t border-slate-100">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Override Priority</label>
                          <select 
                             value={formData.priority}
                             onChange={(e) => setFormData({...formData, priority: e.target.value})}
                             className="w-full h-12 bg-slate-50 border border-slate-200 rounded-none text-xs font-black uppercase tracking-widest px-4 focus:ring-0 focus:border-slate-900 cursor-pointer"
                          >
                             <option value="Low">Low Priority</option>
                             <option value="Medium">Medium Priority</option>
                             <option value="High">High Priority</option>
                             <option value="Critical">Critical Priority</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Case Ledger</label>
                          <textarea 
                             value={formData.notes}
                             onChange={(e) => setFormData({...formData, notes: e.target.value})}
                             placeholder="Append investigation progress..."
                             className="w-full h-32 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold p-4 focus:ring-0 focus:border-slate-900"
                          />
                       </div>

                       <Button 
                          type="submit"
                          disabled={updating}
                          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-none shadow-md"
                       >
                          {updating ? 'RECORDING...' : 'COMMIT LEDGER UPDATE'}
                       </Button>
                    </form>
                 </CardContent>
              </Card>

              {/* Legal & Stat Details */}
              <div className="space-y-6">
                 <DetailsBlock title="Jurisdictional Context" icon={Gavel}>
                    <div className="col-span-2 p-6 bg-slate-900 text-white mb-2">
                        <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Code Section</p>
                        <p className="text-2xl font-black tracking-tighter uppercase">{fir.act} / {fir.section}</p>
                    </div>
                    <DetailEntry label="GD Entry Identifier" value={fir.gdEntryNo || 'N/A'} />
                    <DetailEntry label="Log Timestamp" value={fir.gdDateTime ? new Date(fir.gdDateTime).toLocaleString() : 'N/A'} />
                 </DetailsBlock>

                 <DetailsBlock title="Command Assignment" icon={Briefcase}>
                    <div className="col-span-2 flex items-center gap-4 p-2">
                       <div className="w-12 h-12 bg-slate-100 rounded-none flex items-center justify-center font-black text-slate-400 border border-slate-200">
                          {fir.investigationOfficerName?.[0] || 'O'}
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900 leading-none">{fir.investigationOfficerName || 'NOT ASSIGNED'}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{fir.investigationOfficerRank || 'N/A'} • {fir.investigationOfficerNumber || 'UNASSIGNED'}</p>
                       </div>
                    </div>
                 </DetailsBlock>

                 <div className="p-6 bg-white border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                       <History className="w-4 h-4 text-slate-400" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Integrity Audit</span>
                    </div>
                    <div className="space-y-3">
                       <AuditEntry label="Initial Entry" value={new Date(fir.createdAt).toLocaleString()} />
                       <AuditEntry label="Last Modification" value={new Date(fir.updatedAt).toLocaleString()} />
                       {fir.closedAt && <AuditEntry label="Case Disposition" value={new Date(fir.closedAt).toLocaleString()} />}
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </main>
      
      <footer className="bg-slate-900 py-6 text-center border-t border-slate-800 mt-20">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Official Ledger Retrieval Protocol v4.2 &copy; National Informatics Centre</span>
      </footer>
    </div>
  );
}

function DetailsBlock({ title, icon: Icon, children, fullWidth = false }: { title: string, icon: any, children: React.ReactNode, fullWidth?: boolean }) {
   return (
      <div className={`bg-white border border-slate-200 p-8 shadow-sm group hover:border-slate-900 transition-colors ${fullWidth ? 'md:col-span-2' : ''}`}>
         <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
            <Icon className="w-4 h-4 text-cyan-600" />
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
         </div>
         <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            {children}
         </div>
      </div>
   );
}

function DetailEntry({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">{label}</p>
      <p className="text-slate-900 font-bold text-xs break-words">{value}</p>
    </div>
  );
}

function AuditEntry({ label, value }: { label: string, value: string }) {
   return (
      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
         <span className="text-slate-400">{label}</span>
         <span className="text-slate-900">{value}</span>
      </div>
   );
}
