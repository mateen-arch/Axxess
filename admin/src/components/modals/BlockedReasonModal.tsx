import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, AlertTriangle, CheckCircle, Clock, User, ShieldCheck, Unlock } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser } from '../../types/admin';

interface BlockedReasonModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUnblocked: () => void;
}

export const BlockedReasonModal: React.FC<BlockedReasonModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUnblocked
}) => {
  const { showToast } = useAdmin();
  const [isUnblocking, setIsUnblocking] = useState(false);

  if (!isOpen || !user) return null;

  const handleUnblock = async () => {
    if (!window.confirm(`Are you sure you want to lift the account suspension and unblock ${user.full_name}?`)) {
      return;
    }

    try {
      setIsUnblocking(true);
      await adminApi.unblockUser(user.id);
      showToast(`User ${user.full_name} has been unblocked successfully`, 'success');
      onUserUnblocked();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock user', 'error');
    } finally {
      setIsUnblocking(false);
    }
  };

  const formattedBlockedDate = user.blocked_at
    ? new Date(user.blocked_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recent Enforcement Record';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Centered Modal Card */}
      <div
        className="relative my-auto w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-3xl border border-rose-300 dark:border-rose-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950 dark:text-rose-100">
                Account Suspension & Blocking Rationale
              </h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Official compliance audit report for {user.full_name}
              </p>
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

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Status & Enforcement Metadata Strip */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-rose-600 text-white mt-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Blocked</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enforced Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 text-[11px]">
                <Clock size={12} className="text-rose-500" />
                <span>{formattedBlockedDate}</span>
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Enforcing Compliance Officer:</span>
              <strong className="text-slate-900 dark:text-white font-extrabold flex items-center gap-1">
                <ShieldCheck size={13} className="text-rose-600" />
                <span>{user.blocked_by || 'Dr. Sarah Sterling (Super Admin)'}</span>
              </strong>
            </div>
          </div>

          {/* Full Blocking Reason Card */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-extrabold text-xs">
              <AlertTriangle size={15} />
              <span>Documented Policy Violation & Legal Reason:</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-800 border-2 border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-sm">
              {user.blocked_reason ? (
                <p className="whitespace-pre-wrap">{user.blocked_reason}</p>
              ) : (
                <p className="italic text-slate-400">
                  No custom reason text was recorded at the time of enforcement. Account is restricted pursuant to CareOrbit Security & HIPAA compliance protocols.
                </p>
              )}
            </div>
          </div>

          {/* User Record Snapshot */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Profile Details</span>
            <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Full Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Work Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Department:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{user.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">System Role:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{user.role?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
            <strong>System Restriction Active:</strong> This account cannot access CareOrbit Central, CareOrbit Home Health, or send messages across CareOrbit Connect. To restore account access, click "Unblock User" below.
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-4 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-charcoal-750 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleUnblock}
            disabled={isUnblocking}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
          >
            <Unlock size={14} className="stroke-[2.5]" />
            <span>{isUnblocking ? 'Lifting Suspension...' : 'Unblock User from System'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
