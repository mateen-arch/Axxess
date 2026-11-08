import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Phone,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Home,
  CheckSquare,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EmployeeClinician, EmployeeVisit, ServiceLine } from '../../types';
import { VisitDetailModal } from './VisitDetailModal';
import { ScheduleNewVisitModal } from './ScheduleNewVisitModal';
import { SearchableMultiSelect } from '../common/SearchableMultiSelect';

export const EmployeeCalendarView: React.FC = () => {
  const { clinicians, employeeVisits } = useHealthcare();

  // Navigation State
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(2); // 2 = Tuesday Nov 3 (Today)

  // Filter States matching Axxess reference
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(['org-hh', 'org-hc']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['branch-1', 'branch-2']);
  
  const allCredentials = useMemo(() => [
    'RN', 'LVN', 'LPN', 'MD', 'PA', 'DO', 'NP', 'HHA', 'MSW', 'PT', 'OT', 'ST',
    'PTA', 'OTA', 'STA', 'LMSW', 'PCW', 'HMK', 'Other', 'EMT', 'EMTP',
    'Home Care Aide', 'RD/LD', 'LCSW', 'MDiv', 'BCC', 'LCPC', 'LPC', 'LMHC',
    'LPCC', 'MT-BC', 'SLP', 'SLPA', 'COTA', 'CNA', 'LMT', 'PharmD'
  ], []);

  const allTitles = useMemo(() => [
    'CEO', 'COO', 'CFO', 'Administrator', 'Alternate Administrator', 'Director of Nursing',
    'Alternate Director of Nursing', 'Hospice Medical Director', 'Hospice Physician',
    'Attending Physician', 'Clinical Manager', 'Clinical Liaison/Marketer', 'Registered Nurse',
    'Case Manager', 'LVN/LPN', 'Social Worker', 'Spiritual Counselor', 'Bereavement Coordinator',
    'Certified Nurse Aide', 'Volunteer Coordinator', 'Volunteer', 'Intake Coordinator',
    'Physical Therapist', 'Physical Therapist Assistant', 'Occupational Therapist',
    'Occupational Therapist Assistant', 'Speech Therapist', 'Speech Therapist Assistant',
    'QA Nurse', 'Office Manager', 'Administrative', 'Scheduler', 'Disaster Coordinator',
    'Nurse Practitioner', 'Physician Assistant', 'Biller', 'Administrative Assistant',
    'HR', 'Pharmacist', 'Palliative Care Nurse Practitioner', 'Palliative Care Physician',
    'Palliative Care Coordinator', 'Central Intake', 'Home Health Aide/Nurse Aide', 'Home Care Aide', 'Hospice Aide'
  ], []);

  const [selectedCredentials, setSelectedCredentials] = useState<string[]>(allCredentials);
  const [selectedUserTitles, setSelectedUserTitles] = useState<string[]>(allTitles);
  const [selectedScheduleType, setSelectedScheduleType] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Options for SearchableMultiSelect
  const orgOptions = useMemo(() => [
    { id: 'org-hh', label: 'Standards Home Care', category: 'Home Health' },
    { id: 'org-hc', label: 'Standards Home Care', category: 'Home Care' }
  ], []);

  const branchOptions = useMemo(() => [
    { id: 'branch-1', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Health', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { id: 'branch-2', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Care', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }
  ], []);

  // Modal & Toast States
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [newVisitClinicianId, setNewVisitClinicianId] = useState<string>('');
  const [newVisitDay, setNewVisitDay] = useState<number>(2);
  const [newVisitDate, setNewVisitDate] = useState<string>('2026-11-03');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Base Sunday: Nov 1, 2026
  const baseSunday = useMemo(() => new Date(2026, 10, 1), []);

  // Compute dynamic 7 days for the active weekOffset
  const currentWeekDays = useMemo(() => {
    const currentSunday = new Date(baseSunday);
    currentSunday.setDate(baseSunday.getDate() + weekOffset * 7);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return dayNames.map((name, i) => {
      const d = new Date(currentSunday);
      d.setDate(currentSunday.getDate() + i);
      const dateNumber = String(d.getDate());
      const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const fullDate = d.toISOString().slice(0, 10);
      const isToday = weekOffset === 0 && i === 2; // Tue Nov 3

      return {
        dayName: name,
        dateNumber,
        dateStr,
        fullDate,
        dayIndex: i,
        isToday
      };
    });
  }, [baseSunday, weekOffset]);

  const weekRangeLabel = useMemo(() => {
    const first = currentWeekDays[0];
    const last = currentWeekDays[6];
    return `${first.dateStr}, ${first.fullDate.slice(0, 4)} – ${last.dateStr}, ${last.fullDate.slice(0, 4)}`;
  }, [currentWeekDays]);

  // Robust Search & Filter Logic matching Axxess filters
  const filteredClinicians = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return clinicians.filter(c => {
      const clinicianVisits = employeeVisits.filter(v => v.employeeId === c.id);

      // Search matches: clinician name, credentials, title, or assigned patient name, or visit type
      const matchesSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.credentials.toLowerCase().includes(term) ||
        clinicianVisits.some(v =>
          v.patientName.toLowerCase().includes(term) ||
          v.visitType.toLowerCase().includes(term) ||
          (v.address && v.address.toLowerCase().includes(term))
        );

      // Credential multi-select filter
      const matchesCred = selectedCredentials.length === 0 || selectedCredentials.includes(c.credentials);

      // User Title multi-select filter
      const matchesTitle = selectedUserTitles.length === 0 || selectedUserTitles.includes(c.title);

      // Schedule filter (all vs assigned vs unassigned)
      const hasVisits = clinicianVisits.length > 0;
      const matchesSchedule = selectedScheduleType === 'all' ||
        (selectedScheduleType === 'assigned' && hasVisits) ||
        (selectedScheduleType === 'unassigned' && !hasVisits);

      return matchesSearch && matchesCred && matchesTitle && matchesSchedule;
    });
  }, [clinicians, employeeVisits, searchTerm, selectedCredentials, selectedUserTitles, selectedScheduleType]);

  const hasActiveFilters = searchTerm !== '' ||
    selectedCredentials.length < allCredentials.length ||
    selectedUserTitles.length < allTitles.length ||
    selectedScheduleType !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrgs(['org-hh', 'org-hc']);
    setSelectedBranches(['branch-1', 'branch-2']);
    setSelectedCredentials(allCredentials);
    setSelectedUserTitles(allTitles);
    setSelectedScheduleType('all');
  };

  const formatServiceLine = (s: string) => {
    if (s === 'home_health') return 'Home Health';
    if (s === 'home_care') return 'Home Care';
    if (s === 'hospice') return 'Hospice';
    return s;
  };

  const formatPatientName = (name: string) => {
    if (!name.includes(',')) return name;
    const parts = name.split(',').map(s => s.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
    return name;
  };

  const cleanVisitType = (type: string) => {
    return type.replace(/^RN\s*-\s*/, '').replace(/^HHA\s*-\s*/, '');
  };

  const handleCellClickAdd = (clinicianId: string, dayIdx: number, fullDate?: string) => {
    setNewVisitClinicianId(clinicianId);
    setNewVisitDay(dayIdx);
    if (fullDate) setNewVisitDate(fullDate);
    setIsNewVisitOpen(true);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-white/10 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Structured Modern Control Center */}
      <div className="relative z-30 p-4 rounded-3xl glass-panel border border-pearl-200 dark:border-charcoal-700 space-y-3.5 shadow-xs">
        
        {/* Tier 1: Week Navigation & Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Date Navigation Cluster (Never Breaks onto Odd Lines) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Week Range Scroller */}
            <div className="flex items-center gap-1 bg-white dark:bg-charcoal-800 px-2 py-1.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2 text-xs font-black text-slate-900 dark:text-white font-mono flex items-center gap-1.5 whitespace-nowrap">
                <CalendarIcon size={14} className="text-rose-600 dark:text-rose-400" />
                <span>{weekRangeLabel}</span>
              </div>

              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Today Button */}
            <button
              type="button"
              onClick={() => {
                setWeekOffset(0);
                setActiveDayIndex(2);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                weekOffset === 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shadow-2xs'
                  : 'bg-white dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 border-pearl-200 dark:border-charcoal-700 hover:bg-pearl-50 dark:hover:bg-charcoal-750'
              }`}
            >
              Today
            </button>

            {/* Weekly / Daily Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'daily'
                    ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          {/* Right Header: Search + Reset Filters + Schedule Visit CTA */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {/* Clean Live Search Input */}
            <div className="relative w-56 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search clinician name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-7 rounded-xl bg-white dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-extrabold transition-colors flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setNewVisitClinicianId(clinicians[0]?.id || 'emp-01');
                setNewVisitDay(2);
                setIsNewVisitOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Search & Filter Controls matching Axxess reference */}
        <div className="pt-3 border-t border-pearl-200/80 dark:border-charcoal-700/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-end">
            {/* Organization */}
            <SearchableMultiSelect
              label="Organization"
              placeholder="Organizations: All"
              searchPlaceholder="Search for Organizations"
              options={orgOptions}
              selectedValues={selectedOrgs}
              onChange={setSelectedOrgs}
              allLabel="Organizations: All"
            />

            {/* Branches */}
            <SearchableMultiSelect
              label="Branches"
              placeholder="Branches: All"
              searchPlaceholder="Search for Branches"
              options={branchOptions}
              selectedValues={selectedBranches}
              onChange={setSelectedBranches}
              allLabel="Branches: All"
            />

            {/* Credentials */}
            <SearchableMultiSelect
              label="Credentials"
              placeholder="All Selected"
              searchPlaceholder="Search for User Credentials"
              headerTitle="User Credentials"
              options={allCredentials}
              selectedValues={selectedCredentials}
              onChange={setSelectedCredentials}
              allLabel="All Selected"
            />

            {/* User Titles */}
            <SearchableMultiSelect
              label="User Titles"
              placeholder="All Selected"
              searchPlaceholder="Search for User Titles"
              headerTitle="User Titles"
              options={allTitles}
              selectedValues={selectedUserTitles}
              onChange={setSelectedUserTitles}
              allLabel="All Selected"
            />

            {/* Schedule Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Schedule
              </label>
              <select
                value={selectedScheduleType}
                onChange={e => setSelectedScheduleType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Schedule Types</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Schedule Matrix Grid (Wide min-w-[1360px] to guarantee 160px per day column) */}
      <div className="relative z-10 rounded-3xl glass-panel border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1360px] table-fixed">
            {/* Header Columns */}
            <thead>
              <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/90 dark:bg-charcoal-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                {/* Clinician Column */}
                <th className="py-3.5 px-4 w-[240px] shrink-0 border-r border-pearl-200/80 dark:border-charcoal-700 bg-pearl-100/50 dark:bg-charcoal-850">
                  Clinician / Staff
                </th>

                {/* 7 Day Columns */}
                {currentWeekDays.map(day => (
                  <th
                    key={day.dayIndex}
                    className={`py-3.5 px-3 w-[160px] text-center transition-colors border-r last:border-r-0 border-pearl-200/80 dark:border-charcoal-700 ${
                      day.isToday
                        ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] tracking-widest">{day.dayName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black font-mono">{day.dateStr}</span>
                        {day.isToday && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black tracking-normal leading-none">
                            TODAY
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Body Rows */}
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {filteredClinicians.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">No clinicians matched your filter</div>
                      <div className="text-xs text-slate-400">Try clearing your search terms or service filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClinicians.map(clinician => {
                  const clinicianVisits = employeeVisits.filter(v => v.employeeId === clinician.id);
                  const weekVisits = clinicianVisits.filter(v => currentWeekDays.some(d => d.fullDate === v.date));
                  const primaryService = clinician.serviceLines[0] || 'home_health';

                  return (
                    <tr
                      key={clinician.id}
                      className="hover:bg-pearl-50/40 dark:hover:bg-charcoal-800/30 transition-colors"
                    >
                      {/* Left Sticky Clinician Profile Column */}
                      <td className="py-3.5 px-4 w-[240px] shrink-0 border-r border-pearl-200/80 dark:border-charcoal-700 bg-white/70 dark:bg-charcoal-850/80 align-top">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                              clinician.credentials === 'RN'
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : clinician.credentials === 'OT' || clinician.credentials === 'PT'
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}>
                              {clinician.credentials}
                            </div>

                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-slate-950 dark:text-white truncate">
                                {clinician.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {clinician.title}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                              primaryService === 'home_care'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {formatServiceLine(primaryService)}
                            </span>

                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              {weekVisits.length} visits this week
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Phone size={10} className="text-slate-400" />
                            <span>{clinician.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* 7 Day Slots */}
                      {currentWeekDays.map(day => {
                        // Strictly filter visits by their exact date
                        const dayVisits = clinicianVisits.filter(v => v.date === day.fullDate);

                        return (
                          <td
                            key={day.dayIndex}
                            className={`py-2 px-2 w-[160px] align-top border-r last:border-r-0 border-pearl-200/80 dark:border-charcoal-700 relative group/cell transition-colors ${
                              day.isToday ? 'bg-rose-500/5 dark:bg-rose-950/20' : ''
                            }`}
                          >
                            <div className="min-h-[105px] space-y-2 flex flex-col justify-start">
                              {dayVisits.map(visit => {
                                const isCompleted = visit.status === 'completed';
                                const isInProgress = visit.status === 'in_progress';
                                const isMissed = visit.status === 'missed';

                                return (
                                  <div
                                    key={visit.id}
                                    onClick={() => {
                                      setSelectedVisit(visit);
                                      setIsDetailOpen(true);
                                    }}
                                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer group/visit hover:shadow-md hover:-translate-y-0.5 ${
                                      isCompleted
                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
                                        : isInProgress
                                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 hover:border-blue-400 ring-1 ring-blue-500/20'
                                        : isMissed
                                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-400'
                                        : 'bg-white dark:bg-charcoal-800 border-pearl-200 dark:border-charcoal-700 hover:border-rose-300 dark:hover:border-rose-700'
                                    }`}
                                  >
                                    {/* Top Row: Time + Status Pill */}
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                        {visit.timeSlot}
                                      </span>
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                                        isCompleted
                                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                          : isInProgress
                                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                          : isMissed
                                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          isCompleted
                                            ? 'bg-emerald-500'
                                            : isInProgress
                                            ? 'bg-blue-500 animate-pulse'
                                            : isMissed
                                            ? 'bg-rose-500'
                                            : 'bg-indigo-400'
                                        }`} />
                                        <span>{isCompleted ? 'EVV' : isInProgress ? 'Active' : isMissed ? 'Missed' : 'Due'}</span>
                                      </span>
                                    </div>

                                    {/* Line 2: Patient Name */}
                                    <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover/visit:text-rose-600 dark:group-hover/visit:text-rose-400 transition-colors">
                                      {formatPatientName(visit.patientName)}
                                    </div>

                                    {/* Line 3: Clean Visit Type */}
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium mt-0.5">
                                      {cleanVisitType(visit.visitType)}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Quick Add Button on Hover */}
                              <button
                                type="button"
                                onClick={() => handleCellClickAdd(clinician.id, day.dayIndex, day.fullDate)}
                                className="w-full py-1.5 rounded-xl border border-dashed border-pearl-300 dark:border-charcoal-700 text-slate-400 hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-[10px] font-bold opacity-0 group-hover/cell:opacity-100 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} />
                                <span>Add Visit</span>
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Legend */}
        <div className="p-3 bg-pearl-50/90 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">Visit Status:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed (EVV Verified)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>In Progress (Checked-In)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Scheduled / Due</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Missed</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Automated Recurrence Engine: Plan of Care Frequencies Synced
          </div>
        </div>
      </div>

      {/* Modals */}
      <VisitDetailModal
        visit={selectedVisit}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedVisit(null);
        }}
        onSuccess={showToast}
      />

      <ScheduleNewVisitModal
        isOpen={isNewVisitOpen}
        onClose={() => setIsNewVisitOpen(false)}
        defaultClinicianId={newVisitClinicianId}
        defaultDay={newVisitDay}
        defaultDate={newVisitDate}
        onSuccess={showToast}
      />
    </div>
  );
};
