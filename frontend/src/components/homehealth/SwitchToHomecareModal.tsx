import React, { useState } from 'react';
import {
  Globe,
  Building,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface SwitchToHomecareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitched?: () => void;
}

export const SwitchToHomecareModal: React.FC<SwitchToHomecareModalProps> = ({
  isOpen,
  onClose,
  onSwitched,
}) => {
  const { setServiceFilter, organization } = useHealthcare();
  const [selectedApp, setSelectedApp] = useState<'standards_homecare'>('standards_homecare');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchDone, setSwitchDone] = useState(false);

  if (!isOpen) return null;

  const handleSwitch = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setServiceFilter('home_care');
      setIsSwitching(false);
      setSwitchDone(true);
      setTimeout(() => {
        onSwitched?.();
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/40">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-pearl-100 bg-rose-600 px-5 py-3 text-white dark:border-charcoal-700">
          <div className="flex items-center gap-2">
            <Globe size={18} />
            <h3 className="text-sm font-bold tracking-tight">Switch to Homecare Application</h3>
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
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Currently logged in to <span className="text-rose-600 italic">Standards Home Care</span>
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Switch login to:
            </p>
          </div>

          {/* Profile Selection Box */}
          <div
            onClick={() => setSelectedApp('standards_homecare')}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedApp === 'standards_homecare'
                ? 'border-rose-400 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20 shadow-xs ring-1 ring-rose-400/30'
                : 'border-pearl-200 bg-pearl-50/60 dark:border-charcoal-700 dark:bg-charcoal-800/50 hover:border-pearl-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                  Standards Home Care
                </h5>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  QA Nurse profile created on 4/18/2023
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Home Care Suite Active
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Private Duty & EVV Care Coordination
                  </span>
                </div>
              </div>

              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-rose-600 bg-rose-600 text-white">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>
          </div>

          {switchDone && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Switching active application session to Standards Home Care...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-pearl-100 bg-pearl-50/50 px-5 py-3 dark:border-charcoal-750 dark:bg-charcoal-900/40">
          <button
            type="button"
            onClick={handleSwitch}
            disabled={isSwitching || switchDone}
            className="rounded-xl border border-slate-300 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            {isSwitching ? 'Switching Application...' : 'Switch Application'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-pearl-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

