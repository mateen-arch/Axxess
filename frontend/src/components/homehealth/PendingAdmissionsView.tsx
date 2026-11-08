import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface PendingAdmissionsViewProps {
  onBack: () => void;
  onNewPatient?: () => void;
  onAdmitPatient?: (mrn: string) => void;
  onEditPatient?: (mrn: string) => void;
}

interface PendingAdmissionRecord {
  id: string;
  mrn: string;
  patientName: string;
  primaryInsurance: string;
  branch: string;
  dateAdded: string;
}

const SAMPLE_PENDING_ADMISSIONS: PendingAdmissionRecord[] = [
  {
    id: 'padm-1',
    mrn: '1201',
    patientName: 'CLOUTMAN, MATTHEW',
    primaryInsurance: 'COMMONWEALTH CARE ALLIANCE',
    branch: 'Standards Home Care',
    dateAdded: '10/23/2026',
  },
  {
    id: 'padm-2',
    mrn: '1133',
    patientName: 'FEIGIN, MILES',
    primaryInsurance: 'BMC HEALTHNET PLAN',
    branch: 'Standards Home Care',
    dateAdded: '06/26/2024',
  },
];

export const PendingAdmissionsView: React.FC<PendingAdmissionsViewProps> = ({
  onBack,
  onNewPatient,
  onAdmitPatient,
  onEditPatient,
}) => {
  const { organization } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAdmissions = useMemo(() => {
    return SAMPLE_PENDING_ADMISSIONS.filter((item) => {
      if (selectedBranch !== 'All' && item.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.mrn.includes(q) ||
          item.primaryInsurance.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedBranch, searchQuery]);

  const handleExportToExcel = () => {
    const headers = ['MRN', 'Patient Name', 'Primary Insurance', 'Branch', 'Date Added'];
    const rows = filteredAdmissions.map((p) => [
      `"${p.mrn}"`,
      `"${p.patientName}"`,
      `"${p.primaryInsurance}"`,
      `"${p.branch}"`,
      `"${p.dateAdded}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pending_Admissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Pending Admissions exported to Excel.');
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
                Pending Admissions
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Pending Patient Admissions & Intake Pipeline
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Pending admissions refreshed.')}
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
        {/* Single Row Filter & Actions Bar matching screenshot media_1794162464027_f7042fed.png */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Button & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onNewPatient}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                New Patient
              </button>

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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Start Typing"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-52 rounded-xl border border-pearl-300 bg-white pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
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

        {/* Table Card matching exact columns */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-3 px-4 w-24">MRN</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Primary Insurance</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-500">
                      No pending admissions found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {item.mrn}
                      </td>
                      <td
                        onClick={() => onEditPatient?.(item.mrn)}
                        className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                      >
                        {item.patientName}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.primaryInsurance}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{item.branch}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">{item.dateAdded}</td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <button
                            type="button"
                            onClick={() => onEditPatient?.(item.mrn)}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              onAdmitPatient?.(item.mrn);
                              showToast(`Admitting ${item.patientName}...`);
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Admit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => showToast(`Non-admit reason prompt for ${item.patientName}`)}
                            className="hover:underline cursor-pointer"
                          >
                            Non-Admit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => showToast(`Notes opened for ${item.patientName}`)}
                            className="hover:underline cursor-pointer"
                          >
                            Notes
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => showToast(`Documents opened for ${item.patientName}`)}
                            className="hover:underline cursor-pointer"
                          >
                            Documents
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-750/50 dark:text-slate-400">
            <div>{filteredAdmissions.length} total results</div>
            <div>Showing all pending admissions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

