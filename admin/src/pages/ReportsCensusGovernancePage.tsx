import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Plus,
  Edit2,
  Upload,
  FileText,
  X,
  Paperclip
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

  // Add / Edit Report Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AdminReportItem | null>(null);
  const [reportName, setReportName] = useState('');
  const [categoryName, setCategoryName] = useState('Patient Reports');
  const [description, setDescription] = useState('');
  const [fileFormat, setFileFormat] = useState('XLSX');
  const [requestedBy, setRequestedBy] = useState('Director of Clinical Services');
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending_approval'>('approved');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileBase64, setAttachedFileBase64] = useState('');
  const [attachedFileSize, setAttachedFileSize] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleOpenAddModal = () => {
    setEditingReport(null);
    setReportName('');
    setCategoryName('Patient Reports');
    setDescription('');
    setFileFormat('XLSX');
    setRequestedBy('Director of Clinical Services');
    setApprovalStatus('approved');
    setAttachedFileName('');
    setAttachedFileBase64('');
    setAttachedFileSize(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rep: AdminReportItem) => {
    setEditingReport(rep);
    setReportName(rep.report_name);
    setCategoryName(rep.category || 'Patient Reports');
    setDescription(rep.description || '');
    setFileFormat((rep.format || 'XLSX').toUpperCase());
    setRequestedBy(rep.requested_by || 'Director of Clinical Services');
    setApprovalStatus(rep.approval_status === 'pending_approval' ? 'pending_approval' : 'approved');
    setAttachedFileName(rep.file_name || '');
    setAttachedFileBase64('');
    setAttachedFileSize(rep.file_size_bytes || 0);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFileName(file.name);
    setAttachedFileSize(file.size);
    const ext = file.name.split('.').pop()?.toUpperCase();
    if (ext && ['XLSX', 'XLS', 'CSV', 'PDF', 'DOCX', 'DOC', 'TXT'].includes(ext)) {
      setFileFormat(ext === 'XLS' ? 'XLSX' : ext);
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedFileBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim()) {
      showToast('Please enter a report name.', 'error');
      return;
    }
    try {
      setIsSaving(true);
      const payload: any = {
        report_name: reportName.trim(),
        category_name: categoryName,
        description: description.trim(),
        file_format: fileFormat,
        requested_by: requestedBy.trim() || 'System Administrator',
        approval_status: approvalStatus,
      };
      if (attachedFileBase64) {
        payload.file_name = attachedFileName;
        payload.file_data_base64 = attachedFileBase64;
      }

      if (editingReport) {
        const res = await adminApi.updateReport(editingReport.id, payload);
        if (res.success) {
          showToast(`Report "${reportName}" updated successfully!`, 'success');
          setIsModalOpen(false);
          triggerRefresh();
        }
      } else {
        const res = await adminApi.createReport(payload);
        if (res.success) {
          showToast(`Report "${reportName}" added and synced to Reports & Census!`, 'success');
          setIsModalOpen(false);
          triggerRefresh();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save report', 'error');
    } finally {
      setIsSaving(false);
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
              Supervise clinical & operational census intelligence across branches. Approved reports appear directly in Reports & Census.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Report</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
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
                              onClick={() => handleOpenEditModal(rep)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer inline-flex items-center"
                              title="Edit Report"
                            >
                              <Edit2 size={14} />
                            </button>

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

      {/* Add / Edit Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={18} />
                <h3 className="text-sm font-black tracking-tight">
                  {editingReport ? 'Edit Report' : 'Add New Report'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  required
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g. Monthly Clinical Census Summary"
                  className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Patient Reports">Patient Reports</option>
                    <option value="Schedule Reports">Schedule Reports</option>
                    <option value="Employee Reports">Employee Reports</option>
                    <option value="Clinician Reports">Clinician Reports</option>
                    <option value="Billing & Financial">Billing & Financial</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Format
                  </label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="XLSX">XLSX (Excel)</option>
                    <option value="CSV">CSV</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX (Word)</option>
                    <option value="TXT">TXT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requested By / Author
                  </label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    placeholder="Director of Clinical Services"
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as 'approved' | 'pending_approval')}
                    className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="approved">Published (Visible in Reports & Census)</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose and clinical scope of this report..."
                  className="w-full px-3 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Report File {editingReport ? '(Optional — leave empty to keep existing file)' : '(XLSX, CSV, PDF, DOCX)'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-pearl-300 dark:border-charcoal-600 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition bg-pearl-50/40 dark:bg-charcoal-800/40"
                >
                  {attachedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                      <Paperclip size={15} className="text-amber-500" />
                      <span className="truncate max-w-[260px]">{attachedFileName}</span>
                      {attachedFileSize > 0 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          ({Math.max(1, Math.round(attachedFileSize / 1024))} KB)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Upload size={20} className="text-amber-500" />
                      <span className="font-bold">Click to attach a report file</span>
                      <span className="text-[10px]">Supports .xlsx, .csv, .pdf, .docx up to 50MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-pearl-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isSaving ? 'Saving...' : editingReport ? 'Save Changes' : 'Add Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
