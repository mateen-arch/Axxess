import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser } from '../../types/admin';

interface BlockUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserBlocked: () => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({ user, isOpen, onClose, onUserBlocked }) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyCategory, setPolicyCategory] = useState('Inappropriate or Harassing Messages');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !user) return null;

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim()
      ? `${policyCategory}: ${customReason.trim()}`
      : policyCategory;

    try {
      setIsSubmitting(true);
      await adminApi.blockUser(user.id, finalReason);
      showToast(`User ${user.full_name} has been blocked and access revoked`, 'warning');
      onUserBlocked();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to block user', 'error');
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
        className="relative my-auto w-full max-w-md bg-white dark:bg-charcoal-850 rounded-3xl border border-rose-300 dark:border-rose-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-rose-50/70 dark:bg-rose-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950 dark:text-rose-200">Enforce Policy: Block User</h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">Immediate platform suspension & messaging restriction</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-rose-100/50 dark:hover:bg-charcoal-750 transition cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300 shrink-0">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-snug">
            Blocking <strong className="font-extrabold">{user.full_name}</strong> will instantly terminate their active sessions, prevent login, and lock their messaging capabilities across CareOrbit Connect.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBlock} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Policy Violation Category *</label>
            <select
              value={policyCategory}
              onChange={e => setPolicyCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              <option value="Inappropriate or Harassing Messages">Inappropriate or Harassing Messages</option>
              <option value="HIPAA PHI Data Breach">HIPAA PHI Data Breach (Unencrypted transmission)</option>
              <option value="Insubordination & Refusal of EVV">Insubordination & Refusal of Electronic Visit Verification</option>
              <option value="Documentation Falsification">Documentation / Visit Falsification</option>
              <option value="Unlicensed Practice / Expired License">Unlicensed Practice / Expired Clinical License</option>
              <option value="Patient Safety Endangerment">Patient Safety Endangerment</option>
              <option value="Administrative Policy Violation">Other Administrative Policy Violation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Investigation Findings & Notes</label>
            <textarea
              rows={3}
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Enter incident specifics, case number, or message snippet for permanent compliance records..."
              className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Actions */}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <ShieldAlert size={14} />
              <span>{isSubmitting ? 'Enforcing Block...' : 'Confirm Account Block'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
