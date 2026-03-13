'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, Lock, AlertCircle, CheckCircle, Landmark, ShieldAlert, Fingerprint, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

function CitizenLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<'input' | 'sync'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Allow passing a success message via URL parameter after signup
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setSuccess(msg);
    }
  }, [searchParams]);

  const handleSyncSession = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) throw new Error('Authentication session not found.');

      // Sync Supabase session with our local backend
      const syncRes = await fetch('/api/auth/citizen/supabase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        body: JSON.stringify({ email: authData.session.user.email })
      });

      if (!syncRes.ok) {
        const errorData = await syncRes.json();
        throw new Error(errorData.error || 'Server sync failed');
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/citizen/dashboard';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session verification failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error(
            'Invalid email or password. If you just registered, please check your inbox and click the confirmation link first, or ask your admin to disable "Confirm Email" in Supabase Dashboard → Authentication → Providers → Email.'
          );
        }
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('Authentication failed. Please verify your email first if required.');
      }

      setSuccess('Credentials verified. Establishing secure connection...');
      setStep('sync');
      await handleSyncSession();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span>Digital Identity Access Portal</span>
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
                {step === 'input' ? 'Secure Account Login' : 'Establishing Session...'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="bg-white px-10 pb-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            {success && step !== 'sync' && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{success}</p>
              </div>
            )}

            {step === 'sync' && (
              <div className="py-8 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest text-center">Confirming Identity...<br/>Please wait.</p>
              </div>
            )}

            {step === 'input' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900 font-bold tracking-widest"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Password
                      </label>
                      <button type="button" className="text-[10px] font-bold text-cyan-600 hover:text-cyan-800 hover:underline">
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900 font-bold tracking-widest"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SECURE LOGIN'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 font-medium tracking-tight">
                    Don't have an account?{' '}
                    <Link href="/citizen/signup" className="text-cyan-600 font-bold hover:underline">
                      Register here
                    </Link>
                  </p>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => (window.location.href = '/police/login')}>
                 <ShieldAlert className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                 <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Law Enforcement Officer?</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-600">Switch to JusticeRoute</p>

                 </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> AES-256 Secured</span>
                 <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Identity Verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CitizenLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-pulse bg-slate-900 w-16 h-16 rounded-full" /></div>}>
      <CitizenLoginContent />
    </Suspense>
  );
}
