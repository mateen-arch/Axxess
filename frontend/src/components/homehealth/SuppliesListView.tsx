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
  Package,
  RotateCcw,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface SuppliesListViewProps {
  onBack: () => void;
}

export interface SupplyItem {
  id: string;
  description: string;
  hcpcs: string;
  revenueCode: string;
  unitCost: number;
  status: 'Active' | 'Inactive';
}

export const INITIAL_SUPPLIES: SupplyItem[] = [
  {
    id: 'sup-1',
    description: '5% dextrose/normal saline (500 ml = 1 unit)',
    hcpcs: 'J7042',
    revenueCode: '',
    unitCost: 0,
    status: 'Active',
  },
  {
    id: 'sup-2',
    description: 'Abdominal pad 5" x 9"',
    hcpcs: 'A6251',
    revenueCode: '0270',
    unitCost: 1.25,
    status: 'Active',
  },
  {
    id: 'sup-3',
    description: 'Alcohol prep pads (box of 200)',
    hcpcs: 'A4245',
    revenueCode: '0270',
    unitCost: 3.5,
    status: 'Active',
  },
  {
    id: 'sup-4',
    description: 'Aquacel Ag Silver Dressing 4" x 4"',
    hcpcs: 'A6196',
    revenueCode: '0272',
    unitCost: 14.8,
    status: 'Active',
  },
  {
    id: 'sup-5',
    description: 'Bacitracin Zinc Ointment 1 oz',
    hcpcs: 'A6250',
    revenueCode: '0270',
    unitCost: 4.2,
    status: 'Active',
  },
  {
    id: 'sup-6',
    description: 'Barrier cream / skin protectant 4 oz',
    hcpcs: 'A6250',
    revenueCode: '0270',
    unitCost: 6.5,
    status: 'Active',
  },
  {
    id: 'sup-7',
    description: 'Blood glucose test strips (50/box)',
    hcpcs: 'A4253',
    revenueCode: '0270',
    unitCost: 22.0,
    status: 'Active',
  },
  {
    id: 'sup-8',
    description: 'Catheter insertion tray with 16 Fr Foley',
    hcpcs: 'A4311',
    revenueCode: '0272',
    unitCost: 12.5,
    status: 'Active',
  },
  {
    id: 'sup-9',
    description: 'ChloraPrep 3 mL applicator',
    hcpcs: 'A4247',
    revenueCode: '0270',
    unitCost: 5.75,
    status: 'Active',
  },
  {
    id: 'sup-10',
    description: 'Compression wrap 4"',
    hcpcs: 'A6444',
    revenueCode: '0270',
    unitCost: 3.1,
    status: 'Active',
  },
];

export const SuppliesListView: React.FC<SuppliesListViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  const [suppliesList, setSuppliesList] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Inactive' | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Add modal state
  const [editingSupply, setEditingSupply] = useState<SupplyItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editHcpcs, setEditHcpcs] = useState('');
  const [editRevenue, setEditRevenue] = useState('');
  const [editCost, setEditCost] = useState('0');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredSupplies = useMemo(() => {
    return suppliesList.filter((s) => {
      if (selectedStatus !== 'All' && s.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.description.toLowerCase().includes(q) ||
          s.hcpcs.toLowerCase().includes(q) ||
          s.revenueCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [suppliesList, selectedStatus, searchQuery]);

  const totalResults = 2794; // Authentic screenshot total
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedSupplies = filteredSupplies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenEdit = (supply: SupplyItem) => {
    setEditingSupply(supply);
    setEditDesc(supply.description);
    setEditHcpcs(supply.hcpcs);
    setEditRevenue(supply.revenueCode);
    setEditCost(String(supply.unitCost));
  };

  const handleSaveSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDesc.trim()) return;

    if (editingSupply) {
      setSuppliesList((prev) =>
        prev.map((s) =>
          s.id === editingSupply.id
            ? {
                ...s,
                description: editDesc.trim(),
                hcpcs: editHcpcs.trim(),
                revenueCode: editRevenue.trim(),
                unitCost: Number(editCost) || 0,
              }
            : s
        )
      );
      showToast(`Updated supply: ${editDesc}`);
      setEditingSupply(null);
    } else {
      const created: SupplyItem = {
        id: `sup-${Date.now()}`,
        description: editDesc.trim(),
        hcpcs: editHcpcs.trim(),
        revenueCode: editRevenue.trim(),
        unitCost: Number(editCost) || 0,
        status: 'Active',
      };
      setSuppliesList([created, ...suppliesList]);
      showToast(`Added supply: ${created.description}`);
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete supply item "${name}"?`)) {
      setSuppliesList((prev) => prev.filter((s) => s.id !== id));
      showToast(`Supply item removed.`);
    }
  };

  const handleExportToExcel = () => {
    const headers = ['Description', 'HCPCS', 'Revenue Code', 'Unit Cost', 'Status'];
    const rows = filteredSupplies.map((s) => [
      `"${s.description}"`,
      `"${s.hcpcs}"`,
      `"${s.revenueCode}"`,
      `"$${s.unitCost.toFixed(2)}"`,
      `"${s.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Supplies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Supplies List exported to Excel.');
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
                Supplies
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Medical & Clinical Supply Catalog
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Supplies refreshed.')}
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
                onClick={() => {
                  setEditingSupply(null);
                  setEditDesc('');
                  setEditHcpcs('');
                  setEditRevenue('');
                  setEditCost('0');
                  setIsAddModalOpen(true);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Supply
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
              placeholder="Search description, HCPCS code, revenue code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSupplies.length}</span> supplies ({totalResults} total catalog items)
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4">Description ▲</th>
                  <th className="py-2.5 px-4 w-32">HCPCS</th>
                  <th className="py-2.5 px-4 w-32">Revenue Code</th>
                  <th className="py-2.5 px-4 w-28 text-right">Unit Cost</th>
                  <th className="py-2.5 pr-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSupplies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No supplies found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedSupplies.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white truncate">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="text-left font-bold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer"
                        >
                          {item.description}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.hcpcs || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {item.revenueCode || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${item.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit Supply"
                            onClick={() => handleOpenEdit(item)}
                            className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Supply"
                            onClick={() => handleDelete(item.id, item.description)}
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
                {Array.from({ length: Math.min(8, totalPages) }, (_, i) => i + 1).map((pageNum) => (
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

      {/* Edit / New Supply Modal (Matching Screenshot 6) */}
      {(editingSupply || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800 overflow-hidden">
            {/* Modal Title Banner */}
            <div className="flex items-center justify-between bg-rose-700 px-5 py-3 text-white">
              <span className="text-xs font-bold tracking-wide">
                {editingSupply ? 'Edit Supply' : 'New Supply'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupply(null);
                    setIsAddModalOpen(false);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSupply} className="p-6 space-y-4">
              <div className="text-right text-[11px] font-semibold text-rose-600">
                *Required Field
              </div>

              {/* Form card inner container matching screenshot 6 */}
              <div className="rounded-xl border border-pearl-200 bg-pearl-50/50 p-5 dark:border-charcoal-700 dark:bg-charcoal-750/50 space-y-3.5">
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Description: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="e.g. 5% dextrose/normal saline (500 ml = 1 unit)"
                    className="col-span-2 h-9 w-full rounded-lg border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    HCPCS:
                  </label>
                  <input
                    type="text"
                    value={editHcpcs}
                    onChange={(e) => setEditHcpcs(e.target.value)}
                    placeholder="e.g. J7042"
                    className="col-span-2 h-9 w-full rounded-lg border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Revenue Code:
                  </label>
                  <input
                    type="text"
                    value={editRevenue}
                    onChange={(e) => setEditRevenue(e.target.value)}
                    placeholder="e.g. 0270"
                    className="col-span-2 h-9 w-full rounded-lg border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Unit Cost:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="col-span-2 h-9 w-full rounded-lg border border-pearl-300 bg-white px-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Bottom Actions Bar matching Screenshot 6 */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Activity Logs
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-rose-700 px-5 text-xs font-bold text-white shadow-sm hover:bg-rose-800 transition active:scale-95 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupply(null);
                      setIsAddModalOpen(false);
                    }}
                    className="h-9 rounded-xl border border-pearl-300 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-pearl-200 bg-white p-5 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                Activity Logs - Supply Catalog
              </span>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-6 text-center text-xs text-slate-400">
              No recent revision logs recorded for this catalog item.
            </div>
            <div className="flex justify-end pt-2 border-t border-pearl-150 dark:border-charcoal-700">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="rounded-xl bg-rose-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-800 cursor-pointer"
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

