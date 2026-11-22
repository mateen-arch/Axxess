import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  Search,
  UserCheck,
  X,
  FileSpreadsheet,
  Layers,
  ChevronUp,
  Tag,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { scheduleApi } from '../../services/api';

interface ScheduleReportViewProps {
  onBack?: () => void;
  brandTitle?: string;
}

export interface ScheduleRecord {
  id: string;
  patient: string;
  mrn: string;
  patientId?: string;
  scheduleDate: string;
  visitTimeIn: string;
  visitTimeOut: string;
  task: string;
  status: string;
  payable: boolean;
  billable: boolean;
  clinician: string;
  clinicianId?: string;
  tags: string[];
  discipline?: string;
  branch?: string;
}

interface PatientOption {
  id: string;
  mrn: string;
  name: string;
  branch?: string;
}

interface ClinicianOption {
  id: string;
  name: string;
  title?: string;
  credentials?: string;
  discipline?: string;
  branch?: string;
}

const ALL_26_STATUSES = [
  'Awaiting Clinician Signature',
  'Completed',
  'Completed from Mobile Device',
  'Created',
  'Exported',
  'Missed Visit',
  'Missed Visit (Complete)',
  'Missed Visit (Pending GA Review)',
  'Missed Visit (Returned for Review)',
  'Not Yet Due',
  'Not Yet Started',
  'Pending Follow-up',
  'Reopened',
  'Returned for Clinician Signature',
  'Returned for Review',
  'Returned for Review by Physician',
  'Returned w/ Physician Signature',
  'Saved',
  'Saved by Physician',
  'Saved from Mobile Device',
  'Sent to Physician (Electronically)',
  'Sent to Physician (Fax, Mail, etc.)',
  'Submitted from Mobile Device',
  'Submitted (Pending Co-signature)',
  'Submitted with Signature',
  'To Be Sent to Physician'
];

const ALL_9_DISCIPLINES = [
  'Nursing',
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'MSW',
  'HHA',
  'Dietician',
  'Orders',
  'Reports and Notes'
];

export const ScheduleReportView: React.FC<ScheduleReportViewProps> = ({
  onBack,
  brandTitle = 'CareOrbit Home Health'
}) => {
  // Metadata state
  const [branches, setBranches] = useState<string[]>(['All', 'Standards Home Care']);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianOption[]>([]);
  const [availableTasks, setAvailableTasks] = useState<string[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(true);

  // Filter form states
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('All');
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Mutually exclusive Task vs Discipline
  const [selectionType, setSelectionType] = useState<'discipline' | 'task'>('discipline');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [selectedTask, setSelectedTask] = useState<string>('All');

  // Date range
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dateRangeError, setDateRangeError] = useState<string>('');

  // Group By: 'None' | 'Patient' | 'Date' | 'Task' | 'Clinician'
  const [groupBy, setGroupBy] = useState<string>('None');

  // Search in header
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Report records state
  const [records, setRecords] = useState<ScheduleRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Row selection
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Reassign Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [replacementClinician, setReplacementClinician] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState<boolean>(false);
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState<string>('');
  const [reassignErrorMsg, setReassignErrorMsg] = useState<string>('');

  // Patient / Clinician search filters inside dropdown
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState<boolean>(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  const [clinicianSearch, setClinicianSearch] = useState<string>('');
  const [isClinicianDropdownOpen, setIsClinicianDropdownOpen] = useState<boolean>(false);
  const clinicianDropdownRef = useRef<HTMLDivElement>(null);

  // Collapsed group states
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
      if (clinicianDropdownRef.current && !clinicianDropdownRef.current.contains(e.target as Node)) {
        setIsClinicianDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch metadata on mount
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setIsLoadingMeta(true);
      const meta = await scheduleApi.getScheduleReportMetadata();
      if (meta.branches && meta.branches.length > 0) {
        setBranches(meta.branches);
      }
      if (meta.patients) {
        setPatients(meta.patients);
      }
      if (meta.clinicians) {
        setClinicians(meta.clinicians);
      }
      if (meta.tasks) {
        setAvailableTasks(meta.tasks);
      }
      // Auto generate report on initial load
      fetchReportData();
    } catch (err) {
      console.error('Failed to load schedule report metadata:', err);
      // Fallback: fetch report directly anyway
      fetchReportData();
    } finally {
      setIsLoadingMeta(false);
    }
  };

  // Date range validation
  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    if (val && dateTo && val > dateTo) {
      setDateRangeError('Start date cannot be after end date');
    } else {
      setDateRangeError('');
    }
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    if (dateFrom && val && dateFrom > val) {
      setDateRangeError('End date cannot be earlier than start date');
    } else {
      setDateRangeError('');
    }
  };

  const handleClearDates = () => {
    setDateFrom('');
    setDateTo('');
    setDateRangeError('');
  };

  // Fetch / Generate report
  const fetchReportData = async () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateRangeError('End date cannot be earlier than start date');
      return;
    }

    try {
      setIsLoading(true);
      setSelectedRecordIds(new Set());
      setCurrentPage(1);

      const payload = {
        branch: selectedBranch,
        patientId: selectedPatientId,
        clinicianId: selectedClinicianId,
        status: selectedStatus,
        selectionType,
        discipline: selectionType === 'discipline' ? selectedDiscipline : undefined,
        task: selectionType === 'task' ? selectedTask : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchQuery || undefined,
        groupBy
      };

      const res = await scheduleApi.generateScheduleReport(payload);
      if (res && res.records) {
        setRecords(res.records);
      } else {
        setRecords([]);
      }
      setHasGenerated(true);
    } catch (err: any) {
      console.error('Error fetching schedule report:', err);
      showToast(err.message || 'Failed to generate schedule report');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered records by header search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(r =>
      r.patient.toLowerCase().includes(q) ||
      r.mrn.toLowerCase().includes(q) ||
      r.task.toLowerCase().includes(q) ||
      r.clinician.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [records, searchQuery]);

  // Grouping logic
  interface GroupedData {
    groupKey: string;
    items: ScheduleRecord[];
  }

  const groupedRecords = useMemo((): GroupedData[] | null => {
    if (groupBy === 'None') return null;

    const map = new Map<string, ScheduleRecord[]>();
    for (const r of filteredRecords) {
      let key = 'Other';
      if (groupBy === 'Patient') key = r.patient || 'Unknown Patient';
      else if (groupBy === 'Date') key = r.scheduleDate || 'No Date';
      else if (groupBy === 'Task') key = r.task || 'General Task';
      else if (groupBy === 'Clinician') key = r.clinician || 'Unassigned';

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(r);
    }

    return Array.from(map.entries()).map(([groupKey, items]) => ({
      groupKey,
      items
    }));
  }, [filteredRecords, groupBy]);

  // Toggle group collapse
  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Pagination for non-grouped view
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    if (groupBy !== 'None') return filteredRecords;
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize, groupBy]);

  // Row selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredRecords.map(r => r.id));
      setSelectedRecordIds(allIds);
    } else {
      setSelectedRecordIds(new Set());
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRecordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = filteredRecords.length > 0 && selectedRecordIds.size === filteredRecords.length;
  const isPartiallySelected = selectedRecordIds.size > 0 && selectedRecordIds.size < filteredRecords.length;

  // Export to Excel functionality
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Build clean export records from filteredRecords
      const exportRows = filteredRecords.map(r => ({
        'Patient': r.patient,
        'MRN': r.mrn,
        'Schedule Date': r.scheduleDate,
        'Visit Time In': r.visitTimeIn,
        'Visit Time Out': r.visitTimeOut,
        'Task': r.task,
        'Status': r.status,
        'Payable': r.payable ? 'Yes' : 'No',
        'Billable': r.billable ? 'Yes' : 'No',
        'Clinician': r.clinician,
        'Tags': Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || 'Routine')
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = [
        { wch: 26 }, // Patient
        { wch: 10 }, // MRN
        { wch: 14 }, // Schedule Date
        { wch: 14 }, // Visit Time In
        { wch: 14 }, // Visit Time Out
        { wch: 30 }, // Task
        { wch: 22 }, // Status
        { wch: 10 }, // Payable
        { wch: 10 }, // Billable
        { wch: 26 }, // Clinician
        { wch: 18 }  // Tags
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Report');

      const fileName = `Schedule_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showToast(`Exported ${exportRows.length} visits to ${fileName}`);
    } catch (err: any) {
      console.error('Error generating Excel export:', err);
      showToast('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Reassign Scheduled handler
  const handleOpenReassignModal = () => {
    if (selectedRecordIds.size === 0) return;
    setReplacementClinician('');
    setReassignErrorMsg('');
    setReassignSuccessMsg('');
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!replacementClinician) {
      setReassignErrorMsg('Please select a replacement clinician.');
      return;
    }

    try {
      setIsReassigning(true);
      setReassignErrorMsg('');

      const targetClinician = clinicians.find(c => c.name === replacementClinician || c.id === replacementClinician);
      const clinicianName = targetClinician ? targetClinician.name : replacementClinician;
      const clinicianId = targetClinician ? targetClinician.id : undefined;

      const visitIds = Array.from(selectedRecordIds);
      const res = await scheduleApi.reassignScheduleReportVisits({
        visitIds,
        replacementClinicianId: clinicianId,
        replacementClinicianName: clinicianName
      });

      showToast(`Successfully reassigned ${res.updatedCount || visitIds.length} visits to ${clinicianName}.`);
      setIsReassignModalOpen(false);
      setSelectedRecordIds(new Set());
      // Refresh report data
      fetchReportData();
    } catch (err: any) {
      console.error('Error reassigning visits:', err);
      setReassignErrorMsg(err.message || 'Failed to reassign visits');
    } finally {
      setIsReassigning(false);
    }
  };

  // Status Badge styling helper (guarantees NO text wrapping)
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bgStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200';
    let dotStyle = 'bg-amber-500';

    if (s.includes('completed') || s.includes('exported')) {
      bgStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      dotStyle = 'bg-emerald-500';
    } else if (s.includes('missed') || s.includes('returned')) {
      bgStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200';
      dotStyle = 'bg-rose-500';
    } else if (s.includes('signature') || s.includes('physician') || s.includes('co-signature')) {
      bgStyle = 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200';
      dotStyle = 'bg-sky-500';
    } else if (s.includes('saved') || s.includes('created')) {
      bgStyle = 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200';
      dotStyle = 'bg-purple-500';
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap leading-none select-none shadow-2xs shrink-0 ${bgStyle}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
        <span className="whitespace-nowrap">{status}</span>
      </span>
    );
  };

  // Selected patient label
  const selectedPatientLabel = useMemo(() => {
    if (selectedPatientId === 'All') return 'All Patients';
    const found = patients.find(p => p.id === selectedPatientId || p.mrn === selectedPatientId);
    return found ? `${found.name} (MRN: ${found.mrn})` : selectedPatientId;
  }, [selectedPatientId, patients]);

  // Selected clinician label
  const selectedClinicianLabel = useMemo(() => {
    if (selectedClinicianId === 'All') return 'All Clinicians';
    const found = clinicians.find(c => c.id === selectedClinicianId || c.name === selectedClinicianId);
    return found ? `${found.name} ${found.credentials ? `(${found.credentials})` : ''}` : selectedClinicianId;
  }, [selectedClinicianId, clinicians]);

  // Filtered dropdown lists for search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase().trim();
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.mrn.includes(q));
  }, [patients, patientSearch]);

  const filteredClinicians = useMemo(() => {
    if (!clinicianSearch.trim()) return clinicians;
    const q = clinicianSearch.toLowerCase().trim();
    return clinicians.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.discipline && c.discipline.toLowerCase().includes(q)) ||
      (c.credentials && c.credentials.toLowerCase().includes(q))
    );
  }, [clinicians, clinicianSearch]);

  return (
    <div className="flex flex-col min-h-screen bg-pearl-100 dark:bg-charcoal-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Segment (Consistent with CareOrbit Home Health) */}
      <div className="bg-white/90 dark:bg-charcoal-850/90 border-b border-pearl-200 dark:border-charcoal-700 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <span>{brandTitle.toUpperCase()}</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span>SCHEDULE</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span className="text-slate-900 dark:text-white font-extrabold">Schedule Report</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Standards Home Care • Schedule Report & Visit Logs
            </div>
          </div>
        </div>

        {/* Search Bar & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="relative w-64 sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, clinicians, MRN..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchReportData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            title="Refresh Report"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-rose-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* 2. Filters Section */}
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-rose-600 dark:text-rose-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Filter Schedule Visits
              </h2>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              All filter dropdowns dynamically linked to agency database
            </div>
          </div>

          {/* Grid of Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* A. Branch */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* B. Patient (Searchable Dropdown) */}
            <div className="relative" ref={patientDropdownRef}>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Patient
              </label>
              <button
                type="button"
                onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer"
              >
                <span className="truncate">{selectedPatientLabel}</span>
                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1.5" />
              </button>

              {isPatientDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-xl overflow-hidden animate-in fade-in">
                  <div className="p-2 border-b border-pearl-100 dark:border-charcoal-750">
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search patient name or MRN..."
                        className="w-full pl-7 pr-3 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-900 text-xs focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-pearl-50 dark:divide-charcoal-750 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId('All');
                        setIsPatientDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-bold transition hover:bg-rose-50 dark:hover:bg-charcoal-700 ${
                        selectedPatientId === 'All' ? 'text-rose-600 bg-rose-50/50 dark:bg-charcoal-700' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      All Patients
                    </button>
                    {filteredPatients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setIsPatientDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left transition hover:bg-rose-50 dark:hover:bg-charcoal-700 ${
                          selectedPatientId === p.id ? 'text-rose-600 font-bold bg-rose-50/50 dark:bg-charcoal-700' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[10px] text-slate-400">MRN: {p.mrn} • {p.branch || 'Standards Home Care'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* C. Clinician (Searchable Dropdown) */}
            <div className="relative" ref={clinicianDropdownRef}>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Clinician
              </label>
              <button
                type="button"
                onClick={() => setIsClinicianDropdownOpen(!isClinicianDropdownOpen)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer"
              >
                <span className="truncate">{selectedClinicianLabel}</span>
                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1.5" />
              </button>

              {isClinicianDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-xl overflow-hidden animate-in fade-in">
                  <div className="p-2 border-b border-pearl-100 dark:border-charcoal-750">
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={clinicianSearch}
                        onChange={(e) => setClinicianSearch(e.target.value)}
                        placeholder="Search clinician name or discipline..."
                        className="w-full pl-7 pr-3 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-900 text-xs focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-pearl-50 dark:divide-charcoal-750 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClinicianId('All');
                        setIsClinicianDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-bold transition hover:bg-rose-50 dark:hover:bg-charcoal-700 ${
                        selectedClinicianId === 'All' ? 'text-rose-600 bg-rose-50/50 dark:bg-charcoal-700' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      All Clinicians
                    </button>
                    {filteredClinicians.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedClinicianId(c.id);
                          setIsClinicianDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left transition hover:bg-rose-50 dark:hover:bg-charcoal-700 ${
                          selectedClinicianId === c.id ? 'text-rose-600 font-bold bg-rose-50/50 dark:bg-charcoal-700' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{c.name} {c.credentials && `(${c.credentials})`}</div>
                        <div className="text-[10px] text-slate-400">{c.discipline || c.title || 'Nursing'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* D. Status (Exact 26 statuses) */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="All">All Statuses ({ALL_26_STATUSES.length})</option>
                {ALL_26_STATUSES.map((st, idx) => (
                  <option key={st} value={st}>
                    {idx + 1}. {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Mutually Exclusive Task / Discipline + Date Range + Group By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-pearl-100 dark:border-charcoal-750">
            {/* E. Task / Discipline Selector (Mutually Exclusive) */}
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Filter by Task or Discipline
                </span>

                {/* Segmented Radio Toggle */}
                <div className="inline-flex rounded-xl bg-pearl-200/60 dark:bg-charcoal-750 p-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectionType('discipline')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      selectionType === 'discipline'
                        ? 'bg-white dark:bg-charcoal-850 text-rose-600 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Discipline
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionType('task')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      selectionType === 'task'
                        ? 'bg-white dark:bg-charcoal-850 text-rose-600 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Task
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Discipline Dropdown */}
                <div className={selectionType !== 'discipline' ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">
                    Discipline {selectionType !== 'discipline' && '(Disabled)'}
                  </label>
                  <select
                    disabled={selectionType !== 'discipline'}
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:bg-pearl-100 disabled:cursor-not-allowed"
                  >
                    <option value="All">All Disciplines</option>
                    {ALL_9_DISCIPLINES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Task Dropdown */}
                <div className={selectionType !== 'task' ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">
                    Task {selectionType !== 'task' && '(Disabled)'}
                  </label>
                  <select
                    disabled={selectionType !== 'task'}
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:bg-pearl-100 disabled:cursor-not-allowed"
                  >
                    <option value="All">All Tasks ({availableTasks.length})</option>
                    {availableTasks.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* F. Date Range */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Date Range
                </label>
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={handleClearDates}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    placeholder="From"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block pl-1">From</span>
                </div>
                <div>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    placeholder="To"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block pl-1">To</span>
                </div>
              </div>
              {dateRangeError && (
                <div className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{dateRangeError}</span>
                </div>
              )}
            </div>

            {/* G. Group By */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="None">None (Flat Table)</option>
                <option value="Patient">Patient</option>
                <option value="Date">Date</option>
                <option value="Task">Task</option>
                <option value="Clinician">Clinician</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Groups report records with collapsible sections
              </span>
            </div>
          </div>

          {/* Action Buttons: Generate Report & Export to Excel */}
          <div className="mt-5 pt-4 border-t border-pearl-100 dark:border-charcoal-750 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles size={14} className="text-amber-500" />
              <span>Filters apply live to database queries</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedBranch('All');
                  setSelectedPatientId('All');
                  setSelectedClinicianId('All');
                  setSelectedStatus('All');
                  setSelectedDiscipline('All');
                  setSelectedTask('All');
                  setDateFrom('');
                  setDateTo('');
                  setDateRangeError('');
                  setGroupBy('None');
                  setSearchQuery('');
                  fetchReportData();
                }}
                className="px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 transition cursor-pointer"
              >
                Reset Filters
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting || filteredRecords.length === 0}
                className="px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export current filtered report to real Excel file"
              >
                <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
              </button>

              <button
                type="button"
                onClick={fetchReportData}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Report Action Bar & Summary Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-pearl-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span>Select All</span>
            </label>

            {selectedRecordIds.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200">
                {selectedRecordIds.size} selected
              </span>
            )}

            {/* Reassign Scheduled Button */}
            <button
              type="button"
              onClick={handleOpenReassignModal}
              disabled={selectedRecordIds.size === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                selectedRecordIds.size > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-pearl-200 dark:bg-charcoal-750 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title="Reassign selected visits to another clinician"
            >
              <UserCheck size={14} />
              <span>Reassign Scheduled</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Total Records: <strong className="font-black text-slate-800 dark:text-slate-100">{filteredRecords.length}</strong>
            </span>
            {groupBy !== 'None' && groupedRecords && (
              <span>
                • Groups: <strong className="font-black text-slate-800 dark:text-slate-100">{groupedRecords.length}</strong>
              </span>
            )}
            {groupBy === 'None' && (
              <div className="flex items-center gap-1.5 ml-2">
                <span>Page size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 4. Schedule Report Table (Exact 12 columns in order) */}
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-rose-50/80 dark:bg-rose-950/25 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase tracking-wider border-b border-rose-100 dark:border-rose-900/40">
                <tr>
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-pearl-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-4 min-w-[160px]">Patient</th>
                  <th className="py-3 px-3 min-w-[80px]">MRN</th>
                  <th className="py-3 px-3 min-w-[110px]">Schedule Date</th>
                  <th className="py-3 px-3 min-w-[110px]">Visit Time In</th>
                  <th className="py-3 px-3 min-w-[110px]">Visit Time Out</th>
                  <th className="py-3 px-4 min-w-[180px]">Task</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 text-center min-w-[80px]">Payable</th>
                  <th className="py-3 px-3 text-center min-w-[80px]">Billable</th>
                  <th className="py-3 px-4 min-w-[160px]">Clinician</th>
                  <th className="py-3 px-3 min-w-[110px]">Tags</th>
                  <th className="py-3 px-3 text-right min-w-[90px]">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={14} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-rose-600" />
                        <span className="font-semibold text-xs">Loading database schedule records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                        <Filter size={32} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No visits match your selected filters</p>
                        <p className="text-xs text-slate-400">
                          Try adjusting the branch, patient, clinician, status, or date range filters to view schedule reports.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : groupBy !== 'None' && groupedRecords ? (
                  // Grouped Table Rendering
                  groupedRecords.map((group) => {
                    const isCollapsed = collapsedGroups.has(group.groupKey);
                    return (
                      <React.Fragment key={group.groupKey}>
                        {/* Group Header Row */}
                        <tr className="bg-pearl-100/70 dark:bg-charcoal-750 font-black text-slate-800 dark:text-slate-200">
                          <td colSpan={14} className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleGroupCollapse(group.groupKey)}
                              className="flex items-center gap-2 w-full text-left cursor-pointer hover:text-rose-600 transition"
                            >
                              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                {groupBy}:
                              </span>
                              <span className="text-xs font-extrabold">{group.groupKey}</span>
                              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700">
                                {group.items.length} {group.items.length === 1 ? 'visit' : 'visits'}
                              </span>
                            </button>
                          </td>
                        </tr>

                        {/* Group Records */}
                        {!isCollapsed &&
                          group.items.map((r, idx) => {
                            const isSelected = selectedRecordIds.has(r.id);
                            return (
                              <tr
                                key={r.id}
                                className={`transition-colors ${
                                  isSelected
                                    ? 'bg-rose-50/60 dark:bg-rose-950/20'
                                    : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800/60'
                                }`}
                              >
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleRow(r.id)}
                                    className="w-3.5 h-3.5 rounded border-pearl-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">{idx + 1}</td>
                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{r.patient}</td>
                                <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{r.mrn}</td>
                                <td className="py-3 px-3 font-semibold">{r.scheduleDate}</td>
                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{r.visitTimeIn}</td>
                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{r.visitTimeOut}</td>
                                <td className="py-3 px-4 font-semibold text-rose-900 dark:text-rose-300">{r.task}</td>
                                <td className="py-3 px-4 whitespace-nowrap min-w-[140px]">{getStatusBadge(r.status)}</td>
                                <td className="py-3 px-3 text-center">
                                  {r.payable ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Yes</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">No</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {r.billable ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Yes</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">No</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-medium">{r.clinician}</td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {(r.tags || ['Routine']).map((tag, tIdx) => (
                                      <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pearl-200/80 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRecordIds(new Set([r.id]));
                                      setIsReassignModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                                  >
                                    Reassign
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                ) : (
                  // Flat Table Rendering (With Pagination)
                  paginatedRecords.map((r, idx) => {
                    const isSelected = selectedRecordIds.has(r.id);
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-rose-50/60 dark:bg-rose-950/20'
                            : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800/60'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(r.id)}
                            className="w-3.5 h-3.5 rounded border-pearl-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>

                        {/* Row # */}
                        <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">{rowNumber}</td>

                        {/* 1. Patient */}
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {r.patient}
                        </td>

                        {/* 2. MRN */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {r.mrn}
                        </td>

                        {/* 3. Schedule Date */}
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {r.scheduleDate}
                        </td>

                        {/* 4. Visit Time In */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {r.visitTimeIn}
                        </td>

                        {/* 5. Visit Time Out */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {r.visitTimeOut}
                        </td>

                        {/* 6. Task */}
                        <td className="py-3 px-4 font-semibold text-rose-900 dark:text-rose-300">
                          {r.task}
                        </td>

                        {/* 7. Status (Non-wrapping badge) */}
                        <td className="py-3 px-4 whitespace-nowrap min-w-[140px]">
                          {getStatusBadge(r.status)}
                        </td>

                        {/* 8. Payable */}
                        <td className="py-3 px-3 text-center">
                          {r.payable ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 dark:bg-charcoal-700 text-slate-500 border border-slate-200">
                              No
                            </span>
                          )}
                        </td>

                        {/* 9. Billable */}
                        <td className="py-3 px-3 text-center">
                          {r.billable ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 dark:bg-charcoal-700 text-slate-500 border border-slate-200">
                              No
                            </span>
                          )}
                        </td>

                        {/* 10. Clinician */}
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {r.clinician}
                        </td>

                        {/* 11. Tags */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(r.tags || ['Routine']).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pearl-200/80 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 12. Action */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecordIds(new Set([r.id]));
                              setIsReassignModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold transition cursor-pointer"
                          >
                            Reassign
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (when not grouped) */}
          {groupBy === 'None' && filteredRecords.length > pageSize && (
            <div className="px-4 py-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {Math.min(filteredRecords.length, (currentPage - 1) * pageSize + 1)} to{' '}
                {Math.min(filteredRecords.length, currentPage * pageSize)} of {filteredRecords.length} visits
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Reassign Scheduled Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 max-w-lg w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Reassign Scheduled Visits
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Visits Selected for Reassignment:
                </span>
                <div className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                  {selectedRecordIds.size} visit{selectedRecordIds.size === 1 ? '' : 's'} selected
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Replacement Clinician
                </label>
                <select
                  value={replacementClinician}
                  onChange={(e) => setReplacementClinician(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">-- Select Replacement Clinician --</option>
                  {clinicians.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.credentials ? `(${c.credentials})` : ''} - {c.discipline || c.title || 'Nursing'}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Only active clinicians registered in the agency database are shown.
                </span>
              </div>

              {reassignErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {reassignErrorMsg}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                disabled={isReassigning || !replacementClinician}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer disabled:opacity-50"
              >
                {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
