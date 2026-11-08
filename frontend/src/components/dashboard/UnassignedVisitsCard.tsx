import React from 'react';
import { CalendarCheck, CheckCircle2, ChevronRight, UserPlus } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const UnassignedVisitsCard: React.FC = () => {
  const { setActiveNavTab } = useHealthcare();

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <CalendarCheck size={19} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Unassigned Visits (Next 7 Days)</h3>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ordered visit frequency dispatch monitor</span>
          </div>
        </div>
        <span className="badge badge-green text-xs font-bold">
          <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
          100% Assigned
        </span>
      </div>

      {/* Main Content */}
      <div className="my-auto py-5 flex flex-col items-center justify-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 size={34} className="stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-charcoal-900">
            0
          </span>
        </div>

        <h4 className="font-black text-slate-950 dark:text-white text-lg tracking-tight">
          Zero Unassigned Visits
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-xs mt-1.5 leading-relaxed">
          All ordered clinician visit frequencies for Home Health and Home Care patients are actively matched with certified field staff.
        </p>

        {/* Breakdown by Service */}
        <div className="grid grid-cols-2 gap-3.5 w-full mt-4 max-w-sm">
          <div className="p-3.5 rounded-xl theme-card-subtle text-left flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Home Health</div>
              <div className="font-black text-slate-950 dark:text-white text-base tracking-tight whitespace-nowrap mt-0.5">
                0 Unassigned
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 w-full py-1 px-2 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>All Clear</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl theme-card-subtle text-left flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Home Care</div>
              <div className="font-black text-slate-950 dark:text-white text-base tracking-tight whitespace-nowrap mt-0.5">
                0 Unassigned
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 w-full py-1 px-2 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>All Clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3.5 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
        <button
          onClick={() => setActiveNavTab('schedule')}
          className="text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 group"
        >
          <span>Open Schedule Center</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => setActiveNavTab('schedule')}
          className="theme-btn-control text-xs py-1.5 px-3.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus size={13} className="stroke-[2.5]" />
          <span>Dispatch Clinician</span>
        </button>
      </div>
    </div>
  );
};
