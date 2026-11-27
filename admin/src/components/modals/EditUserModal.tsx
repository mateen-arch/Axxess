import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, SlidersHorizontal } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser, SystemModuleKey } from '../../types/admin';

interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onUserUpdated }) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('clinician');
  const [department, setDepartment] = useState('Clinical Operations');
  const [title, setTitle] = useState('');
  const [moduleAccess, setModuleAccess] = useState<SystemModuleKey[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'verified' | 'pending_verification' | 'expired'>('verified');
  const [status, setStatus] = useState<'active' | 'pending_approval' | 'suspended' | 'blocked'>('active');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRole(user.role || 'clinician');
      setDepartment(user.department || 'Clinical Operations');
      setTitle(user.title || '');
      setModuleAccess(user.module_access || ['central', 'home_health', 'connect']);
      setLicenseNumber(user.license_number || '');
      setLicenseStatus(user.license_status || 'verified');
      setStatus(user.status || 'active');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const toggleModule = (mod: SystemModuleKey) => {
    setModuleAccess(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminApi.updateUser(user.id, {
        full_name: fullName,
        role,
        department,
        title,
        moduleAccess,
        license_number: licenseNumber,
        license_status: licenseStatus,
        status
      });

      showToast(`User ${fullName} updated successfully`, 'success');
      onUserUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Centered Modal Card */}
      <div 
        className="relative my-auto w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-3xl border border-pearl-200 dark:border-charcoal-700 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/80 dark:bg-charcoal-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pearl-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Edit Permissions & Credentials</h3>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-charcoal-750 transition cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="clinician">Clinician (Field RN / PT / OT)</option>
                <option value="case_manager">Case Manager</option>
                <option value="qa_reviewer">QA & OASIS Reviewer</option>
                <option value="supervisor">Clinical Supervisor</option>
                <option value="admin">System Administrator</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Professional Job Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Field Registered Nurse / Case Manager"
              className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">License Verification</label>
              <select
                value={licenseStatus}
                onChange={e => setLicenseStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="verified">Verified</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Module Access Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Module Access Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleModule('central')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  moduleAccess.includes('central')
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-pearl-200 dark:border-charcoal-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-mono">Module 1</div>
                <div className="text-xs font-black">Central</div>
              </button>

              <button
                type="button"
                onClick={() => toggleModule('home_health')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  moduleAccess.includes('home_health')
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                    : 'border-pearl-200 dark:border-charcoal-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-mono">Module 2</div>
                <div className="text-xs font-black">Home Health</div>
              </button>

              <button
                type="button"
                onClick={() => toggleModule('connect')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  moduleAccess.includes('connect')
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'border-pearl-200 dark:border-charcoal-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-mono">Module 3</div>
                <div className="text-xs font-black">Connect</div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
