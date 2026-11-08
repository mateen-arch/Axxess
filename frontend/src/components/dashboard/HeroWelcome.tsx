import React from 'react';
import { Sparkles, Activity, ShieldCheck, ArrowUpRight, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const HeroWelcome: React.FC = () => {
  const { organization, census, scheduledSummary, unreadCount, setActiveNavTab } = useHealthcare();

  return (
    <div className="glass-panel p-6 md:p-8 mb-6 relative overflow-hidden transition-colors">
      {/* Decorative Brand Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top: Header, Greeting & Organization Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-pearl-200 dark:border-charcoal-700">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
              <span className="pulse-indicator red"></span>
              <span>Axxess Healthcare Cloud</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{organization.name}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
              Clinical Operations Dashboard
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-semibold leading-relaxed">
              Welcome back, Alexandria. You have <strong className="text-rose-700 dark:text-rose-400 font-extrabold">{census.total} active patients</strong> under active care with zero unassigned visits for the next 7 days.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 self-start md:self-center px-3.5 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
            <span>CMS OASIS-E1 Compliant</span>
          </div>
        </div>

        {/* Bottom: 4 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Patients */}
          <div
            onClick={() => setActiveNavTab('patients')}
            className="hero-kpi-card group p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[145px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Active Patients
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800 group-hover:scale-110 transition-transform">
                <Activity size={18} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="my-2">
              <div className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                {census.total}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              <TrendingUp size={14} className="shrink-0 stroke-[2.5]" />
              <span>75 Health • 12 Care</span>
            </div>
          </div>

          {/* Card 2: Unassigned (7d) */}
          <div
            onClick={() => setActiveNavTab('schedule')}
            className="hero-kpi-card group p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[145px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Unassigned (7 Days)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                <ShieldCheck size={18} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="my-2">
              <div className="text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                {scheduledSummary.unassigned}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={14} className="shrink-0 stroke-[2.5]" />
              <span>100% Dispatched</span>
            </div>
          </div>

          {/* Card 3: 30d Completed */}
          <div
            onClick={() => setActiveNavTab('schedule')}
            className="hero-kpi-card group p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[145px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                30d Completed
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800 group-hover:scale-110 transition-transform">
                <ArrowUpRight size={18} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="my-2">
              <div className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                {scheduledSummary.completed}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Visits logged & verified</span>
            </div>
          </div>

          {/* Card 4: Unread Alerts */}
          <div
            onClick={() => setActiveNavTab('messages')}
            className="hero-kpi-card group p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[145px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Unread Alerts
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800 group-hover:scale-110 transition-transform">
                <Sparkles size={18} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="my-2">
              <div className="text-3xl md:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {unreadCount}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400">
              <AlertCircle size={14} className="shrink-0 stroke-[2.5]" />
              <span>Requires review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
