import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  HeartPulse,
  Sparkles,
  Users,
  FileText
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EmployeeCalendarView } from './EmployeeCalendarView';
import { ScheduleMapView } from './ScheduleMapView';
import { PatientCalendarView } from './PatientCalendarView';
import { PatientMapView } from './PatientMapView';
import { UnassignedVisitsView } from './UnassignedVisitsView';
import { HuvSfvStatusReportView } from './HuvSfvStatusReportView';

export const ScheduleView: React.FC = () => {
  const { scheduleMode, setScheduleMode, employeeVisits, unassignedVisits, clinicians, huvSfvRecords, scheduleStats } = useHealthcare();
  const [scheduleSubTab, setScheduleSubTab] = useState<'employee' | 'patient' | 'unassigned' | 'huv_sfv'>('employee');

  const totalWeeklyVisits = scheduleStats?.totalWeeklyVisits ?? employeeVisits.length;
  const completedVisits = scheduleStats?.completedVisits ?? employeeVisits.filter(v => v.status === 'completed' || v.evvStatus === 'verified').length;
  const inProgressVisits = scheduleStats?.inProgressVisits ?? employeeVisits.filter(v => v.status === 'in_progress').length;
  const activeCliniciansCount = scheduleStats?.activeCliniciansCount ?? clinicians.filter(c => c.status === 'active').length;

  const totalAuditTasks = scheduleStats?.huvSfvReport?.totalAuditTasks ?? huvSfvRecords.length;
  const huvEncounters = scheduleStats?.huvSfvReport?.huvEncounters ?? huvSfvRecords.filter(r => r.type === 'HUV').length;
  const sfvEncounters = scheduleStats?.huvSfvReport?.sfvEncounters ?? huvSfvRecords.filter(r => r.type === 'SFV').length;
  const dueWithin3Days = scheduleStats?.huvSfvReport?.dueWithin3Days ?? huvSfvRecords.filter(r => r.daysRemaining <= 3).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Navigation Segment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="text-rose-600 dark:text-rose-400 shrink-0" size={24} />
            <span>Schedule Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Field clinician rosters, territory routes, and Electronic Visit Verification (EVV)
          </p>
        </div>

        {/* View Switchers: Calendar vs Map (Right-Aligned) + Subtab Switcher */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {/* Submodule Segmented Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold overflow-x-auto no-scrollbar max-w-full flex-nowrap">
            <button
              type="button"
              onClick={() => setScheduleSubTab('employee')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                scheduleSubTab === 'employee'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Employee Calendar
            </button>
            <button
              type="button"
              onClick={() => setScheduleSubTab('patient')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                scheduleSubTab === 'patient'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Patient Calendar
            </button>
            <button
              type="button"
              onClick={() => setScheduleSubTab('unassigned')}
              className={`relative px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                scheduleSubTab === 'unassigned'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Unassigned Visits</span>
              {unassignedVisits.length > 0 && (
                <span className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white dark:ring-charcoal-800 shadow-xs font-mono">
                  {unassignedVisits.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setScheduleSubTab('huv_sfv')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                scheduleSubTab === 'huv_sfv'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              HUV and SFV Report
            </button>
          </div>

          {/* Calendar vs Map Toggle Pill (Right-Aligned on Calendar Pages) */}
          {(scheduleSubTab === 'employee' || scheduleSubTab === 'patient') && (
            <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold self-end shadow-2xs">
              <button
                type="button"
                onClick={() => setScheduleMode('calendar')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  scheduleMode === 'calendar'
                    ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Calendar size={13} />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('map')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  scheduleMode === 'map'
                    ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <MapPin size={13} />
                <span>Map</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Modern Metric Glance Cards (Contextually aligned for consistency across all subtabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {scheduleSubTab === 'employee' || scheduleSubTab === 'patient' ? (
          <>
            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Weekly Visits
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <CalendarDays size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                    {totalWeeklyVisits}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Scheduled
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                  Current Week
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Master roster
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    EVV Verified
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {completedVisits}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                    Completed
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Verified
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  GPS & Timestamp
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    In Progress
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Clock size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                    {inProgressVisits}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700/80 dark:text-blue-300/80">
                    Active Now
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  Live
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Field clinicians
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Clinicians
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Users size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                    {activeCliniciansCount}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Active Staff
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                  Territories
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  All disciplines
                </span>
              </div>
            </div>
          </>
        ) : scheduleSubTab === 'unassigned' ? (
          <>
            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Unassigned Visits
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertCircle size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                    {unassignedVisits.length}
                  </span>
                  <span className="text-[11px] font-bold text-rose-700/80 dark:text-rose-300/80">
                    Needs Dispatch
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                  Next 7 Days
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Pending match
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Urgent Priority
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                    {unassignedVisits.filter(v => v.priority === 'urgent' || v.priority === 'stat').length}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80">
                    Stat / Urgent
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                  Priority 1
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Immediate dispatch
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Nursing Visits
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <HeartPulse size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                    {unassignedVisits.filter(v => v.requiredCredentials?.includes('RN') || v.requiredCredentials?.includes('LVN')).length}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    RN / LVN
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  Skilled Nursing
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Clinical care
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Aide & Therapy
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Users size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                    {unassignedVisits.filter(v => v.requiredCredentials?.includes('HHA') || v.requiredCredentials?.includes('PT')).length}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    HHA / PT
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                  Rehab & Aide
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Personal care
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Total Audit Tasks
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                    {totalAuditTasks}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Audit Tasks
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                  Compliance
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  HUV / SFV records
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    HUV Encounters
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                    {huvEncounters}
                  </span>
                  <span className="text-[11px] font-bold text-purple-700/80 dark:text-purple-300/80">
                    Home Unplanned
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                  HUV
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Encounter audits
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    SFV Encounters
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <HeartPulse size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                    {sfvEncounters}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700/80 dark:text-blue-300/80">
                    Facility Visits
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  SFV
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Post-acute follow-up
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                    Due Within 3 Days
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock size={15} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                    {dueWithin3Days}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80">
                    Expiring Soon
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                  72 Hours
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Needs submission
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dynamic View: Employee Calendar/Map vs Patient Calendar/Map vs Unassigned vs HUV/SFV */}
      {scheduleSubTab === 'employee' ? (
        scheduleMode === 'calendar' ? <EmployeeCalendarView /> : <ScheduleMapView />
      ) : scheduleSubTab === 'patient' ? (
        scheduleMode === 'calendar' ? <PatientCalendarView /> : <PatientMapView />
      ) : scheduleSubTab === 'unassigned' ? (
        <UnassignedVisitsView />
      ) : (
        <HuvSfvStatusReportView />
      )}
    </div>
  );
};
