import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Trash2,
  PieChart,
  Building2,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminReportItem, AdminCensusStats } from '../types/admin';

export const ReportsCensusGovernancePage: React.FC = () => {
  const { refreshTrigger, triggerRefresh, showToast } = useAdmin();
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [census, setCensus] = useState<AdminCensusStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [repRes, censusRes] = await Promise.all([
        adminApi.getReports(),
        adminApi.getCensus()
      ]);

      if (repRes.success) setReports(repRes.reports || []);
      if (censusRes.success) setCensus(censusRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load reports & census data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (rep: AdminReportItem) => {
    try {
      setDownloadingId(rep.id);
      showToast(`Preparing download for ${rep.report_name}...`, 'info');
      const response = await fetch(`/api/admin/reports/${rep.id}/download`);
      if (!response.ok) {
        let errMsg = 'Download failed';
        try {
          const errData = await response.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      const ext = (rep.format || 'xlsx').toLowerCase();
      const fileName = `${rep.report_name.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
      
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', fileName);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Downloaded ${fileName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to download report', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleApproveReport = async (id: string, name: string) => {
    try {
      setActionInProgressId(id);
      const res = await adminApi.approveReport(id);
      if (res.success) {
        showToast(`Report "${name}" approved & published to Completed Reports!`, 'success');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteReport = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete report "${name}"?`)) return;
    try {
      setActionInProgressId(id);
      const res = await adminApi.deleteReport(id);
      if (res.success) {
        showToast(`Report "${name}" removed.`, 'info');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const pendingReportsCount = reports.filter(r => r.approval_status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-charcoal-850 p-6 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <BarChart3 size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Reports & Census Governance
              </h1>
              {pendingReportsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1 border border-amber-500/20 animate-pulse">
                  <Clock size={12} />
                  {pendingReportsCount} Reports Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supervise clinical & operational census intelligence across branches. Approve generated reports before public staff access.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Live Census Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Census Overview */}
        <div className="bg-white dark:bg-charcoal-850 p-5 rounded-2xl border border-pearl-200 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Master Census</span>
            <Users size={16} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {census?.activeCensus ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Active verified clinical cases
          </div>
          {census && census.pendingPatients > 0 && (
            <div className="mt-3 pt-3 border-t border-pearl-100 dark:border-charcoal-750 flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending Admission:</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">+{census.pendingPatients} in intake</span>
            </div>
          )}
        </div>

        {/* Breakdown by Service Line */}
        <div className="bg-white dark:bg-charcoal-850 p-5 rounded-2xl border border-pearl-200 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Census by Service Line</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-2 mt-3">
            {census?.byServiceLine?.map((s) => (
              <div key={s.service_line} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 capitalize font-medium">
                  {s.service_line?.replace('_', ' ')}
                </span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  {s.count}
                </span>
              </div>
            )) || <div className="text-slate-400 text-xs">Loading service lines...</div>}
          </div>
        </div>

        {/* Breakdown by Branch */}
        <div className="bg-white dark:bg-charcoal-850 p-5 rounded-2xl border border-pearl-200 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Census by Branch</span>
            <Building2 size={16} className="text-sky-500" />
          </div>
          <div className="space-y-2 mt-3">
            {census?.byBranch?.map((b) => (
              <div key={b.branch} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[170px]" title={b.branch}>
                  {b.branch}
                </span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  {b.count}
                </span>
              </div>
            )) || <div className="text-slate-400 text-xs">Loading branches...</div>}
          </div>
        </div>
      </div>

      {/* 3. Generated & Completed Reports Governance */}
      <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Generated Reports Registry
            </h3>
            <span className="text-xs text-slate-400 font-mono">({reports.length} records)</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search report name or requester..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Report Name & Category</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Generated Timestamp</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4 text-center">Publication Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No generated report records found.
                  </td>
                </tr>
              ) : (
                reports
                  .filter(r => {
                    const matchSearch = !search || r.report_name.toLowerCase().includes(search.toLowerCase()) || r.requested_by.toLowerCase().includes(search.toLowerCase());
                    const matchFormat = selectedFormat === 'all' || r.format?.toLowerCase() === selectedFormat.toLowerCase();
                    return matchSearch && matchFormat;
                  })
                  .map((rep) => {
                    const isPending = rep.approval_status === 'pending_approval';

                    return (
                      <tr key={rep.id} className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div>{rep.report_name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{rep.category || 'Clinical Operations'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded font-mono font-black text-[10px] bg-pearl-100 text-slate-700 dark:bg-charcoal-750 dark:text-slate-300">
                            {rep.format || 'XLSX'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {rep.requested_by || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {rep.generated_at}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {rep.file_size_bytes ? `${Math.round(rep.file_size_bytes / 1024)} KB` : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                              <Clock size={11} />
                              Pending Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={11} />
                              Published
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => handleApproveReport(rep.id, rep.report_name)}
                                disabled={actionInProgressId === rep.id}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadReport(rep)}
                              disabled={downloadingId === rep.id}
                              className="p-1.5 rounded-lg hover:bg-pearl-200 dark:hover:bg-charcoal-750 text-slate-600 dark:text-slate-300 transition-all cursor-pointer inline-flex items-center"
                              title={`Download ${rep.report_name} (${rep.format || 'XLSX'})`}
                            >
                              {downloadingId === rep.id ? (
                                <RefreshCw size={14} className="animate-spin text-amber-500" />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteReport(rep.id, rep.report_name)}
                              disabled={actionInProgressId === rep.id}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete Report"
                            >
                              <Trash2 size={14} />
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
      </div>
    </div>
  );
};
