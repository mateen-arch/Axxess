import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Building,
  Phone,
  Mail,
  FileCheck2,
  X,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EditPhysicianPageProps {
  physicianId?: string;
  onBack: () => void;
  onSaved?: () => void;
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

export const EditPhysicianPage: React.FC<EditPhysicianPageProps> = ({
  physicianId = 'phy-1',
  onBack,
  onSaved,
}) => {
  const { organization } = useHealthcare();

  // Prefilled state matching screenshot 7 & 8 (Dr. Carme Danielle Ogando-Saintil MD)
  const [firstName, setFirstName] = useState('Carme Danielle');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('Ogando-Saintil');
  const [credentials, setCredentials] = useState('MD');
  const [taxonomyCode, setTaxonomyCode] = useState('208D00000X');
  const [npiNo, setNpiNo] = useState('1316101454');
  const [pecosStatus, setPecosStatus] = useState<'Verified' | 'Not Checked'>('Verified');
  const [medicaidProviderId, setMedicaidProviderId] = useState('MA9482103');

  // Physician Address
  const [addressLine1, setAddressLine1] = useState('Codman Sq. HC');
  const [addressLine2, setAddressLine2] = useState('637 Washington Street');
  const [city, setCity] = useState('DORCHESTER CENTER');
  const [state, setState] = useState('MA');
  const [zip, setZip] = useState('02124');
  const [zip4, setZip4] = useState('');

  // 3-box phone
  const [phone1, setPhone1] = useState('617');
  const [phone2, setPhone2] = useState('825');
  const [phone3, setPhone3] = useState('9660');

  // Delivery & Contact
  const [orderDeliveryMethod, setOrderDeliveryMethod] = useState('Fax Transmission');
  const [fax1, setFax1] = useState('617');
  const [fax2, setFax2] = useState('825');
  const [fax3, setFax3] = useState('9661');
  const [email, setEmail] = useState('ogando.md@codmansq.org');

  const [comments, setComments] = useState('Attending primary care physician at Codman Square Health Center. Responsive to home health 485 plans and face-to-face addenda.');

  // Feedback State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    npiNo.trim() &&
    addressLine1.trim() &&
    city.trim() &&
    zip.trim()
  );

  const handlePhone1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone1(cleaned);
    if (cleaned.length === 3) document.getElementById('phyPhone2')?.focus();
  };

  const handlePhone2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone2(cleaned);
    if (cleaned.length === 3) document.getElementById('phyPhone3')?.focus();
  };

  const handlePhone3Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPhone3(cleaned);
  };

  const handleFax1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax1(cleaned);
    if (cleaned.length === 3) document.getElementById('phyFax2')?.focus();
  };

  const handleFax2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax2(cleaned);
    if (cleaned.length === 3) document.getElementById('phyFax3')?.focus();
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

    setIsSuccess(true);
    setTimeout(() => {
      onSaved?.();
      onBack();
    }, 1000);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Physicians List"
            aria-label="Return to Physicians List"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Axxess Home Health
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                View
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lists
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Edit Physician: Dr. {firstName} {lastName} {credentials}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                NPI: {npiNo}
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Activity Logs
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Title Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-pearl-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                <Stethoscope size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Physician Profile
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update NPI credentials, PECOS enrollment status, and order dispatch channels.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                PECOS HHA Enrolled
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold">
                  Physician Dr. {lastName} updated successfully. Returning to list...
                </p>
              </div>
            )}

            {/* Validation Errors */}
            {showErrors && !isValid && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300">
                <AlertTriangle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <p className="text-xs font-semibold">
                  Please complete all required fields highlighted below.
                </p>
              </div>
            )}

            {/* Section 1: Physician Information */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <Stethoscope className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Physician Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    First Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    MI
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={middleInitial}
                    onChange={(e) => setMiddleInitial(e.target.value.toUpperCase())}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-center text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Credentials
                  </label>
                  <input
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Last Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    NPI No. <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={npiNo}
                    onChange={(e) => setNpiNo(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Taxonomy Code
                  </label>
                  <input
                    type="text"
                    value={taxonomyCode}
                    onChange={(e) => setTaxonomyCode(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Medicaid Provider ID
                  </label>
                  <input
                    type="text"
                    value={medicaidProviderId}
                    onChange={(e) => setMedicaidProviderId(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <Building className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Practice Location Address
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Address Line 1 <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    City <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100 cursor-pointer"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Zip Code <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Delivery & Contacts */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <FileCheck2 className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Communications & Order Delivery
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Order Delivery Method
                  </label>
                  <select
                    value={orderDeliveryMethod}
                    onChange={(e) => setOrderDeliveryMethod(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100 cursor-pointer"
                  >
                    {DELIVERY_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                {/* 3-box Phone */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">(</span>
                    <input
                      id="phyPhone1"
                      type="text"
                      maxLength={3}
                      value={phone1}
                      onChange={(e) => handlePhone1Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">)</span>
                    <input
                      id="phyPhone2"
                      type="text"
                      maxLength={3}
                      value={phone2}
                      onChange={(e) => handlePhone2Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      id="phyPhone3"
                      type="text"
                      maxLength={4}
                      value={phone3}
                      onChange={(e) => handlePhone3Change(e.target.value)}
                      className="h-9 w-20 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* 3-box Fax */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Fax Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">(</span>
                    <input
                      id="phyFax1"
                      type="text"
                      maxLength={3}
                      value={fax1}
                      onChange={(e) => handleFax1Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">)</span>
                    <input
                      id="phyFax2"
                      type="text"
                      maxLength={3}
                      value={fax2}
                      onChange={(e) => handleFax2Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      id="phyFax3"
                      type="text"
                      maxLength={4}
                      value={fax3}
                      onChange={(e) => handleFax3Change(e.target.value)}
                      className="h-9 w-20 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Comments / Signature Order Notes
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full rounded-xl border border-pearl-300 bg-white p-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-300 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
              >
                Exit
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-rose-700 px-6 text-xs font-bold text-white shadow-sm hover:bg-rose-800 transition active:scale-95 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Activity Logs Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">
                  Activity Logs - Dr. {firstName} {lastName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-pearl-200 bg-pearl-50/50 p-3 dark:border-charcoal-700 dark:bg-charcoal-750">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Hilder Magessa RN</span>
                  <span className="font-mono text-[11px] text-slate-500">11/05/2026 10:15 AM</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Verified PECOS HHA ordering/referring enrollment status (CMS Provider Registry).
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

