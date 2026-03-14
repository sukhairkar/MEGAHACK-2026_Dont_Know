'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  LogOut,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader,
  MapPin,
  TrendingUp,
  FileText,
  Search,
  Users,
  BarChart3,
  Landmark,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Filter,
  Brain,
  Activity,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Initializing Tactical Map...</div>
});

interface FIRStats {
  total: number;
  open: number;
  investigating: number;
  closed: number;
  pending: number;
  critical: number;
}

interface FIRReport {
  id: string;
  firNumber: string;
  incidentType: string;
  incidentDate: string;
  incidentLocation: string;
  status: 'Open' | 'Under Investigation' | 'Closed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  region: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  pdfUrl?: string;
  citizen?: {
    fullName: string;
    phone: string;
  };
}

export default function PoliceDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isOfficer, logout } = useAuth();
  const [reports, setReports] = useState<FIRReport[]>([]);
  const [stats, setStats] = useState<FIRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isOfficer || !user?.region) {
      router.push('/police/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/fir/admin/region-reports?region=${user.region}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        setReports(data.reports || []);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authLoading, isOfficer, user?.region, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Open':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'Approved':
        return 'text-emerald-700 border-emerald-200 bg-emerald-50';
      case 'Rejected':
        return 'text-red-700 border-red-200 bg-red-50';
      default:
        return 'text-slate-600 border-slate-200 bg-slate-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (authLoading || loading) {
     return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Initializing Command Terminal...</p>
          </div>
        </div>
      );
  }

  if (!isOfficer) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-500">SECURE POLICE NETWORK</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span>Official Jurisdictional Command Terminal</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Sidebar Navigation */}
         <aside className="w-72 bg-slate-900 text-slate-400 hidden lg:flex flex-col border-r border-slate-800">
            <div className="p-8 border-b border-slate-800">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                     <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white leading-none tracking-tighter">POLICE<span className="text-cyan-500">PORTAL</span></h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500">Command & Control</p>
                  </div>
               </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1">
               <OfficerNavItem icon={LayoutDashboard} label="Strategic Hub" href="/police/dashboard" active />
               <OfficerNavItem icon={FileText} label="Active Investigations" href="/police/dashboard" badge={reports.length.toString()} />
               <OfficerNavItem icon={ShieldAlert} label="High Priority Alerts" />
               <OfficerNavItem icon={BarChart3} label="Regional Trends" />
               <OfficerNavItem icon={Users} label="Citizen Outreach" />
            </nav>

            <div className="p-4 border-t border-slate-800">
               <div className="bg-slate-950 p-4 border border-slate-800 mb-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{user?.region}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">STATION COMMAND</p>
                     </div>
                  </div>
               </div>
               <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-lg border border-red-500/20"
               >
                  <LogOut className="w-4 h-4" /> Sign Out & Encrypt
               </button>
            </div>
         </aside>

         {/* Main Viewport */}
         <main className="flex-1 flex flex-col overflow-hidden">
            {/* Context Header */}
            <header className="bg-white border-b border-slate-200 px-10 py-6 flex items-center justify-between z-40 shadow-sm">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Regional Dashboard</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black bg-cyan-100 text-cyan-700 px-2 py-0.5 uppercase tracking-widest">{user?.region} Station</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as {user?.email}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative hidden xl:block">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="SEARCH FIR NUMBER..." 
                        className="pl-10 pr-4 h-12 w-64 bg-slate-50 border border-slate-200 rounded-none text-[10px] font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                     />
                  </div>
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-none border-2 border-slate-200">
                     <Filter className="w-5 h-5 text-slate-600" />
                  </Button>
               </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
               <div className="max-w-7xl mx-auto space-y-10">
                  {/* Strategic Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                       <OfficerStatCard label="Total Reports" value={stats.total} icon={FileText} color="slate" />
                       <OfficerStatCard label="Active" value={stats.open + stats.investigating} icon={Activity} color="blue" />
                       <OfficerStatCard label="Critical" value={stats.critical} icon={TrendingUp} color="red" />
                       <OfficerStatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
                       <OfficerStatCard label="Resolved" value={stats.closed} icon={CheckCircle} color="emerald" />
                       <OfficerStatCard label="Resources" value="94%" icon={Zap} color="cyan" />
                    </div>
                  )}

                  {/* Strategic Map View */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-cyan-600" /> Strategic Regional Overlay
                       </h3>
                       <Button 
                        variant="ghost" 
                        onClick={() => setShowMap(!showMap)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
                       >
                         {showMap ? '[ MINIMIZE TACTICAL VIEW ]' : '[ EXPAND TACTICAL VIEW ]'}
                       </Button>
                    </div>
                    {showMap && (
                      <div className="bg-white border-2 border-slate-200 p-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <MapView 
                          center={[reports[0]?.latitude || 19.0760, reports[0]?.longitude || 72.8777] as [number, number]}
                          markers={reports.map(r => ({
                            name: r.firNumber,
                            type: r.incidentType,
                            lat: r.latitude || 0,
                            lng: r.longitude || 0,
                            priority: r.priority
                          })).filter(m => m.lat !== 0 && m.lng !== 0) as any}
                        />
                      </div>
                    )}
                  </div>

                  {/* Operational Data Table */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-emerald-500" /> Jurisdictional Case Ledger
                       </h3>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-none">
                             <button className="px-3 py-1 bg-white text-[10px] font-black uppercase tracking-tight shadow-sm">Live Feed</button>
                             <button className="px-3 py-1 text-slate-500 text-[10px] font-black uppercase tracking-tight">Archived</button>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white border-2 border-slate-200 shadow-xl overflow-hidden rounded-none animate-fade-in">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-slate-50 border-b-2 border-slate-200">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Identifier</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Complainant</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Response Status</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {reports.length === 0 ? (
                                <tr>
                                   <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                                      No active cases logged in this sector.
                                   </td>
                                </tr>
                             ) : (
                                reports.map((fir) => (
                                   <tr key={fir.id} className="hover:bg-slate-50/50 transition-colors group">
                                      <td className="py-5 px-6">
                                         <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-slate-200 group-hover:bg-cyan-500 transition-colors" />
                                            <div>
                                               <p className="text-sm font-black text-slate-900 tracking-tighter">#{fir.firNumber}</p>
                                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(fir.createdAt).toLocaleDateString()}</p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="py-5 px-6">
                                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{fir.incidentType}</p>
                                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {fir.incidentLocation}</p>
                                      </td>
                                      <td className="py-5 px-6">
                                         <p className="text-xs font-black text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4">{fir.citizen?.fullName || 'Anonymous'}</p>
                                         <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{fir.citizen?.phone || 'Encrypted'}</p>
                                      </td>
                                      <td className="py-5 px-6">
                                         <div className="flex flex-col gap-2">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 text-[9px] font-black uppercase tracking-widest w-fit rounded-none ${getStatusColor(fir.status)}`}>
                                               {fir.status}
                                            </div>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 text-[9px] font-black uppercase tracking-widest w-fit rounded-none ${getPriorityColor(fir.priority)}`}>
                                               {fir.priority} Level
                                            </div>
                                         </div>
                                      </td>
                                       <td className="py-5 px-6 text-right">
                                          <div className="flex items-center gap-2 justify-end">
                                             <Link href={`/police/fir/${fir.id}`}>
                                                <Button variant="outline" className="h-9 px-3 text-slate-900 border border-slate-900 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2">
                                                   <Shield className="w-3.5 h-3.5" /> Edit Case
                                                </Button>
                                             </Link>
                                             {fir.pdfUrl && (
                                                <Button 
                                                   variant="outline" 
                                                   onClick={() => window.open(fir.pdfUrl, '_blank')}
                                                   className="h-9 px-3 border border-emerald-600 text-emerald-600 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                                >
                                                   <FileText className="w-3.5 h-3.5" /> PDF
                                                </Button>
                                             )}
                                          </div>
                                       </td>
                                   </tr>
                                ))
                             )}
                          </tbody>
                       </table>
                    </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
    </div>
  );
}

function OfficerNavItem({ icon: Icon, label, active, badge, href = "#" }: { icon: any, label: string, active?: boolean, badge?: string, href?: string }) {
   return (
      <Link 
        href={href} 
        className={`flex items-center justify-between px-4 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
          active 
            ? 'bg-cyan-600 text-white shadow-[0_10px_20px_rgba(8,145,178,0.3)]' 
            : 'text-slate-500 hover:text-white hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-4">
           <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
           <span>{label}</span>
        </div>
        {badge && <span className={`px-2 py-0.5 rounded-none text-[9px] font-black ${active ? 'bg-white text-cyan-600' : 'bg-slate-800 text-slate-400'}`}>{badge}</span>}
      </Link>
   );
}

function OfficerStatCard({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
   const colorStyles: any = {
      slate: 'border-slate-300 text-slate-900',
      blue: 'border-blue-300 text-blue-900 bg-blue-50/50',
      red: 'border-red-300 text-red-900 bg-red-50/50',
      yellow: 'border-yellow-300 text-yellow-900 bg-yellow-50/50',
      emerald: 'border-emerald-300 text-emerald-900 bg-emerald-50/50',
      cyan: 'border-cyan-300 text-cyan-900 bg-cyan-50/50',
   };

   return (
      <div className={`bg-white border-2 p-5 flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:bg-slate-50 group hover:-translate-y-1 hover:shadow-lg ${colorStyles[color] || colorStyles.slate}`}>
         <div className="relative z-10 flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            <Icon className="w-5 h-5 opacity-40 group-hover:scale-125 transition-transform" />
         </div>
         <p className="text-3xl font-black tracking-tighter relative z-10 leading-none">{value}</p>
         <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-slate-900/5 group-hover:bg-slate-900/10 rotate-12 flex items-center justify-center transition-all">
            <Icon className="w-8 h-8 opacity-20" />
         </div>
      </div>
   );
}

// Missing icons used in components
function Activity(props: any) { return <TrendingUp {...props} /> }
function LayoutDashboard(props: any) { return <BarChart3 {...props} /> }
function Zap(props: any) { return <TrendingUp {...props} /> }
