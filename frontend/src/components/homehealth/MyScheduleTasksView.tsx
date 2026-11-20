import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Tag,
  Briefcase,
  Layers,
  FileCheck
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';
import { NonVisitActivityModal } from './NonVisitActivityModal';

interface MyScheduleTasksViewProps {
  onBack: () => void;
  onOpenPlanner?: () => void;
}

export interface ScheduleTaskRow {
  id: string;
  patientName: string;
  mrn: string;
  task: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Completed' | 'Pending Signature' | 'Missed';
  tags: string[];
  clinicianName?: string;
}

export const MyScheduleTasksView: React.FC<MyScheduleTasksViewProps> = ({
  onBack,
  onOpenPlanner,
}) => {
  const { organization } = useHealthcare();
  const [groupBy, setGroupBy] = useState<'patient' | 'date' | 'task' | 'tag'>('patient');
  const [tasks, setTasks] = useState<ScheduleTaskRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const fetchScheduleTasks = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await api.getMyScheduleTasks();
      setTasks(data);

      if (isManualRefresh) {
        showToast('Schedule tasks refreshed successfully from database.');
      }
    } catch (err: any) {
      console.error('Error fetching schedule tasks:', err);
      showToast('Failed to load schedule tasks: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduleTasks();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRefresh = () => {
    fetchScheduleTasks(true);
  };

  const handleOpenPlanner = () => {
    if (onOpenPlanner) {
      onOpenPlanner();
    } else {
      showToast('Opening CareOrbit Planner...');
    }
  };

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter((t) =>
      t.patientName.toLowerCase().includes(query) ||
      t.task.toLowerCase().includes(query) ||
      t.mrn.toLowerCase().includes(query) ||
      t.date.includes(query) ||
      t.status.toLowerCase().includes(query) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [tasks, searchQuery]);

  // Grouping logic
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { label: string; subLabel?: string; tasks: ScheduleTaskRow[] } } = {};

    if (groupBy === 'patient') {
      filteredTasks.forEach((t) => {
        const key = `${t.patientName}_${t.mrn}`;
        if (!groups[key]) {
          groups[key] = {
            label: t.patientName,
            subLabel: `MRN: #${t.mrn}`,
            tasks: [],
          };
        }
        groups[key].tasks.push(t);
      });
    } else if (groupBy === 'date') {
      filteredTasks.forEach((t) => {
        const key = t.date;
        if (!groups[key]) {
          groups[key] = {
            label: t.date,
            tasks: [],
          };
        }
        groups[key].tasks.push(t);
      });
    } else if (groupBy === 'task') {
      filteredTasks.forEach((t) => {
        const key = t.task;
        if (!groups[key]) {
          groups[key] = {
            label: t.task,
            tasks: [],
          };
        }
        groups[key].tasks.push(t);
      });
    } else if (groupBy === 'tag') {
      filteredTasks.forEach((t) => {
        const rowTags = t.tags.length > 0 ? t.tags : ['Uncategorized'];
        rowTags.forEach((tag) => {
          if (!groups[tag]) {
            groups[tag] = {
              label: tag,
              tasks: [],
            };
          }
          // Avoid duplicate reference if already in group
          if (!groups[tag].tasks.some((existing) => existing.id === t.id)) {
            groups[tag].tasks.push(t);
          }
        });
      });
    }

    return groups;
  }, [filteredTasks, groupBy]);

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportExcel = () => {
    if (filteredTasks.length === 0) {
      showToast('No schedule tasks to export.');
      return;
    }

    const headers = ['Patient Name', 'MRN', 'Task', 'Date', 'Time Slot', 'Status', 'Tags', 'Clinician'];
    const rows = filteredTasks.map((t) => [
      `"${t.patientName.replace(/"/g, '""')}"`,
      `"${t.mrn}"`,
      `"${t.task.replace(/"/g, '""')}"`,
      `"${t.date}"`,
      `"${t.timeSlot}"`,
      `"${t.status}"`,
      `"${t.tags.join('; ')}"`,
      `"${t.clinicianName || 'Hilder Magessa, RN'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `CareOrbit_My_Schedule_Tasks_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredTasks.length} tasks to Excel (.csv) successfully.`);
  };

  const renderStatusBadge = (status: ScheduleTaskRow['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'Pending Signature':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Signature
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Missed
          </span>
        );
      case 'Scheduled':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[11px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Scheduled
          </span>
        );
    }
  };

  const renderTaskRow = (row: ScheduleTaskRow) => (
    <tr
      key={row.id}
      className="hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/40 transition border-b border-pearl-100 dark:border-charcoal-750"
    >
      <td className="px-5 py-3.5">
        <div className="font-bold text-slate-900 dark:text-white">
          {row.patientName}
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          MRN: #{row.mrn}
        </div>
      </td>
      <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
        <div>{row.task}</div>
        {row.clinicianName && (
          <div className="text-[10px] text-slate-400 mt-0.5">
            Assigned: {row.clinicianName}
          </div>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="font-bold text-slate-900 dark:text-white">{row.date}</div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock size={11} className="text-slate-400" />
          <span>{row.timeSlot}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {renderStatusBadge(row.status)}
      </td>
      <td className="px-5 py-3.5">
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
  );

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

        {/* Search bar */}
        <div className="relative hidden md:block w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, patients, MRN..."
            className="w-full rounded-xl border border-pearl-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          />
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

      {/* 2. Main Work Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/90 bg-white/95 p-4 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="flex flex-wrap items-center gap-2">
            {/* Non Visit Activity Log Button */}
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Layers size={13} className="text-rose-400" />
              <span>Non Visit Activity Log</span>
            </button>

            {/* Grouping Button Group */}
            <div className="flex flex-wrap items-center rounded-xl border border-pearl-200 bg-pearl-50 p-0.5 dark:border-charcoal-700 dark:bg-charcoal-800">
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

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPlanner}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
              title="Open Planner / Calendar"
            >
              <Calendar size={13} className="text-rose-600" />
              <span>CareOrbit Planner</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Refresh Schedule Tasks"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-rose-600' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
              title="Export to Excel Spreadsheet (.csv)"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>

        {/* Notice text */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Note: This list shows you items/tasks dated 3 months into the past and 2 weeks into the future. To find older items, look in the Patient's Chart or Schedule Center.
          </p>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Total Tasks: <strong className="text-rose-600 font-black">{filteredTasks.length}</strong>
          </span>
        </div>

        {/* Mobile search bar if screen is small */}
        <div className="md:hidden">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, patients, MRN..."
              className="w-full rounded-xl border border-pearl-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Schedule Table Container */}
        <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-rose-600" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Fetching real schedule tasks from database...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
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
                  // Grouped display
                  Object.entries(groupedData).map(([groupKey, group]) => {
                    const isCollapsed = !!collapsedGroups[groupKey];
                    return (
                      <React.Fragment key={groupKey}>
                        {/* Group Header Row */}
                        <tr
                          onClick={() => toggleGroupCollapse(groupKey)}
                          className="bg-pearl-50/90 dark:bg-charcoal-800/80 hover:bg-pearl-100/80 dark:hover:bg-charcoal-750 cursor-pointer border-y border-pearl-200/80 dark:border-charcoal-700 select-none"
                        >
                          <td colSpan={5} className="px-5 py-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                </span>
                                <span className="font-black text-xs text-slate-900 dark:text-white">
                                  {group.label}
                                </span>
                                {group.subLabel && (
                                  <span className="text-[11px] font-mono text-slate-400">
                                    ({group.subLabel})
                                  </span>
                                )}
                              </div>
                              <span className="rounded-full bg-pearl-200/70 px-2.5 py-0.5 text-[10px] font-black text-slate-700 dark:bg-charcoal-700 dark:text-slate-300">
                                {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Group Tasks Rows */}
                        {!isCollapsed && group.tasks.map(renderTaskRow)}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Non Visit Activity Log Modal */}
      <NonVisitActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        clinicianName="Hilder Magessa, RN"
      />
    </div>
  );
};
