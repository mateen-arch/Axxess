import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileHeart,
  HeartPulse,
  MapPin,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export type AdmissionValue = string | boolean | string[];
export type PatientAdmissionFormData = Record<string, AdmissionValue>;

export const createInitialPatientAdmissionForm = (mrn = '1204'): PatientAdmissionFormData => ({
  firstName: '', middleInitial: '', lastName: '', sex: '', dob: '', ssn: '', ssnUnknown: false, maritalStatus: '',
  mobile: '', alternatePhone: '', email: '', clinicalManager: '', caseManager: '', assignedClinician: '', branch: 'Standards Home Care',
  mrn, defaultServiceLocation: '', primaryAddress1: '', primaryAddress2: '', primaryZip: '', primaryZip4: '', primaryCounty: '', primaryCity: '', primaryState: '',
  sameMailingAddress: true, mailingAddress1: '', mailingAddress2: '', mailingZip: '', mailingZip4: '', mailingCounty: '', mailingCity: '', mailingState: '',
  visitAddressCount: '0', raceOrigins: [], races: [], preferredLanguage: '', additionalLanguage1: '', additionalLanguage2: '', additionalLanguage3: '', auxiliaryAids: '', interpreterNeed: '',
  paymentSources: [], otherPaymentSource: '', inpatientFacilities: [], otherInpatientFacility: '', episodeTiming: '', startOfCareDate: '', episodeStartDate: '', episodeActions: [], tags: '',
  mbi: '', mbiNA: false, hicNumber: '', hicNA: false, medicaidNumber: '', medicaidNA: false, alternateMedicaidNumber: '', primaryInsurance: '', secondaryInsurance: '', tertiaryInsurance: '', payerComments: '',
  occurrenceCode: '', occurrenceDate: '', occurrenceSpanCode: '', occurrenceSpanStart: '', occurrenceSpanEnd: '', claimCode: '', unableToWorkFrom: '', unableToWorkTo: '', hospitalizationStart: '', hospitalizationEnd: '', emergencyTreatment: false,
  physicianCity: '', physicianState: '', physicianSearch: '', attendingPhysician: '', physicianAgreement: false, newPhysicianName: '', otherPhysicians: [],
  servicesRequired: [], height: '', heightUnit: 'in', weight: '', weightUnit: 'lb', dmeNeeded: [], otherDme: '', primaryDiagnosisName: '', primaryDiagnosisCode: '', otherDiagnosisCount: '0', clinicalComments: '', clinicalTemplates: [],
  pharmacy: '', newPharmacy: '', additionalPharmacies: [], pharmacyComments: '',
  primaryContactFirstName: '', primaryContactLastName: '', primaryContactMobile: '', primaryContactAlternate: '', primaryContactRelationship: '', primaryContactEmail: '', primaryContactRepresentative: [], primaryContactSameAddress: true,
  primaryContactAddress1: '', primaryContactAddress2: '', primaryContactCity: '', primaryContactState: '', primaryContactZip: '', primaryContactZip4: '', primaryContactCounty: '',
  additionalContactCount: '0', representativeCoordination: '', doNotContactCAHPS: false, alternateCAHPSSameContact: true, alternateCAHPSFirstName: '', alternateCAHPSLastName: '', alternateCAHPSRelationship: '', alternateCAHPSMobile: '', alternateCAHPSAlternate: '', alternateCAHPSEmail: '',
  alternateCAHPSAddress1: '', alternateCAHPSAddress2: '', alternateCAHPSCity: '', alternateCAHPSState: '', alternateCAHPSZip: '', alternateCAHPSZip4: '', alternateCAHPSCounty: '', contactsComments: '', contactsTemplates: [],
  triageLevel: '', needsEmergencyAssistance: false, officialsContacted: false, medicalNeedsEquipment: false, emergencyPreparednessAdditional: '', evacuationZone: '', evacuationSameAsContact: true,
  evacuationAddress1: '', evacuationAddress2: '', evacuationCity: '', evacuationState: '', evacuationZip: '', evacuationCounty: '', evacuationMobile: '', evacuationAlternate: '', setAsVisitLocation: false, emergencyComments: '', emergencyTemplates: [], evacuationTemplates: [],
  advanceCarePlan: '', advanceCarePlanComments: '', advanceCarePlanTemplates: [],
  referralCity: '', referralState: '', referralPhysicianSearch: '', referringPhysician: '', certifyingPhysicianType: '', certifyingPhysician: '', certifyingNPI: '', faceToFaceStatus: '', faceToFaceDate: '', admissionSource: '', referralSourceName: '', referralDate: '', inquiryDate: '', communityLiaison: '', internalReferralSource: '', facilityReferralSource: '', inpatientAdmissionCode: '',
});

type SectionId = 'demographics' | 'payers' | 'physicians' | 'clinical' | 'pharmacy' | 'contacts' | 'emergency' | 'directives' | 'referral';
const sections: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'demographics', label: 'Demographics', icon: UserRound },
  { id: 'payers', label: 'Payers', icon: CreditCard },
  { id: 'physicians', label: 'Physicians', icon: Stethoscope },
  { id: 'clinical', label: 'Clinical / Diagnoses', icon: Activity },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'contacts', label: 'Contacts', icon: UsersRound },
  { id: 'emergency', label: 'Emergency Preparedness', icon: ShieldAlert },
  { id: 'directives', label: 'Advance Directives', icon: FileHeart },
  { id: 'referral', label: 'Referral Information', icon: ClipboardList },
];

const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const paymentOptions = ['None; no charge for current services', 'Medicare (traditional fee-for-service)', 'Medicare (HMO/Managed Care)', 'Medicaid (traditional fee-for-service)', 'Medicaid (HMO/Managed Care)', "Workers' Compensation", 'Title Programs (e.g., Title III, V, or XX)', 'Other government (e.g., TriCare, VA)', 'Private insurance', 'Private HMO / managed care', 'Self-pay', 'Unknown', 'Other (Specify)'];
const raceOptions = ['White', 'Black or African American', 'American Indian or Alaska Native', 'Asian Indian', 'Chinese', 'Filipino', 'Japanese', 'Korean', 'Vietnamese', 'Other Asian', 'Native Hawaiian', 'Guamanian or Chamorro', 'Samoan', 'Other Pacific Islander', 'Patient unable to respond', 'Patient declines to respond', 'None of the above'];
const originOptions = ['No, not of Hispanic, Latino/a, or Spanish origin', 'Yes, Mexican, Mexican American, Chicano/a', 'Yes, Puerto Rican', 'Yes, Cuban', 'Yes, another Hispanic, Latino, or Spanish origin', 'Patient unable to respond', 'Patient declines to respond'];
const dmeOptions = ['Bedside Commode', 'Cane', 'Elevated Toilet Seat', 'Grab Bars', 'Hospital Bed', 'Nebulizer', 'Oxygen', 'Tub Shower Bench', 'Walker', 'Wheelchair', 'Other'];
const inpatientOptions = ['Long-term nursing facility (NF)', 'Skilled nursing facility (SNF/TCU)', 'Short-stay acute hospital (IPPS)', 'Long-term care hospital (LTCH)', 'Inpatient rehabilitation hospital or unit (IRF)', 'Psychiatric hospital or unit', 'Other', 'N/A — no inpatient discharge'];
const paymentOptionsShort = paymentOptions;
const templateOptions = [
  'Communication Note For PA Approvals', 'HHA Frequency', 'Private Duty Nursing Frequency', 'SHC - Discharge (goals met)', 'SHC - Recertification', 'SHC - ROC', 'SHC - Start of Care', 'SHC - Transfer (not discharged)',
  'TEACHING DISEASE (Celiac Disease)', 'TEACHING GUIDE (Alzheimer’s Disease)', 'TEACHING GUIDE (Emphysema)', 'TEACHING GUIDE COVID-19 (Caring for Someone at Home)', 'TEACHING GUIDE COVID-19 (Create a Household Plan of Action)', 'TEACHING GUIDE COVID-19 (How to Protect Yourself)', 'TEACHING GUIDE COVID-19 (Protecting Others If You are Sick)', 'TEACHING GUIDE COVID-19 (Self-Care When You are Sick)', 'TEACHING GUIDE COVID-19 (When You Live in a Facility)',
  'TEACHING GUIDE (CHF)', 'TEACHING GUIDE (Gout Arthritis)', 'TEACHING GUIDE (Bronchitis)', 'TEACHING GUIDE (Suprapubic Catheter Care)', 'TEACHING GUIDE (Acute Renal Failure)', 'TEACHING GUIDE (AIDS)', 'TEACHING GUIDE (AIDS) Continued', 'TEACHING GUIDE (Anemia)', 'TEACHING GUIDE (Angina Pectoris)', 'TEACHING GUIDE (Asthma)', 'TEACHING GUIDE (Bladder Control Problems)', 'TEACHING GUIDE (Bowel Obstruction)', 'TEACHING GUIDE (Breast Cancer)', 'TEACHING GUIDE (Burns)', 'TEACHING GUIDE (Cardiac Arrhythmias)', 'TEACHING GUIDE (Cardiomyopathy)', 'TEACHING GUIDE (Cellulitis)', 'TEACHING GUIDE (Cholesterol-Lowering Diets)', 'TEACHING GUIDE (Chronic Renal Failure)', 'TEACHING GUIDE (Colostomy Care)', 'TEACHING GUIDE (Congestive Heart Failure)', 'TEACHING GUIDE (Coronary Artery Disease)', 'TEACHING GUIDE (Cushing’s Syndrome)', 'TEACHING GUIDE (Cystitis)', 'TEACHING GUIDE (Pressure Ulcer)', 'TEACHING GUIDE (Dementia / Delirium)', 'TEACHING GUIDE (Dermatitis)', 'TEACHING GUIDE (Diabetes Mellitus)', 'TEACHING GUIDE (Diabetes Mellitus) Continued', 'TEACHING GUIDE (Diabetic Diet)', 'TEACHING GUIDE (Disseminated Intravascular Coagulation)', 'TEACHING GUIDE (Diverticular Disease)', 'TEACHING GUIDE (Energy Conservation)', 'TEACHING GUIDE (Foley Catheter Care)', 'TEACHING GUIDE (Fracture)', 'TEACHING GUIDE (Gallbladder Diseases)', 'TEACHING GUIDE (Gastroesophageal Reflux)', 'TEACHING GUIDE (Gastrostomy)', 'TEACHING GUIDE (Hepatitis)', 'TEACHING GUIDE (Herpes Zoster / Shingles)', 'TEACHING GUIDE (Hiatal Hernia)', 'TEACHING GUIDE (Hypertension)', 'TEACHING GUIDE (Hyperthyroidism)', 'TEACHING GUIDE (Hypothyroidism)', 'TEACHING GUIDE (Ileostomy Care)', 'TEACHING GUIDE (Ulcerative Colitis / Crohn’s)', 'TEACHING GUIDE (Insulin)', 'TEACHING GUIDE (Insulin) Continued', 'TEACHING GUIDE (Latex Allergy)', 'TEACHING GUIDE (Leukemia)', 'TEACHING GUIDE (Liver Cirrhosis)', 'TEACHING GUIDE (Lung Cancer)', 'TEACHING GUIDE (Metabolic Syndrome)', 'TEACHING GUIDE (MRSA)', 'TEACHING GUIDE (Myocardial Infarction)', 'TEACHING GUIDE (Osteoarthritis)', 'TEACHING GUIDE (Osteomyelitis)', 'TEACHING GUIDE (Osteoporosis)', 'TEACHING GUIDE (Ovarian Cancer)', 'TEACHING GUIDE (Pancreatitis)', 'TEACHING GUIDE (Parkinson’s Disease)', 'TEACHING GUIDE (Peptic Ulcer)', 'TEACHING GUIDE (Peripheral Vascular Disease)', 'TEACHING GUIDE (Pernicious Anemia)', 'TEACHING GUIDE (Polycythemia Vera)', 'TEACHING GUIDE (Prostate Cancer)', 'TEACHING GUIDE (Psoriasis)', 'TEACHING GUIDE (Pyelonephritis)', 'TEACHING GUIDE (Reduced-Fat Diets)', 'TEACHING GUIDE (Rheumatoid Arthritis)', 'TEACHING GUIDE (Sjogren’s Syndrome)', 'TEACHING GUIDE (Skin Cancer)', 'TEACHING GUIDE (Sodium-Restricted Diets)', 'TEACHING GUIDE (Systemic Lupus Erythematosus)', 'TEACHING GUIDE (Thrombocytopenia)', 'TEACHING GUIDE (Toxic Shock Syndrome)', 'TEACHING GUIDE (Urinary Calculi)', 'TEACHING GUIDE (Urinary Tract Infection)', 'TEACHING GUIDE (Varicose Veins)', 'TEACHING GUIDE (Venous Stasis Ulcer)', 'TEACHING GUIDE (West Nile Virus)', 'TEACHING GUIDE (Sickle Cell Anemia)',
];

const requiredKeys: Record<SectionId, string[]> = {
  demographics: ['firstName', 'lastName', 'sex', 'dob', 'mobile', 'clinicalManager', 'caseManager', 'assignedClinician', 'branch', 'mrn', 'defaultServiceLocation', 'primaryAddress1', 'primaryZip', 'primaryCounty', 'primaryCity', 'primaryState', 'preferredLanguage', 'interpreterNeed', 'startOfCareDate', 'episodeStartDate'],
  payers: ['primaryInsurance'],
  physicians: ['attendingPhysician'],
  clinical: ['primaryDiagnosisName', 'primaryDiagnosisCode'],
  pharmacy: ['pharmacy'],
  contacts: ['primaryContactFirstName', 'primaryContactLastName', 'primaryContactMobile', 'primaryContactRelationship'],
  emergency: ['triageLevel', 'evacuationZone'],
  directives: ['advanceCarePlan'],
  referral: ['referringPhysician', 'faceToFaceStatus', 'admissionSource', 'referralDate', 'inpatientAdmissionCode'],
};

const isPresent = (value: AdmissionValue | undefined) => Array.isArray(value) ? value.length > 0 : typeof value === 'boolean' ? value : Boolean(value?.toString().trim());

function Field({
  label,
  value,
  onChange,
  required,
  invalid,
  errorMessage,
  placeholder,
  type = 'text',
  options,
  hint,
  multiline,
  disabled,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  placeholder?: string;
  type?: string;
  options?: string[];
  hint?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const controlClass = `w-full rounded-xl border bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs outline-none transition-all focus:border-rose-500 focus:bg-white dark:focus:bg-charcoal-850 focus:ring-2 focus:ring-rose-500/20 ${invalid ? 'border-rose-400 dark:border-rose-500 ring-1 ring-rose-400/30' : 'border-pearl-200 dark:border-charcoal-700 hover:border-pearl-300 dark:hover:border-charcoal-600'} ${disabled ? 'cursor-not-allowed bg-pearl-100/60 dark:bg-charcoal-850 text-slate-400 dark:text-slate-500' : ''}`;
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-rose-600 font-extrabold">*</span>}
      </span>
      {hint && <span className="mb-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</span>}
      {options ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={`${controlClass} h-10`}>
          <option value="">Select {label.replace(/\s*\(.+\)$/, '')}</option>
          {options.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={placeholder} rows={4} className={`${controlClass} min-h-24 py-2.5 leading-relaxed`} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={placeholder || `Enter ${label.toLowerCase()}`} className={`${controlClass} h-10`} />
      )}
      {invalid && (
        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <AlertTriangle size={12} className="shrink-0" />
          {errorMessage || 'This field is required.'}
        </span>
      )}
    </label>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  multiple = false,
  columns = 2,
  invalid,
  required,
  exclusiveOptions = [],
}: {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3;
  invalid?: boolean;
  required?: boolean;
  exclusiveOptions?: string[];
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-rose-600 font-extrabold">*</span>}
      </legend>
      <div className={`grid gap-2 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <label
              key={option}
              className={`flex min-h-10 cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 text-xs leading-relaxed transition-all ${
                active
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 font-medium shadow-2xs'
                  : 'border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 hover:border-rose-200 hover:bg-rose-50/30 dark:hover:border-rose-900/40'
              }`}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={label}
                checked={active}
                onChange={() => {
                  if (multiple && exclusiveOptions.includes(option)) onChange(active ? [] : [option]);
                  else if (multiple) onChange(active ? selected.filter((item) => item !== option) : [...selected.filter((item) => !exclusiveOptions.includes(item)), option]);
                  else onChange(active ? '' : option);
                }}
                className="mt-0.5 accent-rose-600 shrink-0"
              />
              <span className="min-w-0 flex-1">{option}</span>
            </label>
          );
        })}
      </div>
      {invalid && (
        <span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <AlertTriangle size={12} className="shrink-0" />
          Choose at least one option.
        </span>
      )}
    </fieldset>
  );
}

function TemplatePicker({ selected, onChange }: { selected: string[]; onChange: (templates: string[]) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const matches = templateOptions.filter((template) => template.toLowerCase().includes(query.toLowerCase()) && !selected.includes(template)).slice(0, 8);
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Templates</label>
      <div className="relative">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-pearl-200 bg-white px-3 shadow-2xs transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 dark:border-charcoal-700 dark:bg-charcoal-800">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
            placeholder="Search clinical and communication templates"
            className="min-w-0 flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button type="button" aria-label="Show templates" onClick={() => setOpen(!open)} className="text-slate-400 hover:text-rose-600 transition">
            <ChevronDown size={15} />
          </button>
        </div>
        {open && (
          <>
            <button type="button" aria-label="Close template list" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-xl border border-pearl-200 bg-white p-1.5 shadow-xl dark:border-charcoal-700 dark:bg-charcoal-850">
              {matches.length ? matches.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => { onChange([...selected, template]); setQuery(''); setOpen(false); }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-charcoal-800 dark:hover:text-rose-300 transition"
                >
                  {template}
                </button>
              )) : (
                <p className="px-3 py-2.5 text-xs text-slate-500">No matching templates</p>
              )}
            </div>
          </>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((template) => (
            <span key={template} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
              <span className="truncate">{template}</span>
              <button type="button" onClick={() => onChange(selected.filter((item) => item !== template))} aria-label={`Remove ${template}`} className="text-rose-500 hover:text-rose-700">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Panel({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pearl-200/80 px-5 py-4 dark:border-charcoal-700/80 sm:px-6">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SectionGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return <div className={`grid grid-cols-1 gap-4 sm:gap-5 ${columns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'}`}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
      <span>{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-rose-200/80 to-transparent dark:from-rose-900/40 dark:to-transparent" />
    </div>
  );
}

export const AdmitPatientPage: React.FC<{
  values: PatientAdmissionFormData;
  existingMrns: string[];
  onChange: (values: PatientAdmissionFormData) => void;
  onCancel: () => void;
  onSaveAndExit: () => void;
  onSaveDraft: () => void;
  onAdmit: () => void;
  draftSaved: boolean;
  lastMrnUsed: number;
}> = ({ values, existingMrns, onChange, onCancel, onSaveAndExit, onSaveDraft, onAdmit, draftSaved, lastMrnUsed }) => {
  const { organization, clinicians } = useHealthcare();
  const [activeSection, setActiveSection] = useState<SectionId>('demographics');
  const [showErrors, setShowErrors] = useState(false);
  const [showCMSGuidance, setShowCMSGuidance] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [showNewPharmacy, setShowNewPharmacy] = useState(false);
  const [showPDGM, setShowPDGM] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  const stringValue = (key: string) => typeof values[key] === 'string' ? values[key] as string : '';
  const booleanValue = (key: string) => values[key] === true;
  const arrayValue = (key: string) => Array.isArray(values[key]) ? values[key] as string[] : [];
  const setValue = (key: string, value: AdmissionValue) => {
    onChange({ ...values, [key]: value });
    setSaveNotice('');
  };
  const duplicateMrn = Boolean(stringValue('mrn').trim()) && existingMrns.some((mrn) => mrn.trim().toLowerCase() === stringValue('mrn').trim().toLowerCase());
  const isPharmacyComplete = () => {
    const main = stringValue('pharmacy').trim();
    if (main && main !== 'Select Pharmacy') return true;
    const additional = arrayValue('additionalPharmacies');
    return additional.some((p) => Boolean(p && p.trim().length > 0));
  };

  const missingFor = (section: SectionId) => {
    const missing = requiredKeys[section].filter((key) => !isPresent(values[key]));
    if (section === 'pharmacy' && !isPharmacyComplete()) missing.push('pharmacy');
    if (section === 'demographics' && duplicateMrn) missing.push('mrn');
    if (section === 'demographics' && !booleanValue('ssnUnknown') && !isPresent(values.ssn)) missing.push('ssn');
    if (section === 'demographics' && !arrayValue('paymentSources').length) missing.push('paymentSources');
    if (section === 'demographics' && !arrayValue('inpatientFacilities').length) missing.push('inpatientFacilities');
    if (section === 'demographics' && !stringValue('episodeTiming')) missing.push('episodeTiming');
    if (section === 'payers' && !booleanValue('mbiNA') && !isPresent(values.mbi)) missing.push('mbi');
    if (section === 'payers' && !booleanValue('medicaidNA') && !isPresent(values.medicaidNumber)) missing.push('medicaidNumber');
    if (section === 'physicians' && stringValue('attendingPhysician') === 'New Physician' && !isPresent(values.newPhysicianName)) missing.push('newPhysicianName');
    if (section === 'clinical' && !arrayValue('servicesRequired').length) missing.push('servicesRequired');
    if (section === 'emergency' && !isPresent(values.evacuationZone)) missing.push('evacuationZone');
    if (section === 'referral' && stringValue('faceToFaceStatus') !== 'N/A' && !isPresent(values.faceToFaceDate)) missing.push('faceToFaceDate');
    return [...new Set(missing)];
  };
  const missingBySection = useMemo(() => Object.fromEntries(sections.map((section) => [section.id, missingFor(section.id)])) as Record<SectionId, string[]>, [values, existingMrns]);
  const missingTotal = sections.reduce((sum, section) => sum + missingBySection[section.id].length, 0);
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const isInvalid = (key: string) => showErrors && missingBySection[activeSection].includes(key);

  const field = (key: string, label: string, options: Omit<Parameters<typeof Field>[0], 'value' | 'onChange' | 'label'> = {}) => (
    <Field key={key} label={label} value={stringValue(key)} onChange={(value) => setValue(key, value)} invalid={isInvalid(key)} {...options} />
  );
  const choice = (label: string, key: string, options: string[], multiple = false, columns: 1 | 2 | 3 = 2, required = false, exclusiveOptions: string[] = []) => (
    <ChoiceGroup label={label} options={options} value={multiple ? arrayValue(key) : stringValue(key)} onChange={(value) => setValue(key, value)} multiple={multiple} columns={columns} invalid={isInvalid(key)} required={required} exclusiveOptions={exclusiveOptions} />
  );
  const checkbox = (label: string, key: string, hint?: string) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:border-rose-300 hover:bg-rose-50/30 dark:hover:border-rose-900/50">
      <input type="checkbox" checked={booleanValue(key)} onChange={(event) => setValue(key, event.target.checked)} className="mt-0.5 accent-rose-600 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
    </label>
  );
  const sectionStatus = (section: SectionId) => missingBySection[section].length === 0;
  const updateArray = (key: string, item: string) => {
    const list = arrayValue(key);
    setValue(key, list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);
  };

  const submitAdmission = () => {
    setShowErrors(true);
    const firstIncomplete = sections.find((section) => missingBySection[section.id].length > 0);
    if (firstIncomplete) {
      setActiveSection(firstIncomplete.id);
      setSaveNotice(`Complete the required fields in ${firstIncomplete.label} before admitting this patient.`);
      return;
    }
    onAdmit();
  };

  const saveAndContinue = () => {
    setShowErrors(true);
    const incomplete = missingBySection[activeSection];
    if (incomplete.length > 0) {
      setSaveNotice(`Complete the required fields in ${selectedSection.label} before continuing.`);
      return;
    }
    onSaveDraft();
    setShowErrors(false);
    if (activeIndex < sections.length - 1) {
      setActiveSection(sections[activeIndex + 1].id);
      setSaveNotice(`${sections[activeIndex].label} saved for this session.`);
    } else {
      const firstIncomplete = sections.find((section) => missingBySection[section.id].length > 0);
      setActiveSection(firstIncomplete?.id || 'demographics');
      setSaveNotice(firstIncomplete ? `Review ${firstIncomplete.label} next.` : 'All sections are ready. Select Admit Patient to complete the admission.');
    }
  };

  const addOtherPhysician = () => setValue('otherPhysicians', [...arrayValue('otherPhysicians'), '']);
  const addPharmacy = () => setValue('additionalPharmacies', [...arrayValue('additionalPharmacies'), '']);
  const addVisitAddress = () => setValue('visitAddressCount', String(Number(stringValue('visitAddressCount') || '0') + 1));
  const addContact = () => {
    const nextContactNumber = Number(stringValue('additionalContactCount') || '0') + 1;
    onChange({ ...values, additionalContactCount: String(nextContactNumber), [`additionalContact${nextContactNumber}SameAddress`]: true });
    setSaveNotice('');
  };
  const addDiagnosis = () => setValue('otherDiagnosisCount', String(Number(stringValue('otherDiagnosisCount') || '0') + 1));

  const selectedSection = sections.find((section) => section.id === activeSection) || sections[0];
  const SectionIcon = selectedSection.icon;
  const clinicanOptions = clinicians.filter((clinician) => clinician.status === 'active').map((clinician) => `${clinician.name} · ${clinician.credentials}`);

  const addressFields = (prefix: string, title: string, sameKey?: string) => (
    <div className="space-y-4">
      <SectionTitle>{title}</SectionTitle>
      {sameKey && checkbox('Same as Primary Address', sameKey)}
      <SectionGrid>
        {(['Address1', 'Address2', 'Zip', 'Zip4', 'County', 'City', 'State'] as const).map((suffix) => {
          const labels = { Address1: 'Address Line 1', Address2: 'Address Line 2', Zip: 'ZIP', Zip4: 'ZIP+4', County: 'County', City: 'City', State: 'State' };
          const required = ['Address1', 'Zip', 'County', 'City', 'State'].includes(suffix);
          const isSame = Boolean(sameKey && booleanValue(sameKey));
          const primaryKey = `primary${suffix}`;
          const key = `${prefix}${suffix}`;
          return <Field key={key} label={labels[suffix]} value={isSame ? stringValue(primaryKey) : stringValue(key)} onChange={(value) => setValue(key, value)} required={required} options={suffix === 'State' ? states : undefined} disabled={isSame} />;
        })}
      </SectionGrid>
    </div>
  );

  const renderDemographics = () => (
    <div className="space-y-6">
      <Panel title="Patient Information" description="Enter the patient’s core identity, contact, and care-team details.">
        <SectionGrid>
          <Field label="First Name (M0040)" value={stringValue('firstName')} onChange={(value) => setValue('firstName', value)} required invalid={isInvalid('firstName')} placeholder="Enter first name" />
          <div className="grid grid-cols-[90px_1fr] gap-3">
            <Field label="MI" value={stringValue('middleInitial')} onChange={(value) => setValue('middleInitial', value)} placeholder="MI" />
            <Field label="Last Name (M0040)" value={stringValue('lastName')} onChange={(value) => setValue('lastName', value)} required invalid={isInvalid('lastName')} placeholder="Enter last name" />
          </div>
          <Field label="Sex (A0810)" value={stringValue('sex')} onChange={(value) => setValue('sex', value)} required invalid={isInvalid('sex')} options={['Female', 'Male', 'Other']} />
          <Field label="Date of Birth (M0066)" value={stringValue('dob')} onChange={(value) => setValue('dob', value)} required invalid={isInvalid('dob')} type="date" />
          <div>
            <Field label="Social Security Number (M0064)" value={stringValue('ssn')} onChange={(value) => setValue('ssn', value)} required={!booleanValue('ssnUnknown')} invalid={isInvalid('ssn')} placeholder="Enter SSN" />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={booleanValue('ssnUnknown')} onChange={(event) => onChange({ ...values, ssnUnknown: event.target.checked, ...(event.target.checked ? { ssn: '' } : {}) })} className="accent-rose-600" />
              <span>Unknown SSN</span>
            </label>
          </div>
          <Field label="Marital Status" value={stringValue('maritalStatus')} onChange={(value) => setValue('maritalStatus', value)} options={['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Unknown']} />
          <Field label="Mobile Phone" value={stringValue('mobile')} onChange={(value) => setValue('mobile', value)} required invalid={isInvalid('mobile')} type="tel" hint="For emergency preparedness, the patient will be contacted at this number. This will also populate the Emergency Preparedness Report." />
          <Field label="Alternate Phone" value={stringValue('alternatePhone')} onChange={(value) => setValue('alternatePhone', value)} type="tel" />
          <Field label="Email Address" value={stringValue('email')} onChange={(value) => setValue('email', value)} type="email" />
          <Field label="Clinical Manager" value={stringValue('clinicalManager')} onChange={(value) => setValue('clinicalManager', value)} required invalid={isInvalid('clinicalManager')} options={clinicanOptions} />
          <Field label="Case Manager" value={stringValue('caseManager')} onChange={(value) => setValue('caseManager', value)} required invalid={isInvalid('caseManager')} options={clinicanOptions} />
          <Field label="Assign to Clinician" value={stringValue('assignedClinician')} onChange={(value) => setValue('assignedClinician', value)} required invalid={isInvalid('assignedClinician')} options={clinicanOptions} />
          <Field label="Branch" value={stringValue('branch')} onChange={(value) => setValue('branch', value)} required invalid={isInvalid('branch')} options={[organization.name, 'Beverly Branch', 'Boston Branch', 'Dallas Main Branch']} />
          <div>
            <Field label="Patient ID / MRN (M0020)" value={stringValue('mrn')} onChange={(value) => setValue('mrn', value)} required invalid={isInvalid('mrn')} errorMessage={duplicateMrn ? 'This MRN is already in use. Enter a different ID.' : undefined} placeholder="Enter ID/MRN" />
            <p className="mt-1.5 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                <Sparkles size={12} /> Generated by Axxess Intelligence
              </span>
              <span>Last MRN used: {lastMrnUsed}</span>
            </p>
          </div>
          <Field label="Default Service Location" value={stringValue('defaultServiceLocation')} onChange={(value) => setValue('defaultServiceLocation', value)} required invalid={isInvalid('defaultServiceLocation')} options={['Patient home', 'Assisted living facility', 'Skilled nursing facility', 'Other']} />
        </SectionGrid>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <SectionTitle>Primary Address</SectionTitle>
            <SectionGrid>
              {field('primaryAddress1', 'Address Line 1', { required: true, invalid: isInvalid('primaryAddress1') })}
              {field('primaryAddress2', 'Address Line 2')}
              {field('primaryZip', 'ZIP (M0060)', { required: true, invalid: isInvalid('primaryZip') })}
              {field('primaryZip4', 'ZIP+4')}
              {field('primaryCounty', 'County', { required: true, invalid: isInvalid('primaryCounty') })}
              {field('primaryCity', 'City', { required: true, invalid: isInvalid('primaryCity') })}
              {field('primaryState', 'State (M0050)', { required: true, invalid: isInvalid('primaryState'), options: states })}
            </SectionGrid>
          </div>
          <div>{addressFields('mailing', 'Mailing Address', 'sameMailingAddress')}</div>
        </div>

        <div className="space-y-4">
          <SectionTitle>Visit Address</SectionTitle>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-pearl-300 bg-pearl-50/60 p-4 dark:border-charcoal-700 dark:bg-charcoal-800/40">
            <p className="text-xs text-slate-600 dark:text-slate-300">Add a separate visit location if care is provided somewhere other than the primary address.</p>
            <button
              type="button"
              onClick={addVisitAddress}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
            >
              <Plus size={14} /> Add visit address
            </button>
          </div>
          {Array.from({ length: Number(stringValue('visitAddressCount') || '0') }, (_, index) => (
            <div key={index} className="rounded-2xl border border-pearl-200 p-4 dark:border-charcoal-700 bg-white dark:bg-charcoal-800/60 shadow-2xs">
              <div className="mb-3 flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Visit address {index + 1}</span>
                <button type="button" onClick={() => setValue('visitAddressCount', String(Math.max(0, Number(stringValue('visitAddressCount') || '0') - 1)))} className="text-slate-400 hover:text-rose-600">
                  <X size={15} />
                </button>
              </div>
              <SectionGrid>
                {field(`visitAddress${index + 1}`, 'Address Line 1')}
                {field(`visitCity${index + 1}`, 'City')}
                {field(`visitState${index + 1}`, 'State', { options: states })}
                {field(`visitZip${index + 1}`, 'ZIP')}
              </SectionGrid>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { if (stringValue('primaryAddress1') && stringValue('primaryCity') && stringValue('primaryZip')) setAddressValidated(true); else setSaveNotice('Enter the primary street address, city, and ZIP before validating.'); }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            <MapPin size={15} className="text-rose-600 dark:text-rose-400" />
            <span>{addressValidated ? 'Address Validated' : 'Validate Address'}</span>
            {addressValidated && <Check size={14} className="text-emerald-500" />}
          </button>
        </div>
      </Panel>

      <Panel title="Race, ethnicity & language" description="Record the patient’s preferred communication and demographic responses.">
        <ChoiceGroup label="Are you of Hispanic, Latino/a, or Spanish Origin? (A1005) — select all that apply" options={originOptions} value={arrayValue('raceOrigins')} onChange={(value) => setValue('raceOrigins', value)} multiple columns={2} />
        <ChoiceGroup label="What is your race? (A1010) — select all that apply" options={raceOptions} value={arrayValue('races')} onChange={(value) => setValue('races', value)} multiple columns={2} />
        <SectionGrid>
          {field('preferredLanguage', 'Preferred Language (A1110A)', { required: true, placeholder: 'Enter preferred language' })}
          {field('auxiliaryAids', 'Auxiliary Aids', { placeholder: 'Enter type' })}
          {field('additionalLanguage1', 'Additional Language')}
          {field('additionalLanguage2', 'Additional Language')}
          {field('additionalLanguage3', 'Additional Language')}
        </SectionGrid>
        <div className={isInvalid('interpreterNeed') ? 'rounded-xl ring-1 ring-rose-400' : ''}>
          {choice('Do you need or want an interpreter? (A1110B)', 'interpreterNeed', ['No', 'Yes', 'Unable to Determine'], false, 3, true)}
        </div>
      </Panel>

      <Panel title="Payment source & episode timing" description="Capture payment sources, admission source, and the Medicare episode details.">
        {choice('Current Payment Sources for Home Care (M0150) — select all that apply', 'paymentSources', paymentOptionsShort, true, 2, true, ['None; no charge for current services', 'Unknown'])}
        {arrayValue('paymentSources').includes('Other (Specify)') && field('otherPaymentSource', 'Specify Other Payment Source')}
        {choice('Inpatient facilities discharged from within the past 14 days? (M1000)', 'inpatientFacilities', inpatientOptions, true, 2, true, ['N/A — no inpatient discharge'])}
        {field('otherInpatientFacility', 'Other Inpatient Facility')}
        {choice('Episode Timing — early or later in the current sequence?', 'episodeTiming', ['1 — Early', '2 — Later', 'UK — Unknown', 'N/A — Not applicable'], false, 2, true)}
        <SectionGrid>
          {field('startOfCareDate', 'Start of Care Date', { type: 'date', required: true, invalid: isInvalid('startOfCareDate') })}
          {field('episodeStartDate', 'Episode Start Date', { type: 'date', required: true, invalid: isInvalid('episodeStartDate') })}
        </SectionGrid>
        {choice('Create episode & schedule visit after saving — select all that apply', 'episodeActions', ['Create episode & schedule OASIS Start of Care visit', 'Create episode & schedule therapy evaluation', 'Create episode & schedule Non-OASIS Start of Care visit', 'Create episode & schedule initial OASIS Recert in Axxess', 'Create episode & schedule initial Non-OASIS Recert in Axxess', 'Track F2F Documentation'], true, 2)}
        {field('tags', 'Tags', { placeholder: 'Select or enter tags' })}
      </Panel>
    </div>
  );

  const renderPayers = () => (
    <div className="space-y-6">
      <Panel
        title="Payer Information"
        description="Enter payer identifiers and insurance coverage for this admission."
        action={
          <button
            type="button"
            onClick={() => setShowCMSGuidance(!showCMSGuidance)}
            className="text-xs font-bold text-rose-700 hover:underline dark:text-rose-300"
          >
            CMS MBI Guidance
          </button>
        }
      >
        {showCMSGuidance && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs leading-relaxed text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
            CMS describes the MBI as an 11-character identifier used for Medicare transactions. Treat it as confidential patient information.{' '}
            <a href="https://www.cms.gov/training-education/partner-outreach-resources/new-medicare-card/medical-beneficiary-identifiers-mbis" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">
              Open CMS MBI guidance
            </a>
          </div>
        )}
        <SectionGrid>
          <div>
            <Field label="Medicare Beneficiary Identifier (M0063)" value={stringValue('mbi')} onChange={(value) => setValue('mbi', value.toUpperCase())} required={!booleanValue('mbiNA')} invalid={isInvalid('mbi')} placeholder="Enter 11-character MBI" />
            <div className="mt-2">{checkbox('N/A for this patient', 'mbiNA')}</div>
          </div>
          <div>
            <Field label="Health Insurance Claim (HIC) Number" value={stringValue('hicNumber')} onChange={(value) => setValue('hicNumber', value)} placeholder="Enter HIC number" />
            <div className="mt-2">{checkbox('N/A for this patient', 'hicNA')}</div>
          </div>
          <div>
            <Field label="Medicaid Number (M0065)" value={stringValue('medicaidNumber')} onChange={(value) => setValue('medicaidNumber', value)} required={!booleanValue('medicaidNA')} invalid={isInvalid('medicaidNumber')} placeholder="Enter Medicaid number" />
            <div className="mt-2">{checkbox('N/A for this patient', 'medicaidNA')}</div>
          </div>
          {field('alternateMedicaidNumber', 'Alternate Medicaid Number')}
        </SectionGrid>
        <button
          type="button"
          onClick={() => setEligibilityChecked(true)}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
        >
          <ShieldCheck size={15} className="text-rose-600 dark:text-rose-400" />
          <span>Verify Medicare Eligibility</span>
        </button>
        {eligibilityChecked && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={15} /> Eligibility check is ready to be completed by your authorized payer workflow.
          </p>
        )}
        <SectionTitle>Insurance coverage</SectionTitle>
        <SectionGrid>
          {field('primaryInsurance', 'Primary Insurance', { required: true, invalid: isInvalid('primaryInsurance'), options: ['Medicare Traditional', 'Medicare Advantage', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Private insurance', 'Self-pay', 'Other'] })}
          {field('secondaryInsurance', 'Secondary Insurance', { options: ['None', 'Medicare Traditional', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Private insurance', 'Other'] })}
          {field('tertiaryInsurance', 'Tertiary Insurance', { options: ['None', 'Medicare Traditional', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Private insurance', 'Other'] })}
        </SectionGrid>
        <Field label="Payer Comments" value={stringValue('payerComments')} onChange={(value) => setValue('payerComments', value)} multiline placeholder="Add payer notes" />
        <TemplatePicker selected={arrayValue('payerTemplates')} onChange={(templates) => setValue('payerTemplates', templates)} />
      </Panel>

      <Panel title="Additional billing information" description="Optional billing locators and condition details from the admission record.">
        <SectionTitle>UB-04 Locators 31–34 · Occurrence Codes</SectionTitle>
        <SectionGrid columns={3}>
          {field('occurrenceCode', '31A Code')}
          {field('occurrenceDate', 'Date', { type: 'date' })}
          {field('occurrenceSpanCode', '35A Occurrence Span Code')}
          {field('occurrenceSpanStart', 'Span Start Date', { type: 'date' })}
          {field('occurrenceSpanEnd', 'Span End Date', { type: 'date' })}
        </SectionGrid>
        <SectionTitle>UB-04 Locators 18–28 · Condition Codes</SectionTitle>
        <SectionGrid columns={3}>
          {Array.from({ length: 11 }, (_, index) => field(`conditionCode${index + 18}`, `Condition Code ${index + 18}`, { placeholder: 'Enter code' }))}
        </SectionGrid>
        <SectionTitle>HCFA-1500 billing details</SectionTitle>
        {choice('Patient’s condition related to', 'billingRelatedTo', ['Employment', 'Auto Accident', 'Other Accident'], true, 3)}
        <SectionGrid>
          {field('claimCode', 'Claim Code')}
          {field('unableToWorkFrom', 'Unable to Work From', { type: 'date' })}
          {field('unableToWorkTo', 'Unable to Work To', { type: 'date' })}
          {field('hospitalizationStart', 'Hospitalization Start', { type: 'date' })}
          {field('hospitalizationEnd', 'Hospitalization End', { type: 'date' })}
          {checkbox('Emergency Treatment Indicator', 'emergencyTreatment')}
        </SectionGrid>
      </Panel>
    </div>
  );

  const renderPhysicians = () => (
    <Panel title="Physicians" description="Search and confirm the attending and other physicians involved in the patient’s care.">
      <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50">
        <p className="mb-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Use the filters below to narrow down physicians by city and state. Search by physician name or NPI.
        </p>
        <SectionGrid columns={3}>
          {field('physicianCity', 'City')}
          {field('physicianState', 'State', { options: states })}
          <Field label="Search Physician / NPI" value={stringValue('physicianSearch')} onChange={(value) => setValue('physicianSearch', value)} placeholder="Enter name or NPI" />
        </SectionGrid>
      </div>
      <SectionGrid>
        {field('attendingPhysician', 'Attending Physician', { required: true, invalid: isInvalid('attendingPhysician'), options: ['Select Physician', ...clinicanOptions, 'New Physician'] })}
        {field('certifyingPhysician', 'Certifying Physician', { options: ['Same as Attending Physician', ...clinicanOptions] })}
      </SectionGrid>
      {stringValue('attendingPhysician') === 'New Physician' && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="min-w-[240px] flex-1">
            {field('newPhysicianName', 'New Physician Name', { required: true, invalid: isInvalid('newPhysicianName') })}
          </div>
          <button
            type="button"
            onClick={() => { if (stringValue('newPhysicianName')) setValue('attendingPhysician', stringValue('newPhysicianName')); }}
            className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-rose-700"
          >
            Add physician
          </button>
        </div>
      )}
      {checkbox('The attending physician agreed to provide ongoing care for the patient.', 'physicianAgreement')}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200/80 pt-4 dark:border-charcoal-700/80">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Other Physicians on the Case</h3>
        <button
          type="button"
          onClick={addOtherPhysician}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
        >
          <Plus size={14} /> Add physician
        </button>
      </div>
      {arrayValue('otherPhysicians').map((physician, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={physician}
            onChange={(event) => {
              const list = [...arrayValue('otherPhysicians')];
              list[index] = event.target.value;
              setValue('otherPhysicians', list);
            }}
            placeholder="Physician name or NPI"
            className="h-10 flex-1 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium outline-none transition focus:border-rose-500 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setValue('otherPhysicians', arrayValue('otherPhysicians').filter((_, i) => i !== index))}
            aria-label="Remove physician"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-pearl-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-600 dark:border-charcoal-700 dark:hover:text-rose-400"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </Panel>
  );

  const renderClinical = () => (
    <div className="space-y-6">
      <Panel title="Clinical / Diagnoses" description="Document requested disciplines, clinical measurements, equipment, and ICD-10 diagnoses.">
        {choice('Service Required', 'servicesRequired', ['SN', 'HHA', 'PT', 'OT', 'ST', 'MSW'], true, 3, true)}
        <SectionGrid columns={3}>
          <div className="grid grid-cols-[1fr_70px] gap-2">
            <Field label="Height" value={stringValue('height')} onChange={(value) => setValue('height', value)} type="number" placeholder="—" />
            <Field label="Unit" value={stringValue('heightUnit')} onChange={(value) => setValue('heightUnit', value)} options={['in', 'cm']} />
          </div>
          <div className="grid grid-cols-[1fr_70px] gap-2">
            <Field label="Weight" value={stringValue('weight')} onChange={(value) => setValue('weight', value)} type="number" placeholder="—" />
            <Field label="Unit" value={stringValue('weightUnit')} onChange={(value) => setValue('weightUnit', value)} options={['lb', 'kg']} />
          </div>
          <div />
        </SectionGrid>
        {choice('DME Needed — select all that apply', 'dmeNeeded', dmeOptions, true, 3)}
        {arrayValue('dmeNeeded').includes('Other') && field('otherDme', 'Other DME Needed')}
        <SectionTitle>Patient Diagnosis (ICD-10-CM)</SectionTitle>
        <SectionGrid>
          {field('primaryDiagnosisName', 'Primary Diagnosis (M1021)', { required: true, invalid: isInvalid('primaryDiagnosisName'), placeholder: 'Search diagnosis' })}
          {field('primaryDiagnosisCode', 'ICD-10-CM Code', { required: true, invalid: isInvalid('primaryDiagnosisCode'), placeholder: 'Enter code' })}
        </SectionGrid>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Other Diagnoses (M1023)</h3>
          <button
            type="button"
            onClick={addDiagnosis}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            <Plus size={14} /> Add diagnosis
          </button>
        </div>
        {Array.from({ length: Number(stringValue('otherDiagnosisCount') || '0') }, (_, index) => (
          <SectionGrid key={index}>
            <Field label={`Other Diagnosis ${index + 1}`} value={stringValue(`otherDiagnosisName${index + 1}`)} onChange={(value) => setValue(`otherDiagnosisName${index + 1}`, value)} placeholder="Search diagnosis" />
            <Field label="ICD-10-CM Code" value={stringValue(`otherDiagnosisCode${index + 1}`)} onChange={(value) => setValue(`otherDiagnosisCode${index + 1}`, value)} placeholder="Enter code" />
          </SectionGrid>
        ))}
        <Field label="Clinical Comments" value={stringValue('clinicalComments')} onChange={(value) => setValue('clinicalComments', value)} multiline placeholder="Add clinical comments" />
        <TemplatePicker selected={arrayValue('clinicalTemplates')} onChange={(templates) => setValue('clinicalTemplates', templates)} />
      </Panel>
    </div>
  );

  const renderPharmacy = () => (
    <Panel title="Pharmacy Information" description="Select the patient’s preferred pharmacy and add others as needed.">
      <SectionGrid>
        <Field label="Pharmacy" value={stringValue('pharmacy')} onChange={(value) => setValue('pharmacy', value)} options={['Select Pharmacy', 'CVS Pharmacy', 'Walgreens', 'Walmart Pharmacy', 'Other']} />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setShowNewPharmacy(!showNewPharmacy)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            <Plus size={15} /> New pharmacy
          </button>
        </div>
      </SectionGrid>
      {showNewPharmacy && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="min-w-[240px] flex-1">
            {field('newPharmacy', 'New Pharmacy Name')}
          </div>
          <button
            type="button"
            onClick={() => {
              if (stringValue('newPharmacy')) {
                setValue('pharmacy', stringValue('newPharmacy'));
                setShowNewPharmacy(false);
              }
            }}
            className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-rose-700"
          >
            Add pharmacy
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pearl-200/80 pt-4 dark:border-charcoal-700/80">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Additional Pharmacy</h3>
        <button
          type="button"
          onClick={addPharmacy}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
        >
          <Plus size={14} /> Add pharmacy
        </button>
      </div>
      {arrayValue('additionalPharmacies').map((pharmacy, index) => (
        <input
          key={index}
          value={pharmacy}
          onChange={(event) => {
            const list = [...arrayValue('additionalPharmacies')];
            list[index] = event.target.value;
            setValue('additionalPharmacies', list);
          }}
          placeholder="Enter additional pharmacy"
          className="h-10 w-full rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-3.5 text-xs font-medium outline-none transition focus:border-rose-500 dark:text-white"
        />
      ))}
      <Field label="Pharmacy Comments" value={stringValue('pharmacyComments')} onChange={(value) => setValue('pharmacyComments', value)} multiline placeholder="Add pharmacy notes" />
    </Panel>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <Panel title="Primary Emergency Contact" description="This person can be contacted for care coordination and emergency preparedness.">
        <SectionGrid>
          {field('primaryContactFirstName', 'First Name', { required: true, invalid: isInvalid('primaryContactFirstName') })}
          {field('primaryContactLastName', 'Last Name', { required: true, invalid: isInvalid('primaryContactLastName') })}
          {field('primaryContactMobile', 'Mobile Phone', { required: true, invalid: isInvalid('primaryContactMobile'), type: 'tel', hint: 'This number is used for emergency preparedness contact.' })}
          {field('primaryContactAlternate', 'Alternate Phone', { type: 'tel' })}
          {field('primaryContactRelationship', 'Relationship', { required: true, invalid: isInvalid('primaryContactRelationship'), options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Caregiver', 'Other'] })}
          {field('primaryContactEmail', 'Email', { type: 'email' })}
        </SectionGrid>
        {choice('Representative', 'primaryContactRepresentative', ['Legal Representative', 'Patient Selected Representative'], true, 2)}
        {addressFields('primaryContact', 'Contact Address', 'primaryContactSameAddress')}
      </Panel>

      <Panel
        title="Additional Emergency Contact"
        description="Add another person to contact when the primary contact is unavailable."
        action={
          <button
            type="button"
            onClick={addContact}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            <Plus size={14} /> Add contact
          </button>
        }
      >
        {Number(stringValue('additionalContactCount') || '0') === 0 ? (
          <p className="rounded-2xl border border-dashed border-pearl-300 p-4 text-xs text-slate-500 dark:border-charcoal-700 dark:text-slate-400">
            No additional contact added.
          </p>
        ) : (
          Array.from({ length: Number(stringValue('additionalContactCount')) }, (_, index) => {
            const contactNumber = index + 1;
            const prefix = `additionalContact${contactNumber}`;
            const sameKey = `${prefix}SameAddress`;
            return (
              <div key={contactNumber} className="space-y-4 rounded-2xl border border-pearl-200 p-4 dark:border-charcoal-700 bg-white dark:bg-charcoal-800/50 shadow-2xs">
                <SectionGrid>
                  {field(`${prefix}FirstName`, 'First Name')}
                  {field(`${prefix}LastName`, 'Last Name')}
                  {field(`${prefix}Mobile`, 'Mobile Phone', { type: 'tel' })}
                  {field(`${prefix}Alternate`, 'Alternate Phone', { type: 'tel' })}
                  {field(`${prefix}Relationship`, 'Relationship', { options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Caregiver', 'Other'] })}
                  {field(`${prefix}Email`, 'Email', { type: 'email' })}
                </SectionGrid>
                {choice('Representative', `${prefix}Representative`, ['Legal Representative', 'Patient Selected Representative'], true, 2)}
                {addressFields(prefix, `Contact ${contactNumber} Address`, sameKey)}
              </div>
            );
          })
        )}
        <SectionTitle>Patient Representative Coordination</SectionTitle>
        {choice('Representative contacted regarding admission', 'representativeCoordination', ['N/A — no legal/patient-selected representative', 'Legal Representative contacted regarding admission', 'Patient request to decline notice of rights to Patient-Selected Representative', 'Patient-Selected Representative contacted regarding admission', 'Legal Representative not in agreement with admission'], false, 1)}
        {checkbox('Do Not Contact for CAHPS', 'doNotContactCAHPS', 'If checked, document the appropriate reason in Contacts Comments.')}
      </Panel>

      <Panel title="Alternate CAHPS Contact" description="Complete only when the patient cannot complete the survey independently.">
        {checkbox('Same as Primary Emergency Contact', 'alternateCAHPSSameContact')}
        {!booleanValue('alternateCAHPSSameContact') && (
          <>
            <SectionGrid>
              {field('alternateCAHPSFirstName', 'First Name')}
              {field('alternateCAHPSLastName', 'Last Name')}
              {field('alternateCAHPSRelationship', 'Relationship', { options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Caregiver', 'Other'] })}
              {field('alternateCAHPSMobile', 'Mobile Phone', { type: 'tel' })}
              {field('alternateCAHPSAlternate', 'Alternate Phone', { type: 'tel' })}
              {field('alternateCAHPSEmail', 'Email', { type: 'email' })}
            </SectionGrid>
            {addressFields('alternateCAHPS', 'Mailing Address')}
          </>
        )}
        <Field label="Contacts Comments" value={stringValue('contactsComments')} onChange={(value) => setValue('contactsComments', value)} multiline placeholder="Add contact notes" />
        <TemplatePicker selected={arrayValue('contactsTemplates')} onChange={(templates) => setValue('contactsTemplates', templates)} />
      </Panel>
    </div>
  );

  const renderEmergency = () => (
    <div className="space-y-6">
      <Panel title="Emergency Triage" description="Choose the patient’s emergency priority based on the impact of interrupted home health services.">
        {choice('Emergency Triage', 'triageLevel', [
          '1 — Life-threatening or potential; requires ongoing medical treatment. Arrange evacuation to acute care when necessary.',
          '2 — Not life-threatening, but interruption could cause severe adverse effects (e.g., daily insulin, IV medication, complex wound care).',
          '3 — Visits could be postponed 24–48 hours without adverse effects.',
          '4 — Visits could be postponed 72–96 hours without adverse effects.',
        ], false, 1, true)}
        <SectionTitle>Additional Emergency Preparedness Information</SectionTitle>
        <div className="grid gap-2.5 md:grid-cols-3">
          {checkbox('Needs assistance during an emergency', 'needsEmergencyAssistance')}
          {checkbox('Local/state officials contacted about evacuation assistance', 'officialsContacted')}
          {checkbox('Medical needs / equipment', 'medicalNeedsEquipment', 'Examples: bedbound, oxygen, ventilator, IV cardiac medication, or other DME.')}
        </div>
        <Field label="Additional Emergency Preparedness Information" value={stringValue('emergencyPreparednessAdditional')} onChange={(value) => setValue('emergencyPreparednessAdditional', value)} multiline placeholder="Enter additional emergency information" />
        <TemplatePicker selected={arrayValue('emergencyTemplates')} onChange={(templates) => setValue('emergencyTemplates', templates)} />
      </Panel>

      <Panel title="Evacuation" description="Record the assigned evacuation zone and alternate safe location.">
        <SectionGrid>
          {field('evacuationZone', 'Evacuation Zone', { required: true, invalid: isInvalid('evacuationZone'), options: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Outside evacuation zone', 'Unknown'] })}
          <div />
        </SectionGrid>
        {checkbox('Same as Emergency Contact', 'evacuationSameAsContact')}
        {!booleanValue('evacuationSameAsContact') && (
          <SectionGrid>
            {field('evacuationAddress1', 'Address Line 1')}
            {field('evacuationAddress2', 'Address Line 2')}
            {field('evacuationCity', 'City')}
            {field('evacuationState', 'State', { options: states })}
            {field('evacuationZip', 'ZIP')}
            {field('evacuationCounty', 'County')}
            {field('evacuationMobile', 'Mobile Phone', { type: 'tel' })}
            {field('evacuationAlternate', 'Alternate Phone', { type: 'tel' })}
          </SectionGrid>
        )}
        {checkbox('Set as visit location', 'setAsVisitLocation')}
        <Field label="Emergency Preparedness Comments" value={stringValue('emergencyComments')} onChange={(value) => setValue('emergencyComments', value)} multiline placeholder="Add emergency comments" />
        <TemplatePicker selected={arrayValue('evacuationTemplates')} onChange={(templates) => setValue('evacuationTemplates', templates)} />
      </Panel>
    </div>
  );

  const renderDirectives = () => (
    <Panel title="Advance Care Plan / Admission" description="Record whether an advance care plan or surrogate decision-maker is in place and documented in the home health record.">
      {choice('Does the patient have an advance care plan or surrogate decision-maker AND legal documentation for the home health medical record?', 'advanceCarePlan', ['Yes', 'No'], false, 2, true)}
      <Field label="Comments" value={stringValue('advanceCarePlanComments')} onChange={(value) => setValue('advanceCarePlanComments', value)} multiline placeholder="Add advance directive or surrogate details" />
      <TemplatePicker selected={arrayValue('advanceCarePlanTemplates')} onChange={(templates) => setValue('advanceCarePlanTemplates', templates)} />
    </Panel>
  );

  const renderReferral = () => (
    <div className="space-y-6">
      <Panel title="Referral Information" description="Search referring and certifying physicians, then capture the referral source and timing.">
        <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50">
          <p className="mb-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Use the filters below to narrow down physicians by city or state. Search by physician name or NPI.
          </p>
          <SectionGrid columns={3}>
            {field('referralCity', 'City')}
            {field('referralState', 'State', { options: states })}
            {field('referralPhysicianSearch', 'Search Physician / NPI', { placeholder: 'Enter name or NPI' })}
          </SectionGrid>
        </div>
        <SectionGrid>
          {field('referringPhysician', 'Referring Physician', { required: true, invalid: isInvalid('referringPhysician'), placeholder: 'Select or enter physician' })}
          {field('certifyingPhysicianType', 'Certifying Physician', { options: ['Attending Physician', 'Referring Physician', 'Other'] })}
          {field('certifyingPhysician', 'Enter Certifying Physician')}
          {field('certifyingNPI', 'NPI')}
        </SectionGrid>
        {choice('Face-to-Face Evaluation Information', 'faceToFaceStatus', ['N/A', 'Face-to-Face to be completed within 30 days'], false, 2, true)}
        {stringValue('faceToFaceStatus') && stringValue('faceToFaceStatus') !== 'N/A' && field('faceToFaceDate', 'Date of Face-to-Face Visit', { type: 'date', required: true, invalid: isInvalid('faceToFaceDate') })}
        <SectionTitle>Referral Details</SectionTitle>
        <SectionGrid>
          {field('admissionSource', 'Admission Source', { required: true, invalid: isInvalid('admissionSource'), options: ['Physician referral', 'Hospital', 'Skilled nursing facility', 'Patient / family', 'Community organization', 'Other'] })}
          {field('referralSourceName', 'Name of Referral Source')}
          {field('referralDate', 'Referral Date', { type: 'date', required: true, invalid: isInvalid('referralDate') })}
          {field('inquiryDate', 'Inquiry Date', { type: 'date' })}
          {field('communityLiaison', 'Community Liaison', { options: ['Select Liaison', 'Internal team', 'Other'] })}
          {field('internalReferralSource', 'Internal Referral Source', { options: ['Select Source', 'Existing patient', 'Clinician', 'Other'] })}
          {field('facilityReferralSource', 'Facility Referral Source', { options: ['Select Source', 'Hospital', 'Nursing facility', 'Clinic', 'Other'] })}
          {field('inpatientAdmissionCode', 'Type of Inpatient Admission / Visit Code', { required: true, invalid: isInvalid('inpatientAdmissionCode'), options: ['1 — Inpatient acute care hospital', '2 — Skilled nursing facility', '3 — Inpatient rehabilitation', '4 — Long-term care hospital', 'N/A — No inpatient admission'] })}
        </SectionGrid>
      </Panel>
    </div>
  );

  const sectionContent: Record<SectionId, () => React.ReactNode> = {
    demographics: renderDemographics,
    payers: renderPayers,
    physicians: renderPhysicians,
    clinical: renderClinical,
    pharmacy: renderPharmacy,
    contacts: renderContacts,
    emergency: renderEmergency,
    directives: renderDirectives,
    referral: renderReferral,
  };

  const scrollToSection = (section: SectionId) => {
    setActiveSection(section);
    setShowErrors(false);
    setSaveNotice('');
  };

  const completedCount = sections.filter((section) => sectionStatus(section.id)).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans dark:bg-charcoal-900">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onSaveAndExit}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
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
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                New Patient Admission
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">MRN: #{stringValue('mrn') || 'Pending'}</span>
              <span>•</span>
              <span className="truncate">Branch: {stringValue('branch') || organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-pearl-200 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-2xs dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
            <span className={`h-1.5 w-1.5 rounded-full ${draftSaved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {draftSaved ? 'Draft Autosaved' : 'Draft In Session'}
          </span>
          <button
            type="button"
            onClick={() => { onSaveDraft(); onSaveAndExit(); }}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-50 px-2.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
            title="Save draft and exit"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div role="status" className="flex shrink-0 items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-5 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 2. Workspace Body: Left-hand Rail + Center Form */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left-hand Navigation Rail */}
        <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-4 lg:flex overflow-y-auto">
          <div className="space-y-4">
            {/* Checklist Progress */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-3.5 dark:border-charcoal-700/80 dark:bg-charcoal-800/50">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>Admission Checklist</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold">{completedCount} of {sections.length}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pearl-200 dark:bg-charcoal-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300"
                  style={{ width: `${(completedCount / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Section Item Links */}
            <nav aria-label="Patient admission sections" className="space-y-1">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                const active = activeSection === section.id;
                const isComplete = sectionStatus(section.id);
                const missingCount = missingBySection[section.id].length;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    aria-current={active ? 'step' : undefined}
                    className={`group flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                      active
                        ? 'border-rose-300/80 bg-gradient-to-r from-rose-50/90 to-rose-100/30 text-rose-800 shadow-2xs dark:border-rose-900/60 dark:from-rose-950/40 dark:to-charcoal-850 dark:text-rose-200 font-bold'
                        : 'border-transparent text-slate-600 hover:border-pearl-200 hover:bg-pearl-100/60 dark:text-slate-300 dark:hover:border-charcoal-700 dark:hover:bg-charcoal-800/60 font-medium'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                        active
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : isComplete
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-pearl-100 text-slate-500 dark:bg-charcoal-800 dark:text-slate-400 group-hover:bg-pearl-200 dark:group-hover:bg-charcoal-700'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1 truncate">
                      <span className="block truncate text-xs">{section.label}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                        Section {idx + 1}
                      </span>
                    </div>
                    {isComplete ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" title="Section complete">
                        <Check size={12} strokeWidth={2.8} />
                      </span>
                    ) : showErrors && missingCount > 0 ? (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 px-1 text-[10px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {missingCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Assistant Info Box */}
          <div className="mt-4 rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-3.5 dark:border-charcoal-700/80 dark:bg-charcoal-800/50">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <Sparkles size={15} />
              <span className="text-xs font-black">PDGM Modeling Tool</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Preview Medicare 30-day period grouping and reimbursement drivers as clinical fields are completed.
            </p>
            <button
              type="button"
              onClick={() => setShowPDGM(true)}
              className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-charcoal-750 dark:text-rose-300"
            >
              Open Modeling Tool
            </button>
          </div>
        </aside>

        {/* Mobile Horizontal Section Tabs */}
        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-pearl-200/90 bg-white/80 px-3 py-2 backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-900/80 lg:hidden">
          {sections.map((section, idx) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-pearl-100 text-slate-600 dark:bg-charcoal-800 dark:text-slate-300'
                }`}
              >
                {idx + 1}. {section.label}
              </button>
            );
          })}
        </div>

        {/* Center Form Body */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-pearl-50/50 dark:bg-charcoal-900/40">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Section Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pearl-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-850/80">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-2xs">
                  <SectionIcon size={20} />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-rose-600 dark:text-rose-400">
                    Section {activeIndex + 1} of {sections.length}
                  </p>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {selectedSection.label}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sectionStatus(activeSection) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 size={13} /> All Section Requirements Met
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-pearl-200 bg-pearl-100 px-3 py-1 text-xs font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {missingBySection[activeSection].length} Required Items Remaining
                  </span>
                )}
              </div>
            </div>

            {/* Active Section Form Panels */}
            {sectionContent[activeSection]()}

            {showErrors && missingTotal > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-200">
                <AlertTriangle size={15} className="mr-2 inline" />
                {missingTotal} required fields still need attention across all admission sections.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Sticky Action Footer */}
      <footer className="sticky bottom-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-pearl-200/90 bg-white/85 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/85 sm:px-6">
        <button
          type="button"
          onClick={() => setShowPDGM(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
        >
          <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
          <span>PDGM Modeling Tool</span>
        </button>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-pearl-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:bg-charcoal-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onSaveDraft(); onSaveAndExit(); }}
            className="h-10 rounded-xl border border-pearl-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
          >
            Save and Exit
          </button>
          <button
            type="button"
            onClick={saveAndContinue}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <span>Save & Continue</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={submitAdmission}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 transition hover:-translate-y-0.5 hover:bg-rose-700"
          >
            <BadgeCheck size={16} />
            <span>Admit Patient</span>
          </button>
        </div>
      </footer>

      {/* PDGM Modeling Tool Modal */}
      {showPDGM && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && setShowPDGM(false)}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles size={20} />
              </span>
              <button
                type="button"
                onClick={() => setShowPDGM(false)}
                aria-label="Close PDGM tool"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">PDGM Modeling Tool</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Preview the clinical categories and payment grouping calculated for this admission sequence under the Patient-Driven Groupings Model.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ['Payment source', arrayValue('paymentSources').join(', ') || 'Not selected'],
                ['Episode timing', stringValue('episodeTiming') || 'Not selected'],
                ['Primary diagnosis', stringValue('primaryDiagnosisCode') || 'Not entered'],
                ['Services required', arrayValue('servicesRequired').join(', ') || 'Not selected'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-pearl-200/80 bg-pearl-50/70 p-3 dark:border-charcoal-700 dark:bg-charcoal-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPDGM(false)}
                className="h-10 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
