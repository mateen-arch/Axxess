import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  Users,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Plus,
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  FileSpreadsheet,
  ChevronDown,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { UnassignedPatientVisit, ServiceLine } from '../../types';
import { AssignClinicianModal } from './AssignClinicianModal';
import { BulkAssignModal } from './BulkAssignModal';

import { SearchableMultiSelect } from '../common/SearchableMultiSelect';

export const UnassignedVisitsView: React.FC = () => {
  const { unassignedVisits, clinicians, deleteUnassignedVisit } = useHealthcare();

  // Service Line Tab State
  const [selectedServiceTab, setSelectedServiceTab] = useState<'all' | ServiceLine>('all');

  // Filter States
  const [dateFrom, setDateFrom] = useState<string>('2026-11-03');
  const [dateTo, setDateTo] = useState<string>('2026-11-10');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(['org-hh', 'org-hc']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['branch-1', 'branch-2']);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'Skilled Nurse Visit',
    'RN - Skilled Nurse Wound VAC',
    'HHA - Routine Personal Care & Bath',
    'PT - Physical Therapy Gait Training',
    'RN - OASIS 30-Day Recertification',
    'Hospice RN - Palliative Pain Assessment',
    'HHA - Meal Prep & Safety Supervision',
    'RN - IV Antibiotic Administration'
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Dropdown options matching Axxess
  const orgOptions = [
    { id: 'org-hh', label: 'Standards Home Care', category: 'Home Health' },
    { id: 'org-hc', label: 'Standards Home Care', category: 'Home Care' }
  ];

  const branchOptions = [
    { id: 'branch-1', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Health', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { id: 'branch-2', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Care', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }
  ];

  const taskOptions = [
    'Skilled Nurse Visit',
    'RN - Skilled Nurse Wound VAC',
    'HHA - Routine Personal Care & Bath',
    'PT - Physical Therapy Gait Training',
    'RN - OASIS 30-Day Recertification',
    'Hospice RN - Palliative Pain Assessment',
    'HHA - Meal Prep & Safety Supervision',
    'RN - IV Antibiotic Administration'
  ];

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'task' | 'patient'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Multi-Select State
  const [selectedVisitIds, setSelectedVisitIds] = useState<string[]>([]);

  // Modals & Popovers
  const [assignModalVisit, setAssignModalVisit] = useState<UnassignedPatientVisit | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [inspectVisit, setInspectVisit] = useState<UnassignedPatientVisit | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Service Line Counts
  const serviceCounts = useMemo(() => {
    return {
      all: unassignedVisits.length,
      home_health: unassignedVisits.filter(v => v.serviceLine === 'home_health').length,
      home_care: unassignedVisits.filter(v => v.serviceLine === 'home_care').length,
      hospice: unassignedVisits.filter(v => v.serviceLine === 'hospice').length
    };
  }, [unassignedVisits]);

  // Filtering Logic
  const filteredVisits = useMemo(() => {
    return unassignedVisits.filter(v => {
      // Tab service line filter
      if (selectedServiceTab !== 'all' && v.serviceLine !== selectedServiceTab) {
        return false;
      }

      // Date range filter
      if (dateFrom && v.scheduledDate < dateFrom) return false;
      if (dateTo && v.scheduledDate > dateTo) return false;

      // Task filter
      if (selectedTasks.length > 0 && !selectedTasks.includes(v.task)) return false;

      // Search term (searches patient name, MRN, task, address, or phone)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matches =
          v.patientName.toLowerCase().includes(query) ||
          v.patientMrn.toLowerCase().includes(query) ||
          v.task.toLowerCase().includes(query) ||
          v.patientAddress.toLowerCase().includes(query) ||
          v.patientPhone.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.scheduledDate.localeCompare(b.scheduledDate);
      } else if (sortField === 'task') {
        comparison = a.task.localeCompare(b.task);
      } else if (sortField === 'patient') {
        comparison = a.patientName.localeCompare(b.patientName);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [unassignedVisits, selectedServiceTab, dateFrom, dateTo, selectedBranches, selectedTasks, searchTerm, sortField, sortAsc]);

  // Selection helpers
  const handleToggleSelectAll = () => {
    if (selectedVisitIds.length === filteredVisits.length) {
      setSelectedVisitIds([]);
    } else {
      setSelectedVisitIds(filteredVisits.map(v => v.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedVisitIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSelectedServiceTab('all');
    setDateFrom('2026-11-03');
    setDateTo('2026-11-10');
    setSelectedOrgs(['org-hh', 'org-hc']);
    setSelectedBranches(['branch-1', 'branch-2']);
    setSelectedTasks(taskOptions);
    setSearchTerm('');
    setSelectedVisitIds([]);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredVisits.length === 0) {
      showToast('No visits available to export.');
      return;
    }

    const headers = ['Task', 'Patient Name', 'MRN', 'Phone', 'Address', 'Service Line', 'Branch', 'Schedule Date', 'Day', 'Time', 'Priority', 'Status', 'Notes'];
    const rows = filteredVisits.map(v => [
      `"${v.task}"`,
      `"${v.patientName}"`,
      `"${v.patientMrn}"`,
      `"${v.patientPhone}"`,
      `"${v.patientAddress}"`,
      `"${v.serviceLine}"`,
      `"${v.branch}"`,
      `"${v.scheduledDate}"`,
      `"${v.dayOfWeek}"`,
      `"${v.timeSlot}"`,
      `"${v.priority}"`,
      `"${v.status}"`,
      `"${v.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Unassigned_Patient_Visits_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredVisits.length} unassigned encounters to Excel/CSV`);
  };

  const formatServiceLine = (s: string) => {
    if (s === 'home_health') return 'Home Health';
    if (s === 'home_care') return 'Home Care';
    if (s === 'hospice') return 'Hospice';
    return s;
  };

  const formatPatientName = (name: string) => {
    if (!name.includes(',')) return name;
    const parts = name.split(',').map(s => s.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
    return name;
  };

  const selectedVisitsObjects = useMemo(() => {
    return unassignedVisits.filter(v => selectedVisitIds.includes(v.id));
  }, [unassignedVisits, selectedVisitIds]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-white/10 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Structured Modern Control Center */}
      <div className="relative z-30 p-4 rounded-3xl glass-panel border border-pearl-200 dark:border-charcoal-700 space-y-3.5 shadow-xs">
        {/* Tier 1: Service Line Tabs & Primary Actions (Export, Bulk Assign) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Service Line Segmented Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedServiceTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceTab === 'all'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>All Services</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedServiceTab === 'all'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-pearl-200 text-slate-600 dark:bg-charcoal-600 dark:text-slate-300'
              }`}>
                {serviceCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedServiceTab('home_health')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceTab === 'home_health'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Home Health</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedServiceTab === 'home_health'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-pearl-200 text-slate-600 dark:bg-charcoal-600 dark:text-slate-300'
              }`}>
                {serviceCounts.home_health}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedServiceTab('home_care')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceTab === 'home_care'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Home Care</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedServiceTab === 'home_care'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-pearl-200 text-slate-600 dark:bg-charcoal-600 dark:text-slate-300'
              }`}>
                {serviceCounts.home_care}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedServiceTab('hospice')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceTab === 'hospice'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Hospice</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedServiceTab === 'hospice'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-pearl-200 text-slate-600 dark:bg-charcoal-600 dark:text-slate-300'
              }`}>
                {serviceCounts.hospice}
              </span>
            </button>
          </div>

          {/* Right Header: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 hover:bg-pearl-50 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              disabled={selectedVisitIds.length === 0}
              onClick={() => setIsBulkModalOpen(true)}
              className={`h-9 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                selectedVisitIds.length > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 active:scale-98'
                  : 'bg-pearl-200 dark:bg-charcoal-750 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Users size={15} />
              <span>Bulk Assign {selectedVisitIds.length > 0 ? `(${selectedVisitIds.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Filters Bar */}
        <div className="pt-3 border-t border-pearl-200/80 dark:border-charcoal-700/80">
          <div className="flex flex-wrap items-end gap-3">
            {/* Date Range: Date From - Date To */}
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date From
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>
              </div>

              <span className="text-slate-400 font-bold self-end pb-2">—</span>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date To
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="min-w-[160px] flex-1">
              <SearchableMultiSelect
                label="Organization"
                placeholder="Organizations: All"
                searchPlaceholder="Search for Organizations"
                options={orgOptions}
                selectedValues={selectedOrgs}
                onChange={setSelectedOrgs}
                allLabel="Organizations: All"
              />
            </div>

            {/* Branch */}
            <div className="min-w-[160px] flex-1">
              <SearchableMultiSelect
                label="Branch"
                placeholder="Branches: All"
                searchPlaceholder="Search for Branches"
                options={branchOptions}
                selectedValues={selectedBranches}
                onChange={setSelectedBranches}
                allLabel="Branches: All"
              />
            </div>

            {/* Task */}
            <div className="min-w-[160px] flex-1">
              <SearchableMultiSelect
                label="Task"
                placeholder="All Selected"
                searchPlaceholder="Search Tasks"
                headerTitle="Task Filter"
                options={taskOptions}
                selectedValues={selectedTasks}
                onChange={setSelectedTasks}
                allLabel="All Selected"
              />
            </div>

            {/* Actions: Generate & Clear */}
            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={() => showToast(`Filtered ${filteredVisits.length} unassigned visits.`)}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 px-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-pearl-300 dark:border-charcoal-600 hover:bg-pearl-50 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="relative z-10 rounded-3xl glass-panel border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-pearl-100/70 dark:bg-charcoal-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-pearl-200 dark:border-charcoal-700">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {selectedVisitIds.length > 0 && selectedVisitIds.length === filteredVisits.length ? (
                      <CheckSquare size={16} className="text-rose-600 dark:text-rose-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    if (sortField === 'task') setSortAsc(!sortAsc);
                    else {
                      setSortField('task');
                      setSortAsc(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Task</span>
                    <ChevronDown size={13} className={sortField === 'task' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    if (sortField === 'patient') setSortAsc(!sortAsc);
                    else {
                      setSortField('patient');
                      setSortAsc(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Client / Patient</span>
                    <ChevronDown size={13} className={sortField === 'patient' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="py-3.5 px-4">Branch & Org</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else {
                      setSortField('date');
                      setSortAsc(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Schedule Date</span>
                    <ChevronDown size={13} className={sortField === 'date' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-slate-400">
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-pearl-100 dark:bg-charcoal-750 text-slate-400 flex items-center justify-center mx-auto">
                        <AlertCircle size={28} />
                      </div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                        No Tasks Found.
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No unassigned client visits match your active date range or service criteria.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-200 hover:bg-pearl-200 dark:hover:bg-charcoal-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVisits.map(visit => {
                  const isSelected = selectedVisitIds.includes(visit.id);
                  const isUrgent = visit.priority === 'urgent' || visit.priority === 'stat' || visit.priority === 'critical';

                  return (
                    <tr
                      key={visit.id}
                      className={`hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/40 transition-colors ${
                        isSelected ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(visit.id)}
                          className="cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-rose-600 dark:text-rose-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Task */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {visit.task}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {visit.requiredCredentials} Required
                            </span>
                            <span>•</span>
                            <span className="capitalize">{formatServiceLine(visit.serviceLine)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Patient / Client */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-950 dark:text-white">
                            {formatPatientName(visit.patientName)}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {visit.patientMrn} • {visit.patientPhone}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-xs">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{visit.patientAddress}</span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Organization */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {visit.branch}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {visit.organization}
                          </div>
                        </div>
                      </td>

                      {/* Schedule Date */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {visit.scheduledDate}
                      </td>

                      {/* Day */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {visit.dayOfWeek}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {visit.timeSlot}
                      </td>

                      {/* Status / Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          isUrgent
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>{isUrgent ? 'Urgent Unassigned' : 'Pending Match'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Clinician Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModalVisit(visit);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-extrabold shadow-sm hover:shadow-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck size={13} />
                            <span>Assign</span>
                          </button>

                          {/* Notes / Details */}
                          <button
                            type="button"
                            onClick={() => setInspectVisit(visit)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Info size={15} />
                          </button>

                          {/* Delete / Dismiss */}
                          <button
                            type="button"
                            onClick={() => {
                              deleteUnassignedVisit(visit.id);
                              showToast(`Dismissed visit ${visit.task}`);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Dismiss Visit"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-pearl-50/90 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Total Unassigned Visits: <strong className="text-slate-900 dark:text-white">{unassignedVisits.length}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Automated Intake & Physician Order Intake Active
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Axxess Intelligent Dispatcher v1.0
          </div>
        </div>
      </div>

      {/* Detail Inspector Drawer / Dialog */}
      {inspectVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-charcoal-850 rounded-3xl p-6 shadow-2xl border border-pearl-200 dark:border-charcoal-700 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {inspectVisit.serviceLine.replace('_', ' ')}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {inspectVisit.task}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setInspectVisit(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong>Patient:</strong> {inspectVisit.patientName} ({inspectVisit.patientMrn})
              </div>
              <div>
                <strong>Address:</strong> {inspectVisit.patientAddress}
              </div>
              <div>
                <strong>Scheduled:</strong> {inspectVisit.dayOfWeek}, {inspectVisit.scheduledDate} at {inspectVisit.timeSlot}
              </div>
              <div>
                <strong>Credential Required:</strong> {inspectVisit.requiredCredentials}
              </div>
              <div>
                <strong>Clinical Notes:</strong>
                <p className="mt-1 p-2.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 text-[11px] italic">
                  {inspectVisit.notes || 'No extra clinical notes recorded.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectVisit(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const v = inspectVisit;
                  setInspectVisit(null);
                  setAssignModalVisit(v);
                  setIsAssignModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Assign Clinician
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AssignClinicianModal
        visit={assignModalVisit}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignModalVisit(null);
        }}
        onSuccess={showToast}
      />

      <BulkAssignModal
        selectedVisits={selectedVisitsObjects}
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedVisitIds([]);
        }}
        onSuccess={showToast}
      />
    </div>
  );
};
