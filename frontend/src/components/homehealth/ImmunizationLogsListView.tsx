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
  CheckCircle2,
  Calendar,
  Syringe,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface ImmunizationLogsListViewProps {
  onBack: () => void;
  onNewImmunizationLog?: () => void;
}

export interface ImmunizationLogItem {
  id: string;
  patientName: string;
  mrn: string;
  vaccineName: string;
  status: 'Administered' | 'Declined' | 'Contraindicated';
  lotNumber: string;
  administeredDate: string;
  reasonIfDeclined: string;
  administeredBy: string;
}

export const INITIAL_IMMUNIZATIONS: ImmunizationLogItem[] = [
  {
    id: 'im-1',
    patientName: 'ABUISSA, HEATHER',
    mrn: '1061',
    vaccineName: 'Influenza (Fluvirin 0.5 mL)',
    status: 'Administered',
    lotNumber: 'FL88201',
    administeredDate: '10/14/2026',
    reasonIfDeclined: 'None',
    administeredBy: 'Hilder Magessa RN',
  },
  {
    id: 'im-2',
    patientName: 'ANIS, MARIE',
    mrn: '1036',
    vaccineName: 'Pneumococcal (Pneumovax 23)',
    status: 'Administered',
    lotNumber: 'PN49021',
    administeredDate: '09/20/2026',
    reasonIfDeclined: 'None',
    administeredBy: 'Afia Osei Assibey RN',
  },
  {
    id: 'im-3',
    patientName: 'ANTOINE, LOUIS',
    mrn: '1002',
    vaccineName: 'COVID-19 (Pfizer-BioNTech Bivalent)',
    status: 'Administered',
    lotNumber: 'CV93018',
    administeredDate: '10/05/2026',
    reasonIfDeclined: 'None',
    administeredBy: 'Hilder Magessa RN',
  },
  {
    id: 'im-4',
    patientName: 'AUGUSTE, JOCELENE',
    mrn: '464',
    vaccineName: 'Shingles (Shingrix Dose 1)',
    status: 'Declined',
    lotNumber: 'N/A',
    administeredDate: '10/18/2026',
    reasonIfDeclined: 'Patient declined due to prior severe injection site reaction',
    administeredBy: 'Agness Chirwa LPN',
  },
  {
    id: 'im-5',
    patientName: 'BAH, ISATOU',
    mrn: '1043',
    vaccineName: 'Influenza (Fluzone Quadrivalent)',
    status: 'Administered',
    lotNumber: 'FZ55102',
    administeredDate: '10/22/2026',
    reasonIfDeclined: 'None',
    administeredBy: 'Hilder Magessa RN',
  },
];

export const ImmunizationLogsListView: React.FC<ImmunizationLogsListViewProps> = ({
  onBack,
  onNewImmunizationLog,
}) => {
  const { organization } = useHealthcare();

  const [immunizations, setImmunizations] = useState<ImmunizationLogItem[]>(INITIAL_IMMUNIZATIONS);
  const [selectedVaccine, setSelectedVaccine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredLogs = useMemo(() => {
    return immunizations.filter((item) => {
      if (selectedVaccine !== 'All' && !item.vaccineName.toLowerCase().includes(selectedVaccine.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.mrn.includes(q) ||
          item.vaccineName.toLowerCase().includes(q) ||
          item.lotNumber.toLowerCase().includes(q) ||
          item.administeredBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [immunizations, selectedVaccine, searchQuery]);

  const totalResults = 86;
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportToExcel = () => {
    const headers = ['Patient Name', 'MRN', 'Vaccine Name', 'Status', 'Lot Number', 'Administered Date', 'Reason', 'Clinician'];
    const rows = filteredLogs.map((l) => [
      `"${l.patientName}"`,
      `"${l.mrn}"`,
      `"${l.vaccineName}"`,
      `"${l.status}"`,
      `"${l.lotNumber}"`,
      `"${l.administeredDate}"`,
      `"${l.reasonIfDeclined}"`,
      `"${l.administeredBy}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Immunization_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Immunization Logs exported to Excel.');
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
                Immunization Logs
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Vaccine Administration, Lot Tracking & Declination Roster
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Immunization logs refreshed.')}
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
            {/* Left Filter: Vaccine Type Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Influenza', 'Pneumococcal', 'COVID-19', 'Shingles'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedVaccine(type)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedVaccine === type
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onNewImmunizationLog}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Immunization Log
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
              placeholder="Search by patient, vaccine, lot number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredLogs.length}</span> records ({totalResults} total logged)
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4 w-48">Patient Name ▲</th>
                  <th className="py-2.5 px-4 w-24">MRN</th>
                  <th className="py-2.5 px-4">Vaccine Name</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status</th>
                  <th className="py-2.5 px-4 w-28">Lot #</th>
                  <th className="py-2.5 px-4 w-28">Date</th>
                  <th className="py-2.5 px-4 w-44">Administered By</th>
                  <th className="py-2.5 pr-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No immunization records found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-rose-700 dark:text-rose-400 truncate">
                        {log.patientName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {log.mrn}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium truncate">
                        {log.vaccineName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          log.status === 'Administered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {log.lotNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {log.administeredDate}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate">
                        {log.administeredBy}
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="rounded p-1 text-slate-600 hover:bg-pearl-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-charcoal-700 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
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

