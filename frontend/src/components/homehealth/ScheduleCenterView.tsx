import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Printer,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
  Download,
  MoreVertical,
  SlidersHorizontal,
  X,
  UserCheck,
  Stethoscope,
  Info,
  Check,
  Building,
  ClipboardList,
  CalendarDays,
  Layers,
  ChevronUp
} from 'lucide-react';
import { api } from '../../services/api';
import { useHealthcare } from '../../context/HealthcareContext';

interface ScheduleCenterViewProps {
  onBack?: () => void;
  onNavigateToChart?: (patientId: string) => void;
  initialTab?: string;
  onCloseSubTab?: () => void;
}

interface AuthorizationRecord {
  id: string;
  authNumber: string;
  payer: string;
  type: string;
  startDate: string;
  endDate: string;
  discipline: string;
  authorizedUnits: number;
  usedUnits: number;
  unusedUnits: number;
  unit: string;
  status: 'Approved' | 'In Review' | 'Archived';
  isArchived: boolean;
}

const INITIAL_AUTHORIZATIONS: AuthorizationRecord[] = [
  {
    id: 'auth-1',
    authNumber: 'AUTH-2026-89412',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 60,
    usedUnits: 26,
    unusedUnits: 34,
    unit: 'Visits',
    status: 'Approved',
    isArchived: false,
  },
  {
    id: 'auth-2',
    authNumber: 'AUTH-2026-89413',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'PT - Physical Therapy',
    authorizedUnits: 8,
    usedUnits: 1,
    unusedUnits: 7,
    unit: 'Visits',
    status: 'Approved',
    isArchived: false,
  },
  {
    id: 'auth-3',
    authNumber: 'AUTH-2026-89414',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'OT - Occupational Therapy',
    authorizedUnits: 4,
    usedUnits: 0,
    unusedUnits: 4,
    unit: 'Visits',
    status: 'In Review',
    isArchived: false,
  },
  {
    id: 'auth-4',
    authNumber: 'AUTH-2025-41092',
    payer: 'COMMONWEALTH CARE ALLIANCE',
    type: 'Prior Episode',
    startDate: '08/08/2025',
    endDate: '10/06/2025',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 30,
    usedUnits: 30,
    unusedUnits: 0,
    unit: 'Visits',
    status: 'Archived',
    isArchived: true,
  },
];

interface PatientListItem {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  branch: string;
  status: string;
  episodeStart?: string;
  episodeEnd?: string;
  attendingPhysician?: string;
  insuranceName?: string;
}

interface VisitItem {
  id: string;
  patientId: string;
  clinicianId?: string;
  assignedTo: string;
  task: string;
  scheduledDate: string;
  rawDate: string;
  timeSlot: string;
  status: string;
  discipline: string;
  isAlert?: boolean;
}

interface CalendarDayInfo {
  date: string;
  status: 'scheduled' | 'completed' | 'missed' | 'multiple' | 'none';
  count: number;
  tooltip: string;
  visits: Array<{ task: string; employeeName: string; timeSlot: string; status: string }>;
}

export const ScheduleCenterView: React.FC<ScheduleCenterViewProps> = ({
  onBack,
  onNavigateToChart,
  initialTab,
  onCloseSubTab,
}) => {
  const { patients: globalPatients, setHomeHealthTab } = useHealthcare();

  // State Management
  const [loading, setLoading] = useState<boolean>(true);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1061');
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<Record<string, CalendarDayInfo>>({});
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [lupaRisk, setLupaRisk] = useState<any>(null);

  // Filters (matching exact screenshot dropdowns)
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active Patients');
  const [selectedPayer, setSelectedPayer] = useState<string>('All');
  const [findSearch, setFindSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown States
  const [openEpisodeManager, setOpenEpisodeManager] = useState<boolean>(false);
  const [openScheduleManager, setOpenScheduleManager] = useState<boolean>(false);
  const [openActionsMenu, setOpenActionsMenu] = useState<boolean>(false);
  const [activeMenuVisitId, setActiveMenuVisitId] = useState<string | null>(null);

  // Calendar Hover Tooltip & Selection
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Bottom Scheduler Tray State (matching Screenshot 9)
  const [isSchedulerTrayOpen, setIsSchedulerTrayOpen] = useState<boolean>(false);
  const [schedulerDisciplineTab, setSchedulerDisciplineTab] = useState<string>('Nursing');
  const [trayVisitType, setTrayVisitType] = useState<string>('');
  const [trayUser, setTrayUser] = useState<string>('');
  const [trayDate, setTrayDate] = useState<string>('2026-11-06');
  const [activeEpisodeView, setActiveEpisodeView] = useState<'current' | 'prev'>('current');

  // Modals
  const [isNewEpisodeModalOpen, setIsNewEpisodeModalOpen] = useState<boolean>(false);
  const [isEpisodeManagerModalOpen, setIsEpisodeManagerModalOpen] = useState<boolean>(false);
  const [episodeManagerTab, setEpisodeManagerTab] = useState<'details' | 'frequencies' | 'inactive'>('details');
  const [isEpisodeFrequenciesModalOpen, setIsEpisodeFrequenciesModalOpen] = useState<boolean>(false);
  const [isInactiveEpisodesModalOpen, setIsInactiveEpisodesModalOpen] = useState<boolean>(false);
  const [isMasterCalendarModalOpen, setIsMasterCalendarModalOpen] = useState<boolean>(false);
  const [masterCalendarEpisode, setMasterCalendarEpisode] = useState<'current' | 'previous'>('current');
  const [showMissedVisitsOnly, setShowMissedVisitsOnly] = useState<boolean>(false);
  const [isReassignTasksModalOpen, setIsReassignTasksModalOpen] = useState<boolean>(false);
  const [isAuthorizationsModalOpen, setIsAuthorizationsModalOpen] = useState<boolean>(false);
  const [is30DayCalendarModalOpen, setIs30DayCalendarModalOpen] = useState<boolean>(false);
  const [billingPeriod30Day, setBillingPeriod30Day] = useState<'first' | 'second'>('first');
  const [episode30Day, setEpisode30Day] = useState<string>('current');
  const [isVisitDetailsModalOpen, setIsVisitDetailsModalOpen] = useState<boolean>(false);
  const [isQuickEmployeeSchedulerModalOpen, setIsQuickEmployeeSchedulerModalOpen] = useState<boolean>(false);

  // Authorizations Rich State
  const [authList, setAuthList] = useState<AuthorizationRecord[]>(INITIAL_AUTHORIZATIONS);
  const [showArchivedAuths, setShowArchivedAuths] = useState<boolean>(false);
  const [authSearchText, setAuthSearchText] = useState<string>('');
  const [isAddAuthModalOpen, setIsAddAuthModalOpen] = useState<boolean>(false);
  const [editingAuth, setEditingAuth] = useState<AuthorizationRecord | null>(null);
  const [viewingAuth, setViewingAuth] = useState<AuthorizationRecord | null>(null);
  const [authForm, setAuthForm] = useState({
    authNumber: 'AUTH-2026-90415',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 30,
    unit: 'Visits',
    status: 'Approved' as 'Approved' | 'In Review' | 'Archived',
  });

  // Specific Visit Modal State
  const [selectedVisitForModal, setSelectedVisitForModal] = useState<VisitItem | null>(null);
  const [reassignFromUser, setReassignFromUser] = useState<string>('');
  const [reassignToUser, setReassignToUser] = useState<string>('');
  const [reassignDateFrom, setReassignDateFrom] = useState<string>('10/26/2026');
  const [reassignDateTo, setReassignDateTo] = useState<string>('12/24/2026');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Episode Form State (matching Screenshot 3)
  const [episodeForm, setEpisodeForm] = useState({
    startOfCareDate: '10/26/2026',
    episodeStartDate: '12/25/2026',
    episodeEndDate: '02/22/2027',
    caseManager: 'Mary Kyalikunda RN',
    primaryPhysician: 'Rigali, Leslie DO',
    primaryInsurance: 'COMMONWEALTH CARE ALLIANCE',
    secondaryInsurance: '',
    visitAuthRequired: 'No',
    comments: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initialize Patient Roster from global patients & authentic screenshot roster
  useEffect(() => {
    const list: PatientListItem[] = (globalPatients || []).map((p: any) => ({
      id: p.id,
      mrn: p.mrn,
      firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Heather'),
      lastName: p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : 'Abuissa'),
      branch: p.branch || 'Standards Home Care',
      status: p.status || 'Active Patients',
      episodeStart: p.episodeStart || '10/26/2026',
      episodeEnd: p.episodeEnd || '12/24/2026',
      attendingPhysician: p.attendingPhysician || 'Rigali, Leslie DO',
      insuranceName: p.insuranceName || 'COMMONWEALTH CARE ALLIANCE',
    }));

    const defaultRoster = [
      { id: 'pat-1061', mrn: '1061', firstName: 'Heather', lastName: 'Abuissa' },
      { id: 'pat-1036', mrn: '1036', firstName: 'Marie V', lastName: 'Anis' },
      { id: 'pat-1042', mrn: '1042', firstName: 'Louis', lastName: 'Antoine' },
      { id: 'pat-1045', mrn: '1045', firstName: 'Jeffrey C', lastName: 'Antoniotti' },
      { id: 'pat-1050', mrn: '1050', firstName: 'Jocelene', lastName: 'Auguste' },
      { id: 'pat-1053', mrn: '1053', firstName: 'Isatou', lastName: 'Bah' },
      { id: 'pat-1055', mrn: '1055', firstName: 'James', lastName: 'Balian' },
      { id: 'pat-1058', mrn: '1058', firstName: 'Helen', lastName: 'Beattie' },
      { id: 'pat-1062', mrn: '1062', firstName: 'Sixta', lastName: 'Cabral' },
      { id: 'pat-1065', mrn: '1065', firstName: 'Cedenieze', lastName: 'Damitie' },
      { id: 'pat-1068', mrn: '1068', firstName: 'Janey', lastName: 'David' },
      { id: 'pat-1070', mrn: '1070', firstName: 'James', lastName: 'Davis' },
      { id: 'pat-1072', mrn: '1072', firstName: 'Javens J', lastName: 'Deceus' },
      { id: 'pat-1074', mrn: '1074', firstName: 'Tyler J', lastName: 'Deceus' },
      { id: 'pat-1078', mrn: '1078', firstName: 'Denise', lastName: 'Deguerre' },
      { id: 'pat-1081', mrn: '1081', firstName: 'Kenneth S', lastName: 'Demers' },
      { id: 'pat-1085', mrn: '1085', firstName: 'Maria', lastName: 'Depina' },
      { id: 'pat-1088', mrn: '1088', firstName: 'Adam', lastName: 'Diamond' },
    ];

    defaultRoster.forEach(def => {
      if (!list.some(p => p.mrn === def.mrn || p.lastName.toLowerCase() === def.lastName.toLowerCase())) {
        list.push({
          id: def.id,
          mrn: def.mrn,
          firstName: def.firstName,
          lastName: def.lastName,
          branch: 'Standards Home Care',
          status: 'Active Patients',
          episodeStart: '10/26/2026',
          episodeEnd: '12/24/2026',
          attendingPhysician: 'Rigali, Leslie DO',
          insuranceName: 'COMMONWEALTH CARE ALLIANCE'
        });
      }
    });

    list.sort((a, b) => {
      if (a.mrn === '1061' || a.lastName.toLowerCase() === 'abuissa') return -1;
      if (b.mrn === '1061' || b.lastName.toLowerCase() === 'abuissa') return 1;
      return a.lastName.localeCompare(b.lastName);
    });

    setPatients(list);
    if (!selectedPatientId && list.length > 0) {
      setSelectedPatientId(list[0].id);
    }
  }, [globalPatients]);

  // Sync with initial tab if accessed directly from sidebar collapsible
  useEffect(() => {
    if (initialTab === 'authorizations') {
      setIsAuthorizationsModalOpen(true);
    } else if (initialTab === 'episode-manager') {
      setIsEpisodeManagerModalOpen(true);
      setEpisodeManagerTab('details');
    } else if (initialTab === 'schedule-manager') {
      setIsMasterCalendarModalOpen(true);
    } else if (initialTab === 'thirty-day-calendar') {
      setIs30DayCalendarModalOpen(true);
    }
  }, [initialTab]);

  const generateFallbackScheduleData = (patId: string) => {
    const list: VisitItem[] = [];
    const daysMap: Record<string, CalendarDayInfo> = {};

    const start = new Date(2026, 9, 26);
    const end = new Date(2026, 11, 24);

    let cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;
      const scheduledDateStr = `${m}/${d}/${y}`;

      const isRecert = (m === '12' && d === '20');
      const isCompleted = cur < new Date(2026, 10, 1);

      const task = isRecert
        ? 'OASIS-E2 Recertification'
        : 'LPN - Oral Med. Management';
      const assignedTo = isRecert ? 'Mary Kyalikunda RN' : 'Mario Fortune LPN';
      const status = isCompleted ? 'Completed' : 'Not Yet Due';

      list.unshift({
        id: `vis-${dateKey}`,
        patientId: patId,
        assignedTo,
        task,
        scheduledDate: scheduledDateStr,
        rawDate: dateKey,
        timeSlot: '09:00 AM - 10:00 AM',
        status,
        discipline: 'Nursing',
        isAlert: isRecert
      });

      if (isRecert) {
        list.unshift({
          id: `vis-${dateKey}-po`,
          patientId: patId,
          assignedTo: 'Mary Kyalikunda RN',
          task: 'Physician Order',
          scheduledDate: scheduledDateStr,
          rawDate: dateKey,
          timeSlot: '10:00 AM - 10:30 AM',
          status: 'Not Yet Due',
          discipline: 'Nursing',
          isAlert: true
        });
        list.unshift({
          id: `vis-${dateKey}-vo`,
          patientId: patId,
          assignedTo: 'Mary Kyalikunda RN',
          task: 'VERBAL ORDER',
          scheduledDate: scheduledDateStr,
          rawDate: dateKey,
          timeSlot: '10:30 AM - 11:00 AM',
          status: 'Not Yet Due',
          discipline: 'Nursing',
          isAlert: true
        });
      }

      daysMap[dateKey] = {
        date: dateKey,
        status: isCompleted ? 'completed' : isRecert ? 'multiple' : 'scheduled',
        count: isRecert ? 3 : 1,
        tooltip: `${task} - ${assignedTo}`,
        visits: [
          {
            task,
            employeeName: assignedTo,
            timeSlot: '09:00 AM',
            status
          }
        ]
      };

      cur.setDate(cur.getDate() + 1);
    }

    return { visits: list, calendarDays: daysMap };
  };

  // 2. Fetch Schedule Center Data from Database
  const fetchScheduleCenterData = async (patientId: string) => {
    // Immediately sync patientDetail from current roster
    const matchedRosterPatient = patients.find(p => p.id === patientId || p.mrn === patientId);
    if (matchedRosterPatient) {
      setPatientDetail(matchedRosterPatient);
      setEpisodeForm(prev => ({
        ...prev,
        startOfCareDate: matchedRosterPatient.episodeStart || '10/26/2026',
        caseManager: 'Mary Kyalikunda RN',
        primaryPhysician: matchedRosterPatient.attendingPhysician || 'Rigali, Leslie DO',
        primaryInsurance: matchedRosterPatient.insuranceName || 'COMMONWEALTH CARE ALLIANCE'
      }));
    }

    try {
      setLoading(true);
      const data = await api.getScheduleCenterData(patientId);

      if (data) {
        if (data.patient) {
          setPatientDetail(data.patient);
        }
        let resolvedVisits = data.visits || [];
        let resolvedCalendar = data.calendarDays || {};

        if (!resolvedVisits || resolvedVisits.length === 0) {
          const fallback = generateFallbackScheduleData(patientId);
          resolvedVisits = fallback.visits;
          resolvedCalendar = fallback.calendarDays;
        }

        setVisits(resolvedVisits);
        setCalendarDays(resolvedCalendar);
        setClinicians(data.clinicians || []);
        setAuthorizations(data.authorizations ? [data.authorizations] : []);
        setLupaRisk(data.lupaRisk);

        if (data.patient) {
          setEpisodeForm(prev => ({
            ...prev,
            startOfCareDate: data.patient.startOfCareDate || '10/26/2026',
            caseManager: data.patient.caseManager || 'Mary Kyalikunda RN',
            primaryPhysician: data.patient.attendingPhysician || 'Rigali, Leslie DO',
            primaryInsurance: data.patient.primaryInsurance || 'COMMONWEALTH CARE ALLIANCE'
          }));
        }
      } else {
        const fallback = generateFallbackScheduleData(patientId);
        setVisits(fallback.visits);
        setCalendarDays(fallback.calendarDays);
      }
    } catch (err) {
      console.warn('Backend Schedule Center query returned fallback:', err);
      const fallback = generateFallbackScheduleData(patientId);
      setVisits(fallback.visits);
      setCalendarDays(fallback.calendarDays);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      fetchScheduleCenterData(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Filtered Patient List
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesBranch = selectedBranch === 'All' || p.branch.toLowerCase().includes(selectedBranch.toLowerCase());
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active Patients' && (p.status === 'active' || p.status === 'Active Patients' || !p.status)) ||
        (selectedStatus === 'Discharged Patients' && p.status === 'discharged') ||
        (selectedStatus === 'Pending Patients' && p.status === 'pending') ||
        (selectedStatus === 'Non-Admitted Patients' && p.status === 'non-admitted');

      const matchesPayer =
        selectedPayer === 'All' ||
        (selectedPayer.includes('Medicare') && (p.insuranceName || '').toLowerCase().includes('medicare')) ||
        (selectedPayer.includes('Medicaid') && (p.insuranceName || '').toLowerCase().includes('medicaid')) ||
        (selectedPayer === 'Private' && !(p.insuranceName || '').toLowerCase().includes('medi'));

      const search = findSearch.trim().toLowerCase();
      const matchesFind = !search ||
        p.lastName.toLowerCase().includes(search) ||
        p.firstName.toLowerCase().includes(search) ||
        p.mrn.includes(search);

      return matchesBranch && matchesStatus && matchesPayer && matchesFind;
    });
  }, [patients, selectedBranch, selectedStatus, selectedPayer, findSearch]);

  // Filtered Visits (by selected calendar date if clicked, or search query)
  const displayedVisits = useMemo(() => {
    let list = visits;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        v.task.toLowerCase().includes(q) ||
        v.assignedTo.toLowerCase().includes(q) ||
        v.scheduledDate.includes(q) ||
        v.status.toLowerCase().includes(q)
      );
    }
    if (selectedCalendarDate) {
      list = list.filter(v => v.rawDate === selectedCalendarDate);
    }
    return list;
  }, [visits, selectedCalendarDate, searchQuery]);

  // Handle Save New Episode (Screenshot 3)
  const handleSaveNewEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createEpisode({
        patientId: selectedPatientId,
        startOfCareDate: episodeForm.startOfCareDate,
        episodeStartDate: episodeForm.episodeStartDate,
        episodeEndDate: episodeForm.episodeEndDate,
        caseManager: episodeForm.caseManager,
        primaryPhysician: episodeForm.primaryPhysician,
        primaryInsurance: episodeForm.primaryInsurance,
        secondaryInsurance: episodeForm.secondaryInsurance,
        comments: episodeForm.comments
      });

      showToast('New Episode successfully created in patient chart!');
      setIsNewEpisodeModalOpen(false);
      fetchScheduleCenterData(selectedPatientId);
    } catch (err: any) {
      showToast(`Failed to create episode: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reassign Tasks (Screenshot 5)
  const handleConfirmReassignTasks = async () => {
    if (!reassignToUser) {
      showToast('Please select a recipient employee.');
      return;
    }
    try {
      setIsSubmitting(true);
      // Reassign first not yet due visit or batch
      const targetVisit = visits.find(v => v.status === 'Not Yet Due') || visits[0];
      if (targetVisit) {
        await api.reassignScheduleCenterVisit({
          visitId: targetVisit.id,
          clinicianName: reassignToUser
        });
      }
      showToast(`Tasks from ${reassignDateFrom} to ${reassignDateTo} reassigned to ${reassignToUser}.`);
      setIsReassignTasksModalOpen(false);
      fetchScheduleCenterData(selectedPatientId);
    } catch (err: any) {
      showToast(`Failed to reassign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save from Bottom Scheduler Tray (Screenshot 9)
  const handleSaveTraySchedule = async () => {
    if (!trayVisitType || !trayDate) {
      showToast('Please select a visit type and date.');
      return;
    }
    try {
      setIsSubmitting(true);
      const chosenClinician = clinicians.find(c => c.name === trayUser || c.id === trayUser);
      await api.batchScheduleVisits({
        patientId: selectedPatientId,
        employeeId: chosenClinician?.id,
        visitType: trayVisitType,
        dates: [trayDate],
        timeSlot: '10:00 AM - 11:30 AM',
        postToAxxessCare: false
      });

      showToast(`Scheduled ${trayVisitType} on ${trayDate}`);
      setTrayVisitType('');
      fetchScheduleCenterData(selectedPatientId);
    } catch (err: any) {
      showToast(`Error scheduling: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Month Calendar Helper Function
  const renderMonthCalendar = (
    year: number,
    month: number,
    monthLabel: string
  ) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const days = [];

    // Blank cells before month start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <div
          key={`blank-${i}`}
          className="h-7 border border-pearl-200/80 dark:border-charcoal-700/80 bg-pearl-100/40 dark:bg-charcoal-850/40"
        />
      );
    }

    // Days in Month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const dayData = calendarDays[dateKey];
      const isSelected = selectedCalendarDate === dateKey;

      // Color coding (NO BLUE!)
      let cellBg = 'bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30';
      if (dayData) {
        if (dayData.status === 'multiple') {
          cellBg = 'bg-purple-600 dark:bg-purple-700 text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'completed') {
          cellBg = 'bg-emerald-600 dark:bg-emerald-700 text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'missed') {
          cellBg = 'bg-amber-600 dark:bg-amber-700 text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'scheduled') {
          cellBg = 'bg-rose-600 dark:bg-rose-700 text-white font-bold hover:brightness-110';
        }
      }

      // Disabled if outside active episode (10/26/2026 - 12/24/2026)
      const isOutsideEpisode =
        (year === 2026 && month === 9 && d < 26) ||
        (year === 2026 && month === 11 && d > 24) ||
        year > 2026 ||
        (year === 2026 && month < 9);

      if (isOutsideEpisode) {
        cellBg = 'bg-pearl-100/70 dark:bg-charcoal-850 text-slate-300 dark:text-slate-600 line-through';
      }

      days.push(
        <button
          type="button"
          key={dateKey}
          onClick={() => {
            setSelectedCalendarDate(prev => (prev === dateKey ? null : dateKey));
            setTrayDate(dateKey);
          }}
          onMouseEnter={(e) => {
            if (dayData && dayData.tooltip) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPosition({ x: rect.left, y: rect.top - 60 });
              setHoveredDate(dateKey);
            }
          }}
          onMouseLeave={() => {
            setHoveredDate(null);
            setHoverPosition(null);
          }}
          className={`h-7 text-xs border border-pearl-200/90 dark:border-charcoal-700 flex items-center justify-center transition-all cursor-pointer select-none relative ${cellBg} ${
            isSelected ? 'ring-2 ring-rose-500 ring-offset-1 z-10 scale-105 shadow-md' : ''
          }`}
          title={dayData?.tooltip || `${dateKey}: Click to inspect or schedule`}
        >
          <span>{d}</span>
          {dayData && dayData.count > 1 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300"></span>
          )}
        </button>
      );
    }

    return (
      <div className="flex-1 min-w-[200px] max-w-[280px] bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
        {/* Month Header Banner (NO BLUE!) */}
        <div className="bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 text-xs font-black py-2 text-center tracking-wider uppercase border-b border-rose-200/70 dark:border-rose-900/40">
          {monthLabel}
        </div>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-[10px] font-bold text-center bg-pearl-50 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 py-1 border-b border-pearl-200 dark:border-charcoal-700">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        {/* Grid Cells */}
        <div className="grid grid-cols-7">{days}</div>
      </div>
    );
  };

  const currentPatientName = patientDetail
    ? `${patientDetail.lastName?.toUpperCase()}, ${patientDetail.firstName?.toUpperCase()}`
    : 'ABUISSA, HEATHER';

  return (
    <div className="flex flex-col h-full w-full bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans text-xs select-none">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Schedule"
            aria-label="Return to Schedule"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                CareOrbit Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Schedule
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Schedule Center
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currentPatientName} • 10/26/2026 - 12/24/2026
              </span>
              <span>•</span>
              <span className="truncate">{patientDetail?.branch || 'Standards Home Care'}</span>
            </div>
          </div>
        </div>

        {/* Search bar & quick actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden md:block w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, clinicians, MRN..."
              className="w-full rounded-xl border border-pearl-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchScheduleCenterData(selectedPatientId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 transition shadow-2xs cursor-pointer"
            title="Refresh Real-Time Schedule Data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-rose-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Main Split View: Left Patient Roster & Right Interactive Schedule */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Filter Ribbon & Patients Table */}
        <div className="w-64 sm:w-72 md:w-80 border-r border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 flex flex-col shrink-0">
          {/* Top Button: Add New Patient */}
          <div className="p-2 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/40">
            <button
              type="button"
              onClick={() => setHomeHealthTab('create-patient')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add New Patient</span>
            </button>
          </div>

          {/* Filter Dropdowns (Matching Screenshots 10, 11, 12) */}
          <div className="p-2.5 space-y-1.5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/20 dark:bg-charcoal-850">
            {/* Branch Dropdown */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400 w-16">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="flex-1 py-1 px-2 rounded border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
              >
                <option value="All">All</option>
                <option value="Standards Home Care">Standards Home Care</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400 w-16">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 py-1 px-2 rounded border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
              >
                <option value="Active Patients">Active Patients</option>
                <option value="Discharged Patients">Discharged Patients</option>
                <option value="Pending Patients">Pending Patients</option>
                <option value="Non-Admitted Patients">Non-Admitted Patients</option>
                <option value="All">All</option>
              </select>
            </div>

            {/* Payer Dropdown */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400 w-16">Payer</label>
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="flex-1 py-1 px-2 rounded border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
              >
                <option value="All">All</option>
                <option value="Medicare (Traditional)">Medicare (Traditional)</option>
                <option value="Medicare (HMO/Managed Care)">Medicare (HMO/Managed Care)</option>
                <option value="Medicaid (Traditional)">Medicaid (Traditional)</option>
                <option value="Medicaid (HMO/Managed Care)">Medicaid (HMO/Managed Care)</option>
                <option value="Workers' Compensation">Workers' Compensation</option>
                <option value="Title Programs">Title Programs</option>
                <option value="Other Government">Other Government</option>
                <option value="Private">Private</option>
                <option value="Private HMO/Managed Care">Private HMO/Managed Care</option>
                <option value="Self Pay">Self Pay</option>
                <option value="Unknown">Unknown</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Find Search Input */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400 w-16">Find</label>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Find patient..."
                  value={findSearch}
                  onChange={(e) => setFindSearch(e.target.value)}
                  className="w-full py-1 pl-2 pr-7 rounded border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-medium"
                />
                {findSearch && (
                  <button
                    type="button"
                    onClick={() => setFindSearch('')}
                    className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Patient Roster Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-pearl-100 dark:bg-charcoal-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 border-b border-pearl-200 dark:border-charcoal-700 z-10">
                <tr>
                  <th className="py-2 px-3">Last Name</th>
                  <th className="py-2 px-3">First Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {filteredPatients.map((p) => {
                  const isSelected = p.id === selectedPatientId || p.mrn === selectedPatientId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setPatientDetail(p);
                        fetchScheduleCenterData(p.id);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-rose-600 text-white font-bold'
                          : 'hover:bg-rose-50/50 dark:hover:bg-charcoal-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <td className="py-1.5 px-3 uppercase">{p.lastName}</td>
                      <td className="py-1.5 px-3 capitalize">{p.firstName}</td>
                    </tr>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-slate-400 font-semibold">
                      No patients found matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Main Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-pearl-50/40 dark:bg-charcoal-900">
          {/* Patient Banner: Episode Selector & LUPA Risk */}
          <div className="p-3 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const next = activeEpisodeView === 'current' ? 'prev' : 'current';
                  setActiveEpisodeView(next);
                  if (next === 'prev') {
                    setPatientDetail((prev: any) => prev ? { ...prev, episodeStart: '08/27/2026', episodeEnd: '10/25/2026' } : null);
                    showToast('Loaded Previous Episode (08/27/2026 - 10/25/2026)');
                  } else {
                    setPatientDetail((prev: any) => prev ? { ...prev, episodeStart: '10/26/2026', episodeEnd: '12/24/2026' } : null);
                    showToast('Loaded Current Episode (10/26/2026 - 12/24/2026)');
                  }
                }}
                className="px-2.5 py-1 rounded border border-pearl-300 dark:border-charcoal-700 bg-pearl-100 dark:bg-charcoal-750 hover:bg-pearl-200 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                {activeEpisodeView === 'current' ? '« Previous Episode' : 'Next Episode »'}
              </button>
            </div>

            {/* Centered LUPA Risk Badge */}
            <div className="flex items-center space-x-2">
              <div
                className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-xs tracking-wide flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs cursor-help"
                title={lupaRisk?.description || 'Patient visits exceed CMS LUPA threshold.'}
              >
                <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{lupaRisk?.riskLevel || 'Low LUPA Risk'}</span>
              </div>
            </div>

            {/* Patient Episode Dropdown & Actions Menu (Screenshot 8) */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <select
                  value={activeEpisodeView}
                  onChange={(e) => {
                    const next = e.target.value as 'current' | 'prev';
                    setActiveEpisodeView(next);
                    if (next === 'prev') {
                      setPatientDetail((prev: any) => prev ? { ...prev, episodeStart: '08/27/2026', episodeEnd: '10/25/2026' } : null);
                    } else {
                      setPatientDetail((prev: any) => prev ? { ...prev, episodeStart: '10/26/2026', episodeEnd: '12/24/2026' } : null);
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-extrabold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="current">
                    {currentPatientName} 10/26/2026 - 12/24/2026
                  </option>
                  <option value="prev">
                    {currentPatientName} 08/27/2026 - 10/25/2026
                  </option>
                </select>
              </div>

              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenActionsMenu(!openActionsMenu)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Actions</span>
                  <ChevronDown size={12} />
                </button>
                {openActionsMenu && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsEpisodeManagerModalOpen(true);
                        setEpisodeManagerTab('details');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <ClipboardList size={13} className="text-rose-600" />
                      <span>Episode Manager</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsMasterCalendarModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <Calendar size={13} className="text-rose-600" />
                      <span>Master Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsEpisodeManagerModalOpen(true);
                        setEpisodeManagerTab('frequencies');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <ClipboardList size={13} className="text-rose-600" />
                      <span>Episode Frequencies</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsEpisodeManagerModalOpen(true);
                        setEpisodeManagerTab('inactive');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <Clock size={13} className="text-rose-600" />
                      <span>Inactive Episodes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIs30DayCalendarModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <CalendarDays size={13} className="text-rose-600" />
                      <span>30-Day Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsAuthorizationsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <Shield size={13} className="text-rose-600" />
                      <span>Authorizations</span>
                    </button>
                    <div className="border-t border-pearl-100 dark:border-charcoal-700 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        fetchScheduleCenterData(selectedPatientId);
                        showToast('Schedule data refreshed from database.');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <RefreshCw size={13} className="text-rose-600" />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        window.print();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <Printer size={13} className="text-rose-600" />
                      <span>Print Schedule</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3-Month Interactive Mini Calendar Figure */}
          <div className="p-4 bg-pearl-50/60 dark:bg-charcoal-850/40 border-b border-pearl-200 dark:border-charcoal-700 relative">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {renderMonthCalendar(2026, 9, 'Oct 2026')}
              {renderMonthCalendar(2026, 10, 'Nov 2026')}
              {renderMonthCalendar(2026, 11, 'Dec 2026')}
            </div>

            {/* Hover Tooltip */}
            {hoveredDate && hoverPosition && calendarDays[hoveredDate] && (
              <div
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                }}
                className="fixed z-50 pointer-events-none transform -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl text-[11px] leading-tight border border-rose-500/40"
              >
                <div className="font-extrabold pb-0.5 border-b border-white/20 text-rose-300">
                  {new Date(hoveredDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="pt-1 font-medium space-y-0.5">
                  {calendarDays[hoveredDate].visits.map((vi, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-white">{vi.task}</span> - <span className="text-slate-300">{vi.employeeName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Day Inspector when any calendar date is clicked */}
            {selectedCalendarDate && (
              <div className="mx-auto max-w-3xl mt-4 p-3.5 rounded-2xl bg-white dark:bg-charcoal-800 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-center justify-between flex-wrap gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{new Date(selectedCalendarDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        {displayedVisits.length} {displayedVisits.length === 1 ? 'Visit' : 'Visits'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {displayedVisits.length > 0 
                        ? displayedVisits.map(v => `${v.task} (${v.assignedTo})`).join(' • ')
                        : 'No visits currently scheduled for this date.'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTrayDate(selectedCalendarDate);
                      setIsSchedulerTrayOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-xs shadow-xs hover:from-rose-700 hover:to-rose-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Schedule on this Day</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300 font-bold text-xs hover:text-rose-600 transition cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )}

            {/* Legend Below Calendars (NO BLUE!) */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600"></span>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-600"></span>
                <span>Missed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
                <span>Multiple</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-pearl-200 dark:bg-charcoal-700 border border-pearl-300 dark:border-charcoal-600"></span>
                <span>Disabled</span>
              </div>
            </div>
          </div>

          {/* Action Row: View Patient Chart & Hide/Show Scheduler Toggle (Screenshot 9) */}
          <div className="px-4 py-2.5 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToChart) {
                  onNavigateToChart(selectedPatientId);
                } else {
                  setHomeHealthTab('patient-charts');
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 font-black text-xs text-white transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            >
              <ExternalLink size={13} />
              <span>View Patient Chart</span>
            </button>

            <div className="flex items-center space-x-2">
              {selectedCalendarDate && (
                <div className="flex items-center space-x-1.5 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-200 dark:border-rose-900/50">
                  <span>Filtered to: {selectedCalendarDate}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="hover:text-rose-950 dark:hover:text-rose-200 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {/* Show / Hide Scheduler Toggle (Screenshot 9) */}
              <button
                type="button"
                onClick={() => setIsSchedulerTrayOpen(!isSchedulerTrayOpen)}
                className="px-3.5 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-750 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              >
                <span>{isSchedulerTrayOpen ? 'Hide Scheduler' : 'Show Schedulers'}</span>
                {isSchedulerTrayOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          </div>

          {/* Bottom Scheduler Tray (Matching Screenshot 9) */}
          {isSchedulerTrayOpen && (
            <div className="bg-rose-50/40 dark:bg-charcoal-850/80 border-b border-pearl-200 dark:border-charcoal-700 p-4 animate-fade-in">
              {/* Discipline Tabs */}
              <div className="flex items-center space-x-1.5 mb-3 overflow-x-auto">
                {[
                  'Nursing',
                  'HHA',
                  'MSW/Other',
                  'Therapy',
                  'Dietitian',
                  'Orders/Care Plans',
                  'Daily/Outlier'
                ].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSchedulerDisciplineTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      schedulerDisciplineTab === tab
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs'
                        : 'bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 border border-pearl-200 dark:border-charcoal-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Task Form Row */}
              <div className="bg-white dark:bg-charcoal-800 p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-[300px]">
                  <div className="flex-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Task</label>
                    <select
                      value={trayVisitType}
                      onChange={(e) => setTrayVisitType(e.target.value)}
                      className="w-full mt-0.5 py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      <option value="">-- Select Visit Type --</option>
                      <option value="LPN - Oral Med. Management">LPN - Oral Med. Management</option>
                      <option value="Skilled Nursing Visit">Skilled Nursing Visit</option>
                      <option value="OASIS-E2 Recertification">OASIS-E2 Recertification</option>
                      <option value="Physician Order">Physician Order</option>
                      <option value="VERBAL ORDER">VERBAL ORDER</option>
                      <option value="Physical Therapy Assessment">Physical Therapy Assessment</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">User</label>
                    <select
                      value={trayUser}
                      onChange={(e) => setTrayUser(e.target.value)}
                      className="w-full mt-0.5 py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      <option value="">-- Select User --</option>
                      <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                      <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                      <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                      <option value="Sarah Jenkins, RN">Sarah Jenkins, RN</option>
                    </select>
                  </div>

                  <div className="w-40">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Date</label>
                    <input
                      type="date"
                      value={trayDate}
                      onChange={(e) => setTrayDate(e.target.value)}
                      className="w-full mt-0.5 py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTrayVisitType('');
                      setTrayUser('');
                    }}
                    className="mt-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                    title="Clear"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleSaveTraySchedule}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSchedulerTrayOpen(false)}
                    className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-700 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Visits Table (NO Post to Axxess Care button) */}
          <div className="flex-1 overflow-x-auto p-4">
            <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase border-b border-rose-100 dark:border-rose-900/40">
                  <tr>
                    <th className="py-3 px-3 text-center w-8">A</th>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Scheduled Date ▾</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4 min-w-[125px] whitespace-nowrap">Status</th>
                    <th className="py-3 px-2 text-center w-10"></th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                  {displayedVisits.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-rose-50/30 dark:hover:bg-charcoal-800 transition-colors"
                    >
                      {/* Priority Alert Icon */}
                      <td className="py-3 px-3 text-center">
                        {v.isAlert ? (
                          <span title="Physician signature or recertification evaluation" className="inline-block text-rose-600 font-black">
                            !
                          </span>
                        ) : null}
                      </td>

                      {/* Task Name with Info Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span>{v.task}</span>
                          <span
                            title={`Discipline: ${v.discipline} | Time: ${v.timeSlot}`}
                            className="text-slate-400 hover:text-rose-600 cursor-help"
                          >
                            <Info size={12} />
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {v.scheduledDate}
                      </td>

                      {/* Assigned Clinician */}
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        <span className="font-bold text-rose-700 dark:text-rose-400">
                          {v.assignedTo}
                        </span>
                      </td>

                      {/* Visit Status */}
                      <td className="py-3 px-4 whitespace-nowrap min-w-[125px]">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap leading-none select-none shadow-2xs shrink-0 ${
                            v.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                              : v.status === 'Missed'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              v.status === 'Completed'
                                ? 'bg-emerald-500'
                                : v.status === 'Missed'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span className="whitespace-nowrap">{v.status}</span>
                        </span>
                      </td>

                      {/* Print Icon Button */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVisitForModal(v);
                            showToast(`Printing visit sheet for ${v.task} (${v.scheduledDate})`);
                          }}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Print Visit Form"
                        >
                          <Printer size={13} />
                        </button>
                      </td>

                      {/* Action Menu (Menu ▾ only, NO Post to Axxess Care) */}
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuVisitId(activeMenuVisitId === v.id ? null : v.id)
                            }
                            className="font-extrabold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-0.5 cursor-pointer ml-auto"
                          >
                            <span>Menu</span>
                            <ChevronDown size={11} />
                          </button>

                          {/* Menu Dropdown */}
                          {activeMenuVisitId === v.id && (
                            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuVisitId(null);
                                  setSelectedVisitForModal(v);
                                  setIsVisitDetailsModalOpen(true);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 cursor-pointer"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuVisitId(null);
                                  setSelectedVisitForModal(v);
                                  setReassignFromUser(v.assignedTo);
                                  setIsReassignTasksModalOpen(true);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 cursor-pointer"
                              >
                                Reassign
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuVisitId(null);
                                  setVisits(prev => prev.map(item => item.id === v.id ? { ...item, status: 'Completed' } : item));
                                  showToast(`Marked ${v.task} as Completed.`);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50/50 dark:hover:bg-charcoal-700 font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                              >
                                Mark Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedVisits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No visits found for the selected date filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Modal: New Episode (Screenshot 3) */}
      {isNewEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-3 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50 dark:bg-charcoal-850">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                New Episode: {currentPatientName}
              </h3>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                *Required Field
              </span>
            </div>

            <form onSubmit={handleSaveNewEpisode} className="p-5 space-y-4">
              {/* Card 1: Patient */}
              <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Patient
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block">Patient:</label>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
                      {currentPatientName}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block">
                      Start of Care Date: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={episodeForm.startOfCareDate}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, startOfCareDate: e.target.value })}
                      className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tip Text */}
              <div className="text-xs font-bold text-slate-500 italic">
                Tip: Last Episode end date is :- {patientDetail?.episodeEnd || '12/24/2026'}
              </div>

              {/* Card 2: Details */}
              <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 space-y-3">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Episode Start Date: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={episodeForm.episodeStartDate}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, episodeStartDate: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Episode End Date: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={episodeForm.episodeEndDate}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, episodeEndDate: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Case Manager:
                      </label>
                      <select
                        value={episodeForm.caseManager}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, caseManager: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                      >
                        <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                        <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                        <option value="Sarah Jenkins, RN">Sarah Jenkins, RN</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Visit Authorization Required:
                      </label>
                      <div className="flex items-center space-x-4 mt-1.5">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="visitAuth"
                            checked={episodeForm.visitAuthRequired === 'Yes'}
                            onChange={() => setEpisodeForm({ ...episodeForm, visitAuthRequired: 'Yes' })}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="visitAuth"
                            checked={episodeForm.visitAuthRequired === 'No'}
                            onChange={() => setEpisodeForm({ ...episodeForm, visitAuthRequired: 'No' })}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Primary Physician: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={episodeForm.primaryPhysician}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, primaryPhysician: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Primary Insurance: <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={episodeForm.primaryInsurance}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, primaryInsurance: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                      >
                        <option value="COMMONWEALTH CARE ALLIANCE">COMMONWEALTH CARE ALLIANCE</option>
                        <option value="MEDICARE MASSACHUSETTS">MEDICARE MASSACHUSETTS</option>
                        <option value="MEDICAID MASSACHUSETTS">MEDICAID MASSACHUSETTS</option>
                        <option value="BLUE CROSS BLUE SHIELD">BLUE CROSS BLUE SHIELD</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Secondary Insurance:
                      </label>
                      <select
                        value={episodeForm.secondaryInsurance}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, secondaryInsurance: e.target.value })}
                        className="w-full mt-1 py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                      >
                        <option value="">-- Select Insurance --</option>
                        <option value="MASSHEALTH STANDARD">MASSHEALTH STANDARD</option>
                        <option value="AETNA SENIOR SUPPLEMENT">AETNA SENIOR SUPPLEMENT</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Comments (Clinical Sticky Note) */}
              <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block"></span>
                  <span>Episode Clinical Sticky Note / Comments</span>
                </span>
                <textarea
                  rows={3}
                  value={episodeForm.comments}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, comments: e.target.value })}
                  placeholder="Enter episode notes or authorization directives..."
                  className="w-full p-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-medium"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewEpisodeModalOpen(false)}
                  className="px-6 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-750 hover:bg-pearl-100 font-bold text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Comprehensive Modal: Episode Manager (Directives, Frequencies, Inactive Episodes) */}
      {(isEpisodeManagerModalOpen || isEpisodeFrequenciesModalOpen || isInactiveEpisodesModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  Episode Manager | {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEpisodeManagerModalOpen(false);
                  setIsEpisodeFrequenciesModalOpen(false);
                  setIsInactiveEpisodesModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="text-white hover:text-white/80 p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-850">
              <button
                type="button"
                onClick={() => setEpisodeManagerTab('details')}
                className={`px-4 py-2 font-black text-xs border-b-2 cursor-pointer transition ${
                  episodeManagerTab === 'details'
                    ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-900 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Directives & Details
              </button>
              <button
                type="button"
                onClick={() => setEpisodeManagerTab('frequencies')}
                className={`px-4 py-2 font-black text-xs border-b-2 cursor-pointer transition ${
                  episodeManagerTab === 'frequencies'
                    ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-900 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Episode Frequencies
              </button>
              <button
                type="button"
                onClick={() => setEpisodeManagerTab('inactive')}
                className={`px-4 py-2 font-black text-xs border-b-2 cursor-pointer transition ${
                  episodeManagerTab === 'inactive'
                    ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-900 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Inactive Episodes
              </button>
            </div>

            {/* Tab 1: Directives & Details */}
            {episodeManagerTab === 'details' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Start of Care Date:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.startOfCareDate}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, startOfCareDate: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Case Manager:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.caseManager}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, caseManager: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Episode Start Date:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.episodeStartDate}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, episodeStartDate: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Episode End Date:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.episodeEndDate}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, episodeEndDate: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Primary Attending Physician:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.primaryPhysician}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, primaryPhysician: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Primary Insurance:
                    </label>
                    <input
                      type="text"
                      value={episodeForm.primaryInsurance}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, primaryInsurance: e.target.value })}
                      className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Clinical Directives & Comments:
                  </label>
                  <textarea
                    rows={3}
                    value={episodeForm.comments}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, comments: e.target.value })}
                    placeholder="Enter episode directives, orders adherence, or specialized physician instructions..."
                    className="w-full p-2.5 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEpisodeForm({
                        startOfCareDate: patientDetail?.episodeStart || '10/26/2026',
                        episodeStartDate: patientDetail?.episodeStart || '10/26/2026',
                        episodeEndDate: patientDetail?.episodeEnd || '12/24/2026',
                        caseManager: 'Mary Kyalikunda RN',
                        primaryPhysician: patientDetail?.attendingPhysician || 'Rigali, Leslie DO',
                        primaryInsurance: patientDetail?.insuranceName || 'COMMONWEALTH CARE ALLIANCE',
                        secondaryInsurance: '',
                        visitAuthRequired: 'No',
                        comments: ''
                      });
                      showToast('Form reset to saved values.');
                    }}
                    className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-pearl-100 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (patientDetail) {
                        setPatientDetail({
                          ...patientDetail,
                          episodeStart: episodeForm.episodeStartDate,
                          episodeEnd: episodeForm.episodeEndDate,
                          attendingPhysician: episodeForm.primaryPhysician,
                          insuranceName: episodeForm.primaryInsurance
                        });
                      }
                      showToast('Episode details and directives saved successfully!');
                    }}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                  >
                    Save Episode Changes
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Episode Frequencies */}
            {episodeManagerTab === 'frequencies' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="rounded-xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 font-extrabold">
                      <tr>
                        <th className="p-3">Visit Type</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3 text-center">Visit Count</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-semibold">
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">SN - Skilled Nursing</td>
                        <td className="p-3">Daily, x60 days</td>
                        <td className="p-3 text-center font-black text-rose-600">58</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">PT - Physical Therapy</td>
                        <td className="p-3">For Eval and Treat</td>
                        <td className="p-3 text-center font-black text-rose-600">1</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">OT - Occupational Therapy</td>
                        <td className="p-3 text-slate-400">—</td>
                        <td className="p-3 text-center text-slate-400">0</td>
                        <td className="p-3 text-right text-slate-400">Inactive</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">ST - Speech Therapy</td>
                        <td className="p-3 text-slate-400">—</td>
                        <td className="p-3 text-center text-slate-400">0</td>
                        <td className="p-3 text-right text-slate-400">Inactive</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">MSW - Social Work</td>
                        <td className="p-3 text-slate-400">—</td>
                        <td className="p-3 text-center text-slate-400">0</td>
                        <td className="p-3 text-right text-slate-400">Inactive</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">HHA - Home Health Aide</td>
                        <td className="p-3 text-slate-400">—</td>
                        <td className="p-3 text-center text-slate-400">0</td>
                        <td className="p-3 text-right text-slate-400">Inactive</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-800 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Total Ordered Episode Visits: <strong className="text-rose-600 font-black">59 Visits</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast('Episode frequencies synchronized with patient chart orders.')}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold cursor-pointer hover:from-rose-700 hover:to-rose-800 shadow-2xs"
                  >
                    Sync Frequencies
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Inactive Episodes */}
            {episodeManagerTab === 'inactive' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="border border-pearl-200 dark:border-charcoal-700 rounded-xl overflow-hidden">
                  <div className="bg-pearl-100 dark:bg-charcoal-800 py-2 px-3 font-black text-xs text-slate-700 dark:text-slate-300">
                    Inactive Episodes Archive
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-pearl-50 dark:bg-charcoal-750 text-slate-600 dark:text-slate-400 font-extrabold">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Episode Range</th>
                        <th className="py-2.5 px-3 text-left">Payer</th>
                        <th className="py-2.5 px-3 text-center">Visits</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-semibold">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">08/08/2025 - 10/06/2025</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">MEDICARE ADVANTAGE</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">50 Completed</td>
                        <td className="py-2.5 px-3 text-right space-x-2 text-rose-600 font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              if (patientDetail) {
                                setPatientDetail({
                                  ...patientDetail,
                                  episodeStart: '08/08/2025',
                                  episodeEnd: '10/06/2025'
                                });
                              }
                              showToast('Activated episode range 08/08/2025 - 10/06/2025.');
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Activate
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEpisodeForm(prev => ({
                                ...prev,
                                episodeStartDate: '08/08/2025',
                                episodeEndDate: '10/06/2025'
                              }));
                              setEpisodeManagerTab('details');
                              showToast('Loaded 08/08/2025 - 10/06/2025 for editing.');
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">01/09/2026 - 03/09/2026</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">MASSHEALTH STANDARD</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">42 Completed</td>
                        <td className="py-2.5 px-3 text-right space-x-2 text-rose-600 font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              if (patientDetail) {
                                setPatientDetail({
                                  ...patientDetail,
                                  episodeStart: '01/09/2026',
                                  episodeEnd: '03/09/2026'
                                });
                              }
                              showToast('Activated episode range 01/09/2026 - 03/09/2026.');
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Activate
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEpisodeForm(prev => ({
                                ...prev,
                                episodeStartDate: '01/09/2026',
                                episodeEndDate: '03/09/2026'
                              }));
                              setEpisodeManagerTab('details');
                              showToast('Loaded 01/09/2026 - 03/09/2026 for editing.');
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsEpisodeManagerModalOpen(false);
                  setIsEpisodeFrequenciesModalOpen(false);
                  setIsInactiveEpisodesModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Master Calendar (Schedule Manager) */}
      {isMasterCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-rose-200" />
                <span className="font-extrabold text-xs tracking-wide">
                  Master Calendar | {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMasterCalendarModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="text-white hover:text-white/80 p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = masterCalendarEpisode === 'current' ? 'previous' : 'current';
                    setMasterCalendarEpisode(next);
                    showToast(next === 'previous' ? 'Loaded Previous Episode (08/27/2026 - 10/25/2026)' : 'Loaded Current Episode (10/26/2026 - 12/24/2026)');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold transition cursor-pointer"
                >
                  {masterCalendarEpisode === 'current' ? '« Previous Episode' : 'Next Episode »'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReassignTasksModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition cursor-pointer"
                >
                  Reassign Tasks
                </button>
                <label className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMissedVisitsOnly}
                    onChange={(e) => setShowMissedVisitsOnly(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Show Missed Visits Only</span>
                </label>
              </div>

              <div className="text-right text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white">
                  Episode: {masterCalendarEpisode === 'current' ? '10/26/2026 - 12/24/2026' : '08/27/2026 - 10/25/2026'}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  SN: Daily, x60 days • PT: For Eval & Treat
                </div>
              </div>
            </div>

            {/* Master Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700 border-collapse">
                <thead className="bg-pearl-100 dark:bg-charcoal-800 text-center font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700 w-16">Week</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Sunday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Monday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Tuesday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Wednesday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Thursday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Friday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Saturday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-200 dark:divide-charcoal-700 font-medium">
                  {/* Week 1 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 1</td>
                    <td className="p-2 border bg-slate-50 dark:bg-charcoal-900/50"></td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/26</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-1',
                            patientId: selectedPatientId,
                            assignedTo: 'Mary Kyalikunda RN',
                            task: 'OASIS-E2 Start of Care',
                            scheduledDate: '10/26/2026',
                            rawDate: '2026-10-26',
                            timeSlot: '09:00 AM - 11:00 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-black text-emerald-600 cursor-pointer"
                      >
                        OASIS SOC
                      </button>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/27</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-2',
                            patientId: selectedPatientId,
                            assignedTo: 'Mario Fortune LPN',
                            task: 'LVN/LPN VISIT',
                            scheduledDate: '10/27/2026',
                            rawDate: '2026-10-27',
                            timeSlot: '10:00 AM - 11:00 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        LVN/LPN VISIT
                      </button>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/28</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-3',
                            patientId: selectedPatientId,
                            assignedTo: 'Mario Fortune LPN',
                            task: 'LPN - ORAL MED. MANAGEMENT',
                            scheduledDate: '10/28/2026',
                            rawDate: '2026-10-28',
                            timeSlot: '09:30 AM - 10:30 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        LPN - ORAL MED.
                      </button>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/29</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-4',
                            patientId: selectedPatientId,
                            assignedTo: 'Mario Fortune LPN',
                            task: 'LPN - ORAL MED. MANAGEMENT',
                            scheduledDate: '10/29/2026',
                            rawDate: '2026-10-29',
                            timeSlot: '09:30 AM - 10:30 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        LPN - ORAL MED.
                      </button>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/30</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-5',
                            patientId: selectedPatientId,
                            assignedTo: 'Mario Fortune LPN',
                            task: 'LPN - ORAL MED. MANAGEMENT',
                            scheduledDate: '10/30/2026',
                            rawDate: '2026-10-30',
                            timeSlot: '09:30 AM - 10:30 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        LPN - ORAL MED.
                      </button>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/31</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVisitForModal({
                            id: 'mc-6',
                            patientId: selectedPatientId,
                            assignedTo: 'Mario Fortune LPN',
                            task: 'LPN - ORAL MED. MANAGEMENT',
                            scheduledDate: '10/31/2026',
                            rawDate: '2026-10-31',
                            timeSlot: '09:30 AM - 10:30 AM',
                            status: 'Completed',
                            discipline: 'Nursing'
                          });
                          setIsVisitDetailsModalOpen(true);
                        }}
                        className="text-left w-full hover:underline font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        LPN - ORAL MED.
                      </button>
                    </td>
                  </tr>

                  {/* Week 2 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 2</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/01</div>
                      <div className="font-bold text-rose-600">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/02</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/03</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/04</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/05</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/06</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/07</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                  </tr>

                  {/* Week 3 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 3</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/08</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/09</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                      <div className="font-black text-rose-700">PT EVAL</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/10</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/11</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/12</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/13</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/14</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                  </tr>

                  {/* Week 4 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 4</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/15</div>
                      <div className="font-bold text-amber-600">LVN SUP VISIT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/16</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/17</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/18</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/19</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/20</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/21</div>
                      <div className="font-bold">LPN - ORAL MED.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsMasterCalendarModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Reassign Tasks */}
      {isReassignTasksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Reassign Tasks
              </h3>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                *Required Field
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Patient Name:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {currentPatientName}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Employee From:
                </label>
                <select
                  value={reassignFromUser}
                  onChange={(e) => setReassignFromUser(e.target.value)}
                  className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                >
                  <option value="">-- All Assigned Employees --</option>
                  <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                  <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                  <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Employee To: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignToUser}
                  onChange={(e) => setReassignToUser(e.target.value)}
                  className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                >
                  <option value="">-- Select Recipient User --</option>
                  <option value="Sarah Jenkins, RN">Sarah Jenkins, RN</option>
                  <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                  <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                  <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Date From:
                  </label>
                  <input
                    type="text"
                    value={reassignDateFrom}
                    onChange={(e) => setReassignDateFrom(e.target.value)}
                    className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Date To:
                  </label>
                  <input
                    type="text"
                    value={reassignDateTo}
                    onChange={(e) => setReassignDateTo(e.target.value)}
                    className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 italic">
                Note: Only tasks that are not started and not yet due will be reassigned.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={handleConfirmReassignTasks}
                disabled={isSubmitting || !reassignToUser}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? 'Reassigning...' : 'Reassign'}
              </button>
              <button
                type="button"
                onClick={() => setIsReassignTasksModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-pearl-300 dark:bg-charcoal-750 font-bold text-xs text-slate-700 dark:text-slate-300 transition hover:bg-pearl-400 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Authorization List (with Real CRUD & Filtering) */}
      {isAuthorizationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  Authorization List | {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAuthorizationsModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthForm({
                    authNumber: `AUTH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                    payer: patientDetail?.primaryInsurance || 'MASSHEALTH STANDARD',
                    type: 'Initial Episode',
                    startDate: '10/26/2026',
                    endDate: '12/24/2026',
                    discipline: 'SN - Skilled Nursing',
                    authorizedUnits: 20,
                    unit: 'Visits',
                    status: 'Approved'
                  });
                  setIsAddAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                + Add Authorization
              </button>

              <div className="flex-1 max-w-sm mx-4">
                <input
                  type="text"
                  placeholder="Search by Auth #, payer, discipline..."
                  value={authSearchText}
                  onChange={(e) => setAuthSearchText(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowArchivedAuths(!showArchivedAuths)}
                className={`px-4 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  showArchivedAuths
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                {showArchivedAuths ? 'Show Active Authorizations' : 'Archived Authorizations'}
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700 rounded-lg overflow-hidden">
                <thead className="bg-pearl-100 dark:bg-charcoal-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5 text-left">Authorization #</th>
                    <th className="p-2.5 text-left">Payer</th>
                    <th className="p-2.5 text-left">Type</th>
                    <th className="p-2.5 text-left">Start Date</th>
                    <th className="p-2.5 text-left">End Date</th>
                    <th className="p-2.5 text-left">Discipline</th>
                    <th className="p-2.5 text-center">Auth Units</th>
                    <th className="p-2.5 text-center">Used</th>
                    <th className="p-2.5 text-center">Unused</th>
                    <th className="p-2.5 text-left">Unit</th>
                    <th className="p-2.5 text-left">Status</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                  {authList
                    .filter(a => {
                      if (showArchivedAuths) {
                        if (a.status !== 'Archived') return false;
                      } else {
                        if (a.status === 'Archived') return false;
                      }
                      if (authSearchText.trim()) {
                        const q = authSearchText.toLowerCase();
                        return (
                          a.authNumber.toLowerCase().includes(q) ||
                          a.payer.toLowerCase().includes(q) ||
                          a.discipline.toLowerCase().includes(q) ||
                          a.status.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition">
                        <td className="p-2.5 font-mono font-bold text-rose-600">{a.authNumber}</td>
                        <td className="p-2.5 font-bold">{a.payer}</td>
                        <td className="p-2.5">{a.type}</td>
                        <td className="p-2.5">{a.startDate}</td>
                        <td className="p-2.5">{a.endDate}</td>
                        <td className="p-2.5 font-bold">{a.discipline}</td>
                        <td className="p-2.5 text-center font-bold">{a.authorizedUnits}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-600">{a.usedUnits}</td>
                        <td className="p-2.5 text-center font-bold text-amber-600">
                          {Math.max(0, a.authorizedUnits - a.usedUnits)}
                        </td>
                        <td className="p-2.5">{a.unit}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            a.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                              : a.status === 'In Review'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-charcoal-700 dark:text-slate-300 border-slate-300'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right space-x-2 text-rose-600 font-bold">
                          <button
                            type="button"
                            onClick={() => setEditingAuth(a)}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => setViewingAuth(a)}
                            className="hover:underline cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  {authList.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 font-semibold">
                        No authorizations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Total Authorizations: {authList.length} records
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAuthorizationsModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Add Authorization */}
      {isAddAuthModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                New Authorization
              </h4>
              <button
                type="button"
                onClick={() => setIsAddAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAuthList(prev => [
                  {
                    id: `auth-${Date.now()}`,
                    authNumber: authForm.authNumber,
                    payer: authForm.payer,
                    type: authForm.type,
                    startDate: authForm.startDate,
                    endDate: authForm.endDate,
                    discipline: authForm.discipline,
                    authorizedUnits: Number(authForm.authorizedUnits) || 10,
                    usedUnits: 0,
                    unusedUnits: Number(authForm.authorizedUnits) || 10,
                    unit: authForm.unit,
                    status: authForm.status as any,
                    isArchived: authForm.status === 'Archived'
                  },
                  ...prev
                ]);
                setIsAddAuthModalOpen(false);
                showToast(`Authorization ${authForm.authNumber} added successfully.`);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Authorization #</label>
                  <input
                    type="text"
                    required
                    value={authForm.authNumber}
                    onChange={(e) => setAuthForm({ ...authForm, authNumber: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Payer</label>
                  <input
                    type="text"
                    required
                    value={authForm.payer}
                    onChange={(e) => setAuthForm({ ...authForm, payer: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="text"
                    required
                    value={authForm.startDate}
                    onChange={(e) => setAuthForm({ ...authForm, startDate: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">End Date</label>
                  <input
                    type="text"
                    required
                    value={authForm.endDate}
                    onChange={(e) => setAuthForm({ ...authForm, endDate: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Discipline</label>
                  <select
                    value={authForm.discipline}
                    onChange={(e) => setAuthForm({ ...authForm, discipline: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  >
                    <option value="SN - Skilled Nursing">SN - Skilled Nursing</option>
                    <option value="PT - Physical Therapy">PT - Physical Therapy</option>
                    <option value="OT - Occupational Therapy">OT - Occupational Therapy</option>
                    <option value="ST - Speech Therapy">ST - Speech Therapy</option>
                    <option value="HHA - Home Health Aide">HHA - Home Health Aide</option>
                    <option value="MSW - Social Work">MSW - Social Work</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Authorized Units</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={authForm.authorizedUnits}
                    onChange={(e) => setAuthForm({ ...authForm, authorizedUnits: Number(e.target.value) || 1 })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAuthModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-pearl-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold shadow-xs cursor-pointer"
                >
                  Save Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Edit Authorization */}
      {editingAuth && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Edit Authorization: {editingAuth.authNumber}
              </h4>
              <button
                type="button"
                onClick={() => setEditingAuth(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Authorized Units</label>
                  <input
                    type="number"
                    value={editingAuth.authorizedUnits}
                    onChange={(e) => setEditingAuth({ ...editingAuth, authorizedUnits: Number(e.target.value) || 1 })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Used Units</label>
                  <input
                    type="number"
                    value={editingAuth.usedUnits}
                    onChange={(e) => setEditingAuth({ ...editingAuth, usedUnits: Number(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">End Date</label>
                  <input
                    type="text"
                    value={editingAuth.endDate}
                    onChange={(e) => setEditingAuth({ ...editingAuth, endDate: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Status</label>
                  <select
                    value={editingAuth.status}
                    onChange={(e) => setEditingAuth({ ...editingAuth, status: e.target.value as any })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-semibold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="In Review">In Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAuth(null)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-pearl-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthList(prev => prev.map(a => a.id === editingAuth.id ? editingAuth : a));
                    setEditingAuth(null);
                    showToast(`Updated authorization ${editingAuth.authNumber}.`);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: View Authorization */}
      {viewingAuth && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-rose-600" />
                <span>Authorization Details: {viewingAuth.authNumber}</span>
              </h4>
              <button
                type="button"
                onClick={() => setViewingAuth(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                  <span className="text-slate-500 block text-[10px] font-bold">Payer</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAuth.payer}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                  <span className="text-slate-500 block text-[10px] font-bold">Discipline</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAuth.discipline}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                  <span className="text-slate-500 block text-[10px] font-bold">Validity Period</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAuth.startDate} - {viewingAuth.endDate}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                  <span className="text-slate-500 block text-[10px] font-bold">Status</span>
                  <span className="font-extrabold text-emerald-600">{viewingAuth.status}</span>
                </div>
              </div>

              {/* Progress Meter */}
              <div className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400">Unit Utilization:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {viewingAuth.usedUnits} of {viewingAuth.authorizedUnits} {viewingAuth.unit} ({Math.round((viewingAuth.usedUnits / viewingAuth.authorizedUnits) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-pearl-200 dark:bg-charcoal-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-700 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((viewingAuth.usedUnits / viewingAuth.authorizedUnits) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
                  <span>Used: {viewingAuth.usedUnits}</span>
                  <span>Remaining: {Math.max(0, viewingAuth.authorizedUnits - viewingAuth.usedUnits)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingAuth(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: 30-Day Calendar */}
      {is30DayCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarDays size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  30-Day Calendar | {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIs30DayCalendarModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Stats Banner */}
            <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2">
              <div className="font-black text-sm text-slate-900 dark:text-white">
                {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
              </div>
              <div className="flex items-center space-x-6 text-xs font-extrabold">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">LUPA Risk: </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                    LOW
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">LUPA Threshold: </span>
                  <span className="text-slate-900 dark:text-white font-black">
                    {billingPeriod30Day === 'first' ? '3 visits' : '4 visits'}
                  </span>
                </div>
              </div>
              <div className="font-extrabold text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-200">
                {billingPeriod30Day === 'first' ? 'First 30-Day Payment Period' : 'Second 30-Day Payment Period'}
              </div>
            </div>

            {/* Episode & Billing Period Selectors */}
            <div className="px-4 py-2.5 bg-white dark:bg-charcoal-800 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-500">Episode:</span>
                  <select
                    value={episode30Day}
                    onChange={(e) => setEpisode30Day(e.target.value)}
                    className="border border-pearl-300 dark:border-charcoal-700 py-1 px-2.5 rounded-lg font-semibold bg-white dark:bg-charcoal-900"
                  >
                    <option value="current">10/26/2026 - 12/24/2026</option>
                    <option value="prev">08/08/2025 - 10/06/2025</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-500">Billing Period:</span>
                  <select
                    value={billingPeriod30Day}
                    onChange={(e) => {
                      const val = e.target.value as 'first' | 'second';
                      setBillingPeriod30Day(val);
                      showToast(val === 'first' ? 'Loaded First 30 Days (10/26 - 11/24)' : 'Loaded Second 30 Days (11/25 - 12/24)');
                    }}
                    className="border border-pearl-300 dark:border-charcoal-700 py-1 px-2.5 rounded-lg font-semibold bg-white dark:bg-charcoal-900"
                  >
                    <option value="first">First 30 Days (10/26 - 11/24)</option>
                    <option value="second">Second 30 Days (11/25 - 12/24)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIs30DayCalendarModalOpen(false);
                  setIsEpisodeManagerModalOpen(true);
                  setEpisodeManagerTab('frequencies');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition cursor-pointer"
              >
                View Frequency & Duration
              </button>
            </div>

            {/* Status Legend */}
            <div className="px-4 py-2 bg-pearl-50/70 dark:bg-charcoal-850 flex items-center justify-center space-x-6 text-[11px] font-bold">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Complete</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>Scheduled</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span>Multiple</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Missed</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Not Yet Due</span>
              </span>
            </div>

            {/* Calendar Table Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700 border-collapse rounded-lg overflow-hidden">
                <thead className="bg-pearl-100 dark:bg-charcoal-800 text-center font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Sunday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Monday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Tuesday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Wednesday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Thursday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Friday</th>
                    <th className="p-2 border border-pearl-200 dark:border-charcoal-700">Saturday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-200 dark:divide-charcoal-700 font-medium">
                  {billingPeriod30Day === 'first' ? (
                    <>
                      {/* Row 1: Oct 26 - Oct 31 */}
                      <tr>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 bg-pearl-50/40"></td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/26</div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVisitForModal({
                                id: 'cal30-1',
                                patientId: selectedPatientId,
                                assignedTo: 'Mary Kyalikunda RN',
                                task: 'OASIS-E2 Start of Care',
                                scheduledDate: '10/26/2026',
                                rawDate: '2026-10-26',
                                timeSlot: '09:00 AM - 11:00 AM',
                                status: 'Completed',
                                discipline: 'Nursing'
                              });
                              setIsVisitDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left w-full cursor-pointer hover:bg-emerald-700 transition"
                          >
                            <div>OASIS-E2 Start of Care</div>
                            <div className="text-[9px] opacity-90">Exported · Mary Kyalikunda</div>
                          </button>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/27</div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVisitForModal({
                                id: 'cal30-2',
                                patientId: selectedPatientId,
                                assignedTo: 'Mario Fortune LPN',
                                task: 'LVN/LPN Visit',
                                scheduledDate: '10/27/2026',
                                rawDate: '2026-10-27',
                                timeSlot: '10:00 AM - 11:00 AM',
                                status: 'Completed',
                                discipline: 'Nursing'
                              });
                              setIsVisitDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left w-full cursor-pointer hover:bg-emerald-700 transition"
                          >
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Completed · Mario Fortune</div>
                          </button>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/28</div>
                          <div className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Completed · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/29</div>
                          <div className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Completed · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/30</div>
                          <div className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Completed · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">10/31</div>
                          <div className="p-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Completed · Mario Fortune</div>
                          </div>
                        </td>
                      </tr>

                      {/* Row 2: Nov 1 - Nov 7 */}
                      <tr>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/01</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/02</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/03</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/04</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/05</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/06</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/07</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {/* Second 30 Days: Nov 25 - Dec 24 */}
                      <tr>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/25</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/26</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/27</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/28</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/29</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">11/30</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/01</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/20</div>
                          <div className="p-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>OASIS Recertification</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mary Kyalikunda</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/21</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/22</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/23</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>LVN/LPN Visit</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mario Fortune</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 align-top">
                          <div className="font-bold text-slate-400 text-[10px]">12/24</div>
                          <div className="p-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold mt-1 shadow-xs text-left">
                            <div>Episode End Summary</div>
                            <div className="text-[9px] opacity-90">Scheduled · Mary Kyalikunda</div>
                          </div>
                        </td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 bg-pearl-50/40"></td>
                        <td className="p-2 border border-pearl-200 dark:border-charcoal-700 h-20 bg-pearl-50/40"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 text-right">
              <button
                type="button"
                onClick={() => {
                  setIs30DayCalendarModalOpen(false);
                  onCloseSubTab?.();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Modal: Quick Employee Scheduler (Screenshot 4 - NO Post to Axxess Care) */}
      {isQuickEmployeeSchedulerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <Users size={16} className="text-rose-600" />
                <span>Quick Employee Scheduler</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickEmployeeSchedulerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold w-28 text-slate-600 dark:text-slate-400">User/Employee:</label>
                <select
                  value={trayUser}
                  onChange={(e) => setTrayUser(e.target.value)}
                  className="flex-1 py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">User: Select Option</option>
                  <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                  <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                  <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                  <option value="Sarah Jenkins, RN">Sarah Jenkins, RN</option>
                </select>
                <button
                  type="button"
                  onClick={() => setTrayUser('Alexandria Nelson, RN')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Assign to me
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold w-28 text-slate-600 dark:text-slate-400">Visit Type:</label>
                <select
                  value={trayVisitType}
                  onChange={(e) => setTrayVisitType(e.target.value)}
                  className="flex-1 py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">Visit Type: Select Option</option>
                  <option value="LPN - Oral Med. Management">LPN - Oral Med. Management</option>
                  <option value="Skilled Nursing Visit">Skilled Nursing Visit</option>
                  <option value="OASIS-E2 Recertification">OASIS-E2 Recertification</option>
                  <option value="Physician Order">Physician Order</option>
                </select>
              </div>

              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 pt-2">
                To schedule visits for the selected user, select the desired date below:
              </div>

              <div className="w-52">
                <input
                  type="date"
                  value={trayDate}
                  onChange={(e) => setTrayDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 text-xs font-semibold bg-white dark:bg-charcoal-800 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsQuickEmployeeSchedulerModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-pearl-200 dark:bg-charcoal-750 font-bold text-xs hover:bg-pearl-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSaveTraySchedule();
                  setIsQuickEmployeeSchedulerModalOpen(false);
                }}
                disabled={isSubmitting || !trayVisitType}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Modal: Visit Details */}
      {isVisitDetailsModalOpen && selectedVisitForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-6">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <FileText size={16} className="text-rose-600" />
                <span>Visit Details: {selectedVisitForModal.task}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVisitDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <span className="font-bold text-slate-500 block">Patient:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <span className="font-bold text-slate-500 block">Assigned Employee:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.assignedTo}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <span className="font-bold text-slate-500 block">Scheduled Window:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.scheduledDate} · {selectedVisitForModal.timeSlot}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <span className="font-bold text-slate-500 block">Status:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.status}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Directives:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Oral medication supervision, adherence verification, vital signs check, and diabetic wound observation. Report blood pressure & glucose readings if outside parameters.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedVisitForModal.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisits(prev => prev.map(item => item.id === selectedVisitForModal.id ? { ...item, status: 'Completed' } : item));
                      setSelectedVisitForModal({ ...selectedVisitForModal, status: 'Completed' });
                      showToast(`Marked ${selectedVisitForModal.task} as Completed.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Check size={14} />
                    <span>Mark as Completed</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setReassignFromUser(selectedVisitForModal.assignedTo);
                    setIsVisitDetailsModalOpen(false);
                    setIsReassignTasksModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
                >
                  Reassign Task
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsVisitDetailsModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs border border-white/20 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default ScheduleCenterView;
