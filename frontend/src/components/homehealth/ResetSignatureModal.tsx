import React, { useState } from 'react';
import {
  FileSignature,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface ResetSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  userName?: string;
}

export const ResetSignatureModal: React.FC<ResetSignatureModalProps> = ({
  isOpen,
  onClose,
  email = 'hilder@standardsincare.com',
  userName = "Hilder's",
}) => {
  const [isSent, setIsSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleResetSignature = () => {
    setIsSent(true);
    setShowToast(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/40">
      {/* Toast Notification (Screenshot 3 exact replica with modern polish) */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 rounded-xl border border-emerald-300 bg-[#E3F2E1] px-4 py-3 text-xs font-semibold text-emerald-950 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0 dark:text-emerald-400" />
          <span>Your request to reset your signature was successful. Please check your e-mail.</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white"
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-pearl-100 bg-rose-600 px-5 py-3 text-white dark:border-charcoal-700">
          <div className="flex items-center gap-2">
            <FileSignature size={18} />
            <h3 className="text-sm font-bold tracking-tight">
              Reset {userName} Signature
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-pearl-200/90 bg-pearl-50/70 p-4 dark:border-charcoal-700 dark:bg-charcoal-800/60">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              Reset Signature
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Click on the button below to reset your signature. An e-mail with instructions on how to reset your signature will be sent to{' '}
              <strong className="font-mono text-slate-900 dark:text-white font-bold">{email}</strong>.
            </p>
          </div>

          {/* Reset Action Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleResetSignature}
              disabled={isSent}
              className={`rounded-xl px-6 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer ${isSent
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#475569] text-white hover:bg-[#334155]'
                }`}
            >
              {isSent ? 'Email Sent Successfully' : 'Reset Signature'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-pearl-100 bg-pearl-50/50 px-5 py-3 dark:border-charcoal-750 dark:bg-charcoal-900/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-pearl-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

