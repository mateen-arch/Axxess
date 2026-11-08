import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Search,
  ChevronDown,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Stethoscope,
  Info,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { FaceToFaceEncounter } from '../../types';

interface CreateFaceToFaceEncounterPageProps {
  onBack: () => void;
  onEncounterCreated?: () => void;
}

const DEFAULT_PHYSICIANS = [
  { id: 'dr-gupta', name: 'Dr. Anita Gupta, MD', npi: '1487920194', phone: '(978) 555-0182', fax: '(978) 555-0199' },
  { id: 'dr-chen', name: 'Dr. Michael Chen, MD', npi: '1928374651', phone: '(978) 555-0144', fax: '(978) 555-0149' },
  { id: 'dr-patel', name: 'Dr. Sarah Patel, DO', npi: '1192837462', phone: '(978) 555-0165', fax: '(978) 555-0169' },
  { id: 'dr-adams', name: 'Dr. John Adams, MD', npi: '1728394012', phone: '(978) 555-0111', fax: '(978) 555-0119' },
  { id: 'dr-ross', name: 'Dr. Emily Ross, MD', npi: '1839201948', phone: '(978) 555-0133', fax: '(978) 555-0139' },
];

export const CreateFaceToFaceEncounterPage: React.FC<CreateFaceToFaceEncounterPageProps> = ({
  onBack,
  onEncounterCreated,
}) => {
  const { patients, homeHealthEpisodes, addFaceToFaceEncounter, organization } = useHealthcare();

  const [patientStatus, setPatientStatus] = useState<'Active' | 'Discharged'>('Active');
  const [patientId, setPatientId] = useState<string>('');
  const [episodeAssociated, setEpisodeAssociated] = useState<string>('');
  const [physician, setPhysician] = useState<string>('Dr. Anita Gupta, MD');
  const [requestDate, setRequestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [certifyingType, setCertifyingType] = useState<
    'POC Certifying Physician' | 'Non POC Certifying Physician'
  >('POC Certifying Physician');

  // UI & Feedback State
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [physicianSearchQuery, setPhysicianSearchQuery] = useState<string>('');
  const [showPhysicianDropdown, setShowPhysicianDropdown] = useState<boolean>(false);

  // Filter patients by status
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (p.serviceLine !== 'home_health') return false;
      if (patientStatus === 'Active') {
        return p.status === 'active' || p.status === 'pending_admission';
      }
      return p.status === 'discharged';
    });
  }, [patients, patientStatus]);

  const selectedPatient = filteredPatients.find((p) => p.id === patientId);

  // Filter episodes for selected patient
  const patientEpisodes = useMemo(() => {
    if (!patientId) return [];
    return homeHealthEpisodes.filter((ep) => ep.patientId === patientId);
  }, [homeHealthEpisodes, patientId]);

  const handleSelectPatient = (id: string) => {
    setPatientId(id);
    const pat = filteredPatients.find((p) => p.id === id);
    if (pat) {
      if (pat.attendingPhysician) setPhysician(pat.attendingPhysician);
      const ep = homeHealthEpisodes.find((e) => e.patientId === id);
      if (ep) {
        setEpisodeAssociated(`${ep.episodeStartDate} to ${ep.episodeEndDate}`);
      } else {
        setEpisodeAssociated('11/01/2026 to 12/30/2026 (Cert Episode)');
      }
    }
  };

  const filteredPhysicians = useMemo(() => {
    if (!physicianSearchQuery.trim()) return DEFAULT_PHYSICIANS;
    return DEFAULT_PHYSICIANS.filter((d) =>
      d.name.toLowerCase().includes(physicianSearchQuery.toLowerCase())
    );
  }, [physicianSearchQuery]);

  const isValid = Boolean(patientId && physician.trim() && requestDate);

  const handleSubmit = (action: 'draft' | 'submit') => {
    if (action === 'submit' && !isValid) {
      setShowErrors(true);
      return;
    }

    const patName = selectedPatient
      ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
      : 'Selected Patient';

    const newEncounter: Omit<FaceToFaceEncounter, 'id' | 'createdAt'> = {
      patientStatus,
      patientId,
      patientName: patName,
      episodeAssociated: episodeAssociated || '11/01/2026 to 12/30/2026',
      physician: physician.trim(),
      requestDate,
      certifyingType,
      status: action === 'submit' ? 'Submitted' : 'Pending',
    };

    addFaceToFaceEncounter(newEncounter);
    setIsSuccess(true);

    setTimeout(() => {
      onEncounterCreated?.();
      onBack();
    }, 1200);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Orders & Encounters"
            aria-label="Return to Orders & Encounters"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Axxess Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Create
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Face-to-Face Encounter
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                CMS 42 CFR § 424.22 Statutory Certification Document
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-bold italic text-rose-600 dark:text-rose-400">
            *Required Field
          </span>
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-50 px-2.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Close"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Face-to-Face Encounter request generated and submitted to {physician}! Returning...</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select a patient, physician, and valid request date.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* CMS Mandate Overview */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <FileCheck2 size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">F2F Mandate Overview</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                CMS requires a face-to-face encounter related to the primary home health reason for care within 90 days prior to or 30 days following the start of care date.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Encounter Window:</span>
                  <strong className="text-slate-800 dark:text-slate-200">90 Days Prior / 30 Days Post</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Certifying Practitioner:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Physician or Allowed NPP</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Reimbursement Gate:</span>
                  <strong className="text-emerald-600">RAP & Final Claim Prerequisite</strong>
                </div>
              </div>
            </div>

            {/* Selected Patient Preview Card */}
            {selectedPatient ? (
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-4 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Active Patient
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {selectedPatient.status}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                  {selectedPatient.lastName}, {selectedPatient.firstName}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  MRN: #{selectedPatient.mrn} • DOB: {selectedPatient.dob || '—'}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-rose-100/80 pt-2.5 text-[11px] dark:border-rose-900/30">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Diagnosis:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100" title={selectedPatient.primaryDiagnosis}>
                      {selectedPatient.primaryDiagnosis || 'None recorded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Certifying MD:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {physician}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-5 text-center text-xs text-slate-400 dark:border-charcoal-700">
                <UserCheck size={28} className="mx-auto mb-2 text-slate-300 dark:text-charcoal-600" />
                Select a patient in the main form to display active diagnosis and encounter eligibility.
              </div>
            )}
          </div>

          <div className="rounded-xl bg-pearl-100 p-3 text-[11px] text-slate-500 dark:bg-charcoal-800/80 dark:text-slate-400">
            Axxess F2F Module • CMS 42 CFR § 424.22
          </div>
        </aside>

        {/* Right Form Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1</span>
              Encounter Request Specifications
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient Status <span className="text-rose-600">*</span>
                </label>
                <select
                  value={patientStatus}
                  onChange={(e) => {
                    setPatientStatus(e.target.value as 'Active' | 'Discharged');
                    setPatientId('');
                  }}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient Name <span className="text-rose-600">*</span>
                </label>
                <select
                  value={patientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">-- Select Patient --</option>
                  {filteredPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (MRN: #{p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Episode Associated <span className="text-rose-600">*</span>
                </label>
                <select
                  value={episodeAssociated}
                  onChange={(e) => setEpisodeAssociated(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  {patientEpisodes.length > 0 ? (
                    patientEpisodes.map((ep) => (
                      <option key={ep.id} value={`${ep.episodeStartDate} to ${ep.episodeEndDate}`}>
                        {ep.episodeStartDate} to {ep.episodeEndDate} (60-Day Episode)
                      </option>
                    ))
                  ) : (
                    <option value="11/01/2026 to 12/30/2026">
                      11/01/2026 to 12/30/2026 (Initial Certification)
                    </option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Request Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Physician <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={physician}
                        onChange={(e) => {
                          setPhysician(e.target.value);
                          setPhysicianSearchQuery(e.target.value);
                          setShowPhysicianDropdown(true);
                        }}
                        onFocus={() => setShowPhysicianDropdown(true)}
                        placeholder="Search attending or certifying physician..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>

                  {/* Physician Autocomplete Dropdown */}
                  {showPhysicianDropdown && (
                    <div className="absolute left-0 right-0 top-11 z-30 max-h-48 overflow-y-auto rounded-xl border border-pearl-200 bg-white p-1 shadow-lg dark:border-charcoal-700 dark:bg-charcoal-850">
                      {filteredPhysicians.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setPhysician(doc.name);
                            setShowPhysicianDropdown(false);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-charcoal-800"
                        >
                          <span>{doc.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">NPI: {doc.npi}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certifying Type Radios */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Certifying Role
              </label>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="certifyingType"
                    checked={certifyingType === 'POC Certifying Physician'}
                    onChange={() => setCertifyingType('POC Certifying Physician')}
                    className="accent-rose-600"
                  />
                  POC Certifying Physician
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="certifyingType"
                    checked={certifyingType === 'Non POC Certifying Physician'}
                    onChange={() => setCertifyingType('Non POC Certifying Physician')}
                    className="accent-rose-600"
                  />
                  Non POC Certifying Physician
                </label>
              </div>
            </div>

            {/* Statutory Compliance Note from Screenshot */}
            <div className="rounded-xl bg-pearl-50 p-3.5 border border-pearl-200/80 dark:bg-charcoal-800/60 dark:border-charcoal-700/80 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-200">*Note:</strong> Completing this form creates a face-to-face encounter request document that is submitted to the patient's physician or allowed practitioner. The physician or allowed practitioner is required to certify that the patient is homebound and that the home health services provided are medically necessary.
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-pearl-100 pt-4 dark:border-charcoal-700">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="h-10 rounded-xl border border-slate-300 bg-slate-800 px-5 text-xs font-bold text-white hover:bg-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 transition cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('submit')}
                className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                Submit Encounter Request
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
