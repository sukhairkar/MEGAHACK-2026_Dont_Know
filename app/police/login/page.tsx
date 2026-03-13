'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Mail, 
  Lock, 
  MapPin,
  ArrowRight,
  Landmark,
  ShieldCheck,
  UserCircle2
} from 'lucide-react';

const POLICE_REGIONS = ['Borivli', 'Dahisar', 'Vasai'];

export default function PoliceLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    region: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Verify region matches
      if (data.officer.region !== credentials.region) {
        throw new Error(`Access Denied: Officer is assigned to ${data.officer.region} region`);
      }

      setSuccess('Officer authenticated. Initializing regional command center...');
      setTimeout(() => {
        router.push('/police/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const demoCredentials = {
    borivli: {
      email: 'officer.borivli@police.gov',
      password: 'Test@1234',
      region: 'Borivli',
    },
    dahisar: {
      email: 'officer.dahisar@police.gov',
      password: 'Test@1234',
      region: 'Dahisar',
    },
    vasai: {
      email: 'officer.vasai@police.gov',
      password: 'Test@1234',
      region: 'Vasai',
    },
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
       {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span>Official Law Enforcement Portal</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-slate-300 shadow-2xl relative z-10 rounded-none overflow-hidden bg-white/95 backdrop-blur-sm">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="space-y-4 pt-10 pb-6 text-center border-b border-slate-100">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
              <ShieldCheck className="w-10 h-10 text-slate-900 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">POLICE<span className="text-cyan-600">PORTAL</span></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Regional Investigation Access</span>
              </div>
            </Link>
            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
              Official Use Only • Unauthorized Access is Prohibited
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 py-10">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{success}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Region */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Assignment Region</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <select
                    name="region"
                    value={credentials.region}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Region</option>
                    {POLICE_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region} Division
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Government Email ID</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="officer.name@police.gov"
                      value={credentials.email}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading || !credentials.region}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
                  {!loading && <Shield className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-500" />}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCredentials({
                      email: 'officer.borivli@police.gov',
                      password: 'Test@1234',
                      region: 'Borivli'
                    });
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  className="w-full h-12 border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 rounded-none uppercase tracking-widest text-[10px]"
                >
                  Quick Demo Login (Officer)
                </Button>
              </div>
            </form>

            {/* Quick Access / Demo */}
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                  <UserCircle2 className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Development Access Control</span>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  {Object.entries(demoCredentials).map(([key, cred]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCredentials({ email: cred.email, password: cred.password, region: cred.region })}
                      className="p-3 bg-slate-50 border border-slate-100 text-left hover:border-slate-900 hover:bg-white transition-all group"
                    >
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-cyan-600">{cred.region}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Test Case</p>
                    </button>
                  ))}
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link href="/citizen/login" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors inline-flex items-center gap-1.5">
                Switch to Citizen Services <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
          <div className="bg-slate-900 py-3 text-center border-t border-slate-800">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">National Security Gateway &copy; NIC INDIA</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
