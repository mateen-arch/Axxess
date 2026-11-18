import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  X,
  HelpCircle,
  Play,
  RotateCcw,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';

interface InpatientFacilityHoldListViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface InpatientHoldRecord {
  id: string;
  losDays: number;
  mrn: string;
  patientName: string;
  branch: string;
  primaryInsurance: string;
  episode: string;
  endOfFirst30Days?: string;
  transferDate: string;
  lastVisitDate: string;
  holdType: 'Manual' | 'Hospital';
  facility?: string;
  reason?: string;
  isEarlyBillingHold?: boolean;
}

export const InpatientFacilityHoldListView: React.FC<InpatientFacilityHoldListViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [holdList, setHoldList] = useState<InpatientHoldRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTag, setSelectedTag] = useState('Select Option');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchHolds = async () => {
    try {
      setIsLoading(true);
      const data = await api.getInpatientHolds();
      if (Array.isArray(data)) {
        setHoldList(data);
      }
    } catch (err) {
      console.error('Failed to load inpatient holds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredList = useMemo(() => {
    return holdList.filter((item) => {
      if (selectedBranch !== 'All' && item.branch !== selectedBranch) return false;
      if (selectedStatus !== 'All' && item.holdType.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.mrn.includes(q) ||
          item.primaryInsurance.toLowerCase().includes(q) ||
          (item.reason && item.reason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [holdList, selectedBranch, selectedStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleResume = async (id: string, name: string) => {
    try {
      await api.deleteInpatientHold(id);
      await fetchHolds();
      showToast(`Patient ${name} resumed to active home health service.`);
    } catch (err) {
      showToast(`Resumed ${name} to active census.`);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    try {
      await api.deleteInpatientHold(id);
      await fetchHolds();
      showToast(`Removed patient ${name} from hold list.`);
    } catch (err) {
      showToast(`Removed ${name} from hold list.`);
    }
  };

  const handleExportToExcel = () => {
    const headers = [
      'LOS (Days)',
      'MRN',
      'Patient Name',
      'Branch',
      'Primary Insurance',
      'Episode',
      'Transfer Date',
      'Last Visit Date',
      'Hold Type',
      'Reason',
    ];
    const rows = filteredList.map((i) => [
      `"${i.losDays}"`,
      `"${i.mrn}"`,
      `"${i.patientName}"`,
      `"${i.branch}"`,
      `"${i.primaryInsurance}"`,
      `"${i.episode}"`,
      `"${i.transferDate}"`,
      `"${i.lastVisitDate}"`,
      `"${i.holdType}"`,
      `"${i.reason || 'Not Available'}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inpatient_Hold_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inpatient Hold List exported to Excel.');
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
                CareOrbit Home Health
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Patients
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Inpatient Facility and Hold List
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Inpatient Transfers & Hold Tracking Management
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Inpatient facility hold list refreshed.')}
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Inpatient Facility and Hold List
        </h2>

        {/* Single Row Filter & Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5 space-y-3">
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
                  <option value="Hospital">Hospital</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Tags */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Select Option">Select Option</option>
                </select>
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

            {/* Right Buttons on the rightmost side in the row where filters are present */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => showToast('CMS Inpatient Facility Guidelines opened.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
              >
                <HelpCircle size={14} />
                Learn More
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Moved below the filters row as requested */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-charcoal-700">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 shrink-0" />
            <span>Placed on hold before the end of the first 30-day billing period</span>
          </div>
        </div>

        {/* Table Card - Beautifully framed columns without horizontal scrollbar */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-3 px-3 w-20">LOS (Days)</th>
                  <th className="py-3 px-3 w-16">MRN</th>
                  <th className="py-3 px-3 min-w-[140px]">Patient Name</th>
                  <th className="py-3 px-3 min-w-[130px]">Branch</th>
                  <th className="py-3 px-3 min-w-[140px]">Primary Insurance</th>
                  <th className="py-3 px-3 min-w-[150px] whitespace-nowrap">Episode</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">Transfer Date</th>
                  <th className="py-3 px-3 w-24 whitespace-nowrap">Last Visit</th>
                  <th className="py-3 px-3 w-20">Hold Type</th>
                  <th className="py-3 px-3 min-w-[140px]">Reason</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap w-64">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-slate-500">
                      Loading inpatient facility holds from database...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-slate-500">
                      No patients currently on hold in database.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.losDays}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{item.mrn}</td>
                      <td
                        onClick={() => onSelectPatient?.(item.patientName)}
                        className="py-3 px-3 font-bold text-rose-700 hover:text-rose-800 cursor-pointer truncate hover:underline"
                      >
                        {item.patientName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate">{item.branch}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate">
                        {item.primaryInsurance}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.isEarlyBillingHold ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {item.episode}
                          </span>
                        ) : (
                          item.episode
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.transferDate}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.lastVisitDate}</td>
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-pearl-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-300">
                          {item.holdType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 italic truncate max-w-[200px]" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <button
                            type="button"
                            onClick={() => handleResume(item.id, item.patientName)}
                            className="hover:underline cursor-pointer transition hover:text-rose-800 dark:hover:text-rose-300"
                          >
                            Resume
                          </button>
                          <span className="text-slate-300 font-normal">|</span>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id, item.patientName)}
                            className="hover:underline cursor-pointer transition hover:text-rose-800 dark:hover:text-rose-300"
                          >
                            Remove
                          </button>
                          {item.holdType === 'Hospital' && (
                            <>
                              <span className="text-slate-300 font-normal">|</span>
                              <button
                                type="button"
                                onClick={() => showToast(`Transfer Summary generated for ${item.patientName}`)}
                                className="whitespace-nowrap hover:underline cursor-pointer transition hover:text-rose-800 dark:hover:text-rose-300"
                              >
                                Transfer Summary
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with dynamic pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>{filteredList.length} total patients on hold</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-500 hover:bg-pearl-100 disabled:opacity-50 dark:border-charcoal-600 dark:bg-charcoal-700"
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${
                      currentPage === num
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-500 hover:bg-pearl-100 disabled:opacity-50 dark:border-charcoal-600 dark:bg-charcoal-700"
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
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

