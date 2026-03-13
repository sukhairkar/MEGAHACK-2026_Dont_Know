'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Shield, 
  ArrowLeft, 
  Loader, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  MapPin, 
  Clock, 
  Scale,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Gavel,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FIRCasesPage() {
  const router = useRouter();
  const [firNumber, setFirNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firNumber) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/fir/search?firNumber=${firNumber}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Case not found');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-500">PUBLIC FIR LEDGER</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all rounded-none">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Case Tracking Terminal</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-none">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Secure Public Access</span>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        {/* Search Interface */}
        <section className="text-center space-y-8">
           <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Track FIR Application</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Enter your registered FIR number to retrieve current investigation status and official notes.</p>
           </div>

           <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-slate-900 translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all duration-300 shadow-xl opacity-10" />
              <div className="relative flex bg-white border-2 border-slate-900">
                 <div className="flex items-center justify-center px-6 border-r-2 border-slate-900 bg-slate-50">
                    <Search className="w-5 h-5 text-slate-900" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="ENTER FIR NUMBER (E.G., FIR-2024-XXXX)"
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value.toUpperCase())}
                    className="flex-1 h-16 px-6 bg-transparent text-lg font-black tracking-tight focus:outline-none placeholder:font-normal placeholder:text-slate-300"
                 />
                 <Button type="submit" disabled={loading} className="h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-none font-black text-xs uppercase tracking-[0.2em]">
                    {loading ? <Loader className="animate-spin" /> : 'SEARCH FILE'}
                 </Button>
              </div>
           </form>
        </section>

        {/* Search Results */}
        <div className="animate-fade-in min-h-[400px]">
           {error && (
             <div className="p-8 bg-red-50 border-2 border-red-500/20 text-center space-y-4 shadow-xl">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
               <div>
                  <h3 className="text-lg font-black text-red-900 uppercase tracking-tight">Case Not Found</h3>
                  <p className="text-xs font-bold text-red-600/70 uppercase tracking-widest mt-1">{error}</p>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed max-w-sm mx-auto">Please ensure the FIR number is correct. If the case was registered within the last 24 hours, it may still be in the synchronization queue.</p>
             </div>
           )}

           {result && (
             <div className="space-y-8">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-600" /> Official File: {result.firNumber}
                   </h3>
                   <div className={`px-4 py-1 border-2 text-[10px] font-black uppercase tracking-widest ${
                      result.status === 'Pending' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                      result.status === 'Open' ? 'text-red-600 border-red-200 bg-red-50' :
                      result.status === 'Under Investigation' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                      'text-emerald-600 border-emerald-200 bg-emerald-50'
                   }`}>
                      {result.status}
                   </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatusCard label="Current Status" value={result.status} icon={Clock} />
                   <StatusCard label="Active Territory" value={result.region || result.policeStation} icon={MapPin} />
                   <StatusCard label="Priority Level" value={result.priority} icon={Scale} />
                   <StatusCard label="Total Valuation" value={`₹${result.totalPropertyValue.toLocaleString()}`} icon={Package} />
                </div>

                <Card className="border-2 border-slate-200 rounded-none shadow-xl bg-white overflow-hidden">
                   <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900">
                         <Gavel className="w-4 h-4 text-cyan-600" /> Investigation Logs
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-8 space-y-6">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Record Extract</p>
                         <p className="text-slate-800 font-serif text-lg leading-relaxed italic border-l-4 border-slate-200 pl-6 py-2">
                            "{result.firstInformationContents?.substring(0, 300)}..."
                         </p>
                      </div>

                      {result.notes && (
                        <div className="bg-cyan-50 p-6 border border-cyan-100 rounded-none">
                           <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2">Officer Remarks</p>
                           <p className="text-xs font-bold text-cyan-900 leading-relaxed uppercase tracking-tight">{result.notes}</p>
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filing Date</p>
                            <p className="text-xs font-bold text-slate-900">{new Date(result.createdAt).toLocaleDateString()}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                            <p className="text-xs font-bold text-slate-900">{new Date(result.updatedAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                   </CardContent>
                </Card>
                
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
                         <ShieldCheck className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest">Case Authenticity</p>
                         <p className="text-xs font-bold text-white/70">Verified by State Police Information Network</p>
                      </div>
                   </div>
                   <Button variant="outline" className="text-xs font-black uppercase tracking-widest border-white/20 hover:bg-white hover:text-slate-900 text-white h-12 rounded-none">
                      Export Certificate
                   </Button>
                </div>
             </div>
           )}

           {!result && !loading && !error && (
             <div className="py-20 text-center opacity-30">
                <FileText className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Awaiting Valid Identifier</p>
             </div>
           )}
        </div>
      </main>

      <footer className="bg-slate-900 py-10 text-center border-t border-slate-800 mt-20">
         <div className="max-w-7xl mx-auto px-6 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">JusticeRoute &copy; 2024 - Official Law Enforcement Support Portal</p>
            <div className="flex justify-center gap-8 text-[9px] font-black text-slate-700 uppercase tracking-widest">
               <Link href="#" className="hover:text-cyan-500">Legal Policy</Link>
               <Link href="#" className="hover:text-cyan-500">Accessibility</Link>
               <Link href="#" className="hover:text-cyan-500">Contact Support</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
   return (
      <div className="bg-white border-2 border-slate-200 p-6 flex flex-col justify-between h-28 group hover:border-slate-900 transition-all hover:bg-slate-900 group-hover:text-white">
         <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-cyan-400">{label}</span>
            <Icon className="w-4 h-4 text-slate-300 group-hover:text-white" />
         </div>
         <span className="text-lg font-black tracking-tight text-slate-900 uppercase group-hover:text-white">{value}</span>
      </div>
   );
}
