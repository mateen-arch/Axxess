import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileSignature,
  FileText,
  HeartPulse,
  Info,
  Mail,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface CreateCommunicationNotePageProps {
  onBack: () => void;
  onNoteCreated?: () => void;
}

const templateOptions = [
  'Communication Note For PA Approvals',
  'Physician Verbal Order Acknowledgment',
  'Care Coordination with Primary Physician',
  'Medication Reconciliation Discrepancy',
  'Wound Care Treatment Plan Change',
  'Therapy Evaluation Frequency Adjustment',
  'Hospitalization / ER Visit Notification',
  'Patient Refusal of Scheduled Visit',
  'Change in Patient Clinical Status',
  'HHA Frequency Update',
  'Private Duty Nursing Coordination',
  'SHC - Start of Care Coordination',
  'SHC - Recertification Notice',
  'SHC - Transfer (not discharged)',
  'SHC - Discharge (goals met)',
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

export const CreateCommunicationNotePage: React.FC<CreateCommunicationNotePageProps> = ({
  onBack,
  onNoteCreated,
}) => {
  const {
    organization,
    patients,
    clinicians,
    homeHealthEpisodes,
    addCommunicationNote,
    addMessage,
  } = useHealthcare();

  // Active home health patients
  const homeHealthPatients = useMemo(() => {
    const hh = patients.filter((p) => p.serviceLine === 'home_health');
    return hh.length > 0 ? hh : patients;
  }, [patients]);

  // Form State
  const [patientStatus, setPatientStatus] = useState<'Active' | 'Discharged'>('Active');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [episodeAssociated, setEpisodeAssociated] = useState<string>('');
  const [noteDate, setNoteDate] = useState<string>(getTodayFormatted());
  const [physician, setPhysician] = useState<string>('');
  const [communicationText, setCommunicationText] = useState<string>('');
  const [sendAsMessage, setSendAsMessage] = useState<boolean>(false);
  const [staffSignature, setStaffSignature] = useState<string>('Hilder Magessa, RN');
  const [signatureDate, setSignatureDate] = useState<string>(getTodayFormatted());
  const [signatureTime, setSignatureTime] = useState<string>(getCurrentTimeFormatted());

  // UI Modals & State
  const [showNewPhysicianModal, setShowNewPhysicianModal] = useState(false);
  const [newPhysicianName, setNewPhysicianName] = useState('');
  const [physicianSearchQuery, setPhysicianSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Selected Patient Object
  const selectedPatient = useMemo<Patient | undefined>(() => {
    return patients.find((p) => p.id === selectedPatientId || p.mrn === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Compute available episodes for patient
  const availableEpisodes = useMemo(() => {
    if (!selectedPatient) return [];
    const patientEpisodes = homeHealthEpisodes.filter(
      (ep) => ep.patientId === selectedPatient.id || ep.patientName.includes(selectedPatient.lastName)
    );
    if (patientEpisodes.length > 0) {
      return patientEpisodes.map((ep) => `${ep.episodeStartDate} - ${ep.episodeEndDate} (SOC: ${ep.startOfCareDate})`);
    }
    // Fallback standard episode from patient record
    const soc = selectedPatient.startOfCareDate || selectedPatient.admissionDate || getTodayFormatted();
    const socDate = new Date(soc + 'T00:00:00');
    const endDate = new Date(socDate);
    endDate.setDate(endDate.getDate() + 59);
    const endStr = endDate.toISOString().split('T')[0];
    return [
      `${soc} - ${endStr} (SOC: ${soc})`,
      `Current Active Episode · 60-Day Recertification`,
    ];
  }, [selectedPatient, homeHealthEpisodes]);

  // When patient is picked, auto-populate details
  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId || p.mrn === patId);
    if (pat) {
      setPatientStatus(pat.status === 'discharged' ? 'Discharged' : 'Active');
      if (pat.attendingPhysician) {
        setPhysician(pat.attendingPhysician);
      }
      const soc = pat.startOfCareDate || pat.admissionDate || getTodayFormatted();
      const socDate = new Date(soc + 'T00:00:00');
      const endDate = new Date(socDate);
      endDate.setDate(endDate.getDate() + 59);
      setEpisodeAssociated(`${soc} - ${endDate.toISOString().split('T')[0]} (SOC: ${soc})`);
    }
  };

  // Physician directory list
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

  const handleTemplateInsert = (templateName: string) => {
    setSelectedTemplate(templateName);
    if (!templateName) return;
    const templateBodies: Record<string, string> = {
      'Communication Note For PA Approvals':
        'Prior Authorization Communication Note:\nSpoke with physician clinic regarding clinical necessity for continuation of home health skilled nursing and physical therapy services. Physician signed orders and clinical documentation submitted for insurance PA review.',
      'Physician Verbal Order Acknowledgment':
        'Physician Verbal Order:\nReceived verbal order from primary physician to update wound care dressing frequency to daily and adjust medication dosage per physician instruction. Order Form 485 read back and verified.',
      'Care Coordination with Primary Physician':
        'Care Coordination Summary:\nContacted primary physician clinic regarding patient vital signs and lab results. Physician acknowledged and advised continuing current care plan with clinical nurse follow-up in 48 hours.',
      'Medication Reconciliation Discrepancy':
        'Medication Reconciliation:\nIdentified discrepancy between hospital discharge summary and patient home medication regimen. Clarified with prescribing physician; orders updated accordingly.',
      'SHC - Start of Care Coordination':
        'Start of Care Coordination Note:\nComprehensive OASIS-E Start of Care evaluation completed. Interdisciplinary care team notified. Skilled nursing, physical therapy, and home health aide frequencies initiated.',
    };
    const body = templateBodies[templateName] || `Clinical Note regarding ${templateName}:\nCoordinated with care team and physician. Documentation placed in patient electronic chart.`;
    setCommunicationText((prev) => (prev ? `${prev}\n\n${body}` : body));
  };

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!selectedPatientId) errs.patient = 'Patient Name is required';
    if (!episodeAssociated) errs.episode = 'Associated Episode is required';
    if (!communicationText.trim()) errs.text = 'Communication text is required';
    return errs;
  }, [selectedPatientId, episodeAssociated, communicationText]);

  const isValid = Object.keys(errors).length === 0;

  const handleSaveOrComplete = (status: 'Saved' | 'Complete') => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    const patientName = selectedPatient
      ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
      : 'Selected Patient';

    addCommunicationNote({
      patientId: selectedPatientId,
      patientName,
      patientStatus,
      episodeAssociated,
      physician: physician || 'Attending Physician',
      noteDate,
      communicationText,
      sendAsMessage,
      staffSignature: staffSignature || 'Staff Clinician',
      signatureDate,
      signatureTime,
      status,
    });

    // If "Send note as Message" is checked, dispatch to messages
    if (sendAsMessage) {
      addMessage({
        senderName: staffSignature || 'Clinical Staff',
        senderRole: 'Home Health Clinician',
        subject: `Communication Note: ${patientName}`,
        snippet: communicationText.slice(0, 140) + (communicationText.length > 140 ? '...' : ''),
        serviceLine: 'home_health',
        organizationName: organization.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isRead: false,
        priority: 'routine',
        patientName,
        body: communicationText,
        regardingPatientId: selectedPatientId,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      if (onNoteCreated) onNoteCreated();
      else onBack();
    }, 1200);
  };

  const charactersRemaining = Math.max(0, 5000 - communicationText.length);

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans dark:bg-charcoal-900 transition-colors">
      {/* 1. Contextual Header Strip */}
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
                New Communication Note
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">CMS Clinical Coordination Record</span>
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
            title="Cancel"
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
          <span>Communication note successfully saved and recorded to the patient chart!</span>
        </div>
      )}

      {/* Validation Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select a Patient, an Associated Episode, and enter your communication text.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Note Purpose Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <FileText size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Communication Note</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Document all telephone, verbal, and electronic communications between clinicians, physicians, patients, and families regarding care coordination.
              </p>
              <div className="mt-3.5 space-y-1.5 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>HIPAA Compliance:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">Audited & Encrypted</strong>
                </div>
                <div className="flex justify-between">
                  <span>Legal Medical Record:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Chart Permanent</strong>
                </div>
              </div>
            </div>

            {/* Selected Patient Overview Card */}
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
                <h4 className="mt-1 text-sm font-black text-slate-950 dark:text-white">
                  {selectedPatient.lastName}, {selectedPatient.firstName}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  MRN: #{selectedPatient.mrn} • DOB: {selectedPatient.dob || '—'}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-rose-100/80 pt-2.5 text-[11px] dark:border-rose-900/30">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Diagnosis:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {selectedPatient.primaryDiagnosis || 'None recorded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Attending MD:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {physician || selectedPatient.attendingPhysician || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-4 text-center dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30">
                <User size={24} className="mx-auto text-slate-400" />
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">No Patient Selected</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Choose a patient to attach this communication note.</p>
              </div>
            )}

            {/* Quick Templates Box */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Sparkles size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">Quick Note Templates</h4>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Select a standard template below to insert pre-filled clinical phrasing into the note:
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {[
                  'Physician Verbal Order Acknowledgment',
                  'Care Coordination with Primary Physician',
                  'Medication Reconciliation Discrepancy',
                  'SHC - Start of Care Coordination',
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => handleTemplateInsert(tmpl)}
                    className="rounded-lg border border-pearl-200 bg-white/80 px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-rose-300 hover:bg-rose-50/70 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-850 dark:text-slate-200 transition"
                  >
                    + {tmpl}
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
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Top Page Title Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/80 bg-white/85 p-5 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/85">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-2xs">
                  <FileSignature size={20} />
                </span>
                <div>
                  <h1 className="text-xl font-black text-slate-950 dark:text-white">
                    New Communication Note
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record care coordination, physician calls, and verbal orders for patient charting.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                <HeartPulse size={14} className="text-rose-600 dark:text-rose-400" />
                <span>Patient Chart Permanent</span>
              </div>
            </div>

            {/* SECTION 1: Communication Note Header Grid */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-5 flex items-center gap-2 pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <FileText size={16} className="text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Communication Note Details
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column: Status, Patient, Episode, Date */}
                <div className="space-y-4">
                  {/* Patient Status */}
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Patient Status: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <select
                      value={patientStatus}
                      onChange={(e) => setPatientStatus(e.target.value as 'Active' | 'Discharged')}
                      className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Active">Active</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  {/* Patient Name */}
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Patient Name: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <div>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                        className={`h-10 w-full rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.patient
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      >
                        <option value="">Select Patient</option>
                        {homeHealthPatients.map((pat) => (
                          <option key={pat.id} value={pat.id}>
                            {pat.lastName}, {pat.firstName} (#{pat.mrn})
                          </option>
                        ))}
                      </select>
                      {showErrors && errors.patient && (
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle size={12} className="shrink-0" />
                          {errors.patient}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Episode Associated */}
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Episode Associated: <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <div>
                      <select
                        value={episodeAssociated}
                        onChange={(e) => setEpisodeAssociated(e.target.value)}
                        className={`h-10 w-full rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                          showErrors && errors.episode
                            ? 'border-rose-400 ring-1 ring-rose-400/30'
                            : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                        }`}
                      >
                        <option value="">Select Episode</option>
                        {availableEpisodes.map((ep) => (
                          <option key={ep} value={ep}>
                            {ep}
                          </option>
                        ))}
                      </select>
                      {showErrors && errors.episode && (
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle size={12} className="shrink-0" />
                          {errors.episode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Date:
                    </label>
                    <input
                      type="date"
                      value={noteDate}
                      onChange={(e) => setNoteDate(e.target.value)}
                      className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                {/* Right Column: Physician Selection & New Physician Button */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                    <label className="pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      Physician:
                    </label>
                    <div className="space-y-3">
                      <div className="relative flex items-center">
                        <Search size={15} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={physician}
                          onChange={(e) => setPhysician(e.target.value)}
                          placeholder="Search Physician..."
                          className="h-10 w-full rounded-xl border border-pearl-200 bg-white pl-9 pr-3.5 text-xs font-medium text-slate-900 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowNewPhysicianModal(true)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 w-full rounded-xl border border-pearl-200 bg-pearl-50 px-4 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                      >
                        <Plus size={14} />
                        <span>New Physician</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Templates & Communication Text */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-rose-600 dark:text-rose-400" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Communication Text
                  </h2>
                </div>

                {/* Select Templates Dropdown matching reference screenshot */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateInsert(e.target.value)}
                    className="h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-none transition hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                  >
                    <option value="">Select Templates</option>
                    {templateOptions.map((tmpl) => (
                      <option key={tmpl} value={tmpl}>
                        {tmpl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={communicationText}
                  onChange={(e) => setCommunicationText(e.target.value)}
                  placeholder="Enter detailed communication note narrative, verbal orders, physician instructions, or coordination events..."
                  rows={8}
                  maxLength={5000}
                  className={`w-full rounded-2xl border bg-white dark:bg-charcoal-800 p-4 text-xs font-medium leading-relaxed text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                    showErrors && errors.text
                      ? 'border-rose-400 ring-1 ring-rose-400/30'
                      : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  {showErrors && errors.text ? (
                    <span className="flex items-center gap-1 font-semibold text-rose-600">
                      <AlertTriangle size={12} /> Communication text cannot be empty.
                    </span>
                  ) : (
                    <span>Narrative becomes part of the official clinical record.</span>
                  )}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    You have {charactersRemaining} characters remaining.
                  </span>
                </div>
              </div>

              {/* Checkbox: Send note as Message per reference screenshot */}
              <div className="mt-5 pt-4 border-t border-pearl-200/80 dark:border-charcoal-700/80">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={sendAsMessage}
                    onChange={(e) => setSendAsMessage(e.target.checked)}
                    className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-rose-600 dark:text-rose-400" />
                    <span>Send note as Message</span>
                  </div>
                </label>
                <p className="mt-1 ml-6 text-[11px] text-slate-500 dark:text-slate-400">
                  When checked, a copy of this communication will automatically be dispatched to the care-team inbox.
                </p>
              </div>
            </section>

            {/* SECTION 3: Electronic Signature */}
            <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="mb-5 flex items-center gap-2 pb-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                <FileCheck2 size={16} className="text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Electronic Signature
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Staff Signature */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Staff Signature:
                  </label>
                  <input
                    type="text"
                    value={staffSignature}
                    onChange={(e) => setStaffSignature(e.target.value)}
                    placeholder="Enter Staff Signature"
                    className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Signature Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Signature Date:
                  </label>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Time:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={signatureTime}
                      onChange={(e) => setSignatureTime(e.target.value)}
                      placeholder="HH:MM AM/PM"
                      className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 pr-8 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                    <Clock size={15} className="absolute right-2.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Action Bar per reference screenshot: Save, Complete, Cancel */}
            <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200/90 bg-white/90 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/90 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Completing this note signs and locks the entry in compliance with CMS guidelines.
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
                  type="button"
                  onClick={() => handleSaveOrComplete('Saved')}
                  disabled={isSuccess}
                  className="h-10 rounded-xl border border-rose-200 bg-rose-50/70 px-5 text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrComplete('Complete')}
                  disabled={isSuccess}
                  className="flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-6 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>Complete</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Physician Modal */}
      {showNewPhysicianModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setShowNewPhysicianModal(false)}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
            <div className="flex items-center justify-between border-b border-pearl-200/80 pb-3 dark:border-charcoal-700/80">
              <div className="flex items-center gap-2">
                <Stethoscope size={18} className="text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Add New Physician
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPhysicianModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Physician Full Name & Credentials
                </span>
                <input
                  type="text"
                  value={newPhysicianName}
                  onChange={(e) => setNewPhysicianName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Conan, MD"
                  className="h-10 w-full rounded-xl border border-pearl-200 bg-white px-3.5 text-xs font-medium outline-none focus:border-rose-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white"
                  autoFocus
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80">
              <button
                type="button"
                onClick={() => setShowNewPhysicianModal(false)}
                className="h-9 rounded-xl border border-pearl-200 bg-white px-4 text-xs font-bold text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newPhysicianName.trim()) {
                    setPhysician(newPhysicianName.trim());
                    setShowNewPhysicianModal(false);
                    setNewPhysicianName('');
                  }
                }}
                className="h-9 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Add Physician
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

