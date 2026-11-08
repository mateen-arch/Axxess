import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Building,
  RotateCcw,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EditInsurancePayerPageProps {
  payerId?: string;
  onBack: () => void;
  onSaved?: () => void;
}

type SectionKey = 'payer_details' | 'billing_info' | 'fee_schedule';

const SECTIONS: { id: SectionKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'payer_details', label: '1. Payer Details & Setup', icon: Shield },
  { id: 'billing_info', label: '2. Billing & UB-04 Locators', icon: FileText },
  { id: 'fee_schedule', label: '3. Fee Schedule & Rates', icon: DollarSign },
];

export const EditInsurancePayerPage: React.FC<EditInsurancePayerPageProps> = ({
  payerId = 'pay-1',
  onBack,
  onSaved,
}) => {
  const { organization } = useHealthcare();

  const [activeSection, setActiveSection] = useState<SectionKey>('payer_details');

  // Pre-filled state matching screenshot 8 & 9 (Aetna Senior Medicare)
  const [name, setName] = useState('Aetna Senior Medicare');
  const [payerCode, setPayerCode] = useState('AETNA01');
  const [clearinghouse, setClearinghouse] = useState('Availity');
  const [payerType, setPayerType] = useState('Medicare (HMO/managed care)');
  const [invoiceType, setInvoiceType] = useState('UB-04 (CMS-1450)');
  const [billType, setBillType] = useState('Home Health 32X');
  const [addressLine1, setAddressLine1] = useState('PO Box 981106');
  const [city, setCity] = useState('El Paso');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('79998');
  const [phone, setPhone] = useState('(800) 624-0756');
  const [fax, setFax] = useState('(859) 455-8650');

  // Rates
  const [snRate, setSnRate] = useState('145.00');
  const [ptRate, setPtRate] = useState('155.00');
  const [otRate, setOtRate] = useState('155.00');
  const [hhaRate, setHhaRate] = useState('45.00');

  // Logs Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            title="Return to Insurance / Payers List"
            aria-label="Return to Insurance / Payers List"
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
                Edit Insurance / Payer: {name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Payer Code: {payerCode}
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
                <Shield size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Insurance / Payer
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update contract guidelines, EDI clearinghouse routing, and reimbursement fee schedules.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-600">* Required Field</span>
          </div>

          {/* Section Navigation Pills */}
          <div className="flex items-center gap-2 border-b border-pearl-200 bg-white/60 p-2 rounded-2xl backdrop-blur-md dark:border-charcoal-700 dark:bg-charcoal-800/60">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-pearl-100 dark:text-slate-300 dark:hover:bg-charcoal-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSuccess && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold">
                  Insurance / Payer "{name}" updated successfully. Returning to list...
                </p>
              </div>
            )}

            {activeSection === 'payer_details' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Payer Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Electronic Payer ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={payerCode}
                      onChange={(e) => setPayerCode(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Clearinghouse
                    </label>
                    <select
                      value={clearinghouse}
                      onChange={(e) => setClearinghouse(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="Availity">Availity</option>
                      <option value="ZirMed">ZirMed</option>
                      <option value="Claimsnet">Claimsnet</option>
                      <option value="Axxess">Axxess</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Payer Classification Type
                    </label>
                    <input
                      type="text"
                      value={payerType}
                      onChange={(e) => setPayerType(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Claims Mailing Address
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Zip</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Provider Services Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Prior Authorization Fax
                    </label>
                    <input
                      type="text"
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'billing_info' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Invoice Type <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceType}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Bill Type <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={billType}
                      onChange={(e) => setBillType(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fee_schedule' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Skilled Nursing (SN) Rate / Visit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={snRate}
                      onChange={(e) => setSnRate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Physical Therapy (PT) Rate / Visit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ptRate}
                      onChange={(e) => setPtRate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Occupational Therapy (OT) Rate / Visit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={otRate}
                      onChange={(e) => setOtRate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Home Health Aide (HHA) Rate / Hour ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={hhaRate}
                      onChange={(e) => setHhaRate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

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
                  List of Insurance/Payer Logs - {name}
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
                  <span className="font-mono text-[11px] text-slate-500">11/04/2026 14:22</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Updated Payer EDI Electronic Claims Payer ID to AETNA01.
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

