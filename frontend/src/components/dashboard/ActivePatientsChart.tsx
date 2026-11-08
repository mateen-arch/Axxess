import React, { useState } from 'react';
import { Users, ArrowRight, Activity } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const ActivePatientsChart: React.FC = () => {
  const { census, setActiveNavTab, setServiceFilter } = useHealthcare();
  const [hoveredSlice, setHoveredSlice] = useState<'health' | 'care' | null>(null);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const healthRatio = census.homeHealth / census.total;
  const careRatio = census.homeCare / census.total;

  const healthStrokeDash = `${healthRatio * circumference} ${circumference}`;
  const careStrokeDash = `${careRatio * circumference} ${circumference}`;
  const careOffset = -(healthRatio * circumference);

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            <Users size={19} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Active Patients Census</h3>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Real-time service distribution</span>
          </div>
        </div>
        <button
          onClick={() => setActiveNavTab('patients')}
          className="text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 group"
        >
          <span>Directory</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Main Visual: Modern Donut Chart + Legend */}
      <div className="py-5 flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width="175" height="175" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              strokeWidth="20"
              className="stroke-pearl-200 dark:stroke-charcoal-700 transition-colors"
            />
            {/* Home Health Slice (Crimson Red) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="url(#healthGradient)"
              strokeWidth={hoveredSlice === 'health' ? '24' : '20'}
              strokeDasharray={healthStrokeDash}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('health')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => {
                setServiceFilter('home_health');
                setActiveNavTab('patients');
              }}
            />
            {/* Home Care Slice (Slate Navy / Indigo) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="url(#careGradient)"
              strokeWidth={hoveredSlice === 'care' ? '24' : '20'}
              strokeDasharray={careStrokeDash}
              strokeDashoffset={careOffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('care')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => {
                setServiceFilter('home_care');
                setActiveNavTab('patients');
              }}
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <linearGradient id="careGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Donut Metrics - High Contrast Bold */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tight font-heading">
              {census.total}
            </span>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Total Active
            </span>
          </div>
        </div>

        {/* Legend & Breakdown stats */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {/* Home Health Item */}
          <div
            onMouseEnter={() => setHoveredSlice('health')}
            onMouseLeave={() => setHoveredSlice(null)}
            onClick={() => {
              setServiceFilter('home_health');
              setActiveNavTab('patients');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              hoveredSlice === 'health'
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 shadow-sm'
                : 'bg-pearl-50 dark:bg-charcoal-800 border-pearl-200 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-750'
            }`}
          >
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 shrink-0"></span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">Home Health</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-rose-700 dark:text-rose-400">{census.homeHealth}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">({census.percentageHealth}%)</span>
              </div>
            </div>
            <div className="w-full bg-pearl-200 dark:bg-charcoal-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${census.percentageHealth}%` }}></div>
            </div>
          </div>

          {/* Home Care Item */}
          <div
            onMouseEnter={() => setHoveredSlice('care')}
            onMouseLeave={() => setHoveredSlice(null)}
            onClick={() => {
              setServiceFilter('home_care');
              setActiveNavTab('patients');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              hoveredSlice === 'care'
                ? 'bg-pearl-100 dark:bg-charcoal-700 border-pearl-300 dark:border-charcoal-600 shadow-sm'
                : 'bg-pearl-50 dark:bg-charcoal-800 border-pearl-200 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-750'
            }`}
          >
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-700 dark:bg-slate-300 shrink-0"></span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">Home Care</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-slate-900 dark:text-white">{census.homeCare}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">({census.percentageCare}%)</span>
              </div>
            </div>
            <div className="w-full bg-pearl-200 dark:bg-charcoal-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-slate-700 dark:bg-slate-300 h-1.5 rounded-full" style={{ width: `${census.percentageCare}%` }}></div>
            </div>
          </div>

          {/* Hospice Item */}
          <div className="p-2.5 rounded-xl bg-pearl-100/50 dark:bg-charcoal-800/50 border border-dashed border-pearl-300 dark:border-charcoal-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Hospice</span>
            <span className="font-bold">0 (Inactive)</span>
          </div>
        </div>
      </div>

      {/* Footer Insight */}
      <div className="pt-3.5 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
        <span className="flex items-center gap-1.5">
          <Activity size={14} className="text-rose-600 dark:text-rose-400 stroke-[2.5]" />
          Census growth: +4.2% this quarter
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Updated 5m ago</span>
      </div>
    </div>
  );
};
