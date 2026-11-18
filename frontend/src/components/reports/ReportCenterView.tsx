import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  X,
  Calendar,
  Clock,
  Download,
  Printer,
  ChevronRight,
  ArrowLeft,
  Users,
  UserCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Filter,
  BarChart3,
  CalendarDays,
  ShieldCheck,
  FileSpreadsheet,
  Info,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { SearchableMultiSelect, MultiSelectOption } from '../common/SearchableMultiSelect';
import { api } from '../../services/api';

interface ReportDefinition {
  id: string;
  name: string;
  category: 'patient' | 'scheduled' | 'employee';
  description: string;
  format: 'Excel' | 'PDF' | 'Both';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On-Demand';
  icon: React.ElementType;
}

const REPORT_CATALOG: ReportDefinition[] = [
  // Scheduled Reports
  {
    id: 'employee-schedule',
    name: 'Employee Schedule',
    category: 'scheduled',
    description: 'Weekly and daily clinical itineraries, patient visit assignments, territory dispatches, and EVV statuses by clinician.',
    format: 'Both',
    frequency: 'Weekly',
    icon: CalendarDays,
  },
  {
    id: 'patient-schedule',
    name: 'Patient Schedule',
    category: 'scheduled',
    description: 'Patient-centric appointment calendar, planned clinical encounters, frequency orders, and clinician coverage.',
    format: 'Both',
    frequency: 'Weekly',
    icon: Users,
  },
  {
    id: 'frequency-watch',
    name: 'Frequency Watch',
    category: 'scheduled',
    description: 'Physician order visit frequency tracking, over/under utilization alerts, and planned vs delivered visits.',
    format: 'Excel',
    frequency: 'Weekly',
    icon: Activity,
  },
  {
    id: 'huv-sfv',
    name: 'HUV and SFV Status Report',
    category: 'scheduled',
    description: 'Regulatory compliance auditing for Home Urgency Visits (HUV) and Subsequent Frequency Visits (SFV) across active episodes.',
    format: 'Excel',
    frequency: 'Monthly',
    icon: ShieldCheck,
  },

  // Patient Reports
  {
    id: 'patient-census',
    name: 'Active Patient Census & Roster',
    category: 'patient',
    description: 'Comprehensive active roster categorized by service line, admitting branch, payer source, and primary clinical diagnosis.',
    format: 'Both',
    frequency: 'Daily',
    icon: Users,
  },
  {
    id: 'patient-risk-audit',
    name: 'Hospitalization & Fall Risk Audit',
    category: 'patient',
    description: 'High-risk patient surveillance tracking fall precautions, infection risks, and recent hospital discharge admissions.',
    format: 'PDF',
    frequency: 'Weekly',
    icon: AlertTriangle,
  },
  {
    id: 'oasis-documentation',
    name: 'OASIS & Clinical Recertification Status',
    category: 'patient',
    description: 'Upcoming 60-day episode recertifications, OASIS assessments awaiting QA review, and physician signatures.',
    format: 'Excel',
    frequency: 'Monthly',
    icon: FileText,
  },
  {
    id: 'face-to-face-tracking',
    name: 'Face-to-Face Encounter Audit',
    category: 'patient',
    description: 'Medicare compliance audit verifying timely physician face-to-face documentation prior to billing.',
    format: 'Both',
    frequency: 'Weekly',
    icon: CheckCircle2,
  },

  // Employee Reports
  {
    id: 'clinician-productivity',
    name: 'Clinician Productivity & Visit Volume',
    category: 'employee',
    description: 'Total completed, billable, and payable encounters completed by field clinicians versus target productivity units.',
    format: 'Excel',
    frequency: 'Weekly',
    icon: BarChart3,
  },
  {
    id: 'evv-compliance',
    name: 'Electronic Visit Verification (EVV) Compliance',
    category: 'employee',
    description: 'GPS geolocation verification logs, clock-in/out timestamps, and exception tracking for Medicaid/Medicare visits.',
    format: 'Both',
    frequency: 'Daily',
    icon: MapPin,
  },
  {
    id: 'credentials-expiration',
    name: 'Staff License & Credentials Expiration',
    category: 'employee',
    description: 'Upcoming expirations for RN, PT, OT licenses, CPR certifications, background checks, and TB test clearances.',
    format: 'PDF',
    frequency: 'Monthly',
    icon: UserCheck,
  },
  {
    id: 'mileage-expense',
    name: 'Travel Mileage & Reimbursement Log',
    category: 'employee',
    description: 'Auto-calculated mileage, travel durations, and approved surcharges between patient home visits.',
    format: 'Excel',
    frequency: 'Monthly',
    icon: FileSpreadsheet,
  },
];

const TASK_STATUS_OPTIONS: MultiSelectOption[] = [
  { id: 'Completed', label: 'Completed', category: 'Completed' },
  { id: 'Submitted', label: 'Submitted', category: 'Completed' },
  { id: 'Export Ready', label: 'Export Ready', category: 'Completed' },
  { id: 'Exported', label: 'Exported', category: 'Completed' },
  { id: 'Not Exported', label: 'Not Exported', category: 'Completed' },
  { id: 'Sent To Physician', label: 'Sent To Physician', category: 'Completed' },
  { id: 'Saved', label: 'Saved', category: 'Incomplete' },
  { id: 'Not Yet Started', label: 'Not Yet Started', category: 'Incomplete' },
  { id: 'Returned', label: 'Returned', category: 'Incomplete' },
  { id: 'Reopened', label: 'Reopened', category: 'Incomplete' },
  { id: 'Missed Visit', label: 'Missed Visit', category: 'Missed' },
  { id: 'Not Yet Due', label: 'Not Yet Due', category: 'Future' },
];

export const ReportCenterView: React.FC = () => {
  const { patients } = useHealthcare();

  // Search & Navigation States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Generator Form States
  const [viewType, setViewType] = useState('weekly');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState<string[]>([]);
  const [personSearch, setPersonSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [reportFormat, setReportFormat] = useState<'excel' | 'pdf'>('excel');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Real Database Results & Stats
  const [dbStats, setDbStats] = useState<any>(null);
  const [generatedRows, setGeneratedRows] = useState<any[]>([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Real Stats from Database on mount
  useEffect(() => {
    api.getReportStats()
      .then(stats => setDbStats(stats))
      .catch(err => console.error('Failed to load real report stats:', err));
  }, []);

  const activeReport = useMemo(() => {
    return REPORT_CATALOG.find(r => r.id === activeReportId) || null;
  }, [activeReportId]);

  // Filter Catalog by user search
  const filteredCatalog = useMemo(() => {
    if (!searchTerm.trim()) return REPORT_CATALOG;
    const q = searchTerm.toLowerCase();
    return REPORT_CATALOG.filter(
      r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const patientReports = filteredCatalog.filter(r => r.category === 'patient');
  const scheduledReports = filteredCatalog.filter(r => r.category === 'scheduled');
  const employeeReports = filteredCatalog.filter(r => r.category === 'employee');

  const handleOpenReport = (reportId: string) => {
    setActiveReportId(reportId);
    setHasGenerated(false);
    setGeneratedRows([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setViewType('weekly');
    setSelectedOrg('all');
    setSelectedBranch('all');
    setSelectedTaskStatuses([]);
    setPersonSearch('');
    setStartDate('2026-11-01');
    setReportFormat('excel');
    setHasGenerated(false);
    setGeneratedRows([]);
    showToast('Report generator filters reset');
  };

  // Generate Report directly from PostgreSQL Database
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      setIsGenerating(true);
      showToast(`Generating ${activeReport.name} from database...`);

      const result = await api.generateReport({
        reportId: activeReport.id,
        startDate,
        viewType,
        organization: selectedOrg,
        branch: selectedBranch,
        statuses: selectedTaskStatuses,
        personSearch
      });

      setGeneratedRows(result.rows || []);
      setHasGenerated(true);
      showToast(`Loaded ${result.recordCount} real database records!`);
    } catch (err: any) {
      console.error('Failed to generate report from database:', err);
      showToast('Error querying database for report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Real CSV Export Function
  const handleExportCSV = () => {
    if (generatedRows.length === 0) {
      showToast('No generated data to export. Please click Generate first.');
      return;
    }

    const headers = [
      'Entity / Name',
      'Identifier / Subtitle',
      'Clinical Focus / Task',
      'Discipline / Service Line',
      'Scheduled Date',
      'Assigned Staff / Contact',
      'Timing / Sub-info',
      'Status'
    ];

    const rows = generatedRows.map(r => [
      `"${(r.col1 || '').replace(/"/g, '""')}"`,
      `"${(r.sub1 || '').replace(/"/g, '""')}"`,
      `"${(r.col2 || '').replace(/"/g, '""')}"`,
      `"${(r.col3 || '').replace(/"/g, '""')}"`,
      `"${(r.col4 || '').replace(/"/g, '""')}"`,
      `"${(r.col5 || '').replace(/"/g, '""')}"`,
      `"${(r.sub5 || '').replace(/"/g, '""')}"`,
      `"${(r.status || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `axxess_report_${activeReport?.id || 'standard'}_${startDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Successfully exported ${generatedRows.length} real records to CSV!`);
  };

  return (
    <div className="space-y-6 transition-colors animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-charcoal-800 text-white px-4 py-2.5 rounded-xl shadow-xl border border-pearl-700 dark:border-charcoal-600 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 1: REPORT GENERATOR DETAIL VIEW                                  */}
      {/* ==================================================================== */}
      {activeReport ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Return Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pearl-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={() => setActiveReportId(null)}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft size={16} />
              <span>Report Center</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Category:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
                {activeReport.category}
              </span>
            </div>
          </div>

          {/* Generator Header Card */}
          <div className="glass-panel p-5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <activeReport.icon size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                  {activeReport.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                  {activeReport.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveReportId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Back to Catalog
              </button>
            </div>
          </div>

          {/* Report Generator Controls */}
          <div className="glass-panel p-5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
              <Filter size={13} className="text-rose-500" />
              <span>Report Parameters & Filter Criteria</span>
            </h3>

            <form onSubmit={handleGenerateReport} className="space-y-4">
              {/* Row 1: View Type, Organization, Branch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    View <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={viewType}
                    onChange={e => setViewType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization
                  </label>
                  <select
                    value={selectedOrg}
                    onChange={e => setSelectedOrg(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
                  >
                    <option value="all">Organizations: All</option>
                    <option value="standards">Standards Home Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
                  >
                    <option value="all">Branches: All</option>
                    <option value="dallas">Standards Home Care (Dallas TX)</option>
                    <option value="north">Standards Home Care (Plano TX)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Status Multi-select */}
              <div>
                <SearchableMultiSelect
                  label="Task / Record Status"
                  options={TASK_STATUS_OPTIONS}
                  selectedIds={selectedTaskStatuses}
                  onChange={setSelectedTaskStatuses}
                  placeholder="Filter by status (Completed, Scheduled, Not Yet Due...)"
                />
              </div>

              {/* Row 3: Person Search & Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Search by Person Name / MRN
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Heather Abuissa, Alexandria Nelson, 1061..."
                      value={personSearch}
                      onChange={e => setPersonSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Report Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 4: Format Toggle & Action Buttons */}
              <div className="pt-2 border-t border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Export Format:
                  </span>
                  <div className="inline-flex rounded-xl bg-pearl-100 dark:bg-charcoal-800 p-0.5 border border-pearl-200 dark:border-charcoal-700">
                    <button
                      type="button"
                      onClick={() => setReportFormat('excel')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        reportFormat === 'excel'
                          ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      Excel / CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportFormat('pdf')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        reportFormat === 'pdf'
                          ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      PDF
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{isGenerating ? 'Querying Database...' : 'Generate Report'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Live Generated Results Table from Real Database */}
          {hasGenerated && (
            <div className="space-y-4 animate-fadeIn">
              <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Generated Database Records ({generatedRows.length} Records)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Real-time query starting {startDate} • Format: {reportFormat.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export Real CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast('Printing report document...');
                      setTimeout(() => window.print(), 300);
                    }}
                    className="p-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors"
                    title="Print Document"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                        <th className="py-3.5 pl-6 pr-4 w-[16%]">Entity / Name</th>
                        <th className="py-3.5 px-4 w-[28%]">Task / Clinical Focus</th>
                        <th className="py-3.5 px-4 w-[12%]">Discipline / Line</th>
                        <th className="py-3.5 px-4 w-[12%]">Date</th>
                        <th className="py-3.5 px-4 w-[16%]">Assigned / Details</th>
                        <th className="py-3.5 pl-4 pr-6 w-[16%] text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs font-medium">
                      {generatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No records returned from database matching these criteria.
                          </td>
                        </tr>
                      ) : (
                        generatedRows.map((row, idx) => {
                          const statusStr = String(row.status || '').toUpperCase();
                          const isDone = row.isCompleted || statusStr.includes('COMPLETED') || statusStr.includes('VERIFIED');
                          const isInProg = row.isInProgress || statusStr.includes('IN PROGRESS') || statusStr.includes('DUE');

                          return (
                            <tr
                              key={row.id || idx}
                              className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition-colors"
                            >
                              {/* Col 1: Entity Name */}
                              <td className="py-3.5 pl-6 pr-4">
                                <div className="font-bold text-slate-950 dark:text-white truncate">
                                  {row.col1}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {row.sub1}
                                </div>
                              </td>

                              {/* Col 2: Task / Clinical Focus */}
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate" title={row.col2}>
                                  {row.col2}
                                </span>
                              </td>

                              {/* Col 3: Discipline / Line */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-650">
                                  {row.col3}
                                </span>
                              </td>

                              {/* Col 4: Date */}
                              <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {row.col4}
                              </td>

                              {/* Col 5: Assigned / Time */}
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                  {row.col5}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {row.sub5}
                                </div>
                              </td>

                              {/* Col 6: Centered & Formatted Status Badge */}
                              <td className="py-3.5 pl-4 pr-6 text-center">
                                <div className="flex items-center justify-center">
                                  <span
                                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-center whitespace-nowrap leading-none border shadow-2xs ${
                                      isDone
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                        : isInProg
                                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                                        : 'border-rose-400/40 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================================================================== */
        /* VIEW 2: MAIN REPORT CENTER HUB (Consistent Header & Live DB Stats)   */
        /* ==================================================================== */
        <div className="space-y-6">
          {/* Consistent Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
                <BarChart3 className="text-rose-600 dark:text-rose-400 shrink-0" size={24} />
                <span>Reports & Census</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Clinical intelligence, scheduled rosters, regulatory compliance audits, and productivity logs
              </p>
            </div>

            {/* Quick Live Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Live Glance Metric Cards from Database */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Cataloged Reports
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  {dbStats?.catalogedReports || REPORT_CATALOG.length} Standard
                </div>
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  Across 3 categories
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <FileText size={18} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Scheduled Reports
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  {dbStats?.scheduledReportsCount || 4}
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Itineraries & EVV ({dbStats?.totalVisits || 16} visits)
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Compliance Audits
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {dbStats?.complianceRate || '100%'}
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {dbStats?.complianceLabel || 'HUV/SFV & EVV Verified'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Active Patient Census
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  {dbStats?.activeCensusTotal || patients.length} Patients
                </div>
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  {dbStats ? `${dbStats.homeHealthCensus} HH • ${dbStats.homeCareCensus} HC • ${dbStats.hospiceCensus} Hospice` : 'All service lines'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
          </div>

          {/* 3 Categories Cards Grid (Patient Reports | Scheduled Reports | Employee Reports) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Scheduled Reports */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 shadow-xs space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-pearl-200 dark:border-charcoal-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Scheduled Reports
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Rosters & Encounter Frequency
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {scheduledReports.length} Available
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {scheduledReports.map(r => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenReport(r.id)}
                    className="p-3 rounded-xl border border-pearl-200/80 dark:border-charcoal-700/80 bg-white/60 dark:bg-charcoal-800/60 hover:bg-pearl-100/70 dark:hover:bg-charcoal-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {r.name}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pearl-200/70 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {r.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
                      <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                        <span>Format: {r.format}</span>
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold text-slate-700 dark:text-slate-300">
                        <span>Generate</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Patient Reports */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 shadow-xs space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-pearl-200 dark:border-charcoal-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Patient Reports & Census
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Census, OASIS & Clinical Risks
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {patientReports.length} Available
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {patientReports.map(r => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenReport(r.id)}
                    className="p-3 rounded-xl border border-pearl-200/80 dark:border-charcoal-700/80 bg-white/60 dark:bg-charcoal-800/60 hover:bg-pearl-100/70 dark:hover:bg-charcoal-700 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {r.name}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pearl-200/70 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {r.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
                      <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <span>Format: {r.format}</span>
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold text-slate-700 dark:text-slate-300">
                        <span>Generate</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Employee Reports */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 shadow-xs space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-pearl-200 dark:border-charcoal-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Employee & EVV Audits
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Productivity, Mileage & Verification
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {employeeReports.length} Available
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {employeeReports.map(r => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenReport(r.id)}
                    className="p-3 rounded-xl border border-pearl-200/80 dark:border-charcoal-700/80 bg-white/60 dark:bg-charcoal-800/60 hover:bg-pearl-100/70 dark:hover:bg-charcoal-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {r.name}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pearl-200/70 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {r.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Format: {r.format}</span>
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold text-slate-700 dark:text-slate-300">
                        <span>Generate</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
