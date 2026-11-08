import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  Plus,
  Trash2,
  X,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Pill,
  FileText,
  Activity,
  Package,
  Layers,
  Sparkles,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { OrderType, HomeHealthOrder, Patient } from '../../types';

interface CreateOrderPageProps {
  onBack: () => void;
  onOrderCreated?: () => void;
}

interface MedicationRow {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  action: 'New' | 'Change' | 'Discontinue';
  indication: string;
}

interface DisciplineRow {
  id: string;
  discipline: 'SN' | 'PT' | 'OT' | 'ST' | 'MSW' | 'HHA';
  frequency: string;
  duration: string;
  goals: string;
}

interface SupplyRow {
  id: string;
  item: string;
  quantity: string;
  frequency: string;
  justification: string;
}

const DEFAULT_PHYSICIANS = [
  { id: 'dr-gupta', name: 'Dr. Anita Gupta, MD', npi: '1487920194', phone: '(978) 555-0182', fax: '(978) 555-0199', address: '100 Cummings Center, Suite 120, Beverly, MA 01915' },
  { id: 'dr-chen', name: 'Dr. Michael Chen, MD', npi: '1928374651', phone: '(978) 555-0144', fax: '(978) 555-0149', address: '450 Essex St, Salem, MA 01970' },
  { id: 'dr-patel', name: 'Dr. Sarah Patel, DO', npi: '1192837462', phone: '(978) 555-0165', fax: '(978) 555-0169', address: '85 Constitution Way, Danvers, MA 01923' },
  { id: 'dr-adams', name: 'Dr. John Adams, MD', npi: '1728394012', phone: '(978) 555-0111', fax: '(978) 555-0119', address: '200 Highland Ave, Peabody, MA 01960' },
  { id: 'dr-ross', name: 'Dr. Emily Ross, MD', npi: '1839201948', phone: '(978) 555-0133', fax: '(978) 555-0139', address: '500 Boston St, Lynn, MA 01905' },
];

export const CreateOrderPage: React.FC<CreateOrderPageProps> = ({ onBack, onOrderCreated }) => {
  const { patients, homeHealthEpisodes, addHomeHealthOrder, organization } = useHealthcare();

  // Active home health patients
  const homeHealthPatients = useMemo(() => {
    return patients.filter(
      (p) => p.serviceLine === 'home_health' && (p.status === 'active' || p.status === 'pending_admission')
    );
  }, [patients]);

  // Form State
  const [patientId, setPatientId] = useState<string>('');
  const [episodeAssociated, setEpisodeAssociated] = useState<string>('');
  const [attendingPhysician, setAttendingPhysician] = useState<string>('Dr. Anita Gupta, MD');
  const [sendToPhysician, setSendToPhysician] = useState<string>('Dr. Anita Gupta, MD');
  const [copyToPhysician, setCopyToPhysician] = useState<string>('');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('14:30');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [orderIsForNextEpisode, setOrderIsForNextEpisode] = useState<boolean>(false);

  const [summaryTitle, setSummaryTitle] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('Medication Orders');
  const [orderReadBackAndVerified, setOrderReadBackAndVerified] = useState<boolean>(true);

  // Clinician Signature Section
  const [clinicianSignature, setClinicianSignature] = useState<string>('Hilder M., RN');
  const [signatureDate, setSignatureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [signatureTime, setSignatureTime] = useState<string>('14:32');

  // Dynamic Clinical Content
  const [orderNarrative, setOrderNarrative] = useState<string>('');
  const [medications, setMedications] = useState<MedicationRow[]>([
    {
      id: 'med-1',
      name: 'Furosemide (Lasix)',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'Daily in morning',
      action: 'Change',
      indication: 'Congestive Heart Failure / Fluid Overload',
    },
    {
      id: 'med-2',
      name: 'Potassium Chloride (Klor-Con)',
      dose: '20 mEq',
      route: 'Oral',
      frequency: 'Daily with food',
      action: 'New',
      indication: 'Hypokalemia Prophylaxis',
    },
  ]);

  const [disciplines, setDisciplines] = useState<DisciplineRow[]>([
    {
      id: 'disc-1',
      discipline: 'SN',
      frequency: '2w4, 1w5',
      duration: '9 weeks',
      goals: 'Wound care to left lower extremity ulcer; medication reconciliation; diabetic education.',
    },
    {
      id: 'disc-2',
      discipline: 'PT',
      frequency: '2w6',
      duration: '6 weeks',
      goals: 'Gait training with rolling walker, transfer training, lower extremity strengthening.',
    },
  ]);

  const [supplies, setSupplies] = useState<SupplyRow[]>([
    {
      id: 'sup-1',
      item: 'Hydrocolloid Wound Dressing 4x4',
      quantity: '10',
      frequency: 'Monthly',
      justification: 'Exudate management for stage 2 sacral ulcer.',
    },
    {
      id: 'sup-2',
      item: 'Normal Saline 0.9% 500ml irrigation bottle',
      quantity: '4',
      frequency: 'Monthly',
      justification: 'Wound bed cleansing prior to dressing changes.',
    },
  ]);

  // Autocomplete dropdowns & Modals
  const [showSearchAttending, setShowSearchAttending] = useState(false);
  const [showSearchSendTo, setShowSearchSendTo] = useState(false);
  const [showSearchCopyTo, setShowSearchCopyTo] = useState(false);

  // Quick physician modal state
  const [showNewPhysicianModal, setShowNewPhysicianModal] = useState(false);
  const [physicianTargetField, setPhysicianTargetField] = useState<'attending' | 'sendTo' | 'copyTo'>('attending');
  const [newPhysicianName, setNewPhysicianName] = useState('');
  const [newPhysicianNpi, setNewPhysicianNpi] = useState('');
  const [newPhysicianPhone, setNewPhysicianPhone] = useState('');
  const [newPhysicianFax, setNewPhysicianFax] = useState('');

  // Alerts & Toast
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedPatient = useMemo<Patient | undefined>(() => {
    return homeHealthPatients.find((p) => p.id === patientId);
  }, [homeHealthPatients, patientId]);

  const handleSelectPatient = (id: string) => {
    setPatientId(id);
    const pat = homeHealthPatients.find((p) => p.id === id);
    if (pat) {
      if (pat.attendingPhysician) {
        setAttendingPhysician(pat.attendingPhysician);
        setSendToPhysician(pat.attendingPhysician);
      }
      const ep = homeHealthEpisodes.find((e) => e.patientId === id);
      if (ep) {
        setEpisodeAssociated(`${ep.episodeStartDate} to ${ep.episodeEndDate}`);
      } else {
        setEpisodeAssociated('11/01/2026 to 12/30/2026 (Cert Episode)');
      }
    }
  };

  const handleOpenNewPhysician = (target: 'attending' | 'sendTo' | 'copyTo') => {
    setPhysicianTargetField(target);
    setNewPhysicianName('');
    setNewPhysicianNpi('');
    setNewPhysicianPhone('');
    setNewPhysicianFax('');
    setShowNewPhysicianModal(true);
  };

  const handleSaveQuickPhysician = () => {
    if (!newPhysicianName.trim()) return;
    const nameFormatted = newPhysicianName.startsWith('Dr.') ? newPhysicianName : `Dr. ${newPhysicianName}, MD`;
    if (physicianTargetField === 'attending') setAttendingPhysician(nameFormatted);
    else if (physicianTargetField === 'sendTo') setSendToPhysician(nameFormatted);
    else if (physicianTargetField === 'copyTo') setCopyToPhysician(nameFormatted);
    setShowNewPhysicianModal(false);
  };

  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: '',
        dose: '',
        route: 'Oral',
        frequency: 'Daily',
        action: 'New',
        indication: '',
      },
    ]);
  };

  const handleAddDiscipline = () => {
    setDisciplines((prev) => [
      ...prev,
      {
        id: `disc-${Date.now()}`,
        discipline: 'SN',
        frequency: '1w4',
        duration: '4 weeks',
        goals: '',
      },
    ]);
  };

  const handleAddSupply = () => {
    setSupplies((prev) => [
      ...prev,
      {
        id: `sup-${Date.now()}`,
        item: '',
        quantity: '1',
        frequency: 'Monthly',
        justification: '',
      },
    ]);
  };

  const isValid = Boolean(
    patientId && summaryTitle.trim() && clinicianSignature.trim()
  );

  const handleSubmit = (action: 'draft' | 'create') => {
    if (action === 'create' && !isValid) {
      setShowErrors(true);
      return;
    }

    const patName = selectedPatient
      ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
      : 'Patient';

    let orderDetailsText = orderNarrative;
    if (orderType === 'Medication Orders') {
      orderDetailsText = medications
        .map(
          (m) =>
            `[${m.action.toUpperCase()}] ${m.name} ${m.dose} ${m.route} ${m.frequency} (Indication: ${m.indication})`
        )
        .join('\n');
    } else if (orderType === 'Discipline Frequency') {
      orderDetailsText = disciplines
        .map((d) => `[${d.discipline}] Frequency: ${d.frequency} for ${d.duration}. Goals: ${d.goals}`)
        .join('\n');
    } else if (orderType === 'Supply Manager') {
      orderDetailsText = supplies
        .map((s) => `[SUPPLY] ${s.item} - Qty: ${s.quantity} (${s.frequency}). Justification: ${s.justification}`)
        .join('\n');
    }

    const newOrder: Omit<HomeHealthOrder, 'id' | 'createdAt'> = {
      patientId,
      patientName: patName,
      episodeAssociated: episodeAssociated || '11/01/2026 to 12/30/2026',
      attendingPhysician: attendingPhysician || 'Dr. Anita Gupta, MD',
      sendTo: sendToPhysician || attendingPhysician || 'Dr. Anita Gupta, MD',
      copyTo: copyToPhysician || undefined,
      date,
      time,
      effectiveDate,
      orderIsForNextEpisode,
      summaryTitle: summaryTitle.trim(),
      orderType,
      orderContent: orderDetailsText,
      orderReadBackAndVerified,
      clinicianSignature: clinicianSignature.trim(),
      signatureDate,
      signatureTime,
      status: action === 'create' ? 'Created' : 'Draft',
    };

    addHomeHealthOrder(newOrder);
    setIsSuccess(true);

    setTimeout(() => {
      onOrderCreated?.();
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
                New Order
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                CMS-485 Plan of Care Verbal & Discipline Order
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
          <span>Order "{summaryTitle}" created and transmitted for physician signature!</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select a patient, provide an order title, and apply clinician signature.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Information Rail */}
        <aside className="hidden w-80 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-5 lg:flex overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Order Overview Card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <FileText size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Physician Order</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Issue verbal and supplemental physician orders to update the Plan of Care (CMS-485), change medication regimens, modify visit frequency, or authorize supplies.
              </p>
              <div className="mt-3.5 space-y-2 border-t border-pearl-200/80 pt-3 dark:border-charcoal-700/80 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Order Class:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{orderType}</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Branch:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{organization.name}</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Physician Signature:</span>
                  <strong className="text-rose-600">Required within 30 days</strong>
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
                    <span>Attending:</span>
                    <span className="truncate max-w-[150px] font-bold text-slate-800 dark:text-slate-100">
                      {attendingPhysician}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pearl-300 p-5 text-center text-xs text-slate-400 dark:border-charcoal-700">
                <UserCheck size={28} className="mx-auto mb-2 text-slate-300 dark:text-charcoal-600" />
                Select a patient in the main form to display active diagnosis and episode schedule.
              </div>
            )}
          </div>

          <div className="rounded-xl bg-pearl-100 p-3 text-[11px] text-slate-500 dark:bg-charcoal-800/80 dark:text-slate-400">
            Axxess Order Engine • CMS-485 Plan of Care Compliant
          </div>
        </aside>

        {/* Right Form Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* SECTION 1: Patient & Physician Details */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1</span>
              Patient & Physician Identification
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  {homeHealthPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (MRN: #{p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Episode Associated
                </label>
                <select
                  value={episodeAssociated}
                  onChange={(e) => setEpisodeAssociated(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="11/01/2026 to 12/30/2026">11/01/2026 to 12/30/2026 (Active Cert Period)</option>
                  <option value="12/31/2026 to 02/28/2027">12/31/2026 to 02/28/2027 (Next Recert Episode)</option>
                </select>
              </div>

              {/* Attending Physician */}
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
                      onChange={(e) => {
                        setAttendingPhysician(e.target.value);
                        setShowSearchAttending(true);
                      }}
                      onFocus={() => setShowSearchAttending(true)}
                      placeholder="Search or enter physician"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />

                    {showSearchAttending && (
                      <div className="absolute left-0 right-0 top-11 z-30 max-h-40 overflow-y-auto rounded-xl border border-pearl-200 bg-white p-1 shadow-lg dark:border-charcoal-700 dark:bg-charcoal-850">
                        {DEFAULT_PHYSICIANS.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setAttendingPhysician(doc.name);
                              setShowSearchAttending(false);
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

                  <button
                    type="button"
                    onClick={() => handleOpenNewPhysician('attending')}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    <span>New Physician</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Send To */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Send To
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={sendToPhysician}
                      onChange={(e) => {
                        setSendToPhysician(e.target.value);
                        setShowSearchSendTo(true);
                      }}
                      onFocus={() => setShowSearchSendTo(true)}
                      placeholder="Search or enter physician"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />

                    {showSearchSendTo && (
                      <div className="absolute left-0 right-0 top-11 z-30 max-h-40 overflow-y-auto rounded-xl border border-pearl-200 bg-white p-1 shadow-lg dark:border-charcoal-700 dark:bg-charcoal-850">
                        {DEFAULT_PHYSICIANS.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSendToPhysician(doc.name);
                              setShowSearchSendTo(false);
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

                  <button
                    type="button"
                    onClick={() => handleOpenNewPhysician('sendTo')}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    <span>New Physician</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Copy To (optional) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Copy To (optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={copyToPhysician}
                      onChange={(e) => {
                        setCopyToPhysician(e.target.value);
                        setShowSearchCopyTo(true);
                      }}
                      onFocus={() => setShowSearchCopyTo(true)}
                      placeholder="Search or enter physician"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />

                    {showSearchCopyTo && (
                      <div className="absolute left-0 right-0 top-11 z-30 max-h-40 overflow-y-auto rounded-xl border border-pearl-200 bg-white p-1 shadow-lg dark:border-charcoal-700 dark:bg-charcoal-850">
                        {DEFAULT_PHYSICIANS.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setCopyToPhysician(doc.name);
                              setShowSearchCopyTo(false);
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

                  <button
                    type="button"
                    onClick={() => handleOpenNewPhysician('copyTo')}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    <span>New Physician</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Dates & Times */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Effective Date</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={orderIsForNextEpisode}
                    onChange={(e) => setOrderIsForNextEpisode(e.target.checked)}
                    className="accent-rose-600"
                  />
                  <span>Order Is for Next Episode</span>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION 2: Summary/Title, Order Types & Content */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">2</span>
              Order Classification & Clinical Content
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Summary / Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={summaryTitle}
                onChange={(e) => setSummaryTitle(e.target.value)}
                placeholder="e.g. Change in Lasix dosage / Add Physical Therapy evaluation"
                className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Order Types Selector Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Order Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'Medication Orders',
                    'Plan of Care Orders',
                    'Discipline Frequency',
                    'Supply Manager',
                    'Other',
                  ] as OrderType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                      orderType === type
                        ? 'bg-rose-600 text-white'
                        : 'border border-pearl-200 bg-white text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Read Back and Verified */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={orderReadBackAndVerified}
                onChange={(e) => setOrderReadBackAndVerified(e.target.checked)}
                className="accent-rose-600"
              />
              <span>Order read back and verified.</span>
            </label>

            {/* Dynamic Clinical Content Area */}
            <div className="rounded-xl border border-pearl-200 bg-pearl-50/60 p-4 dark:border-charcoal-700 dark:bg-charcoal-800/50">
              {orderType === 'Medication Orders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                      <Pill size={16} className="text-rose-600" />
                      <span>Medication Order Details</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Medication</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-pearl-200 dark:border-charcoal-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-pearl-100/70 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-charcoal-750 dark:text-slate-300 border-b border-pearl-200 dark:border-charcoal-700">
                        <tr>
                          <th className="px-3 py-2">Action</th>
                          <th className="px-3 py-2">Medication Name</th>
                          <th className="px-3 py-2">Dose</th>
                          <th className="px-3 py-2">Route</th>
                          <th className="px-3 py-2">Frequency</th>
                          <th className="px-3 py-2">Indication</th>
                          <th className="px-2 py-2 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-700 bg-white dark:bg-charcoal-850">
                        {medications.map((med, idx) => (
                          <tr key={med.id}>
                            <td className="p-2">
                              <select
                                value={med.action}
                                onChange={(e) => {
                                  const newAction = e.target.value as MedicationRow['action'];
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, action: newAction } : m))
                                  );
                                }}
                                className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              >
                                <option value="New">New</option>
                                <option value="Change">Change</option>
                                <option value="Discontinue">Discontinue</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={med.name}
                                placeholder="Medication name"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, name: val } : m))
                                  );
                                }}
                                className="h-8 w-full rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={med.dose}
                                placeholder="Dose"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, dose: val } : m))
                                  );
                                }}
                                className="h-8 w-20 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={med.route}
                                placeholder="Route"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, route: val } : m))
                                  );
                                }}
                                className="h-8 w-20 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={med.frequency}
                                placeholder="Frequency"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, frequency: val } : m))
                                  );
                                }}
                                className="h-8 w-28 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={med.indication}
                                placeholder="Diagnosis / Reason"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMedications((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, indication: val } : m))
                                  );
                                }}
                                className="h-8 w-full rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setMedications((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-slate-400 hover:text-rose-600 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {orderType === 'Plan of Care Orders' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <FileText size={16} className="text-rose-600" />
                    <span>Plan of Care Order Narrative (CMS-485 Modification)</span>
                  </div>
                  <textarea
                    rows={4}
                    value={orderNarrative}
                    onChange={(e) => setOrderNarrative(e.target.value)}
                    placeholder="Enter physician verbal orders modifying active plan of care, treatment goals, nursing protocols, or vitals parameters..."
                    className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}

              {orderType === 'Discipline Frequency' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                      <Activity size={16} className="text-rose-600" />
                      <span>Discipline & Visit Frequencies</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDiscipline}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Discipline</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {disciplines.map((disc, idx) => (
                      <div
                        key={disc.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-pearl-200 bg-white p-2.5 dark:border-charcoal-700 dark:bg-charcoal-850"
                      >
                        <select
                          value={disc.discipline}
                          onChange={(e) => {
                            const val = e.target.value as DisciplineRow['discipline'];
                            setDisciplines((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, discipline: val } : d))
                            );
                          }}
                          className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-bold text-slate-800 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        >
                          <option value="SN">Skilled Nursing (SN)</option>
                          <option value="PT">Physical Therapy (PT)</option>
                          <option value="OT">Occupational Therapy (OT)</option>
                          <option value="ST">Speech Therapy (ST)</option>
                          <option value="MSW">Medical Social Worker (MSW)</option>
                          <option value="HHA">Home Health Aide (HHA)</option>
                        </select>

                        <input
                          type="text"
                          value={disc.frequency}
                          placeholder="Frequency (e.g. 2w4, 1w2)"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDisciplines((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, frequency: val } : d))
                            );
                          }}
                          className="h-8 w-32 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />

                        <input
                          type="text"
                          value={disc.duration}
                          placeholder="Duration (e.g. 6 weeks)"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDisciplines((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, duration: val } : d))
                            );
                          }}
                          className="h-8 w-28 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />

                        <input
                          type="text"
                          value={disc.goals}
                          placeholder="Specific Discipline Goals..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setDisciplines((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, goals: val } : d))
                            );
                          }}
                          className="h-8 flex-1 min-w-[200px] rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />

                        <button
                          type="button"
                          onClick={() => setDisciplines((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orderType === 'Supply Manager' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                      <Package size={16} className="text-rose-600" />
                      <span>Medical Supply Orders</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSupply}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Supply</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {supplies.map((sup, idx) => (
                      <div
                        key={sup.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-pearl-200 bg-white p-2.5 dark:border-charcoal-700 dark:bg-charcoal-850"
                      >
                        <input
                          type="text"
                          value={sup.item}
                          placeholder="Supply Item Description..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupplies((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, item: val } : s))
                            );
                          }}
                          className="h-8 flex-1 min-w-[200px] rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />
                        <input
                          type="text"
                          value={sup.quantity}
                          placeholder="Qty"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupplies((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, quantity: val } : s))
                            );
                          }}
                          className="h-8 w-16 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />
                        <input
                          type="text"
                          value={sup.frequency}
                          placeholder="Frequency"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupplies((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, frequency: val } : s))
                            );
                          }}
                          className="h-8 w-28 rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />
                        <input
                          type="text"
                          value={sup.justification}
                          placeholder="Medical Justification..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupplies((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, justification: val } : s))
                            );
                          }}
                          className="h-8 flex-1 min-w-[180px] rounded-lg border border-pearl-200 bg-white px-2 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => setSupplies((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orderType === 'Other' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <Layers size={16} className="text-rose-600" />
                    <span>Other Clinical Order Details</span>
                  </div>
                  <textarea
                    rows={4}
                    value={orderNarrative}
                    onChange={(e) => setOrderNarrative(e.target.value)}
                    placeholder="Enter other supplemental orders, durable medical equipment (DME), laboratory testing orders, or diet changes..."
                    className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: Electronic Signature & Action Buttons */}
          <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">3</span>
              Clinician Electronic Signature
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
                onClick={() => handleSubmit('create')}
                className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                Create Order
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Quick Add Physician Modal */}
      {showNewPhysicianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-charcoal-850">
            <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-2 text-rose-600">
                <Stethoscope size={18} />
                <h3 className="font-black text-sm">Quick Add Physician</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPhysicianModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newPhysicianName}
                  onChange={(e) => setNewPhysicianName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance, MD"
                  className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NPI Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={newPhysicianNpi}
                  onChange={(e) => setNewPhysicianNpi(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit NPI"
                  className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhysicianPhone}
                    onChange={(e) => setNewPhysicianPhone(e.target.value)}
                    placeholder="(978) 555-0100"
                    className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fax Number
                  </label>
                  <input
                    type="text"
                    value={newPhysicianFax}
                    onChange={(e) => setNewPhysicianFax(e.target.value)}
                    placeholder="(978) 555-0101"
                    className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewPhysicianModal(false)}
                className="rounded-xl border border-pearl-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-pearl-50 dark:border-charcoal-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickPhysician}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Assign Physician
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
