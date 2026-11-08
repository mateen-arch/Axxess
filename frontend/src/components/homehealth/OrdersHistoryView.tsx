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
  Paperclip,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface OrdersHistoryViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface OrderHistoryRecord {
  id: string;
  orderNumber: string;
  patientName: string;
  orderType: string;
  physicianName: string;
  electronic: 'Yes' | 'No';
  orderDate: string;
  sentDate: string;
  receivedDate: string;
  mdSignDate: string;
  receivedBy: string;
  notes: string;
  branch: string;
  status: string;
}

const SAMPLE_ORDER_HISTORY: OrderHistoryRecord[] = [
  {
    id: 'oh-1',
    orderNumber: '69619606',
    patientName: 'JOINVILLE, ANTONIA',
    orderType: 'Physician Order',
    physicianName: 'SANNAPAREDDY, SASIKALA M.D.',
    electronic: 'No',
    orderDate: '10/28/2026',
    sentDate: '11/02/2026',
    receivedDate: 'Not Available',
    mdSignDate: 'Not Available',
    receivedBy: 'Not Available',
    notes: 'Routine order adjustments.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-2',
    orderNumber: '69658530',
    patientName: 'ANTONIOTTI, JEFFREY C.',
    orderType: 'Physician Order',
    physicianName: 'GUPTA, MAULSHREE MD',
    electronic: 'No',
    orderDate: '10/27/2026',
    sentDate: '11/05/2026',
    receivedDate: 'Not Available',
    mdSignDate: 'Not Available',
    receivedBy: 'Not Available',
    notes: 'Frequency alteration for SN services.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-3',
    orderNumber: '69635238',
    patientName: 'POINSON, PIERRE',
    orderType: 'Physician Order',
    physicianName: 'MUQQADUS, SYED M.D',
    electronic: 'No',
    orderDate: '11/02/2026',
    sentDate: '11/04/2026',
    receivedDate: 'Not Available',
    mdSignDate: 'Not Available',
    receivedBy: 'Not Available',
    notes: 'Medication change and lab order.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-4',
    orderNumber: '69632584',
    patientName: 'LEBLANC, MARK',
    orderType: 'Physician Order',
    physicianName: 'KOWALOFF, EDWARD M.D.',
    electronic: 'No',
    orderDate: '10/28/2026',
    sentDate: '11/03/2026',
    receivedDate: '11/04/2026',
    mdSignDate: '11/03/2026',
    receivedBy: 'Allen Santos',
    notes: 'Signed 485 POC received and filed.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-5',
    orderNumber: '70657232',
    patientName: 'GALVIN, THOMAS',
    orderType: 'Physician Order',
    physicianName: 'BAHNG, EDWARD M.D.',
    electronic: 'No',
    orderDate: '11/03/2026',
    sentDate: '11/04/2026',
    receivedDate: '11/05/2026',
    mdSignDate: '11/04/2026',
    receivedBy: 'Ailen Santos',
    notes: 'Physical therapy eval approval.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-6',
    orderNumber: '69632905',
    patientName: 'LUBIN, ODETTE L.',
    orderType: 'Physician Order',
    physicianName: 'YAO, YUAN M.D.',
    electronic: 'No',
    orderDate: '10/29/2026',
    sentDate: '11/03/2026',
    receivedDate: '11/05/2026',
    mdSignDate: '11/03/2026',
    receivedBy: 'Ailen Santos',
    notes: 'Supplemental skilled nurse visits authorized.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
  {
    id: 'oh-7',
    orderNumber: '70495796',
    patientName: 'ABUISSA, HEATHER',
    orderType: 'Physician Order',
    physicianName: 'RIGALI, LESLIE DO',
    electronic: 'No',
    orderDate: '10/26/2026',
    sentDate: '10/29/2026',
    receivedDate: 'Not Available',
    mdSignDate: 'Not Available',
    receivedBy: 'Not Available',
    notes: 'F2F encounter signed confirmation.',
    branch: 'Standards Home Care',
    status: 'Active',
  },
];

export const OrdersHistoryView: React.FC<OrdersHistoryViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [startDate, setStartDate] = useState('2026-10-25');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof OrderHistoryRecord>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSort = (field: keyof OrderHistoryRecord) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredOrders = useMemo(() => {
    return SAMPLE_ORDER_HISTORY.filter((ord) => {
      if (selectedBranch !== 'All' && ord.branch !== selectedBranch) return false;
      if (selectedStatus !== 'All' && ord.status !== selectedStatus) return false;
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
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [selectedBranch, selectedStatus, searchQuery, sortField, sortOrder]);

  const handleExportToExcel = () => {
    const headers = [
      'Order',
      'Patient',
      'Type',
      'Physician',
      'Electronic',
      'Order Date',
      'Sent Date',
      'Received Date',
      'MD Sign Date',
      'Received By',
    ];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.patientName}"`,
      `"${o.orderType}"`,
      `"${o.physicianName}"`,
      `"${o.electronic}"`,
      `"${o.orderDate}"`,
      `"${o.sentDate}"`,
      `"${o.receivedDate}"`,
      `"${o.mdSignDate}"`,
      `"${o.receivedBy}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Order_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Order History exported to Excel.');
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
                Order History
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Comprehensive historical audit log of clinical orders
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Order history refreshed.')}
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Order History</h2>

        {/* Single Row Filter & Actions Bar matching screenshot media_1794161326601_3eb00062.png */}
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
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="All">All</option>
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

        {/* Table Card - Beautifully framed columns without horizontal overflow */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th
                    onClick={() => handleSort('orderNumber')}
                    className="py-3 px-3 w-24 cursor-pointer hover:text-rose-700 transition"
                  >
                    Order {sortField === 'orderNumber' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('patientName')}
                    className="py-3 px-3 w-40 cursor-pointer hover:text-rose-700 transition"
                  >
                    Patient {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('orderType')}
                    className="py-3 px-3 w-36 cursor-pointer hover:text-rose-700 transition"
                  >
                    Type {sortField === 'orderType' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('physicianName')}
                    className="py-3 px-3 w-44 cursor-pointer hover:text-rose-700 transition"
                  >
                    Physician {sortField === 'physicianName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('electronic')}
                    className="py-3 px-2 w-20 text-center cursor-pointer hover:text-rose-700 transition"
                  >
                    Electronic {sortField === 'electronic' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('orderDate')}
                    className="py-3 px-3 w-24 cursor-pointer hover:text-rose-700 transition"
                  >
                    Order Date {sortField === 'orderDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('sentDate')}
                    className="py-3 px-3 w-24 cursor-pointer hover:text-rose-700 transition"
                  >
                    Sent Date {sortField === 'sentDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('receivedDate')}
                    className="py-3 px-3 w-28 cursor-pointer hover:text-rose-700 transition"
                  >
                    Received Date {sortField === 'receivedDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('mdSignDate')}
                    className="py-3 px-3 w-28 cursor-pointer hover:text-rose-700 transition"
                  >
                    MD Sign Date {sortField === 'mdSignDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('receivedBy')}
                    className="py-3 px-3 w-32 cursor-pointer hover:text-rose-700 transition"
                  >
                    Received By {sortField === 'receivedBy' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-3 w-24 text-center">Actions</th>
                  <th className="py-3 px-2 w-16 text-center">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-20 text-center text-slate-500">
                      No order history found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {ord.orderNumber}
                      </td>
                      <td
                        onClick={() => onSelectPatient?.(ord.patientName)}
                        className="py-3 px-3 font-bold text-rose-700 hover:text-rose-800 cursor-pointer truncate hover:underline"
                      >
                        {ord.patientName}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium truncate">
                        {ord.orderType}
                      </td>
                      <td className="py-3 px-3 font-semibold text-rose-700 hover:text-rose-800 cursor-pointer truncate hover:underline">
                        {ord.physicianName}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">{ord.electronic}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ord.orderDate}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ord.sentDate}</td>
                      <td className="py-3 px-3 text-slate-500 italic">{ord.receivedDate}</td>
                      <td className="py-3 px-3 text-slate-500 italic">{ord.mdSignDate}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate">{ord.receivedBy}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-400">
                          <button
                            type="button"
                            title="Edit Order"
                            onClick={() => showToast(`Edit order #${ord.orderNumber}`)}
                            className="p-1 hover:bg-pearl-100 rounded dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            title="Print Order"
                            onClick={() => {
                              showToast(`Printing order #${ord.orderNumber}...`);
                              setTimeout(() => window.print(), 300);
                            }}
                            className="p-1 hover:bg-pearl-100 rounded dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            type="button"
                            title="Attachments"
                            onClick={() => showToast(`Attachments for #${ord.orderNumber}`)}
                            className="p-1 hover:bg-pearl-100 rounded dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <Paperclip size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          title={ord.notes}
                          onClick={() => showToast(`Order #${ord.orderNumber} notes: ${ord.notes}`)}
                          className="text-slate-400 hover:text-rose-700 p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer"
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer matching screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>16 total results</div>
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700"
                >
                  2
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-500 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700"
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

