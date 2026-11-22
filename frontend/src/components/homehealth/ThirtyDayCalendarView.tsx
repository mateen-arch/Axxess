import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Shield,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  Plus,
  X,
  Check,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface ThirtyDayCalendarViewProps {
  onBack?: () => void;
  onNavigateToChart?: (patientId: string) => void;
  onNavigateToEpisodeManager?: () => void;
}

interface CalendarVisit {
  id: string;
  patientId: string;
  assignedTo: string;
  task: string;
  scheduledDate: string;
  rawDate: string;
  timeSlot: string;
  status: 'Completed' | 'Scheduled' | 'Missed' | 'Not Yet Due';
  discipline: string;
  notes?: string;
}

export const ThirtyDayCalendarView: React.FC<ThirtyDayCalendarViewProps> = ({
  onBack,
  onNavigateToChart,
  onNavigateToEpisodeManager,
}) => {
  const { patients: globalPatients, setHomeHealthTab } = useHealthcare();

  // Selected Patient State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1061');
  const patient = globalPatients?.find(p => p.id === selectedPatientId) || {
    id: 'pat-1061',
    name: 'Heather Abuissa',
    mrn: '1061',
    dob: '05/14/1962',
    branch: 'Standards Home Care',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    attendingPhysician: 'Rigali, Leslie DO',
    episodeStart: '10/26/2026',
    episodeEnd: '12/24/2026'
  };
  const patientName = (patient as any).name || ((patient as any).firstName ? `${(patient as any).firstName} ${(patient as any).lastName}` : 'Heather Abuissa');

  const [episodeSelection, setEpisodeSelection] = useState<'current' | 'previous'>('current');
  const [billingPeriod, setBillingPeriod] = useState<'first' | 'second'>('first');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visit Inspection Modal
  const [selectedVisit, setSelectedVisit] = useState<CalendarVisit | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);

  // Add Visit Quick Modal
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState<boolean>(false);
  const [targetDateForNewVisit, setTargetDateForNewVisit] = useState<string>('10/26/2026');
  const [newVisitTask, setNewVisitTask] = useState<string>('LPN - Oral Med. Management');
  const [newVisitClinician, setNewVisitClinician] = useState<string>('Mario Fortune LPN');

  // Sample Visits Data mapped across the 30-day payment periods
  const [visitsList, setVisitsList] = useState<CalendarVisit[]>([
    {
      id: 'cal-v1',
      patientId: 'pat-1061',
      assignedTo: 'Mary Kyalikunda RN',
      task: 'OASIS-E2 Start of Care Assessment',
      scheduledDate: '10/26/2026',
      rawDate: '2026-10-26',
      timeSlot: '09:00 AM - 11:00 AM',
      status: 'Completed',
      discipline: 'Nursing',
      notes: 'Initial OASIS comprehensive assessment completed. Vitals stable.'
    },
    {
      id: 'cal-v2',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LVN/LPN Routine Visit',
      scheduledDate: '10/27/2026',
      rawDate: '2026-10-27',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'Completed',
      discipline: 'Nursing',
      notes: 'Medication administration and diabetic wound dressing inspection.'
    },
    {
      id: 'cal-v3',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '10/28/2026',
      rawDate: '2026-10-28',
      timeSlot: '09:30 AM - 10:30 AM',
      status: 'Completed',
      discipline: 'Nursing',
      notes: 'Oral medication adherence check; no adverse drug effects observed.'
    },
    {
      id: 'cal-v4',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '10/29/2026',
      rawDate: '2026-10-29',
      timeSlot: '09:30 AM - 10:30 AM',
      status: 'Completed',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v5',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '10/30/2026',
      rawDate: '2026-10-30',
      timeSlot: '09:30 AM - 10:30 AM',
      status: 'Completed',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v6',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '10/31/2026',
      rawDate: '2026-10-31',
      timeSlot: '09:30 AM - 10:30 AM',
      status: 'Completed',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v7',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/02/2026',
      rawDate: '2026-11-02',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v8',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/03/2026',
      rawDate: '2026-11-03',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v9',
      patientId: 'pat-1061',
      assignedTo: 'Andre Bellevue, PT',
      task: 'PT Evaluation & Functional Mobility',
      scheduledDate: '11/04/2026',
      rawDate: '2026-11-04',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'Not Yet Due',
      discipline: 'Physical Therapy'
    },
    {
      id: 'cal-v10',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/05/2026',
      rawDate: '2026-11-05',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v11',
      patientId: 'pat-1061',
      assignedTo: 'Alexandria Nelson, RN',
      task: 'Skilled Nursing & Wound Assessment',
      scheduledDate: '11/06/2026',
      rawDate: '2026-11-06',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v12',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/07/2026',
      rawDate: '2026-11-07',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    // Second Period visits (Nov 25 - Dec 24)
    {
      id: 'cal-v13',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/25/2026',
      rawDate: '2026-11-25',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v14',
      patientId: 'pat-1061',
      assignedTo: 'Mario Fortune LPN',
      task: 'LPN - Oral Med. Management',
      scheduledDate: '11/27/2026',
      rawDate: '2026-11-27',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    },
    {
      id: 'cal-v15',
      patientId: 'pat-1061',
      assignedTo: 'Mary Kyalikunda RN',
      task: 'OASIS-E2 Recertification',
      scheduledDate: '12/20/2026',
      rawDate: '2026-12-20',
      timeSlot: '09:00 AM - 10:30 AM',
      status: 'Not Yet Due',
      discipline: 'Nursing'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Visit Inspection
  const handleOpenVisitDetails = (v: CalendarVisit) => {
    setSelectedVisit(v);
    setIsVisitModalOpen(true);
  };

  // Mark Visit as Completed
  const handleMarkVisitCompleted = () => {
    if (!selectedVisit) return;
    setVisitsList(prev => prev.map(item => item.id === selectedVisit.id ? { ...item, status: 'Completed' } : item));
    setSelectedVisit(prev => prev ? { ...prev, status: 'Completed' } : null);
    showToast(`Marked ${selectedVisit.task} on ${selectedVisit.scheduledDate} as Completed.`);
  };

  // Quick Add Visit
  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: CalendarVisit = {
      id: `cal-v-${Date.now()}`,
      patientId: selectedPatientId,
      assignedTo: newVisitClinician,
      task: newVisitTask,
      scheduledDate: targetDateForNewVisit,
      rawDate: targetDateForNewVisit.includes('/') ? targetDateForNewVisit.split('/').reverse().join('-') : targetDateForNewVisit,
      timeSlot: '09:30 AM - 10:30 AM',
      status: 'Not Yet Due',
      discipline: newVisitTask.includes('PT') ? 'Physical Therapy' : newVisitTask.includes('OT') ? 'Occupational Therapy' : 'Nursing'
    };
    setVisitsList(prev => [newV, ...prev]);
    setIsAddVisitModalOpen(false);
    showToast(`Scheduled ${newVisitTask} for ${targetDateForNewVisit}.`);
  };

  // Print Calendar
  const handlePrint = () => {
    window.print();
  };

  // First Period Weeks: Oct 26 - Nov 24 (Weeks 1 to 5)
  // Second Period Weeks: Nov 25 - Dec 24 (Weeks 5 to 9)
  const firstPeriodDays = useMemo(() => [
    // Week 1: Oct 25 - Oct 31
    [
      { date: '10/25/2026', dayNum: 25, isCurrentMonth: false, disabled: true },
      { date: '10/26/2026', dayNum: 26, isCurrentMonth: true },
      { date: '10/27/2026', dayNum: 27, isCurrentMonth: true },
      { date: '10/28/2026', dayNum: 28, isCurrentMonth: true },
      { date: '10/29/2026', dayNum: 29, isCurrentMonth: true },
      { date: '10/30/2026', dayNum: 30, isCurrentMonth: true },
      { date: '10/31/2026', dayNum: 31, isCurrentMonth: true },
    ],
    // Week 2: Nov 1 - Nov 7
    [
      { date: '11/01/2026', dayNum: 1, isCurrentMonth: true },
      { date: '11/02/2026', dayNum: 2, isCurrentMonth: true },
      { date: '11/03/2026', dayNum: 3, isCurrentMonth: true },
      { date: '11/04/2026', dayNum: 4, isCurrentMonth: true },
      { date: '11/05/2026', dayNum: 5, isCurrentMonth: true },
      { date: '11/06/2026', dayNum: 6, isCurrentMonth: true },
      { date: '11/07/2026', dayNum: 7, isCurrentMonth: true },
    ],
    // Week 3: Nov 8 - Nov 14
    [
      { date: '11/08/2026', dayNum: 8, isCurrentMonth: true },
      { date: '11/09/2026', dayNum: 9, isCurrentMonth: true },
      { date: '11/10/2026', dayNum: 10, isCurrentMonth: true },
      { date: '11/11/2026', dayNum: 11, isCurrentMonth: true },
      { date: '11/12/2026', dayNum: 12, isCurrentMonth: true },
      { date: '11/13/2026', dayNum: 13, isCurrentMonth: true },
      { date: '11/14/2026', dayNum: 14, isCurrentMonth: true },
    ],
    // Week 4: Nov 15 - Nov 21
    [
      { date: '11/15/2026', dayNum: 15, isCurrentMonth: true },
      { date: '11/16/2026', dayNum: 16, isCurrentMonth: true },
      { date: '11/17/2026', dayNum: 17, isCurrentMonth: true },
      { date: '11/18/2026', dayNum: 18, isCurrentMonth: true },
      { date: '11/19/2026', dayNum: 19, isCurrentMonth: true },
      { date: '11/20/2026', dayNum: 20, isCurrentMonth: true },
      { date: '11/21/2026', dayNum: 21, isCurrentMonth: true },
    ],
    // Week 5: Nov 22 - Nov 24
    [
      { date: '11/22/2026', dayNum: 22, isCurrentMonth: true },
      { date: '11/23/2026', dayNum: 23, isCurrentMonth: true },
      { date: '11/24/2026', dayNum: 24, isCurrentMonth: true },
      { date: '11/25/2026', dayNum: 25, isCurrentMonth: false, disabled: true },
      { date: '11/26/2026', dayNum: 26, isCurrentMonth: false, disabled: true },
      { date: '11/27/2026', dayNum: 27, isCurrentMonth: false, disabled: true },
      { date: '11/28/2026', dayNum: 28, isCurrentMonth: false, disabled: true },
    ],
  ], []);

  const secondPeriodDays = useMemo(() => [
    // Week 1: Nov 25 - Nov 28
    [
      { date: '11/22/2026', dayNum: 22, isCurrentMonth: false, disabled: true },
      { date: '11/23/2026', dayNum: 23, isCurrentMonth: false, disabled: true },
      { date: '11/24/2026', dayNum: 24, isCurrentMonth: false, disabled: true },
      { date: '11/25/2026', dayNum: 25, isCurrentMonth: true },
      { date: '11/26/2026', dayNum: 26, isCurrentMonth: true },
      { date: '11/27/2026', dayNum: 27, isCurrentMonth: true },
      { date: '11/28/2026', dayNum: 28, isCurrentMonth: true },
    ],
    // Week 2: Nov 29 - Dec 5
    [
      { date: '11/29/2026', dayNum: 29, isCurrentMonth: true },
      { date: '11/30/2026', dayNum: 30, isCurrentMonth: true },
      { date: '12/01/2026', dayNum: 1, isCurrentMonth: true },
      { date: '12/02/2026', dayNum: 2, isCurrentMonth: true },
      { date: '12/03/2026', dayNum: 3, isCurrentMonth: true },
      { date: '12/04/2026', dayNum: 4, isCurrentMonth: true },
      { date: '12/05/2026', dayNum: 5, isCurrentMonth: true },
    ],
    // Week 3: Dec 6 - Dec 12
    [
      { date: '12/06/2026', dayNum: 6, isCurrentMonth: true },
      { date: '12/07/2026', dayNum: 7, isCurrentMonth: true },
      { date: '12/08/2026', dayNum: 8, isCurrentMonth: true },
      { date: '12/09/2026', dayNum: 9, isCurrentMonth: true },
      { date: '12/10/2026', dayNum: 10, isCurrentMonth: true },
      { date: '12/11/2026', dayNum: 11, isCurrentMonth: true },
      { date: '12/12/2026', dayNum: 12, isCurrentMonth: true },
    ],
    // Week 4: Dec 13 - Dec 19
    [
      { date: '12/13/2026', dayNum: 13, isCurrentMonth: true },
      { date: '12/14/2026', dayNum: 14, isCurrentMonth: true },
      { date: '12/15/2026', dayNum: 15, isCurrentMonth: true },
      { date: '12/16/2026', dayNum: 16, isCurrentMonth: true },
      { date: '12/17/2026', dayNum: 17, isCurrentMonth: true },
      { date: '12/18/2026', dayNum: 18, isCurrentMonth: true },
      { date: '12/19/2026', dayNum: 19, isCurrentMonth: true },
    ],
    // Week 5: Dec 20 - Dec 24
    [
      { date: '12/20/2026', dayNum: 20, isCurrentMonth: true },
      { date: '12/21/2026', dayNum: 21, isCurrentMonth: true },
      { date: '12/22/2026', dayNum: 22, isCurrentMonth: true },
      { date: '12/23/2026', dayNum: 23, isCurrentMonth: true },
      { date: '12/24/2026', dayNum: 24, isCurrentMonth: true },
      { date: '12/25/2026', dayNum: 25, isCurrentMonth: false, disabled: true },
      { date: '12/26/2026', dayNum: 26, isCurrentMonth: false, disabled: true },
    ],
  ], []);

  const activePeriodWeeks = billingPeriod === 'first' ? firstPeriodDays : secondPeriodDays;

  // Calculate visit counts for selected 30-day period
  const periodVisitsCount = useMemo(() => {
    const dates = activePeriodWeeks.flat().filter(d => !d.disabled).map(d => d.date);
    return visitsList.filter(v => dates.includes(v.scheduledDate)).length;
  }, [activePeriodWeeks, visitsList]);

  return (
    <div className="flex-1 flex flex-col bg-pearl-50/50 dark:bg-charcoal-900 min-h-0 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 text-xs font-bold animate-slide-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="p-4 sm:p-6 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer shadow-2xs"
              title="Back to Schedule Center"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <CalendarDays size={18} />
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  30-Day Calendar
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  PDGM 30-Day Payment Period
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor 30-day billing period visit schedules, LUPA threshold compliance, and visit frequencies
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-750 font-bold text-xs text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer size={14} className="text-rose-600" />
              <span>Print 30-Day Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateToEpisodeManager) {
                  onNavigateToEpisodeManager();
                } else {
                  setHomeHealthTab('episode-manager');
                }
              }}
              className="h-9 px-4 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ExternalLink size={13} className="text-rose-600" />
              <span>Episode Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Patient Banner & LUPA Compliance Info */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {patientName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                  MRN: {patient.mrn}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{patient.branch || 'Standards Home Care'}</span>
                <span>•</span>
                <span>Payer: <strong className="text-slate-700 dark:text-slate-300">{patient.insuranceName || 'COMMONWEALTH CARE ALLIANCE'}</strong></span>
                <span>•</span>
                <span>Episode: {patient.episodeStart || '10/26/2026'} - {patient.episodeEnd || '12/24/2026'}</span>
              </div>
            </div>
          </div>

          {/* LUPA Compliance Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
              <Shield size={16} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">LUPA Risk</span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">LOW (Visits Exceed Threshold)</span>
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">LUPA Threshold</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {billingPeriod === 'first' ? '3 visits' : '4 visits'} ({periodVisitsCount} scheduled)
              </span>
            </div>
          </div>
        </div>

        {/* Period and Episode Selectors Ribbon */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400">Episode:</label>
              <select
                value={episodeSelection}
                onChange={(e) => setEpisodeSelection(e.target.value as any)}
                className="py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-bold text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="current">Current: 10/26/2026 - 12/24/2026</option>
                <option value="previous">Previous: 08/27/2026 - 10/25/2026</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400">Payment Period:</label>
              <select
                value={billingPeriod}
                onChange={(e) => {
                  const val = e.target.value as 'first' | 'second';
                  setBillingPeriod(val);
                  showToast(val === 'first' ? 'Loaded First 30 Days (10/26 - 11/24)' : 'Loaded Second 30 Days (11/25 - 12/24)');
                }}
                className="py-1.5 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-black text-xs text-rose-700 dark:text-rose-400"
              >
                <option value="first">First 30 Days (10/26/2026 - 11/24/2026)</option>
                <option value="second">Second 30 Days (11/25/2026 - 12/24/2026)</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span>Period Status:</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              {billingPeriod === 'first' ? 'Days 1 - 30 of Episode' : 'Days 31 - 60 of Episode'}
            </span>
          </div>
        </div>

        {/* Status Legend Strip */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 py-2.5 px-4 shadow-xs flex items-center justify-center space-x-6 text-[11px] font-bold flex-wrap gap-y-2">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700 dark:text-slate-300">Complete</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span className="text-slate-700 dark:text-slate-300">Scheduled</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span className="text-slate-700 dark:text-slate-300">Multiple Visits</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Missed</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-slate-700 dark:text-slate-300">Not Yet Due</span>
          </span>
        </div>

        {/* 30-Day Calendar Table Grid */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase border-b border-rose-100 dark:border-rose-900/40 text-center">
                <tr>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Sunday</th>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Monday</th>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Tuesday</th>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Wednesday</th>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Thursday</th>
                  <th className="p-3 border-r border-pearl-100 dark:border-charcoal-750 w-[14.28%]">Friday</th>
                  <th className="p-3 w-[14.28%]">Saturday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {activePeriodWeeks.map((week, wIdx) => (
                  <tr key={`week-${wIdx}`} className="divide-x divide-pearl-100 dark:divide-charcoal-750">
                    {week.map((cell) => {
                      const visitsOnDay = visitsList.filter(v => v.scheduledDate === cell.date);

                      return (
                        <td
                          key={cell.date}
                          className={`p-2.5 min-h-[110px] h-[110px] align-top transition-colors ${
                            cell.disabled
                              ? 'bg-pearl-100/40 dark:bg-charcoal-900/60 opacity-40'
                              : 'hover:bg-rose-50/20 dark:hover:bg-charcoal-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[11px] font-black ${cell.disabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {cell.date.split('/')[0]}/{cell.dayNum}
                            </span>
                            {!cell.disabled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetDateForNewVisit(cell.date);
                                  setIsAddVisitModalOpen(true);
                                }}
                                className="w-5 h-5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                                title={`Schedule visit on ${cell.date}`}
                              >
                                <Plus size={12} />
                              </button>
                            )}
                          </div>

                          {/* Visits list on this date */}
                          <div className="space-y-1.5 overflow-y-auto max-h-[75px] scrollbar-none">
                            {visitsOnDay.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleOpenVisitDetails(v)}
                                className={`w-full p-1.5 rounded-lg text-left text-[10px] font-bold shadow-2xs transition cursor-pointer flex flex-col ${
                                  v.status === 'Completed'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : v.status === 'Missed'
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                                }`}
                                title={`${v.task} - ${v.assignedTo} (${v.status})`}
                              >
                                <span className="truncate">{v.task}</span>
                                <span className="text-[9px] opacity-90 truncate">{v.assignedTo}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visit Details Inspection Modal */}
      {isVisitModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  Visit Details: {selectedVisit.task}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVisitModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled Date</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{selectedVisit.scheduledDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Time Slot</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{selectedVisit.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned Clinician</span>
                  <span className="font-extrabold text-rose-700 dark:text-rose-400">{selectedVisit.assignedTo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Visit Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${
                      selectedVisit.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : selectedVisit.status === 'Missed'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {selectedVisit.status}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Care Plan Directives:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Perform comprehensive home health evaluation, administer ordered medications, monitor vital signs and diabetes management, and provide patient education.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-pearl-200 dark:border-charcoal-700">
                {selectedVisit.status !== 'Completed' ? (
                  <button
                    type="button"
                    onClick={handleMarkVisitCompleted}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Mark as Completed</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Verified Completed</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Schedule Visit Modal */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  Schedule Visit on {targetDateForNewVisit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVisitModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVisit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Visit Task *
                </label>
                <select
                  value={newVisitTask}
                  onChange={(e) => setNewVisitTask(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-bold"
                >
                  <option value="LPN - Oral Med. Management">LPN - Oral Med. Management</option>
                  <option value="LVN/LPN Routine Visit">LVN/LPN Routine Visit</option>
                  <option value="Skilled Nursing Assessment">Skilled Nursing Assessment</option>
                  <option value="PT Evaluation & Functional Mobility">PT Evaluation & Functional Mobility</option>
                  <option value="OT Home Safety & ADL Assessment">OT Home Safety & ADL Assessment</option>
                  <option value="Personal Care & Hygiene Assistance">Personal Care & Hygiene Assistance</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Clinician *
                </label>
                <select
                  value={newVisitClinician}
                  onChange={(e) => setNewVisitClinician(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-bold"
                >
                  <option value="Mario Fortune LPN">Mario Fortune LPN (Nursing)</option>
                  <option value="Mary Kyalikunda RN">Mary Kyalikunda RN (Nursing)</option>
                  <option value="Alexandria Nelson, RN">Alexandria Nelson, RN (Nursing)</option>
                  <option value="Andre Bellevue, PT">Andre Bellevue, PT (Therapy)</option>
                  <option value="Olivia Chen, OTR/L">Olivia Chen, OTR/L (Therapy)</option>
                  <option value="Clara Oswald, HHA">Clara Oswald, HHA (Aide)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pearl-200 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => setIsAddVisitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
