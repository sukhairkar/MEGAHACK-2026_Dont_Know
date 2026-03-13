'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Loader, 
  ArrowLeft,
  Calendar,
  MapPin,
  Scale,
  User,
  History,
  Info,
  ChevronRight,
  ChevronLeft,
  Landmark,
  FileText,
  Gavel,
  Plus,
  Trash2,
  Clock,
  Package,
  Lock
} from 'lucide-react';

const POLICE_REGIONS = ['Borivli', 'Dahisar', 'Vasai'];
const SUPPORTED_CITIES = [
  'Vasai', 'Colaba', 'Andheri', 'Borivali', 'Dahisar', 'Bandra', 'Malad', 'Kandivali', 'Virar'
];
const INFO_TYPES = ['Written', 'Oral'];

interface AccusedEntry {
  id: string;
  name: string;
  alias: string;
  presentAddress: string;
  relativeName: string;
}

interface PropertyEntry {
  id: string;
  value: string;
  category: string;
  type: string;
  description: string;
}

export default function FileFIRPage() {
  const router = useRouter();
  const { user, loading: authLoading, isCitizen } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('occurrence');

  const [formData, setFormData] = useState({
    city: '',
    occurrenceDay: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    occurrenceAddress: '',
    directionFromPS: '',
    distanceFromPS: '',
    beatNo: '',
    infoReceivedDate: new Date().toISOString().split('T')[0],
    delayReason: '',
    infoType: 'Written',
    firstInformationContents: '',
    act: 'Indian Penal Code',
    section: '',
    
    // Complainant Details (Customizable)
    complainantName: '',
    complainantMobile: '',
    complainantRelativeName: '',
    complainantBirthDate: '',
    complainantNationality: 'Indian',
    complainantOccupation: '',
    complainantCurrentAddress: '',
    complainantPermanentAddress: '',
    complainantIdType: 'Aadhaar Card',
    complainantIdNumber: '',
  });

  const [accusedList, setAccusedList] = useState<AccusedEntry[]>([
    { id: '1', name: '', alias: '', presentAddress: '', relativeName: '' }
  ]);

  const [propertyList, setPropertyList] = useState<PropertyEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !isCitizen) {
      router.push('/citizen/login');
    }
    if (user && isCitizen) {
       // Pre-fill some fields from user profile if available
       setFormData(prev => ({
          ...prev,
          complainantName: (user as any).fullName || prev.complainantName,
          complainantMobile: (user as any).phone || prev.complainantMobile,
          complainantIdNumber: (user as any).aadhaar || prev.complainantIdNumber,
          complainantCurrentAddress: prev.complainantCurrentAddress || '',
       }));
    }
  }, [authLoading, isCitizen, router, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader className="w-8 h-8 text-slate-900 animate-spin" />
      </div>
    );
  }

  if (!isCitizen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAccusedChange = (id: string, field: keyof AccusedEntry, value: string) => {
    setAccusedList(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAccused = () => {
    setAccusedList(prev => [...prev, { id: Date.now().toString(), name: '', alias: '', presentAddress: '', relativeName: '' }]);
  };

  const removeAccused = (id: string) => {
    if (accusedList.length > 1) {
      setAccusedList(prev => prev.filter(a => a.id !== id));
    }
  };

  const handlePropertyChange = (id: string, field: keyof PropertyEntry, value: string) => {
    setPropertyList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProperty = () => {
    setPropertyList(prev => [...prev, { id: Date.now().toString(), value: '0', category: '', type: '', description: '' }]);
  };

  const removeProperty = (id: string) => {
    setPropertyList(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic Validation
    if (!formData.occurrenceAddress || !formData.city || !formData.dateFrom || !formData.timeFrom || !formData.firstInformationContents) {
      setError('📍 INCIDENT DETAILS: City, Place, Date, Time, and Description are MANDATORY.');
      setLoading(false);
      return;
    }

    if (!formData.complainantName || !formData.complainantRelativeName || !formData.complainantBirthDate || !formData.complainantMobile || !formData.complainantIdNumber || !formData.complainantCurrentAddress) {
      setError('👤 COMPLAINANT / VICTIM: Full Name, Relative Name, DOB, Mobile, Aadhaar, and Current Address are MANDATORY.');
      setLoading(false);
      return;
    }

    // Date Validation
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const dFrom = new Date(formData.dateFrom);
    if (isNaN(dFrom.getTime())) {
      setError('📍 INCIDENT DETAILS: Please enter a valid Incident Date.');
      setLoading(false);
      return;
    }
    if (dFrom > today) {
      setError('📍 INCIDENT DETAILS: Incident Date cannot be in the future.');
      setLoading(false);
      return;
    }

    const dBirth = new Date(formData.complainantBirthDate);
    if (isNaN(dBirth.getTime())) {
      setError('👤 COMPLAINANT / VICTIM: Please enter a valid Date of Birth.');
      setLoading(false);
      return;
    }
    if (dBirth > today) {
      setError('👤 COMPLAINANT / VICTIM: Date of Birth cannot be in the future.');
      setLoading(false);
      return;
    }

    // Mobile Validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.complainantMobile)) {
      setError('👤 COMPLAINANT / VICTIM: Mobile Number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    // Check property values if theft is implied (any property added)
    if (propertyList.length > 0) {
      const missingValue = propertyList.some(p => !p.value || p.value === '0');
      if (missingValue) {
        setError('💰 STOLEN PROPERTY: Estimated Value is MANDATORY for all entries.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        accused: accusedList,
        properties: propertyList,
      };

      const response = await fetch('/api/fir/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to register incident');

      setSuccess(`Incident successfully registered with State Records. Case Number: ${data.fir.firNumber}`);
      setTimeout(() => router.push('/citizen/dashboard'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'occurrence', label: '1. Occurrence', icon: MapPin },
    { id: 'complainant', label: '2. Reporting Person', icon: User },
    { id: 'accused', label: '3. Accused', icon: User },
    { id: 'property', label: '4. Assets', icon: Package },
    { id: 'legal', label: '5. Legal', icon: Gavel },
    { id: 'contents', label: '6. Narrative', icon: FileText },
  ];

  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);

  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setActiveSection(sections[currentSectionIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveSection(sections[currentSectionIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <span>Official Incident Registration System</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/citizen/dashboard')} className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all rounded-none">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Incident Registration</h1>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            {sections.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                 <button
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-none border-b-2 ${
                    activeSection === s.id ? 'text-slate-900 border-slate-900 bg-slate-50' : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
                {idx < sections.length - 1 && <ChevronRight className="w-3 h-3 text-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-5 bg-red-50 border-l-4 border-red-500 animate-fade-in text-red-700 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Submission Error</p>
              <p className="text-xs font-bold leading-normal">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-8 bg-emerald-50 border-2 border-emerald-500 text-center animate-fade-in text-emerald-900 shadow-2xl">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Record Authorized</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">{success}</p>
              <p className="text-[10px] uppercase font-black text-slate-400 mt-6 tracking-[0.2em]">Redirecting to command center...</p>
            </div>
          )}

          {!success && (
            <>
              {activeSection === 'occurrence' && (
                <FormSection title="📍 1. Occurrence Details" description="Define the spatial and temporal context of the incident. (✅ = Mandatory)">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Incident City *</label>
                      <select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className="w-full h-12 px-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-none appearance-none cursor-pointer focus:ring-2 focus:ring-slate-900"
                        required
                      >
                        <option value="">Select City</option>
                        {SUPPORTED_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Location of Incident *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input name="occurrenceAddress" value={formData.occurrenceAddress} onChange={handleChange} className="pl-10 h-12 bg-white border-slate-200 rounded-none font-bold text-slate-900" placeholder="Specific area, street name..." required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Incident Date *</label>
                      <Input name="dateFrom" type="date" value={formData.dateFrom} onChange={handleChange} max={new Date().toISOString().split('T')[0]} className="h-12 bg-white border-slate-200 rounded-none font-bold" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Incident Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input name="timeFrom" type="time" value={formData.timeFrom} onChange={handleChange} className="pl-10 h-12 bg-white border-slate-200 rounded-none font-bold" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Up To (If range)</label>
                      <Input name="dateTo" type="date" value={formData.dateTo} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Up To (If range)</label>
                      <Input name="timeTo" type="time" value={formData.timeTo} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Day of the Week</label>
                      <Input name="occurrenceDay" placeholder="e.g. MONDAY" value={formData.occurrenceDay} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Information Type (Locked)</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input name="infoType" value="Written" readOnly className="pl-10 h-12 bg-slate-100 border-slate-200 rounded-none font-bold text-slate-500 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Delay (If reported late)</label>
                      <textarea name="delayReason" value={formData.delayReason} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-none" rows={2} placeholder="Explain why the report is late..." />
                    </div>
                  </div>
                </FormSection>
              )}

              {activeSection === 'complainant' && (
                <FormSection title="👤 2. Complainant / Victim" description="All fields must match verified identity records. (✅ = Mandatory)">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Full Name *</label>
                       <Input name="complainantName" value={formData.complainantName} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold text-slate-900" placeholder="FULL LEGAL NAME" required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Father's/Husband's Name *</label>
                      <Input name="complainantRelativeName" placeholder="FATHER'S/HUSBAND'S FULL NAME" value={formData.complainantRelativeName} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold uppercase" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Date of Birth *</label>
                      <Input name="complainantBirthDate" type="date" value={formData.complainantBirthDate} onChange={handleChange} max={new Date().toISOString().split('T')[0]} className="h-12 bg-white border-slate-200 rounded-none font-bold" required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Mobile Number *</label>
                      <Input name="complainantMobile" placeholder="10-DIGIT MOBILE" value={formData.complainantMobile} onChange={handleChange} maxLength={10} className="h-12 bg-white border-slate-200 rounded-none font-bold text-slate-900" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Aadhaar / ID Number *</label>
                      <Input name="complainantIdNumber" placeholder="12-DIGIT AADHAAR" value={formData.complainantIdNumber} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold" required maxLength={12} />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Current Address *</label>
                      <textarea name="complainantCurrentAddress" value={formData.complainantCurrentAddress} onChange={handleChange} className="w-full p-4 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-none focus:ring-2 focus:ring-slate-900" rows={2} placeholder="Full current address..." required />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permanent Address</label>
                      <textarea name="complainantPermanentAddress" value={formData.complainantPermanentAddress} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-none" rows={2} placeholder="Same as current or different..." />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Occupation</label>
                      <Input name="complainantOccupation" placeholder="e.g. BUSINESS" value={formData.complainantOccupation} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nationality</label>
                      <Input name="complainantNationality" value={formData.complainantNationality} onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-none font-bold uppercase" />
                    </div>
                  </div>
                </FormSection>
              )}

              {activeSection === 'accused' && (
                <FormSection title="👥 3. Accused Details" description="Define identity details for suspects. (Multi-entry supported)">
                   <div className="space-y-8">
                     {accusedList.map((accused, index) => (
                       <Card key={accused.id} className="rounded-none border-2 border-slate-200 shadow-lg overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4">
                            <button type="button" onClick={() => removeAccused(accused.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <CardHeader className="bg-slate-50 border-b border-slate-200 py-4">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accused Entry #0{index + 1}</CardTitle>
                         </CardHeader>
                         <CardContent className="p-8 grid md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name (or 'UNKNOWN') *</label>
                               <Input placeholder="Enter Name or 'UNKNOWN'" value={accused.name} onChange={(e) => handleAccusedChange(accused.id, 'name', e.target.value.toUpperCase())} className="h-12 border-slate-200 rounded-none font-bold" required />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alias / Nickname</label>
                               <Input placeholder="e.g. MONU" value={accused.alias} onChange={(e) => handleAccusedChange(accused.id, 'alias', e.target.value.toUpperCase())} className="h-12 border-slate-200 rounded-none font-bold" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</label>
                               <Input placeholder="Known location or area" value={accused.presentAddress} onChange={(e) => handleAccusedChange(accused.id, 'presentAddress', e.target.value)} className="h-12 border-slate-200 rounded-none font-bold" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relative's Name</label>
                               <Input placeholder="Relative's name if known" value={accused.relativeName} onChange={(e) => handleAccusedChange(accused.id, 'relativeName', e.target.value.toUpperCase())} className="h-12 border-slate-200 rounded-none font-bold" />
                            </div>
                         </CardContent>
                       </Card>
                     ))}
                     
                     <Button type="button" onClick={addAccused} className="w-full h-14 border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-[0.2em] rounded-none bg-white">
                        <Plus className="w-4 h-4 mr-2" /> Append Further Accused Entry
                     </Button>
                   </div>
                </FormSection>
              )}

              {activeSection === 'property' && (
                <FormSection title="💰 4. Stolen Property" description="Catalog assets involved (MANDATORY for theft incidents).">
                   <div className="space-y-8">
                      {propertyList.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 opacity-30 select-none">
                           <Package className="w-12 h-12 mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Property Entries Logged</p>
                        </div>
                      )}
                      
                      {propertyList.map((property, index) => (
                        <Card key={property.id} className="rounded-none border-2 border-slate-200 shadow-md overflow-hidden relative group">
                           <div className="absolute top-4 right-4 z-10">
                              <button type="button" onClick={() => removeProperty(property.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                           <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                              <div className="p-6 bg-slate-50 w-full md:w-48 flex items-center justify-center">
                                 <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">✅ Estimated Value *</p>
                                    <div className="flex items-center justify-center mt-1">
                                       <span className="text-slate-900 font-black text-xl">₹</span>
                                       <input 
                                          type="number" 
                                          value={property.value} 
                                          onChange={(e) => handlePropertyChange(property.id, 'value', e.target.value)}
                                          className="w-24 bg-transparent border-b-2 border-slate-300 focus:border-slate-900 outline-none text-xl font-black text-slate-900 px-1 text-center"
                                          required
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div className="p-8 flex-1 grid grid-cols-2 gap-6 bg-white">
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                                    <Input placeholder="Jewelry, Vehicle, etc." value={property.category} onChange={(e) => handlePropertyChange(property.id, 'category', e.target.value.toUpperCase())} className="h-10 border-slate-200 rounded-none font-bold" />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specific Type</label>
                                    <Input placeholder="e.g. iPhone 14" value={property.type} onChange={(e) => handlePropertyChange(property.id, 'type', e.target.value.toUpperCase())} className="h-10 border-slate-200 rounded-none font-bold" />
                                 </div>
                                 <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                    <textarea placeholder="Color, Model, etc." value={property.description} onChange={(e) => handlePropertyChange(property.id, 'description', e.target.value)} className="w-full p-3 border border-slate-200 text-xs font-bold rounded-none" rows={2} />
                                 </div>
                              </div>
                           </div>
                        </Card>
                      ))}
                      
                      <Button type="button" onClick={addProperty} className="w-full h-14 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] rounded-none bg-white">
                         <Plus className="w-4 h-4 mr-2" /> Add Stolen Property Entry
                      </Button>
                   </div>
                </FormSection>
              )}

              {activeSection === 'legal' && (
                <FormSection title="Legal Framework" description="Define the statutory context of the incident.">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Act *</label>
                      <Input name="act" value={formData.act} onChange={handleChange} className="h-12 bg-white border-2 border-slate-900/10 rounded-none font-bold" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statutory Section(s) *</label>
                      <Input name="section" placeholder="e.g. SEC 379 / 34 IPC" value={formData.section} onChange={handleChange} className="h-12 bg-white border-2 border-slate-900/10 rounded-none font-bold uppercase" required />
                    </div>
                    <div className="md:col-span-2 p-6 bg-slate-100 border border-slate-200 flex items-start gap-4">
                       <Info className="w-5 h-5 text-slate-400 mt-1" />
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                          Official Case Identifiers (FIR NO, District, Police Station) will be automatically generated and assigned to the relevant regional command center upon submission.
                       </p>
                    </div>
                  </div>
                </FormSection>
              )}

              {activeSection === 'contents' && (
                <FormSection title="6. Case Narrative" description="Finalize the chronological formal statement. (✅ = Mandatory)">
                  <div className="space-y-8">
                     <div className="bg-slate-900 p-8 rounded-none border border-slate-800 text-slate-400 shadow-2xl relative">
                        <div className="absolute top-2 right-4 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Secure Recording</span>
                        </div>
                        <FileText className="w-6 h-6 text-cyan-500 mb-4" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">✅ Full Incident Description *</label>
                        <textarea
                          name="firstInformationContents"
                          value={formData.firstInformationContents}
                          onChange={handleChange}
                          placeholder="PROVIDE FULL CHRONOLOGICAL DETAILS OF THE INCIDENT..."
                          className="w-full h-80 bg-transparent border-0 text-white font-serif text-lg italic leading-relaxed focus:ring-0 p-0 resize-none placeholder:text-slate-800"
                          required
                        />
                     </div>
                     
                     <div className="p-6 bg-amber-50 border-2 border-amber-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-2">Notice of Responsibility</p>
                        <p className="text-[9px] font-bold text-amber-700/80 uppercase leading-relaxed tracking-tight">
                           I understand that providing false Information to public authorities is a criminal offence under IPC section 182. I certify that the details documented in this interface are an accurate representation of the events.
                        </p>
                     </div>

                     <Button type="submit" disabled={loading} className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white font-black text-xl uppercase tracking-[0.2em] rounded-none shadow-2xl border-b-8 border-cyan-500 transition-all hover:translate-y-1 hover:border-b-4 h-[5rem]">
                        {loading ? (
                           <span className="flex items-center gap-3">
                              <Loader className="animate-spin w-5 h-5" /> AUTHORIZING RECORD...
                           </span>
                        ) : 'COMMIT RECORD TO STATE ARCHIVE'}
                     </Button>
                  </div>
                </FormSection>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-between items-center bg-white border-t border-slate-200 p-6 shadow-sm sticky bottom-0 z-30">
                 <button 
                  type="button"
                  onClick={prevSection}
                  disabled={currentSectionIndex === 0}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 flex items-center gap-2"
                 >
                    <ChevronLeft className="w-4 h-4" /> Previous
                 </button>
                 
                 <div className="flex items-center gap-2">
                    {sections.map((_, idx) => (
                       <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentSectionIndex ? 'bg-slate-900' : 'bg-slate-200 transition-all'}`} />
                    ))}
                 </div>

                 {currentSectionIndex < sections.length - 1 ? (
                    <button 
                      type="button"
                      onClick={nextSection}
                      className="px-8 py-3 bg-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all rounded-none flex items-center gap-2"
                    >
                       Continue <ChevronRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <div className="w-32" /> 
                 )}
              </div>
            </>
          )}
        </form>
      </main>

      <footer className="bg-slate-900 py-6 text-center border-t border-slate-800">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">State Incident Gateway &copy; National Informatics Centre</span>
      </footer>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
   return (
      <div className="space-y-8 animate-fade-in">
         <div className="border-l-4 border-slate-900 pl-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
         </div>
         <div className="bg-white border border-slate-200 p-10 shadow-2xl rounded-none">
            {children}
         </div>
      </div>
   );
}
