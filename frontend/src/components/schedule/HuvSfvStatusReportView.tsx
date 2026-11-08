import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Building2,
  Calendar,
  Users,
  BarChart3,
  X
} from 'lucide-react';
import { initialHuvSfvRecords } from '../../data/mockData';
import { HuvSfvRecord, ServiceLine } from '../../types';
import { SearchableMultiSelect } from '../common/SearchableMultiSelect';

export const HuvSfvStatusReportView: React.FC = () => {
  const [records] = useState<HuvSfvRecord[]>(initialHuvSfvRecords);

  // Tab State
  const [selectedServiceTab, setSelectedServiceTab] = useState<'hospice' | 'all'>('hospice');

  // Filter States
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(['org-hh', 'org-hc']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['branch-1']);
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState<string[]>([
    'Completed',
    'Scheduled',
    'Documented',
    'Pending Signature',
    'Overdue'
  ]);
  const [selectedType, setSelectedType] = useState<'all' | 'HUV' | 'SFV'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<keyof HuvSfvRecord>('daysRemaining');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Popovers
  const [isReportCenterOpen, setIsReportCenterOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Dropdown options
  const orgOptions = [
    { id: 'org-hh', label: 'Standards Home Care', category: 'Home Health' },
    { id: 'org-hc', label: 'Standards Home Care', category: 'Home Care' }
  ];

  const branchOptions = [
    { id: 'branch-1', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Health', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { id: 'branch-2', label: 'Standards Home Care', category: 'Standards Home Care', badge: 'Home Care', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }
  ];

  const taskStatusOptions = [
    'Not Yet Due',
    'Not Yet Started',
    'Saved',
    'Completed',
    'Pending Addendum',
    'Not Yet Scheduled'
  ];

  const huvSvfOptions = ['HUV1', 'HUV2', 'SFV'];
  const [selectedHuvSvf, setSelectedHuvSvf] = useState<string[]>(['HUV1', 'HUV2', 'SFV']);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Tab service filter
      if (selectedServiceTab !== 'all' && r.serviceLine !== selectedServiceTab) return false;

      // Task Status filter
      if (selectedTaskStatuses.length > 0 && !selectedTaskStatuses.includes(r.taskStatus)) {
        return false;
      }

      // HUV vs SFV type filter
      if (selectedType !== 'all' && r.type !== selectedType) return false;

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matches =
          r.firstName.toLowerCase().includes(query) ||
          r.lastName.toLowerCase().includes(query) ||
          r.mrn.toLowerCase().includes(query) ||
          r.task.toLowerCase().includes(query) ||
          r.team.toLowerCase().includes(query) ||
          r.branch.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      const strA = String(aVal);
      const strB = String(bVal);
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [records, selectedServiceTab, selectedTaskStatuses, selectedType, searchTerm, sortField, sortAsc]);

  const resetFilters = () => {
    setSelectedServiceTab('hospice');
    setSelectedOrgs(['org-hh', 'org-hc']);
    setSelectedBranches(['branch-1']);
    setSelectedTaskStatuses(['Completed', 'Scheduled', 'Documented', 'Pending Signature', 'Overdue']);
    setSelectedType('all');
    setSearchTerm('');
  };

  // CSV Export (Excel Compatible)
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast('No records available to export.');
      return;
    }

    const headers = [
      'Branch',
      'Team',
      'First Name',
      'Last Name',
      'MRN',
      'Patient Status',
      'Task',
      'HUV/SFV',
      'Task Status',
      'Visit Date',
      'Admission Date',
      'Days Remaining',
      'Notes'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.branch}"`,
      `"${r.team}"`,
      `"${r.firstName}"`,
      `"${r.lastName}"`,
      `"${r.mrn}"`,
      `"${r.patientStatus}"`,
      `"${r.task}"`,
      `"${r.type}"`,
      `"${r.taskStatus}"`,
      `"${r.visitDate}"`,
      `"${r.admissionDate}"`,
      r.daysRemaining,
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HUV_SFV_Status_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredRecords.length} compliance records to Excel/CSV`);
  };

  const handleSort = (field: keyof HuvSfvRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const hasActiveFilters =
    selectedOrgs.length < orgOptions.length ||
    selectedBranches.length < branchOptions.length ||
    selectedTaskStatuses.length < taskStatusOptions.length ||
    selectedHuvSvf.length < huvSvfOptions.length ||
    Boolean(searchTerm.trim());

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
        {/* Tier 1: Service Line Tabs & Primary Report Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Service Line Segmented Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedServiceTab('hospice')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceTab === 'hospice'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Hospice Compliance</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedServiceTab === 'hospice'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-pearl-200 text-slate-600 dark:bg-charcoal-600 dark:text-slate-300'
              }`}>
                {records.filter(r => r.serviceLine === 'hospice').length}
              </span>
            </button>

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
                {records.length}
              </span>
            </button>
          </div>

          {/* Right Header: Report Center & Export */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReportCenterOpen(true)}
              className="h-9 px-4 rounded-xl bg-pearl-100 dark:bg-charcoal-750 hover:bg-pearl-200 dark:hover:bg-charcoal-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all border border-pearl-300 dark:border-charcoal-600 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <BarChart3 size={14} className="text-rose-600 dark:text-rose-400" />
              <span>Report Center</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-extrabold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Filter Controls matching Axxess layout */}
        <div className="pt-3 border-t border-pearl-200/80 dark:border-charcoal-700/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* Organization */}
            <SearchableMultiSelect
              label="Organization"
              placeholder="Organizations: All"
              searchPlaceholder="Search for Organizations"
              options={orgOptions}
              selectedValues={selectedOrgs}
              onChange={setSelectedOrgs}
              allLabel="Organizations: All"
            />

            {/* Branch */}
            <SearchableMultiSelect
              label="Branch"
              placeholder="Branches: All"
              searchPlaceholder="Search for Branches"
              options={branchOptions}
              selectedValues={selectedBranches}
              onChange={setSelectedBranches}
              allLabel="Branches: All"
            />

            {/* Task Status */}
            <SearchableMultiSelect
              label="Task Status"
              placeholder="All Selected"
              searchPlaceholder="Search for taskStatusFilter"
              headerTitle="TaskStatusFilter"
              options={taskStatusOptions}
              selectedValues={selectedTaskStatuses}
              onChange={setSelectedTaskStatuses}
              allLabel="All Selected"
            />

            {/* HUV / SVF Multi-Select */}
            <SearchableMultiSelect
              label="HUV/SVF"
              placeholder="All Selected"
              searchPlaceholder="Search for huvSvfFilter"
              headerTitle="HuvSvfFilter"
              options={huvSvfOptions}
              selectedValues={selectedHuvSvf}
              onChange={setSelectedHuvSvf}
              allLabel="All Selected"
            />

            {/* Search Input & Reset Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Search Patient / Task
                </label>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-rose-600 dark:text-rose-400 text-[10px] font-extrabold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patient, task, or MRN..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Modern Table Card */}
      <div className="relative z-10 rounded-3xl glass-panel border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[850px]">
            {/* Headers Streamlined for High Signal and Zero Visual Clutter */}
            <thead>
              <tr className="bg-pearl-100/70 dark:bg-charcoal-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-pearl-200 dark:border-charcoal-700 whitespace-nowrap">
                <th
                  className="py-3.5 px-5 w-[25%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('lastName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Patient & MRN</span>
                    <ChevronDown size={12} className={sortField === 'lastName' || sortField === 'firstName' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3.5 px-5 w-[18%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('branch')}
                >
                  <div className="flex items-center gap-1">
                    <span>Branch & Team</span>
                    <ChevronDown size={12} className={sortField === 'branch' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3.5 px-5 w-[23%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('task')}
                >
                  <div className="flex items-center gap-1">
                    <span>Task & Compliance Type</span>
                    <ChevronDown size={12} className={sortField === 'task' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3.5 px-5 w-[18%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('visitDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Visit Date & Timeline</span>
                    <ChevronDown size={12} className={sortField === 'visitDate' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3.5 px-5 w-[16%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('taskStatus')}
                >
                  <div className="flex items-center gap-1">
                    <span>Task Status</span>
                    <ChevronDown size={12} className={sortField === 'taskStatus' ? 'text-rose-600' : 'text-slate-400'} />
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-pearl-100 dark:bg-charcoal-750 text-slate-400 flex items-center justify-center mx-auto">
                        <AlertCircle size={28} />
                      </div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                        No Tasks Found.
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No HUV or SFV compliance records match your selected criteria.
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
                filteredRecords.map(item => {
                  const isOverdue = item.daysRemaining === 0 || item.taskStatus === 'Overdue';
                  const isWarning = item.daysRemaining <= 3 && !isOverdue;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-pearl-50/70 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Patient & MRN */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {item.lastName}, {item.firstName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-semibold">{item.mrn}</span>
                            <span>•</span>
                            <span className="text-[10px] text-slate-400">Adm: {item.admissionDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Team */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {item.branch}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.team}
                          </div>
                        </div>
                      </td>

                      {/* Task & Compliance Type */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-1">
                          <div className="font-extrabold text-xs text-slate-950 dark:text-white truncate" title={item.task}>
                            {item.task}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-black ${
                              item.type === 'HUV'
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-400">Hospice Visit</span>
                          </div>
                        </div>
                      </td>

                      {/* Visit Date & Timeline */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{item.visitDate}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black font-mono ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 animate-pulse'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {isOverdue ? 'Overdue' : `${item.daysRemaining} days left`}
                          </span>
                        </div>
                      </td>

                      {/* Task Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.taskStatus === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : item.taskStatus === 'Overdue'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                            : item.taskStatus === 'Pending Signature'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.taskStatus === 'Completed' ? 'bg-emerald-500' :
                            item.taskStatus === 'Overdue' ? 'bg-rose-500' :
                            item.taskStatus === 'Pending Signature' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <span>{item.taskStatus}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-pearl-50/90 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              CMS CoP Regulatory Audit Readiness:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <CheckCircle2 size={13} />
              100% Documentation Compliant
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Axxess HQRP & SIA Hospice Tracking Engine
          </div>
        </div>
      </div>

      {/* Report Center Modal */}
      {isReportCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-charcoal-850 rounded-3xl p-6 shadow-2xl border border-pearl-200 dark:border-charcoal-700 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Hospice Report Center & Analytics
                  </h4>
                  <p className="text-xs text-slate-500">
                    CMS HQRP Quality Measures & Service Intensity Add-On (SIA)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportCenterOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div className="text-[11px] font-bold text-slate-500 uppercase">HUV Rate (Crisis Visits)</div>
                <div className="text-xl font-black text-purple-600 mt-1">42.8%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">RN bedside unannounced care</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div className="text-[11px] font-bold text-slate-500 uppercase">SFV Plan Adherence</div>
                <div className="text-xl font-black text-emerald-600 mt-1">98.4%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Scheduled frequency on target</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div className="text-[11px] font-bold text-slate-500 uppercase">SIA Reimbursement Eligible</div>
                <div className="text-xl font-black text-rose-600 mt-1">26.5 Hrs</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Last 7 days of life care</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Audit Exceptions</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">1 Overdue</div>
                <div className="text-[10px] text-rose-500 font-bold mt-0.5">Requires immediate supervisor sign</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReportCenterOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReportCenterOpen(false);
                  handleExportCSV();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export Full Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
