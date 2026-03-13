'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  LogOut,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  Shield,
  Loader,
  Search,
  LayoutDashboard,
  Settings,
  Bell,
  MessageSquare,
  Landmark,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface FIRReport {
  id: string;
  firNumber: string;
  incidentType: string;
  incidentDate: string;
  incidentLocation: string;
  status: 'Open' | 'Under Investigation' | 'Closed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  region: string;
  createdAt: string;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isCitizen, logout } = useAuth();
  const [reports, setReports] = useState<FIRReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isCitizen) {
      router.push('/citizen/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch('/api/fir/my-reports');
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authLoading, isCitizen, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Open':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'Under Investigation':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Closed':
        return 'text-emerald-600 border-emerald-200 bg-emerald-50';
      default:
        return 'text-slate-600 border-slate-200 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-3 h-3" />;
      case 'Open':
        return <ShieldAlert className="w-3 h-3" />;
      case 'Under Investigation':
        return <Loader className="w-3 h-3 animate-spin" />;
      case 'Closed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authenticating Secure Session...</p>
        </div>
      </div>
    );
  }

  if (!isCitizen) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span>Digital Evidence & Investigation Portal</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
          <div className="p-8 border-b border-slate-100">
             <Link href="/" className="flex items-center gap-2 group">
              <Shield className="w-6 h-6 text-slate-900" />
              <span className="text-xl font-black tracking-tighter text-slate-900">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={FileText} label="My Reports" />
            <SidebarItem icon={Bell} label="Notifications" badge="3" />
            <SidebarItem icon={MessageSquare} label="AI Assistance" />
            <SidebarItem icon={Settings} label="Identity Settings" />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Terminate Session
            </button>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-slate-200 py-6 px-10 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Dashboard</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Service Gateway for {user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
               <Link href="/citizen/file-fir">
                 <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest px-6 h-12 rounded-none shadow-xl border-b-4 border-cyan-600">
                   <Plus className="w-4 h-4 mr-2" /> Report Incident
                 </Button>
               </Link>
            </div>
          </header>

          <div className="p-10 max-w-6xl mx-auto space-y-10">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatsCard label="Active Cases" value={reports.filter(r => r.status !== 'Closed').length.toString()} icon={Shield} color="slate" />
               <StatsCard label="Verified Identity" value="Aadhaar Pro" icon={CheckCircle} color="emerald" />
               <StatsCard label="Alerts" value="03" icon={Bell} color="cyan" />
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                   <FileText className="w-5 h-5 text-cyan-600" /> Recent FIR Filings
                </h3>
                <Link href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  View Archive <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}

              {reports.length === 0 ? (
                <Card className="border-slate-200 shadow-sm rounded-none py-20 text-center border-dashed border-2">
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                       <FileText className="w-10 h-10 text-slate-300" />
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 mb-2 tracking-tight">No Active Reports Found</CardTitle>
                    <p className="text-slate-500 text-sm font-medium mb-8 uppercase tracking-tight">Your digital ledger is currently empty. Filing a report is the first step towards resolution.</p>
                    <Link href="/citizen/file-fir">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest px-8 h-12 rounded-none shadow-lg">
                        Initialize New FIR
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {reports.map((fir) => (
                    <Card
                      key={fir.id}
                      className="border-slate-200 shadow-sm rounded-none hover:shadow-md transition-all group overflow-hidden"
                    >
                      <div className="flex items-center">
                         <div className="w-2 bg-slate-900 h-full self-stretch group-hover:bg-cyan-600 transition-colors" />
                         <div className="flex-1 p-6">
                            <div className="flex flex-col lg:row lg:row items-start lg:items-center justify-between gap-4">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                     <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">#{fir.firNumber}</span>
                                     <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none border text-[9px] font-black uppercase tracking-widest ${getStatusColor(fir.status)}`}>
                                        {getStatusIcon(fir.status)}
                                        {fir.status}
                                     </div>
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{fir.incidentType} / {fir.region}</p>
                               </div>

                               <div className="flex gap-10 items-center">
                                  <div className="hidden md:block">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filed On</p>
                                     <p className="text-xs font-black text-slate-900">{new Date(fir.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="hidden lg:block">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Location</p>
                                     <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">{fir.incidentLocation}</p>
                                  </div>
                                  <Button variant="outline" className="h-10 border-2 border-slate-900 text-slate-900 font-black text-[10px] uppercase tracking-widest px-4 rounded-none hover:bg-slate-900 hover:text-white transition-all">
                                     Full Details
                                  </Button>
                               </div>
                            </div>
                         </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all" />
               <div className="relative z-10 flex flex-col md:row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-lg font-black tracking-tight mb-2 uppercase">AI Investigation Intelligence</h4>
                    <p className="text-slate-400 text-sm max-w-xl font-medium">Use our neural processing system to analyze your case details, predict investigation timelines, and receive legal procedural guidance instantly.</p>
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs uppercase tracking-widest px-8 h-12 rounded-none">
                    Launch AI Assistant
                  </Button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, badge }: { icon: any, label: string, active?: boolean, badge?: string }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-slate-900 text-white shadow-lg' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {badge && <span className="bg-cyan-500 text-slate-900 px-1.5 py-0.5 rounded-none text-[8px] font-black">{badge}</span>}
    </Link>
  );
}

function StatsCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colorMap: any = {
    slate: 'text-slate-900 bg-white border-slate-200',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    cyan: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  };

  return (
    <div className={`p-6 border shadow-sm relative overflow-hidden flex items-center justify-between ${colorMap[color] || colorMap.slate}`}>
       <div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
         <p className="text-2xl font-black tracking-tighter">{value}</p>
       </div>
       <Icon className="w-10 h-10 opacity-10 absolute -right-2 transform -rotate-12" />
    </div>
  );
}
