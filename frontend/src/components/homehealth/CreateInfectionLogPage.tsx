import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  ShieldAlert,
  Activity,
  FileCheck2,
  FileText,
  UserCheck,
  Stethoscope,
  Microscope,
  Info,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface CreateInfectionLogPageProps {
  onBack: () => void;
  onLogCreated?: () => void;
}

const INFECTION_TYPES = [
  'Fever of undetermined origin',
  'Catheter-associated UTI',
  'Central venous catheter',
  'Eye/Ear/Nose/Mouth',
  'Gastrointestinal',
  'PICC line',
  'Other venous access device',
  'Respiratory',
  'Soft tissue/wounds',
  'Surgical wound',
  'Urinary',
  'Other',
];

const INFECTION_CONTROL_PRECAUTIONS = [
  'Universal precautions',
  'Isolation',
  'Contact precautions',
  'Droplet precautions',
];

const INFECTION_TEMPLATES = [
  'Post-Operative Wound Surveillance Protocol',
  'Catheter-Associated Urinary Tract Infection (CAUTI) Review',
  'Upper Respiratory / Viral Syndrome Precautions',
  'PICC Line Redness / Infiltration Assessment',
  'Standard Antimicrobial Stewardship Log',
];

const FOLLOWUP_TEMPLATES = [
  'Resolution confirmed with negative repeat culture',
  'Antibiotic course completed, vitals within baseline',
  'Physician evaluated and cleared infection surveillance',
  'Ongoing monitoring scheduled for next recertification',
];

export const CreateInfectionLogPage: React.FC<CreateInfectionLogPageProps> = ({
  onBack,
  onLogCreated,
}) => {
  const { patients, organization, clinicians } = useHealthcare();

  // Active home health patients
  const homeHealthPatients = useMemo(() => {
    return patients.filter((p) => p.serviceLine === 'home_health');
  }, [patients]);

  // Section 1: Patient Information
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [episodePeriod, setEpisodePeriod] = useState<string>('Current 60-Day Episode');
  const [dateOfInfection, setDateOfInfection] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startOfCareDate, setStartOfCareDate] = useState<string>('2026-11-01');
  const [attendingPhysician, setAttendingPhysician] = useState<string>('Dr. Anita Gupta, MD');
  const [physicianNotified, setPhysicianNotified] = useState<'Yes' | 'No'>('Yes');

  // Selected Patient Details
  const selectedPatient = useMemo<Patient | undefined>(() => {
    return patients.find((p) => p.id === selectedPatientId || p.mrn === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Section 2: Evaluation and Treatment
  const [nosocomialSource, setNosocomialSource] = useState<
    'Community' | 'Healthcare-Associated' | ''
  >('Community');
  const [chestXRay, setChestXRay] = useState<'Yes' | 'No' | 'N/A'>('N/A');
  const [cultureCompleted, setCultureCompleted] = useState<'Yes' | 'No' | 'N/A'>('Yes');
  const [antibioticPrescribed, setAntibioticPrescribed] = useState<'Yes' | 'No' | 'N/A'>('Yes');
  const [labsCompleted, setLabsCompleted] = useState<string>('CBC with diff, Urinalysis with micro (11/08/2026)');
  const [treatmentPrescribed, setTreatmentPrescribed] = useState<string>(
    'Ciprofloxacin 500 mg PO BID x 7 days; increased hydration protocol'
  );

  // Section 3: Type of Infection / Signs and Symptoms
  const [selectedInfectionTypes, setSelectedInfectionTypes] = useState<string[]>([
    'Catheter-associated UTI',
    'Urinary',
  ]);

  // Section 4: Reportable Diseases
  const [reportableDiseasePresent, setReportableDiseasePresent] = useState<boolean>(false);
  const [showCdcModal, setShowCdcModal] = useState<boolean>(false);

  // Section 5: Infection Control
  const [selectedPrecautions, setSelectedPrecautions] = useState<string[]>([
    'Universal precautions',
    'Contact precautions',
  ]);

  // Section 6: Comments
  const [comments, setComments] = useState<string>(
    'Patient presented with dysuria, low-grade temperature 99.4F, and cloudy catheter bag drainage. Urine culture sent to Beverly Hospital Lab.'
  );

  // Section 7: Follow-Up
  const [followUpOption, setFollowUpOption] = useState<'performed' | 'na'>('performed');
  const [followUpComments, setFollowUpComments] = useState<string>(
    'Follow-up visit conducted on day 3 of antibiotics. Symptoms resolved, clear urine output, afebrile.'
  );

  // Section 8: Electronic Signature
  const [clinicianSignature, setClinicianSignature] = useState<string>('Hilder M., RN');
  const [signatureDate, setSignatureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [signatureTime, setSignatureTime] = useState<string>('14:30');

  // UI State
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const toggleInfectionType = (type: string) => {
    setSelectedInfectionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePrecaution = (precaution: string) => {
    setSelectedPrecautions((prev) =>
      prev.includes(precaution) ? prev.filter((p) => p !== precaution) : [...prev, precaution]
    );
  };

  const isValid = Boolean(
    selectedPatientId &&
      dateOfInfection &&
      clinicianSignature.trim() &&
      selectedInfectionTypes.length > 0
  );

  const handleSubmit = (action: 'draft' | 'complete') => {
    if (action === 'complete' && !isValid) {
      setShowErrors(true);
      return;
    }
    setIsSuccess(true);
    setTimeout(() => {
      onLogCreated?.();
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
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Create
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Infection Log
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Clinical Infection Surveillance & CDC Tracking
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
          <span>Infection log successfully recorded and submitted for QA review. Returning...</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select a patient, specify date of infection, and choose at least one infection type.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Surveillance Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <Microscope size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Infection Surveillance</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Document and track healthcare-associated and community infections across clinical disciplines to meet CMS OASIS and CDC epidemiological guidelines.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Log Type:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Surveillance Incident</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Branch:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{organization.name}</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Reporting Period:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Active Q4 2026</strong>
                </div>
              </div>
            </div>

            {/* Selected Patient Preview Card */}
            {selectedPatient ? (
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-4 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Patient Profile
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
                    <span>Case Manager:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {(selectedPatient.admissionDetails?.caseManager as string) || 'Clinical Team'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-5 text-center text-xs text-slate-400 dark:border-charcoal-700">
                <UserCheck size={28} className="mx-auto mb-2 text-slate-300 dark:text-charcoal-600" />
                Select a patient in the main form to display active diagnosis and care team metrics.
              </div>
            )}

            {/* CDC Protocol Tip */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold mb-1">
                <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                <span>CDC Infection Guidance</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Infections occurring &gt;72 hrs after home health admission are tracked as Community Acquired. Document lab results and notify attending physician promptly.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-pearl-100 p-3 text-[11px] text-slate-500 dark:bg-charcoal-800/80 dark:text-slate-400">
            Axxess Infection Log v4.2 • OASIS-E Compatible
          </div>
        </aside>

        {/* Right Form Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Section 1: Patient Information */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1</span>
              Patient Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient Name <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">-- Select Patient --</option>
                  {homeHealthPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (MRN: #{p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Episode Period
                </label>
                <select
                  value={episodePeriod}
                  onChange={(e) => setEpisodePeriod(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Current 60-Day Episode">11/01/2026 – 12/30/2026 (Cert Episode)</option>
                  <option value="Prior 60-Day Episode">09/02/2026 – 10/31/2026 (Initial Episode)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Date of Infection <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfInfection}
                  onChange={(e) => setDateOfInfection(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Start of Care Date
                </label>
                <input
                  type="date"
                  value={startOfCareDate}
                  onChange={(e) => setStartOfCareDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  MRN
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPatient ? `#${selectedPatient.mrn}` : '—'}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-pearl-50 px-3 text-xs font-medium text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Primary Diagnosis
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPatient?.primaryDiagnosis || '—'}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-pearl-50 px-3 text-xs font-medium text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-slate-400 cursor-not-allowed truncate"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attending Physician
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={attendingPhysician}
                      onChange={(e) => setAttendingPhysician(e.target.value)}
                      placeholder="Search Physician..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Physician Notified
                </label>
                <div className="flex items-center gap-6 h-10">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="physicianNotified"
                      checked={physicianNotified === 'Yes'}
                      onChange={() => setPhysicianNotified('Yes')}
                      className="accent-rose-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="physicianNotified"
                      checked={physicianNotified === 'No'}
                      onChange={() => setPhysicianNotified('No')}
                      className="accent-rose-600"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Evaluation and Treatment */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">2</span>
              Evaluation and Treatment
            </h2>

            {/* Nosocomial classification radio group */}
            <div className="space-y-2 mb-5 rounded-xl bg-pearl-50/80 dark:bg-charcoal-800/60 p-3.5 border border-pearl-200/80 dark:border-charcoal-700/60">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="nosocomialSource"
                  checked={nosocomialSource === 'Community'}
                  onChange={() => setNosocomialSource('Community')}
                  className="mt-0.5 accent-rose-600"
                />
                <span>
                  <strong>Nosocomial - Community:</strong> Acquired after 72 hours of admission to home health.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="nosocomialSource"
                  checked={nosocomialSource === 'Healthcare-Associated'}
                  onChange={() => setNosocomialSource('Healthcare-Associated')}
                  className="mt-0.5 accent-rose-600"
                />
                <span>
                  <strong>Nosocomial - Healthcare-Associated:</strong> Infection within 24-48 hours of admission to home health; Infected prior to admission.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Radios Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-pearl-100 dark:border-charcoal-700 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Chest X-Ray Obtained</span>
                  <div className="flex items-center gap-3">
                    {(['Yes', 'No', 'N/A'] as const).map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="chestXRay"
                          checked={chestXRay === opt}
                          onChange={() => setChestXRay(opt)}
                          className="accent-rose-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-pearl-100 dark:border-charcoal-700 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Culture Completed</span>
                  <div className="flex items-center gap-3">
                    {(['Yes', 'No', 'N/A'] as const).map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="cultureCompleted"
                          checked={cultureCompleted === opt}
                          onChange={() => setCultureCompleted(opt)}
                          className="accent-rose-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-pearl-100 dark:border-charcoal-700 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Antibiotic Prescribed</span>
                  <div className="flex items-center gap-3">
                    {(['Yes', 'No', 'N/A'] as const).map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="antibioticPrescribed"
                          checked={antibioticPrescribed === opt}
                          onChange={() => setAntibioticPrescribed(opt)}
                          className="accent-rose-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lab & Treatment Textareas */}
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lab(s) Completed
                  </label>
                  <input
                    type="text"
                    value={labsCompleted}
                    onChange={(e) => setLabsCompleted(e.target.value)}
                    placeholder="e.g. Urine culture, Blood culture, Sputum..."
                    className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Treatment / Medication Prescribed
                  </label>
                  <input
                    type="text"
                    value={treatmentPrescribed}
                    onChange={(e) => setTreatmentPrescribed(e.target.value)}
                    placeholder="Enter description..."
                    className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Type of Infection / Signs and Symptoms */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">3</span>
              Type of Infection / Signs and Symptoms <span className="text-rose-600">*</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select all symptoms, clinical presentations, and sites documented during assessment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INFECTION_TYPES.map((type) => {
                const checked = selectedInfectionTypes.includes(type);
                return (
                  <label
                    key={type}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer ${
                      checked
                        ? 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-pearl-200 bg-white text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInfectionType(type)}
                      className="accent-rose-600 shrink-0"
                    />
                    <span className="truncate">{type}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Section 4 & 5: Reportable Diseases & Infection Control */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Section 4: Reportable Diseases */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">4</span>
                Reportable Diseases
              </h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowCdcModal(true)}
                  className="rounded-xl border border-slate-300 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
                >
                  CDC Reportable Diseases Guidance
                </button>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                  <input
                    type="checkbox"
                    checked={reportableDiseasePresent}
                    onChange={(e) => setReportableDiseasePresent(e.target.checked)}
                    className="accent-rose-600"
                  />
                  <span>Reportable disease present</span>
                </label>
              </div>
            </section>

            {/* Section 5: Infection Control */}
            <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 shadow-2xs backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">5</span>
                Infection Control Precautions
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {INFECTION_CONTROL_PRECAUTIONS.map((precaution) => {
                  const checked = selectedPrecautions.includes(precaution);
                  return (
                    <label
                      key={precaution}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer ${
                        checked
                          ? 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                          : 'border-pearl-200 bg-white text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePrecaution(precaution)}
                        className="accent-rose-600 shrink-0"
                      />
                      <span className="truncate">{precaution}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Section 6: Infection Log Report Comments */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">6</span>
                Infection Log Report Comments
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Templates:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setComments((prev) => (prev ? `${prev}\n${e.target.value}` : e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="rounded-lg border border-pearl-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                >
                  <option value="">Insert Template...</option>
                  {INFECTION_TEMPLATES.map((tmpl) => (
                    <option key={tmpl} value={tmpl}>
                      {tmpl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Describe infection presentation, onset, symptoms, vitals, and physician communications..."
              className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="mt-1 flex justify-end text-[11px] text-slate-400">
              {5000 - comments.length} characters remaining
            </div>
          </section>

          {/* Section 7: Follow-Up */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">7</span>
                Follow-Up Documentation
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Templates:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setFollowUpComments((prev) =>
                        prev ? `${prev}\n${e.target.value}` : e.target.value
                      );
                      e.target.value = '';
                    }
                  }}
                  className="rounded-lg border border-pearl-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                >
                  <option value="">Insert Follow-Up Template...</option>
                  {FOLLOWUP_TEMPLATES.map((tmpl) => (
                    <option key={tmpl} value={tmpl}>
                      {tmpl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Indicate follow-up processes performed. The Complete button is active when follow-up resolution or N/A is chosen.
            </p>

            <div className="flex items-center gap-6 mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="followUpOption"
                  checked={followUpOption === 'performed'}
                  onChange={() => setFollowUpOption('performed')}
                  className="accent-rose-600"
                />
                Follow-up documentation performed
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="followUpOption"
                  checked={followUpOption === 'na'}
                  onChange={() => setFollowUpOption('na')}
                  className="accent-rose-600"
                />
                N/A
              </label>
            </div>

            <textarea
              value={followUpComments}
              onChange={(e) => setFollowUpComments(e.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Enter follow-up outcome, resolution dates, repeat labs, and final clinical status..."
              className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="mt-1 flex justify-end text-[11px] text-slate-400">
              {5000 - followUpComments.length} characters remaining
            </div>
          </section>

          {/* Section 8: Electronic Signature & Action Bar */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">8</span>
              Electronic Signature
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Clinician Signature <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={clinicianSignature}
                  onChange={(e) => setClinicianSignature(e.target.value)}
                  placeholder="e.g. Jane Doe, RN"
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Signature Date
                </label>
                <input
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Signature Time
                </label>
                <input
                  type="time"
                  value={signatureTime}
                  onChange={(e) => setSignatureTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-pearl-100 pt-4 dark:border-charcoal-700">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:bg-charcoal-750 transition cursor-pointer"
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
                onClick={() => handleSubmit('complete')}
                className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                Complete Infection Log
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* CDC Modal */}
      {showCdcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-charcoal-850">
            <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert size={20} />
                <h3 className="font-black text-sm">CDC National Notifiable Diseases</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCdcModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              State public health departments mandate reporting for specific diseases within 24–48 hours, including:
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>Novel Influenza A, COVID-19 hospitalized cases</li>
              <li>Carbapenem-Resistant Enterobacteriaceae (CRE)</li>
              <li>Methicillin-Resistant Staphylococcus Aureus (MRSA) bacteremia</li>
              <li>Clostridioides difficile (C. diff) infection</li>
              <li>Legionellosis, Pertussis, Tuberculosis</li>
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCdcModal(false)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
