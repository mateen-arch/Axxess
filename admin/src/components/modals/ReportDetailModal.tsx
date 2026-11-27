import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, Trash2, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { ModerationReport } from '../../types/admin';

interface ReportDetailModalProps {
  report: ModerationReport | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose, onResolved }) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  if (!isOpen || !report) return null;

  const handleAction = async (actionTaken: string) => {
    try {
      setIsSubmitting(true);
      await adminApi.resolveReport(report.id, {
        actionTaken,
        adminNotes: adminNotes.trim() || `Resolved with action: ${actionTaken}`,
        status: 'resolved'
      });

      showToast(`Report resolved with action: ${actionTaken.replace('_', ' ')}`, 'success');
      onResolved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve report', 'error');
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
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Moderation Incident Investigation</h3>
              <p className="text-[11px] text-slate-500">Report #{report.id.slice(0, 8)} • Severity: {report.severity.toUpperCase()}</p>
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

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Reported User</div>
              <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{report.reported_user_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Filed By</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{report.reporter_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Category</div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">{report.report_type.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5 capitalize">{report.status.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <div className="font-extrabold text-slate-700 dark:text-slate-300">Reporter's Narrative & Violation Reason:</div>
            <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 leading-relaxed border border-pearl-200 dark:border-charcoal-700">
              {report.reason}
            </div>
          </div>

          {/* Flagged Message (if applicable) */}
          {report.message_content && (
            <div className="space-y-1">
              <div className="font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Flagged Message Content in Question:</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-200 font-mono text-xs leading-relaxed break-words">
                "{report.message_content}"
              </div>
            </div>
          )}

          {/* Admin Findings */}
          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Administrative Findings & Action Notes</label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Record investigation notes, mediation summary, or disciplinary rationale..."
              className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 space-y-2">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Available Disciplinary Actions:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('dismissed')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 hover:bg-pearl-100 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
              >
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Dismiss (No Violation)</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('user_warned')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold transition cursor-pointer"
              >
                <AlertTriangle size={14} className="text-amber-500" />
                <span>Issue Written Warning</span>
              </button>

              {report.reported_message_id && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction('message_deleted')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-800 dark:text-rose-300 font-bold transition cursor-pointer"
                >
                  <Trash2 size={14} className="text-rose-600" />
                  <span>Scrub Message Only</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('user_blocked')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-xs transition cursor-pointer"
              >
                <Ban size={14} />
                <span>Block User from System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
