import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Calendar,
  Check,
  X,
  ChevronDown,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { useHealthcare } from '../../context/HealthcareContext';

interface UnscheduledVisitsReportViewProps {
  onBack?: () => void;
  onNavigateToSchedule?: (patientId: string) => void;
}

interface ReportRecord {
  mrn: string;
  patientName: string;
  patientId: string;
  payer: string;
  discipline: string;
  frequencyStartDate: string;
  frequencyEndDate: string;
  unscheduledCount: number;
}

const ALL_DISCIPLINES = ['Nursing', 'PT', 'OT', 'ST', 'HHA', 'MSW'];

const ALL_PAYERS = [
  'NGS JK',
  '62308--CIGNA (Institutional Claims 837) Carelink',
  'AETNA',
  'BLUE CROSS BLUE SHIELD OF MASS PROVIDER',
  'BMC EAST BOSTON NEIGHBORHOOD HEALTH WELLSENSE',
  'BMC HEALTHNET PLAN SCO',
  'BMC WELLSENSE BILH PERFORMANCE NETWORK',
  'COMMONWEALTH CARE ALLIANCE',
  'FALLON HEALTH - NAVICARE',
  'HARVARD PILGRIM HEALTH CARE',
  'MASSHEALTH STANDARD',
  'MEDICAID MASSACHUSETTS',
  'MEDICARE (TRADITIONAL)',
  'TUFTS HEALTH PLAN',
  'UNITED HEALTHCARE',
  'SENIOR WHOLE HEALTH',
  'WELLCARE OF MASSACHUSETTS',
  'HUMANA HEALTHCARE',
  'CELTICARE HEALTH PLAN',
  'ALLWAYS HEALTH PARTNERS',
  'BLUE BENEFIT ADMINISTRATORS',
  'BOSTON MEDICAL CENTER HEALTHNET',
  'CHAMPVA',
  'CONNECTICUT GENERAL LIFE',
  'EMPIRE BLUE CROSS',
  'FIDELIS CARE',
  'GEHA HEALTHCARE',
  'HEALTH NEW ENGLAND',
  'MEDICA HEALTHCARE',
  'MUTUAL OF OMAHA',
  'OXFORD HEALTH PLANS',
  'TRICARE FOR LIFE',
  'UNIPHARM HEALTH',
  'US HEALTH GROUP',
  'VETERANS AFFAIRS COMMUNITY CARE',
  'WORKERS COMPENSATION TRUST'
];

export const UnscheduledVisitsReportView: React.FC<UnscheduledVisitsReportViewProps> = ({
  onBack,
  onNavigateToSchedule,
}) => {
  const { setHomeHealthTab } = useHealthcare();

  // Filters State
  const [selectedBranch, setSelectedBranch] = useState<string>('Standards Home Care');
  const [dateFrom, setDateFrom] = useState<string>('2026-09-23');
  const [dateTo, setDateTo] = useState<string>('2026-11-21');

  // Multi-select Dropdowns State
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(ALL_DISCIPLINES);
  const [selectedPayers, setSelectedPayers] = useState<string[]>(ALL_PAYERS);
  const [isDisciplineDropdownOpen, setIsDisciplineDropdownOpen] = useState<boolean>(false);
  const [isPayerDropdownOpen, setIsPayerDropdownOpen] = useState<boolean>(false);
  const [payerSearch, setPayerSearch] = useState<string>('');

  // Report Data State
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'patientName' | 'mrn' | 'unscheduledCount'>('patientName');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const disciplineRef = useRef<HTMLDivElement>(null);
  const payerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (disciplineRef.current && !disciplineRef.current.contains(e.target as Node)) {
        setIsDisciplineDropdownOpen(false);
      }
      if (payerRef.current && !payerRef.current.contains(e.target as Node)) {
        setIsPayerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Discipline Toggle Handlers
  const handleCheckAllDisciplines = () => setSelectedDisciplines(ALL_DISCIPLINES);
  const handleUncheckAllDisciplines = () => setSelectedDisciplines([]);
  const toggleDiscipline = (disc: string) => {
    if (selectedDisciplines.includes(disc)) {
      setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc));
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  // Payer Toggle Handlers
  const handleCheckAllPayers = () => setSelectedPayers(ALL_PAYERS);
  const handleUncheckAllPayers = () => setSelectedPayers([]);
  const togglePayer = (pyr: string) => {
    if (selectedPayers.includes(pyr)) {
      setSelectedPayers(selectedPayers.filter(p => p !== pyr));
    } else {
      setSelectedPayers([...selectedPayers, pyr]);
    }
  };

  const filteredPayersList = useMemo(() => {
    if (!payerSearch.trim()) return ALL_PAYERS;
    return ALL_PAYERS.filter(p => p.toLowerCase().includes(payerSearch.toLowerCase()));
  }, [payerSearch]);

  // Generate Report from Database
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await api.getUnscheduledVisitsReport({
        branch: selectedBranch,
        dateFrom,
        dateTo,
        disciplines: selectedDisciplines,
        payers: selectedPayers
      });

      if (res && res.records) {
        setRecords(res.records);
      } else {
        setRecords([]);
      }
      setReportGenerated(true);
      showToast(`Report generated: ${res.records?.length || 0} records retrieved from database.`);
    } catch (err: any) {
      showToast(`Error generating report: ${err.message || 'Server error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel / CSV
  const handleExportToExcel = () => {
    if (records.length === 0) {
      showToast('No records to export. Please generate the report first.');
      return;
    }
    const headers = [
      'MRN',
      'Patient Name',
      'Payer',
      'Discipline',
      'Frequency Start Date',
      'Frequency End Date',
      'Number of Unscheduled Visits'
    ];
    const rows = records.map(r => [
      `"${r.mrn}"`,
      `"${r.patientName}"`,
      `"${r.payer}"`,
      `"${r.discipline}"`,
      `"${r.frequencyStartDate}"`,
      `"${r.frequencyEndDate}"`,
      r.unscheduledCount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Unscheduled_Visits_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported successfully to CSV.');
  };

  // Sorted Records
  const sortedRecords = useMemo(() => {
    const list = [...records];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'patientName') {
        cmp = a.patientName.localeCompare(b.patientName);
      } else if (sortField === 'mrn') {
        cmp = a.mrn.localeCompare(b.mrn);
      } else if (sortField === 'unscheduledCount') {
        cmp = a.unscheduledCount - b.unscheduledCount;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [records, sortField, sortAsc]);

  const toggleSort = (field: 'patientName' | 'mrn' | 'unscheduledCount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans text-xs select-none overflow-y-auto">
      {/* 1. Burgundy Chrome Window Title Bar (Matching Screenshot 1) */}
      <div className="bg-[#891e3e] text-white px-3 py-1.5 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center space-x-2">
          <FileText size={14} className="text-white/90" />
          <span className="font-extrabold text-xs tracking-wider">Unscheduled Visits Report</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block cursor-pointer"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block cursor-pointer"></span>
          <span
            onClick={onBack}
            className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block cursor-pointer hover:bg-rose-500"
            title="Close Unscheduled Visits Report"
          ></span>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
        {/* Filter Card: Unscheduled Visits ? (Faithful reproduction of Screenshot 1) */}
        <div className="bg-[#fffdfa] dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-sm p-4 sm:p-6 relative">
          {/* Card Label */}
          <div className="flex items-center space-x-1.5 mb-4">
            <span className="font-black text-xs text-slate-900 dark:text-white">
              Unscheduled Visits
            </span>
            <span
              title="This report identifies all patient physician frequency directives with unscheduled encounters in the selected period."
              className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-[10px] flex items-center justify-center cursor-help border border-sky-300"
            >
              ?
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 max-w-4xl mx-auto">
            {/* Branch Field */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28">
                Branch:
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="flex-1 max-w-xs py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:ring-1 focus:ring-[#2b78a3] outline-none"
              >
                <option value="Standards Home Care">Standards Home Care</option>
                <option value="North Dallas Branch">North Dallas Branch</option>
                <option value="All">All Branches</option>
              </select>
            </div>

            {/* Date Range Field */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28">
                Date Range:
              </label>
              <div className="flex-1 max-w-xs flex items-center space-x-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                />
                <span className="text-xs font-bold text-slate-500">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Discipline Multi-Select Field (Screenshot 3) */}
            <div className="flex items-center justify-between relative" ref={disciplineRef}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28">
                Discipline:
              </label>
              <div className="flex-1 max-w-xs relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDisciplineDropdownOpen(!isDisciplineDropdownOpen);
                    setIsPayerDropdownOpen(false);
                  }}
                  className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold flex items-center justify-between shadow-xs"
                >
                  <span>{selectedDisciplines.length} selected</span>
                  <ChevronDown size={12} />
                </button>

                {/* Dropdown Overlay (Screenshot 3) */}
                {isDisciplineDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-charcoal-800 rounded-lg shadow-2xl border border-pearl-200 dark:border-charcoal-700 z-50 overflow-hidden text-xs">
                    {/* Header: Check all / Uncheck all */}
                    <div className="p-2 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-750 flex items-center justify-between font-bold">
                      <button
                        type="button"
                        onClick={handleCheckAllDisciplines}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <Check size={12} className="stroke-[3]" />
                        <span>Check all</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleUncheckAllDisciplines}
                        className="text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1"
                      >
                        <X size={12} className="stroke-[3]" />
                        <span>Uncheck all</span>
                      </button>
                    </div>

                    {/* Checkbox Options */}
                    <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {ALL_DISCIPLINES.map((disc) => (
                        <label
                          key={disc}
                          className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer select-none font-semibold"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDisciplines.includes(disc)}
                            onChange={() => toggleDiscipline(disc)}
                            className="rounded text-[#2b78a3]"
                          />
                          <span>{disc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payer Multi-Select Field (Screenshot 2) */}
            <div className="flex items-center justify-between relative" ref={payerRef}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28">
                Payer:
              </label>
              <div className="flex-1 max-w-xs relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayerDropdownOpen(!isPayerDropdownOpen);
                    setIsDisciplineDropdownOpen(false);
                  }}
                  className="w-full py-1.5 px-3 rounded border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-semibold flex items-center justify-between shadow-xs"
                >
                  <span>{selectedPayers.length} selected</span>
                  <ChevronDown size={12} />
                </button>

                {/* Dropdown Overlay (Screenshot 2) */}
                {isPayerDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-80 sm:w-96 bg-white dark:bg-charcoal-800 rounded-lg shadow-2xl border border-pearl-200 dark:border-charcoal-700 z-50 overflow-hidden text-xs">
                    {/* Header: Check all / Uncheck all */}
                    <div className="p-2 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-750 flex items-center justify-between font-bold">
                      <button
                        type="button"
                        onClick={handleCheckAllPayers}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <Check size={12} className="stroke-[3]" />
                        <span>Check all</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleUncheckAllPayers}
                        className="text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1"
                      >
                        <X size={12} className="stroke-[3]" />
                        <span>Uncheck all</span>
                      </button>
                    </div>

                    {/* Search Input for Payers */}
                    <div className="p-2 border-b border-pearl-100 dark:border-charcoal-700">
                      <input
                        type="text"
                        placeholder="Search payers..."
                        value={payerSearch}
                        onChange={(e) => setPayerSearch(e.target.value)}
                        className="w-full py-1 px-2 rounded border border-pearl-300 dark:border-charcoal-600 text-xs font-medium"
                      />
                    </div>

                    {/* Payers List */}
                    <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                      {filteredPayersList.map((payer) => (
                        <label
                          key={payer}
                          className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-pearl-100 dark:hover:bg-charcoal-700 cursor-pointer select-none font-semibold text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPayers.includes(payer)}
                            onChange={() => togglePayer(payer)}
                            className="rounded text-[#2b78a3] shrink-0"
                          />
                          <span className="truncate">{payer}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons in Center (Screenshot 1) */}
          <div className="flex items-center justify-center space-x-4 mt-6 pt-2">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-6 py-2 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-black text-xs shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <RefreshCw size={13} className="animate-spin" />}
              <span>Generate Report</span>
            </button>

            <button
              type="button"
              onClick={handleExportToExcel}
              className="px-6 py-2 rounded bg-[#2b78a3] hover:bg-[#205d80] text-white font-black text-xs shadow transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>

        {/* 3. Report Results Table (Matching Screenshot 1) */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#b3d7eb]/60 dark:bg-[#1e475f]/60 text-slate-800 dark:text-slate-200 text-[11px] font-black uppercase border-b border-pearl-200 dark:border-charcoal-700">
                <tr>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:underline"
                    onClick={() => toggleSort('mrn')}
                  >
                    MRN
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:underline flex items-center space-x-1"
                    onClick={() => toggleSort('patientName')}
                  >
                    <span>Patient</span>
                    <span>▴</span>
                  </th>
                  <th className="py-2.5 px-3">Payer</th>
                  <th className="py-2.5 px-3">Discipline</th>
                  <th className="py-2.5 px-3">Frequency Start Date</th>
                  <th className="py-2.5 px-3">Frequency End Date</th>
                  <th
                    className="py-2.5 px-3 text-center cursor-pointer hover:underline"
                    onClick={() => toggleSort('unscheduledCount')}
                  >
                    Number of Unscheduled Visits
                  </th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {sortedRecords.map((r, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-pearl-50 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {r.mrn}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                      {r.patientName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {r.payer}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                        {r.discipline}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                      {r.frequencyStartDate}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                      {r.frequencyEndDate}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-rose-600 dark:text-rose-400 text-sm">
                      {r.unscheduledCount}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToSchedule) {
                            onNavigateToSchedule(r.patientId);
                          } else {
                            setHomeHealthTab('schedule-unassigned-visits');
                          }
                        }}
                        className="font-extrabold text-[#2b78a3] dark:text-[#60a5fa] hover:underline cursor-pointer flex items-center justify-end space-x-1 ml-auto"
                      >
                        <span>Schedule Visits</span>
                        <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold text-sm">
                      No records to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer showing Total (Screenshot 1) */}
          <div className="p-3 bg-pearl-50 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <div>Total: {sortedRecords.length}</div>
            {sortedRecords.length > 0 && (
              <div className="text-[11px] text-slate-500 font-semibold">
                Displaying 1 - {sortedRecords.length} of {sortedRecords.length} items
              </div>
            )}
          </div>
        </div>
      </div>

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

export default UnscheduledVisitsReportView;
