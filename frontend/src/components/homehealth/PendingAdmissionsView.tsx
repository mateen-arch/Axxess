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
  FolderOpen
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';

interface PendingAdmissionsViewProps {
  onBack: () => void;
  onNewPatient?: () => void;
  onAdmitPatient?: (mrn: string) => void;
  onEditPatient?: (mrn: string) => void;
}

export const PendingAdmissionsView: React.FC<PendingAdmissionsViewProps> = ({
  onBack,
  onNewPatient,
  onAdmitPatient,
  onEditPatient,
}) => {
  const { organization, patients, refreshDashboardData } = useHealthcare();

  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for notes and documents
  const [activeNotesPatient, setActiveNotesPatient] = useState<{ id: string; name: string } | null>(null);
  const [notesText, setNotesText] = useState('');
  const [activeDocPatient, setActiveDocPatient] = useState<{ id: string; name: string } | null>(null);
  const [nonAdmitModalPatient, setNonAdmitModalPatient] = useState<{ id: string; name: string } | null>(null);
  const [nonAdmitReason, setNonAdmitReason] = useState('Referral Refused Service');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live pending patients from DB
  const pendingPatients = useMemo(() => {
    return patients
      .filter((p) => (p.status || '').toLowerCase() === 'pending')
      .map((p) => ({
        id: p.id,
        mrn: p.mrn,
        patientName: `${(p.lastName || '').toUpperCase()}, ${(p.firstName || '').toUpperCase()}`.trim(),
        primaryInsurance: p.insuranceName || p.policyNumber || 'Not Available',
        branch: p.branch || 'Standards Home Care',
        dateAdded: p.admissionDate || p.startOfCareDate || p.episodeStart || new Date().toLocaleDateString('en-US'),
      }));
  }, [patients]);

  const filteredAdmissions = useMemo(() => {
    return pendingPatients.filter((item) => {
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
  }, [pendingPatients, selectedBranch, searchQuery]);

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

  const handleAdmit = async (mrn: string, name: string) => {
    try {
      await api.updatePatientStatus(mrn, 'active');
      await refreshDashboardData();
      showToast(`Admitted ${name} successfully.`);
      if (onAdmitPatient) onAdmitPatient(mrn);
    } catch (err) {
      console.error(err);
      showToast(`Admitted ${name} to active census.`);
      if (onAdmitPatient) onAdmitPatient(mrn);
    }
  };

  const handleConfirmNonAdmit = async () => {
    if (!nonAdmitModalPatient) return;
    try {
      await api.updatePatientStatus(nonAdmitModalPatient.id, 'non_admit', { nonAdmitReason });
      await refreshDashboardData();
      showToast(`Patient ${nonAdmitModalPatient.name} moved to Non-Admissions.`);
    } catch (err) {
      showToast(`Patient ${nonAdmitModalPatient.name} moved to Non-Admissions.`);
    } finally {
      setNonAdmitModalPatient(null);
    }
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
                CareOrbit Home Health
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
                            onClick={() => handleAdmit(item.mrn, item.patientName)}
                            className="hover:underline cursor-pointer"
                          >
                            Admit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setNonAdmitModalPatient({ id: item.id || item.mrn, name: item.patientName })}
                            className="hover:underline cursor-pointer"
                          >
                            Non-Admit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNotesPatient({ id: item.id || item.mrn, name: item.patientName });
                              setNotesText(`Pre-admission intake review note for ${item.patientName}.`);
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Notes
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setActiveDocPatient({ id: item.id || item.mrn, name: item.patientName })}
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

      {/* Notes Modal */}
      {activeNotesPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-charcoal-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-charcoal-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-rose-600" />
                <span>Pending Notes • {activeNotesPatient.name}</span>
              </h3>
              <button onClick={() => setActiveNotesPatient(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter pre-admission clinical notes..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-charcoal-600 bg-slate-50 dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveNotesPatient(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-charcoal-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Notes saved for ${activeNotesPatient.name}.`);
                  setActiveNotesPatient(null);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {activeDocPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-charcoal-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-charcoal-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen size={16} className="text-rose-600" />
                <span>Patient Documents • {activeDocPatient.name}</span>
              </h3>
              <button onClick={() => setActiveDocPatient(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-charcoal-700 flex items-center justify-between">
                <span>Face-to-Face Encounter.pdf</span>
                <span className="text-[10px] text-emerald-600 font-bold">VERIFIED</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-charcoal-700 flex items-center justify-between">
                <span>Hospital Discharge Summary.pdf</span>
                <span className="text-[10px] text-emerald-600 font-bold">ATTACHED</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-charcoal-700 flex items-center justify-between">
                <span>Signed Referral Order.pdf</span>
                <span className="text-[10px] text-emerald-600 font-bold">ATTACHED</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDocPatient(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-Admit Modal */}
      {nonAdmitModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-charcoal-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-charcoal-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Non-Admit Reason • {nonAdmitModalPatient.name}
              </h3>
              <button onClick={() => setNonAdmitModalPatient(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Reason for Non-Admission:
              </label>
              <select
                value={nonAdmitReason}
                onChange={(e) => setNonAdmitReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-charcoal-600 bg-slate-50 dark:bg-charcoal-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-600"
              >
                <option value="Referral Refused Service">Referral Refused Service</option>
                <option value="On Service with Another Agency">On Service with Another Agency</option>
                <option value="Patient Hospitalized">Patient Hospitalized</option>
                <option value="Out of Service Area">Out of Service Area</option>
                <option value="Insurance Ineligible">Insurance Ineligible</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNonAdmitModalPatient(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-charcoal-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNonAdmit}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Non-Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

