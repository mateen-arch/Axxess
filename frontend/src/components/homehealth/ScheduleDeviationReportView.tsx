import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api';

interface ScheduleDeviationReportViewProps {
  onBack?: () => void;
  brandTitle?: string;
}

export interface DeviationRecord {
  id: string;
  branch: string;
  mrn: string;
  task: string;
  patient: string;
  patientId?: string;
  status: string;
  userName: string;
  userId?: string;
  scheduleVisit: string;
  visitDate: string;
  deviationReason?: string;
}

export const ScheduleDeviationReportView: React.FC<ScheduleDeviationReportViewProps> = ({
  onBack,
  brandTitle = 'CareOrbit Home Health'
}) => {
  // Filter states
  const [branches, setBranches] = useState<string[]>(['All', 'Standard Home Care']);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dateRangeError, setDateRangeError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [records, setRecords] = useState<DeviationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial metadata and data load
  useEffect(() => {
    loadMetadata();
  }, []);

  // Fetch report data whenever pagination or committed filters change
  useEffect(() => {
    fetchReportData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const loadMetadata = async () => {
    try {
      const meta = await api.getScheduleDeviationMetadata();
      if (meta && meta.branches && meta.branches.length > 0) {
        setBranches(meta.branches);
      }
    } catch (err) {
      console.error('Failed to load deviation report metadata:', err);
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

  // Fetch Report Data from backend
  const fetchReportData = async (page: number = 1, size: number = 15) => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateRangeError('End date cannot be earlier than start date');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getScheduleDeviationReport({
        branch: selectedBranch,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchQuery || undefined,
        page,
        pageSize: size
      });

      if (res && res.success) {
        setRecords(res.records || []);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.page || 1);
      } else {
        setRecords([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Error fetching schedule deviation report:', err);
      showToast(err.message || 'Failed to fetch schedule deviation report');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters button handler
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchReportData(1, pageSize);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedBranch('All');
    setDateFrom('');
    setDateTo('');
    setDateRangeError('');
    setSearchQuery('');
    setCurrentPage(1);
    // Fetch with defaults
    setTimeout(() => {
      fetchReportData(1, pageSize);
    }, 0);
  };

  // Export to Excel: fetch ALL matching records from backend and generate spreadsheet
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Attempt backend export endpoint
      try {
        const blob = await api.exportScheduleDeviationExcel({
          branch: selectedBranch,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: searchQuery || undefined
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `Schedule_Deviation_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast(`Successfully exported Schedule Deviation Report to ${fileName}`);
        return;
      } catch (backendErr) {
        console.warn('Backend export fallback to direct client XLSX:', backendErr);
      }

      // Client-side fallback: fetch all records matching filter
      const res = await api.getScheduleDeviationReport({
        branch: selectedBranch,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchQuery || undefined,
        page: 1,
        pageSize: 1000
      });

      const allRecords: DeviationRecord[] = res.records || records;

      const exportRows = allRecords.map((r) => ({
        'Branch': r.branch,
        'MRN': r.mrn,
        'Task': r.task,
        'Patient': r.patient,
        'Status': r.status,
        'User Name': r.userName,
        'Schedule Visit': r.scheduleVisit,
        'Visit Date': r.visitDate
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = [
        { wch: 22 }, // Branch
        { wch: 10 }, // MRN
        { wch: 30 }, // Task
        { wch: 24 }, // Patient
        { wch: 18 }, // Status
        { wch: 24 }, // User Name
        { wch: 16 }, // Schedule Visit
        { wch: 16 }  // Visit Date
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Deviation Report');

      const fileName = `Schedule_Deviation_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showToast(`Exported ${exportRows.length} deviation records to ${fileName}`);
    } catch (err: any) {
      console.error('Error generating Excel export:', err);
      showToast('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Status Badge styling helper (guarantees NO text wrapping)
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bgStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200';
    let dotStyle = 'bg-amber-500';

    if (s.includes('completed')) {
      bgStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      dotStyle = 'bg-emerald-500';
    } else if (s.includes('missed')) {
      bgStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200';
      dotStyle = 'bg-rose-500';
    } else if (s.includes('signature') || s.includes('returned')) {
      bgStyle = 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200';
      dotStyle = 'bg-sky-500';
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

  return (
    <div className="flex flex-col min-h-screen bg-pearl-100 dark:bg-charcoal-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Segment (Consistent with CareOrbit & Axxess Home Health) */}
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
              <span className="text-slate-900 dark:text-white font-extrabold">Schedule Deviation Report</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Standard Home Care • Schedule Deviation & Variance Audits
            </div>
          </div>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-64 sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              placeholder="Search patient, MRN, task, user..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleApplyFilters();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchReportData(currentPage, pageSize)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            title="Refresh Report"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-rose-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* 2. Filters Section */}
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-rose-600 dark:text-rose-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Filter Schedule Deviations
              </h2>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Only authentic schedule deviations (date variances & missed visits) are retrieved
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* A. Branch Filter */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* B. Date Range: From & To */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Date Range
                </label>
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={handleClearDates}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
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
                    className="w-full px-2.5 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
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
                    className="w-full px-2.5 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
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

            {/* Filter Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 transition cursor-pointer"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Filter size={13} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Action Row: Export to Excel */}
          <div className="mt-4 pt-3.5 border-t border-pearl-100 dark:border-charcoal-750 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock size={14} className="text-rose-500" />
              <span>A deviation occurs when a visit date differs from the scheduled date or is flagged as missed.</span>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting || totalCount === 0}
              className="px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export all matching schedule deviations across pages to Excel"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
            </button>
          </div>
        </div>

        {/* 3. Summary & Pagination Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Total Deviations:{' '}
            <strong className="font-black text-slate-800 dark:text-slate-100">
              {totalCount}
            </strong>{' '}
            record{totalCount === 1 ? '' : 's'} identified
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
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
              </select>
            </div>

            {totalCount > 0 && (
              <span className="font-medium">
                Page <strong className="font-black text-slate-800 dark:text-slate-100">{currentPage}</strong> of{' '}
                <strong className="font-black text-slate-800 dark:text-slate-100">{totalPages}</strong>
              </span>
            )}
          </div>
        </div>

        {/* 4. Schedule Deviation Report Table (Exact 8 columns in order) */}
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-rose-50/80 dark:bg-rose-950/25 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase tracking-wider border-b border-rose-100 dark:border-rose-900/40">
                <tr>
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-4 min-w-[150px]">Branch</th>
                  <th className="py-3 px-3 min-w-[80px]">MRN</th>
                  <th className="py-3 px-4 min-w-[200px]">Task</th>
                  <th className="py-3 px-4 min-w-[170px]">Patient</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 min-w-[170px]">User Name</th>
                  <th className="py-3 px-3 min-w-[120px]">Schedule Visit</th>
                  <th className="py-3 px-3 min-w-[120px]">Visit Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-rose-600" />
                        <span className="font-semibold text-xs">Loading database schedule deviation records...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                        <Filter size={32} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                          No schedule deviations found
                        </p>
                        <p className="text-xs text-slate-400">
                          No visits deviated from their scheduled date within the selected branch and date range.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const isMissed = r.status.toLowerCase().includes('missed') || r.visitDate === 'Missed';
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-pearl-50 dark:hover:bg-charcoal-800/60 transition-colors"
                      >
                        {/* # */}
                        <td className="py-3 px-3 text-center text-slate-400 text-[11px] font-mono">
                          {rowNumber}
                        </td>

                        {/* 1. Branch */}
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {r.branch}
                        </td>

                        {/* 2. MRN */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {r.mrn}
                        </td>

                        {/* 3. Task */}
                        <td className="py-3 px-4 font-semibold text-rose-900 dark:text-rose-300">
                          <div>{r.task}</div>
                          {r.deviationReason && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-xs" title={r.deviationReason}>
                              {r.deviationReason}
                            </div>
                          )}
                        </td>

                        {/* 4. Patient */}
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {r.patient}
                        </td>

                        {/* 5. Status */}
                        <td className="py-3 px-4 whitespace-nowrap min-w-[140px]">
                          {getStatusBadge(r.status)}
                        </td>

                        {/* 6. User Name */}
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {r.userName}
                        </td>

                        {/* 7. Schedule Visit */}
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {r.scheduleVisit}
                        </td>

                        {/* 8. Visit Date */}
                        <td className="py-3 px-3">
                          {isMissed ? (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                              <AlertTriangle size={12} className="shrink-0" />
                              <span>Missed</span>
                            </span>
                          ) : (
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {r.visitDate}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {Math.min(totalCount, (currentPage - 1) * pageSize + 1)} to{' '}
                {Math.min(totalCount, currentPage * pageSize)} of {totalCount} deviations
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
