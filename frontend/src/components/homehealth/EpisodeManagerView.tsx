import React, { useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EpisodeManagerViewProps {
  onBack?: () => void;
  onNavigateToChart?: (patientId: string) => void;
}

export const EpisodeManagerView: React.FC<EpisodeManagerViewProps> = ({
  onBack,
  onNavigateToChart,
}) => {
  const { patients: globalPatients, setHomeHealthTab } = useHealthcare();

  // Patient State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1061');
  const patient = globalPatients?.find(p => p.id === selectedPatientId) || {
    id: 'pat-1061',
    name: 'Heather Abuissa',
    mrn: '1061',
    dob: '05/14/1962',
    gender: 'Female',
    branch: 'Standards Home Care',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    attendingPhysician: 'Rigali, Leslie DO',
    episodeStart: '10/26/2026',
    episodeEnd: '12/24/2026'
  };
  const patientName = (patient as any).name || ((patient as any).firstName ? `${(patient as any).firstName} ${(patient as any).lastName}` : 'Heather Abuissa');

  const [activeTab, setActiveTab] = useState<'directives' | 'frequencies' | 'inactive'>('directives');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Episode Directives
  const [episodeForm, setEpisodeForm] = useState({
    startOfCareDate: patient.episodeStart || '10/26/2026',
    episodeStartDate: patient.episodeStart || '10/26/2026',
    episodeEndDate: patient.episodeEnd || '12/24/2026',
    caseManager: 'Mary Kyalikunda RN',
    primaryPhysician: patient.attendingPhysician || 'Rigali, Leslie DO',
    primaryInsurance: patient.insuranceName || 'COMMONWEALTH CARE ALLIANCE',
    secondaryInsurance: 'MASSHEALTH STANDARD',
    visitAuthRequired: 'No',
    comments: 'Patient requires continuous daily skilled nursing evaluation and intermittent physical therapy for mobility improvement following recent surgical discharge. Monitor bilateral lower extremity edema and surgical wound healing.'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

      {/* 1. Unified Page Header */}
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
                  <ClipboardList size={18} />
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Episode Manager
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                  Active Episode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage episode directives, physician orders, discipline frequencies, and historical episode archives
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
              onClick={() => {
                showToast('Episode data refreshed from database.');
              }}
              className="p-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Patient Profile Banner */}
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
                <span>Branch: <strong className="text-slate-700 dark:text-slate-200">{patient.branch || 'Standards Home Care'}</strong></span>
                <span>•</span>
                <span>Attending: <strong className="text-rose-600 dark:text-rose-400">{patient.attendingPhysician || 'Rigali, Leslie DO'}</strong></span>
                <span>•</span>
                <span>Payer: <strong className="text-slate-700 dark:text-slate-200">{patient.insuranceName || 'COMMONWEALTH CARE ALLIANCE'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-pearl-50 dark:bg-charcoal-800/60 p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 self-start md:self-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Episode Span
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {episodeForm.episodeStartDate} – {episodeForm.episodeEndDate}
              </span>
            </div>
            <div className="w-px h-8 bg-pearl-200 dark:border-charcoal-700" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Episode Status
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                In Progress (60-Day)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Card with Navigation Tabs */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/60 dark:bg-charcoal-800/40">
            <button
              type="button"
              onClick={() => setActiveTab('directives')}
              className={`px-4 py-2.5 font-black text-xs border-b-2 cursor-pointer transition flex items-center gap-2 ${
                activeTab === 'directives'
                  ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-850 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ClipboardList size={14} />
              <span>Directives & Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('frequencies')}
              className={`px-4 py-2.5 font-black text-xs border-b-2 cursor-pointer transition flex items-center gap-2 ${
                activeTab === 'frequencies'
                  ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-850 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock size={14} />
              <span>Episode Frequencies</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                59
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-2.5 font-black text-xs border-b-2 cursor-pointer transition flex items-center gap-2 ${
                activeTab === 'inactive'
                  ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-charcoal-850 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar size={14} />
              <span>Inactive Episodes Archive</span>
            </button>
          </div>

          {/* TAB 1: Directives & Details */}
          {activeTab === 'directives' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Start of Care (SOC) Date: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.startOfCareDate}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, startOfCareDate: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Case Manager: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.caseManager}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, caseManager: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Episode Start Date: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.episodeStartDate}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episodeStartDate: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Episode End Date: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.episodeEndDate}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episodeEndDate: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Primary Attending Physician: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.primaryPhysician}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, primaryPhysician: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Primary Insurance / Payer: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.primaryInsurance}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, primaryInsurance: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Clinical Directives & Interdisciplinary Instructions:
                </label>
                <textarea
                  rows={4}
                  value={episodeForm.comments}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, comments: e.target.value })}
                  placeholder="Enter episode directives, orders adherence, or specialized physician instructions..."
                  className="w-full p-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-pearl-200 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => {
                    setEpisodeForm({
                      startOfCareDate: '10/26/2026',
                      episodeStartDate: '10/26/2026',
                      episodeEndDate: '12/24/2026',
                      caseManager: 'Mary Kyalikunda RN',
                      primaryPhysician: 'Rigali, Leslie DO',
                      primaryInsurance: 'COMMONWEALTH CARE ALLIANCE',
                      secondaryInsurance: 'MASSHEALTH STANDARD',
                      visitAuthRequired: 'No',
                      comments: 'Patient requires continuous daily skilled nursing evaluation and intermittent physical therapy.'
                    });
                    showToast('Form reset to original values.');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-pearl-100 transition cursor-pointer"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Episode details and directives saved successfully to database!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-sm transition cursor-pointer"
                >
                  Save Episode Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Episode Frequencies */}
          {activeTab === 'frequencies' && (
            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase border-b border-rose-100 dark:border-rose-900/40">
                    <tr>
                      <th className="py-3 px-4">Discipline / Visit Type</th>
                      <th className="py-3 px-4">Frequency Order</th>
                      <th className="py-3 px-4 text-center">Visit Count</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">SN - Skilled Nursing</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Daily, x60 days</td>
                      <td className="py-3 px-4 text-center font-black text-rose-600 dark:text-rose-400 text-sm">58</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">PT - Physical Therapy</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">For Eval and Treat</td>
                      <td className="py-3 px-4 text-center font-black text-rose-600 dark:text-rose-400 text-sm">1</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition opacity-60">
                      <td className="py-3 px-4 font-bold text-slate-400">OT - Occupational Therapy</td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-center text-slate-400">0</td>
                      <td className="py-3 px-4 text-right text-slate-400">Inactive</td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition opacity-60">
                      <td className="py-3 px-4 font-bold text-slate-400">ST - Speech Therapy</td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-center text-slate-400">0</td>
                      <td className="py-3 px-4 text-right text-slate-400">Inactive</td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition opacity-60">
                      <td className="py-3 px-4 font-bold text-slate-400">MSW - Social Work</td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-center text-slate-400">0</td>
                      <td className="py-3 px-4 text-right text-slate-400">Inactive</td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition opacity-60">
                      <td className="py-3 px-4 font-bold text-slate-400">HHA - Home Health Aide</td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-center text-slate-400">0</td>
                      <td className="py-3 px-4 text-right text-slate-400">Inactive</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-pearl-50 dark:bg-charcoal-800 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  Total Ordered Episode Visits: <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">59 Visits</strong>
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Episode frequencies synchronized with patient chart orders.')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-extrabold cursor-pointer hover:from-rose-700 hover:to-rose-800 shadow-2xs transition self-start sm:self-auto"
                >
                  Sync Frequencies
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Inactive Episodes Archive */}
          {activeTab === 'inactive' && (
            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-pearl-100 dark:bg-charcoal-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 border-b border-pearl-200 dark:border-charcoal-700">
                    <tr>
                      <th className="py-3 px-4">Episode Span</th>
                      <th className="py-3 px-4">Payer / Insurance</th>
                      <th className="py-3 px-4 text-center">Completed Visits</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">08/08/2025 – 10/06/2025</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">MEDICARE ADVANTAGE</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        50 Completed
                      </td>
                      <td className="py-3 px-4 text-right space-x-3 text-rose-600 font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Activated historical episode span 08/08/2025 - 10/06/2025.');
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
                            setActiveTab('directives');
                            showToast('Loaded 08/08/2025 - 10/06/2025 into directives form for review.');
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">01/09/2026 – 03/09/2026</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">MASSHEALTH STANDARD</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        42 Completed
                      </td>
                      <td className="py-3 px-4 text-right space-x-3 text-rose-600 font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Activated historical episode span 01/09/2026 - 03/09/2026.');
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
                            setActiveTab('directives');
                            showToast('Loaded 01/09/2026 - 03/09/2026 into directives form for review.');
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
        </div>
      </div>
    </div>
  );
};
