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
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight,
  Shield,
  CreditCard
} from 'lucide-react';

export default function CitizenRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadhaar: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Citizen account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/citizen/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-2xl overflow-hidden">
          <div className="h-2 bg-blue-600 w-full" />
          <CardHeader className="space-y-2 pb-6 text-center pt-10">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CITIZEN PORTAL</CardTitle>
            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Secure Registration & Verification
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{success}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma" 
                    required
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Aadhaar (12-digit)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      placeholder="XXXX-XXXX-XXXX" 
                      required
                      maxLength={12}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile No.</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210" 
                      required
                      maxLength={10}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    required
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      required
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      required
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Creating Account...' : 'Register Citizen Account'}
              </Button>

              <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-slate-100">
                <Link href="/citizen/login" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
                  Already registered? Sign In <ArrowRight className="w-3 h-3" />
                </Link>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <Link href="/police/register" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors">
                    <Shield className="w-4 h-4 text-slate-400" /> Are you a Police Officer? Register here
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
