import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Search,
  Building,
  Phone,
  Mail,
  FileCheck2,
  X,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface CreatePhysicianPageProps {
  onBack: () => void;
  onPhysicianCreated?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DELIVERY_METHODS = [
  'Electronic / Portal',
  'Fax Transmission',
  'Certified Mail',
  'In-Person Hand Delivery',
  'Direct Secure Messaging (Direct)',
];

export const CreatePhysicianPage: React.FC<CreatePhysicianPageProps> = ({
  onBack,
  onPhysicianCreated,
}) => {
  const { organization } = useHealthcare();

  // Search Physician
  const [searchNpi, setSearchNpi] = useState('');

  // Physician Information
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [credentials, setCredentials] = useState('MD');
  const [taxonomyCode, setTaxonomyCode] = useState('208D00000X');
  const [npiNo, setNpiNo] = useState('');
  const [pecosStatus, setPecosStatus] = useState<'Verified' | 'Not Checked'>('Not Checked');
  const [medicaidProviderId, setMedicaidProviderId] = useState('');

  // Physician Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MA');
  const [zip, setZip] = useState('');
  const [zip4, setZip4] = useState('');

  // 3-box phone
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');

  // 3-box alt phone
  const [altPhone1, setAltPhone1] = useState('');
  const [altPhone2, setAltPhone2] = useState('');
  const [altPhone3, setAltPhone3] = useState('');

  // Delivery & Contact
  const [orderDeliveryMethod, setOrderDeliveryMethod] = useState('Fax Transmission');
  const [fax1, setFax1] = useState('');
  const [fax2, setFax2] = useState('');
  const [fax3, setFax3] = useState('');
  const [email, setEmail] = useState('');

  // Comments
  const [comments, setComments] = useState('');

  // Feedback State
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    npiNo.trim() &&
    addressLine1.trim() &&
    city.trim()
  );

  const handlePhone1 = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setPhone1(clean);
    if (clean.length === 3) document.getElementById('physPhone2')?.focus();
  };
  const handlePhone2 = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setPhone2(clean);
    if (clean.length === 3) document.getElementById('physPhone3')?.focus();
  };
  const handlePhone3 = (val: string) => {
    setPhone3(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleFax1 = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setFax1(clean);
    if (clean.length === 3) document.getElementById('physFax2')?.focus();
  };
  const handleFax2 = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setFax2(clean);
    if (clean.length === 3) document.getElementById('physFax3')?.focus();
  };
  const handleFax3 = (val: string) => {
    setFax3(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleNpiLookup = () => {
    if (!searchNpi.trim()) return;
    setNpiNo(searchNpi.trim());
    setPecosStatus('Verified');
    if (!firstName && !lastName) {
      setFirstName('Robert');
      setLastName('Miller');
      setCredentials('MD');
      setAddressLine1('120 Medical Center Dr');
      setCity('Boston');
      setState('MA');
      setZip('02115');
      setPhone1('617');
      setPhone2('555');
      setPhone3('0190');
      setFax1('617');
      setFax2('555');
      setFax3('0199');
      setEmail('dr.miller@partners.org');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setIsSuccess(true);
    setTimeout(() => {
      onPhysicianCreated?.();
      onBack();
    }, 1200);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Back"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Axxess Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                New Physician
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Physician Registry & Attending Directory
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-bold italic text-rose-600 dark:text-rose-400">
            *Required Field
          </span>
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-50 px-2.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Physician registered successfully! Added to attending directory...</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please complete First Name, Last Name, NPI, and Address before saving.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <Stethoscope size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Physician Registry</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Enroll attending and certifying physicians for Home Health Plans of Care, OASIS certification, and Face-to-Face encounter documentation.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>PECOS Requirement:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Required for CMS</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>NPI Type:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Type 1 (Individual)</strong>
                </div>
              </div>
            </div>

            {/* Quick Live Preview Card */}
            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-4 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Live Preview
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    pecosStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  PECOS: {pecosStatus}
                </span>
              </div>
              <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                {firstName || lastName ? `Dr. ${firstName} ${lastName}, ${credentials}` : 'Dr. Attending Physician'}
              </h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                NPI: {npiNo || 'Not specified'} • Taxonomy: {taxonomyCode}
              </p>
              <div className="mt-3 space-y-1 border-t border-rose-100/80 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>Delivery: <strong>{orderDeliveryMethod}</strong></div>
                <div>Location: <strong>{city ? `${city}, ${state}` : 'Unspecified'}</strong></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right / Main Form Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            {/* Search Physician NPI Card */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850">
              <div className="mb-4 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Search size={16} />
                <h2 className="text-xs font-black uppercase tracking-wider">Search Physician</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  NPI Number:
                </label>
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={searchNpi}
                    onChange={(e) => setSearchNpi(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit National Provider Identifier"
                    className="w-full rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 py-2 text-xs font-mono outline-none transition focus:border-rose-500 focus:bg-white dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNpiLookup}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-800 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-700 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 cursor-pointer"
                >
                  <Search size={14} />
                  <span>NPI Registry Lookup</span>
                </button>
              </div>
            </div>

            {/* Physician Information Card */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Stethoscope size={16} />
                <h2 className="text-xs font-black uppercase tracking-wider">Physician Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    First Name <span className="text-rose-600 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Credentials
                  </label>
                  <input
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    placeholder="e.g. MD, DO, FACP, NP"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      MI
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={middleInitial}
                      onChange={(e) => setMiddleInitial(e.target.value.toUpperCase())}
                      className="w-full text-center rounded-xl border border-pearl-200 bg-white px-2 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Last Name <span className="text-rose-600 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    NPI No <span className="text-rose-600 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    value={npiNo}
                    onChange={(e) => setNpiNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit NPI"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs font-mono outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Taxonomy Code
                  </label>
                  <input
                    type="text"
                    value={taxonomyCode}
                    onChange={(e) => setTaxonomyCode(e.target.value)}
                    placeholder="e.g. 208D00000X"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs font-mono outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Medicaid Provider Identifier
                  </label>
                  <input
                    type="text"
                    value={medicaidProviderId}
                    onChange={(e) => setMedicaidProviderId(e.target.value)}
                    placeholder="State Medicaid ID"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Physician Address Card */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Building size={16} />
                <h2 className="text-xs font-black uppercase tracking-wider">Physician Address & Contact</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Address Line 1 <span className="text-rose-600 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Street address or Suite"
                      className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Building, unit, etc."
                      className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        City <span className="text-rose-600 font-black">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        State
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      >
                        {US_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Zip
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="Zip"
                        className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-mono outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        +4
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={zip4}
                        onChange={(e) => setZip4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="+4"
                        className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-mono outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Order Delivery Method
                    </label>
                    <select
                      value={orderDeliveryMethod}
                      onChange={(e) => setOrderDeliveryMethod(e.target.value)}
                      className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    >
                      {DELIVERY_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Primary Phone (3-Box)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        id="physPhone1"
                        maxLength={3}
                        value={phone1}
                        onChange={(e) => handlePhone1(e.target.value)}
                        placeholder="000"
                        className="w-16 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        id="physPhone2"
                        maxLength={3}
                        value={phone2}
                        onChange={(e) => handlePhone2(e.target.value)}
                        placeholder="000"
                        className="w-16 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        id="physPhone3"
                        maxLength={4}
                        value={phone3}
                        onChange={(e) => handlePhone3(e.target.value)}
                        placeholder="0000"
                        className="w-20 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Fax Number (3-Box)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        id="physFax1"
                        maxLength={3}
                        value={fax1}
                        onChange={(e) => handleFax1(e.target.value)}
                        placeholder="000"
                        className="w-16 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        id="physFax2"
                        maxLength={3}
                        value={fax2}
                        onChange={(e) => handleFax2(e.target.value)}
                        placeholder="000"
                        className="w-16 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        id="physFax3"
                        maxLength={4}
                        value={fax3}
                        onChange={(e) => handleFax3(e.target.value)}
                        placeholder="0000"
                        className="w-20 text-center rounded-xl border border-pearl-200 bg-white py-2 text-xs font-mono outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="physician@clinic.org"
                      className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Card */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Comments
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter physician preferences, on-call instructions, or office notes..."
                className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white resize-none"
              />
              <div className="mt-1 text-right text-[10px] text-slate-400">
                You have {500 - comments.length} characters remaining
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:bg-charcoal-750 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-extrabold text-white shadow-xs transition hover:-translate-y-0.5 hover:bg-rose-700 cursor-pointer"
              >
                Save Physician
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

