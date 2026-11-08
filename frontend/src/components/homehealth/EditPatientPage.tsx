import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  UserRound,
  CreditCard,
  Stethoscope,
  Activity,
  Pill,
  UsersRound,
  ShieldAlert,
  FileHeart,
  ClipboardList,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { INITIAL_PATIENT_ROWS, type PatientListItem } from './PatientListView';

interface EditPatientPageProps {
  patientId: string;
  onBack: () => void;
  onSave?: (updatedData: any) => void;
}

type SectionId =
  | 'demographics'
  | 'payers'
  | 'physicians'
  | 'clinical'
  | 'pharmacy'
  | 'contacts'
  | 'emergency'
  | 'directives'
  | 'referral';

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'demographics', label: 'Demographics', icon: UserRound },
  { id: 'payers', label: 'Payers', icon: CreditCard },
  { id: 'physicians', label: 'Physicians', icon: Stethoscope },
  { id: 'clinical', label: 'Clinical/Diagnoses', icon: Activity },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'contacts', label: 'Contacts', icon: UsersRound },
  { id: 'emergency', label: 'Emergency Preparedness', icon: ShieldAlert },
  { id: 'directives', label: 'Advance Directives', icon: FileHeart },
  { id: 'referral', label: 'Referral Information', icon: ClipboardList },
];

export const EditPatientPage: React.FC<EditPatientPageProps> = ({
  patientId,
  onBack,
  onSave,
}) => {
  const { organization, patients } = useHealthcare();

  // Find target patient
  const targetPatient =
    INITIAL_PATIENT_ROWS.find((p) => p.id === patientId || p.mrn === patientId) ||
    patients.find((p) => p.id === patientId || p.mrn === patientId);

  const [activeSection, setActiveSection] = useState<SectionId>('demographics');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states prefilled based on screenshot and target patient
  const [firstName, setFirstName] = useState(
    targetPatient ? targetPatient.firstName : 'Heather'
  );
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState(
    targetPatient ? targetPatient.lastName : 'Abuissa'
  );
  const [sex, setSex] = useState<'Female' | 'Male' | 'Other'>(
    targetPatient && 'sex' in targetPatient ? (targetPatient.sex as any) : 'Female'
  );
  const [dob, setDob] = useState(
    targetPatient && 'dateOfBirth' in targetPatient ? targetPatient.dateOfBirth : '04/15/1964'
  );
  const [ssn, setSsn] = useState('');
  const [ssnUnknown, setSsnUnknown] = useState(true);
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [mobilePhone, setMobilePhone] = useState(
    targetPatient && 'phone' in targetPatient ? targetPatient.phone : '(351) 201-4985'
  );
  const [alternatePhone, setAlternatePhone] = useState('');

  // Primary Address
  const [addressLine1, setAddressLine1] = useState(
    targetPatient && 'addressLine1' in targetPatient ? targetPatient.addressLine1 : '77 Sohier RD'
  );
  const [addressLine2, setAddressLine2] = useState(
    targetPatient && 'addressLine2' in targetPatient && targetPatient.addressLine2 !== 'Not Available'
      ? targetPatient.addressLine2
      : 'Apt 2B'
  );
  const [zipCode, setZipCode] = useState(
    targetPatient && 'zipCode' in targetPatient ? targetPatient.zipCode : '01915'
  );
  const [zipPlus4, setZipPlus4] = useState('');
  const [county, setCounty] = useState(
    targetPatient && 'county' in targetPatient ? targetPatient.county : 'Essex County'
  );
  const [city, setCity] = useState(
    targetPatient && 'city' in targetPatient ? targetPatient.city : 'BEVERLY'
  );
  const [stateVal, setStateVal] = useState('Massachusetts');
  const [sameMailingAddress, setSameMailingAddress] = useState(true);
  const [mailingAddress1, setMailingAddress1] = useState('77 Sohier RD');

  // Payers Section
  const [primaryInsurance, setPrimaryInsurance] = useState(
    targetPatient && 'insurance' in targetPatient ? targetPatient.insurance : 'COMMONWEALTH CARE ALLIANCE'
  );
  const [policyNumber, setPolicyNumber] = useState(
    targetPatient && 'policyNumber' in targetPatient ? targetPatient.policyNumber : '36563446600'
  );

  // Physicians Section
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Robert O’Connor MD');

  // Pharmacy Section
  const [pharmacy, setPharmacy] = useState('Walgreens Pharmacy #1032');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAndExit = () => {
    showToast(`Patient ${lastName}, ${firstName} saved successfully.`);
    if (onSave) {
      onSave({
        id: patientId,
        firstName,
        lastName,
        sex,
        dob,
        mobilePhone,
        addressLine1,
        city,
        state: stateVal,
        zipCode,
        insurance: primaryInsurance,
        policyNumber,
      });
    }
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  const handleSaveAndContinue = () => {
    const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
    if (currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
      showToast('Changes saved. Moved to next section.');
    } else {
      handleSaveAndExit();
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
            title="Return to Patient List"
            aria-label="Return to Patient List"
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
                View
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lists
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Edit Patient | {lastName} {firstName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                MRN: {targetPatient?.mrn || '1061'} • {organization.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('PDGM clinical groupings computed for 2026.')}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:border-pearl-400 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            PDGM Modeling Tool
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar Checklist */}
        <aside className="w-56 shrink-0 border-r border-pearl-200 bg-white/70 p-4 overflow-y-auto dark:border-charcoal-700 dark:bg-charcoal-850/70">
          <div className="space-y-1">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 shadow-2xs ring-1 ring-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'text-slate-600 hover:bg-pearl-100/70 dark:text-slate-300 dark:hover:bg-charcoal-750'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {/* Subtle completed tick for pre-filled patient */}
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px]">
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Form Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Demographics Tab Content */}
            {activeSection === 'demographics' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-6">
                <div className="border-b border-pearl-200 pb-3 dark:border-charcoal-700">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Patient Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left Column: Personal Information */}
                  <div className="space-y-4">
                    {/* First Name & MI & Last Name */}
                    <div className="grid grid-cols-5 gap-2.5">
                      <div className="col-span-2">
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 font-mono text-[10px]">(M0040)</span> First Name: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          MI:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter MI"
                          value={middleInitial}
                          onChange={(e) => setMiddleInitial(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-2 text-center text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 font-mono text-[10px]">(M0040)</span> Last Name: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Sex */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span className="text-emerald-600 font-mono text-[10px]">(A0810)</span> Sex: <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value as any)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Date of Birth & SSN */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 font-mono text-[10px]">(M0066)</span> Date of Birth: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-600 font-mono text-[10px]">(M0064)</span> SSN: <span className="text-rose-600">*</span>
                          </label>
                          <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ssnUnknown}
                              onChange={(e) => setSsnUnknown(e.target.checked)}
                              className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500"
                            />
                            <span>Unknown</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder={ssnUnknown ? 'Unknown' : 'XXX-XX-XXXX'}
                          disabled={ssnUnknown}
                          value={ssn}
                          onChange={(e) => setSsn(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs disabled:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100 dark:disabled:bg-charcoal-800"
                        />
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Marital Status:
                      </label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    {/* Mobile Phone */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Mobile Phone: <span className="text-rose-600">*</span>
                      </label>
                      <p className="mb-1 text-[10px] text-slate-400 italic">
                        For emergency preparedness, the patient will be contacted at this number.
                      </p>
                      <input
                        type="text"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Alternate Phone:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Number"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Right Column: Address Information */}
                  <div className="space-y-4">
                    <div className="border-b border-pearl-150 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider dark:border-charcoal-700">
                      Primary Address
                    </div>

                    {/* Primary Address Line 1 */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Primary Address Line 1: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>

                    {/* Primary Address Line 2 */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Primary Address Line 2:
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                      />
                    </div>

                    {/* ZIP & ZIP+4 & County */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 font-mono text-[10px]">(M0060)</span> ZIP: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          ZIP+4:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter ZIP"
                          value={zipPlus4}
                          onChange={(e) => setZipPlus4(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          County: <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={county}
                          onChange={(e) => setCounty(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                        >
                          <option value="Essex County">Essex County</option>
                          <option value="Norfolk County">Norfolk County</option>
                          <option value="Plymouth County">Plymouth County</option>
                          <option value="Middlesex County">Middlesex County</option>
                        </select>
                      </div>
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          City: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 font-mono text-[10px]">(M0050)</span> State: <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={stateVal}
                          onChange={(e) => setStateVal(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                        >
                          <option value="Massachusetts">Massachusetts</option>
                          <option value="New Hampshire">New Hampshire</option>
                          <option value="Rhode Island">Rhode Island</option>
                          <option value="Connecticut">Connecticut</option>
                        </select>
                      </div>
                    </div>

                    {/* Mailing Address Toggle */}
                    <div className="border-t border-pearl-150 pt-3 dark:border-charcoal-700">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameMailingAddress}
                          onChange={(e) => setSameMailingAddress(e.target.checked)}
                          className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span>Same as Primary Address</span>
                      </label>
                    </div>

                    {!sameMailingAddress && (
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Mailing Address Line 1: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={mailingAddress1}
                          onChange={(e) => setMailingAddress1(e.target.value)}
                          className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payers Tab */}
            {activeSection === 'payers' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-pearl-200 pb-3 dark:border-charcoal-700">
                  Insurance & Payers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Primary Insurance / Payer:
                    </label>
                    <input
                      type="text"
                      value={primaryInsurance}
                      onChange={(e) => setPrimaryInsurance(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Policy / Subscriber ID:
                    </label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Physicians Tab */}
            {activeSection === 'physicians' && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-pearl-200 pb-3 dark:border-charcoal-700">
                  Attending & Referring Physicians
                </h2>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Attending Physician:
                  </label>
                  <input
                    type="text"
                    value={attendingPhysician}
                    onChange={(e) => setAttendingPhysician(e.target.value)}
                    className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Other Sections Placeholder Card */}
            {!['demographics', 'payers', 'physicians'].includes(activeSection) && (
              <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-pearl-200 pb-3 dark:border-charcoal-700 capitalize">
                  {activeSection.replace('-', ' ')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Patient clinical profiles, emergency preparedness, and contact preferences are synchronized with the latest episode Plan of Care.
                </p>
                <div className="rounded-xl bg-pearl-50 p-4 text-xs text-slate-700 dark:bg-charcoal-700/60 dark:text-slate-200">
                  <span className="font-bold">Verified on File:</span> Active records for patient {lastName}, {firstName} (MRN: {targetPatient?.mrn || '1061'}).
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-pearl-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
              <button
                type="button"
                onClick={() => showToast('PDGM Modeling Tool active.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-700 px-4 text-xs font-bold text-white shadow-sm hover:bg-slate-600"
              >
                PDGM Modeling Tool
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-sky-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-sky-600 active:scale-95"
                >
                  Save and Continue
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-sky-800 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
                >
                  Save and Exit
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-4 text-xs font-bold text-slate-700 shadow-2xs hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
