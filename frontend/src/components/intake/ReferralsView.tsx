import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Calendar,
  Phone,
  HeartPulse,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Referral } from '../../types';
import { IntakeEntryModal } from './IntakeEntryModal';

export const ReferralsView: React.FC = () => {
  const {
    referrals,
    inquiries,
    deleteReferral,
    intakeSubTab,
    setIntakeSubTab,
  } = useHealthcare();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Modal State for New/Edit Referral (Shared Unified Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenNew = () => {
    setEditingReferral(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ref: Referral) => {
    setEditingReferral(ref);
    setIsModalOpen(true);
  };

  // Filtered Referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const matchSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientPhone.includes(searchTerm) ||
        (item.referralType && item.referralType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchService =
        selectedService === 'all' || item.lineOfService.toLowerCase().includes(selectedService.toLowerCase());

      const matchBranch =
        selectedBranch === 'all' || item.branch.toLowerCase().includes(selectedBranch.toLowerCase());

      return matchSearch && matchService && matchBranch;
    });
  }, [referrals, searchTerm, selectedService, selectedBranch]);

  // Export to CSV
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Patient,Phone,Service,Branch,SOC,Type,Created By',
        ...filteredReferrals.map(r => `"${r.referralDate}","${r.patientName}","${r.patientPhone}","${r.lineOfService}","${r.branch}","${r.requestedSoc}","${r.referralType}","${r.createdBy}"`)
      ].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Referrals_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported referrals successfully');
  };

  const pendingSocCount = referrals.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-white/10 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Navigation Segment (Identical to Inquiries) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            Central Intake
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Incoming patient referrals, hospital handoffs, and admission readiness
          </p>
        </div>

        {/* Minimalist Segmented Pill: Inquiries vs Referrals */}
        <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIntakeSubTab('inquiries')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              intakeSubTab === 'inquiries'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Inquiries ({inquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setIntakeSubTab('referrals')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              intakeSubTab === 'referrals'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Referrals ({referrals.length})
          </button>
        </div>
      </div>

      {/* 3 Metric Glance Cards (Identical style to Inquiries) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Referrals
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {referrals.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <HeartPulse size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Start of Care
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {pendingSocCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Conversion
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              88.4%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Action / Search Bar (Identical style to Inquiries) */}
      <div className="p-3 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Minimal Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search referrals, patients, or sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Service Line Pill Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-pearl-200 dark:border-charcoal-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="Home Health">Home Health</option>
            <option value="Home Care">Home Care</option>
            <option value="Hospice">Hospice</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-pearl-200 dark:border-charcoal-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Branches</option>
            <option value="Standards Home Care">Standards Home Care</option>
            <option value="Dallas Main Branch">Dallas Main Branch</option>
            <option value="Plano Regional Branch">Plano Regional Branch</option>
            <option value="Fort Worth Branch">Fort Worth Branch</option>
          </select>
        </div>

        {/* Buttons on Right */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="h-9 px-3 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export CSV"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>New Referral</span>
          </button>
        </div>
      </div>

      {/* Proper Structured Table with Strictly Aligned Columns */}
      {/* Proper Structured Table with Strictly Aligned Columns */}
      <div className="relative z-10 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[850px]">
            {/* Table Header with Aligned Column Layout */}
            <thead>
              <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                <th className="py-3.5 px-5 w-[25%]">Patient Information</th>
                <th className="py-3.5 px-5 w-[14%]">DOB & Gender</th>
                <th className="py-3.5 px-5 w-[20%]">Service & Source</th>
                <th className="py-3.5 px-5 w-[16%]">Requested SOC</th>
                <th className="py-3.5 px-5 w-[13%]">Status</th>
                <th className="py-3.5 px-5 w-[12%] text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Rows with Strictly Aligned Cells */}
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">No referrals found</div>
                      <div className="text-xs text-slate-400">Try adjusting your search terms or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((item) => {
                  const initials = item.patientName.split(',').map(s => s.trim()[0]).filter(Boolean).join('');
                  const isHomeHealth = item.lineOfService.toLowerCase().includes('health');
                  const isHospice = item.lineOfService.toLowerCase().includes('hospice');

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Patient Information */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                              isHospice
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : isHomeHealth
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {initials || 'PT'}
                          </div>

                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                              {item.patientName}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                <Phone size={11} className="text-slate-400 shrink-0" />
                                {item.patientPhone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: DOB & Gender */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.dob || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded-md bg-pearl-200/70 dark:bg-charcoal-700 text-[10px] font-bold">
                            {item.sex || 'Female'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Service & Source */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            isHospice
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : isHomeHealth
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {item.lineOfService}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          <span>Source: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.referralType}</span>
                        </div>
                      </td>

                      {/* Column 4: Requested SOC */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{item.requestedSoc}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Start of care
                        </div>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          Ready for Admission
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Ref: {item.referralDate}</div>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors"
                            title="Edit referral"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete referral for ${item.patientName}?`)) {
                                deleteReferral(item.id);
                                showToast('Referral removed');
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete referral"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="p-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                            <ChevronRight size={15} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Unified Modern Modal for New / Edit Referral */}
      <IntakeEntryModal
        type="referral"
        isOpen={isModalOpen}
        initialData={editingReferral}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReferral(null);
        }}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
