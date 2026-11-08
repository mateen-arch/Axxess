import React, { useState } from 'react';
import {
  ArrowLeft,
  Pill,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Pharmacy } from '../../types';

interface CreatePharmacyPageProps {
  onBack: () => void;
  onPharmacyCreated?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export const CreatePharmacyPage: React.FC<CreatePharmacyPageProps> = ({
  onBack,
  onPharmacyCreated,
}) => {
  const { addPharmacy, organization } = useHealthcare();

  // Form State
  const [pharmacyName, setPharmacyName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MA');
  const [zip, setZip] = useState('');

  // 3-box phone inputs
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');

  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [email, setEmail] = useState('');

  // 3-box fax inputs
  const [fax1, setFax1] = useState('');
  const [fax2, setFax2] = useState('');
  const [fax3, setFax3] = useState('');

  const [comment, setComment] = useState('');

  // Feedback State
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = Boolean(
    pharmacyName.trim() &&
    addressLine1.trim() &&
    city.trim() &&
    zip.trim()
  );

  const handlePhone1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone1(cleaned);
    if (cleaned.length === 3) document.getElementById('pharmPhone2')?.focus();
  };

  const handlePhone2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone2(cleaned);
    if (cleaned.length === 3) document.getElementById('pharmPhone3')?.focus();
  };

  const handlePhone3Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPhone3(cleaned);
  };

  const handleFax1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax1(cleaned);
    if (cleaned.length === 3) document.getElementById('pharmFax2')?.focus();
  };

  const handleFax2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax2(cleaned);
    if (cleaned.length === 3) document.getElementById('pharmFax3')?.focus();
  };

  const handleFax3Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setFax3(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    const fullPhone = phone1 && phone2 && phone3 ? `(${phone1}) ${phone2}-${phone3}` : undefined;
    const fullFax = fax1 && fax2 && fax3 ? `(${fax1}) ${fax2}-${fax3}` : undefined;

    const newPharmacy: Pharmacy = {
      id: `pharm-${Date.now()}`,
      name: pharmacyName.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state,
      zip: zip.trim(),
      phone: fullPhone,
      contactFirstName: contactFirstName.trim() || undefined,
      contactLastName: contactLastName.trim() || undefined,
      email: email.trim() || undefined,
      fax: fullFax,
      comment: comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addPharmacy(newPharmacy);
    setIsSuccess(true);

    setTimeout(() => {
      onPharmacyCreated?.();
      onBack();
    }, 1200);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Axxess Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Create
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                New Pharmacy
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Dispensing Pharmacy & Infusion Provider Directory
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
            title="Close"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Pharmacy "{pharmacyName}" added successfully to pharmacy directory!</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please enter Pharmacy Name, Address, City, and ZIP code.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Pharmacy Directory Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <Pill size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Pharmacy Directory</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Register dispensing retail and infusion pharmacies for medication reconciliation, order transmission, and patient profile assignment.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Directory Mode:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Dispensing Partner</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Branch:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{organization.name}</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>e-Prescribe Sync:</span>
                  <strong className="text-emerald-600">NCPDP SCRIPT Ready</strong>
                </div>
              </div>
            </div>

            {/* Quick Preview Card */}
            {pharmacyName ? (
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-4 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Live Preview
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white truncate">
                  {pharmacyName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {addressLine1 ? `${addressLine1}, ${city} ${state} ${zip}` : 'No address entered yet'}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-rose-100/80 pt-2.5 text-[11px] dark:border-rose-900/30">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Pharmacist / Contact:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {contactFirstName || contactLastName ? `${contactFirstName} ${contactLastName}` : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Phone:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-100">
                      {phone1 && phone2 && phone3 ? `(${phone1}) ${phone2}-${phone3}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-5 text-center text-xs text-slate-400 dark:border-charcoal-700">
                <Pill size={28} className="mx-auto mb-2 text-slate-300 dark:text-charcoal-600" />
                Enter pharmacy name and location to see real-time directory listing preview.
              </div>
            )}
          </div>

          <div className="rounded-xl bg-pearl-100 p-3 text-[11px] text-slate-500 dark:bg-charcoal-800/80 dark:text-slate-400">
            Axxess Pharmacy Directory • NCPDP SCRIPT 2017071
          </div>
        </aside>

        {/* Right Form Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pharmacy Information Box */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1</span>
                Pharmacy Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pharmacy Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="e.g. Walgreens Pharmacy #0438"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Address Line 1 <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Suite, building, plaza"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    City <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {US_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Zip <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="Zip"
                      maxLength={10}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Details & Communications */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">2</span>
                Pharmacist Contact & Lines
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact First Name
                  </label>
                  <input
                    type="text"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    placeholder="Pharmacist first name"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Last Name
                  </label>
                  <input
                    type="text"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    placeholder="Pharmacist last name"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. pharmacy0438@walgreens.com"
                    className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* 3-Box Primary Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Primary Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="pharmPhone1"
                      type="text"
                      maxLength={3}
                      value={phone1}
                      onChange={(e) => handlePhone1Change(e.target.value)}
                      placeholder="978"
                      className="w-16 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      id="pharmPhone2"
                      type="text"
                      maxLength={3}
                      value={phone2}
                      onChange={(e) => handlePhone2Change(e.target.value)}
                      placeholder="921"
                      className="w-16 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      id="pharmPhone3"
                      type="text"
                      maxLength={4}
                      value={phone3}
                      onChange={(e) => handlePhone3Change(e.target.value)}
                      placeholder="0506"
                      className="flex-1 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* 3-Box Fax */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Fax Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="pharmFax1"
                      type="text"
                      maxLength={3}
                      value={fax1}
                      onChange={(e) => handleFax1Change(e.target.value)}
                      placeholder="978"
                      className="w-16 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      id="pharmFax2"
                      type="text"
                      maxLength={3}
                      value={fax2}
                      onChange={(e) => handleFax2Change(e.target.value)}
                      placeholder="921"
                      className="w-16 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      id="pharmFax3"
                      type="text"
                      maxLength={4}
                      value={fax3}
                      onChange={(e) => handleFax3Change(e.target.value)}
                      placeholder="0508"
                      className="flex-1 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Comment Section */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">3</span>
                Comment / Notes
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Enter compounding capabilities, courier delivery schedules, and after-hours emergency numbers..."
                className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
              <div className="mt-1 flex justify-end text-[11px] text-slate-400">
                {500 - comment.length} characters remaining
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-pearl-100 pt-4 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={onBack}
                  className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  Save Pharmacy
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};
