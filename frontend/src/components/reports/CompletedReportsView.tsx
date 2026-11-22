import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  RotateCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  FileSpreadsheet,
  FileText,
  File,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export interface CompletedReportRecord {
  id: string;
  reportId?: string;
  name: string;
  categoryName: string;
  fileName: string;
  filePath?: string;
  format: string; // 'XLSX' | 'PDF' | 'CSV'
  fileSizeBytes: number;
  status: 'Completed' | 'Failed' | 'Processing' | 'Queued';
  requestedBy: string;
  userId?: string;
  requestedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  appliedFilters?: Record<string, any>;
  errorMessage?: string | null;
  createdAt: string;
}

interface CompletedReportsViewProps {
  onNavigate?: (tab: string) => void;
  onBack?: () => void;
}

export const CompletedReportsView: React.FC<CompletedReportsViewProps> = ({
  onNavigate,
  onBack,
}) => {
  // State
  const [reports, setReports] = useState<CompletedReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals & Action States
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<CompletedReportRecord | null>(null);
  const [reportToDelete, setReportToDelete] = useState<CompletedReportRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Reports from Backend
  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await api.getCompletedReports({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        format: formatFilter !== 'all' ? formatFilter : undefined,
      });

      if (data && data.success) {
        setReports(data.records || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setError('Failed to load completed reports.');
      }
    } catch (err: any) {
      console.error('Error fetching completed reports:', err);
      setError(err.message || 'Failed to connect to reports service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, formatFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Format Helper: Bytes to Human Readable
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Date/Time Formatter: MM/DD/YYYY, hh:mm A
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '—';
    }
  };

  // Format Badge Helper
  const renderFormatBadge = (format: string) => {
    const fmt = (format || 'XLSX').toUpperCase();
    switch (fmt) {
      case 'XLSX':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
            <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>XLSX</span>
          </span>
        );
      case 'CSV':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60">
            <FileText size={13} className="text-sky-600 dark:text-sky-400" />
            <span>CSV</span>
          </span>
        );
      case 'PDF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
            <File size={13} className="text-rose-600 dark:text-rose-400" />
            <span>PDF</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-pearl-100 text-slate-700 border border-pearl-200 dark:bg-charcoal-750 dark:text-slate-300 dark:border-charcoal-600">
            <FileText size={13} />
            <span>{fmt}</span>
          </span>
        );
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60 shadow-2xs">
            <Loader2 size={12} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span>Processing</span>
          </span>
        );
      case 'Queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60 shadow-2xs">
            <Clock size={12} className="text-purple-600 dark:text-purple-400" />
            <span>Queued</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60 shadow-2xs">
            <AlertCircle size={12} className="text-rose-600 dark:text-rose-400" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-charcoal-700 dark:text-slate-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Download Handler
  const handleDownload = async (record: CompletedReportRecord) => {
    if (record.status !== 'Completed') {
      showToast('Cannot download a report that is not yet completed.');
      return;
    }
    setDownloadingId(record.id);
    try {
      await api.downloadCompletedReport(record.id, record.fileName);
      showToast(`Downloading "${record.fileName}"...`);
    } catch (err: any) {
      console.error('Download error:', err);
      showToast(err.message || 'Failed to download report.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Retry Generation Handler
  const handleRetry = async (record: CompletedReportRecord) => {
    setRetryingId(record.id);
    try {
      const res = await api.retryCompletedReport(record.id);
      showToast(res.message || `Successfully regenerated "${record.name}".`);
      await fetchReports(true);
      if (selectedReportForDetails?.id === record.id) {
        setSelectedReportForDetails(res.report);
      }
    } catch (err: any) {
      console.error('Retry error:', err);
      showToast(err.message || 'Failed to retry report generation.');
    } finally {
      setRetryingId(null);
    }
  };

  // Delete Confirmation Handler
  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCompletedReport(reportToDelete.id);
      showToast(`Report "${reportToDelete.name}" deleted successfully.`);
      setReportToDelete(null);
      await fetchReports(true);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pearl-100 dark:bg-charcoal-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Segment (Consistent with CareOrbit Design System) */}
      <div className="bg-white/90 dark:bg-charcoal-850/90 border-b border-pearl-200 dark:border-charcoal-700 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer"
              title="Return"
              aria-label="Return"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <span>CAREORBIT HOME HEALTH</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span>REPORTS</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span className="text-slate-900 dark:text-white font-extrabold">Completed Reports</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Standards Home Care • Centralized Report Archive & Download Center
            </div>
          </div>
        </div>

        {/* Header Right: Navigation to Report Center */}
        {onNavigate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('report-center')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet size={13} className="text-rose-600 dark:text-rose-400" />
              <span>Go to Report Center</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Controls Ribbon: Search, Status Filter, Format Filter, Refresh */}
      <div className="p-4 sm:px-6 max-w-7xl w-full mx-auto">
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200/80 dark:border-charcoal-700 p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Search Bar with Clear Option */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by report name, format, status, requested by..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 dark:text-slate-100 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right: Filters & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Queued">Queued</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Format:</span>
              <select
                value={formatFilter}
                onChange={(e) => {
                  setFormatFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="XLSX">XLSX (Excel)</option>
                <option value="CSV">CSV</option>
                <option value="PDF">PDF</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchReports(true)}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs disabled:opacity-60"
              title="Refresh Completed Reports"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-rose-600' : 'text-slate-500'} />
              <span className="font-extrabold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table Container */}
      <div className="flex-1 px-4 sm:px-6 pb-6 max-w-7xl w-full mx-auto">
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200/80 dark:border-charcoal-700 shadow-2xs overflow-hidden flex flex-col">
          {/* Table Header Summary */}
          <div className="px-4 py-2.5 bg-pearl-50/60 dark:bg-charcoal-800/60 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
            <div className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span>Report Archive</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300">
                {totalCount} Total
              </span>
            </div>
            {totalCount > 0 && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* Table Scroll Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-pearl-100/70 dark:bg-charcoal-800 border-b border-pearl-200 dark:border-charcoal-700 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4 font-black">#</th>
                  <th className="py-3 px-4 font-black">Name</th>
                  <th className="py-3 px-3 font-black">Format</th>
                  <th className="py-3 px-3 font-black">Status</th>
                  <th className="py-3 px-4 font-black">Requested By</th>
                  <th className="py-3 px-4 font-black">Started</th>
                  <th className="py-3 px-4 font-black">Completed</th>
                  <th className="py-3 px-4 font-black text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {isLoading && !isRefreshing ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-rose-600" />
                        <span className="text-xs font-semibold">Loading completed reports from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-rose-600">
                        <AlertCircle size={24} />
                        <span className="text-xs font-bold">{error}</span>
                        <button
                          type="button"
                          onClick={() => fetchReports()}
                          className="mt-2 px-3 py-1.5 rounded-xl bg-pearl-100 dark:bg-charcoal-750 text-xs font-bold text-slate-700 hover:text-rose-600 transition"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto text-slate-500">
                        <div className="w-12 h-12 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 flex items-center justify-center text-slate-400 mb-1">
                          <FileSpreadsheet size={24} />
                        </div>
                        <span className="text-sm font-black text-slate-800 dark:text-white">
                          No Completed Reports Found
                        </span>
                        <p className="text-xs text-slate-400 text-center leading-relaxed">
                          {debouncedSearch || statusFilter !== 'all' || formatFilter !== 'all'
                            ? 'No report records match your active search or filters. Try clearing filters or searching another keyword.'
                            : 'No reports have been generated yet. You can generate new reports anytime from the Report Center.'}
                        </p>
                        {(debouncedSearch || statusFilter !== 'all' || formatFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                              setFormatFilter('all');
                            }}
                            className="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pearl-100 dark:bg-charcoal-800 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report, idx) => {
                    const rowNumber = (page - 1) * limit + idx + 1;
                    const isCompleted = report.status === 'Completed';
                    const isFailed = report.status === 'Failed';
                    const isQueued = report.status === 'Queued';
                    const isRetrying = retryingId === report.id;
                    const isDownloading = downloadingId === report.id;

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/70 transition-colors group"
                      >
                        {/* 1. Row Index */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 select-none">
                          {rowNumber}
                        </td>

                        {/* 2. Name */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col min-w-[180px] max-w-[280px]">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate" title={report.name}>
                              {report.name}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">
                              {report.categoryName} • {formatFileSize(report.fileSizeBytes)}
                            </span>
                          </div>
                        </td>

                        {/* 3. Format */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderFormatBadge(report.format)}
                        </td>

                        {/* 4. Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(report.status)}
                        </td>

                        {/* 5. Requested By */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <User size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]" title={report.requestedBy}>
                              {report.requestedBy || 'System User'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Started */}
                        <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
                          {formatDateTime(report.startedAt || report.requestedAt)}
                        </td>

                        {/* 7. Completed */}
                        <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
                          {isCompleted ? (
                            formatDateTime(report.completedAt)
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 font-bold select-none">—</span>
                          )}
                        </td>

                        {/* 8. Actions Column */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* A. Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownload(report)}
                              disabled={!isCompleted || isDownloading}
                              className={`p-1.5 rounded-lg border transition shadow-2xs cursor-pointer ${
                                isCompleted
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'border-pearl-200 bg-pearl-100 text-slate-300 dark:border-charcoal-750 dark:bg-charcoal-800 dark:text-charcoal-600 cursor-not-allowed opacity-50'
                              }`}
                              title={isCompleted ? `Download ${report.fileName}` : 'Download available once completed'}
                              aria-label="Download Report"
                            >
                              {isDownloading ? (
                                <Loader2 size={13} className="animate-spin text-emerald-600" />
                              ) : (
                                <Download size={13} />
                              )}
                            </button>

                            {/* B. View Details Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReportForDetails(report)}
                              className="p-1.5 rounded-lg border border-pearl-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
                              title="View Report Details"
                              aria-label="View Details"
                            >
                              <Eye size={13} />
                            </button>

                            {/* C. Retry Button (for Failed or Queued reports) */}
                            {(isFailed || isQueued) && (
                              <button
                                type="button"
                                onClick={() => handleRetry(report)}
                                disabled={isRetrying}
                                className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition cursor-pointer shadow-2xs"
                                title="Retry Generation"
                                aria-label="Retry Generation"
                              >
                                <RotateCw size={13} className={isRetrying ? 'animate-spin text-amber-600' : ''} />
                              </button>
                            )}

                            {/* D. Delete Report */}
                            <button
                              type="button"
                              onClick={() => setReportToDelete(report)}
                              className="p-1.5 rounded-lg border border-pearl-200 bg-white text-slate-400 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
                              title="Delete Report Record"
                              aria-label="Delete Report"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-4 py-3 bg-pearl-50/70 dark:bg-charcoal-800/80 border-t border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              {totalCount > 0 ? (
                <>
                  Showing <strong className="text-slate-800 dark:text-slate-200">{(page - 1) * limit + 1}</strong> to{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{Math.min(page * limit, totalCount)}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> reports
                </>
              ) : (
                '0 reports'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1 rounded-xl bg-pearl-200/80 dark:bg-charcoal-700 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {page} / {totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW REPORT DETAILS                             */}
      {/* ======================================================== */}
      {selectedReportForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-charcoal-850 rounded-3xl border border-pearl-200 dark:border-charcoal-700 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Report Details
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Audit specification and execution metrics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportForDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Primary Report Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-pearl-50/70 dark:bg-charcoal-800/70 p-4 rounded-2xl border border-pearl-200/80 dark:border-charcoal-700">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Report Name</span>
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">
                    {selectedReportForDetails.name}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category</span>
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-0.5">
                    {selectedReportForDetails.categoryName}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</span>
                  <div className="mt-1">
                    {renderStatusBadge(selectedReportForDetails.status)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Format & Size</span>
                  <div className="flex items-center gap-2 mt-1">
                    {renderFormatBadge(selectedReportForDetails.format)}
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                      {formatFileSize(selectedReportForDetails.fileSizeBytes)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Execution Timestamps */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Execution Timeline</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-charcoal-800 p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Requested</span>
                    <span className="font-mono text-[11px] font-semibold">{formatDateTime(selectedReportForDetails.requestedAt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Started</span>
                    <span className="font-mono text-[11px] font-semibold">{formatDateTime(selectedReportForDetails.startedAt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Completed</span>
                    <span className="font-mono text-[11px] font-semibold">{formatDateTime(selectedReportForDetails.completedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Requester & Output File */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Origin & Artifact</span>
                <div className="space-y-2 bg-white dark:bg-charcoal-800 p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Requested By:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <User size={12} className="text-rose-600" />
                      {selectedReportForDetails.requestedBy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Generated File:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[280px]" title={selectedReportForDetails.fileName}>
                      {selectedReportForDetails.fileName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Applied Filters (if any) */}
              {selectedReportForDetails.appliedFilters && Object.keys(selectedReportForDetails.appliedFilters).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Applied Filter Parameters</span>
                  <div className="bg-pearl-50 dark:bg-charcoal-900 p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedReportForDetails.appliedFilters, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Error Details (if failed) */}
              {selectedReportForDetails.errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Generation Failure Diagnostic</span>
                  </div>
                  <p className="text-[11px] font-mono leading-relaxed pl-5">
                    {selectedReportForDetails.errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 flex items-center justify-between">
              {selectedReportForDetails.status === 'Failed' ? (
                <button
                  type="button"
                  onClick={() => handleRetry(selectedReportForDetails)}
                  disabled={retryingId === selectedReportForDetails.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition cursor-pointer shadow-xs"
                >
                  <RotateCw size={14} className={retryingId === selectedReportForDetails.id ? 'animate-spin' : ''} />
                  <span>Retry Generation</span>
                </button>
              ) : selectedReportForDetails.status === 'Completed' ? (
                <button
                  type="button"
                  onClick={() => handleDownload(selectedReportForDetails)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>Download File ({selectedReportForDetails.format})</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedReportForDetails(null)}
                className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DELETE CONFIRMATION                             */}
      {/* ======================================================== */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-charcoal-850 rounded-3xl border border-pearl-200 dark:border-charcoal-700 max-w-md w-full shadow-2xl overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Delete Report Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">"{reportToDelete.name}"</strong>? The generated file and audit logs will be removed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-pearl-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
