'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle, CheckCircle, ShieldCheck, Mail, Lock, Phone,
  BadgeCheck, Building2, MapPin, Hash, Landmark, ArrowRight, Loader2
} from 'lucide-react';

const DEPARTMENTS = ['Crime Branch', 'Traffic', 'Cyber Crime', 'Local Police Station'];

const DISTRICTS = [
  'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad',
  'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur',
  'Kolhapur', 'Satara', 'Sangli', 'Latur', 'Nanded', 'Other',
];

export default function PoliceSignup() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '', badge: '', email: '', phone: '',
    stationName: '', stationCode: '', department: '', district: '',
    password: '', confirmPassword: '', authorized: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError('');
  };

  const validate = () => {
    if (!form.fullName || !form.badge || !form.email || !form.phone ||
        !form.stationName || !form.stationCode || !form.department || !form.district ||
        !form.password || !form.confirmPassword) return 'All fields are required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return 'Enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 10) return 'Enter a valid 10-digit mobile number.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.authorized) return 'Please confirm you are an authorized police officer.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/police/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName, badge: form.badge, email: form.email,
          phone: form.phone, stationName: form.stationName, stationCode: form.stationCode,
          department: form.department, district: form.district, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Officer account created! Redirecting to login...');
      setTimeout(() => router.push('/police/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{children}</label>
  );

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <Landmark className="w-3 h-3 text-cyan-400" /> Government of India
        </span>
        <span className="hidden md:block">Official Law Enforcement Portal</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-2xl border-slate-300 shadow-2xl rounded-none overflow-hidden bg-white/95 backdrop-blur-sm">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="space-y-3 pt-10 pb-6 text-center border-b border-slate-100">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
              <ShieldCheck className="w-10 h-10 text-slate-900 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Officer Registration
                </span>
              </div>
            </Link>
            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Official Use Only • Unauthorized Access is Prohibited
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section: Personal Information */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                  Personal Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <FieldLabel>Police Officer Full Name</FieldLabel>
                    <div className="relative group">
                      <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="fullName" type="text" placeholder="Enter full legal name"
                        value={form.fullName} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Police ID / Badge No.</FieldLabel>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="badge" type="text" placeholder="e.g. MH-12345"
                        value={form.badge} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Mobile Number</FieldLabel>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="phone" type="tel" placeholder="10-digit mobile"
                        value={form.phone}
                        onChange={(e) => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <FieldLabel>Official Email Address</FieldLabel>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="email" type="email" placeholder="officer.name@police.gov"
                        value={form.email} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Station Details */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                  Station Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <FieldLabel>Police Station Name</FieldLabel>
                    <div className="relative group">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="stationName" type="text" placeholder="e.g. Borivli Police Station"
                        value={form.stationName} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Station Code</FieldLabel>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="stationCode" type="text" placeholder="e.g. BVL-01"
                        value={form.stationCode} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Branch / Department</FieldLabel>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <select name="department" value={form.department} onChange={handleChange}
                        className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer" required>
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>District / City</FieldLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <select name="district" value={form.district} onChange={handleChange}
                        className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer" required>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Account Security */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                  Account Security
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <FieldLabel>Password</FieldLabel>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="password" type="password" placeholder="Min. 6 characters"
                        value={form.password} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required minLength={6} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Confirm Password</FieldLabel>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                      <Input name="confirmPassword" type="password" placeholder="Re-enter password"
                        value={form.confirmPassword} onChange={handleChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 font-bold placeholder-slate-400 rounded-none focus-visible:ring-slate-900" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorization Checkbox */}
              <div className="flex gap-3 items-start p-4 bg-amber-50 border-l-4 border-amber-500">
                <input type="checkbox" id="authorized" name="authorized"
                  checked={form.authorized} onChange={handleChange}
                  className="mt-0.5 cursor-pointer w-4 h-4 flex-shrink-0 accent-slate-900" />
                <label htmlFor="authorized" className="text-[11px] font-bold text-amber-800 leading-relaxed cursor-pointer">
                  I confirm that I am an authorized police officer and all information provided is accurate.
                  Misuse of this system is a criminal offence under the IT Act.
                </label>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> CREATING ACCOUNT...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 text-cyan-400" /> CREATE OFFICER ACCOUNT</>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/police/login"
                  className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors inline-flex items-center gap-1.5">
                  Already Registered? Login <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </form>
          </CardContent>

          <div className="bg-slate-900 py-3 text-center border-t border-slate-800">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
              National Security Gateway &copy; NIC INDIA
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
