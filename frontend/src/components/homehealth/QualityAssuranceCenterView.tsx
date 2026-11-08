import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface QualityAssuranceCenterViewProps {
  onBack: () => void;
  onOpenTask?: (taskId: string) => void;
}

interface QATaskItem {
  id: string;
  patientName: string;
  mrn: string;
  eventDate: string;
  task: string;
  taskCategory: 'OASIS' | 'Order' | 'Assessment' | 'Communication Notes' | 'Skilled Nursing' | 'HHA / PCW / PCA';
  status: 'Submitted With Signature' | 'Returned' | 'Approved';
  assignedTo: string;
  branch: string;
  payer: string;
  notes?: string;
  hasOasisAnalysis?: boolean;
  hasCaseMix?: boolean;
  hasMarginCalc?: boolean;
  isCareVisit?: boolean;
}

const INITIAL_QA_TASKS: QATaskItem[] = [
  // ABUSSA, HEATHER
  {
    id: 'qa-1',
    patientName: 'ABUSSA, HEATHER',
    mrn: '1061',
    eventDate: '11/02/2026',
    task: 'LVN/LPN Visit',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Marito Fortune LPN',
    branch: 'Standards Home Care',
    payer: 'Medicare Part A',
    notes: 'Vitals stable. Medication compliance verified.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-2',
    patientName: 'ABUSSA, HEATHER',
    mrn: '1061',
    eventDate: '11/01/2026',
    task: 'LVN/LPN Visit',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Marito Fortune LPN',
    branch: 'Standards Home Care',
    payer: 'Medicare Part A',
    notes: 'Routine dressing change completed.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },

  // ANIS, MARIE V.
  {
    id: 'qa-3',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/05/2026',
    task: 'LPN - Oral Med Management - PM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'PM dose dispensed per MAR.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-4',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/05/2026',
    task: 'LPN - Oral Med Management - AM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'Morning medications administered. Blood glucose checked: 124 mg/dL.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-5',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/04/2026',
    task: 'LPN - Oral Med Management - PM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'PM medications taken with applesauce. No adverse reactions.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-6',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/04/2026',
    task: 'LPN - Oral Med Management - AM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'AM medications set up and administered.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-7',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/03/2026',
    task: 'LPN - Oral Med Management - PM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'PM medications administered.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-8',
    patientName: 'ANIS, MARIE V.',
    mrn: '1035',
    eventDate: '11/03/2026',
    task: 'LPN - Oral Med Management - AM',
    taskCategory: 'Skilled Nursing',
    status: 'Submitted With Signature',
    assignedTo: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
    payer: 'MassHealth Senior Care Options',
    notes: 'AM medications administered.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: true,
  },

  // OASIS items
  {
    id: 'qa-9',
    patientName: 'CONNOLLY, PATRICIA',
    mrn: '1102',
    eventDate: '11/06/2026',
    task: 'OASIS-E Resumption of Care',
    taskCategory: 'OASIS',
    status: 'Submitted With Signature',
    assignedTo: 'Hilder Magessa RN',
    branch: 'Standards Home Care',
    payer: 'Medicare Part A',
    notes: 'Post-inpatient stay ROC assessment. M1021 primary diagnosis updated.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: false,
  },
  {
    id: 'qa-10',
    patientName: 'DONOVAN, EDWARD',
    mrn: '1088',
    eventDate: '11/05/2026',
    task: 'OASIS-E Recertification',
    taskCategory: 'OASIS',
    status: 'Submitted With Signature',
    assignedTo: 'Carla Rania RN',
    branch: 'Standards Home Care',
    payer: 'Blue Cross Blue Shield MA',
    notes: '60-day recertification assessment completed.',
    hasOasisAnalysis: true,
    hasCaseMix: true,
    hasMarginCalc: true,
    isCareVisit: false,
  },

  // Order items
  {
    id: 'qa-11',
    patientName: 'TREMBLAY, GERALD',
    mrn: '1044',
    eventDate: '11/07/2026',
    task: 'Physician Order - Furosemide Titration',
    taskCategory: 'Order',
    status: 'Submitted With Signature',
    assignedTo: 'Hilder Magessa RN',
    branch: 'Standards Home Care',
    payer: 'Medicare Part A',
    notes: 'Titrate Lasix from 20mg to 40mg PO daily per Dr. Chen.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: false,
    isCareVisit: false,
  },
  {
    id: 'qa-12',
    patientName: 'GARCIA, SOFIA',
    mrn: '1095',
    eventDate: '11/04/2026',
    task: 'Physician Order - Wound Care Frequency',
    taskCategory: 'Order',
    status: 'Submitted With Signature',
    assignedTo: 'Marito Fortune LPN',
    branch: 'Standards Home Care',
    payer: 'Tufts Health Plan',
    notes: 'Update wound care to 3x/week for 4 weeks.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: false,
    isCareVisit: false,
  },

  // Assessment
  {
    id: 'qa-13',
    patientName: 'SILVA, JOAO',
    mrn: '1115',
    eventDate: '11/06/2026',
    task: 'Nutritional & Fall Risk Assessment',
    taskCategory: 'Assessment',
    status: 'Submitted With Signature',
    assignedTo: 'Carla Rania RN',
    branch: 'Standards Home Care',
    payer: 'Commonwealth Care Alliance',
    notes: 'Morse Fall Scale score: 65 (High Risk). Precautions initiated.',
    hasOasisAnalysis: false,
    hasCaseMix: true,
    hasMarginCalc: false,
    isCareVisit: false,
  },

  // Communication Notes
  {
    id: 'qa-14',
    patientName: 'ABUSSA, HEATHER',
    mrn: '1061',
    eventDate: '11/03/2026',
    task: 'Communication Note - Primary MD Update',
    taskCategory: 'Communication Notes',
    status: 'Submitted With Signature',
    assignedTo: 'Marito Fortune LPN',
    branch: 'Standards Home Care',
    payer: 'Medicare Part A',
    notes: 'Spoke with Dr. O’Connor regarding pedal edema. New orders pending.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: false,
    isCareVisit: false,
  },
  {
    id: 'qa-15',
    patientName: 'KOWALSKI, HENRY',
    mrn: '1072',
    eventDate: '11/04/2026',
    task: 'Communication Note - Daughter Coordination',
    taskCategory: 'Communication Notes',
    status: 'Submitted With Signature',
    assignedTo: 'Hilder Magessa RN',
    branch: 'Standards Home Care',
    payer: 'Aetna Senior Medicare',
    notes: 'Confirmed delivery of oxygen concentrator with family.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: false,
    isCareVisit: false,
  },

  // HHA / PCW / PCA
  {
    id: 'qa-16',
    patientName: 'BROWN, ELEANOR',
    mrn: '1029',
    eventDate: '11/05/2026',
    task: 'Home Health Aide Visit - Personal Care',
    taskCategory: 'HHA / PCW / PCA',
    status: 'Submitted With Signature',
    assignedTo: 'Abnia Jean HHA',
    branch: 'Standards Home Care',
    payer: 'MassHealth Standard',
    notes: 'Assisted with bed bath, hair care, and passive ROM exercises.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: true,
    isCareVisit: true,
  },
  {
    id: 'qa-17',
    patientName: 'BROWN, ELEANOR',
    mrn: '1029',
    eventDate: '11/03/2026',
    task: 'Home Health Aide Visit - ADL Assistance',
    taskCategory: 'HHA / PCW / PCA',
    status: 'Submitted With Signature',
    assignedTo: 'Abnia Jean HHA',
    branch: 'Standards Home Care',
    payer: 'MassHealth Standard',
    notes: 'Assisted with dressing, oral hygiene, and light meal preparation.',
    hasOasisAnalysis: false,
    hasCaseMix: false,
    hasMarginCalc: true,
    isCareVisit: true,
  },
];

export const QualityAssuranceCenterView: React.FC<QualityAssuranceCenterViewProps> = ({
  onBack,
  onOpenTask,
}) => {
  const { organization } = useHealthcare();

  // Filters state
  const [selectedBranch, setSelectedBranch] = useState('Standards Home Care');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('All Tasks');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Pending' | 'Returned' | 'Approved'>('Pending');
  const [selectedTag, setSelectedTag] = useState('Select Option');
  const [selectedPayer, setSelectedPayer] = useState('All');
  const [patientStatus, setPatientStatus] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');

  // Grouping state
  const [groupingMode, setGroupingMode] = useState<'Patient' | 'Date' | 'Task' | 'Clinician'>('Patient');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Task list
  const [taskList, setTaskList] = useState<QATaskItem[]>(INITIAL_QA_TASKS);

  // Modals & Popups
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [detailModalTask, setDetailModalTask] = useState<QATaskItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeAnalysisModal, setActiveAnalysisModal] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle group collapse
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return taskList.filter((item) => {
      if (selectedStatus === 'Pending' && item.status !== 'Submitted With Signature') return false;
      if (selectedStatus === 'Returned' && item.status !== 'Returned') return false;
      if (selectedStatus === 'Approved' && item.status !== 'Approved') return false;

      if (selectedPayer !== 'All' && item.payer !== selectedPayer) return false;
      if (selectedTaskFilter !== 'All Tasks' && item.taskCategory !== selectedTaskFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesMrn = item.mrn.includes(q);
        const matchesAssigned = item.assignedTo.toLowerCase().includes(q);
        const matchesTask = item.task.toLowerCase().includes(q);
        if (!matchesName && !matchesMrn && !matchesAssigned && !matchesTask) return false;
      }

      return true;
    });
  }, [taskList, selectedStatus, selectedPayer, selectedTaskFilter, searchQuery]);

  // Grouping computation
  const groupedTasks = useMemo(() => {
    const groups: Record<string, QATaskItem[]> = {};

    filteredTasks.forEach((task) => {
      let key = '';
      if (groupingMode === 'Patient') {
        key = `Patient: ${task.patientName}`;
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

  // Counts for the right-hand panel & donut meters
  const pendingCount = 179; // authentic count from reference screenshot
  const returnedCount = 0;

  const categoryCounts = {
    oasis: 2,
    order: 2,
    assessment: 1,
    commNotes: 5,
    skilledNursing: 147,
    hha: 20,
  };

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

  // Actions
  const handleApproveSelected = () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to approve.');
      return;
    }
    const count = selectedTaskIds.size;
    setTaskList((prev) =>
      prev.map((t) => (selectedTaskIds.has(t.id) ? { ...t, status: 'Approved' } : t))
    );
    setSelectedTaskIds(new Set());
    showToast(`Successfully approved ${count} task(s).`);
  };

  const handleReturnSelected = () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to return.');
      return;
    }
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    const count = selectedTaskIds.size;
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
    showToast(`Returned ${count} task(s) to clinician for correction.`);
  };

  const handleDeleteSelected = () => {
    if (selectedTaskIds.size === 0) {
      showToast('Please select at least one task to delete.');
      return;
    }
    const count = selectedTaskIds.size;
    setTaskList((prev) => prev.filter((t) => !selectedTaskIds.has(t.id)));
    setSelectedTaskIds(new Set());
    showToast(`Deleted ${count} task(s) from QA Center.`);
  };

  const handleExportToExcel = () => {
    const headers = ['Patient Name', 'MRN', 'Event Date', 'Task', 'Category', 'Status', 'Assigned To', 'Branch', 'Payer', 'Notes'];
    const rows = filteredTasks.map((t) => [
      `"${t.patientName}"`,
      `"${t.mrn}"`,
      `"${t.eventDate}"`,
      `"${t.task}"`,
      `"${t.taskCategory}"`,
      `"${t.status}"`,
      `"${t.assignedTo}"`,
      `"${t.branch}"`,
      `"${t.payer}"`,
      `"${t.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QA_Center_Pending_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported tasks to Excel (CSV) successfully.');
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
                Axxess Home Health
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
            onClick={() => showToast('QA Center task queue refreshed.')}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
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
                <button
                  type="button"
                  onClick={() => showToast('Axxess QA Center guides clinicians through documentation compliance.')}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                >
                  <Info className="h-3 w-3" />
                  Learn More
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review, verify, return, or approve clinical notes, OASIS assessments, and orders before billing submission.
              </p>
            </div>

          {/* Donut Meters from Reference Screenshot */}
          <div className="flex items-center gap-6 self-start lg:self-auto">
            {/* 179 PENDING */}
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
                    strokeDasharray="85, 100"
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

            {/* 0 RETURNED */}
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
                    strokeDasharray="5, 100"
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
                <option value="Standards Home Care">Standards Home Care</option>
                <option value="All Branches">All Branches</option>
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
                <option value="Pending">Pending</option>
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
                <option value="Blue Cross Blue Shield MA">Blue Cross Blue Shield</option>
                <option value="Tufts Health Plan">Tufts Health</option>
              </select>
            </div>
          </div>

          {/* Row 2: Search, Secondary Filters, Insights & Action Buttons */}
          <div className="flex flex-col gap-3 pt-1 xl:flex-row xl:items-center xl:justify-between">
            {/* Left Controls: Search + Patient Status + Tags + Refresh */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[240px] sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient name or MRN..."
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
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Pending">Pending</option>
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
                  <option value="Select Option">All Tags</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Recertification">Recertification</option>
                  <option value="Discharge">Discharge</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                title="Refresh QA queue"
                onClick={() => showToast('Refreshed QA Center task queue.')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-pearl-300 bg-white text-slate-600 shadow-2xs transition-all hover:bg-pearl-100 hover:text-slate-900 active:scale-95 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-300 dark:hover:bg-charcoal-650"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right Controls: Insights Pill Group + Axxess CARE + Export */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Analysis Badges Group */}
              <div className="flex items-center gap-1 rounded-xl border border-pearl-200 bg-pearl-100/70 p-1 dark:border-charcoal-700 dark:bg-charcoal-750">
                <button
                  type="button"
                  onClick={() => setActiveAnalysisModal('oasis')}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-white px-2.5 text-[11px] font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 hover:border-emerald-400 active:scale-95 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>OASIS Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisModal('case-mix')}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-indigo-300/80 bg-white px-2.5 text-[11px] font-bold text-indigo-700 shadow-2xs transition-all hover:bg-indigo-50 hover:border-indigo-400 active:scale-95 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                >
                  <DollarSign className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Case-Mix Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisModal('margin')}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-sky-300/80 bg-white px-2.5 text-[11px] font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-50 hover:border-sky-400 active:scale-95 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60"
                >
                  <Percent className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Gross Margin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisModal('care')}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-teal-300/80 bg-white px-2.5 text-[11px] font-bold text-teal-700 shadow-2xs transition-all hover:bg-teal-50 hover:border-teal-400 active:scale-95 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60"
                >
                  <Heart className="h-3.5 w-3.5 fill-current text-teal-600 dark:text-teal-400" />
                  <span>Axxess CARE</span>
                </button>
              </div>

              {/* Export to Excel */}
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-800 active:scale-95 cursor-pointer"
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
            <div className="flex items-center gap-1 rounded-lg bg-pearl-100 p-1 dark:bg-charcoal-700">
              {(['Patient', 'Date', 'Task', 'Clinician'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGroupingMode(mode)}
                  className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                    groupingMode === mode
                      ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-500'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Batch Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedTaskIds.size === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected
              </button>
              <button
                type="button"
                onClick={handleReturnSelected}
                disabled={selectedTaskIds.size === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-charcoal-600 dark:hover:bg-charcoal-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Return Selected
              </button>
              <button
                type="button"
                onClick={handleApproveSelected}
                disabled={selectedTaskIds.size === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                Approve Selected ({selectedTaskIds.size})
              </button>
            </div>
          </div>

          {/* Grouped Accordion Table */}
          <div className="overflow-hidden rounded-xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                    <th className="w-9 py-2.5 pl-3">
                      <input
                        type="checkbox"
                        checked={
                          filteredTasks.length > 0 &&
                          selectedTaskIds.size === filteredTasks.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                      />
                    </th>
                    <th className="py-2.5 px-3">Patient Name</th>
                    <th className="py-2.5 px-2">MRN</th>
                    <th className="py-2.5 px-3">Event Date</th>
                    <th className="py-2.5 px-2 text-center">Analysis</th>
                    <th className="py-2.5 px-3">Task</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-2">Tags / Notes</th>
                    <th className="py-2.5 px-3">Assigned To</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedTasks).length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-charcoal-600" />
                        No pending QA tasks matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedTasks).map(([groupTitle, tasksInGroup]) => {
                      const isCollapsed = Boolean(collapsedGroups[groupTitle]);
                      const groupAllSelected =
                        tasksInGroup.length > 0 &&
                        tasksInGroup.every((t) => selectedTaskIds.has(t.id));

                      return (
                        <React.Fragment key={groupTitle}>
                          {/* Accordion Group Header */}
                          <tr className="border-y border-pearl-300/80 bg-pearl-100/90 font-bold text-slate-800 transition dark:border-charcoal-650 dark:bg-charcoal-700/80 dark:text-slate-100">
                            <td className="py-2 pl-3">
                              <input
                                type="checkbox"
                                checked={groupAllSelected}
                                onChange={(e) => handleSelectGroup(tasksInGroup, e.target.checked)}
                                className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                              />
                            </td>
                            <td colSpan={8} className="py-2 px-3">
                              <button
                                type="button"
                                onClick={() => toggleGroup(groupTitle)}
                                className="flex items-center gap-2 text-left hover:text-rose-600 dark:hover:text-rose-400"
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
                                  {tasksInGroup.length}
                                </span>
                              </button>
                            </td>
                            <td className="py-2 pr-3 text-right text-[11px] text-slate-500">
                              <button
                                type="button"
                                onClick={() => toggleGroup(groupTitle)}
                                className="text-xs text-rose-600 hover:underline dark:text-rose-400"
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
                                  className={`border-b border-pearl-150 transition-colors dark:border-charcoal-700/60 ${
                                    isSelected
                                      ? 'bg-rose-50/60 dark:bg-rose-950/20'
                                      : 'hover:bg-pearl-50/70 dark:hover:bg-charcoal-750/50'
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td className="py-2 pl-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleSelectOne(task.id)}
                                      className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500 dark:border-charcoal-600"
                                    />
                                  </td>

                                  {/* Patient Name */}
                                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                    {task.patientName}
                                  </td>

                                  {/* MRN */}
                                  <td className="py-2 px-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                    {task.mrn}
                                  </td>

                                  {/* Event Date */}
                                  <td className="py-2 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                    {task.eventDate}
                                  </td>

                                  {/* Analysis Icons */}
                                  <td className="py-2 px-2 text-center">
                                    <div className="inline-flex items-center gap-1 opacity-70 hover:opacity-100">
                                      {task.hasOasisAnalysis && (
                                        <span title="OASIS Analysis Active">
                                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                                        </span>
                                      )}
                                      {task.hasCaseMix && (
                                        <span title="Case-Mix Computed">
                                          <DollarSign className="h-3 w-3 text-indigo-600" />
                                        </span>
                                      )}
                                      {task.hasMarginCalc && (
                                        <span title="Gross Margin Ready">
                                          <Percent className="h-3 w-3 text-sky-600" />
                                        </span>
                                      )}
                                      {task.isCareVisit && (
                                        <span title="Axxess CARE">
                                          <Heart className="h-3 w-3 text-teal-600 fill-current" />
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Task */}
                                  <td className="py-2 px-3">
                                    <button
                                      type="button"
                                      onClick={() => setDetailModalTask(task)}
                                      className="text-left font-medium text-sky-600 hover:underline dark:text-sky-400"
                                    >
                                      {task.task}
                                    </button>
                                  </td>

                                  {/* Status */}
                                  <td className="py-2 px-3">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        task.status === 'Submitted With Signature'
                                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                                          : task.status === 'Approved'
                                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                      }`}
                                    >
                                      {task.status}
                                    </span>
                                  </td>

                                  {/* Tags / Notes */}
                                  <td className="py-2 px-2">
                                    {task.notes && (
                                      <button
                                        type="button"
                                        onClick={() => showToast(task.notes || '')}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        title={task.notes}
                                      >
                                        <FileText className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </td>

                                  {/* Assigned To */}
                                  <td className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-200">
                                    {task.assignedTo}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setDetailModalTask(task)}
                                      className="rounded px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
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

        {/* Right Sidebar: Itemized Pending Breakdown */}
        <div className="space-y-4 lg:col-span-1 xl:col-span-1">
          <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <h2 className="text-sm font-black tracking-wider text-sky-600 uppercase dark:text-sky-400">
                PENDING
              </h2>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
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
                    showToast(`Filtered QA queue to: ${cat.label}`);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                    selectedTaskFilter === cat.filterVal
                      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-pearl-50 text-slate-700 hover:bg-pearl-100 dark:bg-charcoal-700/60 dark:text-slate-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-left">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${cat.color} bg-current`} />
                    <span className="text-left leading-tight">{cat.label}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-black shadow-2xs dark:bg-charcoal-600">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedTaskFilter('All Tasks');
                setSelectedPayer('All');
                setSearchQuery('');
              }}
              className="mt-5 w-full rounded-lg border border-pearl-300 bg-white py-2 text-center text-xs font-bold text-slate-600 hover:bg-pearl-50 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-300 dark:hover:bg-charcoal-600"
            >
              Reset All Filters
            </button>
          </div>

          {/* Quick QA Guideline Card */}
          <div className="rounded-2xl border border-pearl-200/80 bg-gradient-to-br from-rose-500/5 to-rose-600/10 p-4 text-xs dark:border-charcoal-700/80 dark:from-rose-950/20 dark:to-charcoal-800">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
              <ShieldCheck className="h-4 w-4" />
              <span>QA Review Standard</span>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
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
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="rounded-lg border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                Confirm Return
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
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div className="rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Patient</div>
                <div className="font-bold text-slate-900 dark:text-white">{detailModalTask.patientName}</div>
                <div className="text-[11px] text-slate-500">MRN: {detailModalTask.mrn}</div>
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
                onClick={() => {
                  const targetId = detailModalTask.id;
                  setTaskList((prev) =>
                    prev.map((t) => (t.id === targetId ? { ...t, status: 'Returned' } : t))
                  );
                  setDetailModalTask(null);
                  showToast('Task marked as Returned to clinician.');
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Return with Note
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalTask(null)}
                  className="rounded-lg border border-pearl-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = detailModalTask.id;
                    setTaskList((prev) =>
                      prev.map((t) => (t.id === targetId ? { ...t, status: 'Approved' } : t))
                    );
                    setDetailModalTask(null);
                    showToast('Task approved successfully.');
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modals */}
      {activeAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white capitalize">
                {activeAnalysisModal.replace('-', ' ')} Summary
              </h3>
              <button
                type="button"
                onClick={() => setActiveAnalysisModal(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {activeAnalysisModal === 'oasis' && (
                <>
                  <p>
                    OASIS-E consistency engine completed analysis for the <strong>2 active OASIS records</strong> in the current date window.
                  </p>
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <div className="font-bold">Consistency Score: 98.4%</div>
                    <div>Zero critical HIPPS calculation discrepancies found.</div>
                  </div>
                </>
              )}
              {activeAnalysisModal === 'case-mix' && (
                <>
                  <p>
                    Estimated PDGM Case-Mix weight calculated across all active admissions for November 2026.
                  </p>
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <div className="font-bold">Average Case-Mix Weight: 1.4285</div>
                    <div>Projected 30-day episodic revenue: $42,650.00</div>
                  </div>
                </>
              )}
              {activeAnalysisModal === 'margin' && (
                <>
                  <p>Gross margin calculator incorporates direct clinician labor rates against expected reimbursement.</p>
                  <div className="rounded-xl bg-sky-50 p-3 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                    <div className="font-bold">Target Margin: 44.2%</div>
                    <div>Actual Margin: 47.8% (+$1,520 above baseline)</div>
                  </div>
                </>
              )}
              {activeAnalysisModal === 'care' && (
                <>
                  <p>Axxess CARE network seamlessly connects available shifts to qualified clinicians in your area.</p>
                  <div className="rounded-xl bg-teal-50 p-3 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
                    <div className="font-bold">Connected Clinicians: 14 Available in Beverly / Boston Metro</div>
                    <div>2 posted visits currently filled through Axxess CARE.</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveAnalysisModal(null)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
