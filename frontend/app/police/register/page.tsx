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
  UserCircle2,
  Building2,
  Phone,
  Hash,
  ChevronDown
} from 'lucide-react';

const DEPARTMENTS = [
  'Crime Branch', 'Traffic Police', 'Local Police', 'Cyber Cell', 'Special Branch', 'Intelligence Bureau'
];

const DISTRICTS = [
  'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Pune', 'Nagpur', 'Nashik', 'Vasai', 'Colaba', 'Andheri', 'Borivali', 'Dahisar', 'Bandra', 'Malad', 'Kandivali', 'Virar'
];

export default function PoliceRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    badgeNumber: '',
    phone: '',
    email: '',
    stationName: '',
    stationCode: '',
    department: '',
    region: '', // District/City
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      setError('You must confirm that you are an authorized police officer.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/police/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Officer account created successfully. You can now login.');
      setTimeout(() => {
        router.push('/police/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        </div>
        <div className="hidden md:flex gap-4">
          <span>Official Law Enforcement Portal</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-none flex flex-col relative overflow-hidden">
          <div className="h-1.5 bg-slate-900 w-full" />
          
          <div className="pt-10 pb-6 flex flex-col items-center border-b border-slate-100">
             <div className="flex flex-col items-center gap-3">
                <ShieldCheck className="w-12 h-12 text-slate-900 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                   <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase">JUSTICE<span className="text-cyan-600">ROUTE</span></h1>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Officer Registration</p>
                </div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                Official Use Only • Unauthorized Access is Prohibited
             </p>
          </div>

          <form onSubmit={handleRegister} className="p-10 space-y-10">
            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 flex gap-3 animate-fade-in text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 flex gap-3 animate-fade-in text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight leading-normal">{success}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Information</p>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Police Officer Full Name</label>
                  <div className="relative">
                     <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter full legal name" 
                        required
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Police ID / Badge No.</label>
                     <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="badgeNumber"
                           value={formData.badgeNumber}
                           onChange={handleChange}
                           placeholder="e.g. MH-12345" 
                           required
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="10-digit mobile" 
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="officer.name@police.gov" 
                        required
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                     />
                  </div>
               </div>
            </div>

            {/* Station Information */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Information</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Police Station Name</label>
                     <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="stationName"
                           value={formData.stationName}
                           onChange={handleChange}
                           placeholder="e.g. Borivli Police Station" 
                           required
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Code</label>
                     <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="stationCode"
                           value={formData.stationCode}
                           onChange={handleChange}
                           placeholder="e.g. BVL-01" 
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch / Department</label>
                     <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                        <select 
                           name="department"
                           value={formData.department}
                           onChange={handleChange}
                           required
                           className="w-full h-12 pl-10 pr-10 bg-white border border-slate-200 text-sm font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                           <option value="">Select Department</option>
                           {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District / City</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                        <select 
                           name="region"
                           value={formData.region}
                           onChange={handleChange}
                           required
                           className="w-full h-12 pl-10 pr-10 bg-white border border-slate-200 text-sm font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                           <option value="">Select District</option>
                           {DISTRICTS.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Account Security */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Security</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="password"
                           type="password"
                           value={formData.password}
                           onChange={handleChange}
                           placeholder="Min. 6 characters" 
                           required
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           name="confirmPassword"
                           type="password"
                           value={formData.confirmPassword}
                           onChange={handleChange}
                           placeholder="Re-enter password" 
                           required
                           className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Confirmation */}
            <div className="bg-amber-50/50 border border-amber-100 p-4 flex gap-4">
               <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-1 border-2 border-amber-200 rounded-none checked:bg-slate-900 cursor-pointer"
               />
               <p className="text-[10px] font-bold text-amber-900 leading-normal">
                  I confirm that I am an authorized police officer and all information provided is accurate. Misuse of this system is a criminal offence under the IT Act.
               </p>
            </div>

            <Button 
               type="submit"
               disabled={loading}
               className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-none flex items-center justify-center gap-3 transition-all"
            >
               {loading ? 'Processing Registration...' : (
                 <>
                   <ShieldCheck className="w-5 h-5 text-cyan-500" />
                   Create Officer Account
                 </>
               )}
            </Button>

            <div className="text-center">
              <Link href="/police/login" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                Already have an officer account? Login here <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </form>

          <div className="bg-slate-900 py-4 text-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">&copy; National Crime Records Bureau &bull; Government of India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
