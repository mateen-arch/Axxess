import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface DeletedPatientsViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface DeletedPatientRecord {
  id: string;
  branch: string;
  mrn: string;
  patientName: string;
  address: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male';
  phone: string;
  lastStatus: 'Pending' | 'Active' | 'Discharged';
}

const INITIAL_DELETED_PATIENTS: DeletedPatientRecord[] = [
  {
    id: 'dp-1',
    branch: 'Standards Home Care',
    mrn: '217',
    patientName: 'Caldor, Saint Anne',
    address: '107 Delaware Ave. Lowell MA 01854',
    dateOfBirth: '07/28/1936',
    gender: 'Female',
    phone: '(978) 601-7656',
    lastStatus: 'Pending',
  },
  {
    id: 'dp-2',
    branch: 'Standards Home Care',
    mrn: '707',
    patientName: 'Gardner, Marcia',
    address: '180 Harvard Street Leominster MA 01453',
    dateOfBirth: '07/16/1936',
    gender: 'Female',
    phone: '(978) 534-8136',
    lastStatus: 'Active',
  },
  {
    id: 'dp-3',
    branch: 'Standards Home Care',
    mrn: '697',
    patientName: 'Marxhausen, Gretchen',
    address: '91 Blossom Rd. Westport MA 02790',
    dateOfBirth: '10/28/1958',
    gender: 'Female',
    phone: '(508) 646-3529',
    lastStatus: 'Active',
  },
  {
    id: 'dp-4',
    branch: 'Standards Home Care',
    mrn: '1103',
    patientName: 'Patient, Test 2.',
    address: '100 Cummings Center Beverly MA 01915',
    dateOfBirth: '01/01/1952',
    gender: 'Female',
    phone: '(123) 456-7890',
    lastStatus: 'Active',
  },
  {
    id: 'dp-5',
    branch: 'Standards Home Care',
    mrn: '112',
    patientName: 'Practice, Practice P.',
    address: '100 Cummings Center Beverly MA 01915',
    dateOfBirth: '07/07/1977',
    gender: 'Male',
    phone: '(978) 922-0088',
    lastStatus: 'Active',
  },
  {
    id: 'dp-6',
    branch: 'Standards Home Care',
    mrn: '180',
    patientName: 'Shenette, Charles',
    address: '1740 Washington St. Apt. 6 Boston MA 02118',
    dateOfBirth: '09/01/2014',
    gender: 'Male',
    phone: '(857) 243-7161',
    lastStatus: 'Active',
  },
];

export const DeletedPatientsView: React.FC<DeletedPatientsViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  const [deletedList, setDeletedList] = useState<DeletedPatientRecord[]>(INITIAL_DELETED_PATIENTS);
  const [selectedBranch, setSelectedBranch] = useState('Standards Home Care');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPatients = useMemo(() => {
    return deletedList.filter((p) => {
      if (selectedBranch !== 'All' && p.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.patientName.toLowerCase().includes(q) ||
          p.mrn.includes(q) ||
          p.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [deletedList, selectedBranch, searchQuery]);

  const handleRestore = (id: string, name: string) => {
    setDeletedList((prev) => prev.filter((p) => p.id !== id));
    showToast(`Patient ${name} successfully restored to active census.`);
  };

  const handleExportToExcel = () => {
    const headers = ['Branch', 'MRN', 'Patient', 'Address', 'Date of Birth', 'Sex', 'Phone', 'Last Status'];
    const rows = filteredPatients.map((p) => [
      `"${p.branch}"`,
      `"${p.mrn}"`,
      `"${p.patientName}"`,
      `"${p.address}"`,
      `"${p.dateOfBirth}"`,
      `"${p.gender}"`,
      `"${p.phone}"`,
      `"${p.lastStatus}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Deleted_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Deleted Patients exported to Excel.');
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
                Deleted Patients
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Archived & Soft-Deleted Patient Record Recovery Portal
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Deleted patients list refreshed.')}
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Deleted Patients</h2>

        {/* Single Row Filter & Actions Bar matching screenshot media_1794162525680_502fc070.png */}
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 rounded-xl border border-pearl-300 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
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
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 w-20">MRN</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Date of Birth</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Last Status</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-500">
                      No deleted patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{p.branch}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {p.mrn}
                      </td>
                      <td
                        onClick={() => onSelectPatient?.(p.patientName)}
                        className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                      >
                        {p.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.address}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">{p.dateOfBirth}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.gender}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">{p.phone}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-pearl-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-300">
                          {p.lastStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRestore(p.id, p.patientName)}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-700 hover:bg-rose-800 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer matching screenshot */}
          <div className="flex items-center justify-between border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>7 total results</div>
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
  );
};

