import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  History,
  RotateCcw,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface NonAdmitReasonsViewProps {
  onBack: () => void;
  onOpenLog?: () => void;
}

export interface NonAdmitReasonItem {
  id: string;
  reason: string;
  created: string;
  modified: string;
  status: 'Active' | 'Inactive';
}

export const INITIAL_NON_ADMIT_REASONS: NonAdmitReasonItem[] = [
  { id: 'nar-1', reason: 'Died', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-2', reason: 'Hospital Admission', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-3', reason: 'Inappropriate for Home Care', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-4', reason: 'Insurance Quota', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-5', reason: 'No PT Staff', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-6', reason: 'No SN Staff', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-7', reason: 'No Willing/Able Caregiver', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-8', reason: 'Not a Provider', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-9', reason: 'Patient Refused Services', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-10', reason: 'Moved Out of Service Area', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-11', reason: 'Admitted to Inpatient Hospice', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-12', reason: 'Admitted to Skilled Nursing Facility (SNF)', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-13', reason: 'Physician Declined Home Care Orders', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-14', reason: 'Care Needs Exceed Home Care Scope', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-15', reason: 'No Payer Authorization Received', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-16', reason: 'Patient Has Alternative Provider', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-17', reason: 'Home Environment Unsafe', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-18', reason: 'Non-Compliance with Care Plan', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-19', reason: 'Duplicate Referral', created: 'Not Available', modified: 'Not Available', status: 'Active' },
  { id: 'nar-20', reason: 'Referral Cancelled by Family', created: 'Not Available', modified: 'Not Available', status: 'Active' },
];

export const NonAdmitReasonsView: React.FC<NonAdmitReasonsViewProps> = ({ onBack, onOpenLog }) => {
  const { organization } = useHealthcare();

  const [reasonList, setReasonList] = useState<NonAdmitReasonItem[]>(INITIAL_NON_ADMIT_REASONS);
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Inactive' | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Activity Log Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedReasonForLog, setSelectedReasonForLog] = useState<string | null>(null);

  // New Reason Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newReasonText, setNewReasonText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredReasons = useMemo(() => {
    return reasonList.filter((r) => {
      if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;
      if (searchQuery.trim() && !r.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [reasonList, selectedStatus, searchQuery]);

  const totalResults = 20; // 20 total results per screenshot
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedReasons = filteredReasons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenLogModal = (reasonText: string) => {
    setSelectedReasonForLog(reasonText);
    setLogModalOpen(true);
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonText.trim()) return;
    const today = new Date().toLocaleDateString('en-US');
    const created: NonAdmitReasonItem = {
      id: `nar-${Date.now()}`,
      reason: newReasonText.trim(),
      created: today,
      modified: today,
      status: 'Active',
    };
    setReasonList([created, ...reasonList]);
    setNewReasonText('');
    setNewModalOpen(false);
    showToast(`Added non-admit reason: ${created.reason}`);
  };

  const handleExportToExcel = () => {
    const headers = ['Reason', 'Created', 'Modified', 'Status'];
    const rows = filteredReasons.map((r) => [`"${r.reason}"`, `"${r.created}"`, `"${r.modified}"`, `"${r.status}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Non_Admit_Reasons_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Non-Admit Reasons exported to Excel.');
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
                Lists
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Non-Admit Reasons
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Non-Admission Justification & Tracking Roster
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Non-admit reasons refreshed.')}
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
        {/* Single Row Filter & Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Filter */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setNewModalOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Reason
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Separate compact row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {filteredReasons.length} reason(s) found
          </div>
        </div>

        {/* Reasons Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                <th className="py-2.5 px-4">Reason ▲</th>
                <th className="py-2.5 px-4 w-36">Created</th>
                <th className="py-2.5 px-4 w-36">Modified</th>
                <th className="py-2.5 pr-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReasons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No non-admit reasons found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                paginatedReasons.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white truncate">
                      {item.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                      {item.created}
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                      {item.modified}
                    </td>
                    <td className="py-3 pr-6 text-right">
                      <button
                        type="button"
                        title="View Non-Admit Reasons Log"
                        onClick={() => handleOpenLogModal(item.reason)}
                        className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800/80">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(2, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">{totalResults} total results</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Admit Reasons Log Modal (Matching Screenshot 2) */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Audit History
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Non-Admit Reasons Log {selectedReasonForLog ? `— ${selectedReasonForLog}` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Table matching Screenshot 2 */}
            <div className="mt-4 overflow-hidden rounded-xl border border-pearl-200 dark:border-charcoal-700">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                    <th className="py-2.5 px-4">User Name ▲</th>
                    <th className="py-2.5 px-4">Action Description</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-slate-500 font-bold dark:text-slate-400">
                      No Logs Found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Reason Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white">New Non-Admit Reason</h3>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddReason} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Reason Description: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patient moved to assisted living"
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="rounded-lg border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition active:scale-95 cursor-pointer"
                >
                  Save Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
