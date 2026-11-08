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
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface PastDueRecertificationsReportViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface PastDueRecertItem {
  id: string;
  branch: string;
  patientName: string;
  mrn: string;
  userName: string;
  status: string;
  dueDate: string;
  daysPastDue: number;
}

const SAMPLE_PAST_DUE_DATA: PastDueRecertItem[] = [
  {
    id: 'pd-1',
    branch: 'Standards Home Care',
    patientName: 'Deceus, Tyler',
    mrn: '355',
    userName: 'Nathalie Bernadeau RN',
    status: 'Saved',
    dueDate: '11/06/2026',
    daysPastDue: 6,
  },
];

export const PastDueRecertificationsReportView: React.FC<PastDueRecertificationsReportViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('Standards Home Care');
  const [selectedPayer, setSelectedPayer] = useState('37 Items Selected');
  const [startDate, setStartDate] = useState('2026-09-09');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof PastDueRecertItem>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSort = (field: keyof PastDueRecertItem) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    return SAMPLE_PAST_DUE_DATA.filter((item) => {
      if (selectedBranch !== 'All' && item.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.mrn.toLowerCase().includes(q) ||
          item.userName.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedBranch, searchQuery]);

  const handleExportToExcel = () => {
    const headers = ['Branch', 'Patient', 'MRN', 'User Name', 'Status', 'Due Date', 'Days Past Due'];
    const rows = filteredData.map((d) => [
      `"${d.branch}"`,
      `"${d.patientName}"`,
      `"${d.mrn}"`,
      `"${d.userName}"`,
      `"${d.status}"`,
      `"${d.dueDate}"`,
      `"${d.daysPastDue}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Past_Due_Recertifications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Past Due Recertifications Report exported to Excel.');
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
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Past Due Recertifications Report
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Clinical Episode Recertification Compliance Tracker
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Recertification report refreshed.')}
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
        {/* Title Heading with Info Icon matching screenshot media_1794161054792_b15395d7.png */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Past Due Recertifications Report
          </h2>
          <span title="Report Information" className="text-blue-600 cursor-pointer">
            <Info size={16} />
          </span>
        </div>

        {/* Single Row Filter & Actions Bar matching screenshot */}
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
                  <option value="Standards Home Care">Standards Home Care</option>
                  <option value="All">All Branches</option>
                </select>
              </div>

              {/* Payer */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payer:</span>
                <select
                  value={selectedPayer}
                  onChange={(e) => setSelectedPayer(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="37 Items Selected">37 Items Selected</option>
                  <option value="All Payers">All Payers</option>
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-44 rounded-xl border border-pearl-300 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Right Buttons: Export to Excel */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
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

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th
                    onClick={() => handleSort('branch')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Branch {sortField === 'branch' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('patientName')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Patient {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('mrn')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    MRN {sortField === 'mrn' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('userName')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    User Name {sortField === 'userName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('dueDate')}
                    className="py-3 px-4 cursor-pointer hover:text-rose-700 transition"
                  >
                    Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('daysPastDue')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-rose-700 transition"
                  >
                    Days Past Due {sortField === 'daysPastDue' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-500">
                      No past due recertifications found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{item.branch}</td>
                      <td
                        onClick={() => onSelectPatient?.(item.patientName)}
                        className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                      >
                        {item.patientName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{item.mrn}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{item.userName}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{item.dueDate}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-700 dark:text-rose-400">
                        {item.daysPastDue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer matching screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>1 total results</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-500 hover:bg-pearl-100 disabled:opacity-50 dark:border-charcoal-600 dark:bg-charcoal-700"
                  disabled
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-700 text-xs font-bold text-white shadow-2xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-500 hover:bg-pearl-100 disabled:opacity-50 dark:border-charcoal-600 dark:bg-charcoal-700"
                  disabled
                >
                  <ChevronRight size={13} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
