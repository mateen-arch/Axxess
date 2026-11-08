import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  HeartPulse,
  Info,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Stethoscope,
  User,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface CreateEpisodePageProps {
  onBack: () => void;
  onEpisodeCreated?: () => void;
}

const insuranceOptions = [
  'Medicare Traditional',
  'Medicare Advantage',
  'Medicaid',
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Humana',
  'Cigna',
  'Private insurance',
  'Self-pay',
  'Other',
];

const secondaryInsuranceOptions = [
  'None',
  'Medicare Traditional',
  'Medicaid',
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Humana',
  'Private insurance',
  'Other',
];

// Calculate standard 60-day episode end date (start date + 59 days = 60 days total inclusive)
function computeStandardEpisodeEndDate(startDateStr: string): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 59);
  return date.toISOString().split('T')[0];
}

function getTodayFormatted(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export const CreateEpisodePage: React.FC<CreateEpisodePageProps> = ({ onBack, onEpisodeCreated }) => {
  const { patients, clinicians, addHomeHealthEpisode, organization } = useHealthcare();

  // Filter patients belonging to Home Health or all active patients
  const homeHealthPatients = useMemo(() => {
    const hh = patients.filter((p) => p.serviceLine === 'home_health');
    return hh.length > 0 ? hh : patients;
  }, [patients]);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [startOfCareDate, setStartOfCareDate] = useState<string>(getTodayFormatted());
  const [episodeStartDate, setEpisodeStartDate] = useState<string>(getTodayFormatted());
  const [episodeEndDate, setEpisodeEndDate] = useState<string>(computeStandardEpisodeEndDate(getTodayFormatted()));
  const [caseManager, setCaseManager] = useState<string>('');
  const [primaryPhysician, setPrimaryPhysician] = useState<string>('');
  const [primaryInsurance, setPrimaryInsurance] = useState<string>('Medicare Traditional');
  const [secondaryInsurance, setSecondaryInsurance] = useState<string>('None');
  const [comments, setComments] = useState<string>('');

  // UI state
  const [showPhysicianModal, setShowPhysicianModal] = useState(false);
  const [physicianSearchQuery, setPhysicianSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Selected patient object
  const selectedPatient = useMemo<Patient | undefined>(() => {
    return patients.find((p) => p.id === selectedPatientId || p.mrn === selectedPatientId);
  }, [patients, selectedPatientId]);

  // When patient is selected, auto-populate details
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const pat = patients.find((p) => p.id === patientId || p.mrn === patientId);
    if (pat) {
      if (pat.startOfCareDate) {
        setStartOfCareDate(pat.startOfCareDate);
      } else if (pat.admissionDate) {
        setStartOfCareDate(pat.admissionDate);
      }

      if (pat.assignedNurseName) {
        // match clinician or set as is
        const matched = clinicians.find((c) => c.name.toLowerCase() === pat.assignedNurseName?.toLowerCase());
        setCaseManager(matched ? `${matched.name} · ${matched.credentials}` : pat.assignedNurseName);
      } else if (clinicians.length > 0) {
        const primary = clinicians.find((c) => c.serviceLines.includes('home_health')) || clinicians[0];
        setCaseManager(`${primary.name} · ${primary.credentials}`);
      }

      if (pat.attendingPhysician) {
        setPrimaryPhysician(pat.attendingPhysician);
      }

      if (pat.insuranceName) {
        setPrimaryInsurance(pat.insuranceName);
      }
    }
  };

  // Handle start date change & automatically compute end date
  const handleStartDateChange = (newStart: string) => {
    setEpisodeStartDate(newStart);
    setEpisodeEndDate(computeStandardEpisodeEndDate(newStart));
  };

  // Physician options from clinicians + patients attending physicians
  const physicianList = useMemo(() => {
    const list = [
      'Dr. Robert Vance, MD · Dallas Medical Center',
      'Dr. Sarah Jenkins, MD · Baylor Scott & White',
      'Dr. Michael Chen, DO · North Texas Health',
      'Dr. Emily Larson, MD · Beverly Health Partners',
      'Dr. Hilder Martinez, MD · Standards Home Care',
      'Dr. Deborah Lollar, MD · North Shore Physicians Group',
    ];
    patients.forEach((p) => {
      if (p.attendingPhysician && !list.includes(p.attendingPhysician)) {
        list.push(p.attendingPhysician);
      }
    });
    return list;
  }, [patients]);

  const filteredPhysicians = useMemo(() => {
    if (!physicianSearchQuery.trim()) return physicianList;
    return physicianList.filter((doc) => doc.toLowerCase().includes(physicianSearchQuery.toLowerCase()));
  }, [physicianList, physicianSearchQuery]);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!selectedPatientId) errs.patient = 'Please select a patient';
    if (!startOfCareDate) errs.startOfCareDate = 'Start of Care Date is required';
    if (!episodeStartDate) errs.episodeStartDate = 'Episode Start Date is required';
    if (!episodeEndDate) errs.episodeEndDate = 'Episode End Date is required';
    if (!caseManager) errs.caseManager = 'Please select a case manager';
    if (!primaryPhysician.trim()) errs.primaryPhysician = 'Primary physician is required';
    if (!primaryInsurance) errs.primaryInsurance = 'Primary insurance is required';
    return errs;
  }, [selectedPatientId, startOfCareDate, episodeStartDate, episodeEndDate, caseManager, primaryPhysician, primaryInsurance]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    const patientName = selectedPatient
      ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
      : 'Selected Patient';

    addHomeHealthEpisode({
      patientId: selectedPatientId,
      patientName,
      startOfCareDate,
      episodeStartDate,
      episodeEndDate,
      caseManager,
      primaryPhysician,
      primaryInsurance,
      secondaryInsurance,
      comments,
      createdAt: new Date().toISOString(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      if (onEpisodeCreated) onEpisodeCreated();
      else onBack();
    }, 1200);
  };

  const insertTemplateComment = (text: string) => {
    setComments((prev) => (prev ? `${prev}\n${text}` : text));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans dark:bg-charcoal-900 transition-colors">
      {/* 1. Header / Breadcrumb Bar */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-black uppercase tracking-[.14em] text-rose-600 dark:text-rose-400">
                Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Create
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                New Episode
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">CMS 60-Day Recertification Episode</span>
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
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-50 px-2.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
            title="Cancel and close"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Episode created successfully! Returning to dashboard...</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please complete all required fields highlighted below before saving this episode.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Episode Summary Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <Calendar size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Episode Overview</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Create a 60-day home health certification episode for clinical documentation, OASIS assessments, and PDGM reimbursement tracking.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Standard Duration:</span>
                  <strong className="text-slate-800 dark:text-slate-200">60 Days</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>PDGM Periods:</span>
                  <strong className="text-slate-800 dark:text-slate-200">2 × 30-Day Periods</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Branch:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{organization.name}</strong>
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
                    <span>Assigned Clinician:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {selectedPatient.assignedNurseName || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Primary Insurance:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {selectedPatient.insuranceName || 'Medicare Traditional'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-4 text-center dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30">
                <User size={24} className="mx-auto text-slate-400" />
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">No Patient Selected</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Choose a patient from the form to view their clinical chart summary.</p>
              </div>
            )}

            {/* Quick Sticky Note Templates */}
            <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 shadow-2xs">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <StickyNote size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">Blue Sticky Note Helpers</h4>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Click any prompt below to quickly append standard coordination notes to the blue sticky note:
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {[
                  'Initial 60-day recertification episode initiated.',
                  'OASIS Recertification assessment scheduled with RN.',
                  'Physician Form 485 Orders sent for signature.',
                  'Physical Therapy re-evaluation frequency adjusted.',
                ].map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => insertTemplateComment(note)}
                    className="rounded-lg border border-sky-200/80 bg-white/80 px-2.5 py-1.5 text-left text-[11px] font-medium text-sky-900 hover:border-sky-400 hover:bg-sky-100/70 dark:border-sky-900/50 dark:bg-charcoal-850 dark:text-sky-200 transition"
                  >
                    + {note}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 text-center">
            Axxess Home Health EHR • Release {organization.releaseVersion}
          </div>
        </aside>

        {/* Center Form Body */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-pearl-50/50 dark:bg-charcoal-900/40">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            {/* Top Page Header Title Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/80 bg-white/85 p-5 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/85">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-2xs">
                  <HeartPulse size={20} />
                </span>
                <div>
                  <h1 className="text-xl font-black text-slate-950 dark:text-white">
                    New Episode
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set up clinical certification dates, case management, and insurance coverage.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                <span>60-Day Episode Standard</span>
              </div>
            </div>

            {/* SECTION 1: Patient */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-4 flex items-center gap-2 pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <User size={16} className="text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Patient
                </h2>
              </div>

              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Patient <span className="text-rose-600 font-extrabold">*</span>
                  </span>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className={`w-full h-11 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                      showErrors && errors.patient
                        ? 'border-rose-400 ring-1 ring-rose-400/30'
                        : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                    }`}
                  >
                    <option value="">-- Select Patient --</option>
                    {homeHealthPatients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.lastName}, {pat.firstName} (MRN: #{pat.mrn}) · DOB: {pat.dob || 'N/A'}
                      </option>
                    ))}
                  </select>
                  {showErrors && errors.patient && (
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      <AlertTriangle size={12} className="shrink-0" />
                      {errors.patient}
                    </span>
                  )}
                </label>
              </div>
            </section>

            {/* SECTION 2: Details */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-5 flex items-center gap-2 pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <FileText size={16} className="text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Details
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Left Column: Dates & Case Manager */}
                <div className="space-y-4">
                  {/* Start of Care Date */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Start of Care Date <span className="text-rose-600 font-extrabold">*</span>
                    </span>
                    <div className="relative">
                      <input
                        type="date"
                        value={startOfCareDate}
                        onChange={(e) => setStartOfCareDate(e.target.value)}
                        className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.startOfCareDate
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      />
                    </div>
                    {showErrors && errors.startOfCareDate && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.startOfCareDate}
                      </span>
                    )}
                  </label>

                  {/* Episode Start Date */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Episode Start Date <span className="text-rose-600 font-extrabold">*</span>
                    </span>
                    <div className="relative">
                      <input
                        type="date"
                        value={episodeStartDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.episodeStartDate
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      />
                    </div>
                    {showErrors && errors.episodeStartDate && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.episodeStartDate}
                      </span>
                    )}
                  </label>

                  {/* Episode End Date */}
                  <label className="block">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Episode End Date <span className="text-rose-600 font-extrabold">*</span>
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        +59 Days (60 Days Total)
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={episodeEndDate}
                        onChange={(e) => setEpisodeEndDate(e.target.value)}
                        className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.episodeEndDate
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      />
                    </div>
                    {showErrors && errors.episodeEndDate && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.episodeEndDate}
                      </span>
                    )}
                  </label>

                  {/* Case Manager */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Case Manager <span className="text-rose-600 font-extrabold">*</span>
                    </span>
                    <select
                      value={caseManager}
                      onChange={(e) => setCaseManager(e.target.value)}
                      className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                        showErrors && errors.caseManager
                          ? 'border-rose-400 ring-1 ring-rose-400/30'
                          : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                      }`}
                    >
                      <option value="">-- Select Employee --</option>
                      {clinicians.map((c) => (
                        <option key={c.id} value={`${c.name} · ${c.credentials}`}>
                          {c.name} · {c.credentials} ({c.title})
                        </option>
                      ))}
                    </select>
                    {showErrors && errors.caseManager && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.caseManager}
                      </span>
                    )}
                  </label>
                </div>

                {/* Right Column: Physician & Insurance */}
                <div className="space-y-4">
                  {/* Primary Physician */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Primary Physician <span className="text-rose-600 font-extrabold">*</span>
                    </span>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={primaryPhysician}
                        onChange={(e) => setPrimaryPhysician(e.target.value)}
                        placeholder="Enter physician name or click search"
                        className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 pl-3.5 pr-10 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.primaryPhysician
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhysicianModal(true)}
                        className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-charcoal-750 dark:hover:text-rose-400 transition"
                        title="Search physician database"
                      >
                        <Search size={15} />
                      </button>
                    </div>
                    {showErrors && errors.primaryPhysician && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.primaryPhysician}
                      </span>
                    )}
                  </label>

                  {/* Primary Insurance */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Primary Insurance <span className="text-rose-600 font-extrabold">*</span>
                    </span>
                    <select
                      value={primaryInsurance}
                      onChange={(e) => setPrimaryInsurance(e.target.value)}
                      className={`w-full h-10 rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                        showErrors && errors.primaryInsurance
                          ? 'border-rose-400 ring-1 ring-rose-400/30'
                          : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                      }`}
                    >
                      <option value="">-- Select Insurance --</option>
                      {insuranceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {showErrors && errors.primaryInsurance && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {errors.primaryInsurance}
                      </span>
                    )}
                  </label>

                  {/* Secondary Insurance */}
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Secondary Insurance
                    </span>
                    <select
                      value={secondaryInsurance}
                      onChange={(e) => setSecondaryInsurance(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition hover:border-pearl-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="">-- Select Insurance --</option>
                      {secondaryInsuranceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* PDGM Calculation Badge */}
                  <div className="rounded-xl border border-pearl-200/80 bg-pearl-50/60 p-3 text-[11px] text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800/50 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                      <Info size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Medicare Episode Calculation</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                      Standard OASIS-E episodes run for 60 calendar days. Payment grouping is divided into two 30-day periods under CMS PDGM guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Comments (Blue Sticky Note) */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500 text-white shadow-2xs">
                    <StickyNote size={14} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Comments
                  </h2>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    (Blue Sticky Note)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter episode notes, physician order directions, certification instructions, or care coordination details..."
                  rows={5}
                  className="w-full rounded-2xl border border-sky-200/80 bg-sky-50/40 p-4 text-xs font-medium leading-relaxed text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-slate-100 dark:focus:bg-charcoal-800"
                />
                <p className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Comments saved here will appear on the patient chart sticky note strip and episode timeline.</span>
                  <span>{comments.length} characters</span>
                </p>
              </div>
            </section>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex items-center justify-between gap-3 border-t border-pearl-200/90 bg-white/90 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/90 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                All changes will be committed to the patient’s active Home Health record.
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onBack}
                  className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-6 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-50"
                >
                  <HeartPulse size={16} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Physician Search Modal */}
      {showPhysicianModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setShowPhysicianModal(false)}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
            <div className="flex items-center justify-between border-b border-pearl-200/80 pb-3 dark:border-charcoal-700/80">
              <div className="flex items-center gap-2">
                <Stethoscope size={18} className="text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Physician Directory Lookup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhysicianModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={physicianSearchQuery}
                  onChange={(e) => setPhysicianSearchQuery(e.target.value)}
                  placeholder="Search by physician name, clinic, or credentials..."
                  className="h-10 w-full rounded-xl border border-pearl-200 bg-pearl-50 pl-10 pr-4 text-xs font-medium outline-none focus:border-rose-500 focus:bg-white dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {filteredPhysicians.map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => {
                      setPrimaryPhysician(doc);
                      setShowPhysicianModal(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-pearl-200/60 p-3 text-left text-xs font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50/70 hover:text-rose-700 dark:border-charcoal-700 dark:text-slate-200 dark:hover:bg-charcoal-800 dark:hover:text-rose-300 transition"
                  >
                    <span>{doc}</span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Select</span>
                  </button>
                ))}
                {filteredPhysicians.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">No physicians found matching query.</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80">
              <button
                type="button"
                onClick={() => setShowPhysicianModal(false)}
                className="h-9 rounded-xl border border-pearl-200 bg-white px-4 text-xs font-bold text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

