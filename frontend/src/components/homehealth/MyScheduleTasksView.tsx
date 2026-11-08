import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Plus,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface MyScheduleTasksViewProps {
  onBack: () => void;
  onOpenPlanner?: () => void;
}

interface ScheduleTaskRow {
  id: string;
  patientName: string;
  mrn: string;
  task: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Completed' | 'Pending Signature' | 'Missed';
  tags: string[];
}

const DEFAULT_SCHEDULE_TASKS: ScheduleTaskRow[] = [
  {
    id: 'st-1',
    patientName: 'Lantigua Gonzalez, Scarlet',
    mrn: '1061',
    task: 'SN Visit - Wound VAC Dressing Change',
    date: '11/08/2026',
    timeSlot: '09:00 AM - 10:30 AM',
    status: 'Completed',
    tags: ['Wound Care', 'Fall Risk'],
  },
  {
    id: 'st-2',
    patientName: 'Doshi, N Kundanika',
    mrn: '1035',
    task: 'SN - Medication Reconciliation & Cardiopulmonary Assessment',
    date: '11/08/2026',
    timeSlot: '11:15 AM - 12:15 PM',
    status: 'Scheduled',
    tags: ['CHF', 'Diabetic Protocol'],
  },
  {
    id: 'st-3',
    patientName: 'Auguste, Jocelene',
    mrn: '1042',
    task: 'OASIS Recertification Assessment',
    date: '11/09/2026',
    timeSlot: '01:30 PM - 03:00 PM',
    status: 'Scheduled',
    tags: ['OASIS-E', 'Recertification'],
  },
  {
    id: 'st-4',
    patientName: 'Singleton Jr., Clifford',
    mrn: '1088',
    task: 'SN Visit - Foley Catheter Care & Urine Specimen',
    date: '11/10/2026',
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'Scheduled',
    tags: ['Urology', 'Infection Surveillance'],
  },
  {
    id: 'st-5',
    patientName: 'Jackson, Danenne',
    mrn: '1095',
    task: 'SN Visit - IV Infusion Monitoring',
    date: '11/11/2026',
    timeSlot: '02:00 PM - 03:30 PM',
    status: 'Scheduled',
    tags: ['IV Therapy', 'Specialty Rx'],
  },
];

export const MyScheduleTasksView: React.FC<MyScheduleTasksViewProps> = ({
  onBack,
  onOpenPlanner,
}) => {
  const { organization, clinicians } = useHealthcare();
  const [groupBy, setGroupBy] = useState<'patient' | 'date' | 'task' | 'tag'>('patient');
  const [tasks, setTasks] = useState<ScheduleTaskRow[]>(DEFAULT_SCHEDULE_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (showEmptyState) return false;
    if (!searchQuery.trim()) return true;
    return (
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mrn.includes(searchQuery)
    );
  });

  const handleExportExcel = () => {
    setToastMessage('Exporting schedule tasks to Excel format (.xlsx)...');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRefresh = () => {
    setToastMessage('Schedule tasks refreshed.');
    setTimeout(() => setToastMessage(''), 2500);
  };

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
                My Schedule / Tasks
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Hilder's Schedule and Tasks
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="rounded-xl border border-pearl-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
          >
            {showEmptyState ? 'Show Sample Schedule' : 'View Blank Form State'}
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

      {/* 2. Main Work Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Action Bar (Exact match to Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/90 bg-white/95 p-4 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
            >
              Non Visit Activity Log
            </button>

            {/* Grouping Button Group (Matching Screenshot 2) */}
            <div className="flex items-center rounded-xl border border-pearl-200 bg-pearl-50 p-0.5 dark:border-charcoal-700 dark:bg-charcoal-800">
              <button
                type="button"
                onClick={() => setGroupBy('patient')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  groupBy === 'patient'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Group By Patient
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('date')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  groupBy === 'date'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Group By Date
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('task')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  groupBy === 'task'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Group By Task
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('tag')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  groupBy === 'tag'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Group By Tag
              </button>
            </div>
          </div>

          {/* Right Action Buttons (Matching Screenshot 2) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPlanner}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
            >
              <Calendar size={13} className="text-rose-600" />
              <span>Axxess Planner</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>

        {/* Notice text from Screenshot 2 */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1">
          Note: This list shows you items/tasks dated 3 months into the past and 2 weeks into the future. To find older items, look in the Patient's Chart or Schedule Center.
        </p>

        {/* Schedule Table Container */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3.5">Patient Name</th>
                  <th className="px-5 py-3.5">Task</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        No records to display.
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        No scheduled clinical tasks match the active filters or time window.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition"
                    >
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {row.patientName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          MRN: #{row.mrn}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-medium">
                        {row.task}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{row.date}</div>
                        <div className="text-[11px] text-slate-500">{row.timeSlot}</div>
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
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-pearl-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-charcoal-700 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
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

