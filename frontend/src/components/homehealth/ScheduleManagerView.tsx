import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  X,
  FileText,
  Users
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface ScheduleManagerViewProps {
  onBack?: () => void;
  onNavigateToChart?: (patientId: string) => void;
}

export const ScheduleManagerView: React.FC<ScheduleManagerViewProps> = ({
  onBack,
  onNavigateToChart,
}) => {
  const { patients: globalPatients, setHomeHealthTab } = useHealthcare();

  const [selectedPatientId] = useState<string>('pat-1061');
  const patient = globalPatients?.find(p => p.id === selectedPatientId) || {
    id: 'pat-1061',
    name: 'Heather Abuissa',
    mrn: '1061',
    branch: 'Standards Home Care',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    attendingPhysician: 'Rigali, Leslie DO',
    episodeStart: '10/26/2026',
    episodeEnd: '12/24/2026'
  };
  const patientName = (patient as any).name || ((patient as any).firstName ? `${(patient as any).firstName} ${(patient as any).lastName}` : 'Heather Abuissa');

  const [masterCalendarEpisode, setMasterCalendarEpisode] = useState<'current' | 'previous'>('current');
  const [showMissedVisitsOnly, setShowMissedVisitsOnly] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visit Detail Inspection Modal
  const [selectedVisitForModal, setSelectedVisitForModal] = useState<any | null>(null);
  const [isVisitDetailsModalOpen, setIsVisitDetailsModalOpen] = useState<boolean>(false);

  // Reassign Tasks Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [reassignFromUser, setReassignFromUser] = useState<string>('');
  const [reassignToUser, setReassignToUser] = useState<string>('Sarah Jenkins, RN');
  const [reassignDateFrom, setReassignDateFrom] = useState<string>('10/26/2026');
  const [reassignDateTo, setReassignDateTo] = useState<string>('12/24/2026');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmReassign = () => {
    if (!reassignToUser) {
      showToast('Please select a recipient employee.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReassignModalOpen(false);
      showToast(`Tasks from ${reassignDateFrom} to ${reassignDateTo} reassigned to ${reassignToUser}.`);
    }, 600);
  };

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
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <Calendar size={18} />
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Schedule Manager (Master Calendar)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  9-Week Master Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Week-by-week interdisciplinary visit schedule, clinician workload assignments, and missed visit verification
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToChart ? onNavigateToChart(selectedPatientId) : setHomeHealthTab('patient-charts')}
              className="px-3.5 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Patient Chart</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls & Episode Navigation Ribbon */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
              {patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 dark:text-white">
                  {patientName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                  MRN #{patient.mrn}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Attending: <strong className="text-rose-600 dark:text-rose-400">{patient.attendingPhysician || 'Rigali, Leslie DO'}</strong></span>
                <span>•</span>
                <span>SN: <strong className="text-slate-700 dark:text-slate-200">Daily, x60 days</strong></span>
                <span>•</span>
                <span>PT: <strong className="text-slate-700 dark:text-slate-200">For Eval & Treat</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const next = masterCalendarEpisode === 'current' ? 'previous' : 'current';
                setMasterCalendarEpisode(next);
                showToast(next === 'previous' ? 'Loaded Previous Episode (08/27/2026 - 10/25/2026)' : 'Loaded Current Episode (10/26/2026 - 12/24/2026)');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              {masterCalendarEpisode === 'current' ? '« View Previous Episode' : 'View Next Episode »'}
            </button>

            <button
              type="button"
              onClick={() => setIsReassignModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition cursor-pointer shadow-2xs"
            >
              Reassign Tasks
            </button>

            <label className="flex items-center space-x-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-pearl-50 dark:bg-charcoal-800 px-3.5 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showMissedVisitsOnly}
                onChange={(e) => setShowMissedVisitsOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span>Show Missed Only</span>
            </label>
          </div>
        </div>

        {/* 3. Master Calendar Grid Container */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
          <div className="p-4 bg-pearl-50/70 dark:bg-charcoal-800/60 border-b border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              Active Schedule: {masterCalendarEpisode === 'current' ? '10/26/2026 – 12/24/2026' : '08/27/2026 – 10/25/2026'}
            </span>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Scheduled</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Priority Alert</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-xs border border-pearl-200 dark:border-charcoal-700 border-collapse rounded-xl overflow-hidden shadow-2xs">
              <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-center font-extrabold text-[11px] uppercase border-b border-rose-100 dark:border-rose-900/40">
                <tr>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700 w-20">Week</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Sunday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Monday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Tuesday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Wednesday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Thursday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Friday</th>
                  <th className="p-3 border border-pearl-200 dark:border-charcoal-700">Saturday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-200 dark:divide-charcoal-700 font-medium">
                {/* Week 1 */}
                <tr>
                  <td className="p-3 border font-black text-center bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300">
                    Week 1
                  </td>
                  <td className="p-3 border bg-slate-50/50 dark:bg-charcoal-900/40 text-slate-300 text-center">—</td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/26</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'OASIS-E2 Start of Care',
                          assignedTo: 'Mary Kyalikunda RN',
                          scheduledDate: '10/26/2026',
                          timeSlot: '09:00 AM - 11:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">OASIS-E2 SOC</div>
                      <div className="text-[10px] text-slate-500">Mary Kyalikunda RN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/27</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '10/27/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/28</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'PT Evaluation & Mobility',
                          assignedTo: 'Andre Bellevue, PT',
                          scheduledDate: '10/28/2026',
                          timeSlot: '10:00 AM - 11:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">PT Evaluation</div>
                      <div className="text-[10px] text-slate-500">Andre Bellevue, PT</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/29</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '10/29/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/30</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '10/30/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">10/31</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '10/31/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Completed'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                </tr>

                {/* Week 2 */}
                <tr>
                  <td className="p-3 border font-black text-center bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300">
                    Week 2
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/01</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '11/01/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/02</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '11/02/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/03</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '11/03/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/04</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'PT Evaluation & Mobility',
                          assignedTo: 'Andre Bellevue, PT',
                          scheduledDate: '11/04/2026',
                          timeSlot: '10:00 AM - 11:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">PT Strengthening</div>
                      <div className="text-[10px] text-slate-500">Andre Bellevue, PT</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/05</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '11/05/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/06</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'Wound Care & Dressing Change',
                          assignedTo: 'Alexandria Nelson, RN',
                          scheduledDate: '11/06/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Wound Care</div>
                      <div className="text-[10px] text-slate-500">Alexandria Nelson, RN</div>
                    </button>
                  </td>
                  <td className="p-3 border align-top">
                    <div className="font-bold text-slate-400 text-[10px] mb-1">11/07</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForModal({
                          task: 'LPN - Oral Med. Management',
                          assignedTo: 'Mario Fortune LPN',
                          scheduledDate: '11/07/2026',
                          timeSlot: '09:00 AM - 10:00 AM',
                          status: 'Not Yet Due'
                        });
                        setIsVisitDetailsModalOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:brightness-95 transition cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-rose-800 dark:text-rose-300">Oral Med. Mgmt</div>
                      <div className="text-[10px] text-slate-500">Mario Fortune LPN</div>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Visit Detail Inspection */}
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
                  {patientName} (MRN: {patient.mrn})
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

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  showToast(`Printed visit sheet for ${selectedVisitForModal.task}`);
                  setIsVisitDetailsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-pearl-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-pearl-200 transition cursor-pointer"
              >
                Print Sheet
              </button>
              <button
                type="button"
                onClick={() => setIsVisitDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reassign Tasks */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-pearl-200 dark:border-charcoal-700 pb-3 mb-4">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <Users size={16} className="text-rose-600" />
                <span>Reassign Tasks</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Employee From:
                </label>
                <select
                  value={reassignFromUser}
                  onChange={(e) => setReassignFromUser(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
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
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
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
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
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
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 italic">
                Note: Only tasks that are not started and not yet due will be reassigned.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 font-bold text-xs text-slate-600 dark:text-slate-400 transition hover:bg-pearl-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                disabled={isSubmitting || !reassignToUser}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? 'Reassigning...' : 'Reassign Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
