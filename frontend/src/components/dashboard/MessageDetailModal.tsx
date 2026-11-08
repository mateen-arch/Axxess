import React from 'react';
import { X, CheckCheck, Clock, User, Reply, AlertCircle } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const MessageDetailModal: React.FC = () => {
  const { selectedMessage, setSelectedMessage, markMessageRead } = useHealthcare();

  if (!selectedMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50 dark:bg-charcoal-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {selectedMessage.senderName[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedMessage.senderName}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                {selectedMessage.senderRole} • {selectedMessage.organizationName}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedMessage(null)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Clock size={12} />
              {selectedMessage.date}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="badge badge-slate text-[10px]">
                {selectedMessage.serviceLine === 'home_care' ? 'Home Care' : 'Home Health'}
              </span>
              {selectedMessage.priority === 'urgent' && (
                <span className="badge badge-crimson text-[10px]">
                  <AlertCircle size={10} /> Urgent
                </span>
              )}
            </div>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {selectedMessage.subject}
          </h3>

          <p className="text-slate-700 dark:text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-charcoal-900 p-4 rounded-xl border border-slate-200 dark:border-charcoal-700">
            {selectedMessage.snippet}
            {"\n\n"}
            This communication was dispatched under HIPAA compliance guidelines for Standards Home Care clinicians. Any clinical orders, physician list revisions, or infection audit actions must be completed and countersigned within 24 hours.
          </p>

          {selectedMessage.patientName && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-100 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 font-medium">
              Referenced Patient: <strong>{selectedMessage.patientName}</strong>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-900/60 flex items-center justify-between">
          <button
            onClick={() => {
              markMessageRead(selectedMessage.id);
              setSelectedMessage(null);
            }}
            className="btn-secondary text-xs"
          >
            <CheckCheck size={14} className="text-emerald-600" />
            <span>Mark as Read</span>
          </button>

          <button
            onClick={() => {
              alert(`Replying to ${selectedMessage.senderName}`);
              setSelectedMessage(null);
            }}
            className="btn-primary text-xs"
          >
            <Reply size={14} />
            <span>Reply via Axxess Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
