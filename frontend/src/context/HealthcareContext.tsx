import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  initialOrganization,
  initialCensus,
  initialIntakeMetrics,
  initialScheduledVisitsSummary,
  initialMessages,
  initialPatients,
  initialVisits,
  initialAnnouncements,
  initialInquiries,
  initialReferrals,
  initialClinicians,
  initialEmployeeVisits,
  initialUnassignedVisits,
  initialPatientChartTasks
} from '../data/mockData';
import {
  initialConversations,
  initialMessagesMap,
  initialCallLogs,
  initialPlannerTasks
} from '../data/connectPlannerMockData';
import {
  ChatConversation,
  ChatMessage,
  CallLogItem,
  PlannerTaskItem,
  PlannerTaskStage
} from '../types/connectAndPlanner';
import { Patient, PatientChartTask, ScheduledVisit, MessageItem, AnnouncementItem, ServiceLine, Inquiry, Referral, EmployeeClinician, EmployeeVisit, UnassignedPatientVisit, HuvSfvRecord, HomeHealthEpisode, HomeHealthCommunicationNote, HomeHealthOrder, FaceToFaceEncounter, Facility, Pharmacy, InsurancePayer, IncidentLog } from '../types';

interface HealthcareContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  organization: {
    id: string;
    name: string;
    code: string;
    environment: string;
    releaseVersion: string;
  };
  census: {
    total: number;
    homeHealth: number;
    homeCare: number;
    hospice: number;
    percentageHealth: number;
    percentageCare: number;
  };
  unassignedVisits7Days: {
    total: number;
    homeHealth: number;
    homeCare: number;
  };
  intakeMetrics: Array<{
    service: string;
    inquiry: number;
    referral: number;
    admitted: number;
    conversionRate: string;
  }>;
  scheduledSummary: {
    total: number;
    completed: number;
    inProgress: number;
    notYetStarted: number;
    unassigned: number;
    missed: number;
    homeHealthTotal: number;
    homeHealthCompleted: number;
    homeHealthMissed: number;
    homeHealthUnassigned: number;
    homeCareTotal: number;
    homeCareCompleted: number;
    homeCareMissed: number;
    homeCareUnassigned: number;
  };
  refreshDashboardData: () => Promise<void>;
  messages: MessageItem[];
  addMessage: (message: Omit<MessageItem, 'id'>) => Promise<any> | void;
  homeHealthEpisodes: HomeHealthEpisode[];
  addHomeHealthEpisode: (episode: Omit<HomeHealthEpisode, 'id'>) => Promise<any> | void;
  communicationNotes: HomeHealthCommunicationNote[];
  addCommunicationNote: (note: Omit<HomeHealthCommunicationNote, 'id'>) => Promise<any> | void;
  orders: HomeHealthOrder[];
  addHomeHealthOrder: (order: Omit<HomeHealthOrder, 'id' | 'createdAt'>) => Promise<any> | void;
  incidentLogs: IncidentLog[];
  addIncidentLog: (log: Omit<IncidentLog, 'id' | 'createdAt'>) => Promise<any> | void;
  faceToFaceEncounters: FaceToFaceEncounter[];
  addFaceToFaceEncounter: (encounter: Omit<FaceToFaceEncounter, 'id' | 'createdAt'>) => void;
  facilities: Facility[];
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt'>) => void;
  pharmacies: Pharmacy[];
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id' | 'createdAt'>) => void;
  insurancePayers: InsurancePayer[];
  addInsurancePayer: (payer: Omit<InsurancePayer, 'id' | 'createdAt'>) => void;
  patients: Patient[];
  visits: ScheduledVisit[];
  announcements: AnnouncementItem[];
  inquiries: Inquiry[];
  referrals: Referral[];
  clinicians: EmployeeClinician[];
  employeeVisits: EmployeeVisit[];
  unassignedVisits: UnassignedPatientVisit[];
  huvSfvRecords: HuvSfvRecord[];
  scheduleStats: any;
  scheduleMode: 'calendar' | 'map';
  setScheduleMode: (mode: 'calendar' | 'map') => void;
  addEmployeeVisit: (visit: Omit<EmployeeVisit, 'id'>) => void;
  updateEmployeeVisitStatus: (id: string, status: EmployeeVisit['status']) => void;
  deleteEmployeeVisit: (id: string) => void;
  assignVisitToClinician: (visitId: string, clinicianId: string) => void;
  bulkAssignVisits: (visitIds: string[], clinicianId: string) => void;
  deleteUnassignedVisit: (visitId: string) => void;
  addUnassignedVisit: (visit: Omit<UnassignedPatientVisit, 'id'>) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  intakeSubTab: 'inquiries' | 'referrals' | 'pipeline';
  setIntakeSubTab: (tab: 'inquiries' | 'referrals' | 'pipeline') => void;
  patientSubTab: 'charts' | 'directory';
  setPatientSubTab: (tab: 'charts' | 'directory') => void;
  chartTasks: PatientChartTask[];
  reassignPatientTask: (taskId: string, newClinicianName: string, newClinicianId?: string) => void;
  updatePatientTaskDetails: (taskId: string, updatedData: Partial<PatientChartTask>) => void;
  deletePatientTask: (taskId: string) => void;
  addPatientTask: (taskData: Omit<PatientChartTask, 'id'>) => void;
  serviceFilter: 'all' | ServiceLine;
  setServiceFilter: (filter: 'all' | ServiceLine) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadCount: number;
  markMessageRead: (id: string) => void;
  selectedMessage: MessageItem | null;
  setSelectedMessage: (msg: MessageItem | null) => void;
  selectedPatient: Patient | null;
  setSelectedPatient: (pat: Patient | null) => void;
  selectedInquiry: Inquiry | null;
  setSelectedInquiry: (inq: Inquiry | null) => void;
  isNewPatientModalOpen: boolean;
  setIsNewPatientModalOpen: (open: boolean) => void;
  isInquiryModalOpen: boolean;
  setIsInquiryModalOpen: (open: boolean) => void;
  isNewReferralModalOpen: boolean;
  setIsNewReferralModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  activeVideo: AnnouncementItem | null;
  setActiveVideo: (announcement: AnnouncementItem | null) => void;
  addNewPatient: (patient: Omit<Patient, 'id' | 'mrn'> & { mrn?: string }) => Promise<any> | void;
  addNewInquiry: (inquiry: Omit<Inquiry, 'id'>) => Promise<void> | void;
  updateInquiry: (id: string, inquiry: Partial<Inquiry>) => Promise<void> | void;
  addNewReferral: (referral: Omit<Referral, 'id'>) => Promise<void> | void;
  updateReferral: (id: string, referral: Partial<Referral>) => Promise<void> | void;
  deleteReferral: (id: string) => Promise<void> | void;
  convertInquiryToReferral: (id: string) => Promise<void> | void;
  deleteInquiry: (id: string) => Promise<void> | void;

  // Platform Website Architecture ('hub' | 'central' | 'home_health' | 'connect')
  currentWebsite: 'hub' | 'central' | 'home_health' | 'connect';
  setCurrentWebsite: (site: 'hub' | 'central' | 'home_health' | 'connect') => void;

  // Home Health Active Tab
  homeHealthTab: string;
  setHomeHealthTab: (tab: string) => void;

  // Responsive Mobile Navigation Sidebar
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // CareOrbit Connect & Planner Suite
  connectModule: 'connect' | 'planner';
  setConnectModule: (module: 'connect' | 'planner') => void;
  connectRailTab: 'chat' | 'calls';
  setConnectRailTab: (tab: 'chat' | 'calls') => void;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messagesMap: Record<string, ChatMessage[]>;
  sendChatMessage: (conversationId: string, content: string, attachment?: ChatMessage['attachment']) => void;
  markConversationRead: (conversationId: string) => void;
  callLogs: CallLogItem[];
  addCallLog: (call: Omit<CallLogItem, 'id'>) => void;
  createNewConversation: (data: any) => Promise<any>;
  fetchMessagesForConversation: (convId: string) => Promise<void>;
  refreshConnectConversations: () => Promise<void>;
  plannerTasks: PlannerTaskItem[];
  addPlannerTask: (task: Omit<PlannerTaskItem, 'id'>) => void;
  updatePlannerTaskStage: (taskId: string, stage: PlannerTaskStage) => void;
  deletePlannerTask: (taskId: string) => void;
  activeCallModal: { isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null;
  setActiveCallModal: (val: { isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null) => void;
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

const initialRoute = typeof window !== 'undefined' ? parseRouteFromUrl() : null;

function parseRouteFromUrl(): {
  website: 'hub' | 'central' | 'home_health' | 'connect';
  centralTab: string;
  intakeSubTab: 'inquiries' | 'referrals' | 'pipeline';
  patientSubTab: 'charts' | 'directory';
  homeHealthTab: string;
  connectModule: 'connect' | 'planner';
  connectRailTab: 'chat' | 'calls';
} {
  if (typeof window === 'undefined') {
    return {
      website: 'hub',
      centralTab: 'dashboard',
      intakeSubTab: 'inquiries',
      patientSubTab: 'charts',
      homeHealthTab: 'dashboard',
      connectModule: 'connect',
      connectRailTab: 'chat',
    };
  }

  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!rawPath || rawPath === 'hub') {
    return {
      website: 'hub',
      centralTab: 'dashboard',
      intakeSubTab: 'inquiries',
      patientSubTab: 'charts',
      homeHealthTab: 'dashboard',
      connectModule: 'connect',
      connectRailTab: 'chat',
    };
  }

  const parts = rawPath.split('/');
  const section = parts[0]?.toLowerCase();

  if (section === 'central') {
    const tab = parts[1] || 'dashboard';
    const subTab = parts[2] || '';
    let intakeSubTab: 'inquiries' | 'referrals' | 'pipeline' = 'inquiries';
    if (tab === 'intake' && (subTab === 'inquiries' || subTab === 'referrals' || subTab === 'pipeline')) {
      intakeSubTab = subTab as any;
    }
    let patientSubTab: 'charts' | 'directory' = 'charts';
    if (tab === 'patients' && (subTab === 'charts' || subTab === 'directory')) {
      patientSubTab = subTab as any;
    }
    return {
      website: 'central',
      centralTab: tab,
      intakeSubTab,
      patientSubTab,
      homeHealthTab: 'dashboard',
      connectModule: 'connect',
      connectRailTab: 'chat',
    };
  }

  if (section === 'home-health' || section === 'home_health') {
    const tab = parts[1] || 'dashboard';
    return {
      website: 'home_health',
      centralTab: 'dashboard',
      intakeSubTab: 'inquiries',
      patientSubTab: 'charts',
      homeHealthTab: tab,
      connectModule: 'connect',
      connectRailTab: 'chat',
    };
  }

  if (section === 'connect') {
    const sub = parts[1] || 'chat';
    if (sub === 'planner') {
      return {
        website: 'connect',
        centralTab: 'dashboard',
        intakeSubTab: 'inquiries',
        patientSubTab: 'charts',
        homeHealthTab: 'dashboard',
        connectModule: 'planner',
        connectRailTab: 'chat',
      };
    }
    if (sub === 'calls') {
      return {
        website: 'connect',
        centralTab: 'dashboard',
        intakeSubTab: 'inquiries',
        patientSubTab: 'charts',
        homeHealthTab: 'dashboard',
        connectModule: 'connect',
        connectRailTab: 'calls',
      };
    }
    return {
      website: 'connect',
      centralTab: 'dashboard',
      intakeSubTab: 'inquiries',
      patientSubTab: 'charts',
      homeHealthTab: 'dashboard',
      connectModule: 'connect',
      connectRailTab: 'chat',
    };
  }

  return {
    website: 'hub',
    centralTab: 'dashboard',
    intakeSubTab: 'inquiries',
    patientSubTab: 'charts',
    homeHealthTab: 'dashboard',
    connectModule: 'connect',
    connectRailTab: 'chat',
  };
}

export const HealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('axxess_theme');
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    document.documentElement.style.colorScheme = initialTheme;
    return initialTheme;
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('axxess_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [organization, setOrganization] = useState({
    id: 'org-shc-01',
    name: 'Standards Home Care',
    code: 'SHC-001',
    environment: 'production',
    releaseVersion: 'v2.4.0-cloud',
  });
  const [census, setCensus] = useState({
    total: 0,
    homeHealth: 0,
    homeCare: 0,
    hospice: 0,
    percentageHealth: 0,
    percentageCare: 0,
  });
  const [unassignedVisits7Days, setUnassignedVisits7Days] = useState({
    total: 0,
    homeHealth: 0,
    homeCare: 0,
  });
  const [intakeMetrics, setIntakeMetrics] = useState<Array<{
    service: string;
    inquiry: number;
    referral: number;
    admitted: number;
    conversionRate: string;
  }>>([]);
  const [scheduledSummary, setScheduledSummary] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notYetStarted: 0,
    unassigned: 0,
    missed: 0,
    homeHealthTotal: 0,
    homeHealthCompleted: 0,
    homeHealthMissed: 0,
    homeHealthUnassigned: 0,
    homeCareTotal: 0,
    homeCareCompleted: 0,
    homeCareMissed: 0,
    homeCareUnassigned: 0,
  });
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);

  const refreshDashboardData = useCallback(async () => {
    try {
      const [
        orgRes, metricsRes, msgRes, annRes, inqRes, refRes,
        patRes, clinRes, visitsRes, unassignedRes, huvSfvRes, schedStatsRes,
        connectConvRes, connectCallLogsRes, episodesRes, commNotesRes, ordersRes, incidentLogsRes
      ] = await Promise.allSettled([
        api.getOrganization(),
        api.getDashboardMetrics(),
        api.getMessages(),
        api.getAnnouncements(),
        api.getInquiries(),
        api.getReferrals(),
        api.getPatients(),
        api.getClinicians(),
        api.getScheduleVisits(),
        api.getUnassignedVisits(),
        api.getHuvSfvRecords(),
        api.getScheduleStats(),
        api.getConnectConversations(),
        api.getConnectCallLogs(),
        api.getEpisodes(),
        api.getCommunicationNotes(),
        api.getOrders(),
        api.getIncidentLogs(),
      ]);

      if (connectConvRes.status === 'fulfilled' && Array.isArray(connectConvRes.value) && connectConvRes.value.length > 0) {
        setConversations(connectConvRes.value);
      }

      if (connectCallLogsRes.status === 'fulfilled' && Array.isArray(connectCallLogsRes.value) && connectCallLogsRes.value.length > 0) {
        setCallLogs(connectCallLogsRes.value);
      }

      if (inqRes.status === 'fulfilled') {
        setInquiries(inqRes.value);
      }

      if (refRes.status === 'fulfilled') {
        setReferrals(refRes.value);
      }

      if (patRes.status === 'fulfilled') {
        setPatients(patRes.value);
      }

      if (clinRes.status === 'fulfilled') {
        setClinicians(clinRes.value);
      }

      if (visitsRes.status === 'fulfilled') {
        setEmployeeVisits(visitsRes.value);
      }

      if (unassignedRes.status === 'fulfilled') {
        setUnassignedVisits(unassignedRes.value);
      }

      if (huvSfvRes.status === 'fulfilled') {
        setHuvSfvRecords(huvSfvRes.value);
      }

      if (schedStatsRes.status === 'fulfilled') {
        setScheduleStats(schedStatsRes.value);
      }

      if (orgRes.status === 'fulfilled') {
        setOrganization(orgRes.value);
      }

      if (metricsRes.status === 'fulfilled') {
        const m = metricsRes.value;
        const total = m.activePatients?.total || 0;
        const hh = m.activePatients?.homeHealth || 0;
        const hc = m.activePatients?.homeCare || 0;
        const hospice = m.activePatients?.hospice || 0;
        const pctHealth = total > 0 ? Math.round((hh / total) * 100) : 0;
        const pctCare = total > 0 ? Math.round((hc / total) * 100) : 0;

        setCensus({
          total,
          homeHealth: hh,
          homeCare: hc,
          hospice,
          percentageHealth: pctHealth,
          percentageCare: pctCare,
        });

        if (m.unassignedVisits7Days) {
          setUnassignedVisits7Days(m.unassignedVisits7Days);
        }

        if (m.intakeLast30Days) {
          setIntakeMetrics(m.intakeLast30Days);
        }

        if (m.scheduledVisitsLast30Days) {
          const s = m.scheduledVisitsLast30Days;
          setScheduledSummary({
            total: s.total || 0,
            completed: s.completed || 0,
            inProgress: s.inProgress || 0,
            notYetStarted: s.scheduled || 0,
            unassigned: s.unassigned || 0,
            missed: s.missed || 0,
            homeHealthTotal: s.homeHealthTotal || 0,
            homeHealthCompleted: s.homeHealthCompleted || 0,
            homeHealthMissed: s.homeHealthMissed || 0,
            homeHealthUnassigned: s.homeHealthUnassigned || 0,
            homeCareTotal: s.homeCareTotal || 0,
            homeCareCompleted: s.homeCareCompleted || 0,
            homeCareMissed: s.homeCareMissed || 0,
            homeCareUnassigned: s.homeCareUnassigned || 0,
          });
        }
      }

      if (msgRes.status === 'fulfilled') {
        setMessages(msgRes.value);
      }

      if (annRes.status === 'fulfilled' && annRes.value.length > 0) {
        setAnnouncements(annRes.value);
      }

      if (episodesRes.status === 'fulfilled' && Array.isArray(episodesRes.value)) {
        setHomeHealthEpisodes(episodesRes.value);
      }

      if (commNotesRes.status === 'fulfilled' && Array.isArray(commNotesRes.value)) {
        setCommunicationNotes(commNotesRes.value);
      }

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
      }

      if (incidentLogsRes.status === 'fulfilled' && Array.isArray(incidentLogsRes.value)) {
        setIncidentLogs(incidentLogsRes.value);
      }
    } catch (err) {
      console.error('[HealthcareContext] Error fetching dashboard data from backend:', err);
    }
  }, []);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);
  const [homeHealthEpisodes, setHomeHealthEpisodes] = useState<HomeHealthEpisode[]>([]);
  const [communicationNotes, setCommunicationNotes] = useState<HomeHealthCommunicationNote[]>([]);
  const [orders, setOrders] = useState<HomeHealthOrder[]>([]);
  const [incidentLogs, setIncidentLogs] = useState<IncidentLog[]>([]);
  const [faceToFaceEncounters, setFaceToFaceEncounters] = useState<FaceToFaceEncounter[]>([
    {
      id: 'f2f-101',
      patientStatus: 'Active',
      patientId: 'pat-1',
      patientName: 'Lantigua Gonzalez, Scarlet',
      episodeAssociated: '11/01/2026 - 12/30/2026',
      physician: 'Dr. Anita Gupta, MD',
      requestDate: '2026-11-05',
      certifyingType: 'POC Certifying Physician',
      status: 'Certified',
      createdAt: '2026-11-05',
    },
    {
      id: 'f2f-102',
      patientStatus: 'Active',
      patientId: 'pat-3',
      patientName: 'Auguste, Jocelene',
      episodeAssociated: '10/20/2026 - 12/18/2026',
      physician: 'Dr. Sarah Patel, DO',
      requestDate: '2026-11-07',
      certifyingType: 'POC Certifying Physician',
      status: 'Pending',
      createdAt: '2026-11-07',
    },
  ]);
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 'fac-1',
      name: 'Beverly Hospital',
      facilityType: 'Hospital',
      addressLine1: '85 Herrick St',
      city: 'Beverly',
      state: 'MA',
      zip: '01915',
      contactFirstName: 'Sarah',
      contactLastName: 'Jenkins',
      email: 'sjenkins@beverlyhospital.org',
      phone: '(978) 922-3000',
      fax: '(978) 922-3001',
      comment: 'Primary regional health center and acute care referral hub.',
      createdAt: '2026-11-01T09:00:00Z',
    },
    {
      id: 'fac-2',
      name: 'Salem Hospital / Mass General Brigham',
      facilityType: 'Hospital',
      addressLine1: '81 Highland Ave',
      city: 'Salem',
      state: 'MA',
      zip: '01970',
      contactFirstName: 'David',
      contactLastName: 'Miller',
      email: 'dmiller@partners.org',
      phone: '(978) 741-1200',
      fax: '(978) 741-1250',
      comment: 'Academic medical center partner for complex rehabilitation.',
      createdAt: '2026-11-02T10:00:00Z',
    },
  ]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([
    {
      id: 'pharm-1',
      name: 'Walgreens Pharmacy #0438',
      addressLine1: '54 Elliot St',
      city: 'Beverly',
      state: 'MA',
      zip: '01915',
      phone: '(978) 921-0506',
      contactFirstName: 'Rachel',
      contactLastName: 'Green, PharmD',
      email: 'pharm0438@walgreens.com',
      fax: '(978) 921-0508',
      comment: 'Primary dispensing pharmacy for daily medication delivery and blister packaging.',
      createdAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'pharm-2',
      name: 'CVS Pharmacy #1025',
      addressLine1: '19 Dodge St',
      city: 'Beverly',
      state: 'MA',
      zip: '01915',
      phone: '(978) 927-0060',
      contactFirstName: 'Mark',
      contactLastName: 'Sullivan, RPh',
      email: 'rx1025@cvshealth.com',
      fax: '(978) 927-0065',
      comment: 'Infusion and specialty compounding provider.',
      createdAt: '2026-11-02T11:00:00Z',
    },
  ]);
  const [insurancePayers, setInsurancePayers] = useState<InsurancePayer[]>([
    {
      id: 'payer-1',
      payerName: 'Medicare Traditional (Part A)',
      payerType: 'Traditional Medicare',
      payerId: 'CMS-MEDICARE-001',
      addressLine1: 'PO Box 6744',
      city: 'Lawrence',
      state: 'KS',
      zip: '66044',
      phone: '(800) 633-4227',
      contactName: 'National Government Services (NGS)',
      billingInfo: {
        addressFormat: 'Address with 5 digit zip, no county',
        dateFormat: 'No Separator(MMDDYYYY)',
        nameFormat: 'Last Name First Name Middle initial',
        currencyFormat: 'Leading Zero',
        useAnotherTaxNumber: false,
        patientNameIdentifier: 'Last Name',
        patientNameOptions: 'First Name',
        priorityOfVisitInclude: true,
        pointOfOriginInclude: true,
        dischargeHourInclude: true,
        accidentStateInclude: true,
        reservedLocator30: '',
        includePayerNameAddressOnPaper: true,
        valueCode39a: 'CBSA Code',
        valueCode39b: 'Blank',
        valueCode39c: 'Blank',
        valueCode39d: 'Blank',
        valueCode40a: 'Blank',
        valueCode40b: 'Blank',
        valueCode40c: 'Blank',
        valueCode40d: 'Blank',
        valueCode41a: 'Blank',
        valueCode41b: 'Blank',
        valueCode41c: 'Blank',
        valueCode41d: 'Blank',
        revenueCodeLocator42: 'Visits and Supplies',
        revenueDescriptionLocator43: 'Visits and Supplies',
        hippsCodeLocator44: 'Visits and Supplies',
        serviceDateLocator45: 'Visits and Supplies',
        serviceUnitsLocator46: 'Print Only',
        totalChargesLocator47: 'RAP Displays 100% Total Charge',
        payerNameA: 'Primary Insurance',
        payerNameB: 'None',
        payerNameC: 'None',
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
      status: 'Active',
      createdAt: '2026-11-01T08:00:00Z',
    },
  ]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits] = useState<ScheduledVisit[]>(initialVisits);
  const [activeNavTab, setActiveNavTab] = useState<string>(initialRoute?.centralTab || 'dashboard');
  const [serviceFilter, setServiceFilter] = useState<'all' | ServiceLine>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [intakeSubTab, setIntakeSubTab] = useState<'inquiries' | 'referrals' | 'pipeline'>(initialRoute?.intakeSubTab || 'inquiries');
  const [patientSubTab, setPatientSubTab] = useState<'charts' | 'directory'>(initialRoute?.patientSubTab || 'charts');
  const [homeHealthTab, setHomeHealthTab] = useState<string>(initialRoute?.homeHealthTab || 'dashboard');
  const [chartTasks, setChartTasks] = useState<PatientChartTask[]>(initialPatientChartTasks);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<AnnouncementItem | null>(null);

  const [clinicians, setClinicians] = useState<EmployeeClinician[]>([]);
  const [employeeVisits, setEmployeeVisits] = useState<EmployeeVisit[]>([]);
  const [unassignedVisits, setUnassignedVisits] = useState<UnassignedPatientVisit[]>([]);
  const [huvSfvRecords, setHuvSfvRecords] = useState<HuvSfvRecord[]>([]);
  const [scheduleStats, setScheduleStats] = useState<any>(null);

  // Platform Website Switcher ('hub' | 'central' | 'home_health' | 'connect')
  const [currentWebsite, setCurrentWebsite] = useState<'hub' | 'central' | 'home_health' | 'connect'>(initialRoute?.website || 'hub');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // CareOrbit Connect & Planner State
  const [connectModule, setConnectModule] = useState<'connect' | 'planner'>(initialRoute?.connectModule || 'connect');
  const [connectRailTab, setConnectRailTab] = useState<'chat' | 'calls'>(initialRoute?.connectRailTab || 'chat');
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-care-abuissa');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(initialMessagesMap);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(initialCallLogs);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTaskItem[]>(initialPlannerTasks);
  const [activeCallModal, setActiveCallModal] = useState<{ isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null>(null);

  // Synchronize React navigation state -> URL pathname
  useEffect(() => {
    let targetPath = '/hub';
    if (currentWebsite === 'hub') {
      targetPath = '/hub';
    } else if (currentWebsite === 'central') {
      if (activeNavTab === 'intake') {
        targetPath = `/central/intake/${intakeSubTab || 'inquiries'}`;
      } else if (activeNavTab === 'patients') {
        targetPath = `/central/patients/${patientSubTab || 'charts'}`;
      } else {
        targetPath = `/central/${activeNavTab || 'dashboard'}`;
      }
    } else if (currentWebsite === 'home_health') {
      targetPath = `/home-health/${homeHealthTab || 'dashboard'}`;
    } else if (currentWebsite === 'connect') {
      if (connectModule === 'planner') {
        targetPath = '/connect/planner';
      } else {
        targetPath = `/connect/${connectRailTab || 'chat'}`;
      }
    }

    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      if (window.location.pathname === '/' && targetPath === '/hub') {
        window.history.replaceState({ path: targetPath }, '', targetPath);
      } else {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }
    }
  }, [
    currentWebsite,
    activeNavTab,
    intakeSubTab,
    patientSubTab,
    homeHealthTab,
    connectModule,
    connectRailTab
  ]);

  // Handle browser Back / Forward history buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromUrl();
      setCurrentWebsite(route.website);
      setActiveNavTab(route.centralTab);
      setIntakeSubTab(route.intakeSubTab);
      setPatientSubTab(route.patientSubTab);
      setHomeHealthTab(route.homeHealthTab);
      setConnectModule(route.connectModule);
      setConnectRailTab(route.connectRailTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshConnectConversations = useCallback(async () => {
    try {
      const convs = await api.getConnectConversations();
      if (Array.isArray(convs) && convs.length > 0) {
        setConversations(convs);
      }
    } catch (err) {
      console.error('Failed to refresh connect conversations:', err);
    }
  }, []);

  const fetchMessagesForConversation = useCallback(async (conversationId: string) => {
    try {
      const msgs = await api.getConnectMessages(conversationId);
      if (Array.isArray(msgs)) {
        setMessagesMap(prev => ({ ...prev, [conversationId]: msgs }));
      }
    } catch (err) {
      console.error('Failed to fetch messages for conversation:', err);
    }
  }, []);

  const sendChatMessage = async (conversationId: string, content: string, attachment?: ChatMessage['attachment']) => {
    try {
      const createdMsg = await api.sendConnectMessage(conversationId, {
        content,
        senderId: 'current-user',
        senderName: 'Hilder M., RN',
        senderRole: 'Clinical Supervisor',
        attachment
      });

      setMessagesMap(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), createdMsg]
      }));

      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: {
                senderName: 'You',
                content: attachment ? `[Attachment: ${attachment.name}] ${content}` : content,
                timestamp: createdMsg.timestamp,
                isRead: true
              }
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      // Fallback local append
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'current-user',
        senderName: 'Hilder M., RN',
        senderRole: 'Clinical Supervisor',
        isCurrentUser: true,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        isRead: true,
        attachment
      };
      setMessagesMap(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
    }
  };

  const markConversationRead = async (conversationId: string) => {
    try {
      await api.markConnectConversationRead(conversationId);
    } catch (err) {
      console.error('Failed to mark conversation read on server:', err);
    }
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const createNewConversation = async (data: any) => {
    try {
      const newConv = await api.createConnectConversation(data);
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      return newConv;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      throw err;
    }
  };

  const addCallLog = async (call: Omit<CallLogItem, 'id'>) => {
    try {
      const logged = await api.logConnectCall(call);
      setCallLogs(prev => [logged, ...prev]);
    } catch {
      const fallback: CallLogItem = {
        ...call,
        id: `call-${Date.now()}`
      };
      setCallLogs(prev => [fallback, ...prev]);
    }
  };

  const addPlannerTask = (task: Omit<PlannerTaskItem, 'id'>) => {
    const newTask: PlannerTaskItem = {
      ...task,
      id: `plan-${Date.now()}`
    };
    setPlannerTasks(prev => [newTask, ...prev]);
  };

  const updatePlannerTaskStage = (taskId: string, stage: PlannerTaskStage) => {
    setPlannerTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, stage } : t))
    );
  };

  const deletePlannerTask = (taskId: string) => {
    setPlannerTasks(prev => prev.filter(t => t.id !== taskId));
  };
  const [scheduleMode, setScheduleMode] = useState<'calendar' | 'map'>('calendar');

  const addEmployeeVisit = async (visitData: Omit<EmployeeVisit, 'id'>) => {
    try {
      const created = await api.createScheduleVisit(visitData);
      setEmployeeVisits(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err: any) {
      console.error('Failed to create visit in database:', err);
      throw err;
    }
  };

  const updateEmployeeVisitStatus = async (id: string, status: EmployeeVisit['status']) => {
    try {
      await api.updateScheduleVisit(id, { status });
      setEmployeeVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to update visit status:', err);
      setEmployeeVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    }
  };

  const deleteEmployeeVisit = async (id: string) => {
    try {
      await api.deleteScheduleVisit(id);
      setEmployeeVisits(prev => prev.filter(v => v.id !== id));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to delete visit:', err);
      setEmployeeVisits(prev => prev.filter(v => v.id !== id));
    }
  };

  const assignVisitToClinician = async (visitId: string, clinicianId: string) => {
    try {
      await api.assignUnassignedVisit(visitId, clinicianId);
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to assign visit:', err);
      const visit = unassignedVisits.find(v => v.id === visitId);
      const clinician = clinicians.find(c => c.id === clinicianId);
      if (!visit || !clinician) return;
      const dateObj = new Date(visit.scheduledDate + 'T00:00:00');
      const dayOfWeek = isNaN(dateObj.getDay()) ? 3 : dateObj.getDay();
      const newEmpVisit: EmployeeVisit = {
        id: `evst-${Date.now()}`,
        employeeId: clinician.id,
        employeeName: clinician.name,
        patientName: visit.patientName,
        patientMrn: visit.patientMrn,
        visitType: visit.task,
        serviceLine: visit.serviceLine,
        dayOfWeek,
        date: visit.scheduledDate,
        timeSlot: visit.timeSlot,
        status: 'scheduled',
        locationType: 'home',
        evvStatus: 'pending',
        address: visit.patientAddress,
        notes: visit.notes
      };
      setEmployeeVisits(prev => [newEmpVisit, ...prev]);
      setUnassignedVisits(prev => prev.filter(v => v.id !== visitId));
    }
  };

  const bulkAssignVisits = async (visitIds: string[], clinicianId: string) => {
    try {
      await api.bulkAssignUnassignedVisits(visitIds, clinicianId);
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to bulk assign visits:', err);
      refreshDashboardData();
    }
  };

  const deleteUnassignedVisit = async (visitId: string) => {
    try {
      await api.deleteUnassignedVisit(visitId);
      setUnassignedVisits(prev => prev.filter(v => v.id !== visitId));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to delete unassigned visit:', err);
      setUnassignedVisits(prev => prev.filter(v => v.id !== visitId));
    }
  };

  const addUnassignedVisit = (visitData: Omit<UnassignedPatientVisit, 'id'>) => {
    const newVisit: UnassignedPatientVisit = {
      id: `uv-${Date.now()}`,
      ...visitData
    };
    setUnassignedVisits(prev => [newVisit, ...prev]);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  const markMessageRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try {
      await api.markMessageRead(id);
    } catch (err) {
      console.error('[HealthcareContext] Failed to mark message read on server:', err);
    }
  };

  const addMessage = async (message: Omit<MessageItem, 'id'>) => {
    try {
      const payload = {
        subject: message.subject,
        body: message.body || message.snippet,
        recipients: message.recipientNames || [message.patientName || 'Care Team'],
        priority: message.priority || 'routine',
        serviceLine: message.serviceLine || 'home_health',
        patientId: message.regardingPatientId || null,
        attachments: (message as any).attachments || (message.attachmentName ? [{ name: message.attachmentName, size: '24 KB', uploadedAt: new Date().toISOString() }] : []),
      };
      const res = await api.createMessage(payload);
      const created = res.data || res;
      setMessages(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('[HealthcareContext] Failed to save message to database:', err);
      const fallback: MessageItem = { ...message, id: `msg-${Date.now()}` };
      setMessages(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const addHomeHealthEpisode = async (episode: Omit<HomeHealthEpisode, 'id'>) => {
    try {
      const created = await api.createEpisode(episode);
      setHomeHealthEpisodes(prev => [created, ...prev]);
      // Update patient in patients state so all patient charts, lists, and active patients have updated episode dates
      setPatients(prev => prev.map(p => {
        if (p.id === episode.patientId || p.mrn === episode.patientId) {
          return {
            ...p,
            startOfCareDate: episode.startOfCareDate,
            episodeStart: episode.episodeStartDate,
            episodeEnd: episode.episodeEndDate,
            attendingPhysician: episode.primaryPhysician || p.attendingPhysician,
            insuranceName: episode.primaryInsurance || p.insuranceName,
          };
        }
        return p;
      }));
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('[HealthcareContext] Failed to save episode to database:', err);
      const fallback = { ...episode, id: `episode-${Date.now()}` };
      setHomeHealthEpisodes(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const addCommunicationNote = async (note: Omit<HomeHealthCommunicationNote, 'id'>) => {
    try {
      const created = await api.createCommunicationNote(note);
      setCommunicationNotes(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('[HealthcareContext] Failed to create communication note via API, falling back to local:', err);
      const fallback = { ...note, id: `note-${Date.now()}` };
      setCommunicationNotes(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const addHomeHealthOrder = async (order: Omit<HomeHealthOrder, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createOrder(order);
      setOrders(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('[HealthcareContext] Failed to create order via API, falling back to local:', err);
      const fallback = { ...order, id: `order-${Date.now()}`, createdAt: new Date().toISOString() };
      setOrders(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const addIncidentLog = async (log: Omit<IncidentLog, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createIncidentLog(log);
      setIncidentLogs(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('[HealthcareContext] Failed to create incident log via API, falling back to local:', err);
      const fallback: IncidentLog = { ...log, id: `inc-${Date.now()}`, createdAt: new Date().toISOString() };
      setIncidentLogs(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const addFaceToFaceEncounter = (encounter: Omit<FaceToFaceEncounter, 'id' | 'createdAt'>) => {
    const localDate = new Date().toISOString();
    setFaceToFaceEncounters(prev => [{ ...encounter, id: `f2f-${Date.now()}`, createdAt: localDate }, ...prev]);
  };

  const addFacility = (facility: Omit<Facility, 'id' | 'createdAt'>) => {
    const localDate = new Date().toISOString();
    setFacilities(prev => [{ ...facility, id: `fac-${Date.now()}`, createdAt: localDate }, ...prev]);
  };

  const addPharmacy = (pharmacy: Omit<Pharmacy, 'id' | 'createdAt'>) => {
    const localDate = new Date().toISOString();
    setPharmacies(prev => [{ ...pharmacy, id: `pharm-${Date.now()}`, createdAt: localDate }, ...prev]);
  };

  const addInsurancePayer = (payer: Omit<InsurancePayer, 'id' | 'createdAt'>) => {
    const localDate = new Date().toISOString();
    setInsurancePayers(prev => [{ ...payer, id: `payer-${Date.now()}`, createdAt: localDate }, ...prev]);
  };

  const addNewPatient = async (newPatData: Omit<Patient, 'id' | 'mrn'> & { mrn?: string }) => {
    try {
      const created = await api.createPatient(newPatData);
      setPatients(prev => [created, ...prev]);
      refreshDashboardData();
      return created;
    } catch (err) {
      console.error('Failed to create patient in database:', err);
      const id = `pat-${Date.now()}`;
      const { mrn: requestedMrnValue, ...patientData } = newPatData;
      const requestedMrn = requestedMrnValue?.trim();
      const mrn = requestedMrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
      const newPat: Patient = {
        id,
        mrn,
        ...patientData
      };
      setPatients(prev => [newPat, ...prev]);
    }
  };

  const addNewInquiry = async (inquiryData: Omit<Inquiry, 'id'>) => {
    try {
      const created = await api.createInquiry(inquiryData);
      setInquiries(prev => [created, ...prev]);
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to create inquiry in database:', err);
      // Fallback optimistic
      const newInq: Inquiry = { id: `inq-${Date.now()}`, ...inquiryData };
      setInquiries(prev => [newInq, ...prev]);
    }
  };

  const updateInquiry = async (id: string, updatedData: Partial<Inquiry>) => {
    try {
      const updated = await api.updateInquiry(id, updatedData);
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to update inquiry in database:', err);
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    }
  };

  const addNewReferral = async (referralData: Omit<Referral, 'id'>) => {
    try {
      const created = await api.createReferral(referralData);
      setReferrals(prev => [created, ...prev]);
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to create referral in database:', err);
      const newRef: Referral = { id: `ref-${Date.now()}`, ...referralData };
      setReferrals(prev => [newRef, ...prev]);
    }
  };

  const updateReferral = async (id: string, updatedData: Partial<Referral>) => {
    try {
      const updated = await api.updateReferral(id, updatedData);
      setReferrals(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to update referral in database:', err);
      setReferrals(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    }
  };

  const deleteReferral = async (id: string) => {
    try {
      await api.deleteReferral(id);
      setReferrals(prev => prev.filter(r => r.id !== id));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to delete referral in database:', err);
      setReferrals(prev => prev.filter(r => r.id !== id));
    }
  };

  const convertInquiryToReferral = async (id: string) => {
    try {
      const res = await api.convertInquiryToReferral(id);
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: 'converted' } : item));
      if (res.convertedReferral) {
        setReferrals(prev => [res.convertedReferral, ...prev]);
      }
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to convert inquiry in database:', err);
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: 'converted' } : item));
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await api.deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      refreshDashboardData();
    } catch (err) {
      console.error('Failed to delete inquiry in database:', err);
      setInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const reassignPatientTask = (taskId: string, newClinicianName: string, newClinicianId?: string) => {
    setChartTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      assignedTo: newClinicianName,
      assignedClinicianId: newClinicianId || t.assignedClinicianId
    } : t));
  };

  const updatePatientTaskDetails = (taskId: string, updatedData: Partial<PatientChartTask>) => {
    setChartTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      ...updatedData
    } : t));
  };

  const deletePatientTask = (taskId: string) => {
    setChartTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addPatientTask = (taskData: Omit<PatientChartTask, 'id'>) => {
    const newTask: PatientChartTask = {
      id: `pct-${Date.now()}`,
      ...taskData
    };
    setChartTasks(prev => [newTask, ...prev]);
  };

  return (
    <HealthcareContext.Provider
      value={{
        theme,
        toggleTheme,
        organization,
        census,
        unassignedVisits7Days,
        intakeMetrics,
        scheduledSummary,
        refreshDashboardData,
        messages,
        addMessage,
        homeHealthEpisodes,
        addHomeHealthEpisode,
        communicationNotes,
        addCommunicationNote,
        orders,
        addHomeHealthOrder,
        incidentLogs,
        addIncidentLog,
        faceToFaceEncounters,
        addFaceToFaceEncounter,
        facilities,
        addFacility,
        pharmacies,
        addPharmacy,
        insurancePayers,
        addInsurancePayer,
        patients,
        visits,
        announcements,
        inquiries,
        referrals,
        clinicians,
        employeeVisits,
        unassignedVisits,
        huvSfvRecords,
        scheduleStats,
        scheduleMode,
        setScheduleMode,
        addEmployeeVisit,
        updateEmployeeVisitStatus,
        deleteEmployeeVisit,
        assignVisitToClinician,
        bulkAssignVisits,
        deleteUnassignedVisit,
        addUnassignedVisit,
        activeNavTab,
        setActiveNavTab,
        intakeSubTab,
        setIntakeSubTab,
        patientSubTab,
        setPatientSubTab,
        chartTasks,
        reassignPatientTask,
        updatePatientTaskDetails,
        deletePatientTask,
        addPatientTask,
        serviceFilter,
        setServiceFilter,
        searchQuery,
        setSearchQuery,
        unreadCount,
        markMessageRead,
        selectedMessage,
        setSelectedMessage,
        selectedPatient,
        setSelectedPatient,
        selectedInquiry,
        setSelectedInquiry,
        isNewPatientModalOpen,
        setIsNewPatientModalOpen,
        isInquiryModalOpen,
        setIsInquiryModalOpen,
        isNewReferralModalOpen,
        setIsNewReferralModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        activeVideo,
        setActiveVideo,
        addNewPatient,
        addNewInquiry,
        updateInquiry,
        addNewReferral,
        updateReferral,
        deleteReferral,
        convertInquiryToReferral,
        deleteInquiry,
        currentWebsite,
        setCurrentWebsite,
        homeHealthTab,
        setHomeHealthTab,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        connectModule,
        setConnectModule,
        connectRailTab,
        setConnectRailTab,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messagesMap,
        sendChatMessage,
        markConversationRead,
        callLogs,
        addCallLog,
        createNewConversation,
        fetchMessagesForConversation,
        refreshConnectConversations,
        plannerTasks,
        addPlannerTask,
        updatePlannerTaskStage,
        deletePlannerTask,
        activeCallModal,
        setActiveCallModal
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within HealthcareProvider');
  }
  return context;
};
