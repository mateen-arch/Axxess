import React, { createContext, useContext, useState } from 'react';
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
import { Patient, PatientChartTask, ScheduledVisit, MessageItem, AnnouncementItem, ServiceLine, Inquiry, Referral, EmployeeClinician, EmployeeVisit, UnassignedPatientVisit, HomeHealthEpisode, HomeHealthCommunicationNote, HomeHealthOrder, FaceToFaceEncounter, Facility, Pharmacy, InsurancePayer } from '../types';

interface HealthcareContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  organization: typeof initialOrganization;
  census: typeof initialCensus;
  intakeMetrics: typeof initialIntakeMetrics;
  scheduledSummary: typeof initialScheduledVisitsSummary;
  messages: MessageItem[];
  addMessage: (message: Omit<MessageItem, 'id'>) => void;
  homeHealthEpisodes: HomeHealthEpisode[];
  addHomeHealthEpisode: (episode: Omit<HomeHealthEpisode, 'id'>) => void;
  communicationNotes: HomeHealthCommunicationNote[];
  addCommunicationNote: (note: Omit<HomeHealthCommunicationNote, 'id'>) => void;
  orders: HomeHealthOrder[];
  addHomeHealthOrder: (order: Omit<HomeHealthOrder, 'id' | 'createdAt'>) => void;
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
  addNewPatient: (patient: Omit<Patient, 'id' | 'mrn'> & { mrn?: string }) => void;
  addNewInquiry: (inquiry: Omit<Inquiry, 'id'>) => void;
  addNewReferral: (referral: Omit<Referral, 'id'>) => void;
  deleteReferral: (id: string) => void;
  convertInquiryToReferral: (id: string) => void;
  deleteInquiry: (id: string) => void;

  // Platform Website Architecture ('hub' | 'central' | 'home_health' | 'connect')
  currentWebsite: 'hub' | 'central' | 'home_health' | 'connect';
  setCurrentWebsite: (site: 'hub' | 'central' | 'home_health' | 'connect') => void;

  // Axxess Connect & Planner Suite
  connectModule: 'connect' | 'planner';
  setConnectModule: (module: 'connect' | 'planner') => void;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messagesMap: Record<string, ChatMessage[]>;
  sendChatMessage: (conversationId: string, content: string, attachment?: ChatMessage['attachment']) => void;
  markConversationRead: (conversationId: string) => void;
  callLogs: CallLogItem[];
  addCallLog: (call: Omit<CallLogItem, 'id'>) => void;
  plannerTasks: PlannerTaskItem[];
  addPlannerTask: (task: Omit<PlannerTaskItem, 'id'>) => void;
  updatePlannerTaskStage: (taskId: string, stage: PlannerTaskStage) => void;
  deletePlannerTask: (taskId: string) => void;
  activeCallModal: { isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null;
  setActiveCallModal: (val: { isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null) => void;
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

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

  const [organization] = useState(initialOrganization);
  const [census] = useState(initialCensus);
  const [intakeMetrics] = useState(initialIntakeMetrics);
  const [scheduledSummary] = useState(initialScheduledVisitsSummary);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [homeHealthEpisodes, setHomeHealthEpisodes] = useState<HomeHealthEpisode[]>([]);
  const [communicationNotes, setCommunicationNotes] = useState<HomeHealthCommunicationNote[]>([]);
  const [orders, setOrders] = useState<HomeHealthOrder[]>([
    {
      id: 'ord-101',
      patientId: 'pat-1',
      patientName: 'Lantigua Gonzalez, Scarlet',
      episodeAssociated: '11/01/2026 - 12/30/2026',
      attendingPhysician: 'Dr. Anita Gupta, MD',
      sendTo: 'Dr. Anita Gupta, MD',
      date: '2026-11-06',
      time: '14:30',
      effectiveDate: '2026-11-06',
      orderIsForNextEpisode: false,
      summaryTitle: 'Skilled Nursing: Wound Vac Dressing Change 3x/wk',
      orderType: 'Discipline Frequency',
      orderReadBackAndVerified: true,
      clinicianSignature: 'Hilder M., RN',
      signatureDate: '2026-11-06',
      signatureTime: '14:32',
      status: 'Created',
      createdAt: '2026-11-06',
    },
    {
      id: 'ord-102',
      patientId: 'pat-2',
      patientName: 'Doshi, N Kundanika',
      episodeAssociated: '10/15/2026 - 12/13/2026',
      attendingPhysician: 'Dr. Michael Chen, MD',
      sendTo: 'Dr. Michael Chen, MD',
      date: '2026-11-07',
      time: '10:15',
      effectiveDate: '2026-11-07',
      orderIsForNextEpisode: false,
      summaryTitle: 'Medication Order: Lisinopril 10mg Daily PO',
      orderType: 'Medication Orders',
      orderReadBackAndVerified: true,
      clinicianSignature: 'Hilder M., RN',
      signatureDate: '2026-11-07',
      signatureTime: '10:18',
      status: 'Created',
      createdAt: '2026-11-07',
    },
  ]);
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
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [visits] = useState<ScheduledVisit[]>(initialVisits);
  const [announcements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');
  const [serviceFilter, setServiceFilter] = useState<'all' | ServiceLine>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [intakeSubTab, setIntakeSubTab] = useState<'inquiries' | 'referrals' | 'pipeline'>('referrals');
  const [patientSubTab, setPatientSubTab] = useState<'charts' | 'directory'>('charts');
  const [chartTasks, setChartTasks] = useState<PatientChartTask[]>(initialPatientChartTasks);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<AnnouncementItem | null>(null);

  const [clinicians] = useState<EmployeeClinician[]>(initialClinicians);
  const [employeeVisits, setEmployeeVisits] = useState<EmployeeVisit[]>(initialEmployeeVisits);
  const [unassignedVisits, setUnassignedVisits] = useState<UnassignedPatientVisit[]>(initialUnassignedVisits);

  // Platform Website Switcher ('hub' | 'central' | 'home_health' | 'connect')
  const [currentWebsite, setCurrentWebsite] = useState<'hub' | 'central' | 'home_health' | 'connect'>('hub');

  // Axxess Connect & Planner State
  const [connectModule, setConnectModule] = useState<'connect' | 'planner'>('connect');
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-care-abuissa');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(initialMessagesMap);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(initialCallLogs);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTaskItem[]>(initialPlannerTasks);
  const [activeCallModal, setActiveCallModal] = useState<{ isOpen: boolean; contactName: string; callType: 'audio' | 'video' } | null>(null);

  const sendChatMessage = (conversationId: string, content: string, attachment?: ChatMessage['attachment']) => {
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

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: {
              senderName: 'You',
              content: attachment ? `[Attachment: ${attachment.name}] ${content}` : content,
              timestamp: newMessage.timestamp,
              isRead: true
            }
          };
        }
        return c;
      })
    );
  };

  const markConversationRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const addCallLog = (call: Omit<CallLogItem, 'id'>) => {
    const newCall: CallLogItem = {
      ...call,
      id: `call-${Date.now()}`
    };
    setCallLogs(prev => [newCall, ...prev]);
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

  const addEmployeeVisit = (visitData: Omit<EmployeeVisit, 'id'>) => {
    const newVisit: EmployeeVisit = {
      id: `evst-${Date.now()}`,
      ...visitData
    };
    setEmployeeVisits(prev => [newVisit, ...prev]);
  };

  const updateEmployeeVisitStatus = (id: string, status: EmployeeVisit['status']) => {
    setEmployeeVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const deleteEmployeeVisit = (id: string) => {
    setEmployeeVisits(prev => prev.filter(v => v.id !== id));
  };

  const assignVisitToClinician = (visitId: string, clinicianId: string) => {
    const visit = unassignedVisits.find(v => v.id === visitId);
    const clinician = clinicians.find(c => c.id === clinicianId);
    if (!visit || !clinician) return;

    const dateObj = new Date(visit.scheduledDate + 'T00:00:00');
    const dayOfWeek = isNaN(dateObj.getDay()) ? 3 : dateObj.getDay();

    const newEmpVisit: EmployeeVisit = {
      id: `evst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
  };

  const bulkAssignVisits = (visitIds: string[], clinicianId: string) => {
    const clinician = clinicians.find(c => c.id === clinicianId);
    if (!clinician) return;

    const matchedVisits = unassignedVisits.filter(v => visitIds.includes(v.id));
    const newEmpVisits: EmployeeVisit[] = matchedVisits.map((visit, idx) => {
      const dateObj = new Date(visit.scheduledDate + 'T00:00:00');
      const dayOfWeek = isNaN(dateObj.getDay()) ? 3 : dateObj.getDay();

      return {
        id: `evst-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
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
    });

    setEmployeeVisits(prev => [...newEmpVisits, ...prev]);
    setUnassignedVisits(prev => prev.filter(v => !visitIds.includes(v.id)));
  };

  const deleteUnassignedVisit = (visitId: string) => {
    setUnassignedVisits(prev => prev.filter(v => v.id !== visitId));
  };

  const addUnassignedVisit = (visitData: Omit<UnassignedPatientVisit, 'id'>) => {
    const newVisit: UnassignedPatientVisit = {
      id: `uv-${Date.now()}`,
      ...visitData
    };
    setUnassignedVisits(prev => [newVisit, ...prev]);
  };

  const unreadCount = 169;

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const addMessage = (message: Omit<MessageItem, 'id'>) => {
    setMessages(prev => [{ ...message, id: `msg-${Date.now()}` }, ...prev]);
  };

  const addHomeHealthEpisode = (episode: Omit<HomeHealthEpisode, 'id'>) => {
    setHomeHealthEpisodes(prev => [{ ...episode, id: `episode-${Date.now()}` }, ...prev]);
  };

  const addCommunicationNote = (note: Omit<HomeHealthCommunicationNote, 'id'>) => {
    setCommunicationNotes(prev => [{ ...note, id: `note-${Date.now()}` }, ...prev]);
  };

  const addHomeHealthOrder = (order: Omit<HomeHealthOrder, 'id' | 'createdAt'>) => {
    const localDate = new Date().toISOString();
    setOrders(prev => [{ ...order, id: `order-${Date.now()}`, createdAt: localDate }, ...prev]);
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

  const addNewPatient = (newPatData: Omit<Patient, 'id' | 'mrn'> & { mrn?: string }) => {
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
  };

  const addNewInquiry = (inquiryData: Omit<Inquiry, 'id'>) => {
    const newInq: Inquiry = {
      id: `inq-${Date.now()}`,
      ...inquiryData
    };
    setInquiries(prev => [newInq, ...prev]);
  };

  const addNewReferral = (referralData: Omit<Referral, 'id'>) => {
    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      ...referralData
    };
    setReferrals(prev => [newRef, ...prev]);
  };

  const deleteReferral = (id: string) => {
    setReferrals(prev => prev.filter(r => r.id !== id));
  };

  const convertInquiryToReferral = (id: string) => {
    setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: 'converted' } : item));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(item => item.id !== id));
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
        intakeMetrics,
        scheduledSummary,
        messages,
        addMessage,
        homeHealthEpisodes,
        addHomeHealthEpisode,
        communicationNotes,
        addCommunicationNote,
        orders,
        addHomeHealthOrder,
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
        addNewReferral,
        deleteReferral,
        convertInquiryToReferral,
        deleteInquiry,
        currentWebsite,
        setCurrentWebsite,
        connectModule,
        setConnectModule,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messagesMap,
        sendChatMessage,
        markConversationRead,
        callLogs,
        addCallLog,
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
