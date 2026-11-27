import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
            case 'error':
              return <AlertCircle size={16} className="text-rose-500 shrink-0" />;
            case 'warning':
              return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
            default:
              return <Info size={16} className="text-sky-500 shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 dark:bg-charcoal-800/95 text-white shadow-2xl border border-slate-700/80 dark:border-charcoal-700 backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              {toast.title && <div className="text-xs font-black tracking-tight">{toast.title}</div>}
              <div className="text-xs font-medium text-slate-300 leading-snug">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
