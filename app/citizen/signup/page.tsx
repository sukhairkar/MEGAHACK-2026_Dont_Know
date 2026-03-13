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
  Smartphone, 
  Lock, 
  User, 
  Mail,
  Fingerprint,
  ArrowRight,
  Landmark
} from 'lucide-react';

type SignupStep = 'details' | 'otp';

export default function CitizenSignup() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  // Step 1: Details
  const [formData, setFormData] = useState({
    aadhaar: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [citizenId, setCitizenId] = useState('');

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.aadhaar.replace(/\s/g, '') || formData.aadhaar.replace(/\s/g, '').length !== 12) {
        throw new Error('Aadhaar must be 12 digits');
      }
      if (!formData.fullName || formData.fullName.length < 2) {
        throw new Error('Full name is required');
      }
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Valid email is required');
      }
      if (!formData.phone || formData.phone.replace(/\D/g, '').length !== 10) {
        throw new Error('Phone must be 10 digits');
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/auth/citizen/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaar: formData.aadhaar.replace(/\s/g, ''),
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          fullName: formData.fullName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setCitizenId(data.citizenId);
      setDemoOtp(data.demo_otp || '');
      setSuccess('OTP sent to your phone');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp || otp.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      const response = await fetch('/api/auth/citizen/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setSuccess('Identity verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/citizen/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
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

        <Card className="w-full max-w-lg border-white shadow-2xl relative z-10 rounded-none overflow-hidden">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="space-y-4 bg-white pt-10 pb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
              <Shield className="w-8 h-8 text-slate-900 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black tracking-tighter text-slate-900">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
            </Link>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Citizen Registration</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                {step === 'details' 
                  ? 'Identity Verification Gateway'
                  : 'Multi-Factor Authentication'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="bg-white px-10 pb-10">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-tight">{success}</p>
              </div>
            )}

            {step === 'details' ? (
              // Details Form
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name (As per Aadhaar)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="fullName"
                        type="text"
                        placeholder="Full Legal Name"
                        value={formData.fullName}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Aadhaar */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aadhaar Identity Number</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="aadhaar"
                        type="text"
                        placeholder="0000 0000 0000"
                        value={formData.aadhaar}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        pattern="\d{12}"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleDetailsChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-none focus-visible:ring-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none transition-all"
                >
                  {loading ? 'PROCESSING...' : 'REQUEST VERIFICATION'}
                </Button>
              </form>
            ) : (
              // OTP Form
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="bg-slate-50 p-6 text-center border border-slate-100 italic">
                  <p className="text-slate-500 text-sm mb-2">A one-time passcode has been generated for</p>
                  <p className="text-slate-900 font-black text-xl">+91 ****{formData.phone.slice(-4)}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Enter 6-Digit Passcode</label>
                  <Input
                    type="text"
                    placeholder="000 000"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    maxLength={6}
                    className="h-20 text-center text-4xl tracking-[0.5em] font-black bg-white border-2 border-slate-900 text-slate-900 placeholder-slate-200 rounded-none focus-visible:ring-0"
                    required
                  />
                </div>

                {demoOtp && (
                  <div className="bg-cyan-50 border border-cyan-200 shadow-inner p-3 text-center">
                    <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">System Testing OTP: <span className="text-slate-900">{demoOtp}</span></p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-none shadow-xl"
                >
                  {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Go Back & Edit Details
                </button>
              </form>
            )}

            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                Already Registered?{' '}
                <Link href="/citizen/login" className="text-cyan-600 hover:text-slate-900 underline transition-colors">
                  Access Portal
                </Link>
              </p>
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
