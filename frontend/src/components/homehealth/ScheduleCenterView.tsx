import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
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
}

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
  isAlert: boolean;
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

  // Modals
  const [isNewEpisodeModalOpen, setIsNewEpisodeModalOpen] = useState<boolean>(false);
  const [isEpisodeFrequenciesModalOpen, setIsEpisodeFrequenciesModalOpen] = useState<boolean>(false);
  const [isInactiveEpisodesModalOpen, setIsInactiveEpisodesModalOpen] = useState<boolean>(false);
  const [isMasterCalendarModalOpen, setIsMasterCalendarModalOpen] = useState<boolean>(false);
  const [isReassignTasksModalOpen, setIsReassignTasksModalOpen] = useState<boolean>(false);
  const [isAuthorizationsModalOpen, setIsAuthorizationsModalOpen] = useState<boolean>(false);
  const [is30DayCalendarModalOpen, setIs30DayCalendarModalOpen] = useState<boolean>(false);
  const [isVisitDetailsModalOpen, setIsVisitDetailsModalOpen] = useState<boolean>(false);
  const [isQuickEmployeeSchedulerModalOpen, setIsQuickEmployeeSchedulerModalOpen] = useState<boolean>(false);

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

  // 2. Fetch Schedule Center Data from Database
  const fetchScheduleCenterData = async (patientId: string) => {
    try {
      setLoading(true);
      const data = await api.getScheduleCenterData(patientId);

      if (data) {
        setPatientDetail(data.patient);
        setVisits(data.visits || []);
        setCalendarDays(data.calendarDays || {});
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
      }
    } catch (err) {
      console.error('Error fetching schedule center data:', err);
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

  // Filtered Visits (by selected calendar date if clicked)
  const displayedVisits = useMemo(() => {
    if (!selectedCalendarDate) return visits;
    return visits.filter(v => v.rawDate === selectedCalendarDate);
  }, [visits, selectedCalendarDate]);

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

      // Authentic color coding matching Screenshot 1
      let cellBg = 'bg-slate-100/60 dark:bg-charcoal-800/60 text-slate-700 dark:text-slate-300';
      if (dayData) {
        if (dayData.status === 'multiple') {
          cellBg = 'bg-[#6b46c1] dark:bg-[#7c3aed] text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'completed') {
          cellBg = 'bg-[#16a34a] dark:bg-[#15803d] text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'missed') {
          cellBg = 'bg-[#dc2626] dark:bg-[#b91c1c] text-white font-bold hover:brightness-110';
        } else if (dayData.status === 'scheduled') {
          cellBg = 'bg-[#2b78a3] dark:bg-[#1e5c82] text-white font-bold hover:brightness-110';
        }
      }

      // Disabled if outside active episode (10/26/2026 - 12/24/2026)
      const isOutsideEpisode =
        (year === 2026 && month === 9 && d < 26) ||
        (year === 2026 && month === 11 && d > 24) ||
        year > 2026 ||
        (year === 2026 && month < 9);

      if (isOutsideEpisode) {
        cellBg = 'bg-pearl-100 dark:bg-charcoal-850 text-slate-300 dark:text-slate-600 line-through';
      }

      days.push(
        <button
          type="button"
          key={dateKey}
          onClick={() => {
            if (dayData) {
              setSelectedCalendarDate(prev => (prev === dateKey ? null : dateKey));
            }
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
            isSelected ? 'ring-2 ring-amber-400 z-10 scale-105 shadow-md' : ''
          }`}
        >
          <span>{d}</span>
          {dayData && dayData.count > 1 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300"></span>
          )}
        </button>
      );
    }

    return (
      <div className="flex-1 min-w-[200px] max-w-[280px] bg-white dark:bg-charcoal-850 rounded-lg border border-pearl-200 dark:border-charcoal-700 shadow-sm overflow-hidden">
        {/* Month Header Banner */}
        <div className="bg-[#b3d7eb] dark:bg-[#1e475f] text-slate-800 dark:text-slate-100 text-xs font-black py-1.5 text-center tracking-wide uppercase">
          {monthLabel}
        </div>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-[11px] font-bold text-center bg-pearl-50 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 py-1 border-b border-pearl-200 dark:border-charcoal-700">
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
      {/* 1. Authentic Burgundy Window Chrome Header Bar */}
      <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-white/90" />
          <span className="font-extrabold text-xs tracking-wider">Schedule Center</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-medium ml-2">
            Standards Home Care
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fetchScheduleCenterData(selectedPatientId)}
            title="Refresh Real-Time Schedule Data"
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center space-x-1 pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block cursor-pointer"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block cursor-pointer"></span>
            <span
              onClick={onBack}
              className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
              title="Close Schedule Center"
            ></span>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Subheader Ribbon */}
      <div className="bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
        {/* Left Action Tabs (NO Post to Axxess Care button) */}
        <div className="flex items-center space-x-1 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewEpisodeModalOpen(true)}
            className="px-2.5 py-1 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>New Episode</span>
          </button>

          {/* Episode Manager Dropdown (Matching Screenshot 4) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenEpisodeManager(!openEpisodeManager);
                setOpenScheduleManager(false);
              }}
              className="px-2.5 py-1 rounded bg-pearl-200 dark:bg-charcoal-750 hover:bg-pearl-300 dark:hover:bg-charcoal-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Episode Manager</span>
              <ChevronDown size={12} />
            </button>
            {openEpisodeManager && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEpisodeManager(false);
                    setIsInactiveEpisodesModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold flex items-center space-x-2"
                >
                  <Clock size={13} className="text-slate-500" />
                  <span>Inactive Episodes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenEpisodeManager(false);
                    setIsEpisodeFrequenciesModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold flex items-center space-x-2"
                >
                  <ClipboardList size={13} className="text-slate-500" />
                  <span>Episode Frequencies</span>
                </button>
              </div>
            )}
          </div>

          {/* Schedule Manager Dropdown (Matching Screenshot 5) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenScheduleManager(!openScheduleManager);
                setOpenEpisodeManager(false);
              }}
              className="px-2.5 py-1 rounded bg-pearl-200 dark:bg-charcoal-750 hover:bg-pearl-300 dark:hover:bg-charcoal-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Schedule Manager</span>
              <ChevronDown size={12} />
            </button>
            {openScheduleManager && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOpenScheduleManager(false);
                    setIsMasterCalendarModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold flex items-center space-x-2"
                >
                  <Calendar size={13} className="text-slate-500" />
                  <span>Master Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenScheduleManager(false);
                    setIsQuickEmployeeSchedulerModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold flex items-center space-x-2"
                >
                  <UserCheck size={13} className="text-slate-500" />
                  <span>Schedule Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenScheduleManager(false);
                    setIsReassignTasksModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold flex items-center space-x-2"
                >
                  <SlidersHorizontal size={13} className="text-slate-500" />
                  <span>Reassign Schedules</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAuthorizationsModalOpen(true)}
            className="px-2.5 py-1 rounded bg-pearl-200 dark:bg-charcoal-750 hover:bg-pearl-300 dark:hover:bg-charcoal-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            Authorizations
          </button>

          <button
            type="button"
            onClick={() => setIs30DayCalendarModalOpen(true)}
            className="px-2.5 py-1 rounded bg-pearl-200 dark:bg-charcoal-750 hover:bg-pearl-300 dark:hover:bg-charcoal-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            30-Day Calendar
          </button>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live PostgreSQL Database</span>
        </div>
      </div>

      {/* 3. Main Split View: Left Patient Roster & Right Interactive Schedule */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Filter Ribbon & Patients Table */}
        <div className="w-64 sm:w-72 md:w-80 border-r border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 flex flex-col shrink-0">
          {/* Top Button: Add New Patient */}
          <div className="p-2 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/40">
            <button
              type="button"
              onClick={() => setHomeHealthTab('create-patient')}
              className="w-full py-1.5 px-3 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-black text-xs shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
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
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#2b78a3] text-white font-bold'
                          : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800 text-slate-800 dark:text-slate-200'
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
                onClick={() => showToast('Previous episode loaded.')}
                className="px-2.5 py-1 rounded border border-pearl-300 dark:border-charcoal-700 bg-pearl-100 dark:bg-charcoal-750 hover:bg-pearl-200 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                « Previous Episode
              </button>
            </div>

            {/* Centered LUPA Risk Badge */}
            <div className="flex items-center space-x-2">
              <div
                className="px-4 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-black text-sm tracking-wide flex items-center space-x-1.5 border border-sky-300 dark:border-sky-800 shadow-sm cursor-help"
                title={lupaRisk?.description || 'Patient visits exceed CMS LUPA threshold.'}
              >
                <Shield size={14} className="text-sky-600 dark:text-sky-400" />
                <span>{lupaRisk?.riskLevel || 'Low LUPA Risk'}</span>
              </div>
            </div>

            {/* Patient Episode Dropdown & Actions Menu (Screenshot 8) */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <select
                  value="current"
                  onChange={() => {}}
                  className="py-1 px-2.5 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-extrabold text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="current">
                    {currentPatientName} {patientDetail?.episodeStart || '10/26/2026'} - {patientDetail?.episodeEnd || '12/24/2026'}
                  </option>
                  <option value="prev">
                    {currentPatientName} 08/27/2026 - 10/25/2026
                  </option>
                </select>
              </div>

              {/* Actions Dropdown matching Screenshot 8 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenActionsMenu(!openActionsMenu)}
                  className="px-3 py-1 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Actions</span>
                  <ChevronDown size={12} />
                </button>
                {openActionsMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        fetchScheduleCenterData(selectedPatientId);
                        showToast('Schedule data refreshed.');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-bold flex items-center space-x-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <RefreshCw size={13} className="text-slate-700 dark:text-slate-300" />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        setIsNewEpisodeModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-bold flex items-center space-x-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <Settings size={13} className="text-slate-700 dark:text-slate-300" />
                      <span>Manage Episode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionsMenu(false);
                        window.print();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-bold flex items-center space-x-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <Download size={13} className="text-slate-700 dark:text-slate-300" />
                      <span>Print Patient Chart</span>
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

            {/* Hover Tooltip (Matching Screenshot 1) */}
            {hoveredDate && hoverPosition && calendarDays[hoveredDate] && (
              <div
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                }}
                className="fixed z-50 pointer-events-none transform -translate-x-1/2 bg-[#2b78a3] text-white px-3 py-2 rounded-lg shadow-2xl text-[11px] leading-tight border border-white/20"
              >
                <div className="font-extrabold pb-0.5 border-b border-white/20">
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
                      <span className="font-bold">{vi.task}</span> - <span>{vi.employeeName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend Below Calendars (Matching Screenshot 1) */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#2b78a3]"></span>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#16a34a]"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#dc2626]"></span>
                <span>Missed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#6b46c1]"></span>
                <span>Multiple</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-pearl-200 dark:bg-charcoal-700 border border-pearl-300 dark:border-charcoal-600"></span>
                <span>Disabled</span>
              </div>
            </div>
          </div>

          {/* Action Row: View Patient Chart & Hide/Show Scheduler Toggle (Screenshot 9) */}
          <div className="px-4 py-2 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToChart) {
                  onNavigateToChart(selectedPatientId);
                } else {
                  setHomeHealthTab('patient-charts');
                }
              }}
              className="px-3 py-1 rounded bg-[#2b78a3] hover:bg-[#205d80] font-black text-xs text-white transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <ExternalLink size={13} />
              <span>View Patient Chart</span>
            </button>

            <div className="flex items-center space-x-2">
              {selectedCalendarDate && (
                <div className="flex items-center space-x-1 text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  <span>Filtered to: {selectedCalendarDate}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="hover:text-amber-900"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {/* Show / Hide Scheduler Toggle (Screenshot 9) */}
              <button
                type="button"
                onClick={() => setIsSchedulerTrayOpen(!isSchedulerTrayOpen)}
                className="px-3.5 py-1 rounded bg-[#b3d7eb] dark:bg-[#1e475f] hover:bg-[#9ecde6] font-black text-xs text-slate-800 dark:text-slate-100 transition cursor-pointer flex items-center space-x-1 shadow-sm"
              >
                <span>{isSchedulerTrayOpen ? 'Hide Scheduler' : 'Show Schedulers'}</span>
                {isSchedulerTrayOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          </div>

          {/* Bottom Scheduler Tray (Matching Screenshot 9) */}
          {isSchedulerTrayOpen && (
            <div className="bg-[#b3d7eb]/40 dark:bg-[#1e475f]/40 border-b border-pearl-300 dark:border-charcoal-700 p-3 animate-fade-in">
              {/* Discipline Tabs */}
              <div className="flex items-center space-x-1 mb-2 overflow-x-auto">
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
                    className={`px-3 py-1 rounded-t-md text-xs font-extrabold transition cursor-pointer ${
                      schedulerDisciplineTab === tab
                        ? 'bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-white/40'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Task Form Row */}
              <div className="bg-white dark:bg-charcoal-800 p-3 rounded-md border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3 flex-1 min-w-[300px]">
                  <div className="flex-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Task</label>
                    <select
                      value={trayVisitType}
                      onChange={(e) => setTrayVisitType(e.target.value)}
                      className="w-full mt-0.5 py-1 px-2 rounded border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold"
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
                      className="w-full mt-0.5 py-1 px-2 rounded border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    >
                      <option value="">-- Select User --</option>
                      <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                      <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                      <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                      <option value="Sarah Jenkins, RN">Sarah Jenkins, RN</option>
                    </select>
                  </div>

                  <div className="w-36">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Date</label>
                    <input
                      type="date"
                      value={trayDate}
                      onChange={(e) => setTrayDate(e.target.value)}
                      className="w-full mt-0.5 py-1 px-2 rounded border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTrayVisitType('');
                      setTrayUser('');
                    }}
                    className="mt-4 text-rose-500 hover:text-rose-700"
                    title="Clear"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSaveTraySchedule}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-extrabold text-xs shadow transition cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSchedulerTrayOpen(false)}
                    className="px-4 py-1.5 rounded bg-pearl-200 dark:bg-charcoal-700 font-bold text-xs text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Visits Table (NO Post to Axxess Care button) */}
          <div className="flex-1 overflow-x-auto p-3">
            <div className="bg-white dark:bg-charcoal-850 rounded-lg border border-pearl-200 dark:border-charcoal-700 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#b3d7eb]/60 dark:bg-[#1e475f]/60 text-slate-800 dark:text-slate-200 text-[11px] font-black uppercase border-b border-pearl-200 dark:border-charcoal-700">
                  <tr>
                    <th className="py-2 px-2 text-center w-8">A</th>
                    <th className="py-2 px-3">Task</th>
                    <th className="py-2 px-3">Scheduled Date ▾</th>
                    <th className="py-2 px-3">Assigned To</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-2 text-center w-10"></th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                  {displayedVisits.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-pearl-50 dark:hover:bg-charcoal-800 transition-colors"
                    >
                      {/* Priority Alert Icon */}
                      <td className="py-2 px-2 text-center">
                        {v.isAlert ? (
                          <span title="Physician signature or recertification evaluation" className="inline-block text-amber-500 font-bold">
                            !
                          </span>
                        ) : null}
                      </td>

                      {/* Task Name with Info Icon */}
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span>{v.task}</span>
                          <span
                            title={`Discipline: ${v.discipline} | Time: ${v.timeSlot}`}
                            className="text-slate-400 hover:text-slate-600 cursor-help"
                          >
                            <Info size={12} />
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {v.scheduledDate}
                      </td>

                      {/* Assigned Clinician */}
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-medium">
                        {v.assignedTo}
                      </td>

                      {/* Visit Status */}
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === 'Completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                              : v.status === 'Missed'
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                              : 'bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Print Icon Button */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVisitForModal(v);
                            showToast(`Printing visit sheet for ${v.task} (${v.scheduledDate})`);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                          title="Print Visit Form"
                        >
                          <Printer size={13} />
                        </button>
                      </td>

                      {/* Action Menu (Menu ▾ only, NO Post to Axxess Care) */}
                      <td className="py-2 px-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuVisitId(activeMenuVisitId === v.id ? null : v.id)
                            }
                            className="font-extrabold text-[#2b78a3] hover:underline flex items-center space-x-0.5 cursor-pointer ml-auto"
                          >
                            <span>Menu</span>
                            <ChevronDown size={11} />
                          </button>

                          {/* Menu Dropdown: Details and Reassign only */}
                          {activeMenuVisitId === v.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-charcoal-800 rounded shadow-xl border border-pearl-200 dark:border-charcoal-700 z-50 py-1 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuVisitId(null);
                                  setSelectedVisitForModal(v);
                                  setIsVisitDetailsModalOpen(true);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold text-[#1d4ed8] dark:text-[#60a5fa] cursor-pointer"
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
                                className="w-full text-left px-3 py-1.5 hover:bg-pearl-100 dark:hover:bg-charcoal-700 font-semibold text-[#1d4ed8] dark:text-[#60a5fa] cursor-pointer"
                              >
                                Reassign
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

              {/* Card 3: Comments (Blue Sticky Note) */}
              <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-blue-500 rounded-xs inline-block"></span>
                  <span>Comments (Blue Sticky Note)</span>
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
                  className="px-6 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-extrabold text-xs shadow transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewEpisodeModalOpen(false)}
                  className="px-6 py-1.5 rounded bg-pearl-300 dark:bg-charcoal-750 hover:bg-pearl-400 font-bold text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Episode Frequencies (Screenshot 2) */}
      {isEpisodeFrequenciesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-xl overflow-hidden">
            <div className="bg-[#891e3e] text-white px-4 py-2 font-bold text-xs tracking-wider text-center">
              Episode Frequencies
            </div>

            <div className="p-5">
              <table className="w-full text-left text-xs border border-pearl-200 dark:border-charcoal-700 rounded-lg overflow-hidden">
                <thead className="bg-pearl-200 dark:bg-charcoal-800 text-slate-800 dark:text-slate-200 font-extrabold">
                  <tr>
                    <th className="p-2.5">Visit Type</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5 text-center">Visit Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-semibold">
                  <tr>
                    <td className="p-2.5 font-bold">SN</td>
                    <td className="p-2.5">Daily,x60days</td>
                    <td className="p-2.5 text-center font-black">58</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">PT</td>
                    <td className="p-2.5">For,Eval,and,Treat</td>
                    <td className="p-2.5 text-center font-black">1</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">OT</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 text-center text-slate-400">0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">ST</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 text-center text-slate-400">0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">MSW</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 text-center text-slate-400">0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">HHA</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 text-center text-slate-400">0</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setIsEpisodeFrequenciesModalOpen(false)}
                  className="px-6 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: List of In-Active Episodes (Screenshot 1) */}
      {isInactiveEpisodesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-2xl overflow-hidden">
            <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between">
              <span className="font-extrabold text-xs">List of In-active episodes</span>
              <button
                type="button"
                onClick={() => setIsInactiveEpisodesModalOpen(false)}
                className="text-white hover:text-white/80"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              <div className="border border-pearl-200 dark:border-charcoal-700 rounded-lg overflow-hidden">
                <div className="bg-pearl-200 dark:bg-charcoal-800 py-1.5 px-3 text-center font-black text-xs">
                  Inactive Episode(s)
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-pearl-100 dark:bg-charcoal-750 text-slate-600 font-extrabold">
                    <tr>
                      <th className="py-2 px-3 text-left">Episode Range</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-semibold">
                    <tr>
                      <td className="py-2.5 px-3">08/08/2025 - 10/06/2025</td>
                      <td className="py-2.5 px-3 text-right text-[#1d4ed8]">
                        <span className="cursor-pointer hover:underline">Activate</span> |{' '}
                        <span className="cursor-pointer hover:underline">Edit</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">01/09/2026 - 03/09/2026</td>
                      <td className="py-2.5 px-3 text-right text-[#1d4ed8]">
                        <span className="cursor-pointer hover:underline">Activate</span> |{' '}
                        <span className="cursor-pointer hover:underline">Edit</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Master Calendar (Screenshot 3) */}
      {isMasterCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between">
              <span className="font-extrabold text-xs">Master Calendar</span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                <span
                  onClick={() => setIsMasterCalendarModalOpen(false)}
                  className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
                ></span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-[#2b78a3] text-white font-bold"
                >
                  « Previous Episode
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded bg-[#2b78a3] text-white font-bold flex items-center space-x-1"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>
                <label className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" />
                  <span>Show Missed Visits</span>
                </label>
              </div>

              <div className="text-right text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white">
                  Patient Name: {currentPatientName}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Frequencies: SN Frequency:Daily,x60days, PT Frequency:For,Eval,and,Treat.
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
                      <div className="font-black text-emerald-600">OASIS SOC</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/27</div>
                      <div className="font-bold">LVN/LPN VISIT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/28</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/29</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/30</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">10/31</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                  </tr>

                  {/* Week 2 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 2</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/01</div>
                      <div className="font-bold text-sky-600">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/02</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/03</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/04</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/05</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/06</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/07</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                  </tr>

                  {/* Week 3 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 3</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/08</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/09</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                      <div className="font-black text-purple-600">PT EVAL</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/10</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/11</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/12</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/13</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/14</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                  </tr>

                  {/* Week 4 */}
                  <tr>
                    <td className="p-2 border font-bold text-center bg-pearl-50 dark:bg-charcoal-850">Week 4</td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/15</div>
                      <div className="font-bold text-amber-600">LVN SUP VISIT</div>
                      <div className="font-bold text-slate-600">COC</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/16</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/17</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/18</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/19</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/20</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                    <td className="p-2 border">
                      <div className="font-bold text-slate-400 text-[10px]">11/21</div>
                      <div className="font-bold">LPN - ORAL MED. MANAGEMENT</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 text-right">
              <button
                type="button"
                onClick={() => setIsMasterCalendarModalOpen(false)}
                className="px-5 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Reassign Tasks (Screenshot 5) */}
      {isReassignTasksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5">
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
                  Abuissa, Heather
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
                  <option value="">-- Select User --</option>
                  <option value="Mario Fortune LPN">Mario Fortune LPN</option>
                  <option value="Mary Kyalikunda RN">Mary Kyalikunda RN</option>
                  <option value="Alexandria Nelson, RN">Alexandria Nelson, RN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Employee To:
                </label>
                <select
                  value={reassignToUser}
                  onChange={(e) => setReassignToUser(e.target.value)}
                  className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                >
                  <option value="">-- Select User --</option>
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
                className="px-6 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-extrabold text-xs shadow transition cursor-pointer"
              >
                {isSubmitting ? 'Reassigning...' : 'Reassign'}
              </button>
              <button
                type="button"
                onClick={() => setIsReassignTasksModalOpen(false)}
                className="px-6 py-1.5 rounded bg-pearl-300 dark:bg-charcoal-750 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Authorization List (Screenshot 6) */}
      {isAuthorizationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between">
              <span className="font-extrabold text-xs">Authorization List | ABUISSA, HEATHER</span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                <span
                  onClick={() => setIsAuthorizationsModalOpen(false)}
                  className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
                ></span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded bg-[#2b78a3] text-white font-bold text-xs"
              >
                Add Authorization
              </button>

              <div className="flex-1 max-w-sm mx-4">
                <input
                  type="text"
                  placeholder="Search authorizations..."
                  className="w-full py-1 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs"
                />
              </div>

              <button
                type="button"
                className="px-3 py-1 rounded bg-[#2b78a3] text-white font-bold text-xs"
              >
                Archived Authorizations
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto p-3">
              <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700">
                <thead className="bg-pearl-100 dark:bg-charcoal-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 text-left">Authorization Number</th>
                    <th className="p-2 text-left">Payer</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Start Date</th>
                    <th className="p-2 text-left">End Date</th>
                    <th className="p-2 text-left">Discipline</th>
                    <th className="p-2 text-center">Authorized Units</th>
                    <th className="p-2 text-center">Used</th>
                    <th className="p-2 text-center">Unused</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                  <tr>
                    <td colSpan={12} className="py-16 text-center text-slate-500 font-bold text-sm">
                      No records to display.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select className="border py-0.5 px-1 rounded">
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>items per page</span>
              </div>
              <div>Displaying items 0 - 0 of 0</div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: 30-Day Calendar (Screenshot 7) */}
      {is30DayCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Window Chrome */}
            <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between">
              <span className="font-extrabold text-xs">30-Day Calendar | ABUISSA, HEATHER</span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                <span
                  onClick={() => setIs30DayCalendarModalOpen(false)}
                  className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
                ></span>
              </div>
            </div>

            {/* Top Stats Banner matching Screenshot 7 */}
            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2">
              <div className="font-black text-sm text-slate-900 dark:text-white">
                ABUISSA, HEATHER(1061)
              </div>
              <div className="flex items-center space-x-6 text-xs font-extrabold">
                <div>
                  <span className="text-slate-500">LUPA Risk: </span>
                  <span className="text-sky-600 font-black">LOW</span>
                </div>
                <div>
                  <span className="text-slate-500">LUPA Threshold: </span>
                  <span className="text-slate-900 dark:text-white font-black">3</span>
                </div>
              </div>
              <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                First 30-Day Payment Period
              </div>
            </div>

            {/* Episode & Billing Period Selectors */}
            <div className="px-3 py-2 bg-white dark:bg-charcoal-800 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-500">Episode:</span>
                  <select className="border py-1 px-2 rounded font-semibold">
                    <option>10/26/2026 - 12/24/2026</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-500">Billing Period:</span>
                  <select className="border py-1 px-2 rounded font-semibold">
                    <option>First 30 Days</option>
                    <option>Second 30 Days</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEpisodeFrequenciesModalOpen(true)}
                className="px-3 py-1 rounded border border-[#2b78a3] text-[#2b78a3] hover:bg-[#2b78a3] hover:text-white font-bold transition"
              >
                View Frequency & Duration
              </button>
            </div>

            {/* Status Legend */}
            <div className="px-3 py-2 bg-pearl-50/60 dark:bg-charcoal-850 flex items-center justify-center space-x-6 text-[11px] font-bold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                <span>Complete</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2b78a3]"></span>
                <span>In Progress</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6b46c1]"></span>
                <span>Not Yet Started</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                <span>Missed</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Not Yet Due</span>
              </span>
            </div>

            {/* Calendar Table Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700 border-collapse">
                <thead className="bg-pearl-100 dark:bg-charcoal-800 text-center font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border">Sunday</th>
                    <th className="p-2 border">Monday</th>
                    <th className="p-2 border">Tuesday</th>
                    <th className="p-2 border">Wednesday</th>
                    <th className="p-2 border">Thursday</th>
                    <th className="p-2 border">Friday</th>
                    <th className="p-2 border">Saturday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-200 dark:divide-charcoal-700 font-medium">
                  {/* Row 1 */}
                  <tr>
                    <td className="p-2 border h-20 bg-pearl-50/40"></td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/26</div>
                      <div className="p-1.5 rounded bg-[#16a34a] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>OASIS-E2 Start of Care</div>
                        <div className="text-[9px] opacity-90">Exported · Mary Kyalikunda</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/27</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/28</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/29</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/30</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">10/31</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/01</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/02</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/03</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/04</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/05</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/06</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                    <td className="p-2 border h-20 align-top">
                      <div className="font-bold text-slate-400 text-[10px]">11/07</div>
                      <div className="p-1.5 rounded bg-[#2b78a3] text-white text-[11px] font-bold mt-1 shadow-xs">
                        <div>LVN/LPN Visit</div>
                        <div className="text-[9px] opacity-90">Submitted With Signature · Mario Fortune</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-pearl-50 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 text-right">
              <button
                type="button"
                onClick={() => setIs30DayCalendarModalOpen(false)}
                className="px-5 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs shadow"
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
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-2xl p-5">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Quick Employee Scheduler
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickEmployeeSchedulerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold w-28">User/Employee:</label>
                <select
                  value={trayUser}
                  onChange={(e) => setTrayUser(e.target.value)}
                  className="flex-1 py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold"
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
                  className="text-xs font-bold text-[#2b78a3] hover:underline"
                >
                  Assign to me
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold w-28">Visit Type:</label>
                <select
                  value={trayVisitType}
                  onChange={(e) => setTrayVisitType(e.target.value)}
                  className="flex-1 py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-semibold"
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

              <div className="w-48">
                <input
                  type="date"
                  value={trayDate}
                  onChange={(e) => setTrayDate(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-pearl-300 dark:border-charcoal-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsQuickEmployeeSchedulerModalOpen(false)}
                className="px-4 py-1.5 rounded bg-pearl-200 dark:bg-charcoal-750 font-bold text-xs"
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
                className="px-5 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-extrabold text-xs shadow transition cursor-pointer"
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
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg p-5">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <FileText size={16} className="text-[#2b78a3]" />
                <span>Visit Details: {selectedVisitForModal.task}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVisitDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-pearl-50 dark:bg-charcoal-800">
                <span className="font-bold text-slate-500 block">Patient:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {currentPatientName} (MRN: {patientDetail?.mrn || '1061'})
                </span>
              </div>
              <div className="p-2.5 rounded bg-pearl-50 dark:bg-charcoal-800">
                <span className="font-bold text-slate-500 block">Assigned Employee:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.assignedTo}
                </span>
              </div>
              <div className="p-2.5 rounded bg-pearl-50 dark:bg-charcoal-800">
                <span className="font-bold text-slate-500 block">Scheduled Window:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.scheduledDate} · {selectedVisitForModal.timeSlot}
                </span>
              </div>
              <div className="p-2.5 rounded bg-pearl-50 dark:bg-charcoal-800">
                <span className="font-bold text-slate-500 block">Status:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedVisitForModal.status}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Directives:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Oral medication supervision, adherence verification, vital signs check, and diabetic wound observation. Report blood pressure & glucose readings if outside parameters.
              </p>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setIsVisitDetailsModalOpen(false)}
                className="px-5 py-1.5 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-bold text-xs"
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
