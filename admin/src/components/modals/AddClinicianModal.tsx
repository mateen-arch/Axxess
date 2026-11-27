import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Stethoscope,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';

interface AddClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClinicianAdded: () => void;
}

export const AddClinicianModal: React.FC<AddClinicianModalProps> = ({
  isOpen,
  onClose,
  onClinicianAdded
}) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Registered Nurse');
  const [credentials, setCredentials] = useState('RN');
  const [discipline, setDiscipline] = useState('Nursing');
  const [branch, setBranch] = useState('Standards Home Care');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('MA');
  const [licenseStatus, setLicenseStatus] = useState('verified');
  const [workStatus, setWorkStatus] = useState('Available');
  const [serviceLines, setServiceLines] = useState<string[]>(['home_health']);
  const [currentAddress, setCurrentAddress] = useState('');

  if (!isOpen) return null;

  const toggleServiceLine = (sl: string) => {
    setServiceLines(prev =>
      prev.includes(sl) ? prev.filter(s => s !== sl) : [...prev, sl]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Clinician full name is required', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminApi.createClinician({
        name: name.trim(),
        title: title.trim(),
        credentials: credentials.trim(),
        discipline,
        branch,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
        licenseState,
        licenseStatus,
        workStatus,
        serviceLines,
        currentAddress: currentAddress.trim() || undefined
      });

      if (res.success) {
        showToast(`Clinician ${res.clinician.name} enrolled successfully!`, 'success');
        onClinicianAdded();
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to enroll clinician', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <UserPlus size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Enroll New Field Clinician
              </h3>
              <p className="text-xs text-slate-400">
                Register a clinician into the master roster with state license verification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pearl-200 dark:hover:bg-charcoal-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Row 1: Full Name & Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Emily Thorne or Sarah Sterling"
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Credentials <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                placeholder="RN, BSN, PT, MSW"
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Row 2: Title & Discipline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Registered Nurse / Case Manager"
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Discipline Category
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Nursing">Nursing (RN / LPN)</option>
                <option value="Physical Therapy">Physical Therapy (PT / PTA)</option>
                <option value="Occupational Therapy">Occupational Therapy (OT / COTA)</option>
                <option value="Speech Therapy">Speech Therapy (ST / SLP)</option>
                <option value="Medical Social Work">Medical Social Work (MSW)</option>
                <option value="Home Health Aide">Home Health Aide (HHA / CNA)</option>
                <option value="Physician Liaison">Physician Liaison</option>
              </select>
            </div>
          </div>

          {/* Row 3: Branch & Work Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Territory Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Standards Home Care">Standards Home Care</option>
                <option value="Main Branch">Main Branch</option>
                <option value="North Texas Regional">North Texas Regional</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Initial Field Status
              </label>
              <select
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Available">Available for Routing</option>
                <option value="In Field">In Field (Active Client Route)</option>
                <option value="Active">Active Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Row 4: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Staff Email (Creates User Login)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@careorbit.health"
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 234-5678"
                className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Row 5: State License Verification */}
          <div className="bg-pearl-50 dark:bg-charcoal-800 p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>State Board Licensure & Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. RN-894102"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">License State</label>
                <input
                  type="text"
                  value={licenseState}
                  onChange={(e) => setLicenseState(e.target.value)}
                  placeholder="MA, TX, CA"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">Board Verification</label>
                <select
                  value={licenseStatus}
                  onChange={(e) => setLicenseStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 text-slate-900 dark:text-white text-xs"
                >
                  <option value="verified">Verified & Current</option>
                  <option value="pending_verification">Pending Board Verification</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 6: Service Lines Multi-select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Assigned Service Lines
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'home_health', label: 'Home Health' },
                { id: 'home_care', label: 'Home Care' },
                { id: 'hospice', label: 'Hospice' },
              ].map((sl) => {
                const isSelected = serviceLines.includes(sl.id);
                return (
                  <button
                    key={sl.id}
                    type="button"
                    onClick={() => toggleServiceLine(sl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-pearl-50 dark:bg-charcoal-800 text-slate-500 border-pearl-200 dark:border-charcoal-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={12} className="inline mr-1" />}
                    {sl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 7: Territory Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Primary Service Territory / Dispatch Hub
            </label>
            <input
              type="text"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
              placeholder="e.g. 500 Boylston St, Boston, MA 02116"
              className="w-full px-3 py-2 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>{isSubmitting ? 'Enrolling...' : 'Enroll Clinician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
