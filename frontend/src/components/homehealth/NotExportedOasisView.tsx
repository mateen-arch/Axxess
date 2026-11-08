import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  Activity,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface NotExportedOasisViewProps {
  onBack: () => void;
}

interface OasisExportItem {
  id: string;
  patientName: string;
  assessmentType: string;
  assessmentDate: string;
  episode: string;
  insurance: string;
  status: string;
  branch: string;
}

const SAMPLE_OASIS_EXPORT_DATA: OasisExportItem[] = [];

export const NotExportedOasisView: React.FC<NotExportedOasisViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('2026-09-09');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof OasisExportItem>('patientName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSort = (field: keyof OasisExportItem) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    return SAMPLE_OASIS_EXPORT_DATA.filter((item) => {
      if (selectedBranch !== 'All' && item.branch !== selectedBranch) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.assessmentType.toLowerCase().includes(q) ||
          item.insurance.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedBranch, selectedStatus, searchQuery]);

  const handleExportToExcel = () => {
    const headers = ['Patient', 'Assessment', 'Assessment Date', 'Episode', 'Insurance', 'Status'];
    const rows = filteredData.map((d) => [
      `"${d.patientName}"`,
      `"${d.assessmentType}"`,
      `"${d.assessmentDate}"`,
      `"${d.episode}"`,
      `"${d.insurance}"`,
      `"${d.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Not_Exported_OASIS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Not Exported OASIS report exported to Excel.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

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
                View
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                OASIS Activity Logs
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Not Exported OASIS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                List of Not Exported OASIS Assessments
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('OASIS assessment queue refreshed.')}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Single Row Filter & Actions Bar matching screenshot media_1794161015889_9b872863.png */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Branch */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Standards Home Care">Standards Home Care</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <Calendar size={13} className="text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Buttons: Generate, Export to Excel */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => showToast('Generated not exported OASIS assessments list.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export To Excel
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessments, patients, payers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredData.length} total results
          </div>
        </div>

        {/* Table Card matching exact columns */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th
                    onClick={() => handleSort('patientName')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Patient {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('assessmentType')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Assessment {sortField === 'assessmentType' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('assessmentDate')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Assessment Date {sortField === 'assessmentDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('episode')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Episode {sortField === 'episode' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('insurance')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Insurance {sortField === 'insurance' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                          No Data Found.
                        </span>
                        <p className="mt-1 text-xs text-slate-400">
                          All completed OASIS assessments for this date range have been exported to CMS.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 cursor-pointer">
                        {item.patientName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.assessmentType}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.assessmentDate}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.episode}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.insurance}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="rounded-lg bg-rose-700 px-3 py-1 text-xs font-bold text-white hover:bg-rose-800 transition"
                        >
                          Export
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>{filteredData.length} total results</div>
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                defaultValue="10"
                className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

