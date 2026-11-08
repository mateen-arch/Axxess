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
  Send,
  Printer as PrintIcon,
  ChevronLeft,
  ChevronRight,
  FileEdit,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface OrdersToBeSentViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface OrderToBeSentItem {
  id: string;
  orderNumber: string;
  branch: string;
  patientName: string;
  orderType: string;
  physicianName: string;
  deliveryMethod: string;
  orderDate: string;
  notes: string;
  status: 'Active' | 'Discharged' | 'Non-Admission';
}

const SAMPLE_ORDERS_TO_BE_SENT: OrderToBeSentItem[] = [
  {
    id: 'otbs-1',
    orderNumber: '70719295',
    branch: 'Standards Home Care',
    patientName: 'PUELLO, EDDY',
    orderType: 'Plan of Care',
    physicianName: 'RAHAL, ZAHRAA MD',
    deliveryMethod: 'Fax',
    orderDate: '10/26/2026',
    notes: 'Initial plan of care ready for MD signature fax transmission.',
    status: 'Active',
  },
  {
    id: 'otbs-2',
    orderNumber: '70451237',
    branch: 'Standards Home Care',
    patientName: 'DICATO, ANTHONY',
    orderType: 'Physician Order',
    physicianName: 'JIMADA, ZAINAB DNP',
    deliveryMethod: 'Fax',
    orderDate: '10/21/2026',
    notes: 'Medication regimen update and wound care change.',
    status: 'Active',
  },
  {
    id: 'otbs-3',
    orderNumber: '70728713',
    branch: 'Standards Home Care',
    patientName: 'DICATO, ANTHONY',
    orderType: 'Plan of Care',
    physicianName: 'JIMADA, ZAINAB DNP',
    deliveryMethod: 'Fax',
    orderDate: '10/21/2026',
    notes: '60-day recertification plan of care document.',
    status: 'Active',
  },
];

export const OrdersToBeSentView: React.FC<OrdersToBeSentViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [filterBy, setFilterBy] = useState('All');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [statusActive, setStatusActive] = useState(true);
  const [statusDischarged, setStatusDischarged] = useState(true);
  const [statusNonAdmission, setStatusNonAdmission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredOrders = useMemo(() => {
    return SAMPLE_ORDERS_TO_BE_SENT.filter((ord) => {
      if (selectedBranch !== 'All' && ord.branch !== selectedBranch) return false;
      if (ord.status === 'Active' && !statusActive) return false;
      if (ord.status === 'Discharged' && !statusDischarged) return false;
      if (ord.status === 'Non-Admission' && !statusNonAdmission) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ord.patientName.toLowerCase().includes(q) ||
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.physicianName.toLowerCase().includes(q) ||
          ord.orderType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedBranch, statusActive, statusDischarged, statusNonAdmission, searchQuery]);

  const handleSendSelected = () => {
    if (selectedOrderIds.size === 0) {
      showToast('Please select at least one order to send.');
      return;
    }
    showToast(`Successfully transmitted ${selectedOrderIds.size} order(s) via electronic fax.`);
    setSelectedOrderIds(new Set());
  };

  const handleBulkPrint = () => {
    if (selectedOrderIds.size === 0) {
      showToast('Please select at least one order to bulk print.');
      return;
    }
    showToast(`Generating bulk print PDF for ${selectedOrderIds.size} order(s)...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportToExcel = () => {
    const headers = [
      'Order',
      'Branch',
      'Patient',
      'Type',
      'Physician',
      'Delivery Method',
      'Order Date',
      'Notes',
    ];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.branch}"`,
      `"${o.patientName}"`,
      `"${o.orderType}"`,
      `"${o.physicianName}"`,
      `"${o.deliveryMethod}"`,
      `"${o.orderDate}"`,
      `"${o.notes}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Orders_To_Be_Sent_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders To Be Sent exported to Excel.');
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
                Orders Management
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Orders To Be Sent
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Outbound physician order transmission & tracking queue
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Orders queue refreshed.')}
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
        {/* Single Row Filter & Actions Bar matching screenshot media_1794161228221_21e7d5d2.png */}
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

              {/* Filter By */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Plan of Care">Plan of Care</option>
                  <option value="Physician Order">Physician Order</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
                <span className="text-slate-400 font-bold">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
              </div>

              {/* Status Checkboxes */}
              <div className="flex items-center gap-2.5 px-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusActive}
                    onChange={(e) => setStatusActive(e.target.checked)}
                    className="accent-rose-700 rounded"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusDischarged}
                    onChange={(e) => setStatusDischarged(e.target.checked)}
                    className="accent-rose-700 rounded"
                  />
                  <span>Discharged</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusNonAdmission}
                    onChange={(e) => setStatusNonAdmission(e.target.checked)}
                    className="accent-rose-700 rounded"
                  />
                  <span>Non-Admission</span>
                </label>
              </div>
            </div>

            {/* Right Buttons: Send, Export to Excel, Bulk Print (all red) */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSendSelected}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export to Excel
              </button>
              <button
                type="button"
                onClick={handleBulkPrint}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <PrintIcon className="h-3.5 w-3.5" />
                Bulk Print
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Row with Generate Button matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Start Typing"
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
            <button
              type="button"
              onClick={() => showToast('Generated outbound orders to be sent.')}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer shrink-0"
            >
              Generate
            </button>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredOrders.length} orders queued for delivery
          </div>
        </div>

        {/* Table Card matching exact columns */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleToggleSelectAll}
                      className="accent-rose-700 rounded"
                    />
                  </th>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Physician</th>
                  <th className="py-3 px-3">Delivery Method</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3 text-center">Notes</th>
                  <th className="py-3 px-3 text-center">Print</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-slate-500">
                      No orders found to be sent.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isSelected = selectedOrderIds.has(ord.id);
                    return (
                      <tr
                        key={ord.id}
                        className={`border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20 ${
                          isSelected ? 'bg-rose-50/40 dark:bg-rose-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOrder(ord.id)}
                            className="accent-rose-700 rounded"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{ord.branch}</td>
                        <td
                          onClick={() => onSelectPatient?.(ord.patientName)}
                          className="py-3 px-3 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                        >
                          {ord.patientName}
                        </td>
                        <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                          {ord.orderType}
                        </td>
                        <td className="py-3 px-3 text-rose-700 font-semibold cursor-pointer hover:underline">
                          {ord.physicianName}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{ord.deliveryMethod}</td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{ord.orderDate}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            title={ord.notes}
                            onClick={() => showToast(`Notes for #${ord.orderNumber}: ${ord.notes}`)}
                            className="text-slate-500 hover:text-rose-700 p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <FileText size={15} />
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            title="Print Order"
                            onClick={() => {
                              showToast(`Printing order #${ord.orderNumber}...`);
                              setTimeout(() => window.print(), 400);
                            }}
                            className="text-slate-500 hover:text-rose-700 p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <PrintIcon size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>{filteredOrders.length} total results</div>
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

