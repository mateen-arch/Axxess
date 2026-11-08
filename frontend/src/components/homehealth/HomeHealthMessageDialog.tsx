import React from 'react';
import { CheckCheck, Clock3, X } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { MessageItem } from '../../types';

export const HomeHealthMessageDialog: React.FC<{ message: MessageItem | null; onClose: () => void }> = ({ message, onClose }) => {
  const { markMessageRead } = useHealthcare();
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="home-health-message-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
        <header className="flex items-center justify-between gap-4 border-b border-pearl-200 bg-pearl-50/70 px-5 py-4 dark:border-charcoal-700 dark:bg-charcoal-900/60 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 to-pink-500 text-sm font-black text-white">{message.senderName.slice(0, 1)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{message.senderName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{message.senderRole} · {message.organizationName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-pearl-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-charcoal-700 dark:hover:text-white"><X size={18} /></button>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{message.date}</span>
            <span className={`rounded-full px-2.5 py-1 font-bold ${message.priority === 'urgent' || message.priority === 'critical' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-pearl-100 text-slate-600 dark:bg-charcoal-700 dark:text-slate-300'}`}>{message.priority}</span>
          </div>
          <h2 id="home-health-message-title" className="text-xl font-black leading-snug text-slate-950 dark:text-white">{message.subject}</h2>
          <p className="whitespace-pre-wrap rounded-xl border border-pearl-200 bg-pearl-50/70 p-4 text-sm leading-6 text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-900/50 dark:text-slate-200">{message.snippet}</p>
          {message.patientName && <p className="text-sm text-slate-600 dark:text-slate-300">Patient: <strong className="text-slate-900 dark:text-white">{message.patientName}</strong></p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-pearl-200 bg-pearl-50/60 px-5 py-3 dark:border-charcoal-700 dark:bg-charcoal-900/40 sm:px-6">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-pearl-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-pearl-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:bg-charcoal-700">Close</button>
          {!message.isRead && <button type="button" onClick={() => { markMessageRead(message.id); onClose(); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-700"><CheckCheck size={16} /> Mark as read</button>}
        </footer>
      </section>
    </div>
  );
};
