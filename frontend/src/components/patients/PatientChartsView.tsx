import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Printer,
  Download,
  Trash2,
  MoreHorizontal,
  MapPin,
  Phone,
  User,
  Users,
  ArrowLeft,
  Calendar,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';
import { Patient } from '../../types';

interface PatientTask {
  id: string;
  patientId: string;
  task: string;
  discipline: string;
  status: string;
  scheduleStart: string;
  scheduleEnd: string;
  assignedTo: string;
  comments: string;
}

export interface PatientChartsViewProps {
  onBack?: () => void;
  onNewPatient?: () => void;
  onEditPatient?: (id: string) => void;
}

export const PatientChartsView: React.FC<PatientChartsViewProps> = ({
  onBack,
  onNewPatient,
  onEditPatient
}) => {
  const { patients, setIsNewPatientModalOpen } = useHealthcare();

  // Filter States (Left Panel)
  const [selectedOrg, setSelectedOrg] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Patient State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Patient Tasks State
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Table Filter States
  const [disciplineFilter, setDisciplineFilter] = useState('All Disciplines');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<'task' | 'scheduleStart' | 'assignedTo'>('task');
  const [sortAsc, setSortAsc] = useState(true);

  // New Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('Communication Note');
  const [newTaskDiscipline, setNewTaskDiscipline] = useState('Nursing');
  const [newTaskStatus, setNewTaskStatus] = useState('Not Yet Due');
  const [newTaskScheduleStart, setNewTaskScheduleStart] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newTaskScheduleEnd, setNewTaskScheduleEnd] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('Kristin Siegel');
  const [newTaskComments, setNewTaskComments] = useState('Not Available');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Filter Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Status filter
      if (selectedStatus !== 'All') {
        const pStatus = (p.status || 'Active').toLowerCase();
        if (selectedStatus.toLowerCase() !== pStatus) return false;
      }

      // Search query (MRN, Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const revFullName = `${p.lastName || ''}, ${p.firstName || ''}`.toLowerCase();
        const mrn = (p.mrn || '').toLowerCase();
        if (!fullName.includes(q) && !revFullName.includes(q) && !mrn.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [patients, selectedStatus, searchQuery]);

  // Set initial selected patient if none selected
  useEffect(() => {
    if (!selectedPatientId && filteredPatients.length > 0) {
      setSelectedPatientId(filteredPatients[0].id);
    }
  }, [filteredPatients, selectedPatientId]);

  // Currently Selected Patient
  const currentPatient: Patient | undefined = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || filteredPatients[0] || patients[0];
  }, [patients, selectedPatientId, filteredPatients]);

  // Fetch tasks when selected patient changes
  useEffect(() => {
    if (!currentPatient?.id) {
      setTasks([]);
      return;
    }

    let isMounted = true;
    setIsLoadingTasks(true);

    api
      .getPatientTasks(currentPatient.id)
      .then((data) => {
        if (isMounted) {
          setTasks(data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load patient tasks:', err);
        if (isMounted) setTasks([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTasks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPatient?.id]);

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (disciplineFilter !== 'All Disciplines' && t.discipline !== disciplineFilter) {
          return false;
        }
        if (taskStatusFilter !== 'All' && t.status !== taskStatusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'scheduleStart') {
          return sortAsc
            ? new Date(valA).getTime() - new Date(valB).getTime()
            : new Date(valB).getTime() - new Date(valA).getTime();
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [tasks, disciplineFilter, taskStatusFilter, sortField, sortAsc]);

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    if (!currentPatient) return;
    if (!window.confirm('Are you sure you want to delete this clinical task?')) return;

    try {
      await api.deletePatientTask(currentPatient.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Add Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    try {
      setIsSubmittingTask(true);
      const created = await api.createPatientTask(currentPatient.id, {
        task: newTaskName,
        discipline: newTaskDiscipline,
        status: newTaskStatus,
        scheduleStart: newTaskScheduleStart,
        scheduleEnd: newTaskScheduleEnd,
        assignedTo: newTaskAssignedTo,
        comments: newTaskComments,
      });

      setTasks((prev) => [created, ...prev]);
      setIsAddTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Export Tasks to CSV
  const handleExportCSV = () => {
    if (!currentPatient) return;
    const headers = ['Task', 'Status', 'Schedule Start', 'Schedule End', 'Assigned To', 'Comments'];
    const rows = filteredTasks.map((t) => [
      `"${t.task}"`,
      `"${t.status}"`,
      `"${t.scheduleStart}"`,
      `"${t.scheduleEnd}"`,
      `"${t.assignedTo}"`,
      `"${t.comments}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patient_chart_${currentPatient.lastName}_${currentPatient.mrn}_tasks.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selected Action Menu for Task State
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Format Patient Helpers
  const patientDisplayName = currentPatient
    ? `${(currentPatient.lastName || '').toUpperCase()}, ${(currentPatient.firstName || '').toUpperCase()}`
    : 'NO PATIENT SELECTED';

  const patientAddress = currentPatient
    ? currentPatient.street
      ? `${currentPatient.street}, ${currentPatient.city || ''}, ${currentPatient.state || ''} ${currentPatient.zipCode || ''}`
      : currentPatient.address
        ? `${currentPatient.address.street || ''}${currentPatient.address.city ? `, ${currentPatient.address.city}` : ''}${currentPatient.address.state ? `, ${currentPatient.address.state}` : ''} ${currentPatient.address.zipCode || ''}`.trim()
        : 'Address Not Available'
    : '';

  const patientDobAge = currentPatient
    ? `${currentPatient.dob || 'DOB Not Available'} ${currentPatient.age ? `(${currentPatient.age})` : ''}`.trim()
    : '';

  const getTaskTextColor = (taskName: string) => {
    const lower = taskName.toLowerCase();
    if (lower.includes('communication note')) return 'text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer';
    if (lower.includes('face-to-face')) return 'text-rose-600 dark:text-rose-400 font-medium hover:underline cursor-pointer';
    return 'text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer';
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completed')) {
      return 'border border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-2xs';
    }
    if (s.includes('signature') || s.includes('returned')) {
      return 'border border-rose-400 text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 shadow-2xs';
    }
    // Not Yet Due or default
    return 'border border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-2xs';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Navigation Segment (Consistent across all pages) */}
      <div className="no-print print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl border border-pearl-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <Users className="text-rose-600 dark:text-rose-400 shrink-0" size={24} />
              <span>Patient Charts</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Electronic health records, clinical care team assignments, and patient chart timelines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Pill: Active vs All */}
          <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedStatus('Active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedStatus === 'Active'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Active ({patients.filter(p => (p.status || 'Active').toLowerCase() === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('All')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedStatus === 'All'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All ({patients.length})
            </button>
          </div>
          <button
            type="button"
            onClick={() => onNewPatient ? onNewPatient() : setIsNewPatientModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Admit Patient</span>
          </button>
        </div>
      </div>

      {/* Main Container: Split View */}
      <div className="rounded-2xl border border-pearl-200/80 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-2xs overflow-hidden flex flex-col lg:flex-row min-h-[720px] print:border-none print:shadow-none print:min-h-0 print:block print:overflow-visible">
        {/* Left Side: Filter Column & Patient Directory Cards */}
        <aside className="no-print print:hidden w-full lg:w-72 shrink-0 bg-white dark:bg-charcoal-850 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-charcoal-700 flex flex-col p-3 space-y-3 max-h-64 lg:max-h-none overflow-y-auto">
          {/* Organization Select */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Organization</span>
            </div>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="All">Organizations: All</option>
              <option value="Standards Home Care">Standards Home Care</option>
            </select>
          </div>

          {/* Branches Select */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Branches</span>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="All">Branches: All</option>
              <option value="Main Office">Main Office (Dallas)</option>
              <option value="North Branch">North Branch (Beverly, MA)</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Status</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
              <option value="Pending">Pending</option>
              <option value="All">All</option>
            </select>
          </div>

          {/* Patient Search Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Patient Search</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Patient Name or MRN"
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-red-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="flex-1 space-y-2 overflow-y-auto pt-2">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No patients found in database.
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === currentPatient?.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition text-left relative ${isSelected
                      ? 'bg-slate-100 dark:bg-charcoal-800 border-slate-400 dark:border-charcoal-600 shadow-xs'
                      : 'bg-white dark:bg-charcoal-900 border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-800/60'
                      }`}
                  >
                    {/* Badge */}
                    <span className="inline-block bg-[#8b1528] text-white text-[10px] font-semibold px-2 py-0.5 rounded leading-tight mb-1">
                      {patient.serviceLine === 'home_care'
                        ? 'Home Care'
                        : patient.serviceLine === 'hospice'
                          ? 'Hospice'
                          : 'Home Health'}
                    </span>
                    {/* Patient Name */}
                    <div className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                      {patient.lastName}, {patient.firstName}
                    </div>
                    {/* MRN */}
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      {patient.mrn}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: EHR Chart Details & Tasks Table */}
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto print:p-0 print:space-y-3 print:overflow-visible print:block">
          {currentPatient ? (
            <>
              {/* Formal Printable Healthcare Header (Only visible when printing) */}
              <div className="hidden print:block pb-4 mb-4 border-b-2 border-rose-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                      STANDARDS HOME CARE — CLINICAL MEDICAL RECORD
                    </h1>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      CareOrbit Central Healthcare Platform • Electronic Health Record (EHR)
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-600 font-mono">
                    <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="font-bold text-rose-700">CONFIDENTIAL MEDICAL DOCUMENT</div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 italic">
                  Notice: This clinical document contains Protected Health Information (PHI) under HIPAA & HITECH Act regulations. Unauthorized reproduction or disclosure is strictly prohibited.
                </div>
              </div>

              {/* Header EHR Card matching reference screenshot */}
              <div className="bg-white dark:bg-charcoal-850 rounded-xl border border-slate-200 dark:border-charcoal-700 p-4 shadow-xs">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left Avatar & Status */}
                  <div className="flex flex-col items-center justify-center shrink-0 pr-4 md:border-r border-slate-200 dark:border-charcoal-700 min-w-[130px]">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Standards Home Care
                    </span>
                    <div className="w-16 h-16 rounded-full bg-[#2d3142] flex items-center justify-center text-white shadow-inner mb-1.5">
                      <User size={36} className="text-slate-300" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {currentPatient.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Right Patient Details Content */}
                  <div className="flex-1 space-y-2.5">
                    {/* Top Row: Name, MRN, and Risk Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[#1f4e79] dark:text-sky-400 tracking-tight">
                        {patientDisplayName} <span className="text-sm font-semibold ml-1">MRN:{currentPatient.mrn}</span>
                      </h2>

                      {/* Gender Badge */}
                      {currentPatient.gender && (
                        <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">
                          {currentPatient.gender.charAt(0).toUpperCase() + currentPatient.gender.slice(1)}
                        </span>
                      )}

                      {/* Full Code Badge */}
                      {currentPatient.fullCode === true && (
                        <span className="border border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          Full Code
                        </span>
                      )}

                      {/* Fall Risk Badge */}
                      {currentPatient.fallRisk === true && (
                        <span className="border border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          Fall Risk
                        </span>
                      )}

                      {/* Hospitalization Risk */}
                      {currentPatient.hospitalizationRisk === true && (
                        <span className="border border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          Hospitalization Risk
                        </span>
                      )}

                      {/* Infection Risk */}
                      {currentPatient.infectionRisk === true && (
                        <span className="border border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          Infection Risk
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Location, DOB, Phones */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      {patientAddress && (
                        <>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                            <MapPin size={13} className="text-red-600 shrink-0" />
                            <span>{patientAddress}</span>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      {patientDobAge && (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-500 shrink-0" />
                            <span>{patientDobAge}</span>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center gap-1 text-[#1f4e79] dark:text-sky-400 font-semibold">
                        <Phone size={13} className="text-red-600 shrink-0" />
                        <span>{currentPatient.phone || 'Phone Not Available'}</span>
                      </span>
                      {currentPatient.secondaryPhone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone size={13} className="text-red-600 shrink-0" />
                            <span>{currentPatient.secondaryPhone}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* 6-Grid Clinical Episode & Contact Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 pt-2 border-t border-slate-100 dark:border-charcoal-700 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Episode</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.episodeStart && currentPatient.episodeEnd
                            ? `${currentPatient.episodeStart} - ${currentPatient.episodeEnd}`
                            : currentPatient.episodeStart || 'Not Available'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Start of Care Date</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.startOfCareDate || currentPatient.admissionDate || 'Not Available'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Attending Physician</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.attendingPhysician || 'Not Available'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Insurance Name/ID</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.insuranceName || currentPatient.policyNumber
                            ? `${currentPatient.insuranceName || ''} ${currentPatient.policyNumber ? `(${currentPatient.policyNumber})` : ''}`.trim()
                            : 'Not Available'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Primary Contact</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.primaryContact || 'Not Available'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Secondary Contact</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentPatient.secondaryContact || 'Not Available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Filter Bar: All Disciplines & All Status */}
              <div className="no-print print:hidden flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-charcoal-850 p-3 rounded-xl border border-slate-200 dark:border-charcoal-700 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* Discipline Dropdown */}
                  <select
                    value={disciplineFilter}
                    onChange={(e) => setDisciplineFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-600"
                  >
                    <option value="All Disciplines">All Disciplines</option>
                    <option value="Nursing">Nursing</option>
                    <option value="PT">PT</option>
                    <option value="OT">OT</option>
                    <option value="ST">ST</option>
                    <option value="HHA">HHA</option>
                    <option value="MSW">MSW</option>
                    <option value="Physician Liaison">Physician Liaison</option>
                  </select>

                  {/* Status Dropdown */}
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-600"
                  >
                    <option value="All">All</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Yet Due">Not Yet Due</option>
                    <option value="Returned w/ Physician Signature">Returned w/ Physician Signature</option>
                    <option value="Submitted With Signature">Submitted With Signature</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Right Actions: Export CSV, Print, Add Task */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-300 transition"
                    title="Export Tasks to CSV"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-300 transition"
                    title="Print Chart"
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-[#1f4e79] hover:bg-[#183d5f] text-white shadow-xs transition"
                  >
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Patient Tasks Table */}
              <div className="bg-white dark:bg-charcoal-850 rounded-xl border border-slate-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    {/* Header with light lavender background matching screenshot */}
                    <thead className="bg-[#ede9fe]/60 dark:bg-charcoal-800 border-b border-indigo-100 dark:border-charcoal-700">
                      <tr>
                        <th
                          onClick={() => {
                            setSortField('task');
                            setSortAsc(!sortAsc);
                          }}
                          className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-indigo-100/60 select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Task</span>
                            <ArrowUpDown size={12} className="text-slate-500" />
                          </div>
                        </th>
                        <th className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 text-center min-w-[210px]">
                          Status
                        </th>
                        <th
                          onClick={() => {
                            setSortField('scheduleStart');
                            setSortAsc(!sortAsc);
                          }}
                          className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-indigo-100/60 select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Schedule Start</span>
                            <ArrowUpDown size={12} className="text-slate-500" />
                          </div>
                        </th>
                        <th className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                          Schedule End
                        </th>
                        <th
                          onClick={() => {
                            setSortField('assignedTo');
                            setSortAsc(!sortAsc);
                          }}
                          className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-indigo-100/60 select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Assigned To</span>
                            <ArrowUpDown size={12} className="text-slate-500" />
                          </div>
                        </th>
                        <th className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                          Comments
                        </th>
                        <th className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-charcoal-750">
                      {isLoadingTasks ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            Loading patient EHR tasks from database...
                          </td>
                        </tr>
                      ) : filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            No tasks found for this patient chart.
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50 dark:hover:bg-charcoal-800/50 transition-colors"
                          >
                            {/* Task Column */}
                            <td className="px-4 py-3">
                              <span className={getTaskTextColor(t.task)}>
                                {t.task}
                              </span>
                            </td>

                            {/* Status Column */}
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold text-center whitespace-nowrap leading-none ${getStatusBadgeStyle(
                                    t.status
                                  )}`}
                                >
                                  {t.status}
                                </span>
                              </div>
                            </td>

                            {/* Schedule Start */}
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {t.scheduleStart}
                            </td>

                            {/* Schedule End */}
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {t.scheduleEnd}
                            </td>

                            {/* Assigned To */}
                            <td className="px-4 py-3">
                              <span className="text-[#1f4e79] dark:text-sky-400 font-medium hover:underline cursor-pointer">
                                {t.assignedTo}
                              </span>
                            </td>

                            {/* Comments */}
                            <td className="px-4 py-3 italic text-slate-400 dark:text-slate-500">
                              {t.comments || 'Not Available'}
                            </td>

                            {/* Actions Column matching reference buttons */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 relative">
                                <button
                                  onClick={handleExportCSV}
                                  title="Download Task Documentation"
                                  className="p-1 rounded text-sky-600 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-charcoal-700 transition"
                                >
                                  <Download size={13} />
                                </button>
                                <button
                                  onClick={() => window.print()}
                                  title="Print Task"
                                  className="p-1 rounded text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-charcoal-700 transition"
                                >
                                  <Printer size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  title="Delete Task"
                                  className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-charcoal-700 transition"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={() => setActiveMenuTaskId(activeMenuTaskId === t.id ? null : t.id)}
                                    title="More options"
                                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-charcoal-700 transition"
                                  >
                                    <MoreHorizontal size={13} />
                                  </button>
                                  {activeMenuTaskId === t.id && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-lg shadow-lg z-30 py-1 text-left text-xs">
                                      <button
                                        onClick={() => {
                                          setActiveMenuTaskId(null);
                                          window.print();
                                        }}
                                        className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                                      >
                                        <Printer size={12} />
                                        <span>Print Task</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveMenuTaskId(null);
                                          handleExportCSV();
                                        }}
                                        className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                                      >
                                        <Download size={12} />
                                        <span>Export Task</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveMenuTaskId(null);
                                          handleDeleteTask(t.id);
                                        }}
                                        className="w-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 flex items-center gap-1.5"
                                      >
                                        <Trash2 size={12} />
                                        <span>Delete Task</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Printable Clinician Signature & Certification Block */}
              <div className="hidden print:block mt-8 pt-4 border-t border-slate-400 text-xs">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-b border-slate-800 pb-1 mb-1 h-8"></div>
                    <div className="font-bold text-slate-800">Attending / Field Clinician Signature</div>
                    <div className="text-[11px] text-slate-500">Date: ____________________ License #: ____________</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-800 pb-1 mb-1 h-8"></div>
                    <div className="font-bold text-slate-800">Clinical Supervisor / Medical Director Review</div>
                    <div className="text-[11px] text-slate-500">Date: ____________________ Alexandria Nelson, RN</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Please select a patient from the left panel.
            </div>
          )}

          {/* Reference Website Footer */}
          <footer className="no-print print:hidden py-4 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-charcoal-700 mt-auto">
            Axxess © 2026 | Release Version: 1.0.3868.0 | Environment: Production | Built in Dallas, Texas
          </footer>
        </main>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-2xl shadow-xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50 dark:bg-charcoal-900">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Add Clinical Task • {currentPatient?.lastName}, {currentPatient?.firstName}
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. Coordination of Care, LPN - Oral Med. Management"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline
                  </label>
                  <select
                    value={newTaskDiscipline}
                    onChange={(e) => setNewTaskDiscipline(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                  >
                    <option value="Nursing">Nursing</option>
                    <option value="PT">PT</option>
                    <option value="OT">OT</option>
                    <option value="ST">ST</option>
                    <option value="HHA">HHA</option>
                    <option value="MSW">MSW</option>
                    <option value="Physician Liaison">Physician Liaison</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                  >
                    <option value="Not Yet Due">Not Yet Due</option>
                    <option value="Completed">Completed</option>
                    <option value="Returned w/ Physician Signature">Returned w/ Physician Signature</option>
                    <option value="Submitted With Signature">Submitted With Signature</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule Start
                  </label>
                  <input
                    type="date"
                    value={newTaskScheduleStart}
                    onChange={(e) => setNewTaskScheduleStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule End
                  </label>
                  <input
                    type="date"
                    value={newTaskScheduleEnd}
                    onChange={(e) => setNewTaskScheduleEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  placeholder="e.g. Mary Kyalikunda"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comments / Notes
                </label>
                <textarea
                  rows={2}
                  value={newTaskComments}
                  onChange={(e) => setNewTaskComments(e.target.value)}
                  placeholder="Not Available"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-charcoal-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-charcoal-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white flex items-center gap-1 shadow-xs disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{isSubmittingTask ? 'Saving...' : 'Add Task to Chart'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
