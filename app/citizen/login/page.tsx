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
  ArrowRight,
  Landmark,
  ShieldAlert
} from 'lucide-react';

export default function CitizenLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await fetch('/api/auth/citizen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccess('Access granted! Redirecting to secure dashboard...');
      setTimeout(() => {
        router.push('/citizen/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
       {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span>Official Digital Gateway</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-[120px] opacity-30 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-[120px] opacity-30 animate-pulse" />
        </div>

        <Card className="w-full max-w-md border-white shadow-2xl relative z-10 rounded-none overflow-hidden">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="space-y-4 bg-white pt-10 pb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
              <Shield className="w-8 h-8 text-slate-900 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black tracking-tighter text-slate-900">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
            </Link>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Citizen Access</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Secure Portal Login
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="bg-white px-10 pb-10">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
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
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={credentials.email}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Passphrase</label>
                  <Link href="#" className="text-[10px] font-black text-cyan-600 hover:text-slate-900 uppercase tracking-widest">
                    Recovery
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl flex items-center justify-center gap-2 group"
                >
                  {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCredentials({ email: 'demo_citizen@test.com', password: 'password123' });
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  className="w-full h-12 border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 rounded-none uppercase tracking-widest text-[10px]"
                >
                  Quick Demo Login (Citizen)
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
              <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                Need an account?{' '}
                <Link href="/citizen/signup" className="text-cyan-600 hover:text-slate-900 underline transition-colors">
                  Register with Aadhaar
                </Link>
              </p>
              
              <div className="p-4 bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-slate-100 transition-colors">
                 <ShieldAlert className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                 <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Law Enforcement Officer?</p>
                    <Link href="/police/login" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-600">Switch to Police Portal</Link>
                 </div>
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-900 py-3 text-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Secure Session Shield 4.0 &copy; NIC</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
