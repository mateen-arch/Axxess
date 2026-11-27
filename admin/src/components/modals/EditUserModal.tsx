import React, { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-charcoal-850 rounded-3xl border border-pearl-200 dark:border-charcoal-700 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pearl-200/80 dark:bg-charcoal-750 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Edit Permissions & Credentials</h3>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-semibold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-semibold focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-semibold focus:outline-none"
              >
                <option value="clinician">Clinician (Field RN / PT / OT)</option>
                <option value="case_manager">Case Manager</option>
                <option value="qa_reviewer">QA & OASIS Reviewer</option>
                <option value="intake_coordinator">Intake Coordinator</option>
                <option value="physician">Attending Physician</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Module Access */}
          <div className="space-y-1.5 pt-2">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">
              Module Access Permissions (The 3 Modules)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'central', label: 'Central' },
                { id: 'home_health', label: 'Home Health' },
                { id: 'connect', label: 'Connect' },
              ].map(m => {
                const checked = moduleAccess.includes(m.id as SystemModuleKey);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleModule(m.id as SystemModuleKey)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      checked
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-extrabold'
                        : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800 text-slate-400 font-semibold'
                    }`}
                  >
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] mt-0.5">{checked ? '✓ Allowed' : 'Disabled'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* License */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="License #"
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-mono text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">License Verification</label>
              <select
                value={licenseStatus}
                onChange={e => setLicenseStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-semibold focus:outline-none"
              >
                <option value="verified">Verified</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
