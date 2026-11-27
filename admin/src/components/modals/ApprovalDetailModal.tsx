import React, { useState } from 'react';
import { X, CheckSquare, CheckCircle, XCircle, FileText, UserCheck } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { AdminApproval } from '../../types/admin';

interface ApprovalDetailModalProps {
  approval: AdminApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onDecisionSubmitted: () => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  approval,
  isOpen,
  onClose,
  onDecisionSubmitted
}) => {
  const { showToast } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  if (!isOpen || !approval) return null;

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    try {
      setIsSubmitting(true);
      await adminApi.submitApprovalDecision(
        approval.id,
        decision,
        reviewNotes.trim() || `Decision: ${decision} by Super Admin`
      );

      showToast(`Verification ${decision.toUpperCase()} successfully`, decision === 'approved' ? 'success' : 'warning');
      onDecisionSubmitted();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit decision', 'error');
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
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Administrative Verification Review</h3>
              <p className="text-[11px] text-slate-500">Module: {approval.module.toUpperCase()} • Priority: {approval.priority.toUpperCase()}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Item Title & Requester */}
          <div>
            <h4 className="text-sm font-black text-slate-950 dark:text-white leading-snug">{approval.title}</h4>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{approval.requested_by}</strong></span>
              <span>•</span>
              <span>{new Date(approval.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 leading-relaxed border border-pearl-200 dark:border-charcoal-700">
            {approval.description}
          </div>

          {/* Structured Details JSON */}
          {approval.details && Object.keys(approval.details).length > 0 && (
            <div className="space-y-1.5">
              <div className="font-extrabold text-slate-700 dark:text-slate-300">Submitted Evidence & Specifications:</div>
              <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(approval.details).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-emerald-400 font-semibold text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Notes Input */}
          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-300">Super Admin Review Rationale / Notes</label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Enter compliance justification or rejection reason..."
              className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDecision('rejected')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-extrabold transition cursor-pointer disabled:opacity-50"
            >
              <XCircle size={14} />
              <span>Reject Request</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDecision('approved')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={14} />
              <span>Approve & Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
