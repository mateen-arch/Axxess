import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  FileCheck,
  FileText,
  Hospital,
  LayoutGrid,
  MessageSquare,
  Moon,
  Pill,
  Plus,
  Search,
  Shield,
  Sparkles,
  Sun,
  UserPlus,
  Stethoscope,
  AlertTriangle,
  Microscope,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { HomeHealthSidebar } from '../homehealth/HomeHealthSidebar';
import { HomeHealthDashboard } from '../homehealth/HomeHealthDashboard';
import { HomeHealthComingSoon } from '../homehealth/HomeHealthComingSoon';
import { HomeHealthMessageDialog } from '../homehealth/HomeHealthMessageDialog';
import {
  AdmitPatientPage,
  createInitialPatientAdmissionForm,
  type PatientAdmissionFormData,
} from '../homehealth/AdmitPatientPage';
import { CreateEpisodePage } from '../homehealth/CreateEpisodePage';
import { ComposeMessagePage } from '../homehealth/ComposeMessagePage';
import { CreateCommunicationNotePage } from '../homehealth/CreateCommunicationNotePage';
import { CreateOrderPage } from '../homehealth/CreateOrderPage';
import { CreateFaceToFaceEncounterPage } from '../homehealth/CreateFaceToFaceEncounterPage';
import { CreateFacilityPage } from '../homehealth/CreateFacilityPage';
import { CreatePharmacyPage } from '../homehealth/CreatePharmacyPage';
import { CreateInsurancePayerPage } from '../homehealth/CreateInsurancePayerPage';
import { CreatePhysicianPage } from '../homehealth/CreatePhysicianPage';
import { CreateIncidentLogPage } from '../homehealth/CreateIncidentLogPage';
import { CreateInfectionLogPage } from '../homehealth/CreateInfectionLogPage';
import { EditProfilePage } from '../homehealth/EditProfilePage';
import { ResetSignatureModal } from '../homehealth/ResetSignatureModal';
import { SwitchToHomecareModal } from '../homehealth/SwitchToHomecareModal';
import { MyMessagesView } from '../homehealth/MyMessagesView';
import { MyScheduleTasksView } from '../homehealth/MyScheduleTasksView';
import { MyMonthlyCalendarView } from '../homehealth/MyMonthlyCalendarView';
import { QualityAssuranceCenterView } from '../homehealth/QualityAssuranceCenterView';
import { PatientListView } from '../homehealth/PatientListView';
import { EditPatientPage } from '../homehealth/EditPatientPage';
import { ContactListView } from '../homehealth/ContactListView';
import { TagListView } from '../homehealth/TagListView';
import { TemplateListView } from '../homehealth/TemplateListView';
import { NonAdmitReasonsView } from '../homehealth/NonAdmitReasonsView';
import { FacilityListView } from '../homehealth/FacilityListView';
import { EditFacilityPage } from '../homehealth/EditFacilityPage';
import { SuppliesListView } from '../homehealth/SuppliesListView';
import { PharmaciesListView } from '../homehealth/PharmaciesListView';
import { EditPharmacyPage } from '../homehealth/EditPharmacyPage';
import { PhysiciansListView } from '../homehealth/PhysiciansListView';
import { EditPhysicianPage } from '../homehealth/EditPhysicianPage';
import { InsurancesPayersListView } from '../homehealth/InsurancesPayersListView';
import { EditInsurancePayerPage } from '../homehealth/EditInsurancePayerPage';
import { UsersListView } from '../homehealth/UsersListView';
import { IncidentLogsListView } from '../homehealth/IncidentLogsListView';
import { InfectionLogsListView } from '../homehealth/InfectionLogsListView';
import { CommunicationNotesListView } from '../homehealth/CommunicationNotesListView';
import { MissedVisitsListView } from '../homehealth/MissedVisitsListView';
import { ImmunizationLogsListView } from '../homehealth/ImmunizationLogsListView';
import { BlankFormsView } from '../homehealth/BlankFormsView';
import { NotExportedOasisView } from '../homehealth/NotExportedOasisView';
import { PastDueRecertificationsReportView } from '../homehealth/PastDueRecertificationsReportView';
import { UpcomingRecertsView } from '../homehealth/UpcomingRecertsView';
import { OrdersPendingCoSignatureView } from '../homehealth/OrdersPendingCoSignatureView';
import { OrdersToBeSentView } from '../homehealth/OrdersToBeSentView';
import { OrdersPendingMdSignatureView } from '../homehealth/OrdersPendingMdSignatureView';
import { OrdersHistoryView } from '../homehealth/OrdersHistoryView';
import { PrintQueueView } from '../homehealth/PrintQueueView';
import { OrdersManagementView } from '../homehealth/OrdersManagementView';
import { PatientChartsView } from '../patients/PatientChartsView';
import { PendingAdmissionsView } from '../homehealth/PendingAdmissionsView';
import { NonAdmittedPatientsView } from '../homehealth/NonAdmittedPatientsView';
import { DeletedPatientsView } from '../homehealth/DeletedPatientsView';
import { HospitalizationHistoryView } from '../homehealth/HospitalizationHistoryView';
import { InpatientFacilityHoldListView } from '../homehealth/InpatientFacilityHoldListView';
import { AppSwitcherModal } from '../portal/AppSwitcherModal';
import { HOME_HEALTH_PAGE_TITLES } from '../homehealth/homeHealthNavigation';
import type { MessageItem } from '../../types';

export const AxxessHomeHealthApp: React.FC = () => {
  const {
    organization,
    theme,
    toggleTheme,
    messages,
    patients,
    addNewPatient,
    setIsCommandPaletteOpen,
  } = useHealthcare();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedEditPatientId, setSelectedEditPatientId] = useState<string>('p-1061');
  const [selectedEditFacilityId, setSelectedEditFacilityId] = useState<string>('fac-1');
  const [selectedEditPharmacyId, setSelectedEditPharmacyId] = useState<string>('ph-1');
  const [selectedEditPhysicianId, setSelectedEditPhysicianId] = useState<string>('phy-1');
  const [selectedEditInsurancePayerId, setSelectedEditInsurancePayerId] = useState<string>('pay-1');
  const [selectedEditUserId, setSelectedEditUserId] = useState<string>('usr-1');
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isResetSignatureModalOpen, setIsResetSignatureModalOpen] = useState(false);
  const [isSwitchHomecareModalOpen, setIsSwitchHomecareModalOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState<MessageItem | null>(null);

  const lastNumericMrn = patients
    .map((patient) => Number(patient.mrn))
    .filter((mrn) => Number.isSafeInteger(mrn) && mrn >= 0);
  const [lastMrnUsed, setLastMrnUsed] = useState(() => Math.max(1203, ...lastNumericMrn));
  const [admissionDraft, setAdmissionDraft] = useState<PatientAdmissionFormData>(() =>
    createInitialPatientAdmissionForm(String(lastMrnUsed + 1))
  );
  const [admissionDraftSaved, setAdmissionDraftSaved] = useState(false);

  const customPageTitles: Record<string, string> = {
    dashboard: 'My Dashboard',
    'create-patient': 'New Patient Admission',
    'create-episode': 'New Episode',
    'create-order': 'Physician Order',
    'create-face-to-face-encounter': 'Face-to-Face Encounter',
    'orders-management': 'Orders & Face-to-Face Management',
    'compose-message': 'Compose Message',
    'create-communication-note': 'Communication Note',
    'create-facility': 'New Facility',
    'create-pharmacy': 'New Pharmacy',
    'create-insurance-payer': 'New Insurance / Payer',
    'create-physician': 'New Physician',
    'create-incident-log': 'Incident Log',
    'create-infection-log': 'Infection Log',
    'patient-charts': 'Patient Charts',
    'pending-admissions': 'Pending Admissions',
    'non-admissions': 'Non-Admissions',
    'deleted-patients': 'Deleted Patients',
    'hospitalization-history': 'Hospitalization History',
    'inpatient-facility-hold-list': 'Inpatient Facility and Hold List',
    'my-schedule-tasks': 'My Schedule / Tasks',
    'schedule-unassigned-visits': 'Schedule Unassigned Visits',
    'schedule-center': 'Schedule Center',
    'reassign-schedule': 'Reassign Schedule',
    'unscheduled-visits-report': 'Unscheduled Visits Report',
    'schedule-report': 'Schedule Report',
    'schedule-deviation-report': 'Schedule Deviation Report',
    'report-center': 'Report Center',
    'completed-reports': 'Completed Reports',
    'upcoming-recerts': 'Upcoming Recerts',
    'past-due-recertifications-report': 'Past Due Recertifications Report',
    'not-exported-oasis': 'Not Exported OASIS',
    'orders-pending-co-signature': 'Orders Pending RN Co-Signature',
    'orders-to-be-sent': 'Orders To Be Sent',
    'orders-pending-md-signature': 'Orders Pending MD Signature',
    'orders-history': 'Order History',
    'blank-forms': 'Blank Forms',
    'print-queue': 'Print Queue',
    'qa-center': 'Quality Assurance (QA) Center',
    'list-patients': 'Patient List',
    'edit-patient': 'Edit Patient',
    'list-contacts': 'List Contacts',
    'list-tags': 'Tags',
    'list-templates': 'Templates',
    'list-non-admit-reasons': 'Non-Admit Reasons',
    'list-facilities': 'Facilities',
    'edit-facility': 'Edit Facility',
    'list-supplies': 'Supplies',
    'list-pharmacies': 'Pharmacies',
    'edit-pharmacy': 'Edit Pharmacy',
    'list-physicians': 'Physicians',
    'edit-physician': 'Edit Physician',
    'list-insurances-payers': 'Insurances / Payers',
    'edit-insurance-payer': 'Edit Insurance / Payer',
    'list-users': 'Users',
    'list-incident-logs': 'Incident Logs',
    'list-infection-logs': 'Infection Logs',
    'list-communication-notes': 'Communication Notes',
    'list-missed-visits': 'Missed Visits',
    'list-immunization-logs': 'Immunization Logs',
    'my-account': 'My Account',
    'edit-profile': 'Edit Profile',
    'reset-signature': 'Reset Signature',
    'switch-to-homecare': 'Switch to Homecare',
    'my-messages': 'My Messages',
    'my-monthly-calendar': 'My Monthly Calendar',
    'user-community': 'User Community',
    'help-center': 'Help Center',
    'on-demand-training': 'On-Demand Training',
    'recent-software-updates': 'Recent Software Updates',
    'covid-19-resource-center': 'COVID-19 Resource Center',
    'follow-axxess': 'Follow Axxess',
    'ask-axxess': 'Ask Axxess',
  };

  const currentPageTitle =
    customPageTitles[currentTab] ||
    HOME_HEALTH_PAGE_TITLES[currentTab] ||
    'Home Health Workspace';

  const unreadHomeHealthMessages = messages.filter(
    (message) => message.serviceLine === 'home_health' && !message.isRead
  );
  const latestHomeHealthMessage = messages.find((message) => message.serviceLine === 'home_health');

  const saveAdmissionDraft = () => setAdmissionDraftSaved(true);
  const exitAdmissionDraft = () => setCurrentTab('dashboard');
  const discardAdmissionDraft = () => {
    setAdmissionDraft(createInitialPatientAdmissionForm(String(lastMrnUsed + 1)));
    setAdmissionDraftSaved(false);
    setCurrentTab('dashboard');
  };

  const completeAdmission = () => {
    const text = (key: string) =>
      typeof admissionDraft[key] === 'string' ? (admissionDraft[key] as string) : '';
    const date = new Date();
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    const dob = text('dob');
    const birth = dob ? new Date(`${dob}T00:00:00`) : null;
    let age =
      birth && !Number.isNaN(birth.getTime())
        ? Math.max(0, date.getFullYear() - birth.getFullYear())
        : undefined;
    if (
      age !== undefined &&
      age > 0 &&
      birth &&
      (date.getMonth() < birth.getMonth() ||
        (date.getMonth() === birth.getMonth() && date.getDate() < birth.getDate()))
    ) {
      age -= 1;
    }
    const sameMailing = admissionDraft.sameMailingAddress === true;
    const sameContact = admissionDraft.primaryContactSameAddress === true;
    const details: PatientAdmissionFormData = {
      ...admissionDraft,
      mailingAddress1: sameMailing ? text('primaryAddress1') : text('mailingAddress1'),
      mailingAddress2: sameMailing ? text('primaryAddress2') : text('mailingAddress2'),
      mailingZip: sameMailing ? text('primaryZip') : text('mailingZip'),
      mailingZip4: sameMailing ? text('primaryZip4') : text('mailingZip4'),
      mailingCounty: sameMailing ? text('primaryCounty') : text('mailingCounty'),
      mailingCity: sameMailing ? text('primaryCity') : text('mailingCity'),
      mailingState: sameMailing ? text('primaryState') : text('mailingState'),
      primaryContactAddress1: sameContact ? text('primaryAddress1') : text('primaryContactAddress1'),
      primaryContactAddress2: sameContact ? text('primaryAddress2') : text('primaryContactAddress2'),
      primaryContactCity: sameContact ? text('primaryCity') : text('primaryContactCity'),
      primaryContactState: sameContact ? text('primaryState') : text('primaryContactState'),
      primaryContactZip: sameContact ? text('primaryZip') : text('primaryContactZip'),
      primaryContactZip4: sameContact ? text('primaryZip4') : text('primaryContactZip4'),
      primaryContactCounty: sameContact ? text('primaryCounty') : text('primaryContactCounty'),
      evacuationAddress1:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryAddress1')
            : text('primaryContactAddress1')
          : text('evacuationAddress1'),
      evacuationAddress2:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryAddress2')
            : text('primaryContactAddress2')
          : text('evacuationAddress2'),
      evacuationCity:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryCity')
            : text('primaryContactCity')
          : text('evacuationCity'),
      evacuationState:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryState')
            : text('primaryContactState')
          : text('evacuationState'),
      evacuationZip:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryZip')
            : text('primaryContactZip')
          : text('evacuationZip'),
      evacuationCounty:
        admissionDraft.evacuationSameAsContact === true
          ? sameContact
            ? text('primaryCounty')
            : text('primaryContactCounty')
          : text('evacuationCounty'),
      evacuationMobile:
        admissionDraft.evacuationSameAsContact === true
          ? text('primaryContactMobile')
          : text('evacuationMobile'),
      evacuationAlternate:
        admissionDraft.evacuationSameAsContact === true
          ? text('primaryContactAlternate')
          : text('evacuationAlternate'),
    };
    const additionalContactCount = Number(text('additionalContactCount') || '0');
    for (let contactNumber = 1; contactNumber <= additionalContactCount; contactNumber += 1) {
      if (admissionDraft[`additionalContact${contactNumber}SameAddress`] === true) {
        for (const [suffix, primarySuffix] of Object.entries({
          Address1: 'Address1',
          Address2: 'Address2',
          Zip: 'Zip',
          Zip4: 'Zip4',
          County: 'County',
          City: 'City',
          State: 'State',
        })) {
          details[`additionalContact${contactNumber}${suffix}`] = text(`primary${primarySuffix}`);
        }
      }
    }
    addNewPatient({
      mrn: text('mrn'),
      firstName: text('firstName'),
      lastName: text('lastName'),
      dob,
      age,
      gender:
        text('sex').toLowerCase() === 'male'
          ? 'male'
          : text('sex').toLowerCase() === 'female'
          ? 'female'
          : 'other',
      serviceLine: 'home_health',
      status: 'active',
      primaryDiagnosis: [text('primaryDiagnosisCode'), text('primaryDiagnosisName')]
        .filter(Boolean)
        .join(' · '),
      phone: text('mobile'),
      altPhone: text('alternatePhone') || undefined,
      address: {
        street: [text('primaryAddress1'), text('primaryAddress2')].filter(Boolean).join(', '),
        city: text('primaryCity'),
        state: text('primaryState'),
        zipCode: text('primaryZip'),
      },
      admissionDate: localDate,
      assignedNurseName: text('assignedClinician') || undefined,
      organization: organization.name,
      branch: text('branch'),
      startOfCareDate: text('startOfCareDate'),
      episodeStart: text('episodeStartDate'),
      attendingPhysician:
        text('attendingPhysician') === 'New Physician'
          ? text('newPhysicianName')
          : text('attendingPhysician'),
      insuranceName: text('primaryInsurance'),
      insuranceId: text('mbi') || text('medicaidNumber') || undefined,
      primaryContactName: [text('primaryContactFirstName'), text('primaryContactLastName')]
        .filter(Boolean)
        .join(' '),
      primaryContactPhone: text('primaryContactMobile'),
      primaryContactRelation: text('primaryContactRelationship'),
      admissionDetails: details,
    });
    const numericMrn = Number(text('mrn'));
    const updatedLastMrnUsed = Number.isSafeInteger(numericMrn)
      ? Math.max(lastMrnUsed, numericMrn)
      : lastMrnUsed;
    setLastMrnUsed(updatedLastMrnUsed);
    setAdmissionDraft(createInitialPatientAdmissionForm(String(updatedLastMrnUsed + 1)));
    setAdmissionDraftSaved(false);
    setCurrentTab('dashboard');
  };

  const isCreationTab = [
    'create-patient',
    'create-episode',
    'create-order',
    'create-face-to-face-encounter',
    'compose-message',
    'create-communication-note',
    'create-facility',
    'create-pharmacy',
    'create-insurance-payer',
    'create-physician',
    'create-incident-log',
    'create-infection-log',
    'edit-profile',
    'my-account',
    'my-messages',
    'my-schedule-tasks',
    'my-monthly-calendar',
    'qa-center',
    'list-patients',
    'edit-patient',
    'list-contacts',
    'list-tags',
    'list-templates',
    'list-non-admit-reasons',
    'list-facilities',
    'edit-facility',
    'list-supplies',
    'list-pharmacies',
    'edit-pharmacy',
    'list-physicians',
    'edit-physician',
    'list-insurances-payers',
    'edit-insurance-payer',
    'list-users',
    'list-incident-logs',
    'list-infection-logs',
    'list-communication-notes',
    'list-missed-visits',
    'list-immunization-logs',
    'blank-forms',
    'not-exported-oasis',
    'past-due-recertifications-report',
    'upcoming-recerts',
    'orders-pending-co-signature',
    'orders-to-be-sent',
    'orders-pending-md-signature',
    'orders-history',
    'print-queue',
    'patient-charts',
    'pending-admissions',
    'non-admissions',
    'deleted-patients',
    'hospitalization-history',
    'inpatient-facility-hold-list',
  ].includes(currentTab);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* 1. Unified Collapsible Modern Sidebar */}
      <HomeHealthSidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'reset-signature') {
            setIsResetSignatureModalOpen(true);
            return;
          }
          if (tab === 'switch-to-homecare') {
            setIsSwitchHomecareModalOpen(true);
            return;
          }
          if (tab === 'my-account') {
            setCurrentTab('edit-profile');
            return;
          }
          setCurrentTab(tab);
        }}
      />

      {/* 2. Main Work Area */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Modern Sticky Top Header */}
        <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-pearl-200 bg-white/80 px-3 backdrop-blur-xl transition-colors dark:border-charcoal-700 dark:bg-charcoal-900/80 sm:gap-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsAppSwitcherOpen(true)}
              className="flex h-9 items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-100 px-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:text-rose-300 cursor-pointer"
              aria-label="Open Axxess apps"
              title="Open Axxess apps"
            >
              <LayoutGrid size={15} className="text-rose-600 dark:text-rose-400" />
              <span className="hidden md:inline">Apps</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="whitespace-nowrap text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                Axxess Home Health
              </h1>
              {currentTab !== 'dashboard' && (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    {currentPageTitle}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="hidden min-w-0 max-w-md flex-1 sm:block">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex h-9 w-full items-center gap-2 rounded-xl border border-pearl-200 bg-pearl-50 px-3.5 text-left text-xs font-medium text-slate-500 transition hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-400 cursor-pointer"
            >
              <Search size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="truncate">Search patients, charts, or orders</span>
              <kbd className="ml-auto hidden shrink-0 rounded-md border border-pearl-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-400 lg:inline dark:border-charcoal-600 dark:bg-charcoal-750">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Header Action Controls */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {isCreationTab ? (
              <button
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-100 px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:text-rose-300 cursor-pointer"
                aria-label="Return to Dashboard"
              >
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="relative flex items-center gap-2">
                {/* + Create Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-200 bg-pearl-100 px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-400 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 dark:hover:text-rose-300 cursor-pointer"
                  >
                    <Plus size={15} className="text-rose-600 dark:text-rose-400" />
                    <span>Create</span>
                    <ChevronDown size={14} className="opacity-60" />
                  </button>

                  {isCreateMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCreateMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-pearl-200 bg-white p-1.5 shadow-xl backdrop-blur-xl dark:border-charcoal-700 dark:bg-charcoal-850">
                        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Clinical & Orders
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-patient');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <UserPlus size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Admit Patient</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-order');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <FileText size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Physician Order</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-face-to-face-encounter');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <FileCheck size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Face-to-Face Encounter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-episode');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Sparkles size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>New Episode</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-communication-note');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <MessageSquare size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Communication Note</span>
                        </button>

                        <div className="my-1 border-t border-pearl-100 dark:border-charcoal-750" />

                        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Directory & Admin
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-facility');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Hospital size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>New Facility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-pharmacy');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Pill size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>New Pharmacy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-insurance-payer');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Shield size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>New Insurance / Payer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-physician');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Stethoscope size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>New Physician</span>
                        </button>

                        <div className="my-1 border-t border-pearl-100 dark:border-charcoal-750" />

                        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Safety & Surveillance
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-incident-log');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Incident Log</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateMenuOpen(false);
                            setCurrentTab('create-infection-log');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <Microscope size={15} className="text-rose-600 dark:text-rose-400" />
                          <span>Infection Log</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Primary New Patient CTA */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('create-patient')}
                  className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-0 text-xs font-black text-white shadow-xs transition hover:-translate-y-0.5 hover:bg-rose-700 sm:w-auto sm:justify-start sm:px-3.5 cursor-pointer"
                  aria-label="New patient"
                >
                  <Plus size={16} strokeWidth={2.8} />
                  <span className="hidden whitespace-nowrap sm:inline">New Patient</span>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-100 text-slate-600 transition hover:text-rose-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveMessage(unreadHomeHealthMessages[0] || latestHomeHealthMessage || null)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-100 text-slate-600 transition hover:text-rose-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
              aria-label={
                unreadHomeHealthMessages.length
                  ? `${unreadHomeHealthMessages.length} unread Home Health messages`
                  : 'Open Home Health messages'
              }
              title="Open Home Health messages"
            >
              <Bell size={16} />
              {unreadHomeHealthMessages.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 font-mono text-[9px] font-black text-white">
                  {unreadHomeHealthMessages.length > 9 ? '9+' : unreadHomeHealthMessages.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Content Body: Only renders actual created Home Health pages; all others show Coming Soon */}
        <main
          className={`min-h-0 flex-1 ${
            isCreationTab ? 'overflow-y-auto p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-7'
          }`}
        >
          {currentTab === 'dashboard' && (
            <HomeHealthDashboard onNavigate={setCurrentTab} onOpenMessage={setActiveMessage} />
          )}

          {currentTab === 'orders-management' && (
            <OrdersManagementView onNavigate={setCurrentTab} />
          )}

          {currentTab === 'create-patient' && (
            <AdmitPatientPage
              values={admissionDraft}
              existingMrns={patients.map((patient) => patient.mrn)}
              onChange={(values) => {
                setAdmissionDraft(values);
                setAdmissionDraftSaved(false);
              }}
              onSaveDraft={saveAdmissionDraft}
              onSaveAndExit={exitAdmissionDraft}
              onAdmit={completeAdmission}
              onCancel={discardAdmissionDraft}
              draftSaved={admissionDraftSaved}
              lastMrnUsed={lastMrnUsed}
            />
          )}

          {currentTab === 'create-order' && (
            <CreateOrderPage
              onBack={() => setCurrentTab('orders-management')}
              onOrderCreated={() => setCurrentTab('orders-management')}
            />
          )}

          {currentTab === 'create-face-to-face-encounter' && (
            <CreateFaceToFaceEncounterPage
              onBack={() => setCurrentTab('orders-management')}
              onEncounterCreated={() => setCurrentTab('orders-management')}
            />
          )}

          {currentTab === 'create-episode' && (
            <CreateEpisodePage
              onBack={() => setCurrentTab('dashboard')}
              onEpisodeCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'compose-message' && (
            <ComposeMessagePage
              onBack={() => setCurrentTab('dashboard')}
              onMessageSent={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-communication-note' && (
            <CreateCommunicationNotePage
              onBack={() => setCurrentTab('dashboard')}
              onNoteCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-facility' && (
            <CreateFacilityPage
              onBack={() => setCurrentTab('dashboard')}
              onFacilityCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-pharmacy' && (
            <CreatePharmacyPage
              onBack={() => setCurrentTab('dashboard')}
              onPharmacyCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-insurance-payer' && (
            <CreateInsurancePayerPage
              onBack={() => setCurrentTab('dashboard')}
              onPayerCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-physician' && (
            <CreatePhysicianPage
              onBack={() => setCurrentTab('dashboard')}
              onPhysicianCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-incident-log' && (
            <CreateIncidentLogPage
              onBack={() => setCurrentTab('dashboard')}
              onIncidentLogged={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'create-infection-log' && (
            <CreateInfectionLogPage
              onBack={() => setCurrentTab('dashboard')}
              onLogCreated={() => setCurrentTab('dashboard')}
            />
          )}

          {(currentTab === 'my-account' || currentTab === 'edit-profile') && (
            <EditProfilePage
              onBack={() => setCurrentTab('dashboard')}
              onOpenResetSignature={() => setIsResetSignatureModalOpen(true)}
              onOpenSwitchHomecare={() => setIsSwitchHomecareModalOpen(true)}
            />
          )}

          {currentTab === 'my-messages' && (
            <MyMessagesView
              onBack={() => setCurrentTab('dashboard')}
              onComposeNew={() => setCurrentTab('compose-message')}
            />
          )}

          {currentTab === 'my-schedule-tasks' && (
            <MyScheduleTasksView
              onBack={() => setCurrentTab('dashboard')}
              onOpenPlanner={() => setCurrentTab('my-monthly-calendar')}
            />
          )}

          {currentTab === 'my-monthly-calendar' && (
            <MyMonthlyCalendarView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'qa-center' && (
            <QualityAssuranceCenterView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-patients' && (
            <PatientListView
              onBack={() => setCurrentTab('dashboard')}
              onNewPatient={() => setCurrentTab('create-patient')}
              onEditPatient={(patientId) => {
                setSelectedEditPatientId(patientId);
                setCurrentTab('edit-patient');
              }}
            />
          )}

          {currentTab === 'edit-patient' && (
            <EditPatientPage
              patientId={selectedEditPatientId}
              onBack={() => setCurrentTab('list-patients')}
              onSave={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'list-contacts' && (
            <ContactListView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-tags' && (
            <TagListView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-templates' && (
            <TemplateListView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-non-admit-reasons' && (
            <NonAdmitReasonsView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-facilities' && (
            <FacilityListView
              onBack={() => setCurrentTab('dashboard')}
              onNewFacility={() => setCurrentTab('create-facility')}
              onEditFacility={(facilityId) => {
                setSelectedEditFacilityId(facilityId);
                setCurrentTab('edit-facility');
              }}
            />
          )}

          {currentTab === 'edit-facility' && (
            <EditFacilityPage
              facilityId={selectedEditFacilityId}
              onBack={() => setCurrentTab('list-facilities')}
              onSaved={() => setCurrentTab('list-facilities')}
            />
          )}

          {currentTab === 'list-supplies' && (
            <SuppliesListView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-pharmacies' && (
            <PharmaciesListView
              onBack={() => setCurrentTab('dashboard')}
              onNewPharmacy={() => setCurrentTab('create-pharmacy')}
              onEditPharmacy={(pharmacyId) => {
                setSelectedEditPharmacyId(pharmacyId);
                setCurrentTab('edit-pharmacy');
              }}
            />
          )}

          {currentTab === 'edit-pharmacy' && (
            <EditPharmacyPage
              pharmacyId={selectedEditPharmacyId}
              onBack={() => setCurrentTab('list-pharmacies')}
              onSaved={() => setCurrentTab('list-pharmacies')}
            />
          )}

          {currentTab === 'list-physicians' && (
            <PhysiciansListView
              onBack={() => setCurrentTab('dashboard')}
              onNewPhysician={() => setCurrentTab('create-physician')}
              onEditPhysician={(physicianId) => {
                setSelectedEditPhysicianId(physicianId);
                setCurrentTab('edit-physician');
              }}
            />
          )}

          {currentTab === 'edit-physician' && (
            <EditPhysicianPage
              physicianId={selectedEditPhysicianId}
              onBack={() => setCurrentTab('list-physicians')}
              onSaved={() => setCurrentTab('list-physicians')}
            />
          )}

          {currentTab === 'list-insurances-payers' && (
            <InsurancesPayersListView
              onBack={() => setCurrentTab('dashboard')}
              onNewInsurancePayer={() => setCurrentTab('create-insurance-payer')}
              onEditInsurancePayer={(payerId) => {
                setSelectedEditInsurancePayerId(payerId);
                setCurrentTab('edit-insurance-payer');
              }}
            />
          )}

          {currentTab === 'edit-insurance-payer' && (
            <EditInsurancePayerPage
              payerId={selectedEditInsurancePayerId}
              onBack={() => setCurrentTab('list-insurances-payers')}
              onSaved={() => setCurrentTab('list-insurances-payers')}
            />
          )}

          {currentTab === 'list-users' && (
            <UsersListView
              onBack={() => setCurrentTab('dashboard')}
              onEditUser={(userId) => {
                setSelectedEditUserId(userId);
                setCurrentTab('edit-profile');
              }}
            />
          )}

          {currentTab === 'list-incident-logs' && (
            <IncidentLogsListView
              onBack={() => setCurrentTab('dashboard')}
              onNewIncidentLog={() => setCurrentTab('create-incident-log')}
            />
          )}

          {currentTab === 'list-infection-logs' && (
            <InfectionLogsListView
              onBack={() => setCurrentTab('dashboard')}
              onNewInfectionLog={() => setCurrentTab('create-infection-log')}
            />
          )}

          {currentTab === 'list-communication-notes' && (
            <CommunicationNotesListView
              onBack={() => setCurrentTab('dashboard')}
              onNewCommunicationNote={() => setCurrentTab('create-communication-note')}
            />
          )}

          {currentTab === 'list-missed-visits' && (
            <MissedVisitsListView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'list-immunization-logs' && (
            <ImmunizationLogsListView
              onBack={() => setCurrentTab('dashboard')}
              onNewImmunizationLog={() => setCurrentTab('orders-management')}
            />
          )}

          {currentTab === 'blank-forms' && (
            <BlankFormsView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'not-exported-oasis' && (
            <NotExportedOasisView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'past-due-recertifications-report' && (
            <PastDueRecertificationsReportView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'upcoming-recerts' && (
            <UpcomingRecertsView
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'orders-pending-co-signature' && (
            <OrdersPendingCoSignatureView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'orders-to-be-sent' && (
            <OrdersToBeSentView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'orders-pending-md-signature' && (
            <OrdersPendingMdSignatureView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'orders-history' && (
            <OrdersHistoryView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'print-queue' && (
            <PrintQueueView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('list-patients')}
            />
          )}

          {currentTab === 'patient-charts' && (
            <PatientChartsView
              onBack={() => setCurrentTab('dashboard')}
              onNewPatient={() => setCurrentTab('create-patient')}
              onEditPatient={(id) => {
                setSelectedEditPatientId(id);
                setCurrentTab('edit-patient');
              }}
            />
          )}

          {currentTab === 'pending-admissions' && (
            <PendingAdmissionsView
              onBack={() => setCurrentTab('dashboard')}
              onNewPatient={() => setCurrentTab('create-patient')}
              onAdmitPatient={() => setCurrentTab('create-patient')}
              onEditPatient={() => setCurrentTab('edit-patient')}
            />
          )}

          {currentTab === 'non-admissions' && (
            <NonAdmittedPatientsView
              onBack={() => setCurrentTab('dashboard')}
              onAdmitPatient={() => setCurrentTab('create-patient')}
              onSelectPatient={() => setCurrentTab('patient-charts')}
            />
          )}

          {currentTab === 'deleted-patients' && (
            <DeletedPatientsView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('patient-charts')}
            />
          )}

          {currentTab === 'hospitalization-history' && (
            <HospitalizationHistoryView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('patient-charts')}
            />
          )}

          {currentTab === 'inpatient-facility-hold-list' && (
            <InpatientFacilityHoldListView
              onBack={() => setCurrentTab('dashboard')}
              onSelectPatient={() => setCurrentTab('patient-charts')}
            />
          )}

          {![
            'dashboard',
            'orders-management',
            'create-patient',
            'create-order',
            'create-face-to-face-encounter',
            'create-episode',
            'compose-message',
            'create-communication-note',
            'create-facility',
            'create-pharmacy',
            'create-insurance-payer',
            'create-physician',
            'create-incident-log',
            'create-infection-log',
            'my-account',
            'edit-profile',
            'reset-signature',
            'switch-to-homecare',
            'my-messages',
            'my-schedule-tasks',
            'my-monthly-calendar',
            'qa-center',
            'list-patients',
            'edit-patient',
            'list-contacts',
            'list-tags',
            'list-templates',
            'list-non-admit-reasons',
            'list-facilities',
            'edit-facility',
            'list-supplies',
            'list-pharmacies',
            'edit-pharmacy',
            'list-physicians',
            'edit-physician',
            'list-insurances-payers',
            'edit-insurance-payer',
            'list-users',
            'list-incident-logs',
            'list-infection-logs',
            'list-communication-notes',
            'list-missed-visits',
            'list-immunization-logs',
            'blank-forms',
            'not-exported-oasis',
            'past-due-recertifications-report',
            'upcoming-recerts',
            'orders-pending-co-signature',
            'orders-to-be-sent',
            'orders-pending-md-signature',
            'orders-history',
            'print-queue',
            'patient-charts',
            'pending-admissions',
            'non-admissions',
            'deleted-patients',
            'hospitalization-history',
            'inpatient-facility-hold-list',
          ].includes(currentTab) && (
            <HomeHealthComingSoon
              page={currentTab}
              title={currentPageTitle}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}
        </main>

        {/* Status Footer */}
        {!isCreationTab && (
          <footer className="z-10 flex h-10 shrink-0 items-center justify-between gap-3 border-t border-pearl-200 bg-white/75 px-4 text-[10px] text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-850/75 sm:px-6">
            <span className="truncate">
              <strong className="font-extrabold text-slate-700 dark:text-slate-200">
                {currentPageTitle}
              </strong>
              <span className="mx-2 text-slate-300 dark:text-charcoal-600">•</span>
              Release {organization.releaseVersion}
            </span>
            <span className="hidden shrink-0 items-center gap-1.5 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {organization.name}
            </span>
          </footer>
        )}
      </div>

      <AppSwitcherModal isOpen={isAppSwitcherOpen} onClose={() => setIsAppSwitcherOpen(false)} />
      <HomeHealthMessageDialog message={activeMessage} onClose={() => setActiveMessage(null)} />
      <ResetSignatureModal
        isOpen={isResetSignatureModalOpen}
        onClose={() => setIsResetSignatureModalOpen(false)}
        email="hilder@standardsincare.com"
        userName="Hilder's"
      />
      <SwitchToHomecareModal
        isOpen={isSwitchHomecareModalOpen}
        onClose={() => setIsSwitchHomecareModalOpen(false)}
        onSwitched={() => setCurrentTab('dashboard')}
      />
    </div>
  );
};
