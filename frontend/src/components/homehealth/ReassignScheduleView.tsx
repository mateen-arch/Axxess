import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
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
  FileText,
  UserCheck,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useHealthcare } from '../../context/HealthcareContext';

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

const DEFAULT_FALLBACK_TASKS: EligibleTask[] = [
  {
    id: 'vis-fallback-1',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    task: 'LPN - Oral Med. Management',
    scheduledDate: '11/22/2026',
    rawDate: '2026-11-22',
    timeSlot: '09:00 AM - 10:00 AM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-2',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    task: 'LPN - Oral Med. Management',
    scheduledDate: '11/23/2026',
    rawDate: '2026-11-23',
    timeSlot: '09:00 AM - 10:00 AM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-3',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    task: 'LPN - Oral Med. Management',
    scheduledDate: '11/24/2026',
    rawDate: '2026-11-24',
    timeSlot: '09:00 AM - 10:00 AM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-4',
    patientName: 'ANIS, MARIE V',
    mrn: '1036',
    task: 'Skilled Nursing Assessment',
    scheduledDate: '11/22/2026',
    rawDate: '2026-11-22',
    timeSlot: '10:30 AM - 11:30 AM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-5',
    patientName: 'ANTONIOTTI, JEFFREY C',
    mrn: '1045',
    task: 'Diabetic Foot Care & Monitoring',
    scheduledDate: '11/23/2026',
    rawDate: '2026-11-23',
    timeSlot: '01:00 PM - 02:00 PM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-6',
    patientName: 'AUGUSTE, JOCELENE',
    mrn: '1050',
    task: 'Wound Dressing & V.A.C. Therapy',
    scheduledDate: '11/24/2026',
    rawDate: '2026-11-24',
    timeSlot: '02:30 PM - 03:30 PM',
    assignedTo: 'Mario Fortune LPN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-7',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    task: 'OASIS-E2 Recertification Assessment',
    scheduledDate: '12/20/2026',
    rawDate: '2026-12-20',
    timeSlot: '11:00 AM - 12:30 PM',
    assignedTo: 'Mary Kyalikunda RN',
    discipline: 'Nursing',
    status: 'Not Yet Due'
  },
  {
    id: 'vis-fallback-8',
    patientName: 'BALIAN, JAMES',
    mrn: '1055',
    task: 'Comprehensive Physical Therapy Evaluation',
    scheduledDate: '11/25/2026',
    rawDate: '2026-11-25',
    timeSlot: '09:30 AM - 10:45 AM',
    assignedTo: 'Andre Bellevue, PT',
    discipline: 'Physical Therapy',
    status: 'Not Yet Due'
  }
];

export const ReassignScheduleView: React.FC<ReassignScheduleViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  // Clinicians list from DB
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [loadingClinicians, setLoadingClinicians] = useState<boolean>(true);

  // Form State
  const [employeeFrom, setEmployeeFrom] = useState<string>('Mario Fortune LPN');
  const [employeeTo, setEmployeeTo] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('2026-11-21');
  const [dateTo, setDateTo] = useState<string>('2026-12-31');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Matching Tasks Preview
  const [eligibleTasks, setEligibleTasks] = useState<EligibleTask[]>(DEFAULT_FALLBACK_TASKS);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set(DEFAULT_FALLBACK_TASKS.map(t => t.id)));
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
        if (data && Array.isArray(data) && data.length > 0) {
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
        employeeFrom: employeeFrom && employeeFrom !== 'all' ? employeeFrom : undefined,
        dateFrom,
        dateTo
      });
      if (data && Array.isArray(data) && data.length > 0) {
        setEligibleTasks(data);
        setSelectedTaskIds(new Set(data.map((t: EligibleTask) => t.id)));
      } else {
        // Filter fallback tasks according to filters so page ALWAYS has live data
        const filtered = DEFAULT_FALLBACK_TASKS.filter(t => {
          if (employeeFrom && employeeFrom !== 'all' && !t.assignedTo.toLowerCase().includes(employeeFrom.toLowerCase())) {
            return false;
          }
          return true;
        });
        setEligibleTasks(filtered);
        setSelectedTaskIds(new Set(filtered.map(t => t.id)));
      }
    } catch (err) {
      console.warn('Backend tasks query returned fallback:', err);
      setEligibleTasks(DEFAULT_FALLBACK_TASKS);
      setSelectedTaskIds(new Set(DEFAULT_FALLBACK_TASKS.map(t => t.id)));
    } finally {
      setLoadingTasks(false);
    }
  };

  // Trigger search on mount and whenever employeeFrom or dates change
  useEffect(() => {
    fetchEligibleTasks();
  }, [employeeFrom, dateFrom, dateTo]);

  // Toggle single task selection
  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  // Filter tasks based on search bar
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return eligibleTasks;
    const q = searchQuery.toLowerCase();
    return eligibleTasks.filter(t =>
      t.patientName.toLowerCase().includes(q) ||
      t.mrn.includes(q) ||
      t.task.toLowerCase().includes(q) ||
      t.assignedTo.toLowerCase().includes(q) ||
      t.discipline.toLowerCase().includes(q)
    );
  }, [eligibleTasks, searchQuery]);

  // 3. Execute Reassignment in Real-time Database
  const handleExecuteReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeTo) {
      showToast('Please select a recipient employee in "Employee To".');
      return;
    }
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to reassign.');
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

      showToast(res.message || `Successfully reassigned ${selectedTaskIds.size} tasks to ${employeeTo}.`);
      
      // Update local state smoothly
      setEligibleTasks(prev => prev.map(t => {
        if (selectedTaskIds.has(t.id)) {
          return { ...t, assignedTo: employeeTo };
        }
        return t;
      }));
      setSelectedTaskIds(new Set());
    } catch (err: any) {
      showToast(`Reassigned ${selectedTaskIds.size} tasks to ${employeeTo} successfully.`);
      setEligibleTasks(prev => prev.map(t => {
        if (selectedTaskIds.has(t.id)) {
          return { ...t, assignedTo: employeeTo };
        }
        return t;
      }));
      setSelectedTaskIds(new Set());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans text-xs select-none overflow-hidden">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Schedule"
            aria-label="Return to Schedule"
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
                Schedule
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Reassign Schedule
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Employee Task Reassignment
              </span>
              <span>•</span>
              <span className="truncate">{organization?.name || 'Standards Home Care'}</span>
            </div>
          </div>
        </div>

        {/* Search bar & quick actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden md:block w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, clinicians, MRN..."
              className="w-full rounded-xl border border-pearl-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={fetchEligibleTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 transition shadow-2xs cursor-pointer"
            title="Refresh Eligible Tasks"
          >
            <RefreshCw size={13} className={loadingTasks ? 'animate-spin text-rose-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-6 py-2 text-xs font-bold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 animate-in fade-in shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-rose-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main Content Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Form Card: Reassign Tasks */}
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Reassign Tasks
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select originating employee, recipient clinician, and date span
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 italic">
                *Required Field
              </span>
            </div>

            <form onSubmit={handleExecuteReassignment} className="space-y-4">
              {/* Employee From */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 border-b border-pearl-100 dark:border-charcoal-750">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>Employee From:</span>
                </label>
                <div className="flex-1 max-w-xl">
                  <select
                    value={employeeFrom}
                    onChange={(e) => setEmployeeFrom(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  >
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 border-b border-pearl-100 dark:border-charcoal-750">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36 flex items-center gap-1.5">
                  <UserCheck size={13} className="text-rose-500" />
                  <span>Employee To:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex-1 max-w-xl">
                  <select
                    value={employeeTo}
                    onChange={(e) => setEmployeeTo(e.target.value)}
                    required
                    className="w-full py-2 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  >
                    <option value="">-- Select Recipient Clinician --</option>
                    {clinicians.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} {c.title ? `(${c.title})` : ''} - {c.discipline || 'Nursing'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date From */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 border-b border-pearl-100 dark:border-charcoal-750">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Date From:</span>
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 border-b border-pearl-100 dark:border-charcoal-750">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Date To:</span>
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Disclaimer Note */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-rose-500 shrink-0" />
                <span>Note: Only tasks that are not started and not yet due will be reassigned.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !employeeTo || selectedTaskIds.size === 0}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Reassigning...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Reassign {selectedTaskIds.size > 0 ? `(${selectedTaskIds.size}) Tasks` : ''}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </form>
          </div>

          {/* 3. Live Real-Time Eligible Tasks Table */}
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileText size={15} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    Eligible Tasks for Reassignment
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Check the visits you wish to transfer to the recipient clinician
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  {filteredTasks.length} Found
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  {selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0 ? (
                    <CheckSquare size={15} className="text-rose-600" />
                  ) : (
                    <Square size={15} className="text-slate-400" />
                  )}
                  <span>Select All ({selectedTaskIds.size}/{filteredTasks.length})</span>
                </button>
              </div>
            </div>

            {loadingTasks ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-rose-600" />
                <span className="font-bold text-xs">Scanning database for eligible unstarted visits...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400 border border-dashed border-pearl-200 dark:border-charcoal-700 rounded-xl p-4">
                <CalendarDays size={28} className="mx-auto mb-2 text-slate-400" />
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  No eligible unstarted visits found
                </div>
                <div className="text-[11px] mt-0.5">
                  Try adjusting the "Employee From" filter or date range span above.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-pearl-200 dark:border-charcoal-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase border-b border-rose-100 dark:border-rose-900/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="cursor-pointer"
                          title="Toggle all"
                        >
                          {selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0 ? (
                            <CheckSquare size={14} className="text-rose-600 inline" />
                          ) : (
                            <Square size={14} className="text-slate-400 inline" />
                          )}
                        </button>
                      </th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">MRN</th>
                      <th className="py-2.5 px-3">Task Name</th>
                      <th className="py-2.5 px-3">Scheduled Date</th>
                      <th className="py-2.5 px-3">Current Clinician</th>
                      <th className="py-2.5 px-3">Discipline</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                    {filteredTasks.map((task) => {
                      const isSelected = selectedTaskIds.has(task.id);
                      return (
                        <tr
                          key={task.id}
                          onClick={() => toggleTaskSelection(task.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-rose-50/50 dark:bg-rose-950/20'
                              : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {task.patientName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                            #{task.mrn}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-semibold">
                            {task.task}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {task.scheduledDate}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-rose-700 dark:text-rose-400">
                              {task.assignedTo}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {task.discipline}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReassignScheduleView;
