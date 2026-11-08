import React, { useState, useMemo } from 'react';
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
  MapPin
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { SearchableMultiSelect, MultiSelectOption } from '../common/SearchableMultiSelect';

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
  // Scheduled Reports (from screenshots)
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
  // Completed
  { id: 'Completed', label: 'Completed', category: 'Completed' },
  { id: 'Submitted', label: 'Submitted', category: 'Completed' },
  { id: 'Export Ready', label: 'Export Ready', category: 'Completed' },
  { id: 'Exported', label: 'Exported', category: 'Completed' },
  { id: 'Not Exported', label: 'Not Exported', category: 'Completed' },
  { id: 'Sent To Physician', label: 'Sent To Physician', category: 'Completed' },
  // Incomplete
  { id: 'Saved', label: 'Saved', category: 'Incomplete' },
  { id: 'Not Yet Started', label: 'Not Yet Started', category: 'Incomplete' },
  { id: 'Returned', label: 'Returned', category: 'Incomplete' },
  { id: 'Reopened', label: 'Reopened', category: 'Incomplete' },
  // Missed
  { id: 'Missed Visit', label: 'Missed Visit', category: 'Missed' },
  { id: 'Missed Visit (Complete)', label: 'Missed Visit (Complete)', category: 'Missed' },
  { id: 'Missed Visit (Pending)', label: 'Missed Visit (Pending)', category: 'Missed' },
  { id: 'Missed Visit (Return)', label: 'Missed Visit (Return)', category: 'Missed' },
  // Future
  { id: 'Not Yet Due', label: 'Not Yet Due', category: 'Future' },
];

export const ReportCenterView: React.FC = () => {
  const {
    employeeVisits,
    clinicians,
    patients,
    chartTasks,
    setActiveNavTab,
  } = useHealthcare();

  // Search & Navigation States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Generator Form States (Matching legacy screenshots)
  const [viewType, setViewType] = useState('weekly');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState<string[]>([]);
  const [personSearch, setPersonSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [reportFormat, setReportFormat] = useState<'excel' | 'pdf'>('excel');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    showToast('Report generator filters reset');
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setHasGenerated(true);
    showToast(`Generating ${activeReport?.name} in ${reportFormat.toUpperCase()} format...`);
  };

  // Sample Generated Output Table Data
  const reportResults = useMemo(() => {
    if (!hasGenerated) return [];

    if (activeReportId === 'employee-schedule') {
      return employeeVisits.map((v) => ({
        id: v.id,
        col1: v.employeeName,
        sub1: 'Field Clinician',
        col2: v.visitType,
        col3: v.serviceLine.replace('_', ' ').toUpperCase(),
        col4: v.date,
        col5: v.patientName,
        sub5: v.timeSlot,
        status: v.status.toUpperCase(),
        isCompleted: v.status === 'completed',
        isInProgress: v.status === 'in_progress',
      }));
    }

    if (activeReportId === 'patient-schedule') {
      return chartTasks.map((t) => ({
        id: t.id,
        col1: 'Abuissa, Heather',
        sub1: 'MRN #1061',
        col2: t.task,
        col3: t.discipline,
        col4: t.scheduleStart,
        col5: t.assignedTo,
        sub5: t.visitTimeIn || '09:00 AM',
        status: t.status,
        isCompleted: t.status === 'Completed' || t.status === 'Submitted With Signature',
        isInProgress: t.status === 'Not Yet Due',
      }));
    }

    // Default generic generator results (Active Census & Patient Reports)
    return patients.map(p => ({
      id: p.id,
      col1: `${p.lastName}, ${p.firstName}`,
      sub1: `MRN: ${p.mrn}`,
      col2: p.primaryDiagnosis,
      col3: p.serviceLine.replace('_', ' ').toUpperCase(),
      col4: p.admissionDate,
      col5: p.assignedNurseName || 'Unassigned Staff',
      sub5: p.nextScheduledVisit || 'Care Plan Active',
      status: p.status.toUpperCase(),
      isCompleted: p.status === 'active',
      isInProgress: p.status === 'pending_admission',
    }));
  }, [hasGenerated, activeReportId, employeeVisits, chartTasks, patients]);

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
                className="px-4 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Back to Catalog
              </button>
            </div>
          </div>

          {/* Report Generator Controls (Matching media_1793729051126_ee907c24.png) */}
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
                    <option value="boston">Boston Main Branch</option>
                    <option value="dallas">Dallas Main Branch</option>
                    <option value="plano">Plano Regional Branch</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Task Status, Person Search, Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <SearchableMultiSelect
                    label="Task Status"
                    placeholder="Task Status: All"
                    allLabel="Task Status: All"
                    searchPlaceholder="Search for Task Status..."
                    options={TASK_STATUS_OPTIONS}
                    selectedValues={selectedTaskStatuses}
                    onChange={setSelectedTaskStatuses}
                    showSelectAll={true}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {activeReport.category === 'employee' || activeReportId === 'employee-schedule'
                      ? 'Employees'
                      : 'Patients'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        activeReport.category === 'employee' || activeReportId === 'employee-schedule'
                          ? 'Search for Employee by Name...'
                          : 'Search for Patient by Name...'
                      }
                      value={personSearch}
                      onChange={e => setPersonSearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500"
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                    />
                    <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Report Format & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="w-full sm:w-60">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Report Format
                  </label>
                  <select
                    value={reportFormat}
                    onChange={e => setReportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
                  >
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF Document (.pdf)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5 self-end">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Live Generated Results Table */}
          {hasGenerated && (
            <div className="space-y-4 animate-fadeIn">
              <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Generated Output Preview ({reportResults.length} Records)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Showing generated data starting {startDate} • Format: {reportFormat.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast(`Report exported to ${reportFormat.toUpperCase()}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export {reportFormat === 'excel' ? 'to Excel' : 'to PDF'}</span>
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
                        <th className="py-3.5 pl-6 pr-4 w-[14%]">Entity / Name</th>
                        <th className="py-3.5 px-4 w-[28%]">Task / Clinical Focus</th>
                        <th className="py-3.5 px-4 w-[12%]">Discipline / Line</th>
                        <th className="py-3.5 px-4 w-[12%]">Date</th>
                        <th className="py-3.5 px-4 w-[17%]">Assigned / Time</th>
                        <th className="py-3.5 pl-4 pr-6 w-[17%] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs font-medium">
                      {reportResults.map(row => {
                        const statusLower = (row.status || '').toLowerCase();
                        const isReturned = statusLower.includes('returned');
                        const isSubmitted = statusLower.includes('submitted with signature');

                        return (
                          <tr
                            key={row.id}
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
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {row.sub5}
                              </div>
                            </td>

                            {/* Col 6: Status (Rightmost corner, 2-line wrapped for longer labels to prevent overlapping) */}
                            <td className="py-3.5 pl-4 pr-6 text-right">
                              <div className="flex items-center justify-end">
                                {isReturned ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-left">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="leading-[1.25]">
                                      Returned w/<br />Physician Signature
                                    </span>
                                  </span>
                                ) : isSubmitted ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 text-left">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                    <span className="leading-[1.25]">
                                      Submitted<br />With Signature
                                    </span>
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                                      row.isCompleted
                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                        : row.isInProgress
                                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                                        : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        row.isCompleted
                                          ? 'bg-emerald-500'
                                          : row.isInProgress
                                          ? 'bg-blue-500'
                                          : 'bg-slate-400'
                                      }`}
                                    />
                                    <span>{row.status}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================================================================== */
        /* VIEW 2: MAIN REPORT CENTER HUB (Matching media_1793728983230_2961ff37)*/
        /* ==================================================================== */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="text-rose-600 dark:text-rose-400" size={24} />
                <span>Report Center</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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

          {/* Glance Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Cataloged Reports
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  {REPORT_CATALOG.length} Standard
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
                  {REPORT_CATALOG.filter(r => r.category === 'scheduled').length}
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Itineraries & EVV
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
                  100%
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  HUV/SFV & OASIS Verified
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Formats Supported
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                  Excel & PDF
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Instant export & print
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Download size={18} />
              </div>
            </div>
          </div>

          {/* 3 Categories Cards Grid (Patient Reports | Scheduled Reports | Employee Reports) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* 1. Patient Reports Panel */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs flex flex-col">
              <div className="p-4 border-b border-rose-500/80 bg-pearl-50/60 dark:bg-charcoal-800/60 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={16} className="text-rose-600" />
                  <span>Patient Reports</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {patientReports.length} reports
                </span>
              </div>

              <div className="p-2 divide-y divide-pearl-100 dark:divide-charcoal-750">
                {patientReports.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No reports match your search.
                  </div>
                ) : (
                  patientReports.map(report => {
                    const Icon = report.icon;
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleOpenReport(report.id)}
                        className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-800 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                              {report.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {report.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {report.format}
                          </span>
                          <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Scheduled Reports Panel (Featured from screenshot!) */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs flex flex-col">
              <div className="p-4 border-b border-rose-500/80 bg-pearl-50/60 dark:bg-charcoal-800/60 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays size={16} className="text-rose-600" />
                  <span>Scheduled Reports</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {scheduledReports.length} reports
                </span>
              </div>

              <div className="p-2 divide-y divide-pearl-100 dark:divide-charcoal-750">
                {scheduledReports.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No reports match your search.
                  </div>
                ) : (
                  scheduledReports.map(report => {
                    const Icon = report.icon;
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleOpenReport(report.id)}
                        className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-800 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                              {report.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {report.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            title={report.description}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 cursor-help"
                          >
                            <Info size={14} />
                          </div>
                          <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Employee Reports Panel */}
            <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs flex flex-col">
              <div className="p-4 border-b border-rose-500/80 bg-pearl-50/60 dark:bg-charcoal-800/60 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-rose-600" />
                  <span>Employee Reports</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {employeeReports.length} reports
                </span>
              </div>

              <div className="p-2 divide-y divide-pearl-100 dark:divide-charcoal-750">
                {employeeReports.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No reports match your search.
                  </div>
                ) : (
                  employeeReports.map(report => {
                    const Icon = report.icon;
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleOpenReport(report.id)}
                        className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-800 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                              {report.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {report.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {report.format}
                          </span>
                          <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
