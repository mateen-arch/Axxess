import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface NonAdmittedPatientsViewProps {
  onBack: () => void;
  onAdmitPatient?: (mrn: string) => void;
  onSelectPatient?: (patientName: string) => void;
}

interface NonAdmittedPatient {
  id: string;
  mrn: string;
  patientName: string;
  insurance: string;
  address: string;
  dateOfBirth: string;
  phone: string;
  gender: string;
  nonAdmitReason: string;
  nonAdmitDate: string;
  branch: string;
}

const SAMPLE_NON_ADMITTED_PATIENTS: NonAdmittedPatient[] = [
  {
    id: 'na-1',
    mrn: '449',
    patientName: 'Acevedo, Sariah',
    insurance: 'MEDICAID MASSACHUSETTS',
    address: '19 Short Street, LAWRENCE MA 01841',
    dateOfBirth: '07/05/2013',
    phone: '(978) 809-9419',
    gender: 'Female',
    nonAdmitReason: 'Other',
    nonAdmitDate: '10/06/2017',
    branch: 'Standards Home Care',
  },
  {
    id: 'na-2',
    mrn: '1144',
    patientName: 'Adams, Sheary',
    insurance: 'COMMONWEALTH CARE ALLIANCE',
    address: '490 Rantoul St unit 24, BEVERLY MA 01915',
    dateOfBirth: '06/13/1966',
    phone: '(978) 786-1432',
    gender: 'Female',
    nonAdmitReason: 'On Service with Another Agency; Referral Refused Service',
    nonAdmitDate: '02/21/2025',
    branch: 'Standards Home Care',
  },
  {
    id: 'na-3',
    mrn: '248',
    patientName: 'Adnan, Mohammadha',
    insurance: 'MEDICAID MASSACHUSETTS',
    address: '12 Valley St. #310, EVERETT MA 02149',
    dateOfBirth: '01/17/2014',
    phone: '(857) 919-9232',
    gender: 'Male',
    nonAdmitReason: 'Other',
    nonAdmitDate: '09/27/2017',
    branch: 'Standards Home Care',
  },
  {
    id: 'na-4',
    mrn: '1015',
    patientName: 'Ajufor, Veronica',
    insurance: 'MEDICAID MASSACHUSETTS',
    address: '50 Warren Street #324, PEABODY MA 01960',
    dateOfBirth: '08/14/1950',
    phone: '(781) 732-9006',
    gender: 'Female',
    nonAdmitReason: 'Redirected to alternate care facility',
    nonAdmitDate: '08/02/2019',
    branch: 'Standards Home Care',
  },
  {
    id: 'na-5',
    mrn: '1016',
    patientName: 'Albert, Baby Boy',
    insurance: 'BLUE CROSS BLUE SHIELD OF MASS',
    address: '24 LEXINGTON ST, WOBURN MA 01801',
    dateOfBirth: '08/16/2018',
    phone: '(857) 318-2950',
    gender: 'Male',
    nonAdmitReason: 'Not a Provider',
    nonAdmitDate: '08/29/2018',
    branch: 'Standards Home Care',
  },
];

export const NonAdmittedPatientsView: React.FC<NonAdmittedPatientsViewProps> = ({
  onBack,
  onAdmitPatient,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('Standards Home Care');
  const [selectedTag, setSelectedTag] = useState('Select Option');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof NonAdmittedPatient>('patientName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSort = (field: keyof NonAdmittedPatient) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredPatients = useMemo(() => {
    return SAMPLE_NON_ADMITTED_PATIENTS.filter((p) => {
      if (selectedBranch !== 'All' && p.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.patientName.toLowerCase().includes(q) ||
          p.mrn.includes(q) ||
          p.insurance.toLowerCase().includes(q) ||
          p.nonAdmitReason.toLowerCase().includes(q)
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
  }, [selectedBranch, searchQuery, sortField, sortOrder]);

  const handleExportToExcel = () => {
    const headers = [
      'MRN',
      'Patient Name',
      'Insurance',
      'Address',
      'Date of Birth',
      'Phone',
      'Gender',
      'Non-Admit Reason',
      'Non-Admit Date',
    ];
    const rows = filteredPatients.map((p) => [
      `"${p.mrn}"`,
      `"${p.patientName}"`,
      `"${p.insurance}"`,
      `"${p.address}"`,
      `"${p.dateOfBirth}"`,
      `"${p.phone}"`,
      `"${p.gender}"`,
      `"${p.nonAdmitReason}"`,
      `"${p.nonAdmitDate}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Non_Admitted_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Non-Admitted Patients exported to Excel.');
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
                Patients
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Non-Admissions
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Non-Admitted Patients Registry & Reason Documentation
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Non-admissions registry refreshed.')}
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
          Non-Admitted Patients List
        </h2>

        {/* Single Row Filter & Actions Bar matching screenshot media_1794162485748_59c6a7ab.png */}
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

              {/* Tags */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Select Option">Select Option</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Follow-up Required">Follow-up Required</option>
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

            {/* Right Button: Export to Excel */}
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

        {/* Table Card - Beautifully framed columns without horizontal scrollbars */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th
                    onClick={() => handleSort('mrn')}
                    className="py-3 px-3 w-16 cursor-pointer hover:text-rose-700 transition"
                  >
                    MRN {sortField === 'mrn' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('patientName')}
                    className="py-3 px-3 w-40 cursor-pointer hover:text-rose-700 transition"
                  >
                    Patient Name {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('insurance')}
                    className="py-3 px-3 w-44 cursor-pointer hover:text-rose-700 transition"
                  >
                    Insurance {sortField === 'insurance' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-3 w-48 truncate">Address</th>
                  <th
                    onClick={() => handleSort('dateOfBirth')}
                    className="py-3 px-3 w-24 cursor-pointer hover:text-rose-700 transition"
                  >
                    Date of Birth {sortField === 'dateOfBirth' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-3 w-28">Phone</th>
                  <th
                    onClick={() => handleSort('nonAdmitReason')}
                    className="py-3 px-3 w-52 cursor-pointer hover:text-rose-700 transition"
                  >
                    Non-Admit Reason {sortField === 'nonAdmitReason' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('nonAdmitDate')}
                    className="py-3 px-3 w-24 cursor-pointer hover:text-rose-700 transition"
                  >
                    Non-Admit Date {sortField === 'nonAdmitDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-500">
                      No non-admitted patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {p.mrn}
                      </td>
                      <td
                        onClick={() => onSelectPatient?.(p.patientName)}
                        className="py-3 px-3 font-bold text-rose-700 hover:text-rose-800 cursor-pointer truncate hover:underline"
                      >
                        {p.patientName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate">{p.insurance}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 truncate">{p.address}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">{p.dateOfBirth}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-mono">{p.phone}</td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium truncate">
                        {p.nonAdmitReason}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">{p.nonAdmitDate}</td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            onAdmitPatient?.(p.mrn);
                            showToast(`Initiating admission workflow for ${p.patientName}...`);
                          }}
                          className="font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                          Admit
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
            <div>329 total results</div>
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700"
                >
                  3
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

