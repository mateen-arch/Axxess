import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface MyMonthlyCalendarViewProps {
  onBack: () => void;
}

interface CalendarVisit {
  id: string;
  day: number;
  patientName: string;
  mrn: string;
  task: string;
  time: string;
  status: 'Scheduled' | 'Completed';
}

const SAMPLE_VISITS: CalendarVisit[] = [
  {
    id: 'cal-1',
    day: 2,
    patientName: 'Lantigua Gonzalez, Scarlet',
    mrn: '1061',
    task: 'SN Visit - Wound Care',
    time: '09:00 AM',
    status: 'Completed',
  },
  {
    id: 'cal-2',
    day: 5,
    patientName: 'Doshi, N Kundanika',
    mrn: '1035',
    task: 'Cardiopulmonary Assessment',
    time: '11:00 AM',
    status: 'Completed',
  },
  {
    id: 'cal-3',
    day: 8,
    patientName: 'Auguste, Jocelene',
    mrn: '1042',
    task: 'OASIS Recertification',
    time: '01:30 PM',
    status: 'Completed',
  },
  {
    id: 'cal-4',
    day: 9,
    patientName: 'Singleton Jr., Clifford',
    mrn: '1088',
    task: 'Foley Catheter Maintenance',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: 'cal-5',
    day: 12,
    patientName: 'Jackson, Danenne',
    mrn: '1095',
    task: 'IV Infusion Monitoring',
    time: '02:00 PM',
    status: 'Scheduled',
  },
  {
    id: 'cal-6',
    day: 16,
    patientName: 'Lantigua Gonzalez, Scarlet',
    mrn: '1061',
    task: 'SN Wound VAC Dressing Change',
    time: '09:30 AM',
    status: 'Scheduled',
  },
  {
    id: 'cal-7',
    day: 16,
    patientName: 'Doshi, N Kundanika',
    mrn: '1035',
    task: 'Diabetic Foot Examination',
    time: '01:00 PM',
    status: 'Scheduled',
  },
  {
    id: 'cal-8',
    day: 23,
    patientName: 'Auguste, Jocelene',
    mrn: '1042',
    task: 'Routine Skilled Nursing Visit',
    time: '11:00 AM',
    status: 'Scheduled',
  },
];

export const MyMonthlyCalendarView: React.FC<MyMonthlyCalendarViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();
  const [selectedDay, setSelectedDay] = useState<number | null>(8);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // 10 = November
  const [currentYear, setCurrentYear] = useState(2026);
  const [toastMessage, setToastMessage] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = 30; // November 2026
  const startDayOfWeek = 0; // Nov 1, 2026 was Sunday (0)

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
    setToastMessage('Calendar refreshed.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const visitsForSelectedDay = selectedDay
    ? SAMPLE_VISITS.filter((v) => v.day === selectedDay)
    : [];

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
                Axxess Home Health
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
          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Main Calendar Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Month Navigation Strip (Matching Screenshot 3) */}
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
              Hilder Magessa RN
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
          <div className="grid grid-cols-7 divide-x divide-y divide-pearl-100 dark:divide-charcoal-750">
            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNum = idx - startDayOfWeek + 1;
              const isCurrentMonthDay = dayNum >= 1 && dayNum <= daysInMonth;
              const visits = isCurrentMonthDay ? SAMPLE_VISITS.filter((v) => v.day === dayNum) : [];
              const isSelected = selectedDay === dayNum;
              const hasMultiple = visits.length > 1;

              return (
                <div
                  key={idx}
                  onClick={() => isCurrentMonthDay && setSelectedDay(dayNum)}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 transition cursor-pointer ${
                    !isCurrentMonthDay
                      ? 'bg-pearl-50/40 dark:bg-charcoal-900/40 text-slate-300 dark:text-charcoal-600'
                      : isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 ring-1 ring-inset ring-rose-500'
                      : 'hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/50'
                  }`}
                >
                  {isCurrentMonthDay && (
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected
                              ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {visits.length > 0 && (
                          <div className="flex items-center gap-1">
                            {hasMultiple ? (
                              <span className="h-2 w-2 rounded-full bg-purple-500" title="Multiple Tasks" />
                            ) : visits[0].status === 'Completed' ? (
                              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Completed" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-cyan-500" title="Scheduled" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mini Task Pills */}
                      <div className="space-y-1 mt-1">
                        {visits.slice(0, 2).map((v) => (
                          <div
                            key={v.id}
                            className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              v.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                            }`}
                          >
                            {v.task.split('-')[0]}
                          </div>
                        ))}
                        {visits.length > 2 && (
                          <span className="text-[9px] text-purple-600 font-extrabold block">
                            +{visits.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend Bar (Matching Screenshot 3: Scheduled, Completed, Multiple) */}
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-pearl-200/80 bg-white/80 p-2.5 dark:border-charcoal-700/80 dark:bg-charcoal-850/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Multiple</span>
          </div>
        </div>

        {/* Bottom Tasks Table (Matching Screenshot 3) */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="border-b border-pearl-200 px-5 py-3 dark:border-charcoal-700 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Visits for November {selectedDay || '—'}, 2026
            </h3>
            <span className="text-[11px] text-slate-500">
              {visitsForSelectedDay.length} task(s) scheduled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {visitsForSelectedDay.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No records to display.
                    </td>
                  </tr>
                ) : (
                  visitsForSelectedDay.map((row) => (
                    <tr key={row.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                        {row.patientName}
                        <span className="block text-[11px] font-mono text-slate-400">
                          MRN: #{row.mrn}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-800 dark:text-slate-200">
                        {row.task}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                        11/{row.day}/2026
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {row.time}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            row.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.status === 'Completed' ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                          />
                          {row.status}
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
    </div>
  );
};

