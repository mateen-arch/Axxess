import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileSignature,
  FileText,
  HeartPulse,
  Info,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface CreateIncidentLogPageProps {
  onBack: () => void;
  onIncidentLogged?: () => void;
}

const INCIDENT_TYPES = [
  'Abuse/Neglect',
  'Complaint',
  'DME Malfunction',
  'Fall With Injury',
  'Fall Without Injury',
  'Medication Issue',
  'Missing/Damaged Property',
  'Near Fall',
  'Patient Care Error',
  'Physical Altercation',
  'Protected Health Information (PHI) Breach',
  'Service Failure',
  'Suicide Attempt or Completion',
  'Verbal Altercation',
  'Other',
];

const TEMPLATES = [
  'Patient Unwitnessed Fall in Bathroom',
  'Medication Omission / Missed Dose',
  'DME Oxygen Concentrator Alarm Failure',
  'Skin Tear during Transfer',
  'Caregiver Dispute Regarding Scheduling',
  'Adverse Reaction to Prescribed Therapy',
  'LUPA Risk Incident Notification',
];

function getTodayFormatted(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getCurrentTimeFormatted(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export const CreateIncidentLogPage: React.FC<CreateIncidentLogPageProps> = ({
  onBack,
  onIncidentLogged,
}) => {
  const { patients, clinicians, organization } = useHealthcare();

  const homeHealthPatients = useMemo(() => {
    const hh = patients.filter((p) => p.serviceLine === 'home_health');
    return hh.length > 0 ? hh : patients;
  }, [patients]);

  // Section 1: Patient Information
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [episodePeriod, setEpisodePeriod] = useState('11/01/2026 - 12/30/2026');
  const [dateOfIncident, setDateOfIncident] = useState(getTodayFormatted());
  const [timeOfIncident, setTimeOfIncident] = useState(getCurrentTimeFormatted());
  const [mrn, setMrn] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState('');
  const [clinicalManager, setClinicalManager] = useState('Hilder M., RN');
  const [caseManager, setCaseManager] = useState('Alexandria Nelson, RN');
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [familyNotified, setFamilyNotified] = useState<'Yes' | 'No'>('Yes');
  const [physicianNotified, setPhysicianNotified] = useState<'Yes' | 'No'>('Yes');

  // Section 2: Individuals Involved
  const [individualsInvolved, setIndividualsInvolved] = useState<string[]>(['Patient']);

  // Section 3: Type of Incident
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>(['Fall Without Injury']);

  // Section 4: Evaluation and Actions
  const [severity, setSeverity] = useState('Level 1: Minor');
  const [injuryLevel, setInjuryLevel] = useState('N/A');
  const [witnessed, setWitnessed] = useState<'Yes' | 'No' | 'N/A'>('No');
  const [sentinelEvent, setSentinelEvent] = useState<'Yes' | 'No' | 'N/A'>('No');
  const [interventionsProvided, setInterventionsProvided] = useState<'Yes' | 'No' | 'N/A'>('Yes');
  const [physicianOrderNeeded, setPhysicianOrderNeeded] = useState(false);

  // Section 5: Description & Comments
  const [description, setDescription] = useState('');

  // Section 6: Follow-Up
  const [followUpNA, setFollowUpNA] = useState(false);
  const [followUpComments, setFollowUpComments] = useState('');

  // Section 7: Signature
  const [clinicianSignature, setClinicianSignature] = useState('Hilder M., RN');
  const [signatureDate, setSignatureDate] = useState(getTodayFormatted());
  const [signatureTime, setSignatureTime] = useState(getCurrentTimeFormatted());

  // UI state
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedPatient = useMemo<Patient | undefined>(() => {
    return patients.find((p) => p.id === selectedPatientId || p.mrn === selectedPatientId);
  }, [patients, selectedPatientId]);

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    const pat = patients.find((p) => p.id === pId || p.mrn === pId);
    if (pat) {
      setMrn(pat.mrn);
      setPrimaryDiagnosis(pat.primaryDiagnosis || '');
      setAttendingPhysician(pat.attendingPhysician || 'Dr. Anita Gupta, MD');
      if (pat.assignedNurseName) setCaseManager(pat.assignedNurseName);
    }
  };

  const toggleIndividual = (ind: string) => {
    setIndividualsInvolved((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const toggleIncidentType = (type: string) => {
    setSelectedIncidentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isValid = Boolean(selectedPatientId && dateOfIncident && description.trim());

  const handleSubmit = (action: 'draft' | 'complete') => {
    if (action === 'complete' && !isValid) {
      setShowErrors(true);
      return;
    }
    setIsSuccess(true);
    setTimeout(() => {
      onIncidentLogged?.();
      onBack();
    }, 1200);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Axxess Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Incident Log
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Clinical Safety & Quality Incident Surveillance
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
          <span>Incident log documented and submitted to QA Center successfully!</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select a Patient and provide an Incident Description before completing.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <ShieldAlert size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Quality Assurance</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Document all patient clinical incidents, falls, medication errors, and grievances in accordance with ACHC / CHAP accreditation and CMS Conditions of Participation.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Reporting Window:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Within 24 Hours</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>QA Reviewer:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Clinical Supervisor</strong>
                </div>
              </div>
            </div>

            {/* Selected Patient Card */}
            {selectedPatient ? (
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-white p-4 dark:border-rose-900/50 dark:from-rose-950/20 dark:to-charcoal-850 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Patient Profile
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {selectedPatient.status}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                  {selectedPatient.lastName}, {selectedPatient.firstName}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  MRN: #{selectedPatient.mrn} • Phone: {selectedPatient.phone}
                </p>
                <div className="mt-3 space-y-1 border-t border-rose-100/80 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Attending: <strong>{selectedPatient.attendingPhysician || 'Dr. Anita Gupta, MD'}</strong></div>
                  <div>Diagnosis: <strong className="truncate">{selectedPatient.primaryDiagnosis || 'N/A'}</strong></div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-4 text-center text-xs text-slate-500 dark:border-charcoal-700 dark:text-slate-400">
                Select a patient from the form to view safety record and episode info.
              </div>
            )}
          </div>
        </aside>

        {/* Right / Main Form Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* 1. Patient Information */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <User size={16} />
                <h2 className="text-xs font-black uppercase tracking-wider">Patient Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Patient Name <span className="text-rose-600 font-black">*</span>
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  >
                    <option value="">-- Select Patient --</option>
                    {homeHealthPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName}, {p.firstName} (MRN: #{p.mrn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Episode Period
                  </label>
                  <input
                    type="text"
                    value={episodePeriod}
                    onChange={(e) => setEpisodePeriod(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Date of Incident <span className="text-rose-600 font-black">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfIncident}
                    onChange={(e) => setDateOfIncident(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Time of Incident
                  </label>
                  <input
                    type="text"
                    value={timeOfIncident}
                    onChange={(e) => setTimeOfIncident(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    MRN
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={mrn || 'Auto-populated'}
                    className="w-full rounded-xl border border-pearl-200 bg-pearl-50 px-3 py-2 text-xs font-mono text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Clinical Manager
                  </label>
                  <input
                    type="text"
                    value={clinicalManager}
                    onChange={(e) => setClinicalManager(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Primary Diagnosis
                  </label>
                  <input
                    type="text"
                    value={primaryDiagnosis}
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={attendingPhysician}
                    onChange={(e) => setAttendingPhysician(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>

                <div className="lg:col-span-2 flex items-center justify-between p-3 rounded-2xl border border-pearl-200 bg-pearl-50/50 dark:border-charcoal-700 dark:bg-charcoal-800/50">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Family Notified?
                  </span>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="famNotified"
                        checked={familyNotified === 'Yes'}
                        onChange={() => setFamilyNotified('Yes')}
                        className="accent-rose-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="famNotified"
                        checked={familyNotified === 'No'}
                        onChange={() => setFamilyNotified('No')}
                        className="accent-rose-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-2 flex items-center justify-between p-3 rounded-2xl border border-pearl-200 bg-pearl-50/50 dark:border-charcoal-700 dark:bg-charcoal-800/50">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Physician Notified?
                  </span>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mdNotified"
                        checked={physicianNotified === 'Yes'}
                        onChange={() => setPhysicianNotified('Yes')}
                        className="accent-rose-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mdNotified"
                        checked={physicianNotified === 'No'}
                        onChange={() => setPhysicianNotified('No')}
                        className="accent-rose-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Individuals Involved */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Individuals Involved
              </h2>
              <div className="flex flex-wrap gap-4 pt-1">
                {['Patient', 'Caregiver', 'Employee/Contractor', 'Other'].map((ind) => (
                  <label
                    key={ind}
                    className="flex items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={individualsInvolved.includes(ind)}
                      onChange={() => toggleIndividual(ind)}
                      className="accent-rose-600"
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Type of Incident */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Type of Incident
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {INCIDENT_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                      selectedIncidentTypes.includes(type)
                        ? 'border-rose-400 bg-rose-50/70 text-rose-900 font-bold dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-pearl-200 bg-white text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIncidentTypes.includes(type)}
                      onChange={() => toggleIncidentType(type)}
                      className="accent-rose-600"
                    />
                    <span className="truncate">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Evaluation and Actions */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Evaluation and Actions
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Severity of Incident:
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['Level 1: Minor', 'Level 2: Moderate', 'Level 3: Major', 'Level 4: Critical'].map((lvl) => (
                      <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="severity"
                          checked={severity === lvl}
                          onChange={() => setSeverity(lvl)}
                          className="accent-rose-600"
                        />
                        <span>{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Level of Injury:
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'Minor Injury (First Aid Only)',
                      'Moderate Injury',
                      'ER or Acute Care Admission',
                      'N/A',
                    ].map((inj) => (
                      <label key={inj} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="injuryLevel"
                          checked={injuryLevel === inj}
                          onChange={() => setInjuryLevel(inj)}
                          className="accent-rose-600"
                        />
                        <span>{inj}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-pearl-100 pt-3 dark:border-charcoal-750">
                  <div>
                    <label className="block font-bold mb-1">Witnessed?</label>
                    <div className="flex gap-2">
                      {['Yes', 'No', 'N/A'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWitnessed(opt as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                            witnessed === opt
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-600 border-pearl-200 dark:bg-charcoal-800 dark:text-slate-300 dark:border-charcoal-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Sentinel Event?</label>
                    <div className="flex gap-2">
                      {['Yes', 'No', 'N/A'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSentinelEvent(opt as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                            sentinelEvent === opt
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-600 border-pearl-200 dark:bg-charcoal-800 dark:text-slate-300 dark:border-charcoal-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Interventions Provided?</label>
                    <div className="flex gap-2">
                      {['Yes', 'No', 'N/A'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setInterventionsProvided(opt as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                            interventionsProvided === opt
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-600 border-pearl-200 dark:bg-charcoal-800 dark:text-slate-300 dark:border-charcoal-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Incident Description / Comments */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Incident Description / Comments
                </h2>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setDescription((prev) => (prev ? `${prev}\n\n${e.target.value}` : e.target.value));
                    }
                  }}
                  className="rounded-xl border border-pearl-200 bg-pearl-50 px-3 py-1 text-xs outline-none dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                >
                  <option value="">Insert Template...</option>
                  {TEMPLATES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <textarea
                rows={4}
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident, circumstances, contributing factors, vital signs, and immediate actions taken..."
                className="w-full rounded-xl border border-pearl-200 bg-white p-3.5 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white resize-none"
              />
              <div className="text-right text-[10px] text-slate-400">
                You have {5000 - description.length} characters remaining
              </div>
            </div>

            {/* 6. Follow-Up */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Follow-Up Documentation
                </h2>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followUpNA}
                    onChange={(e) => setFollowUpNA(e.target.checked)}
                    className="accent-rose-600"
                  />
                  <span>N/A</span>
                </label>
              </div>

              {!followUpNA && (
                <>
                  <textarea
                    rows={3}
                    maxLength={5000}
                    value={followUpComments}
                    onChange={(e) => setFollowUpComments(e.target.value)}
                    placeholder="Enter follow-up outcomes, patient resolution status, or preventive precautions implemented..."
                    className="w-full rounded-xl border border-pearl-200 bg-white p-3.5 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white resize-none"
                  />
                  <div className="text-right text-[10px] text-slate-400">
                    You have {5000 - followUpComments.length} characters remaining
                  </div>
                </>
              )}
            </div>

            {/* 7. Electronic Signature */}
            <div className="rounded-3xl border border-pearl-200/90 bg-white p-6 shadow-xs dark:border-charcoal-700/80 dark:bg-charcoal-850 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Electronic Signature
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Clinician Signature
                  </label>
                  <input
                    type="text"
                    value={clinicianSignature}
                    onChange={(e) => setClinicianSignature(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3.5 py-2 text-xs font-serif italic outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Signature Date
                  </label>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Signature Time
                  </label>
                  <input
                    type="text"
                    value={signatureTime}
                    onChange={(e) => setSignatureTime(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:bg-charcoal-750 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="h-10 rounded-xl border border-rose-300 bg-rose-50 px-5 text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('complete')}
                className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-extrabold text-white shadow-xs transition hover:-translate-y-0.5 hover:bg-rose-700 cursor-pointer"
              >
                Complete Incident Log
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

