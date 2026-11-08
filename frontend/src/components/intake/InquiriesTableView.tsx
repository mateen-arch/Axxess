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
  Edit2,
  UserCheck
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Inquiry } from '../../types';
import { IntakeEntryModal } from './IntakeEntryModal';

export const InquiriesTableView: React.FC = () => {
  const {
    inquiries,
    referrals,
    deleteInquiry,
    convertInquiryToReferral,
    intakeSubTab,
    setIntakeSubTab,
  } = useHealthcare();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Modal State for Edit/New Inquiry (Shared Unified Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenNew = () => {
    setEditingInquiry(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inq: Inquiry) => {
    setEditingInquiry(inq);
    setIsModalOpen(true);
  };

  // Capitalize Service Line helper (e.g. "home_health" -> "Home Health")
  const formatServiceLine = (line: string) => {
    if (line === 'home_health') return 'Home Health';
    if (line === 'home_care') return 'Home Care';
    if (line === 'hospice') return 'Hospice';
    return line.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchSearch =
        `${inq.clientFirstName} ${inq.clientLastName} ${inq.contactFirstName} ${inq.contactLastName} ${inq.serviceRequested}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (inq.clientPhone && inq.clientPhone.includes(searchTerm)) ||
        inq.contactPhone.includes(searchTerm);

      const matchService =
        selectedService === 'all' || inq.serviceLine.toLowerCase().includes(selectedService.toLowerCase());
      const matchBranch =
        selectedBranch === 'all' || inq.branch.toLowerCase().includes(selectedBranch.toLowerCase());

      return matchSearch && matchService && matchBranch;
    });
  }, [inquiries, searchTerm, selectedService, selectedBranch]);

  // Export to CSV
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Client Name,Client Phone,Contact Name,Contact Phone,Service,Branch,Assigned To,Status',
        ...filteredInquiries.map(i =>
          `"${i.inquiryDate}","${i.clientFirstName} ${i.clientLastName}","${i.clientPhone || ''}","${i.contactFirstName} ${i.contactLastName}","${i.contactPhone}","${formatServiceLine(i.serviceLine)}","${i.branch}","${i.assignedTeamMember}","${i.status}"`
        )
      ].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Inquiries_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported inquiries successfully');
  };

  const followUpCount = inquiries.filter(i => i.status === 'contacted' || i.status === 'new').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-white/10 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Navigation Segment (Identical to Referrals) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            Central Intake
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Incoming patient inquiries, lead screening, and automated field dispatch
          </p>
        </div>

        {/* Minimalist Segmented Pill: Inquiries vs Referrals (Exact same layout) */}
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

      {/* 3 Metric Glance Cards (Identical style to Referrals) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inquiries
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {inquiries.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <HeartPulse size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Follow-Up
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1">
              {followUpCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lead Conversion
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              78.5%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Action / Search Bar (Identical style to Referrals) */}
      <div className="p-3 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Minimal Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search inquiries, contacts, or service lines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Service Line Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-pearl-200 dark:border-charcoal-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="home_health">Home Health</option>
            <option value="home_care">Home Care</option>
            <option value="hospice">Hospice</option>
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
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* Proper Structured Table with Strictly Aligned Columns */}
      <div className="relative z-10 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[850px]">
            {/* Table Header with Aligned Column Layout */}
            <thead>
              <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                <th className="py-3.5 px-5 w-[22%]">Client / Lead</th>
                <th className="py-3.5 px-5 w-[26%]">Service & Request</th>
                <th className="py-3.5 px-5 w-[16%]">Follow-Up Date</th>
                <th className="py-3.5 px-5 w-[20%]">Status</th>
                <th className="py-3.5 px-6 w-[16%] text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Rows with Strictly Aligned Cells */}
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 text-xs">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">No inquiries found</div>
                      <div className="text-xs text-slate-400">Try adjusting your search terms or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const initials = `${item.clientFirstName[0] || 'P'}${item.clientLastName[0] || 'T'}`;
                  const isHomeHealth = item.serviceLine === 'home_health';
                  const isHospice = item.serviceLine === 'hospice';
                  const isNew = item.status === 'new';
                  const isConverted = item.status === 'converted';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Client Information */}
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
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                              {item.clientFirstName} {item.clientLastName}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                <Phone size={11} className="text-slate-400 shrink-0" />
                                {item.contactPhone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Service & Request (Capitalized Tags!) */}
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
                          {formatServiceLine(item.serviceLine)}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          <span>Request: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.serviceRequested}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Follow-Up Date */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{item.followUpDate}</span>
                        </div>
                        {isNew && (
                          <div className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mt-0.5">
                            Due soon
                          </div>
                        )}
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isConverted
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              : isNew
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isConverted ? 'bg-emerald-500' : isNew ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {isConverted ? 'Converted to Referral' : isNew ? 'New Lead (Urgent)' : 'Follow-Up Pending'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Rec: {item.inquiryDate}</div>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isConverted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                convertInquiryToReferral(item.id);
                                showToast(`Inquiry for ${item.clientFirstName} converted to referral!`);
                              }}
                              className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              title="Convert to Referral"
                            >
                              <UserCheck size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors"
                            title="Edit inquiry"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete inquiry for ${item.clientFirstName} ${item.clientLastName}?`)) {
                                deleteInquiry(item.id);
                                showToast('Inquiry removed');
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete inquiry"
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

      {/* Shared Unified Modern Modal for New / Edit Inquiry */}
      <IntakeEntryModal
        type="inquiry"
        isOpen={isModalOpen}
        initialData={editingInquiry}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInquiry(null);
        }}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
