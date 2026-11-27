import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Stethoscope,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  CreditCard,
  Building
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import {
  AdminEpisode,
  AdminOrder,
  AdminDirectoryItem
} from '../types/admin';

type ClinicalSubTab = 'episodes' | 'orders' | 'pharmacies' | 'facilities' | 'physicians' | 'payers';

export const ClinicalEmrGovernancePage: React.FC = () => {
  const { refreshTrigger, triggerRefresh, showToast } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<ClinicalSubTab>('episodes');

  const [episodes, setEpisodes] = useState<AdminEpisode[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [directoryItems, setDirectoryItems] = useState<AdminDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  useEffect(() => {
    loadSubTabData();
  }, [activeSubTab, refreshTrigger]);

  const loadSubTabData = async () => {
    try {
      setIsLoading(true);
      if (activeSubTab === 'episodes') {
        const res = await adminApi.getEpisodes();
        if (res.success) setEpisodes(res.episodes || []);
      } else if (activeSubTab === 'orders') {
        const res = await adminApi.getOrders();
        if (res.success) setOrders(res.orders || []);
      } else {
        const res = await adminApi.getDirectoryItems(activeSubTab);
        if (res.success) setDirectoryItems(res.items || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch clinical records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEpisode = async (id: string, name: string) => {
    try {
      setActionInProgressId(id);
      const res = await adminApi.approveEpisode(id);
      if (res.success) {
        showToast(`Episode for ${name} approved and activated!`, 'success');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleApproveOrder = async (id: string, title: string) => {
    try {
      setActionInProgressId(id);
      const res = await adminApi.approveOrder(id);
      if (res.success) {
        showToast(`Order "${title}" verified and published!`, 'success');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleApproveDirectory = async (id: string, name: string) => {
    try {
      setActionInProgressId(id);
      const res = await adminApi.approveDirectoryItem(activeSubTab as any, id);
      if (res.success) {
        showToast(`${name} approved and published to client portal!`, 'success');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const tabs: Array<{ id: ClinicalSubTab; label: string; icon: React.ElementType }> = [
    { id: 'episodes', label: 'Cert Episodes (60-Day)', icon: FileText },
    { id: 'orders', label: 'Physician Orders', icon: Stethoscope },
    { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
    { id: 'facilities', label: 'Care Facilities', icon: Building2 },
    { id: 'physicians', label: 'Physicians Registry', icon: ShieldCheck },
    { id: 'payers', label: 'Insurance Payers', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-charcoal-850 p-6 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <FileText size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Clinical EMR & Directory Governance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify physician orders, cert period episodes, pharmacies, facilities, and insurance records created across Home Health.
            </p>
          </div>
        </div>

        <button
          onClick={loadSubTabData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Subtabs Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Filter */}
      <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter records in ${tabs.find(t => t.id === activeSubTab)?.label}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* 4. Dynamic Content by Subtab */}
      <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        {/* TAB 1: EPISODES */}
        {activeSubTab === 'episodes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Patient & MRN</th>
                  <th className="py-3.5 px-4">Episode Window</th>
                  <th className="py-3.5 px-4">Attending Physician</th>
                  <th className="py-3.5 px-4">Primary Diagnosis</th>
                  <th className="py-3.5 px-4 text-center">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                      Loading episodes...
                    </td>
                  </tr>
                ) : episodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No episodes recorded.
                    </td>
                  </tr>
                ) : (
                  episodes
                    .filter(e => !search || e.patient_name?.toLowerCase().includes(search.toLowerCase()) || e.mrn?.includes(search))
                    .map((ep) => {
                      const isPending = ep.approval_status === 'pending_approval';
                      return (
                        <tr key={ep.id} className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{ep.patient_name || 'Patient'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">MRN #{ep.mrn}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {ep.start_date} to {ep.end_date}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {ep.attending_physician || 'Attending Physician'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {ep.primary_diagnosis || 'Standard Care Plan'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                <Clock size={11} />
                                Pending Approval
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={11} />
                                Approved & Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending && (
                              <button
                                onClick={() => handleApproveEpisode(ep.id, ep.patient_name)}
                                disabled={actionInProgressId === ep.id}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeSubTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Order Summary</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Order Type</th>
                  <th className="py-3.5 px-4">Clinician Signature</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                      Loading physician orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No physician orders found.
                    </td>
                  </tr>
                ) : (
                  orders
                    .filter(o => !search || o.summary_title?.toLowerCase().includes(search.toLowerCase()) || o.patient_name?.toLowerCase().includes(search.toLowerCase()))
                    .map((ord) => {
                      const isPending = ord.approval_status === 'pending_approval';
                      return (
                        <tr key={ord.id} className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-[200px]">
                            <div className="truncate" title={ord.summary_title}>{ord.summary_title}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                            {ord.patient_name || 'Patient'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {ord.order_type}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {ord.clinician_signature}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {ord.order_date}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                <Clock size={11} />
                                Pending Sign-Off
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={11} />
                                Approved & Verified
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending && (
                              <button
                                onClick={() => handleApproveOrder(ord.id, ord.summary_title)}
                                disabled={actionInProgressId === ord.id}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABS 3, 4, 5, 6: DIRECTORY (Pharmacies, Facilities, Physicians, Payers) */}
        {['pharmacies', 'facilities', 'physicians', 'payers'].includes(activeSubTab) && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Entity Name</th>
                  <th className="py-3.5 px-4">Type / Specialty</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                      Loading directory records...
                    </td>
                  </tr>
                ) : directoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No directory items found in this section.
                    </td>
                  </tr>
                ) : (
                  directoryItems
                    .filter(item => {
                      const name = item.name || `${item.first_name || ''} ${item.last_name || ''}`;
                      return !search || name.toLowerCase().includes(search.toLowerCase());
                    })
                    .map((item) => {
                      const isPending = item.approval_status === 'pending_approval';
                      const displayName = item.name || `${item.first_name || ''} ${item.last_name || ''}` + (item.credentials ? `, ${item.credentials}` : '');

                      return (
                        <tr key={item.id} className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{displayName}</div>
                            {item.npi && <div className="text-[10px] text-slate-400 font-mono">NPI #{item.npi}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 capitalize">
                            {item.facility_type || item.payer_type || (item.credentials ? `Physician (${item.credentials})` : 'Partner')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {item.city ? `${item.city}, ${item.state || 'MA'}` : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {item.phone || item.email || 'No contact'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                <Clock size={11} />
                                Pending Admin Approval
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={11} />
                                Approved & Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending && (
                              <button
                                onClick={() => handleApproveDirectory(item.id, displayName)}
                                disabled={actionInProgressId === item.id}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Approve & Publish
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
