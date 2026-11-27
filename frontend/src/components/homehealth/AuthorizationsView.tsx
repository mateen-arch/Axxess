import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Shield,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  FileText,
  Calendar,
  Layers,
  Check,
  Building
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface AuthorizationsViewProps {
  onBack?: () => void;
  onNavigateToChart?: (patientId: string) => void;
}

export interface AuthorizationRecord {
  id: string;
  authNumber: string;
  payer: string;
  type: string;
  startDate: string;
  endDate: string;
  discipline: string;
  authorizedUnits: number;
  usedUnits: number;
  unusedUnits: number;
  unit: string;
  status: 'Approved' | 'In Review' | 'Archived';
  notes?: string;
}

const INITIAL_AUTHORIZATIONS: AuthorizationRecord[] = [
  {
    id: 'auth-1',
    authNumber: 'AUTH-2026-89412',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 60,
    usedUnits: 26,
    unusedUnits: 34,
    unit: 'Visits',
    status: 'Approved',
    notes: 'Approved for skilled nurse medication management and surgical wound assessment.'
  },
  {
    id: 'auth-2',
    authNumber: 'AUTH-2026-89413',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'PT - Physical Therapy',
    authorizedUnits: 8,
    usedUnits: 1,
    unusedUnits: 7,
    unit: 'Visits',
    status: 'Approved',
    notes: 'Physical therapy evaluation and therapeutic exercise program.'
  },
  {
    id: 'auth-3',
    authNumber: 'AUTH-2026-89414',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'OT - Occupational Therapy',
    authorizedUnits: 4,
    usedUnits: 0,
    unusedUnits: 4,
    unit: 'Visits',
    status: 'In Review',
    notes: 'Pending final clinical review for home safety and ADL retraining.'
  },
  {
    id: 'auth-4',
    authNumber: 'AUTH-2025-41092',
    payer: 'COMMONWEALTH CARE ALLIANCE',
    type: 'Prior Episode',
    startDate: '08/08/2025',
    endDate: '10/06/2025',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 30,
    usedUnits: 30,
    unusedUnits: 0,
    unit: 'Visits',
    status: 'Archived',
    notes: 'Prior episode services fully completed and reconciled.'
  },
  {
    id: 'auth-5',
    authNumber: 'AUTH-2026-92100',
    payer: 'MEDICARE TRADITIONAL',
    type: 'Subsequent Episode',
    startDate: '12/25/2026',
    endDate: '02/22/2027',
    discipline: 'HHA - Home Health Aide',
    authorizedUnits: 18,
    usedUnits: 0,
    unusedUnits: 18,
    unit: 'Visits',
    status: 'In Review',
    notes: 'Personal care support submitted for upcoming recertification period.'
  }
];

export const AuthorizationsView: React.FC<AuthorizationsViewProps> = ({
  onBack,
  onNavigateToChart
}) => {
  const { patients: globalPatients, setHomeHealthTab } = useHealthcare();

  // Patient selector state
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

  // Authorizations list state
  const [authList, setAuthList] = useState<AuthorizationRecord[]>(INITIAL_AUTHORIZATIONS);
  const [searchText, setSearchText] = useState<string>('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('All');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingAuthId, setEditingAuthId] = useState<string | null>(null);
  const [viewingAuth, setViewingAuth] = useState<AuthorizationRecord | null>(null);
  const [deleteConfirmAuth, setDeleteConfirmAuth] = useState<AuthorizationRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<AuthorizationRecord, 'id' | 'unusedUnits'>>({
    authNumber: '',
    payer: 'MASSHEALTH STANDARD',
    type: 'Initial Episode',
    startDate: '10/26/2026',
    endDate: '12/24/2026',
    discipline: 'SN - Skilled Nursing',
    authorizedUnits: 20,
    usedUnits: 0,
    unit: 'Visits',
    status: 'Approved',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingAuthId(null);
    setFormData({
      authNumber: `AUTH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      payer: patient.insuranceName || 'MASSHEALTH STANDARD',
      type: 'Initial Episode',
      startDate: patient.episodeStart || '10/26/2026',
      endDate: patient.episodeEnd || '12/24/2026',
      discipline: 'SN - Skilled Nursing',
      authorizedUnits: 20,
      usedUnits: 0,
      unit: 'Visits',
      status: 'Approved',
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (auth: AuthorizationRecord) => {
    setEditingAuthId(auth.id);
    setFormData({
      authNumber: auth.authNumber,
      payer: auth.payer,
      type: auth.type,
      startDate: auth.startDate,
      endDate: auth.endDate,
      discipline: auth.discipline,
      authorizedUnits: auth.authorizedUnits,
      usedUnits: auth.usedUnits,
      unit: auth.unit,
      status: auth.status,
      notes: auth.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authNumber.trim()) {
      showToast('Please specify a valid Authorization Number.');
      return;
    }

    const authUnits = Number(formData.authorizedUnits) || 0;
    const usedUnits = Number(formData.usedUnits) || 0;
    const unusedUnits = Math.max(0, authUnits - usedUnits);

    if (editingAuthId) {
      setAuthList(prev => prev.map(a => a.id === editingAuthId ? {
        ...a,
        ...formData,
        authorizedUnits: authUnits,
        usedUnits: usedUnits,
        unusedUnits: unusedUnits
      } : a));
      showToast(`Authorization ${formData.authNumber} updated successfully.`);
    } else {
      const newAuth: AuthorizationRecord = {
        id: `auth-${Date.now()}`,
        ...formData,
        authorizedUnits: authUnits,
        usedUnits: usedUnits,
        unusedUnits: unusedUnits
      };
      setAuthList(prev => [newAuth, ...prev]);
      showToast(`New authorization ${formData.authNumber} created successfully.`);
    }

    setIsAddEditModalOpen(false);
    setEditingAuthId(null);
  };

  // Toggle Archive
  const handleToggleArchive = (auth: AuthorizationRecord) => {
    const nextStatus = auth.status === 'Archived' ? 'Approved' : 'Archived';
    setAuthList(prev => prev.map(a => a.id === auth.id ? { ...a, status: nextStatus } : a));
    showToast(`Authorization ${auth.authNumber} marked as ${nextStatus}.`);
  };

  // Delete Authorization
  const handleConfirmDelete = () => {
    if (!deleteConfirmAuth) return;
    setAuthList(prev => prev.filter(a => a.id !== deleteConfirmAuth.id));
    showToast(`Authorization ${deleteConfirmAuth.authNumber} deleted.`);
    setDeleteConfirmAuth(null);
  };

  // Print Authorizations
  const handlePrint = () => {
    window.print();
  };

  // Filtered List
  const filteredAuths = useMemo(() => {
    return authList.filter(a => {
      if (showArchived) {
        if (a.status !== 'Archived') return false;
      } else {
        if (a.status === 'Archived') return false;
      }

      if (disciplineFilter !== 'All' && !a.discipline.includes(disciplineFilter)) {
        return false;
      }

      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return (
          a.authNumber.toLowerCase().includes(q) ||
          a.payer.toLowerCase().includes(q) ||
          a.discipline.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [authList, showArchived, disciplineFilter, searchText]);

  // Overall calculations
  const totalAuthorized = useMemo(() => authList.reduce((acc, a) => acc + (a.status !== 'Archived' ? a.authorizedUnits : 0), 0), [authList]);
  const totalUsed = useMemo(() => authList.reduce((acc, a) => acc + (a.status !== 'Archived' ? a.usedUnits : 0), 0), [authList]);
  const totalRemaining = Math.max(0, totalAuthorized - totalUsed);

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
      <div className="no-print print:hidden p-4 sm:p-6 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 shadow-2xs">
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
                  <Shield size={18} />
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Authorizations
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  CareOrbit Payer Tracking
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage insurance pre-authorizations, clinical service limits, and utilized visit tracking
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
              <span>Print Authorizations</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Authorization</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5 print:p-0 print:space-y-3 print:block">
        {/* Formal Printable Healthcare Header (Only visible when printing) */}
        <div className="hidden print:block pb-3 mb-4 border-b-2 border-rose-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                STANDARDS HOME CARE — PAYER PRE-AUTHORIZATION AUDIT REPORT
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                CareOrbit Central Healthcare Platform • Utilization Review & Payer Compliance Record
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div className="font-bold text-rose-700">CONFIDENTIAL MEDICAL DOCUMENT</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 italic">
            Patient: {patientName} (MRN: {patient.mrn}) • Payer: {patient.insuranceName || 'COMMONWEALTH CARE ALLIANCE'} • Episode: {patient.episodeStart || '10/26/2026'} - {patient.episodeEnd || '12/24/2026'}
          </div>
        </div>
        {/* Patient Banner & Summary Stats */}
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

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="p-2.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Authorized</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{totalAuthorized}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Used</span>
              <span className="text-base font-black text-rose-700 dark:text-rose-300">{totalUsed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Remaining</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{totalRemaining}</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="no-print print:hidden bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Auth #, payer, discipline..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="All">All Disciplines</option>
              <option value="SN">Nursing (SN)</option>
              <option value="PT">Physical Therapy (PT)</option>
              <option value="OT">Occupational Therapy (OT)</option>
              <option value="ST">Speech Therapy (ST)</option>
              <option value="HHA">Home Health Aide (HHA)</option>
              <option value="MSW">Social Work (MSW)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`h-9 px-3.5 rounded-xl border font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                showArchived
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              <Archive size={13} />
              <span>{showArchived ? 'Showing Archived (Click for Active)' : 'Show Archived'}</span>
            </button>
          </div>
        </div>

        {/* Authorizations Table */}
        <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 text-[11px] font-black uppercase border-b border-rose-100 dark:border-rose-900/40">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Authorization #</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payer</th>
                  <th className="py-3 px-4 whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 whitespace-nowrap">Start Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">End Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Discipline</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Auth Units</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Used</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Unused</th>
                  <th className="py-3 px-3 whitespace-nowrap">Unit</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap no-print print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                {filteredAuths.map((auth) => (
                  <tr
                    key={auth.id}
                    className="hover:bg-rose-50/30 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <td className="py-3 px-4 font-black text-rose-700 dark:text-rose-400 whitespace-nowrap">
                      {auth.authNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {auth.payer}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {auth.type}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {auth.startDate}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {auth.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {auth.discipline}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-800 dark:text-white">
                      {auth.authorizedUnits}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      {auth.usedUnits}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                      {auth.unusedUnits}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {auth.unit}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap min-w-[130px]">
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap leading-none shadow-2xs select-none ${
                          auth.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                            : auth.status === 'In Review'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200'
                            : 'bg-slate-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            auth.status === 'Approved'
                              ? 'bg-emerald-500'
                              : auth.status === 'In Review'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="whitespace-nowrap">{auth.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap no-print print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingAuth(auth)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-charcoal-700 transition"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(auth)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-charcoal-700 transition"
                          title="Edit Authorization"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(auth)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-charcoal-700 transition"
                          title={auth.status === 'Archived' ? 'Restore Active' : 'Archive'}
                        >
                          <Archive size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAuth(auth)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-charcoal-700 transition"
                          title="Delete Authorization"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAuths.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 font-semibold">
                      <Shield size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                      <div>No authorizations found matching your filters.</div>
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add an authorization</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Supervisor / UR Certification Block */}
        <div className="hidden print:block mt-8 pt-4 border-t border-slate-400 text-xs">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-slate-800 pb-1 mb-1 h-8"></div>
              <div className="font-bold text-slate-800">Utilization Review Specialist Signature</div>
              <div className="text-[11px] text-slate-500">Date: ____________________ Alexandria Nelson, RN</div>
            </div>
            <div>
              <div className="border-b border-slate-800 pb-1 mb-1 h-8"></div>
              <div className="font-bold text-slate-800">Billing / Revenue Cycle Approval</div>
              <div className="text-[11px] text-slate-500">Date: ____________________ Status: Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Authorization Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  {editingAuthId ? 'Edit Authorization' : 'Add New Authorization'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAuth} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Authorization # *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authNumber}
                    onChange={(e) => setFormData({ ...formData, authNumber: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Insurance / Payer
                  </label>
                  <select
                    value={formData.payer}
                    onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  >
                    <option value="MASSHEALTH STANDARD">MASSHEALTH STANDARD</option>
                    <option value="COMMONWEALTH CARE ALLIANCE">COMMONWEALTH CARE ALLIANCE</option>
                    <option value="MEDICARE TRADITIONAL">MEDICARE TRADITIONAL</option>
                    <option value="BLUE CROSS BLUE SHIELD">BLUE CROSS BLUE SHIELD</option>
                    <option value="UNITED HEALTHCARE">UNITED HEALTHCARE</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Authorization Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  >
                    <option value="Initial Episode">Initial Episode</option>
                    <option value="Recertification">Recertification</option>
                    <option value="Prior Episode">Prior Episode</option>
                    <option value="Subsequent Episode">Subsequent Episode</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Discipline
                  </label>
                  <select
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  >
                    <option value="SN - Skilled Nursing">SN - Skilled Nursing</option>
                    <option value="PT - Physical Therapy">PT - Physical Therapy</option>
                    <option value="OT - Occupational Therapy">OT - Occupational Therapy</option>
                    <option value="ST - Speech Therapy">ST - Speech Therapy</option>
                    <option value="HHA - Home Health Aide">HHA - Home Health Aide</option>
                    <option value="MSW - Medical Social Worker">MSW - Medical Social Worker</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate.includes('/') ? formData.startDate.split('/').reverse().join('-') : formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate.includes('/') ? formData.endDate.split('/').reverse().join('-') : formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Authorized Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.authorizedUnits}
                    onChange={(e) => setFormData({ ...formData, authorizedUnits: Number(e.target.value) })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Used Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usedUnits}
                    onChange={(e) => setFormData({ ...formData, usedUnits: Number(e.target.value) })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit Type
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  >
                    <option value="Visits">Visits</option>
                    <option value="Hours">Hours</option>
                    <option value="Units">Units (15 min)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full py-1.5 px-3 rounded-lg border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 font-medium"
                  >
                    <option value="Approved">Approved</option>
                    <option value="In Review">In Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                  Clinical Notes / Scope of Care
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter payer authorization directives, visit restrictions, or clinical justification..."
                  className="w-full py-2 px-3 rounded-xl border border-pearl-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pearl-200 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingAuthId ? 'Save Changes' : 'Create Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Authorization Details Modal */}
      {viewingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-rose-200" />
                <span className="font-extrabold text-sm tracking-tight">
                  Authorization Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingAuth(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-pearl-100 dark:border-charcoal-750 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Auth Number</span>
                  <div className="text-base font-black text-rose-700 dark:text-rose-400">{viewingAuth.authNumber}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingAuth.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : viewingAuth.status === 'In Review'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {viewingAuth.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Payer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAuth.payer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAuth.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Discipline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAuth.discipline}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Coverage Window</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAuth.startDate} - {viewingAuth.endDate}</span>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <div className="p-3.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
                <div className="flex justify-between items-center mb-1.5 font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Unit Utilization</span>
                  <span className="text-slate-900 dark:text-white">
                    {viewingAuth.usedUnits} / {viewingAuth.authorizedUnits} {viewingAuth.unit} ({viewingAuth.unusedUnits} left)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-pearl-200 dark:bg-charcoal-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (viewingAuth.usedUnits / (viewingAuth.authorizedUnits || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {viewingAuth.notes && (
                <div className="p-3 rounded-xl bg-pearl-50/50 dark:bg-charcoal-800/50 border border-pearl-200 dark:border-charcoal-700">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Clinical Notes:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{viewingAuth.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pearl-200 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingAuth;
                    setViewingAuth(null);
                    handleOpenEditModal(toEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewingAuth(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 w-full max-w-sm p-5 animate-fade-in text-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={22} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Delete Authorization?</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete authorization <strong className="text-slate-800 dark:text-slate-200">{deleteConfirmAuth.authNumber}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAuth(null)}
                className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
