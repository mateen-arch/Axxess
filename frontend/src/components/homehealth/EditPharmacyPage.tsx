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
  RotateCcw,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EditPharmacyPageProps {
  pharmacyId?: string;
  onBack: () => void;
  onSaved?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export const EditPharmacyPage: React.FC<EditPharmacyPageProps> = ({
  pharmacyId = 'ph-1',
  onBack,
  onSaved,
}) => {
  const { organization } = useHealthcare();

  // Pre-filled state matching screenshot 7 & 8 (Anchor Pharmacy)
  const [pharmacyName, setPharmacyName] = useState('Anchor Pharmacy');
  const [addressLine1, setAddressLine1] = useState('1014 Main St.');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Worcester');
  const [state, setState] = useState('MA');
  const [zip, setZip] = useState('01603');

  const [contactFirstName, setContactFirstName] = useState('Mark');
  const [contactLastName, setContactLastName] = useState('Goldstein');
  const [email, setEmail] = useState('rx@anchorpharmacy.com');

  // 3-box phone inputs: (978) 720-8170
  const [phone1, setPhone1] = useState('978');
  const [phone2, setPhone2] = useState('720');
  const [phone3, setPhone3] = useState('8170');

  // 3-box fax inputs: (978) 969-0270
  const [fax1, setFax1] = useState('978');
  const [fax2, setFax2] = useState('969');
  const [fax3, setFax3] = useState('0270');

  const [comment, setComment] = useState('Preferred retail and delivery pharmacy partner in Worcester County for scheduled medication box fills.');

  // Activity Logs Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const isValid = Boolean(
    pharmacyName.trim() &&
    addressLine1.trim() &&
    city.trim() &&
    zip.trim()
  );

  const handlePhone1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone1(cleaned);
    if (cleaned.length === 3) document.getElementById('phPhone2')?.focus();
  };

  const handlePhone2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setPhone2(cleaned);
    if (cleaned.length === 3) document.getElementById('phPhone3')?.focus();
  };

  const handlePhone3Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPhone3(cleaned);
  };

  const handleFax1Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax1(cleaned);
    if (cleaned.length === 3) document.getElementById('phFax2')?.focus();
  };

  const handleFax2Change = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setFax2(cleaned);
    if (cleaned.length === 3) document.getElementById('phFax3')?.focus();
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
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Pharmacies List"
            aria-label="Return to Pharmacies List"
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
                Edit Pharmacy: {pharmacyName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Pharmacy ID: {pharmacyId}
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
                <Pill size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Pharmacy
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update pharmaceutical partner, phone, fax, and dispatch contacts.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-600">* Required Field</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold">
                  Pharmacy "{pharmacyName}" updated successfully. Returning to list...
                </p>
              </div>
            )}

            {/* Validation Errors Alert */}
            {showErrors && !isValid && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300">
                <AlertTriangle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <p className="text-xs font-semibold">
                  Please complete all required fields highlighted below.
                </p>
              </div>
            )}

            {/* General Info Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <Pill className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pharmacy Identification
                </h2>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pharmacy Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <MapPin className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Physical Address
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
                    placeholder="Suite, unit, floor, etc."
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

            {/* Communications */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
              <div className="flex items-center gap-2 border-b border-pearl-150 pb-3 dark:border-charcoal-700">
                <Phone className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Communications & Staff Contact
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact First Name
                  </label>
                  <input
                    type="text"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Last Name
                  </label>
                  <input
                    type="text"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* 3-box Phone */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">(</span>
                    <input
                      id="phPhone1"
                      type="text"
                      maxLength={3}
                      value={phone1}
                      onChange={(e) => handlePhone1Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">)</span>
                    <input
                      id="phPhone2"
                      type="text"
                      maxLength={3}
                      value={phone2}
                      onChange={(e) => handlePhone2Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      id="phPhone3"
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
                      id="phFax1"
                      type="text"
                      maxLength={3}
                      value={fax1}
                      onChange={(e) => handleFax1Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">)</span>
                    <input
                      id="phFax2"
                      type="text"
                      maxLength={3}
                      value={fax2}
                      onChange={(e) => handleFax2Change(e.target.value)}
                      className="h-9 w-14 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      id="phFax3"
                      type="text"
                      maxLength={4}
                      value={fax3}
                      onChange={(e) => handleFax3Change(e.target.value)}
                      className="h-9 w-20 rounded-xl border border-pearl-300 bg-white text-center font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Comment / Notes */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Comments / Prescription Coordination Notes
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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
                  Activity Logs - {pharmacyName}
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
                  <span className="font-mono text-[11px] text-slate-500">10/18/2026 02:40 PM</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Updated after-hours prescription delivery direct phone line to (978) 720-8170.
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

