'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Fingerprint, Landmark, Mail, Lock, Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CitizenSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call our server-side route that uses the Admin SDK to auto-confirm the email
      const res = await fetch('/api/auth/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/citizen/login?message=Registration successful. Please log in.'), 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <span>Official Registration Gateway</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-[120px] opacity-20 animate-pulse" />
        </div>

        <Card className="w-full max-w-md border-white shadow-2xl relative z-10 rounded-none overflow-hidden">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="space-y-4 bg-white pt-10 pb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
              <Shield className="w-8 h-8 text-slate-900 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black tracking-tighter text-slate-900">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
            </Link>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">New Registration</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Create your citizen account
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

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{success}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900 font-bold tracking-widest"
                      required
                      minLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900 font-bold tracking-widest"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900 font-bold tracking-widest"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'REGISTER ACCOUNT'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                Already have an account?{' '}
                <Link href="/citizen/login" className="text-cyan-600 font-bold hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
