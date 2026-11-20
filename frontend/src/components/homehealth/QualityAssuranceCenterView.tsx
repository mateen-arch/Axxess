import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Heart,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  Info,
  X,
  Send,
  MessageSquare,
  ShieldCheck,
  Eye,
  Printer,
  Tag,
  Sliders,
  Users,
  Award,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';

interface QualityAssuranceCenterViewProps {
  onBack: () => void;
  onOpenTask?: (taskId: string) => void;
}

export interface QATaskItem {
  id: string;
  patientId?: string;
  patientName: string;
  mrn: string;
  eventDate: string;
  task: string;
  taskCategory: 'OASIS' | 'Order' | 'Assessment' | 'Communication Notes' | 'Skilled Nursing' | 'HHA / PCW / PCA';
  status: 'Submitted With Signature' | 'Returned' | 'Approved';
  assignedTo: string;
  branch: string;
  payer: string;
  patientStatus?: string;
  tags?: string[];
  notes?: string;
  hasOasisAnalysis?: boolean;
  hasCaseMix?: boolean;
  hasMarginCalc?: boolean;
  isCareVisit?: boolean;
}

export const QualityAssuranceCenterView: React.FC<QualityAssuranceCenterViewProps> = ({
  onBack,
  onOpenTask,
}) => {
  const { organization } = useHealthcare();

  // Task list from database
  const [taskList, setTaskList] = useState<QATaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters state
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('All Tasks');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Pending' | 'Returned' | 'Approved'>('Pending');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedPayer, setSelectedPayer] = useState('All');
  const [patientStatus, setPatientStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Grouping state
  const [groupingMode, setGroupingMode] = useState<'Patient' | 'Date' | 'Task' | 'Clinician'>('Patient');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Modals & Popups
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [detailModalTask, setDetailModalTask] = useState<QATaskItem | null>(null);
  const [notesModalTask, setNotesModalTask] = useState<QATaskItem | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [activeAnalysisModal, setActiveAnalysisModal] = useState<'oasis' | 'case-mix' | 'margin' | 'care' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // OASIS validation state inside modal
  const [oasisValidated, setOasisValidated] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real QA Tasks from PostgreSQL
  const fetchQATasks = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const data = await api.getQATasks();
      setTaskList(data || []);

      if (isManual) {
        showToast('QA Center task queue refreshed from database.');
      }
    } catch (err: any) {
      console.error('Error fetching QA tasks:', err);
      showToast('Failed to load QA tasks: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQATasks();
  }, []);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedBranch('All Branches');
    setStartDate('');
    setEndDate('');
    setSelectedTaskFilter('All Tasks');
    setSelectedStatus('Pending');
    setSelectedTag('All');
    setSelectedPayer('All');
    setPatientStatus('All');
    setSearchQuery('');
    showToast('All search filters reset to default.');
  };

  // Toggle group collapse
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter tasks with full real-time matching
  const filteredTasks = useMemo(() => {
    return taskList.filter((item) => {
      // Status filter
      if (selectedStatus === 'Pending' && item.status !== 'Submitted With Signature') return false;
      if (selectedStatus === 'Returned' && item.status !== 'Returned') return false;
      if (selectedStatus === 'Approved' && item.status !== 'Approved') return false;

      // Branch filter
      if (selectedBranch !== 'All Branches' && item.branch !== selectedBranch) return false;

      // Payer filter
      if (selectedPayer !== 'All' && !item.payer.toLowerCase().includes(selectedPayer.toLowerCase())) return false;

      // Task category filter
      if (selectedTaskFilter !== 'All Tasks' && item.taskCategory !== selectedTaskFilter) return false;

      // Patient status filter
      if (patientStatus !== 'All' && item.patientStatus && item.patientStatus.toLowerCase() !== patientStatus.toLowerCase()) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'All') {
        const itemTags = item.tags || [];
        if (!itemTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
          return false;
        }
      }

      // Date Range filter
      if (startDate) {
        const itemDate = new Date(item.eventDate);
        const start = new Date(startDate);
        if (itemDate < start) return false;
      }
      if (endDate) {
        const itemDate = new Date(item.eventDate);
        const end = new Date(endDate);
        if (itemDate > end) return false;
      }

      // Search Query filter (matches patient name, MRN, clinician, task, or notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesMrn = item.mrn.toLowerCase().includes(q);
        const matchesAssigned = item.assignedTo.toLowerCase().includes(q);
        const matchesTask = item.task.toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMrn && !matchesAssigned && !matchesTask && !matchesNotes) return false;
      }

      return true;
    });
  }, [taskList, selectedStatus, selectedBranch, selectedPayer, selectedTaskFilter, patientStatus, selectedTag, startDate, endDate, searchQuery]);

  // Grouping computation
  const groupedTasks = useMemo(() => {
    const groups: Record<string, QATaskItem[]> = {};

    filteredTasks.forEach((task) => {
      let key = '';
      if (groupingMode === 'Patient') {
        key = `Patient: ${task.patientName} (MRN: #${task.mrn})`;
      } else if (groupingMode === 'Date') {
        key = `Date: ${task.eventDate}`;
      } else if (groupingMode === 'Task') {
        key = `Task: ${task.taskCategory} - ${task.task}`;
      } else if (groupingMode === 'Clinician') {
        key = `Clinician: ${task.assignedTo}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [filteredTasks, groupingMode]);

  // Real database counts for meters and right-hand breakdown panel
  const pendingCount = useMemo(() => {
    return taskList.filter((t) => t.status === 'Submitted With Signature').length;
  }, [taskList]);

  const returnedCount = useMemo(() => {
    return taskList.filter((t) => t.status === 'Returned').length;
  }, [taskList]);

  const categoryCounts = useMemo(() => {
    const counts = {
      oasis: 0,
      order: 0,
      assessment: 0,
      commNotes: 0,
      skilledNursing: 0,
      hha: 0,
    };
    taskList.forEach((t) => {
      if (t.status === 'Submitted With Signature') {
        if (t.taskCategory === 'OASIS') counts.oasis++;
        else if (t.taskCategory === 'Order') counts.order++;
        else if (t.taskCategory === 'Assessment') counts.assessment++;
        else if (t.taskCategory === 'Communication Notes') counts.commNotes++;
        else if (t.taskCategory === 'HHA / PCW / PCA') counts.hha++;
        else counts.skilledNursing++;
      }
    });
    return counts;
  }, [taskList]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(filteredTasks.map((t) => t.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleSelectGroup = (groupTasks: QATaskItem[], checked: boolean) => {
    const next = new Set(selectedTaskIds);
    groupTasks.forEach((t) => {
      if (checked) next.add(t.id);
      else next.delete(t.id);
    });
    setSelectedTaskIds(next);
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTaskIds(next);
  };

  // Actions with Database Persistence
  const handleApproveSelected = async () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to approve.');
      return;
    }
    const ids = Array.from(selectedTaskIds);
    try {
      await api.batchApproveQATasks(ids);
      setTaskList((prev) =>
        prev.map((t) => (selectedTaskIds.has(t.id) ? { ...t, status: 'Approved' } : t))
      );
      setSelectedTaskIds(new Set());
      showToast(`Successfully approved ${ids.length} task(s) for billing.`);
    } catch (err: any) {
      showToast('Failed to approve tasks: ' + err.message);
    }
  };

  const handleReturnSelected = () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to return.');
      return;
    }
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    const ids = Array.from(selectedTaskIds);
    try {
      await api.batchReturnQATasks(ids, returnReason);
      setTaskList((prev) =>
        prev.map((t) =>
          selectedTaskIds.has(t.id)
            ? { ...t, status: 'Returned', notes: returnReason ? `Returned: ${returnReason}` : t.notes }
            : t
        )
      );
      setSelectedTaskIds(new Set());
      setReturnModalOpen(false);
      setReturnReason('');
      showToast(`Returned ${ids.length} task(s) to clinician for correction.`);
    } catch (err: any) {
      showToast('Failed to return tasks: ' + err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to delete.');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.size} task(s)?`)) return;
    const ids = Array.from(selectedTaskIds);
    try {
      await api.batchDeleteQATasks(ids);
      setTaskList((prev) => prev.filter((t) => !selectedTaskIds.has(t.id)));
      setSelectedTaskIds(new Set());
      showToast(`Deleted ${ids.length} task(s) from QA Center.`);
    } catch (err: any) {
      showToast('Failed to delete tasks: ' + err.message);
    }
  };

  const handleApproveSingleTask = async (task: QATaskItem) => {
    try {
      await api.updateQATaskStatus(task.id, 'Approved');
      setTaskList((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'Approved' } : t))
      );
      setDetailModalTask(null);
      showToast(`Task "${task.task}" approved successfully.`);
    } catch (err: any) {
      showToast('Failed to approve task: ' + err.message);
    }
  };

  const handleReturnSingleTask = async (task: QATaskItem) => {
    try {
      const reason = prompt('Please enter the reason for returning this task to the clinician:');
      if (reason === null) return; // user cancelled

      await api.updateQATaskStatus(task.id, 'Returned', reason || 'Returned for revision');
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: 'Returned', notes: reason ? `Returned: ${reason}` : t.notes }
            : t
        )
      );
      setDetailModalTask(null);
      showToast(`Task "${task.task}" marked as Returned to clinician.`);
    } catch (err: any) {
      showToast('Failed to return task: ' + err.message);
    }
  };

  // Open Notes & Tags Modal
  const handleOpenNotesModal = (task: QATaskItem) => {
    setNotesModalTask(task);
    setEditNotesText(task.notes || '');
    setEditTagsList(task.tags || []);
    setNewTagInput('');
  };

  const handleSaveNotesTags = async () => {
    if (!notesModalTask) return;
    try {
      await api.updateQATaskTagsNotes(notesModalTask.id, {
        notes: editNotesText,
        tags: editTagsList,
      });

      setTaskList((prev) =>
        prev.map((t) =>
          t.id === notesModalTask.id
            ? { ...t, notes: editNotesText, tags: editTagsList }
            : t
        )
      );

      setNotesModalTask(null);
      showToast('Notes and tags updated successfully.');
    } catch (err: any) {
      showToast('Failed to update notes: ' + err.message);
    }
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!editTagsList.includes(newTagInput.trim())) {
      setEditTagsList([...editTagsList, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTagsList(editTagsList.filter((t) => t !== tagToRemove));
  };

  // Export to Excel / CSV
  const handleExportToExcel = () => {
    if (filteredTasks.length === 0) {
      showToast('No tasks match the active filters to export.');
      return;
    }

    const headers = ['Patient Name', 'MRN', 'Event Date', 'Task', 'Category', 'Status', 'Assigned To', 'Branch', 'Payer', 'Tags', 'Notes'];
    const rows = filteredTasks.map((t) => [
      `"${t.patientName.replace(/"/g, '""')}"`,
      `"${t.mrn}"`,
      `"${t.eventDate}"`,
      `"${t.task.replace(/"/g, '""')}"`,
      `"${t.taskCategory}"`,
      `"${t.status}"`,
      `"${t.assignedTo.replace(/"/g, '""')}"`,
      `"${t.branch.replace(/"/g, '""')}"`,
      `"${t.payer.replace(/"/g, '""')}"`,
      `"${(t.tags || []).join('; ')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QA_Center_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTasks.length} QA tasks to Excel (.csv) successfully.`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
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
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Home
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Quality Assurance (QA) Center
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Hilder Magessa RN • Clinical Quality Assurance Review
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => fetchQATasks(true)}
            disabled={refreshing}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-rose-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Stats & Filters Card */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all dark:border-charcoal-700/80 dark:bg-charcoal-800/90 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  Quality Assurance (QA) Center - PENDING
                </h1>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  {pendingCount} Pending QA Review
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review, verify, return, or approve clinical notes, OASIS assessments, and orders before billing submission.
              </p>
            </div>

            {/* Donut Meters calculated directly from real database records */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 self-start lg:self-auto">
              {/* PENDING METER */}
              <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5 pr-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-sky-200 dark:text-sky-950"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-sky-500 dark:text-sky-400"
                      strokeDasharray={`${taskList.length > 0 ? Math.round((pendingCount / taskList.length) * 100) : 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-900 dark:text-white">
                    {pendingCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-black tracking-wider text-sky-600 dark:text-sky-400 uppercase">
                    PENDING
                  </div>
                  <div className="text-[10px] text-slate-400">Awaiting QA</div>
                </div>
              </div>

              {/* RETURNED METER */}
              <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-2.5 pr-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-amber-200 dark:text-amber-950"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-500 dark:text-amber-400"
                      strokeDasharray={`${taskList.length > 0 ? Math.round((returnedCount / taskList.length) * 100) : 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-900 dark:text-white">
                    {returnedCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-black tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                    RETURNED
                  </div>
                  <div className="text-[10px] text-slate-400">Needs Edit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Action Navbar */}
          <div className="mt-6 space-y-3.5 border-t border-pearl-200/80 pt-4 dark:border-charcoal-700/80">
            {/* Row 1: Primary Filter Selectors */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
              {/* Branch */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                >
                  <option value="All Branches">All Branches</option>
                  <option value="Standards Home Care">Standards Home Care</option>
                </select>
              </div>

              {/* Date Range Start & End */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Date Range
                </label>
                <div className="flex h-9 items-center gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Tasks
                </label>
                <select
                  value={selectedTaskFilter}
                  onChange={(e) => setSelectedTaskFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                >
                  <option value="All Tasks">All Tasks</option>
                  <option value="OASIS">OASIS</option>
                  <option value="Order">Order</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Communication Notes">Communication Notes</option>
                  <option value="Skilled Nursing">Skilled Nursing</option>
                  <option value="HHA / PCW / PCA">HHA / PCW / PCA</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                >
                  <option value="Pending">Pending QA</option>
                  <option value="Returned">Returned</option>
                  <option value="Approved">Approved</option>
                  <option value="All">All Statuses</option>
                </select>
              </div>

              {/* Payer */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Payer
                </label>
                <select
                  value={selectedPayer}
                  onChange={(e) => setSelectedPayer(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                >
                  <option value="All">All Payers</option>
                  <option value="Medicare Part A">Medicare Part A</option>
                  <option value="MassHealth Senior Care Options">MassHealth SCO</option>
                  <option value="COMMONWEALTH CARE ALLIANCE">Commonwealth Care</option>
                  <option value="MEDICAID">Medicaid</option>
                  <option value="BLUE CROSS BLUE SHIELD">Blue Cross Blue Shield</option>
                </select>
              </div>
            </div>

            {/* Row 2: Search, Secondary Filters, Insights Rectangle & Export/Refresh next to it */}
            <div className="flex flex-col gap-3 pt-2 xl:flex-row xl:items-center xl:justify-between">
              {/* Left Controls: Search + Patient Status + Tags + Reset Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative min-w-[220px] sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient, MRN, clinician..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Patient Status Pill Select */}
                <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient:</span>
                  <select
                    value={patientStatus}
                    onChange={(e) => setPatientStatus(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                  >
                    <option value="All">All Patients</option>
                    <option value="Active">Active</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>

                {/* Tags Pill Select */}
                <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 dark:border-charcoal-600 dark:bg-charcoal-750">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tag:</span>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                  >
                    <option value="All">All Tags</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Recertification">Recertification</option>
                    <option value="Wound Care">Wound Care</option>
                    <option value="OASIS-E">OASIS-E</option>
                    <option value="Order Required">Order Required</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                {/* Reset All Filters Button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex h-9 items-center gap-1 rounded-xl border border-pearl-200 bg-pearl-50 px-2.5 text-xs font-bold text-slate-600 hover:border-pearl-300 hover:text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer transition"
                  title="Reset all search filters"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Right Controls: Rectangle enclosing OASIS, Case-Mix, Margin, CareOrbit CARE + Refresh and Export next to it */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* The Rectangle enclosing the 4 analysis options */}
                <div className="flex items-center gap-1 rounded-xl border border-pearl-200 bg-pearl-100/70 p-1 dark:border-charcoal-700 dark:bg-charcoal-750">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAnalysisModal('oasis');
                      setOasisValidated(false);
                    }}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-white px-2.5 text-[11px] font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 hover:border-emerald-400 active:scale-95 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                    title="Open OASIS Analysis & CMS Consistency Validation"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>OASIS Analysis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnalysisModal('case-mix')}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-indigo-300/80 bg-white px-2.5 text-[11px] font-bold text-indigo-700 shadow-2xs transition-all hover:bg-indigo-50 hover:border-indigo-400 active:scale-95 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer"
                    title="Open PDGM Case-Mix Weight & Episodic Rate Analyzer"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Case-Mix Analysis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnalysisModal('margin')}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-sky-300/80 bg-white px-2.5 text-[11px] font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-50 hover:border-sky-400 active:scale-95 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300 cursor-pointer"
                    title="Open Gross Margin Profitability Calculator"
                  >
                    <Percent className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Gross Margin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnalysisModal('care')}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-teal-300/80 bg-white px-2.5 text-[11px] font-bold text-teal-700 shadow-2xs transition-all hover:bg-teal-50 hover:border-teal-400 active:scale-95 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-300 cursor-pointer"
                    title="Open CareOrbit CARE Staffing Coverage Network"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current text-teal-600 dark:text-teal-400" />
                    <span>CareOrbit CARE</span>
                  </button>
                </div>

                {/* Refresh Icon Button - MOVED NEXT TO RECTANGLE OUTSIDE */}
                <button
                  type="button"
                  title="Refresh QA queue"
                  onClick={() => fetchQATasks(true)}
                  disabled={refreshing}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-300 bg-white text-slate-700 shadow-2xs transition-all hover:bg-pearl-100 hover:text-slate-900 active:scale-95 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-300 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
                </button>

                {/* Export to Excel - MOVED NEXT TO RECTANGLE OUTSIDE */}
                <button
                  type="button"
                  onClick={handleExportToExcel}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-rose-800 active:scale-95 cursor-pointer"
                  title="Export filtered QA tasks to CSV spreadsheet"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
                  <span className="whitespace-nowrap">Export to Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout: Table on Left + Breakdown Sidebar on Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {/* Table & Controls: 3 cols in lg / 4 cols in xl */}
          <div className="space-y-4 lg:col-span-3 xl:col-span-4">
            {/* Action Strip: Grouping Tabs & Batch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pearl-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/90">
              {/* Grouping Modes */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-pearl-100 p-1 dark:bg-charcoal-700">
                {(['Patient', 'Date', 'Task', 'Clinician'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGroupingMode(mode)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      groupingMode === mode
                        ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-500'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    Group By {mode}
                  </button>
                ))}
              </div>

              {/* Batch Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={selectedTaskIds.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Selected ({selectedTaskIds.size})</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnSelected}
                  disabled={selectedTaskIds.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Return Selected</span>
                </button>
                <button
                  type="button"
                  onClick={handleApproveSelected}
                  disabled={selectedTaskIds.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Selected</span>
                </button>
              </div>
            </div>

            {/* Quality Assurance Table Container */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/95">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                    <tr>
                      <th className="w-8 py-3.5 pl-3">
                        <input
                          type="checkbox"
                          checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                        />
                      </th>
                      <th className="py-3.5 px-3">Patient Name</th>
                      <th className="py-3.5 px-2">MRN</th>
                      <th className="py-3.5 px-3">Event Date</th>
                      <th className="py-3.5 px-2 text-center">Insights</th>
                      <th className="py-3.5 px-3">Task Details</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-2 text-center">Tags / Notes</th>
                      <th className="py-3.5 px-3">Assigned Clinician</th>
                      <th className="py-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="py-24 text-center">
                          <RefreshCw size={24} className="animate-spin text-rose-600 mx-auto mb-2" />
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Loading Quality Assurance tasks from database...
                          </div>
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <div className="text-sm font-bold text-slate-500">No QA tasks found</div>
                          <p className="mt-1 text-xs">Try adjusting your status filter or search parameters.</p>
                        </td>
                      </tr>
                    ) : (
                      Object.entries(groupedTasks).map(([groupTitle, tasksInGroup]) => {
                        const isCollapsed = !!collapsedGroups[groupTitle];
                        const allGroupSelected = tasksInGroup.every((t) => selectedTaskIds.has(t.id));

                        return (
                          <React.Fragment key={groupTitle}>
                            {/* Group Header Row */}
                            <tr className="bg-pearl-50/80 border-t border-b border-pearl-200/90 dark:bg-charcoal-800/80 dark:border-charcoal-700">
                              <td className="py-2 pl-3">
                                <input
                                  type="checkbox"
                                  checked={allGroupSelected}
                                  onChange={(e) => handleSelectGroup(tasksInGroup, e.target.checked)}
                                  className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                                />
                              </td>
                              <td colSpan={8} className="py-2 px-3">
                                <button
                                  type="button"
                                  onClick={() => toggleGroup(groupTitle)}
                                  className="flex items-center gap-2 text-left hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                >
                                  {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                  )}
                                  <span className="font-extrabold tracking-wide text-slate-900 dark:text-white">
                                    {groupTitle}
                                  </span>
                                  <span className="rounded-full bg-pearl-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-600 dark:text-slate-200">
                                    {tasksInGroup.length} task{tasksInGroup.length === 1 ? '' : 's'}
                                  </span>
                                </button>
                              </td>
                              <td className="py-2 pr-4 text-right text-[11px] text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => toggleGroup(groupTitle)}
                                  className="text-xs text-rose-600 hover:underline dark:text-rose-400 cursor-pointer font-bold"
                                >
                                  {isCollapsed ? 'Expand' : 'Collapse'}
                                </button>
                              </td>
                            </tr>

                            {/* Group Rows (when not collapsed) */}
                            {!isCollapsed &&
                              tasksInGroup.map((task) => {
                                const isSelected = selectedTaskIds.has(task.id);

                                return (
                                  <tr
                                    key={task.id}
                                    className={`border-b border-pearl-100 transition-colors dark:border-charcoal-700/60 ${
                                      isSelected
                                        ? 'bg-rose-50/60 dark:bg-rose-950/20'
                                        : 'hover:bg-pearl-50/70 dark:hover:bg-charcoal-750/50'
                                    }`}
                                  >
                                    {/* Checkbox */}
                                    <td className="py-2.5 pl-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleSelectOne(task.id)}
                                        className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                                      />
                                    </td>

                                    {/* Patient Name */}
                                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                      {task.patientName}
                                    </td>

                                    {/* MRN */}
                                    <td className="py-2.5 px-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                      {task.mrn}
                                    </td>

                                    {/* Event Date */}
                                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                      {task.eventDate}
                                    </td>

                                    {/* Analysis Icons */}
                                    <td className="py-2.5 px-2 text-center">
                                      <div className="inline-flex items-center gap-1 opacity-75 hover:opacity-100">
                                        {task.hasOasisAnalysis && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveAnalysisModal('oasis')}
                                            title="OASIS Analysis Active"
                                            className="hover:scale-110 transition cursor-pointer"
                                          >
                                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                                          </button>
                                        )}
                                        {task.hasCaseMix && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveAnalysisModal('case-mix')}
                                            title="Case-Mix Computed"
                                            className="hover:scale-110 transition cursor-pointer"
                                          >
                                            <DollarSign className="h-3 w-3 text-indigo-600" />
                                          </button>
                                        )}
                                        {task.hasMarginCalc && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveAnalysisModal('margin')}
                                            title="Gross Margin Ready"
                                            className="hover:scale-110 transition cursor-pointer"
                                          >
                                            <Percent className="h-3 w-3 text-sky-600" />
                                          </button>
                                        )}
                                        {task.isCareVisit && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveAnalysisModal('care')}
                                            title="CareOrbit CARE Network"
                                            className="hover:scale-110 transition cursor-pointer"
                                          >
                                            <Heart className="h-3 w-3 text-teal-600 fill-current" />
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    {/* Task */}
                                    <td className="py-2.5 px-3">
                                      <button
                                        type="button"
                                        onClick={() => setDetailModalTask(task)}
                                        className="text-left font-medium text-sky-600 hover:underline dark:text-sky-400 cursor-pointer"
                                      >
                                        {task.task}
                                      </button>
                                    </td>

                                    {/* Status - CENTERED AND BALANCED TEXT */}
                                    <td className="py-2.5 px-3 text-center">
                                      <span
                                        className={`inline-flex flex-col items-center justify-center text-center px-3 py-1 rounded-full text-[10px] font-bold leading-tight ${
                                          task.status === 'Submitted With Signature'
                                            ? 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/80'
                                            : task.status === 'Approved'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80'
                                        }`}
                                      >
                                        {task.status === 'Submitted With Signature' ? (
                                          <>
                                            <span className="block text-center w-full">Submitted With</span>
                                            <span className="block text-center w-full">Signature</span>
                                          </>
                                        ) : (
                                          <span>{task.status}</span>
                                        )}
                                      </span>
                                    </td>

                                    {/* Tags / Notes - CLICK OPENS MODAL INSTEAD OF TOAST */}
                                    <td className="py-2.5 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenNotesModal(task)}
                                        className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 dark:hover:text-slate-200 cursor-pointer transition"
                                        title="View or Edit Tags and Clinical Notes"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-rose-600" />
                                        {(task.tags && task.tags.length > 0) && (
                                          <span className="rounded-full bg-rose-100 px-1.5 text-[9px] font-black text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                                            {task.tags.length}
                                          </span>
                                        )}
                                      </button>
                                    </td>

                                    {/* Assigned To */}
                                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-200 font-medium">
                                      {task.assignedTo}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => setDetailModalTask(task)}
                                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer transition"
                                      >
                                        Review
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Itemized Pending Breakdown from Database */}
          <div className="space-y-4 lg:col-span-1 xl:col-span-1">
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
              <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
                <h2 className="text-sm font-black tracking-wider text-sky-600 uppercase dark:text-sky-400">
                  PENDING QUEUE
                </h2>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  {pendingCount} Total
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'OASIS', count: categoryCounts.oasis, filterVal: 'OASIS', color: 'text-indigo-600' },
                  { label: 'Order', count: categoryCounts.order, filterVal: 'Order', color: 'text-rose-600' },
                  { label: 'Assessment', count: categoryCounts.assessment, filterVal: 'Assessment', color: 'text-teal-600' },
                  {
                    label: 'Communication Notes',
                    count: categoryCounts.commNotes,
                    filterVal: 'Communication Notes',
                    color: 'text-emerald-600',
                  },
                  {
                    label: 'Skilled Nursing',
                    count: categoryCounts.skilledNursing,
                    filterVal: 'Skilled Nursing',
                    color: 'text-sky-600',
                  },
                  {
                    label: 'HHA / PCW / PCA',
                    count: categoryCounts.hha,
                    filterVal: 'HHA / PCW / PCA',
                    color: 'text-purple-600',
                  },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      setSelectedTaskFilter(cat.filterVal);
                      setSelectedStatus('Pending');
                    }}
                    className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs transition cursor-pointer ${
                      selectedTaskFilter === cat.filterVal && selectedStatus === 'Pending'
                        ? 'bg-rose-50 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'text-slate-600 hover:bg-pearl-50 dark:text-slate-300 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    <span className="font-semibold">{cat.label}</span>
                    <span className={`font-black ${cat.color}`}>{cat.count}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTaskFilter('All Tasks');
                  setSelectedStatus('Pending');
                }}
                className="mt-3 w-full rounded-xl border border-pearl-200 bg-pearl-50/60 py-2 text-center text-xs font-bold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300 cursor-pointer"
              >
                View All Pending ({pendingCount})
              </button>
            </div>

            {/* Quick QA Guideline Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-gradient-to-br from-rose-500/5 to-rose-600/10 p-4 text-xs dark:border-charcoal-700/80 dark:from-rose-950/20 dark:to-charcoal-800">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                <ShieldCheck className="h-4 w-4" />
                <span>QA Review Standard</span>
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Per CMS Conditions of Participation, all clinical notes must have an electronic signature, date/time stamp, and care plan goals addressed prior to export.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Return Selected Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <RotateCcw className="h-5 w-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">
                  Return Tasks to Clinician
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are about to return <strong className="text-rose-600">{selectedTaskIds.size} task(s)</strong> to the assigned clinicians for revisions. Please provide the reason or required corrections:
              </p>
              <textarea
                rows={4}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Please clarify vital signs change and address Wound Care Goal #2 in the clinical note."
                className="w-full rounded-xl border border-pearl-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="rounded-lg border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags / Notes Modal */}
      {notesModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Tags & Clinical Notes
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {notesModalTask.patientName} (MRN: #{notesModalTask.mrn})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotesModalTask(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task
                </label>
                <div className="font-semibold text-slate-900 dark:text-white bg-pearl-50 dark:bg-charcoal-750 p-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  {notesModalTask.task} • Event Date: {notesModalTask.eventDate}
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[30px] p-2 bg-pearl-50 dark:bg-charcoal-750 rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  {editTagsList.length === 0 ? (
                    <span className="text-slate-400 text-[11px] italic">No tags assigned.</span>
                  ) : (
                    editTagsList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-900 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type a tag name and click Add..."
                    className="flex-1 rounded-xl border border-pearl-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick add:</span>
                  {['High Priority', 'Recertification', 'Wound Care', 'OASIS-E', 'Order Required', 'Fall Risk'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (!editTagsList.includes(suggestion)) {
                          setEditTagsList([...editTagsList, suggestion]);
                        }
                      }}
                      className="rounded-md border border-pearl-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
                    >
                      +{suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Notes & QA Comments
                </label>
                <textarea
                  rows={4}
                  value={editNotesText}
                  onChange={(e) => setEditNotesText(e.target.value)}
                  placeholder="Enter notes, verification details, or clinician instructions..."
                  className="w-full rounded-xl border border-pearl-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-pearl-200 pt-3 dark:border-charcoal-700">
              <button
                type="button"
                onClick={() => setNotesModalTask(null)}
                className="rounded-xl border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotesTags}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Review / Detail Modal */}
      {detailModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                  QA Item Inspection
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {detailModalTask.task}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalTask(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div className="rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Patient</div>
                <div className="font-bold text-slate-900 dark:text-white">{detailModalTask.patientName}</div>
                <div className="text-[11px] text-slate-500">MRN: #{detailModalTask.mrn}</div>
              </div>
              <div className="rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Date of Visit</div>
                <div className="font-bold text-slate-900 dark:text-white">{detailModalTask.eventDate}</div>
                <div className="text-[11px] text-slate-500">{detailModalTask.branch}</div>
              </div>
              <div className="rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Clinician</div>
                <div className="font-bold text-slate-900 dark:text-white">{detailModalTask.assignedTo}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Signed & Submitted</div>
              </div>
              <div className="rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Payer</div>
                <div className="font-bold text-slate-900 dark:text-white">{detailModalTask.payer}</div>
                <div className="text-[11px] text-slate-500">Verified Active</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-pearl-200 bg-pearl-50/50 p-3.5 text-xs dark:border-charcoal-700 dark:bg-charcoal-750">
              <div className="font-bold text-slate-700 dark:text-slate-200">Clinical Documentation / Note:</div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {detailModalTask.notes || 'Routine clinical visit completed in accordance with current Plan of Care. No adverse changes noted.'}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 p-3 text-xs dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Audit & Compliance Checklist</span>
              </div>
              <ul className="mt-1.5 list-disc pl-4 space-y-1 text-emerald-900 dark:text-emerald-200 text-[11px]">
                <li>Clinician Electronic Signature verified with SHA-256 digest</li>
                <li>Homebound status and skilled need documented in narrative</li>
                <li>Conforms to physician orders and Plan of Care episode limits</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-pearl-200 pt-3 dark:border-charcoal-700">
              <button
                type="button"
                onClick={() => handleReturnSingleTask(detailModalTask)}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-600 cursor-pointer transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Return with Note</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalTask(null)}
                  className="rounded-xl border border-pearl-300 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveSingleTask(detailModalTask)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modals (OASIS Analysis, Case-Mix, Gross Margin, CareOrbit CARE) */}
      {activeAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                {activeAnalysisModal === 'oasis' && <TrendingUp className="h-5 w-5 text-emerald-600" />}
                {activeAnalysisModal === 'case-mix' && <DollarSign className="h-5 w-5 text-indigo-600" />}
                {activeAnalysisModal === 'margin' && <Percent className="h-5 w-5 text-sky-600" />}
                {activeAnalysisModal === 'care' && <Heart className="h-5 w-5 text-teal-600 fill-current" />}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white capitalize">
                  {activeAnalysisModal === 'oasis'
                    ? 'OASIS-E Clinical Consistency Analysis'
                    : activeAnalysisModal === 'case-mix'
                    ? 'PDGM Case-Mix & HIPPS Rate Analysis'
                    : activeAnalysisModal === 'margin'
                    ? 'Episodic Gross Margin & Profitability'
                    : 'CareOrbit CARE Clinician Network'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAnalysisModal(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* OASIS ANALYSIS */}
              {activeAnalysisModal === 'oasis' && (
                <div className="space-y-3">
                  <p>
                    The CareOrbit OASIS-E Audit Engine verifies clinical consistency across all items (M1021 primary diagnosis, M1033 hospitalization risks, and M1800-M1860 functional ADLs) against Medicare specifications.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">CMS Consistency Score</div>
                      <div className="text-xl font-black text-emerald-800 dark:text-emerald-200">98.4%</div>
                      <div className="text-[10px] text-emerald-700">Passing benchmark</div>
                    </div>
                    <div className="rounded-xl border border-pearl-200 bg-pearl-50 p-3 dark:border-charcoal-700 dark:bg-charcoal-750">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">OASIS Records in Queue</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">{categoryCounts.oasis} active</div>
                      <div className="text-[10px] text-slate-500">Recertification & SOC</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-pearl-200 p-3 space-y-2 dark:border-charcoal-700">
                    <div className="font-bold text-slate-900 dark:text-white">Audit Checkpoints:</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>M1021/M1023 ICD-10 Primary Diagnosis Mapped:</span>
                      <span className="font-bold text-emerald-600">PASS (100%)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>M1830 Bathing / M1850 Transferring Consistency:</span>
                      <span className="font-bold text-emerald-600">PASS (No Conflict)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>M1033 Hospitalization / Fall Risk Criteria:</span>
                      <span className="font-bold text-emerald-600">Documented</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOasisValidated(true);
                      showToast('OASIS-E Consistency Engine validation completed with zero discrepancies.');
                    }}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>{oasisValidated ? 'Validation Re-Run (Pass: 100%)' : 'Run Full OASIS Consistency Check'}</span>
                  </button>
                </div>
              )}

              {/* CASE-MIX ANALYSIS */}
              {activeAnalysisModal === 'case-mix' && (
                <div className="space-y-3">
                  <p>
                    Estimated Patient-Driven Groupings Model (PDGM) case-mix weights calculated across active patient admissions.
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5 dark:border-indigo-800 dark:bg-indigo-950/40">
                      <div className="text-[10px] font-bold text-indigo-600 uppercase">Avg Case-Mix</div>
                      <div className="text-lg font-black text-indigo-900 dark:text-indigo-200">1.4820</div>
                    </div>
                    <div className="rounded-xl border border-pearl-200 bg-pearl-50 p-2.5 dark:border-charcoal-700 dark:bg-charcoal-750">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Base Rate</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">$2,038.64</div>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">Est. Episodic Rev</div>
                      <div className="text-lg font-black text-emerald-800 dark:text-emerald-200">$3,021.26</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-pearl-200 p-3 space-y-2 dark:border-charcoal-700">
                    <div className="font-bold text-slate-900 dark:text-white">PDGM Grouping Criteria:</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Admission Source & Timing:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Community - Early Episode</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Clinical Grouping:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">MMTA - Endocrine / Wound</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Functional Impairment Level:</span>
                      <span className="font-bold text-indigo-600">High (Score: 18)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Comorbidity Adjustment:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Low Subgroup Adjustment</span>
                    </div>
                  </div>
                </div>
              )}

              {/* GROSS MARGIN */}
              {activeAnalysisModal === 'margin' && (
                <div className="space-y-3">
                  <p>
                    Gross margin calculator incorporates direct clinician visit wages, medical supplies, and travel reimbursement against expected episodic revenue.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-800 dark:bg-sky-950/40">
                      <div className="text-[10px] font-bold text-sky-600 uppercase">Gross Margin %</div>
                      <div className="text-2xl font-black text-sky-900 dark:text-sky-200">48.2%</div>
                      <div className="text-[10px] text-sky-700 font-semibold">+4.0% above 44.2% target</div>
                    </div>
                    <div className="rounded-xl border border-pearl-200 bg-pearl-50 p-3 dark:border-charcoal-700 dark:bg-charcoal-750">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Net Episodic Profit</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">+$1,456.24</div>
                      <div className="text-[10px] text-slate-500">Per 30-day episode</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-pearl-200 p-3 space-y-1.5 dark:border-charcoal-700 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-pearl-100 dark:border-charcoal-700">
                      <span>Expected Episode Revenue:</span>
                      <span className="font-bold text-emerald-600">$3,021.26</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-pearl-100 dark:border-charcoal-700">
                      <span>Direct Nursing & Therapy Labor:</span>
                      <span className="font-bold text-rose-600">-$1,240.00</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-pearl-100 dark:border-charcoal-700">
                      <span>Wound Care Supplies & PPE:</span>
                      <span className="font-bold text-rose-600">-$195.00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Clinician Mileage Reimbursement:</span>
                      <span className="font-bold text-rose-600">-$130.02</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CAREORBIT CARE */}
              {activeAnalysisModal === 'care' && (
                <div className="space-y-3">
                  <p>
                    CareOrbit CARE connects your agency directly to credentialed, background-checked local clinicians to cover staffing shortages and pending QA visits.
                  </p>

                  <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 dark:border-teal-800 dark:bg-teal-950/40">
                    <div className="font-bold text-teal-800 dark:text-teal-200">
                      Staffing Coverage Available in Greater Boston / North Shore
                    </div>
                    <div className="text-[11px] text-teal-700 mt-0.5">
                      14 clinicians currently active and ready for dispatch.
                    </div>
                  </div>

                  <div className="rounded-xl border border-pearl-200 p-3 space-y-2 dark:border-charcoal-700">
                    <div className="font-bold text-slate-900 dark:text-white">Available Local Clinicians:</div>
                    {[
                      { name: 'Alexandria Nelson, RN', dist: '3.2 miles away', rating: '5.0 ★ (48 visits)', status: 'Available Today' },
                      { name: 'Andre Bellevue, PT', dist: '5.1 miles away', rating: '4.9 ★ (62 visits)', status: 'Available Tomorrow' },
                      { name: 'Megan Armstrong, OT', dist: '4.8 miles away', rating: '5.0 ★ (34 visits)', status: 'Available Today' },
                    ].map((clin) => (
                      <div key={clin.name} className="flex items-center justify-between text-[11px] border-b border-pearl-100 pb-1.5 last:border-b-0 last:pb-0 dark:border-charcoal-700">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{clin.name}</div>
                          <div className="text-[10px] text-slate-400">{clin.dist} • {clin.rating}</div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {clin.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      showToast('Redirecting visit request to CareOrbit CARE dispatch portal...');
                      setActiveAnalysisModal(null);
                    }}
                    className="w-full rounded-xl bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 transition cursor-pointer"
                  >
                    Post Visit to CareOrbit CARE Network
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveAnalysisModal(null)}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
