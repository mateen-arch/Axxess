import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, XCircle, UserX, Clock } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const ScheduledVisitsPerformance: React.FC = () => {
  const { scheduledSummary, setActiveNavTab } = useHealthcare();

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
            <Calendar size={19} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Scheduled Visits (Past 30 Days)</h3>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Execution rate & clinical compliance</span>
          </div>
        </div>
        <span className="text-xs font-black text-slate-800 dark:text-slate-200 theme-card-subtle px-3 py-1 rounded-lg">
          {scheduledSummary.total} Total
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="my-auto py-3.5 space-y-3.5">
        {/* Home Health Row */}
        <div className="p-3.5 rounded-xl theme-card-subtle space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-slate-950 dark:text-white">Home Health Service Line</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">560 Visits Scheduled</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-lg theme-stat-tile-emerald">
              <div className="text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 size={12} className="stroke-[2.4]" />
                Completed
              </div>
              <div className="text-lg font-black">{scheduledSummary.completed}</div>
            </div>

            <div className="p-2.5 rounded-lg theme-stat-tile-rose">
              <div className="text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5">
                <XCircle size={12} className="stroke-[2.4]" />
                Missed
              </div>
              <div className="text-lg font-black">{scheduledSummary.missed}</div>
            </div>

            <div className="p-2.5 rounded-lg theme-stat-tile">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <UserX size={12} className="stroke-[2.4]" />
                Unassigned
              </div>
              <div className="text-lg font-black text-slate-950 dark:text-white">{scheduledSummary.unassigned}</div>
            </div>
          </div>
        </div>

        {/* Home Care Row */}
        <div className="p-3.5 rounded-xl theme-card-subtle space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-slate-950 dark:text-white">Home Care Service Line</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">11 Visits Scheduled</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-lg theme-stat-tile-blue">
              <div className="text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5">
                <Clock size={12} className="stroke-[2.4]" />
                In Progress
              </div>
              <div className="text-lg font-black">{scheduledSummary.inProgress}</div>
            </div>

            <div className="p-2.5 rounded-lg theme-stat-tile">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <XCircle size={12} className="stroke-[2.4]" />
                Missed
              </div>
              <div className="text-lg font-black text-slate-950 dark:text-white">0</div>
            </div>

            <div className="p-2.5 rounded-lg theme-stat-tile">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <UserX size={12} className="stroke-[2.4]" />
                Unassigned
              </div>
              <div className="text-lg font-black text-slate-950 dark:text-white">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* LUPA alert warning strip */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.5]" />
          <span className="text-xs font-medium">
            <strong className="font-black">23 Missed Visits Flagged:</strong> Requires supervisor reason code to prevent LUPA revenue reduction.
          </span>
        </div>
        <button
          onClick={() => setActiveNavTab('schedule')}
          className="text-amber-800 dark:text-amber-300 font-extrabold hover:underline shrink-0 text-xs ml-2 cursor-pointer"
        >
          Review
        </button>
      </div>
    </div>
  );
};
