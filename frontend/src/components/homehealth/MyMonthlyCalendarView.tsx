import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Printer,
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  Plus,
  Layers,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';
import { AddCalendarActivityModal } from './AddCalendarActivityModal';

interface MyMonthlyCalendarViewProps {
  onBack: () => void;
}

export interface CalendarItem {
  id: string;
  patientName: string;
  mrn: string;
  task: string;
  date: string; // YYYY-MM-DD or MM/DD/YYYY
  time: string;
  status: 'Scheduled' | 'Completed' | 'Pending Signature' | 'Missed';
  isNonVisit?: boolean;
  address?: string;
}

export const MyMonthlyCalendarView: React.FC<MyMonthlyCalendarViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  // Current calendar view state
  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // 10 = November
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Data states
  const [visits, setVisits] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Add activity modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Dynamic month days and weekday offset calculations
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay();
  }, [currentYear, currentMonthIndex]);

  // Total grid cells (e.g. 35 or 42 depending on month layout)
  const totalGridSlots = useMemo(() => {
    const total = startDayOfWeek + daysInMonth;
    return Math.ceil(total / 7) * 7;
  }, [startDayOfWeek, daysInMonth]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch real visits and non-visit activities from PostgreSQL
  const fetchCalendarData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [scheduleVisits, nonVisitActs] = await Promise.all([
        api.getScheduleVisits().catch(() => []),
        api.getNonVisitActivities().catch(() => []),
      ]);

      const mappedVisits: CalendarItem[] = (scheduleVisits || []).map((v: any) => ({
        id: v.id,
        patientName: v.patientName || 'Patient',
        mrn: v.patientMrn || 'N/A',
        task: v.visitType || v.task || 'Skilled Nurse Visit',
        date: v.date, // format YYYY-MM-DD
        time: v.timeSlot || '09:00 AM',
        status:
          v.status?.toLowerCase() === 'completed' || v.status?.toLowerCase() === 'verified'
            ? 'Completed'
            : v.status?.toLowerCase() === 'missed'
            ? 'Missed'
            : 'Scheduled',
        address: v.address,
      }));

      const mappedActivities: CalendarItem[] = (nonVisitActs || []).map((a: any) => ({
        id: a.id,
        patientName: `[Non-Visit] ${a.activityType}`,
        mrn: 'Admin',
        task: a.comments ? `${a.activityType}: ${a.comments}` : a.activityType,
        date: a.activityDate, // format MM/DD/YYYY
        time: a.startTime ? `${a.startTime} - ${a.endTime}` : `${a.durationMinutes || 30} min`,
        status: 'Completed',
        isNonVisit: true,
      }));

      const allItems = [...mappedVisits, ...mappedActivities];
      setVisits(allItems);

      if (isManualRefresh) {
        showToast('Calendar updated with live records from database.');
      }
    } catch (err: any) {
      console.error('Error fetching calendar data:', err);
      showToast('Failed to load calendar records: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Filter items specifically for the active month and year
  const currentMonthItems = useMemo(() => {
    return visits.filter((item) => {
      if (!item.date) return false;
      const parts = item.date.split(/[-/]/);
      let y = 0, m = 0;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1; // 0-indexed
      } else {
        // MM/DD/YYYY
        m = parseInt(parts[0], 10) - 1;
        y = parseInt(parts[2], 10);
      }
      return y === currentYear && m === currentMonthIndex;
    });
  }, [visits, currentYear, currentMonthIndex]);

  // Default selectedDay to first day with visits, or 1
  useEffect(() => {
    if (currentMonthItems.length > 0) {
      const firstItem = currentMonthItems[0];
      const parts = firstItem.date.split(/[-/]/);
      const d = parts[0].length === 4 ? parseInt(parts[2], 10) : parseInt(parts[1], 10);
      setSelectedDay(d);
    } else {
      setSelectedDay(1);
    }
  }, [currentMonthIndex, currentYear, currentMonthItems]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleRefresh = () => {
    fetchCalendarData(true);
  };

  // Get visits for a specific day number
  const getDayItems = (dayNum: number) => {
    return currentMonthItems.filter((item) => {
      const parts = item.date.split(/[-/]/);
      const d = parts[0].length === 4 ? parseInt(parts[2], 10) : parseInt(parts[1], 10);
      return d === dayNum;
    });
  };

  // Visits for the currently selected day
  const visitsForSelectedDay = selectedDay ? getDayItems(selectedDay) : [];

  // Formatted selected date string (YYYY-MM-DD) for modal prefill
  const selectedDateFormatted = useMemo(() => {
    const d = selectedDay || 1;
    const m = (currentMonthIndex + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    return `${currentYear}-${m}-${dayStr}`;
  }, [currentYear, currentMonthIndex, selectedDay]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                CareOrbit Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Home
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                My Monthly Calendar
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Hilder Magessa RN • Monthly Care Schedule
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Add Activity / Visit Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 transition cursor-pointer"
            title="Add Activity or Visit to Calendar"
          >
            <Plus size={14} />
            <span>Add Activity / Visit</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refresh Calendar"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-rose-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
            title="Print Calendar"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Main Calendar Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Month Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/90 bg-white/95 p-4 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Previous Month</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {months[currentMonthIndex]} {currentYear}
            </h2>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Hilder Magessa RN • {currentMonthItems.length} Activity/Visit{currentMonthItems.length === 1 ? '' : 's'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
          >
            <span>Next Month</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-pearl-200 bg-pearl-50 text-center text-xs font-black uppercase tracking-wider text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} className="py-2.5 sm:py-3 border-r last:border-r-0 border-pearl-200 dark:border-charcoal-700">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw size={24} className="animate-spin text-rose-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Loading calendar records from database...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-pearl-100 dark:divide-charcoal-750">
              {Array.from({ length: totalGridSlots }).map((_, idx) => {
                const dayNum = idx - startDayOfWeek + 1;
                const isCurrentMonthDay = dayNum >= 1 && dayNum <= daysInMonth;
                const dayVisits = isCurrentMonthDay ? getDayItems(dayNum) : [];
                const isSelected = selectedDay === dayNum;
                const hasMultiple = dayVisits.length > 1;

                return (
                  <div
                    key={idx}
                    onClick={() => isCurrentMonthDay && setSelectedDay(dayNum)}
                    className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 transition cursor-pointer ${
                      !isCurrentMonthDay
                        ? 'bg-pearl-50/40 dark:bg-charcoal-900/40 text-slate-300 dark:text-charcoal-600 select-none'
                        : isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 ring-2 ring-inset ring-rose-500'
                        : 'hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/50'
                    }`}
                  >
                    {isCurrentMonthDay && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-rose-600 dark:text-rose-400 font-black'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {dayNum}
                          </span>

                          {dayVisits.length > 0 && (
                            <div className="flex items-center gap-1">
                              {hasMultiple ? (
                                <span className="h-2 w-2 rounded-full bg-purple-500" title="Multiple Tasks" />
                              ) : dayVisits[0].isNonVisit ? (
                                <span className="h-2 w-2 rounded-full bg-amber-500" title="Non-Visit Activity" />
                              ) : dayVisits[0].status === 'Completed' ? (
                                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Completed" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-cyan-500" title="Scheduled" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Mini Task Pills */}
                        <div className="space-y-1 mt-1">
                          {dayVisits.slice(0, 2).map((v) => (
                            <div
                              key={v.id}
                              className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                v.isNonVisit
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : v.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                              }`}
                              title={`${v.task} (${v.time})`}
                            >
                              {v.task.split('-')[0]}
                            </div>
                          ))}
                          {dayVisits.length > 2 && (
                            <span className="text-[9px] text-purple-600 font-extrabold block">
                              +{dayVisits.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-pearl-200/80 bg-white/80 p-2.5 dark:border-charcoal-700/80 dark:bg-charcoal-850/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Scheduled Visit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Completed Visit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Non-Visit Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Multiple Activities</span>
          </div>
        </div>

        {/* Bottom Tasks Table */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="border-b border-pearl-200 px-5 py-3 dark:border-charcoal-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Visits & Activities for {months[currentMonthIndex]} {selectedDay || '—'}, {currentYear}
              </h3>
              <span className="rounded-full bg-pearl-200/70 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:bg-charcoal-700 dark:text-slate-300">
                {visitsForSelectedDay.length} {visitsForSelectedDay.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-pearl-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-rose-400 cursor-pointer transition"
            >
              <Plus size={12} />
              <span>+ Add on this Date</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">Patient / Activity</th>
                  <th className="px-5 py-3">Task Details</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {visitsForSelectedDay.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No visits or activities scheduled for {months[currentMonthIndex]} {selectedDay || '—'}, {currentYear}.
                    </td>
                  </tr>
                ) : (
                  visitsForSelectedDay.map((row) => (
                    <tr key={row.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                        {row.patientName}
                        {row.mrn !== 'Admin' && row.mrn !== 'N/A' && (
                          <span className="block text-[11px] font-mono text-slate-400">
                            MRN: #{row.mrn}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-800 dark:text-slate-200">
                        <div>{row.task}</div>
                        {row.address && (
                          <div className="text-[10px] text-slate-400">{row.address}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {currentMonthIndex + 1}/{selectedDay}/{currentYear}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {row.time}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            row.isNonVisit
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : row.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.isNonVisit
                                ? 'bg-amber-500'
                                : row.status === 'Completed'
                                ? 'bg-emerald-500'
                                : 'bg-cyan-500'
                            }`}
                          />
                          {row.isNonVisit ? 'Logged Activity' : row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Calendar Activity / Visit Modal */}
      <AddCalendarActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultDate={selectedDateFormatted}
        onActivityAdded={() => {
          showToast('New activity successfully saved to database and added to calendar.');
          fetchCalendarData();
        }}
      />
    </div>
  );
};
