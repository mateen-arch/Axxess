import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  FolderHeart
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { PatientChartsView } from './PatientChartsView';

export const PatientsView: React.FC = () => {
  const {
    patients,
    setSelectedPatient,
    setIsNewPatientModalOpen,
    serviceFilter,
    setServiceFilter,
    patientSubTab,
    setPatientSubTab,
    chartTasks,
  } = useHealthcare();

  const [searchTerm, setSearchTerm] = useState('');

  // Glance Metrics
  const activePatientsCount = patients.filter(p => p.status === 'active').length;
  const totalTasksCount = chartTasks.length;
  const atRiskPatientsCount = patients.filter(p => p.fallRisk || p.hospitalizationRisk || p.infectionRisk).length;
  const completedTasksCount = chartTasks.filter(t => t.status === 'Completed' || t.status === 'Submitted With Signature').length;

  const filteredPatients = patients.filter((p) => {
    const matchesService = serviceFilter === 'all' || p.serviceLine === serviceFilter;
    const matchesSearch =
      `${p.firstName} ${p.lastName} ${p.mrn} ${p.primaryDiagnosis} ${p.address?.city || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  });

  return (
    <div className="space-y-5 transition-colors animate-fadeIn">
      {/* View Header with Subtab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            <FolderHeart className="text-rose-600 dark:text-rose-400" size={24} />
            <span>Patient Charts & Clinical Records</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Electronic Health Records (EHR), clinical encounters, and interdisciplinary care plans
          </p>
        </div>

        {/* Subtabs + Quick Admit */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPatientSubTab('charts')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                patientSubTab === 'charts'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Patient Charts
            </button>
            <button
              type="button"
              onClick={() => setPatientSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                patientSubTab === 'directory'
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Patient Directory
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewPatientModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus size={15} />
            <span>Admit New Patient</span>
          </button>
        </div>
      </div>

      {/* 4 Top Glance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                Active Census
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Users size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                {activePatientsCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Patients
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100%
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Active plan
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                Clinical Tasks
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                {totalTasksCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Monitored
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
              All Lines
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Across disciplines
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                At-Risk Protocols
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {atRiskPatientsCount}
              </span>
              <span className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80">
                Flagged
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              Fall / Infection
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Special watch
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-850/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
                Encounters
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {completedTasksCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                Completed
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-pearl-100 dark:border-charcoal-750 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Signed
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Documented
            </span>
          </div>
        </div>
      </div>

      {/* View Content depending on active subtab */}
      {patientSubTab === 'charts' ? (
        <PatientChartsView />
      ) : (
        /* Patient Directory Table */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, MRN, city, or diagnosis..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {(['all', 'home_health', 'home_care', 'hospice'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setServiceFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    serviceFilter === filter
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-pearl-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-pearl-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Table */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-100/80 dark:bg-charcoal-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Patient Name & MRN</th>
                    <th className="py-3 px-4">Service Line</th>
                    <th className="py-3 px-4">Primary Diagnosis</th>
                    <th className="py-3 px-4">Assigned Clinician</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Next Visit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-700 text-xs">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="hover:bg-rose-50/40 dark:hover:bg-charcoal-750 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold flex items-center justify-center text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              {patient.mrn} • DOB: {patient.dob}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`badge ${
                          patient.serviceLine === 'home_health' ? 'badge-crimson' : 'badge-slate dark:bg-charcoal-700 dark:text-slate-300'
                        }`}>
                          {patient.serviceLine.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="truncate block font-medium text-slate-700 dark:text-slate-300">
                          {patient.primaryDiagnosis}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {patient.assignedNurseName || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {patient.address ? `${patient.address.city}, ${patient.address.state}` : 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                          {patient.nextScheduledVisit || 'None Scheduled'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 p-1">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
