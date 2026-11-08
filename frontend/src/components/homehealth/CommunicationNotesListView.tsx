import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface CommunicationNotesListViewProps {
  onBack: () => void;
  onNewCommunicationNote?: () => void;
}

export interface CommunicationNoteListItem {
  id: string;
  patientName: string;
  mrn: string;
  date: string;
  type: string;
  createdBy: string;
  status: 'Approved' | 'Pending' | 'Draft';
}

export const INITIAL_COMMUNICATION_NOTES: CommunicationNoteListItem[] = [
  {
    id: 'cn-1',
    patientName: 'DEMERS, KENNETH',
    mrn: '1054',
    date: '11/04/2026',
    type: 'Verbal Order / Physician Coordination',
    createdBy: 'Hilder Magessa RN',
    status: 'Approved',
  },
  {
    id: 'cn-2',
    patientName: 'DICATO, ANTHONY',
    mrn: '1021',
    date: '11/03/2026',
    type: 'Caregiver Update - Post-Discharge Followup',
    createdBy: 'Afia Osei Assibey RN',
    status: 'Approved',
  },
  {
    id: 'cn-3',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    date: '11/02/2026',
    type: 'Mass Health PA Approvals - Skilled Nursing',
    createdBy: 'Hilder Magessa RN',
    status: 'Approved',
  },
  {
    id: 'cn-4',
    patientName: 'ANIS, MARIE',
    mrn: '1036',
    date: '11/01/2026',
    type: 'Pharmacy Coordination - Insulin Delivery',
    createdBy: 'Jeffrey Antoniotti LPN',
    status: 'Approved',
  },
  {
    id: 'cn-5',
    patientName: 'ANTOINE, LOUIS',
    mrn: '1002',
    date: '10/30/2026',
    type: 'Physical Therapy Evaluation Update',
    createdBy: 'Marcus Chen PT',
    status: 'Approved',
  },
  {
    id: 'cn-6',
    patientName: 'AUGUSTE, JOCELENE',
    mrn: '464',
    date: '10/28/2026',
    type: 'DME Supplier Coordination - Walker Delivery',
    createdBy: 'Agness Chirwa LPN',
    status: 'Approved',
  },
  {
    id: 'cn-7',
    patientName: 'BAH, ISATOU',
    mrn: '1043',
    date: '10/25/2026',
    type: 'Physician Addendum - Wound Dressing Change',
    createdBy: 'Hilder Magessa RN',
    status: 'Approved',
  },
  {
    id: 'cn-8',
    patientName: 'BALLAN, JAMES',
    mrn: '404',
    date: '10/22/2026',
    type: 'Case Conference Coordination with PCP',
    createdBy: 'Agnes Moses',
    status: 'Approved',
  },
];

export const CommunicationNotesListView: React.FC<CommunicationNotesListViewProps> = ({
  onBack,
  onNewCommunicationNote,
}) => {
  const { organization } = useHealthcare();

  const [notes, setNotes] = useState<CommunicationNoteListItem[]>(INITIAL_COMMUNICATION_NOTES);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.patientName.toLowerCase().includes(q) ||
        n.mrn.includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.createdBy.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const totalResults = 101; // Authentic screenshot total
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportToExcel = () => {
    const headers = ['Patient Name', 'MRN', 'Date', 'Type / Subject', 'Created By', 'Status'];
    const rows = filteredNotes.map((n) => [
      `"${n.patientName}"`,
      `"${n.mrn}"`,
      `"${n.date}"`,
      `"${n.type}"`,
      `"${n.createdBy}"`,
      `"${n.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Communication_Notes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Communication Notes exported to Excel.');
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
                Communication Notes
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Physician Verbal Orders & Caregiver Communication Log
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Communication notes refreshed.')}
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
            {/* Left Filter: Date Range */}
            <div className="flex items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 py-1 text-xs shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none dark:text-slate-200"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none dark:text-slate-200"
              />
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onNewCommunicationNote}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Comm Note
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
              placeholder="Search by patient name, MRN, topic, clinician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredNotes.length}</span> notes ({totalResults} total archived)
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4 w-52">Patient Name ▲</th>
                  <th className="py-2.5 px-4 w-24">MRN</th>
                  <th className="py-2.5 px-4 w-28">Date</th>
                  <th className="py-2.5 px-4">Type / Subject</th>
                  <th className="py-2.5 px-4 w-44">Created By</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status</th>
                  <th className="py-2.5 pr-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No communication notes found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedNotes.map((note) => (
                    <tr
                      key={note.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 dark:text-rose-400 cursor-pointer truncate">
                        {note.patientName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {note.mrn}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {note.date}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium truncate">
                        {note.type}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate">
                        {note.createdBy}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {note.status}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Print Communication Note"
                            onClick={() => window.print()}
                            className="rounded p-1 text-slate-600 hover:bg-pearl-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
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
    </div>
  );
};

