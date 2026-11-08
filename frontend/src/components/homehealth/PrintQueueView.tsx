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
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface PrintQueueViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

type GroupByOption = 'Patient' | 'Date' | 'Task' | 'Clinician';

interface PrintQueueItem {
  id: string;
  patientName: string;
  eventDate: string;
  task: string;
  status: string;
  userName: string;
  branch: string;
}

const SAMPLE_PRINT_QUEUE: PrintQueueItem[] = [
  {
    id: 'pq-1',
    patientName: 'ABUISSA, HEATHER',
    eventDate: '11/01/2026',
    task: 'LVN/LPN Visit',
    status: 'Submitted With Signature',
    userName: 'Marrio Fortune LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-2',
    patientName: 'ANIS, MARIE V.',
    eventDate: '11/01/2026',
    task: 'LPN - Oral Med. Management - AM',
    status: 'Submitted With Signature',
    userName: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-3',
    patientName: 'ANIS, MARIE V.',
    eventDate: '11/01/2026',
    task: 'LPN - Oral Med. Management - PM',
    status: 'Submitted With Signature',
    userName: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-4',
    patientName: 'ANTOINE, LOUIS',
    eventDate: '11/01/2026',
    task: 'RN - Oral Med. Management - AM',
    status: 'Submitted With Signature',
    userName: 'Emmanuella Damefils RN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-5',
    patientName: 'ANTOINE, LOUIS',
    eventDate: '11/01/2026',
    task: 'RN - Oral Med. Management - PM',
    status: 'Submitted With Signature',
    userName: 'Emmanuella Damefils RN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-6',
    patientName: 'ANTOINE, LOUIS',
    eventDate: '11/01/2026',
    task: 'HHA Visit',
    status: 'Completed',
    userName: 'Joana Antoine HHA',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-7',
    patientName: 'ANTONIOTTI, JEFFREY C.',
    eventDate: '11/01/2026',
    task: 'LPN - Oral Med. Management',
    status: 'Submitted With Signature',
    userName: 'Elcie Jean-Baptiste LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-8',
    patientName: 'BEATTIE, HELEN',
    eventDate: '11/01/2026',
    task: 'LPN - Oral Med. Management',
    status: 'Submitted With Signature',
    userName: 'Marrio Fortune LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-9',
    patientName: 'BEATTIE, HELEN',
    eventDate: '11/01/2026',
    task: 'HHA Visit',
    status: 'Completed',
    userName: 'Nagela Gustave HHA',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-10',
    patientName: 'DAMITIE, CEDENIEZE',
    eventDate: '11/01/2026',
    task: 'LPN - Oral Med. Management',
    status: 'Submitted With Signature',
    userName: 'Marrio Fortune LPN',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-11',
    patientName: 'DAVIS, JAMES',
    eventDate: '11/01/2026',
    task: 'HHA Visit',
    status: 'Completed',
    userName: 'Mchilloh Mkazilakwa HHA',
    branch: 'Standards Home Care',
  },
  {
    id: 'pq-12',
    patientName: 'DECEUS, JAVENS J.',
    eventDate: '11/01/2026',
    task: 'HHA Visit',
    status: 'Completed',
    userName: 'Esperance Dumas HHA',
    branch: 'Standards Home Care',
  },
];

export const PrintQueueView: React.FC<PrintQueueViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [itemsList, setItemsList] = useState<PrintQueueItem[]>(SAMPLE_PRINT_QUEUE);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [groupBy, setGroupBy] = useState<GroupByOption>('Date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      if (selectedBranch !== 'All' && item.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.task.toLowerCase().includes(q) ||
          item.userName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [itemsList, selectedBranch, searchQuery]);

  const handleMarkAsPrinted = () => {
    if (selectedIds.size === 0) {
      showToast('Please select at least one item to mark as printed.');
      return;
    }
    const count = selectedIds.size;
    setItemsList((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    showToast(`Marked ${count} item(s) as printed and removed from queue.`);
  };

  const handleExportToExcel = () => {
    const headers = ['Patient Name', 'Event Date', 'Task', 'Status', 'User Name'];
    const rows = filteredItems.map((i) => [
      `"${i.patientName}"`,
      `"${i.eventDate}"`,
      `"${i.task}"`,
      `"${i.status}"`,
      `"${i.userName}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Print_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Print Queue exported to Excel.');
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
                Print Queue
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Centralized Agency Batch Print & Document Archival Queue
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Print queue refreshed.')}
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
            <span>Print All</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Single Row Filter & Actions Bar matching screenshot media_1794161408754_91471a40.jpg */}
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

              {/* Date Range */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
                <span className="text-slate-400 font-bold">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast('Generated print queue results.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                Generate
              </button>
            </div>

            {/* Right Buttons: Export to Excel */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
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

          {/* Grouping Pills matching authentic layout */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-pearl-200/70 dark:border-charcoal-700/70">
            {(['Patient', 'Date', 'Task', 'Clinician'] as GroupByOption[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGroupBy(option)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  groupBy === option
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200'
                }`}
              >
                Group By {option}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card with Accordion Group matching screenshot */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                      onChange={handleToggleSelectAll}
                      className="accent-rose-700 rounded"
                    />
                  </th>
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Event Date</th>
                  <th className="py-3 px-3">Task</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3 text-center">Print</th>
                </tr>
              </thead>
              <tbody>
                {/* Accordion Group Row matching screenshot v Event Date: 11/01/2026 */}
                <tr className="border-b border-pearl-200 bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-750">
                  <td colSpan={7} className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => setIsGroupOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white hover:text-rose-700 cursor-pointer"
                    >
                      {isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>Event Date: 11/01/2026</span>
                    </button>
                  </td>
                </tr>

                {isGroupOpen &&
                  filteredItems.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20 ${
                          isSelected ? 'bg-rose-50/40 dark:bg-rose-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="accent-rose-700 rounded"
                          />
                        </td>
                        <td
                          onClick={() => onSelectPatient?.(item.patientName)}
                          className="py-3 px-3 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                        >
                          {item.patientName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{item.eventDate}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {item.task}
                        </td>
                        <td className="py-3 px-3">
                          <span className="rounded-full bg-pearl-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-300">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.userName}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            title="Print Task"
                            onClick={() => {
                              showToast(`Printing task document for ${item.patientName}...`);
                              setTimeout(() => window.print(), 300);
                            }}
                            className="text-slate-500 hover:text-rose-700 p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar matching screenshot */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/70 px-5 py-3 dark:border-charcoal-700 dark:bg-charcoal-750">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Total: 251
            </div>

            <button
              type="button"
              onClick={handleMarkAsPrinted}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-800 px-6 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Check size={14} />
              Mark As Printed
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedIds.size} of {filteredItems.length} selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

