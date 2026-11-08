import React from 'react';
import { UserCheck, ArrowUpRight, Plus, FileText } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const IntakePipelineCard: React.FC = () => {
  const { intakeMetrics, setActiveNavTab } = useHealthcare();

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            <UserCheck size={19} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Central Intake (Past 30 Days)</h3>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Referrals conversion & admission velocity</span>
          </div>
        </div>
        <button
          onClick={() => setActiveNavTab('intake')}
          className="text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 group"
        >
          <span>Intake Hub</span>
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Table / Metric Rows */}
      <div className="my-auto py-3.5 space-y-3.5">
        {intakeMetrics.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl theme-card-subtle transition-colors">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-black text-xs text-slate-950 dark:text-white">{item.service}</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {item.conversionRate} Admitted
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center justify-between theme-stat-tile px-3 py-2 rounded-lg">
                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">Inquiries:</span>
                <span className="font-black text-slate-950 dark:text-white text-sm">{item.inquiry}</span>
              </div>
              <div className="flex items-center justify-between theme-stat-tile px-3 py-2 rounded-lg">
                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">Referrals:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm">{item.referral}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3.5 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <FileText size={13} className="text-slate-500 dark:text-slate-400" />
          OASIS-E1 Intake Ready
        </span>
        <button
          onClick={() => setActiveNavTab('intake')}
          className="btn-primary text-xs py-1.5 px-3.5 font-bold"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>New Referral</span>
        </button>
      </div>
    </div>
  );
};
