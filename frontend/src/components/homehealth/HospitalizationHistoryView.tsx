import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Save,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface HospitalizationHistoryViewProps {
  onBack: () => void;
  onSelectPatient?: (patientName: string) => void;
}

interface HospitalizationRecord {
  id: string;
  mrn: string;
  patientName: string;
  source: string;
  hospitalizationDate: string;
  lastHomeVisitDate: string;
  user: string;
  tags: string;
}

interface PatientLogItem {
  id: string;
  source: string;
  user: string;
  hospitalizationDate: string;
  transferDate: string;
  facility: string;
  reasons: string[];
  narrative: string;
}

const SAMPLE_HOSPITALIZATIONS: HospitalizationRecord[] = [
  {
    id: 'hosp-1',
    mrn: '696',
    patientName: 'Wallace, Jennifer',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/10/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Mary Kyalikunda RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-2',
    mrn: '696',
    patientName: 'Wallace, Jennifer',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/10/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Mary Kyalikunda RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-3',
    mrn: '441',
    patientName: 'Moreno, Reinalda',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/13/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Michelene Paul RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-4',
    mrn: '1171',
    patientName: 'Williams, Cynthia',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/22/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Theodora Ogamba RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-5',
    mrn: '1020',
    patientName: 'Gedeon, Yolande',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/26/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Nathalie Bernadeau RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-6',
    mrn: '878',
    patientName: 'Gonzalez, Cindy',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '9/28/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Mary Kyalikunda RN',
    tags: 'Not Available',
  },
  {
    id: 'hosp-7',
    mrn: '1151',
    patientName: 'Leon, Louis',
    source: 'OASIS Transfer Assessment',
    hospitalizationDate: '10/13/2026',
    lastHomeVisitDate: 'Not Available',
    user: 'Nathalie Bernadeau RN',
    tags: 'Not Available',
  },
];

const INITIAL_PATIENT_LOGS: PatientLogItem[] = [
  {
    id: 'log-1',
    source: 'OASIS Transfer Assessment',
    user: 'Mary Kyalikunda RN',
    hospitalizationDate: '02/04/2022',
    transferDate: '02/04/2022',
    facility: '1 - Hospital',
    reasons: ['Heart failure (e.g., fluid overload)', 'Respiratory infection (e.g., pneumonia, bronchitis)'],
    narrative: 'Patient transferred via EMS to acute hospital due to worsening shortness of breath and peripheral edema.',
  },
  {
    id: 'log-2',
    source: 'OASIS Transfer Assessment',
    user: 'Mary Kyalikunda RN',
    hospitalizationDate: '06/13/2026',
    transferDate: '06/13/2026',
    facility: '1 - Hospital',
    reasons: ['Deep vein thrombosis, pulmonary embolus'],
    narrative: 'Evaluated at emergency department for acute unilateral lower extremity swelling.',
  },
  {
    id: 'log-3',
    source: 'OASIS Transfer Assessment',
    user: 'Mary Kyalikunda RN',
    hospitalizationDate: '09/10/2026',
    transferDate: '09/10/2026',
    facility: '1 - Hospital',
    reasons: ['Urinary tract infection', 'Dehydration, malnutrition'],
    narrative: 'Admitted for IV antibiotic therapy and rehydration following febrile episode.',
  },
];

const TEMPLATE_OPTIONS = [
  'Select Templates',
  'Communication Note For PA Approvals',
  'HHA Frequency',
  'Private Duty Nursing Frequency',
  'SHC - Discharge (goals met)',
  'SHC - Recertification',
  'SHC - ROC',
  'SHC - Start of Care',
  'SHC - Transfer (not discharged)',
  'TEACHING DISEASE (Celiac Disease)',
  'TEACHING GUIDE (Alzheimer\'s Disease)',
  'TEACHING GUIDE (CHF)',
  'TEACHING GUIDES (Diabetes Mellitus)',
  'TEACHING GUIDES (Hypertension)',
];

export const HospitalizationHistoryView: React.FC<HospitalizationHistoryViewProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const { organization } = useHealthcare();

  // Mode: 'list' | 'patient_logs' | 'edit_log'
  const [viewMode, setViewMode] = useState<'list' | 'patient_logs' | 'edit_log'>('list');
  const [activePatientName, setActivePatientName] = useState('WALLACE, JENNIFER');
  const [activeEpisode, setActiveEpisode] = useState('12/27/2021 - 02/24/2022');
  const [activeUser, setActiveUser] = useState('Mary Kyalikunda RN');

  // Filter states
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState('2026-11-08');
  const [selectedTag, setSelectedTag] = useState('Select Option');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Log State
  const [editTransferDate, setEditTransferDate] = useState('2022-02-04');
  const [editLastVisitDate, setEditLastVisitDate] = useState('2022-02-02');
  const [editFacility, setEditFacility] = useState('1');
  const [selectedM2440Reasons, setSelectedM2440Reasons] = useState<string[]>([]);
  const [selectedM2430Reasons, setSelectedM2430Reasons] = useState<string[]>([
    '5 – Heart failure (e.g., fluid overload)',
  ]);
  const [editNarrative, setEditNarrative] = useState(
    'Patient transferred via EMS to acute hospital due to worsening shortness of breath and peripheral edema.'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredHistory = useMemo(() => {
    return SAMPLE_HOSPITALIZATIONS.filter((h) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          h.patientName.toLowerCase().includes(q) ||
          h.mrn.includes(q) ||
          h.user.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery]);

  const handleOpenPatientLogs = (name: string) => {
    setActivePatientName(name);
    setViewMode('patient_logs');
  };

  const handleEditLog = () => {
    setViewMode('edit_log');
  };

  const handleSaveLog = () => {
    showToast('Hospitalization log updated successfully.');
    setViewMode('patient_logs');
  };

  const handleExportToExcel = () => {
    const headers = ['MRN', 'Patient Name', 'Source', 'Hospitalization Date', 'Last Home Visit Date', 'User'];
    const rows = filteredHistory.map((h) => [
      `"${h.mrn}"`,
      `"${h.patientName}"`,
      `"${h.source}"`,
      `"${h.hospitalizationDate}"`,
      `"${h.lastHomeVisitDate}"`,
      `"${h.user}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospitalization_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Hospitalization history exported to Excel.');
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
            onClick={() => {
              if (viewMode === 'edit_log') setViewMode('patient_logs');
              else if (viewMode === 'patient_logs') setViewMode('list');
              else onBack();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return"
            aria-label="Return"
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
                {viewMode === 'list'
                  ? 'Hospitalization History'
                  : viewMode === 'patient_logs'
                  ? `Hospitalization Logs - ${activePatientName}`
                  : `Edit Hospitalization Log - ${activePatientName}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Inpatient Transfers, Readmission Auditing & OASIS M0903/M2430 Tracking
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Hospitalization logs refreshed.')}
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
        {/* ===================================================================== */}
        {/* VIEW 1: Main Hospitalization History List                             */}
        {/* ===================================================================== */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hospitalization History
            </h2>

            {/* Single Row Filter & Actions Bar matching screenshot media_1794162615371_e11121fd.png */}
            <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
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

                  {/* Tags */}
                  <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Select Option">Select Option</option>
                      <option value="High Risk">High Risk</option>
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

                {/* Right Buttons: Generate, New Hospitalization, Export to Excel */}
                <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast('Generated hospitalization records.')}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePatientName('WALLACE, JENNIFER');
                      setViewMode('edit_log');
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    New Hospitalization
                  </button>
                  <button
                    type="button"
                    onClick={handleExportToExcel}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
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
                      <th className="py-3 px-4 w-20">MRN</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Hospitalization Date</th>
                      <th className="py-3 px-4">Last Home Visit Date</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Tags</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          {item.mrn}
                        </td>
                        <td
                          onClick={() => onSelectPatient?.(item.patientName)}
                          className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 cursor-pointer hover:underline"
                        >
                          {item.patientName}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{item.source}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{item.hospitalizationDate}</td>
                        <td className="py-3 px-4 text-slate-400 italic">{item.lastHomeVisitDate}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{item.user}</td>
                        <td className="py-3 px-4 text-slate-400 italic">{item.tags}</td>
                        <td className="py-3 px-4 text-left whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenPatientLogs(item.patientName.toUpperCase())}
                            className="font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Show Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
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
                  </select>
                  <span>entries</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: Patient Hospitalization Logs (Show Logs)                      */}
        {/* ===================================================================== */}
        {viewMode === 'patient_logs' && (
          <div className="space-y-4">
            {/* Patient Header Banner matching screenshot media_1794162592748_9d20766a.png */}
            <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 overflow-hidden shadow-xs">
              <div className="bg-pearl-100/90 dark:bg-charcoal-750 px-4 py-2 border-b border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-600 dark:text-slate-300 text-center">
                Hospitalization Logs
              </div>
              <div className="p-4 text-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {activePatientName}
                </h2>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewMode('edit_log')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                Add Hospitalization Log
              </button>

              <button
                type="button"
                onClick={() => showToast('Patient hospitalization logs exported.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-4 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export to Excel
              </button>
            </div>

            {/* Logs Table */}
            <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white shadow-sm dark:border-charcoal-700/80 dark:bg-charcoal-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-pearl-200 bg-pearl-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Hospitalization Date</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_PATIENT_LOGS.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-pearl-100 transition hover:bg-rose-50/30 dark:border-charcoal-700 dark:hover:bg-rose-950/20"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {log.source}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.user}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                          {log.hospitalizationDate}
                        </td>
                        <td className="py-3 px-4 text-left whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              title="Print Hospitalization Log"
                              onClick={() => {
                                showToast(`Printing hospitalization report...`);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="text-slate-500 hover:text-rose-700 p-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={handleEditLog}
                              className="font-bold text-rose-700 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => showToast('Log deleted.')}
                              className="font-bold text-rose-700 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: Edit Hospitalization Log (matching screenshots 3 & 4)        */}
        {/* ===================================================================== */}
        {viewMode === 'edit_log' && (
          <div className="space-y-4">
            {/* Header Form Card */}
            <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="border-b border-pearl-200 pb-3 text-xs font-bold text-slate-700 uppercase tracking-wider dark:border-charcoal-700 dark:text-slate-300">
                Hospitalization Log Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Patient:</label>
                  <select
                    value={activePatientName}
                    onChange={(e) => setActivePatientName(e.target.value)}
                    className="w-full rounded-xl border border-pearl-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                  >
                    <option value="WALLACE, JENNIFER">WALLACE, JENNIFER</option>
                    <option value="ABUISSA, HEATHER">ABUISSA, HEATHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">User:</label>
                  <select
                    value={activeUser}
                    onChange={(e) => setActiveUser(e.target.value)}
                    className="w-full rounded-xl border border-pearl-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                  >
                    <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                    <option value="Michelene Paul RN">Michelene Paul RN</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Episode:</label>
                  <select
                    value={activeEpisode}
                    onChange={(e) => setActiveEpisode(e.target.value)}
                    className="w-full rounded-xl border border-pearl-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                  >
                    <option value="12/27/2021 - 02/24/2022">12/27/2021 - 02/24/2022</option>
                    <option value="10/26/2026 - 12/24/2026">10/26/2026 - 12/24/2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OASIS M0903 & M0906 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  OASIS M0903
                </div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
                  (M0903) Date of Last (Most Recent) Home Visit:
                </label>
                <input
                  type="date"
                  value={editLastVisitDate}
                  onChange={(e) => setEditLastVisitDate(e.target.value)}
                  className="rounded-xl border border-pearl-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                />
              </div>

              <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  OASIS M0906
                </div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
                  (M0906) Transfer Date: Enter the date of the transfer of the patient.
                </label>
                <input
                  type="date"
                  value={editTransferDate}
                  onChange={(e) => setEditTransferDate(e.target.value)}
                  className="rounded-xl border border-pearl-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
                />
              </div>
            </div>

            {/* OASIS M2410 & M2440 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* M2410 */}
              <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OASIS M2410
                </div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  (M2410) To which Inpatient Facility has the patient been admitted?
                </label>
                <div className="space-y-1.5 pt-1 text-xs">
                  {[
                    { val: '1', label: '1 – Hospital' },
                    { val: '2', label: '2 – Rehabilitation facility' },
                    { val: '3', label: '3 – Nursing home' },
                    { val: '4', label: '4 – Hospice' },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="facility"
                        value={opt.val}
                        checked={editFacility === opt.val}
                        onChange={(e) => setEditFacility(e.target.value)}
                        className="accent-rose-700"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* M2440 */}
              <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OASIS M2440
                </div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  (M2440) For what Reason(s) was the patient Admitted to a Nursing Home?
                </label>
                <div className="space-y-1.5 pt-1 text-xs">
                  {[
                    '1 – Therapy services',
                    '2 – Respite care',
                    '3 – Hospice care',
                    '4 – Permanent placement',
                    '5 – Unsafe for care at home',
                    '6 – Other',
                    'UK – Unknown',
                  ].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedM2440Reasons.includes(r)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedM2440Reasons((prev) => [...prev, r]);
                          else setSelectedM2440Reasons((prev) => prev.filter((x) => x !== r));
                        }}
                        className="accent-rose-700 rounded"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* OASIS M2430 Reason for Hospitalization */}
            <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                OASIS M2430
              </div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">
                (M2430) Reason for Hospitalization: For what reason(s) did the patient require hospitalization? (Mark all that apply.)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {[
                  '1 – Improper medication administration, toxicity, anaphylaxis',
                  '2 – Injury caused by fall',
                  '3 – Respiratory infection (e.g., pneumonia, bronchitis)',
                  '4 – Other respiratory problem',
                  '5 – Heart failure (e.g., fluid overload)',
                  '6 – Cardiac dysrhythmia (irregular heartbeat)',
                  '7 – Myocardial infarction or chest pain',
                  '8 – Other heart disease',
                  '9 – Stroke (CVA) or TIA',
                  '10 – Hypo/Hyperglycemia, diabetes out of control',
                  '11 – GI bleeding, obstruction, constipation',
                  '12 – Dehydration, malnutrition',
                  '13 – Urinary tract infection',
                  '14 – IV catheter-related infection',
                  '15 – Wound infection or deterioration',
                  '16 – Uncontrolled pain',
                  '17 – Acute mental/behavioral health problem',
                  '18 – Deep vein thrombosis, pulmonary embolus',
                  '19 – Scheduled treatment or procedure',
                  '20 – Other than above reasons',
                  'UK – Reason unknown',
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedM2430Reasons.includes(reason)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedM2430Reasons((prev) => [...prev, reason]);
                        else setSelectedM2430Reasons((prev) => prev.filter((x) => x !== reason));
                      }}
                      className="accent-rose-700 rounded"
                    />
                    <span className="truncate">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Narrative & Template Selection matching screenshot 4 */}
            <div className="rounded-2xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-pearl-200 pb-2 dark:border-charcoal-700">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  Narrative
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value !== 'Select Templates') {
                      setEditNarrative((prev) => `${prev}\n[Template: ${e.target.value}]`);
                    }
                  }}
                  className="rounded-xl border border-pearl-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={5}
                value={editNarrative}
                onChange={(e) => setEditNarrative(e.target.value.slice(0, 1500))}
                className="w-full rounded-xl border border-pearl-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
              />
              <div className="text-[11px] text-slate-400 text-right">
                You have {1500 - editNarrative.length} characters remaining.
              </div>

              {/* Action Buttons: Save & Exit */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSaveLog}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-800 px-6 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('patient_logs')}
                  className="h-9 rounded-xl border border-pearl-300 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200 cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

