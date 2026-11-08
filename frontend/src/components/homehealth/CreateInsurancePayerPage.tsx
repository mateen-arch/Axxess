import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Shield,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Upload,
  Calendar,
  Layers,
  Building,
  CreditCard,
  Hash,
  HelpCircle,
  FileCheck2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { InsurancePayer } from '../../types';

interface CreateInsurancePayerPageProps {
  onBack: () => void;
  onPayerCreated?: () => void;
}

type SectionKey = 'payer_details' | 'billing_info' | 'fee_schedule' | 'summary';

interface SectionDef {
  id: SectionKey;
  stepNumber: number;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SECTIONS: SectionDef[] = [
  {
    id: 'payer_details',
    stepNumber: 1,
    label: 'Insurance/Payer Details',
    sublabel: 'Contract, Account Manager & Rules',
    icon: Shield,
  },
  {
    id: 'billing_info',
    stepNumber: 2,
    label: 'Billing Information',
    sublabel: 'UB-04 & HCFA 1500 Form Locators',
    icon: FileText,
  },
  {
    id: 'fee_schedule',
    stepNumber: 3,
    label: 'Fee Schedule',
    sublabel: 'Discipline Task Rates & Modifiers',
    icon: DollarSign,
  },
  {
    id: 'summary',
    stepNumber: 4,
    label: 'Summary & Review',
    sublabel: 'Verification & Final Activation',
    icon: FileCheck2,
  },
];

const CLEARINGHOUSES = ['None', 'Availity', 'ZirMed', 'Claimsnet', 'Axxess'];

const PAYER_TYPES = [
  'Medicare (HMO/managed care)',
  'Medicaid (HMO/managed care)',
  'Medicaid (traditional fee-for-service)',
  'Traditional Medicare (Part A)',
  'Commercial / Private insurance',
  'Private HMO/managed care',
  'Title programs (Title III, V, XX)',
  'Other government (CHAMPUS, VA)',
  'Self-pay',
  'Workers\' compensation',
  'Contract',
  'Unknown',
];

const SOURCE_OF_PAYMENTS = [
  'MA - Medicare Part A',
  'MB - Medicare Part B',
  'MC - Medicaid',
  '09 - Self-pay',
  '11 - Other Non-Federal Programs',
  '12 - Preferred Provider Organization (PPO)',
  '13 - Point of Service (POS)',
  '14 - Exclusive Provider Organization (EPO)',
  '15 - Indemnity Insurance',
  '16 - Health Maintenance Organization (HMO) Medicare Risk',
  'AM - Automobile Medical',
  'BL - Blue Cross/Blue Shield',
  'CH - CHAMPUS',
  'CI - Commercial Insurance Co.',
  'DS - Disability',
  'FI - Federal Employees Program',
  'HM - Health Maintenance Organization',
  'LM - Liability Medical',
  'OF - Other Federal Program',
  'TV - Title V',
  'VA - Veterans Affairs Plan',
  'WC - Workers\' Compensation Health Claim',
];

const BILL_TYPES = [
  '121 - Home - Original claim',
  '321 - Home Health - Admit through Discharge',
  '322 - Home Health - PPS RAP',
  '323 - Home Health - Interim-Continuing Claims',
  '324 - Home Health - Last Claim',
  '327 - Home Health - Adjustment For Insurance',
  '329 - Home Health - PPS Final',
  '331 - Home Health - Admit through Discharge (Not for PPS bills)',
  '332 - Home Health - 1st Claim (Not for PPS bills)',
  '333 - Home Health - Continuing Claim (Not for PPS bills)',
  '334 - Home Health - Last Claim (Not for PPS bills)',
  '341 - OPT - Admit through Discharge',
  '342 - OPT - 1st Claim',
  '343 - OPT - Continuing Claim',
  '344 - OPT - Last Claim',
  '811 - Hospice - Admit through Discharge',
  '812 - Hospice - 1st Claim',
  '813 - Hospice - Continuing Claim',
  '814 - Hospice - Last Claim',
];

interface FeeRateRow {
  id: string;
  task: string;
  description: string;
  revCode: string;
  hcpcs: string;
  expectedRate: string;
  rate: string;
  modifiers: string;
  unitType: 'Per Visit' | 'Hourly' | '15-Minute Unit';
}

const DEFAULT_FEE_RATES: FeeRateRow[] = [
  {
    id: 'fee-1',
    task: 'SN Visit',
    description: 'Skilled Nursing Routine Visit',
    revCode: '0551',
    hcpcs: 'G0154',
    expectedRate: '165.00',
    rate: '185.00',
    modifiers: '',
    unitType: 'Per Visit',
  },
  {
    id: 'fee-2',
    task: 'PT Assessment',
    description: 'Physical Therapy Evaluation',
    revCode: '0421',
    hcpcs: 'G0151',
    expectedRate: '175.00',
    rate: '195.00',
    modifiers: 'GP',
    unitType: 'Per Visit',
  },
  {
    id: 'fee-3',
    task: 'OT Assessment',
    description: 'Occupational Therapy Evaluation',
    revCode: '0431',
    hcpcs: 'G0152',
    expectedRate: '170.00',
    rate: '190.00',
    modifiers: 'GO',
    unitType: 'Per Visit',
  },
  {
    id: 'fee-4',
    task: 'ST Visit',
    description: 'Speech-Language Pathology Assessment',
    revCode: '0441',
    hcpcs: 'G0153',
    expectedRate: '170.00',
    rate: '190.00',
    modifiers: 'GN',
    unitType: 'Per Visit',
  },
  {
    id: 'fee-5',
    task: 'MSW Visit',
    description: 'Medical Social Work Assessment',
    revCode: '0561',
    hcpcs: 'G0155',
    expectedRate: '160.00',
    rate: '180.00',
    modifiers: '',
    unitType: 'Per Visit',
  },
  {
    id: 'fee-6',
    task: 'HHA Visit',
    description: 'Home Health Aide Personal Care',
    revCode: '0571',
    hcpcs: 'G0156',
    expectedRate: '75.00',
    rate: '85.00',
    modifiers: '',
    unitType: 'Per Visit',
  },
];

export const CreateInsurancePayerPage: React.FC<CreateInsurancePayerPageProps> = ({
  onBack,
  onPayerCreated,
}) => {
  const { organization, addInsurancePayer } = useHealthcare();

  // Active Section
  const [activeSection, setActiveSection] = useState<SectionKey>('payer_details');

  // STEP 1: Contract Details
  const [hasContract, setHasContract] = useState<'Yes' | 'No'>('Yes');
  const [contractEffectiveDate, setContractEffectiveDate] = useState<string>('2026-01-01');
  const [contractExpirationDate, setContractExpirationDate] = useState<string>('2027-12-31');
  const [contractDocsCount, setContractDocsCount] = useState<number>(1);
  const [additionalDocsCount, setAdditionalDocsCount] = useState<number>(0);

  // Account Manager
  const [accountManagerFirstName, setAccountManagerFirstName] = useState<string>('Cynthia');
  const [accountManagerLastName, setAccountManagerLastName] = useState<string>('Holloway');
  const [accountManagerPhone1, setAccountManagerPhone1] = useState<string>('800');
  const [accountManagerPhone2, setAccountManagerPhone2] = useState<string>('555');
  const [accountManagerPhone3, setAccountManagerPhone3] = useState<string>('0190');
  const [accountManagerEmail, setAccountManagerEmail] = useState<string>('c.holloway@medicare-partner.com');

  // Insurance / Payer Details
  const [clearinghouse, setClearinghouse] = useState<string>('Availity');
  const [payerName, setPayerName] = useState<string>('Medicare Part A (Traditional Fee-For-Service)');
  const [displayName, setDisplayName] = useState<string>('Medicare A');
  const [payerType, setPayerType] = useState<string>('Traditional Medicare (Part A)');
  const [sourceOfPayment, setSourceOfPayment] = useState<string>('MA - Medicare Part A');
  const [workWeekBegins, setWorkWeekBegins] = useState<'Sunday' | 'Monday'>('Sunday');
  const [billingCycleType, setBillingCycleType] = useState<string>('Bi-Weekly');
  const [visitAuthRequired, setVisitAuthRequired] = useState<'Yes' | 'No'>('No');

  // Identifiers
  const [payerId, setPayerId] = useState<string>('CMS-MED-001');
  const [providerIdCode, setProviderIdCode] = useState<string>('1487920194');
  const [otherProviderId, setOtherProviderId] = useState<string>('');
  const [providerSubscriberId, setProviderSubscriberId] = useState<string>('SUB-982103');
  const [submitterId, setSubmitterId] = useState<string>('SUBMIT-AXX-01');
  const [timelyFilingDays, setTimelyFilingDays] = useState<string>('365');
  const [autoBillingLookBackDays, setAutoBillingLookBackDays] = useState<string>('60');

  // Episodic Billing Rules
  const [episodicTaxonomyCode, setEpisodicTaxonomyCode] = useState<string>('251E00000X');
  const [episodicDescription, setEpisodicDescription] = useState<string>('Home Health Agency PPS Episodic Billing');
  const [episodicElectronicBillType, setEpisodicElectronicBillType] = useState<'Institutional' | 'Professional'>('Institutional');
  const [episodicPaperInvoiceType, setEpisodicPaperInvoiceType] = useState<string>('UB-04');
  const [episodicInitialClaimType, setEpisodicInitialClaimType] = useState<string>('322 - Home Health - PPS RAP');
  const [episodicContinuationClaimType, setEpisodicContinuationClaimType] = useState<string>('323 - Home Health - Interim-Continuing Claims');
  const [episodicFinalClaimType, setEpisodicFinalClaimType] = useState<string>('329 - Home Health - PPS Final');
  const [episodicAdmitOnDischarge, setEpisodicAdmitOnDischarge] = useState<string>('321 - Home Health - Admit through Discharge');

  // Checkboxes & Effective Dates
  const [requirePrePrintedClaim, setRequirePrePrintedClaim] = useState<boolean>(false);
  const [includeServiceLine, setIncludeServiceLine] = useState<boolean>(true);
  const [requireLocationOfServices, setRequireLocationOfServices] = useState<boolean>(true);
  const [requireTimeInAdmission, setRequireTimeInAdmission] = useState<boolean>(false);
  const [socDateNotRequired, setSocDateNotRequired] = useState<boolean>(false);
  const [requireSpecialtyCodes, setRequireSpecialtyCodes] = useState<boolean>(false);
  const [requireOasisExportBeforeFinal, setRequireOasisExportBeforeFinal] = useState<boolean>(true);

  const [requireG0154Rule, setRequireG0154Rule] = useState<boolean>(true);
  const [g0154EffectiveDate, setG0154EffectiveDate] = useState<string>('2020-01-01');

  const [followsPdgm, setFollowsPdgm] = useState<boolean>(true);
  const [pdgmEffectiveDate, setPdgmEffectiveDate] = useState<string>('2020-01-01');

  const [enableNoPayRaps, setEnableNoPayRaps] = useState<boolean>(true);
  const [noPayRapsEffectiveDate, setNoPayRapsEffectiveDate] = useState<string>('2021-01-01');

  const [followCMS2021Rap, setFollowCMS2021Rap] = useState<boolean>(true);
  const [cms2021RapEffectiveDate, setCms2021RapEffectiveDate] = useState<string>('2021-01-01');

  const [requireNoticeOfAdmission, setRequireNoticeOfAdmission] = useState<boolean>(true);
  const [noaEffectiveDate, setNoaEffectiveDate] = useState<string>('2022-01-01');

  const [doesNotRequireRaps, setDoesNotRequireRaps] = useState<boolean>(false);
  const [noRapsEffectiveDate, setNoRapsEffectiveDate] = useState<string>('');

  const [requireG0163G0164, setRequireG0163G0164] = useState<boolean>(false);
  const [g0163EffectiveDate, setG0163EffectiveDate] = useState<string>('');

  // Per Visit Billing Rules
  const [perVisitTaxonomyCode, setPerVisitTaxonomyCode] = useState<string>('251E00000X');
  const [perVisitDescription, setPerVisitDescription] = useState<string>('Fee-For-Service Per-Visit Service Line');
  const [perVisitElectronicBillType, setPerVisitElectronicBillType] = useState<'Institutional' | 'Professional'>('Institutional');
  const [perVisitPaperInvoiceType, setPerVisitPaperInvoiceType] = useState<string>('UB-04');

  // STEP 2: Billing Information (UB-04 & HCFA-1500 Locators)
  const [addressFormat, setAddressFormat] = useState<string>('Address with 5 digit zip, no county');
  const [dateFormat, setDateFormat] = useState<string>('No Separator(MMDDYYYY)');
  const [nameFormat, setNameFormat] = useState<string>('Last Name First Name Middle initial');
  const [currencyFormat, setCurrencyFormat] = useState<string>('Leading Zero');

  const [locator12PatientSignature, setLocator12PatientSignature] = useState<string>('Signature on File');
  const [locator13InsuredSignature, setLocator13InsuredSignature] = useState<string>('Signature on File');
  const [locator14DateOfIllness, setLocator14DateOfIllness] = useState<string>('Start of Care Date (SOC)');
  const [locator17ReferringPhysician, setLocator17ReferringPhysician] = useState<string>('Attending Physician');
  const [locator24JRenderingNpi, setLocator24JRenderingNpi] = useState<string>('Rendering Clinician NPI');
  const [locator25FederalTaxId, setLocator25FederalTaxId] = useState<string>('Agency EIN / Federal Tax ID');
  const [locator26PatientAccountNo, setLocator26PatientAccountNo] = useState<string>('Patient MRN');
  const [locator29AmountPaid, setLocator29AmountPaid] = useState<string>('Blank / Leave Zero');
  const [locator31ClinicianSignature, setLocator31ClinicianSignature] = useState<string>('Agency Director Electronic Signature');
  const [locator32ServiceFacilityLocation, setLocator32ServiceFacilityLocation] = useState<string>('Patient Residence (POS 12)');

  // Form Locators 39-41 (Value Codes)
  const [valueCode39a, setValueCode39a] = useState<string>('61 - CBSA Code');
  const [valueCode39b, setValueCode39b] = useState<string>('Blank');
  const [valueCode40a, setValueCode40a] = useState<string>('Blank');
  const [valueCode41a, setValueCode41a] = useState<string>('Blank');

  // Locators 42-47 (Revenue & Charges)
  const [revenueCodeLocator42, setRevenueCodeLocator42] = useState<string>('Visits and Supplies');
  const [revenueDescriptionLocator43, setRevenueDescriptionLocator43] = useState<string>('Visits and Supplies');
  const [hippsCodeLocator44, setHippsCodeLocator44] = useState<string>('Visits and Supplies');
  const [serviceDateLocator45, setServiceDateLocator45] = useState<string>('Visits and Supplies');
  const [serviceUnitsLocator46, setServiceUnitsLocator46] = useState<string>('Print Only');
  const [totalChargesLocator47, setTotalChargesLocator47] = useState<string>('RAP Displays 100% Total Charge');

  // Payer Names (Locator 50)
  const [payerNameA, setPayerNameA] = useState<string>('Primary Insurance');
  const [payerNameB, setPayerNameB] = useState<string>('Secondary Insurance');
  const [payerNameC, setPayerNameC] = useState<string>('None');

  // STEP 3: Fee Schedule
  const [feeRates, setFeeRates] = useState<FeeRateRow[]>(DEFAULT_FEE_RATES);
  const [cloneExistingPayer, setCloneExistingPayer] = useState<string>('Medicare Standard Baseline');

  // UI state
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Validation
  const isSection1Complete = Boolean(
    payerName.trim() && displayName.trim() && payerId.trim() && providerIdCode.trim()
  );
  const isSection2Complete = Boolean(addressFormat && dateFormat && nameFormat);
  const isSection3Complete = feeRates.length > 0;

  const sectionStatus: Record<SectionKey, boolean> = {
    payer_details: isSection1Complete,
    billing_info: isSection2Complete,
    fee_schedule: isSection3Complete,
    summary: isSection1Complete && isSection2Complete && isSection3Complete,
  };

  const handleRateChange = (id: string, field: 'expectedRate' | 'rate', value: string) => {
    setFeeRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = () => {
    if (!isSection1Complete || !isSection2Complete) {
      setShowErrors(true);
      setActiveSection('payer_details');
      return;
    }

    const newPayer: InsurancePayer = {
      id: `payer-${Date.now()}`,
      payerName: payerName.trim(),
      payerType,
      payerId: payerId.trim(),
      addressLine1: 'PO Box 6744',
      city: 'Lawrence',
      state: 'KS',
      zip: '66044',
      phone: `(${accountManagerPhone1}) ${accountManagerPhone2}-${accountManagerPhone3}`,
      contactName: `${accountManagerFirstName} ${accountManagerLastName}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
      billingInfo: {
        addressFormat,
        dateFormat,
        nameFormat,
        currencyFormat,
        useAnotherTaxNumber: false,
        patientNameIdentifier: 'Last Name',
        patientNameOptions: 'First Name',
        priorityOfVisitInclude: true,
        pointOfOriginInclude: true,
        dischargeHourInclude: true,
        accidentStateInclude: true,
        reservedLocator30: '',
        includePayerNameAddressOnPaper: true,
        valueCode39a,
        valueCode39b,
        valueCode39c: 'Blank',
        valueCode39d: 'Blank',
        valueCode40a,
        valueCode40b: 'Blank',
        valueCode40c: 'Blank',
        valueCode40d: 'Blank',
        valueCode41a,
        valueCode41b: 'Blank',
        valueCode41c: 'Blank',
        valueCode41d: 'Blank',
        revenueCodeLocator42,
        revenueDescriptionLocator43,
        hippsCodeLocator44,
        serviceDateLocator45,
        serviceUnitsLocator46,
        totalChargesLocator47,
        payerNameA,
        payerNameB,
        payerNameC,
        billingProviderNpiLocator56: 'NPI',
        insuredNameA: 'Primary Insurance',
        insuredNameB: 'Secondary Insurance',
        insuredNameC: 'Tertiary Insurance',
        employerNameIncludeLocator65: true,
        codeQualifierLocator66: '0 - ICD-10',
        admittingDiagnosisLocator69: 'Blank',
        reasonForVisitIncludeLocator70: true,
        attendingProviderLocator76: 'Attending Provider',
        operatingPhysicianLocator77: 'Operating Physician',
        otherProviderLocator78: 'Other Operating Physician',
        renderingProviderLocator79: 'Rendering Provider',
        codeField81a: '',
        codeField81b: '',
        codeField81c: '',
        codeField81d: '',
      },
    };

    addInsurancePayer(newPayer);
    setIsSuccess(true);
    setTimeout(() => {
      onPayerCreated?.();
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
                New Insurance / Payer
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Payer Contract, EDI Claim Locators & Fee Schedules
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
          <span>Insurance/Payer "{payerName}" configured successfully! Returning...</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {showErrors && (!isSection1Complete || !isSection2Complete) && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please complete all required fields in Section 1 (Payer Details & IDs) and Section 2 before saving.</span>
        </div>
      )}

      {/* 2. Main Layout with Left Section Navigation (Like AdmitPatientPage) */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Section Navigation Rail */}
        <aside className="w-full shrink-0 border-b lg:border-b-0 lg:w-80 lg:border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 p-4 lg:p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header progress card */}
            <div className="rounded-2xl border border-pearl-200/80 bg-pearl-50/70 p-4 dark:border-charcoal-700/80 dark:bg-charcoal-800/50 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Setup Progress
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {[isSection1Complete, isSection2Complete, isSection3Complete].filter(Boolean).length} / 4
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pearl-200 dark:bg-charcoal-700">
                <div
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{
                    width: `${
                      ([isSection1Complete, isSection2Complete, isSection3Complete].filter(Boolean).length / 4) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Configure payer contract terms, electronic billing formats (UB-04/HCFA 1500), and rate schedules.
              </p>
            </div>

            {/* Section Item Checklist */}
            <nav className="space-y-1.5" aria-label="Insurance setup sections">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                const isComplete = sectionStatus[sec.id];

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition cursor-pointer ${
                      isActive
                        ? 'border border-rose-200 bg-white dark:border-rose-900/60 dark:bg-charcoal-800 shadow-xs'
                        : 'border border-transparent hover:border-pearl-200 hover:bg-pearl-50/80 dark:hover:border-charcoal-750 dark:hover:bg-charcoal-850/60'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-rose-600 text-white'
                          : isComplete
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-pearl-100 text-slate-500 dark:bg-charcoal-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Step {sec.stepNumber}
                        </span>
                        {isComplete && (
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {sec.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {sec.sublabel}
                      </div>
                    </div>

                    <ChevronRight
                      size={15}
                      className={`shrink-0 transition ${
                        isActive ? 'text-rose-600 translate-x-0.5' : 'text-slate-300 dark:text-charcoal-600'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 pt-4 border-t border-pearl-200/80 dark:border-charcoal-700/80 space-y-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Payer: <strong className="text-slate-800 dark:text-slate-200 truncate block">{displayName || 'New Payer'}</strong>
            </div>
            <div className="text-[10px] text-slate-400">Axxess Billing Engine v5.1 • HIPAA 5010 837I / 837P</div>
          </div>
        </aside>

        {/* Right Section Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* STEP 1: Insurance / Payer Details */}
          {activeSection === 'payer_details' && (
            <div className="space-y-6">
              {/* Contract Details Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1.1</span>
                  Contract Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Do you have a contract with this insurance/payer?
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="hasContract"
                          checked={hasContract === 'Yes'}
                          onChange={() => setHasContract('Yes')}
                          className="accent-rose-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="hasContract"
                          checked={hasContract === 'No'}
                          onChange={() => setHasContract('No')}
                          className="accent-rose-600"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contract Effective Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={contractEffectiveDate}
                        onChange={(e) => setContractEffectiveDate(e.target.value)}
                        className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contract Expiration Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={contractExpirationDate}
                        onChange={(e) => setContractExpirationDate(e.target.value)}
                        className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <div className="rounded-xl border border-dashed border-pearl-300 dark:border-charcoal-700 p-4 text-center bg-pearl-50/50 dark:bg-charcoal-900/40">
                      <Upload size={20} className="mx-auto mb-1 text-slate-400" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Contract Documents</div>
                      <div className="text-[11px] text-slate-400">10MB file size limit (PDF, DOCX)</div>
                      <button
                        type="button"
                        onClick={() => setContractDocsCount((c) => c + 1)}
                        className="mt-2 rounded-lg border border-pearl-200 bg-white px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-charcoal-700 dark:bg-charcoal-800"
                      >
                        {contractDocsCount > 0 ? `${contractDocsCount} File Attached` : 'Choose File'}
                      </button>
                    </div>

                    <div className="rounded-xl border border-dashed border-pearl-300 dark:border-charcoal-700 p-4 text-center bg-pearl-50/50 dark:bg-charcoal-900/40">
                      <Upload size={20} className="mx-auto mb-1 text-slate-400" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Additional Documents</div>
                      <div className="text-[11px] text-slate-400">10MB file size limit</div>
                      <button
                        type="button"
                        onClick={() => setAdditionalDocsCount((c) => c + 1)}
                        className="mt-2 rounded-lg border border-pearl-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                      >
                        {additionalDocsCount > 0 ? `${additionalDocsCount} File Attached` : 'Choose File'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Manager Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1.2</span>
                  Account Manager
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">First Name</label>
                    <input
                      type="text"
                      value={accountManagerFirstName}
                      onChange={(e) => setAccountManagerFirstName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                    <input
                      type="text"
                      value={accountManagerLastName}
                      onChange={(e) => setAccountManagerLastName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={3}
                        value={accountManagerPhone1}
                        onChange={(e) => setAccountManagerPhone1(e.target.value.replace(/\D/g, ''))}
                        className="w-14 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        maxLength={3}
                        value={accountManagerPhone2}
                        onChange={(e) => setAccountManagerPhone2(e.target.value.replace(/\D/g, ''))}
                        className="w-14 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={accountManagerPhone3}
                        onChange={(e) => setAccountManagerPhone3(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 h-10 rounded-xl border border-pearl-200 bg-white text-center text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={accountManagerEmail}
                      onChange={(e) => setAccountManagerEmail(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </section>

              {/* Insurance / Payer Details Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1.3</span>
                  Insurance/Payer Details
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Clearinghouse</label>
                    <select
                      value={clearinghouse}
                      onChange={(e) => setClearinghouse(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {CLEARINGHOUSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Insurance/Payer Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="e.g. Medicare Traditional Part A"
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Display Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Medicare A"
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Insurance/Payer Type</label>
                    <select
                      value={payerType}
                      onChange={(e) => setPayerType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {PAYER_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Source of Payment</label>
                    <select
                      value={sourceOfPayment}
                      onChange={(e) => setSourceOfPayment(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {SOURCE_OF_PAYMENTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Work Week Begins</label>
                    <select
                      value={workWeekBegins}
                      onChange={(e) => setWorkWeekBegins(e.target.value as 'Sunday' | 'Monday')}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Billing Cycle Type</label>
                    <select
                      value={billingCycleType}
                      onChange={(e) => setBillingCycleType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Bi-Monthly'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Visit Authorization Required</label>
                    <div className="flex items-center gap-6 h-10">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="visitAuthRequired"
                          checked={visitAuthRequired === 'Yes'}
                          onChange={() => setVisitAuthRequired('Yes')}
                          className="accent-rose-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="visitAuthRequired"
                          checked={visitAuthRequired === 'No'}
                          onChange={() => setVisitAuthRequired('No')}
                          className="accent-rose-600"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Identifiers Grid */}
                <div className="mt-5 border-t border-pearl-100 dark:border-charcoal-700 pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Insurance/Payer ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={payerId}
                      onChange={(e) => setPayerId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Provider ID / Code <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={providerIdCode}
                      onChange={(e) => setProviderIdCode(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Other Provider ID</label>
                    <input
                      type="text"
                      value={otherProviderId}
                      onChange={(e) => setOtherProviderId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Provider Subscriber ID</label>
                    <input
                      type="text"
                      value={providerSubscriberId}
                      onChange={(e) => setProviderSubscriberId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Submitter ID</label>
                    <input
                      type="text"
                      value={submitterId}
                      onChange={(e) => setSubmitterId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Timely Filing (Days)</label>
                    <input
                      type="number"
                      value={timelyFilingDays}
                      onChange={(e) => setTimelyFilingDays(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Auto-Billing End Date Look-Back Days
                    </label>
                    <input
                      type="number"
                      value={autoBillingLookBackDays}
                      onChange={(e) => setAutoBillingLookBackDays(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </section>

              {/* Episodic Billing Rules Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">1.4</span>
                  Episodic Billing Rules (CMS PPS / PDGM)
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Taxonomy Code</label>
                    <input
                      type="text"
                      value={episodicTaxonomyCode}
                      onChange={(e) => setEpisodicTaxonomyCode(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                    <input
                      type="text"
                      value={episodicDescription}
                      onChange={(e) => setEpisodicDescription(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Electronic Bill Type</label>
                    <select
                      value={episodicElectronicBillType}
                      onChange={(e) => setEpisodicElectronicBillType(e.target.value as 'Institutional' | 'Professional')}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Institutional">Institutional (837I)</option>
                      <option value="Professional">Professional (837P)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Paper Invoice Type</label>
                    <select
                      value={episodicPaperInvoiceType}
                      onChange={(e) => setEpisodicPaperInvoiceType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {['None', 'UB-04', 'HCFA 1500', 'Invoice'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Initial Claim Bill Type</label>
                    <select
                      value={episodicInitialClaimType}
                      onChange={(e) => setEpisodicInitialClaimType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {BILL_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Continuation Claim Bill Type</label>
                    <select
                      value={episodicContinuationClaimType}
                      onChange={(e) => setEpisodicContinuationClaimType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {BILL_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Final Claim Bill Type</label>
                    <select
                      value={episodicFinalClaimType}
                      onChange={(e) => setEpisodicFinalClaimType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {BILL_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Admit on Discharge Bill Type</label>
                    <select
                      value={episodicAdmitOnDischarge}
                      onChange={(e) => setEpisodicAdmitOnDischarge(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {BILL_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Episodic Rule Checkboxes with Effective Dates */}
                <div className="mt-5 border-t border-pearl-100 dark:border-charcoal-700 pt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requirePrePrintedClaim}
                        onChange={(e) => setRequirePrePrintedClaim(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Check here if this payer requires a pre-printed claim form</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={includeServiceLine}
                        onChange={(e) => setIncludeServiceLine(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Include home health service line default</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requireLocationOfServices}
                        onChange={(e) => setRequireLocationOfServices(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Report 'Location of Services' line item next to first billable visit</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requireTimeInAdmission}
                        onChange={(e) => setRequireTimeInAdmission(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Check here if 'Time-in of admission' is required</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={socDateNotRequired}
                        onChange={(e) => setSocDateNotRequired(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Date of Admission / SOC is not required</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requireSpecialtyCodes}
                        onChange={(e) => setRequireSpecialtyCodes(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Payer requires Provider Specialty Codes</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requireOasisExportBeforeFinal}
                        onChange={(e) => setRequireOasisExportBeforeFinal(e.target.checked)}
                        className="accent-rose-600"
                      />
                      <span>Payer requires OASIS exported before Final Claim submission</span>
                    </label>
                  </div>

                  {/* Effective Date Rows */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-pearl-100 dark:border-charcoal-700">
                    <div className="flex items-center justify-between rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-800">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={followsPdgm}
                          onChange={(e) => setFollowsPdgm(e.target.checked)}
                          className="accent-rose-600"
                        />
                        Follows PDGM billing
                      </label>
                      <input
                        type="date"
                        value={pdgmEffectiveDate}
                        onChange={(e) => setPdgmEffectiveDate(e.target.value)}
                        className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-800">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireNoticeOfAdmission}
                          onChange={(e) => setRequireNoticeOfAdmission(e.target.checked)}
                          className="accent-rose-600"
                        />
                        Requires Notice of Admission (NOA)
                      </label>
                      <input
                        type="date"
                        value={noaEffectiveDate}
                        onChange={(e) => setNoaEffectiveDate(e.target.value)}
                        className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-800">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableNoPayRaps}
                          onChange={(e) => setEnableNoPayRaps(e.target.checked)}
                          className="accent-rose-600"
                        />
                        Enable no-pay RAPs
                      </label>
                      <input
                        type="date"
                        value={noPayRapsEffectiveDate}
                        onChange={(e) => setNoPayRapsEffectiveDate(e.target.value)}
                        className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-pearl-50 p-2.5 dark:bg-charcoal-800">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireG0154Rule}
                          onChange={(e) => setRequireG0154Rule(e.target.checked)}
                          className="accent-rose-600"
                        />
                        G0154 Rule Change (Skilled Nursing)
                      </label>
                      <input
                        type="date"
                        value={g0154EffectiveDate}
                        onChange={(e) => setG0154EffectiveDate(e.target.value)}
                        className="h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Bottom Continue Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('billing_info')}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  <span>Continue to Billing Locators</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Billing Information (UB-04 & HCFA-1500 Form Locators) */}
          {activeSection === 'billing_info' && (
            <div className="space-y-6">
              {/* Form Formats Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">2.1</span>
                  Claim Form Formats
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Address Format</label>
                    <select
                      value={addressFormat}
                      onChange={(e) => setAddressFormat(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Address with 5 digit zip, no county">Address with 5 digit zip, no county</option>
                      <option value="Address with 9 digit zip">Address with 9 digit zip</option>
                      <option value="Standard full address with county">Standard full address with county</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Date Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="No Separator(MMDDYYYY)">No Separator (MMDDYYYY)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYMMDD">YYMMDD</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Name Format</label>
                    <select
                      value={nameFormat}
                      onChange={(e) => setNameFormat(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Last Name First Name Middle initial">Last Name First Name Middle initial</option>
                      <option value="Last Name, First Name">Last Name, First Name</option>
                      <option value="First Name Last Name">First Name Last Name</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Currency Format</label>
                    <select
                      value={currencyFormat}
                      onChange={(e) => setCurrencyFormat(e.target.value)}
                      className="w-full h-10 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Leading Zero">Leading Zero ($0.00)</option>
                      <option value="No Decimal ($1234)">No Decimal</option>
                      <option value="Standard Comma Formatted">Standard Comma Formatted</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Form Locators Mapping Panel */}
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">2.2</span>
                  UB-04 / CMS-1450 & HCFA-1500 Form Locators
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 12: Patient Signature
                    </label>
                    <input
                      type="text"
                      value={locator12PatientSignature}
                      onChange={(e) => setLocator12PatientSignature(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 13: Insured Signature
                    </label>
                    <input
                      type="text"
                      value={locator13InsuredSignature}
                      onChange={(e) => setLocator13InsuredSignature(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 14: Date of Illness / SOC
                    </label>
                    <input
                      type="text"
                      value={locator14DateOfIllness}
                      onChange={(e) => setLocator14DateOfIllness(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 17: Referring Physician
                    </label>
                    <input
                      type="text"
                      value={locator17ReferringPhysician}
                      onChange={(e) => setLocator17ReferringPhysician(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 24J: Rendering NPI
                    </label>
                    <input
                      type="text"
                      value={locator24JRenderingNpi}
                      onChange={(e) => setLocator24JRenderingNpi(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 25: Federal Tax ID
                    </label>
                    <input
                      type="text"
                      value={locator25FederalTaxId}
                      onChange={(e) => setLocator25FederalTaxId(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 26: Patient Account / MRN
                    </label>
                    <input
                      type="text"
                      value={locator26PatientAccountNo}
                      onChange={(e) => setLocator26PatientAccountNo(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 29: Amount Paid
                    </label>
                    <input
                      type="text"
                      value={locator29AmountPaid}
                      onChange={(e) => setLocator29AmountPaid(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Locator 32: Service Location
                    </label>
                    <input
                      type="text"
                      value={locator32ServiceFacilityLocation}
                      onChange={(e) => setLocator32ServiceFacilityLocation(e.target.value)}
                      className="w-full h-9 rounded-xl border border-pearl-200 bg-white px-3 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Value Codes 39-41 */}
                <div className="mt-5 border-t border-pearl-100 dark:border-charcoal-700 pt-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Locators 39–41: Value Codes & Rates
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">39a</span>
                      <input
                        type="text"
                        value={valueCode39a}
                        onChange={(e) => setValueCode39a(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">39b</span>
                      <input
                        type="text"
                        value={valueCode39b}
                        onChange={(e) => setValueCode39b(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">40a</span>
                      <input
                        type="text"
                        value={valueCode40a}
                        onChange={(e) => setValueCode40a(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">41a</span>
                      <input
                        type="text"
                        value={valueCode41a}
                        onChange={(e) => setValueCode41a(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Line Columns 42-47 */}
                <div className="mt-5 border-t border-pearl-100 dark:border-charcoal-700 pt-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Locators 42–47: Revenue Codes, Service Dates & Charges
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">42: Revenue Code</span>
                      <input
                        type="text"
                        value={revenueCodeLocator42}
                        onChange={(e) => setRevenueCodeLocator42(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">44: HIPPS Code</span>
                      <input
                        type="text"
                        value={hippsCodeLocator44}
                        onChange={(e) => setHippsCodeLocator44(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">47: Total Charges</span>
                      <input
                        type="text"
                        value={totalChargesLocator47}
                        onChange={(e) => setTotalChargesLocator47(e.target.value)}
                        className="w-full h-8 rounded-lg border border-pearl-200 bg-white px-2 text-xs text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('payer_details')}
                  className="rounded-xl border border-pearl-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                >
                  Back to Payer Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('fee_schedule')}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  <span>Continue to Fee Schedule</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Fee Schedule */}
          {activeSection === 'fee_schedule' && (
            <div className="space-y-6">
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">3</span>
                      Discipline Task Rates & Fee Schedule
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Standard reimbursement rates, expected revenues, and modifier configurations for this payer.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Clone Rates:</span>
                    <select
                      value={cloneExistingPayer}
                      onChange={(e) => setCloneExistingPayer(e.target.value)}
                      className="h-8 rounded-lg border border-pearl-200 bg-white px-2.5 text-xs text-slate-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    >
                      <option value="Medicare Standard Baseline">Medicare Standard Baseline</option>
                      <option value="MassHealth Standard Fee">MassHealth Standard Fee</option>
                      <option value="Commercial PPO Average">Commercial PPO Average</option>
                    </select>
                  </div>
                </div>

                {/* Rates Table */}
                <div className="overflow-x-auto rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-pearl-50 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-charcoal-800 dark:text-slate-400 border-b border-pearl-200 dark:border-charcoal-700">
                      <tr>
                        <th className="px-4 py-3">Task</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-3 py-3">Rev Code</th>
                        <th className="px-3 py-3">HCPCS</th>
                        <th className="px-4 py-3">Expected Rate ($)</th>
                        <th className="px-4 py-3">Billed Rate ($)</th>
                        <th className="px-3 py-3">Unit Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                      {feeRates.map((row) => (
                        <tr key={row.id} className="hover:bg-pearl-50/50 dark:hover:bg-charcoal-800/40">
                          <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {row.task}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                            {row.description}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                            {row.revCode}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                            {row.hcpcs}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              value={row.expectedRate}
                              onChange={(e) => handleRateChange(row.id, 'expectedRate', e.target.value)}
                              className="w-24 h-8 rounded-lg border border-pearl-200 bg-white px-2 text-right text-xs font-semibold text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              value={row.rate}
                              onChange={(e) => handleRateChange(row.id, 'rate', e.target.value)}
                              className="w-24 h-8 rounded-lg border border-pearl-200 bg-white px-2 text-right text-xs font-semibold text-rose-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-rose-400"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                            {row.unitType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('billing_info')}
                  className="rounded-xl border border-pearl-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                >
                  Back to Billing Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('summary')}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  <span>Review Summary</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Review */}
          {activeSection === 'summary' && (
            <div className="space-y-6">
              <section className="glass-panel rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
                <div className="flex items-center justify-between mb-4 border-b border-pearl-100 dark:border-charcoal-750 pb-3">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-rose-600" />
                      Insurance / Payer Configuration Summary
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Verify all payer specifications, billing formats, and fee rates prior to activation.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ready for EDI Transmission
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Payer Card */}
                  <div className="rounded-xl border border-pearl-200 bg-pearl-50/60 p-4 dark:border-charcoal-700 dark:bg-charcoal-800/50 space-y-2.5 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">
                      Payer & Contract
                    </h3>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payer Name:</span>
                      <strong className="text-slate-900 dark:text-white">{payerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Display Name:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Clearinghouse:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{clearinghouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payer ID / Provider ID:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{payerId} / {providerIdCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contract Term:</span>
                      <span>{hasContract === 'Yes' ? `${contractEffectiveDate} to ${contractExpirationDate}` : 'No Contract'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Manager:</span>
                      <span>{accountManagerFirstName} {accountManagerLastName}</span>
                    </div>
                  </div>

                  {/* EDI Locators Card */}
                  <div className="rounded-xl border border-pearl-200 bg-pearl-50/60 p-4 dark:border-charcoal-700 dark:bg-charcoal-800/50 space-y-2.5 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">
                      Billing & Claim Locators
                    </h3>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Electronic Bill Type:</span>
                      <strong className="text-slate-900 dark:text-white">{episodicElectronicBillType} (UB-04)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Initial Claim Type:</span>
                      <span className="truncate max-w-[200px] text-slate-800 dark:text-slate-200">{episodicInitialClaimType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PDGM Billing:</span>
                      <span className="font-bold text-emerald-600">{followsPdgm ? 'Enabled (2020-01-01)' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Notice of Admission (NOA):</span>
                      <span className="font-bold text-emerald-600">{requireNoticeOfAdmission ? 'Required' : 'Not Required'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timely Filing:</span>
                      <span>{timelyFilingDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Discipline Rates:</span>
                      <span>{feeRates.length} Service Codes Configured</span>
                    </div>
                  </div>
                </div>

                {/* Final Submit Bar */}
                <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-pearl-100 pt-5 dark:border-charcoal-700">
                  <button
                    type="button"
                    onClick={onBack}
                    className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-pearl-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="h-10 rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                  >
                    Complete Insurance/Payer Setup
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
