import React, { useState } from 'react';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Shield,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { SystemModuleKey } from '../types/admin';

interface AddUserPageProps {
  onBack: () => void;
  onUserCreated: () => void;
}

export const AddUserPage: React.FC<AddUserPageProps> = ({ onBack, onUserCreated }) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Clinical Operations');
  const [title, setTitle] = useState('Registered Nurse');
  const [role, setRole] = useState('clinician');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [status, setStatus] = useState('active');

  // Module Access (Separate 3 CareOrbit Modules)
  const [moduleAccess, setModuleAccess] = useState<SystemModuleKey[]>([
    'central',
    'home_health',
    'connect'
  ]);

  // Professional Credentials
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('TX');
  const [licenseStatus, setLicenseStatus] = useState('verified');

  const toggleModule = (mod: SystemModuleKey) => {
    setModuleAccess(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showToast('Full name and work email are required', 'error');
      return;
    }

    if (moduleAccess.length === 0) {
      showToast('Please grant access to at least one system module', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminApi.createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        department,
        title,
        moduleAccess,
        licenseNumber: licenseNumber.trim() || undefined,
        licenseState,
        licenseStatus,
        status,
        phone: phone.trim() || undefined,
        isSuperAdmin
      });

      if (res.success) {
        showToast(`User ${fullName} successfully registered in database!`, 'success');
        onUserCreated();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to register user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* 1. Header Segment (Consistent with CareOrbit Standard Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-2xl border border-pearl-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            title="Return to User Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <UserPlus className="text-rose-600 dark:text-rose-400 shrink-0" size={24} />
              <span>Add New Platform User</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Register clinician credentials, configure department roles, and grant CareOrbit system module permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-charcoal-750 transition cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-extrabold shadow-md shadow-rose-600/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Registering...</span>
            ) : (
              <>
                <Check size={15} className="stroke-[3]" />
                <span>Save & Register User</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Personal & Contact Information */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Mail size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Personal & Contact Details</h3>
              <p className="text-[11px] text-slate-500">Core identity and communication information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Dr. Jennifer Hayes, MD or Marcus Vance, RN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. jhayes@careorbit.health"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 214-555-0199"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Clinical Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              >
                <option value="Clinical Operations">Clinical Operations</option>
                <option value="Skilled Nursing">Skilled Nursing</option>
                <option value="Rehabilitation">Rehabilitation (PT / OT / ST)</option>
                <option value="Medical Social Work">Medical Social Work</option>
                <option value="Intake & Admissions">Intake & Admissions</option>
                <option value="Administration">Executive Administration</option>
                <option value="Field Logistics">Field Logistics & Fleet</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Professional Job Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Field Registered Nurse / Case Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Role & System Privileges */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Role & Administrative Authority</h3>
              <p className="text-[11px] text-slate-500">Platform privileges and account activation status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Primary System Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              >
                <option value="clinician">Clinician (Field & Clinical Care Delivery)</option>
                <option value="director_of_nursing">Director of Nursing (Clinical QA & QA Signoff)</option>
                <option value="clinical_supervisor">Clinical Supervisor (Field Staff Manager)</option>
                <option value="administrator">Administrator (Operations & System Management)</option>
                <option value="intake_coordinator">Intake Coordinator (Patient Referral & Lead Screening)</option>
                <option value="scheduler">Scheduler (Visit Dispatch & Territory Routing)</option>
                <option value="case_manager">Case Manager (Episode & Authorization Management)</option>
                <option value="staff">Staff Member (Operational Support)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Initial Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              >
                <option value="active">Active (Immediate Login & Access)</option>
                <option value="pending_approval">Pending Approval (Awaiting Credential Verification)</option>
                <option value="suspended">Suspended (Restricted Access)</option>
              </select>
            </div>

            {/* Super Admin Privileges Toggle */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <input
                type="checkbox"
                id="superAdminToggle"
                checked={isSuperAdmin}
                onChange={e => setIsSuperAdmin(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-amber-300 cursor-pointer"
              />
              <label htmlFor="superAdminToggle" className="cursor-pointer select-none">
                <div className="font-black text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <Shield size={14} className="text-amber-600" />
                  <span>Grant Super Admin Authority</span>
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5 leading-relaxed">
                  Grants access to the separate CareOrbit Super Admin Portal, user suspension/blocking controls, message moderation, and cross-module configuration.
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Dedicated System Modules Access (The 3 Modules Managed Separately) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">CareOrbit System Module Access</h3>
              <p className="text-[11px] text-slate-500">Configure independent permissions across our three distinct enterprise modules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Module 1: Central */}
            <div
              onClick={() => toggleModule('central')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                moduleAccess.includes('central')
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs'
                  : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Module 01</span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                    moduleAccess.includes('central') ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-charcoal-600'
                  }`}>
                    {moduleAccess.includes('central') && <Check size={12} className="stroke-[3]" />}
                  </div>
                </div>
                <div className="font-black text-slate-900 dark:text-white text-xs">CareOrbit Central</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Enterprise intake pipeline, schedule center, patient charts, territory rosters, and census analytics.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-pearl-100 dark:border-charcoal-700 flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Port 5173 Client View</span>
              </div>
            </div>

            {/* Module 2: Home Health */}
            <div
              onClick={() => toggleModule('home_health')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                moduleAccess.includes('home_health')
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs'
                  : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Module 02</span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                    moduleAccess.includes('home_health') ? 'bg-rose-600 text-white' : 'border border-slate-300 dark:border-charcoal-600'
                  }`}>
                    {moduleAccess.includes('home_health') && <Check size={12} className="stroke-[3]" />}
                  </div>
                </div>
                <div className="font-black text-slate-900 dark:text-white text-xs">CareOrbit Home Health</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Clinical EMR, OASIS-E assessments, 60-day episode manager, orders QA center, and infection surveillance.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-pearl-100 dark:border-charcoal-700 flex items-center gap-1.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Clinical & EMR Operations</span>
              </div>
            </div>

            {/* Module 3: Connect & Planner */}
            <div
              onClick={() => toggleModule('connect')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                moduleAccess.includes('connect')
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Module 03</span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                    moduleAccess.includes('connect') ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-charcoal-600'
                  }`}>
                    {moduleAccess.includes('connect') && <Check size={12} className="stroke-[3]" />}
                  </div>
                </div>
                <div className="font-black text-slate-900 dark:text-white text-xs">CareOrbit Connect & Planner</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  HIPAA-compliant care team messaging, field route dispatch, and emergency triage broadcast channels.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-pearl-100 dark:border-charcoal-700 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Encrypted Communications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Professional License & Credentials */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">State Licensure & Verification</h3>
              <p className="text-[11px] text-slate-500">Board certification and compliance auditing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">License / Registry Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="e.g. RN-TX-884120"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Licensing State</label>
              <select
                value={licenseState}
                onChange={e => setLicenseState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              >
                <option value="TX">Texas (TX)</option>
                <option value="MA">Massachusetts (MA)</option>
                <option value="CA">California (CA)</option>
                <option value="FL">Florida (FL)</option>
                <option value="NY">New York (NY)</option>
                <option value="OK">Oklahoma (OK)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Verification Status</label>
              <select
                value={licenseStatus}
                onChange={e => setLicenseStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              >
                <option value="verified">Verified (Active State Board Record)</option>
                <option value="pending_verification">Pending Audit Verification</option>
                <option value="expired">Expired / Requires Renewal</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-pearl-200 dark:border-charcoal-700">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-charcoal-750 transition cursor-pointer shadow-2xs"
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-extrabold shadow-md shadow-rose-600/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Registering User...</span>
            ) : (
              <>
                <Check size={16} className="stroke-[3]" />
                <span>Save & Register User</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
