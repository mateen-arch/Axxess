import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Shield,
  RotateCcw,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface InsurancesPayersListViewProps {
  onBack: () => void;
  onNewInsurancePayer: () => void;
  onEditInsurancePayer: (payerId: string) => void;
}

export interface InsurancePayerListItem {
  id: string;
  name: string;
  payerId: string;
  invoiceType: string;
  billType: string;
  status: 'Active' | 'Inactive';
}

export const INITIAL_INSURANCES_PAYERS: InsurancePayerListItem[] = [
  {
    id: 'pay-1',
    name: 'Aetna Senior Medicare',
    payerId: 'AETNA01',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-2',
    name: 'Blue Cross Blue Shield MA',
    payerId: 'BCBS01',
    invoiceType: 'CMS-1500 / 837P',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-3',
    name: 'CIGNA Commercial Health',
    payerId: 'CIGNA01',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-4',
    name: 'Commonwealth Care Alliance',
    payerId: 'CCA01',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-5',
    name: 'MassHealth Standard',
    payerId: 'MA001',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-6',
    name: 'Medicare Part A Traditional',
    payerId: 'CMS001',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-7',
    name: 'Sandata EVV Payer',
    payerId: 'SAN01',
    invoiceType: 'Electronic Visit Verification',
    billType: 'Direct EVV',
    status: 'Active',
  },
  {
    id: 'pay-8',
    name: 'Tufts Senior Care Options',
    payerId: 'TUFTS01',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-9',
    name: 'UnitedHealthcare Community',
    payerId: 'UHC01',
    invoiceType: 'UB-04 (CMS-1450)',
    billType: 'Home Health 32X',
    status: 'Active',
  },
  {
    id: 'pay-10',
    name: 'Veteran Affairs Community Care',
    payerId: 'VA001',
    invoiceType: 'CMS-1500 / 837P',
    billType: 'Home Health 32X',
    status: 'Active',
  },
];

export const InsurancesPayersListView: React.FC<InsurancesPayersListViewProps> = ({
  onBack,
  onNewInsurancePayer,
  onEditInsurancePayer,
}) => {
  const { organization } = useHealthcare();

  const [payers, setPayers] = useState<InsurancePayerListItem[]>(INITIAL_INSURANCES_PAYERS);
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Inactive' | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Logs modal
  const [selectedLogsPayer, setSelectedLogsPayer] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPayers = useMemo(() => {
    return payers.filter((p) => {
      if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.payerId.toLowerCase().includes(q) ||
          p.invoiceType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payers, selectedStatus, searchQuery]);

  const totalResults = 38; // Authentic screenshot total
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedPayers = filteredPayers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete insurance payer "${name}"?`)) {
      setPayers((prev) => prev.filter((p) => p.id !== id));
      showToast(`Payer "${name}" removed.`);
    }
  };

  const handleExportToExcel = () => {
    const headers = ['Name', 'Payer ID', 'Invoice Type', 'Bill Type', 'Status'];
    const rows = filteredPayers.map((p) => [
      `"${p.name}"`,
      `"${p.payerId}"`,
      `"${p.invoiceType}"`,
      `"${p.billType}"`,
      `"${p.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Insurance_Payers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Insurance / Payers List exported to Excel.');
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
                Insurance / Payers
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Health Plans, Clearinghouse EDI & Managed Care Contracts
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Insurance / Payers refreshed.')}
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
                onClick={onNewInsurancePayer}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Insurance/Payer
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export To Excel
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
              placeholder="Search payer name, ID, invoice type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredPayers.length}</span> payers ({totalResults} total plans)
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4 w-72">Name ▲</th>
                  <th className="py-2.5 px-4 w-32">Payer ID</th>
                  <th className="py-2.5 px-4">Invoice Type</th>
                  <th className="py-2.5 px-4 w-44">Bill Type</th>
                  <th className="py-2.5 pr-6 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No insurance payers found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedPayers.map((payer) => (
                    <tr
                      key={payer.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white truncate">
                        <button
                          type="button"
                          onClick={() => onEditInsurancePayer(payer.id)}
                          className="text-left font-bold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer truncate"
                        >
                          {payer.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {payer.payerId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate">
                        {payer.invoiceType}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {payer.billType}
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Insurance / Payer Logs"
                            onClick={() => setSelectedLogsPayer(payer.name)}
                            className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit Insurance / Payer"
                            onClick={() => onEditInsurancePayer(payer.id)}
                            className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Insurance / Payer"
                            onClick={() => handleDelete(payer.id, payer.name)}
                            className="rounded p-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map((pageNum) => (
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
                className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
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

      {/* Insurance / Payer Logs Modal (Matching Screenshot 9) */}
      {selectedLogsPayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">
                  List of Insurance/Payer Logs - {selectedLogsPayer}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogsPayer(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Table of logs */}
            <div className="mt-4 overflow-hidden rounded-xl border border-pearl-200 dark:border-charcoal-700">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                    <th className="py-2.5 px-3">User Name</th>
                    <th className="py-2.5 px-3">Action Description</th>
                    <th className="py-2.5 px-3 w-40">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-150 dark:divide-charcoal-700">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      Hilder Magessa RN
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      Updated Payer EDI Electronic Claims Payer ID to AETNA01
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      11/04/2026 14:22
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      Agnes Moses
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      Created Insurance/Payer profile for Standards Home Care
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      01/15/2024 09:10
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogsPayer(null)}
                className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-bold text-white hover:bg-rose-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

