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
  const { scheduleMode, setScheduleMode, employeeVisits, unassignedVisits, clinicians } = useHealthcare();
  const [scheduleSubTab, setScheduleSubTab] = useState<'employee' | 'patient' | 'unassigned' | 'huv_sfv'>('employee');

  const totalWeeklyVisits = employeeVisits.length;
  const completedVisits = employeeVisits.filter(v => v.status === 'completed').length;
  const inProgressVisits = employeeVisits.filter(v => v.status === 'in_progress').length;
  const activeCliniciansCount = clinicians.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Navigation Segment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            Schedule Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Field clinician rosters, territory routes, and Electronic Visit Verification (EVV)
          </p>
        </div>

        {/* View Switchers: Calendar vs Map (Right-Aligned) + Subtab Switcher */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {/* Submodule Segmented Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold">
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
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                scheduleSubTab === 'unassigned'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Unassigned Visits</span>
              {unassignedVisits.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
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
            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Weekly Visits
                </div>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  {totalWeeklyVisits}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <CalendarDays size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  EVV Verified
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {completedVisits}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  In Progress Active
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {inProgressVisits}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Field Clinicians
                </div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {activeCliniciansCount}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>
          </>
        ) : scheduleSubTab === 'unassigned' ? (
          <>
            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Unassigned Visits
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {unassignedVisits.length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <AlertCircle size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Urgent / Priority
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {unassignedVisits.filter(v => v.priority === 'urgent' || v.priority === 'stat').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nursing Visits
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {unassignedVisits.filter(v => v.requiredCredentials?.includes('RN') || v.requiredCredentials?.includes('LVN')).length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <HeartPulse size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aide & Therapy
                </div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {unassignedVisits.filter(v => v.requiredCredentials?.includes('HHA') || v.requiredCredentials?.includes('PT')).length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Audit Tasks
                </div>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  12
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  HUV Encounters
                </div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  8
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  SFV Encounters
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  4
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <HeartPulse size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Due Within 3 Days
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  3
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock size={20} />
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
