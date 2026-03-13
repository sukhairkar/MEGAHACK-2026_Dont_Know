'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  User, 
  Lock, 
  Search, 
  MapPin, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  BarChart4,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Official Top Bar */}
      <div className="bg-slate-900 text-white py-2 px-6 text-[10px] uppercase tracking-[0.2em] font-bold flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-cyan-400" /> Government of India</span>
          <span className="text-slate-500">|</span>
          <span>Ministry of Home Affairs</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Help & Global Support</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Language: EN</span>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-slate-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">AI Crime Assistant</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600 uppercase tracking-wider">
            <Link href="#features" className="hover:text-slate-900 transition-colors">Digital Services</Link>
            <Link href="/fir-cases" className="hover:text-slate-900 transition-colors">Public Portal</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Guidelines</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/citizen/login">
              <Button variant="ghost" className="text-slate-700 font-bold uppercase tracking-wider text-xs px-6">Login</Button>
            </Link>
            <Link href="/citizen/signup">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs px-6 rounded-none shadow-xl border-b-4 border-cyan-600 active:border-b-0 active:translate-y-1 transition-all">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-200/50 skew-x-[-12deg] translate-x-20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-[120px] opacity-40 animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-slide-up">
            <Badge variant="outline" className="mb-6 border-cyan-600/30 bg-cyan-50 text-cyan-700 py-1.5 px-4 font-bold uppercase tracking-widest text-[10px] rounded-full">Secure Gateway 4.0</Badge>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8">
              Digital Justice <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-cyan-700 italic">Redefined.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              Empowering citizens and law enforcement with an intelligent, AI-driven platform for seamless FIR registration and real-time case monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/citizen/signup" className="flex-1">
                <Button className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg group rounded-none">
                  REPORT INCIDENT <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/police/login" className="flex-1">
                <Button variant="outline" className="w-full h-16 border-2 border-slate-900 text-slate-900 font-black text-lg hover:bg-slate-900 hover:text-white transition-colors rounded-none">
                  POLICE PORTAL
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                <span className="text-slate-900">8.9k+</span> Cases tracked this month
              </p>
            </div>
          </div>

          <div className="hidden lg:block animate-fade-in delay-200">
            <div className="relative">
               <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
               <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b">
                       <span className="font-black text-xs uppercase tracking-widest text-slate-400">System Log</span>
                       <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"><CheckCircle className="text-cyan-600" /></div>
                       <div>
                         <p className="text-sm font-black text-slate-900">Identity Verified</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aadhaar Auth Successful</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"><FileText className="text-blue-600" /></div>
                       <div>
                         <p className="text-sm font-black text-slate-900">FIR Generated</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">FIR/2026/MH/001284</p>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Assigning Officer...</p>
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500" />
                          <span className="text-xs font-bold text-slate-700">Insp. Anil Kumar assigned</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className="py-32 bg-slate-900 text-white selection:bg-cyan-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
                Advanced Features for <br />
                A Modern Law System.
              </h2>
              <p className="text-slate-400 text-lg">
                JusticeRoute integrates seamlessly with national databases to provide an accurate, high-speed, and secure environment for citizen grievances and police investigations.
              </p>
            </div>
            <Link href="/fir-cases">
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 font-bold py-6 px-10 rounded-none border-2">
                VIEW PUBLIC PORTAL
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-slate-800 border border-slate-800 overflow-hidden">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Aadhaar Verification" 
              desc="Real-time multi-factor authentication using national identity records for foolproof reporting." 
            />
            <FeatureCard 
              icon={Search} 
              title="Smart Case Search" 
              desc="Deep-learning powered search engine for citizens and officers to track case progress instantly." 
            />
            <FeatureCard 
              icon={MapPin} 
              title="Geospatial Tracking" 
              desc="Precise location mapping of incidents to ensure the correct jurisdictional police response." 
            />
            <FeatureCard 
              icon={Lock} 
              title="Encrypted Vault" 
              desc="Bank-grade encryption for all case documents, witness statements, and evidence uploads." 
            />
            <FeatureCard 
              icon={BarChart4} 
              title="Crime Analytics" 
              desc="Visual heatmaps and statistical breakdown for administrative decision making and crime prevention." 
            />
            <FeatureCard 
              icon={User} 
              title="Direct Officer Access" 
              desc="Secure portal for investigating officers to manage regional duties with centralized command." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-slate-900" />
              <span className="text-2xl font-black tracking-tighter">JUSTICE<span className="text-cyan-600">ROUTE</span></span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">
              An initiative for Digital Transformation of Law Enforcement. Powered by AI and National Identity Protocols.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="#" className="hover:text-cyan-600">About the Portal</Link></li>
              <li><Link href="/fir-cases" className="hover:text-cyan-600">Track Complaint</Link></li>
              <li><Link href="#" className="hover:text-cyan-600">Officer Login</Link></li>
              <li><Link href="#" className="hover:text-cyan-600">Citizen Charter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6">Guidelines</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="#" className="hover:text-cyan-600">How to File FIR</Link></li>
              <li><Link href="#" className="hover:text-cyan-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-cyan-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-cyan-600">Helpdesk</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <span>&copy; 2026 National Crime Management System. All Rights Reserved.</span>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-slate-900">Accessibility</span>
            <span className="cursor-pointer hover:text-slate-900">Security</span>
            <span className="cursor-pointer hover:text-slate-900">Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-slate-900 p-12 hover:bg-slate-800/50 transition-colors group">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-7 h-7 text-cyan-400 group-hover:text-slate-900" />
      </div>
      <h3 className="text-xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
