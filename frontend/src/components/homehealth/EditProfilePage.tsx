import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  KeyRound,
  FileSignature,
  MapPin,
  Phone,
  Globe,
  Shield,
  Eye,
  EyeOff,
  User,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EditProfilePageProps {
  onBack: () => void;
  onOpenResetSignature?: () => void;
  onOpenSwitchHomecare?: () => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export const EditProfilePage: React.FC<EditProfilePageProps> = ({
  onBack,
  onOpenResetSignature,
  onOpenSwitchHomecare,
}) => {
  const { organization } = useHealthcare();

  // 1. Login Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2. Electronic Signature
  const [currentSignature, setCurrentSignature] = useState('');
  const [newSignature, setNewSignature] = useState('');
  const [confirmSignature, setConfirmSignature] = useState('');

  // 3. Address & Telecommunications (Prefilled from Screenshot 1)
  const [addressLine1, setAddressLine1] = useState('100 Cummings Center 235C');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Beverly');
  const [state, setState] = useState('Massachusetts');
  const [zip, setZip] = useState('01915');

  // 3-box home phone: 978 - 922 - 0088
  const [homePhone1, setHomePhone1] = useState('978');
  const [homePhone2, setHomePhone2] = useState('922');
  const [homePhone3, setHomePhone3] = useState('0088');

  // 3-box mobile phone: 978 - 922 - 0088
  const [mobilePhone1, setMobilePhone1] = useState('978');
  const [mobilePhone2, setMobilePhone2] = useState('922');
  const [mobilePhone3, setMobilePhone3] = useState('0088');

  // Software Language: English / Español
  const [softwareLanguage, setSoftwareLanguage] = useState<'English' | 'Español'>('English');

  // 4. Other Information
  const [ssn, setSsn] = useState('***-**-4892');
  const [showSsn, setShowSsn] = useState(false);

  // UI state
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = Boolean(
    addressLine1.trim() &&
    city.trim() &&
    state &&
    zip.trim() &&
    mobilePhone1.length === 3 &&
    mobilePhone2.length === 3 &&
    mobilePhone3.length === 4
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setShowErrors(true);
      return;
    }

    if (newSignature && newSignature !== confirmSignature) {
      setShowErrors(true);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
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
                Home
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                My Account
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Edit Profile
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Edit Profile | Hilder Magessa RN
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-bold italic text-rose-600 dark:text-rose-400">
            * = Required Field
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
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Profile and security credentials updated successfully!</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please complete all required fields (Address, City, State, Zip, Mobile Phone). If changing password or signature, ensure both confirmation fields match.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-5 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 font-black text-white text-base shadow-sm">
                  HM
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Hilder Magessa, RN
                  </h3>
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    QA Nurse / Clinical Reviewer
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-rose-100/80 pt-3 text-[11px] dark:border-rose-900/30">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Organization:</span>
                  <strong className="text-slate-800 dark:text-slate-100">Standards Home Care</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Email:</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">hilder@standardsincare.com</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Profile Created:</span>
                  <strong className="text-slate-800 dark:text-slate-100">April 18, 2023</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Account Actions
              </h4>

              <button
                type="button"
                onClick={onOpenResetSignature}
                className="flex w-full items-center justify-between rounded-xl border border-pearl-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:text-rose-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileSignature size={15} className="text-rose-600" />
                  <span>Reset Signature</span>
                </div>
                <ArrowLeft size={13} className="rotate-180 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenSwitchHomecare}
                className="flex w-full items-center justify-between rounded-xl border border-pearl-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:text-rose-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-rose-600" />
                  <span>Switch to Homecare</span>
                </div>
                <ArrowLeft size={13} className="rotate-180 text-slate-400" />
              </button>
            </div>

            {/* Security Tip */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Shield size={16} className="text-emerald-600" />
                <span>HIPAA 2FA Security</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Password changes apply across Axxess Central, Home Health, and Axxess Connect mobile applications simultaneously.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-pearl-100 p-3 text-[11px] text-slate-500 dark:bg-charcoal-800/80 dark:text-slate-400">
            Axxess Identity Access Management • v4.9
          </div>
        </aside>

        {/* Right Form Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Top Row: Login Password & Electronic Signature */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Box 1: Login Password */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock size={16} className="text-rose-600" />
                  Login Password
                </h2>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 pr-9 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      New Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 pr-9 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm New Password:
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </section>

              {/* Box 2: Electronic Signature */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileSignature size={16} className="text-rose-600" />
                  Electronic Signature
                </h2>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current Signature:
                    </label>
                    <input
                      type="password"
                      value={currentSignature}
                      onChange={(e) => setCurrentSignature(e.target.value)}
                      placeholder="Enter current PIN / signature"
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      New Signature:
                    </label>
                    <input
                      type="password"
                      value={newSignature}
                      onChange={(e) => setNewSignature(e.target.value)}
                      placeholder="Enter new 4-8 digit signature PIN"
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm New Signature:
                    </label>
                    <input
                      type="password"
                      value={confirmSignature}
                      onChange={(e) => setConfirmSignature(e.target.value)}
                      placeholder="Confirm new signature PIN"
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Box 3: Address & Telecommunications */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-rose-600" />
                Address & Telecommunications
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Left: Physical Address */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Address Line 1: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Address Line 2:
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment, suite, unit"
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      City: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        State: <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-2.5 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      >
                        {US_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Zip: <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-2.5 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Phones & Language */}
                <div className="space-y-3.5">
                  {/* Home Phone (3 boxes) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Home Phone:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={3}
                        value={homePhone1}
                        onChange={(e) => setHomePhone1(e.target.value.replace(/\D/g, ''))}
                        className="w-16 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="text"
                        maxLength={3}
                        value={homePhone2}
                        onChange={(e) => setHomePhone2(e.target.value.replace(/\D/g, ''))}
                        className="w-16 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={homePhone3}
                        onChange={(e) => setHomePhone3(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Mobile Phone (3 boxes) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mobile Phone: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={3}
                        value={mobilePhone1}
                        onChange={(e) => setMobilePhone1(e.target.value.replace(/\D/g, ''))}
                        className="w-16 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="text"
                        maxLength={3}
                        value={mobilePhone2}
                        onChange={(e) => setMobilePhone2(e.target.value.replace(/\D/g, ''))}
                        className="w-16 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={mobilePhone3}
                        onChange={(e) => setMobilePhone3(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 h-9 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Software Language: English / Español */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Software Language: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <div className="flex items-center gap-6 h-9">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="radio"
                          name="softwareLanguage"
                          checked={softwareLanguage === 'English'}
                          onChange={() => setSoftwareLanguage('English')}
                          className="accent-rose-600"
                        />
                        English
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="radio"
                          name="softwareLanguage"
                          checked={softwareLanguage === 'Español'}
                          onChange={() => setSoftwareLanguage('Español')}
                          className="accent-rose-600"
                        />
                        Español
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Box 4: Other Information */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-rose-600" />
                Other Information
              </h2>

              <div className="max-w-md space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Social Security Number:
                </label>
                <div className="relative">
                  <input
                    type={showSsn ? 'text' : 'password'}
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 pr-9 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSsn(!showSsn)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSsn ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </section>

            {/* Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-pearl-200/80 pt-4 dark:border-charcoal-750">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-6 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-rose-600 px-7 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

