import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  User,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  Square,
  CalendarDays,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

interface ReassignScheduleViewProps {
  onBack?: () => void;
}

interface EligibleTask {
  id: string;
  patientName: string;
  mrn: string;
  task: string;
  scheduledDate: string;
  rawDate: string;
  timeSlot: string;
  assignedTo: string;
  discipline: string;
  status: string;
}

export const ReassignScheduleView: React.FC<ReassignScheduleViewProps> = ({ onBack }) => {
  // Clinicians list from DB
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [loadingClinicians, setLoadingClinicians] = useState<boolean>(true);

  // Form State matching Screenshot exactly
  const [employeeFrom, setEmployeeFrom] = useState<string>('');
  const [employeeTo, setEmployeeTo] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('2026-09-23');
  const [dateTo, setDateTo] = useState<string>('2026-11-21');

  // Live Matching Tasks Preview
  const [eligibleTasks, setEligibleTasks] = useState<EligibleTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Clinicians for Dropdowns
  useEffect(() => {
    const fetchClinicians = async () => {
      try {
        setLoadingClinicians(true);
        const data = await api.getClinicians();
        if (data && Array.isArray(data)) {
          setClinicians(data);
        } else {
          setClinicians([
            { id: 'cli-fortune', name: 'Mario Fortune LPN', title: 'Licensed Practical Nurse', discipline: 'Nursing' },
            { id: 'cli-kyalikunda', name: 'Mary Kyalikunda RN', title: 'Registered Nurse', discipline: 'Nursing' },
            { id: 'cli-nelson', name: 'Alexandria Nelson, RN', title: 'Clinical Supervisor', discipline: 'Nursing' },
            { id: 'cli-jenkins', name: 'Sarah Jenkins, RN', title: 'Field Nurse', discipline: 'Nursing' },
            { id: 'cli-bellevue', name: 'Andre Bellevue, PT', title: 'Physical Therapist', discipline: 'Physical Therapy' },
            { id: 'cli-rostova', name: 'Elena Rostova, OT', title: 'Occupational Therapist', discipline: 'Occupational Therapy' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching clinicians:', err);
      } finally {
        setLoadingClinicians(false);
      }
    };
    fetchClinicians();
  }, []);

  // 2. Fetch Eligible Tasks in real-time from Database based on Form
  const fetchEligibleTasks = async () => {
    try {
      setLoadingTasks(true);
      const data = await api.getEligibleReassignTasks({
        employeeFrom: employeeFrom || undefined,
        dateFrom,
        dateTo
      });
      if (data && Array.isArray(data)) {
        setEligibleTasks(data);
        // By default select all eligible tasks
        setSelectedTaskIds(new Set(data.map((t: EligibleTask) => t.id)));
      }
    } catch (err) {
      console.error('Error fetching eligible tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchEligibleTasks();
  }, [employeeFrom, dateFrom, dateTo]);

  // Handle Select All Toggle
  const toggleSelectAll = () => {
    if (selectedTaskIds.size === eligibleTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(eligibleTasks.map(t => t.id)));
    }
  };

  const toggleSelectTask = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  // 3. Execute Reassignment in Real-time Database
  const handleExecuteReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeTo) {
      showToast('Please select a recipient employee in "Employee To".');
      return;
    }

    try {
      setIsSubmitting(true);
      const visitIds = Array.from(selectedTaskIds);
      const res = await api.executeReassignSchedule({
        employeeFrom: employeeFrom || undefined,
        employeeTo,
        dateFrom,
        dateTo,
        visitIds: visitIds.length > 0 ? visitIds : undefined
      });

      showToast(res.message || 'Tasks successfully reassigned in database.');
      // Refresh list
      fetchEligibleTasks();
    } catch (err: any) {
      showToast(`Error executing reassignment: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans text-xs select-none overflow-y-auto">
      {/* 1. Authentic Burgundy Chrome Window Banner (Matching Screenshot) */}
      <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal size={14} className="text-white/90" />
          <span className="font-extrabold text-xs tracking-wider">Reassign Schedule</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block cursor-pointer"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block cursor-pointer"></span>
          <span
            onClick={onBack}
            className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
            title="Exit Reassign Schedule"
          ></span>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Form Card: Reassign Tasks (Faithful reproduction of Screenshot) */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-md p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-5">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
              Reassign Tasks
            </h2>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 italic">
              *Required Field
            </span>
          </div>

          <form onSubmit={handleExecuteReassignment} className="space-y-4">
            {/* Employee From */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1.5 border-b border-dashed border-pearl-200 dark:border-charcoal-750">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36">
                Employee From:
              </label>
              <div className="flex-1 max-w-xl">
                <select
                  value={employeeFrom}
                  onChange={(e) => setEmployeeFrom(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-[#2b78a3] focus:border-transparent outline-none transition"
                >
                  <option value="">-- Select User --</option>
                  <option value="all">All Employees</option>
                  {clinicians.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} {c.title ? `(${c.title})` : ''} - {c.discipline || 'Nursing'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee To */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1.5 border-b border-dashed border-pearl-200 dark:border-charcoal-750">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36">
                Employee To: <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1 max-w-xl">
                <select
                  value={employeeTo}
                  onChange={(e) => setEmployeeTo(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-[#2b78a3] focus:border-transparent outline-none transition"
                  required
                >
                  <option value="">-- Select User --</option>
                  {clinicians.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} {c.title ? `(${c.title})` : ''} - {c.discipline || 'Nursing'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date From */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1.5 border-b border-dashed border-pearl-200 dark:border-charcoal-750">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36">
                Date From:
              </label>
              <div className="flex-1 max-w-xs relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-[#2b78a3] outline-none"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1.5 border-b border-dashed border-pearl-200 dark:border-charcoal-750">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36">
                Date To:
              </label>
              <div className="flex-1 max-w-xs relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-[#2b78a3] outline-none"
                />
              </div>
            </div>

            {/* Note text matching Screenshot */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold italic pt-1">
              Note: Only tasks that are not started and not yet due will be reassigned.
            </div>

            {/* Action Buttons matching Screenshot */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !employeeTo}
                className="px-7 py-2 rounded-lg bg-[#2b78a3] hover:bg-[#205d80] text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1.5"
              >
                {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                <span>{isSubmitting ? 'Reassigning...' : 'Reassign'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="px-7 py-2 rounded-lg bg-pearl-300 dark:bg-charcoal-750 hover:bg-pearl-400 dark:hover:bg-charcoal-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer"
              >
                Exit
              </button>
            </div>
          </form>
        </div>

        {/* 3. Live Real-Time Eligible Tasks Table */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-md p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-[#2b78a3]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Live Eligible Tasks for Reassignment
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                {eligibleTasks.length} Found
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center space-x-1.5 font-bold text-[#2b78a3] hover:underline"
              >
                {selectedTaskIds.size === eligibleTasks.length && eligibleTasks.length > 0 ? (
                  <CheckSquare size={14} />
                ) : (
                  <Square size={14} />
                )}
                <span>Select All ({selectedTaskIds.size}/{eligibleTasks.length})</span>
              </button>
              <button
                type="button"
                onClick={fetchEligibleTasks}
                className="p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-slate-500"
                title="Refresh Eligible Tasks"
              >
                <RefreshCw size={13} className={loadingTasks ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-pearl-200 dark:border-charcoal-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#b3d7eb]/50 dark:bg-[#1e475f]/50 text-slate-800 dark:text-slate-200 text-[11px] font-black uppercase border-b border-pearl-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-2 px-3 w-8 text-center"></th>
                  <th className="py-2 px-3">Patient Name</th>
                  <th className="py-2 px-3">Task / Visit Type</th>
                  <th className="py-2 px-3">Scheduled Date</th>
                  <th className="py-2 px-3">Current Assignee</th>
                  <th className="py-2 px-3">Discipline</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {eligibleTasks.map((t) => {
                  const isChecked = selectedTaskIds.has(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => toggleSelectTask(t.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 dark:bg-blue-950/20'
                          : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectTask(t.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded text-[#2b78a3] cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        {t.patientName}{' '}
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          (MRN: {t.mrn})
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {t.task}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                        {t.scheduledDate} {t.timeSlot ? `· ${t.timeSlot}` : ''}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {t.assignedTo}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                          {t.discipline}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {eligibleTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                      {loadingTasks
                        ? 'Loading tasks from database...'
                        : 'No unstarted or not yet due tasks found matching the criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs border border-white/20 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ReassignScheduleView;
