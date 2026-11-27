import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Building2,
  Stethoscope,
  MessageSquare,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminApproval, SystemModuleKey } from '../types/admin';
import { ApprovalDetailModal } from '../components/modals/ApprovalDetailModal';

export const ApprovalsQueuePage: React.FC = () => {
  const { refreshTrigger, showToast } = useAdmin();
  const [approvals, setApprovals] = useState<AdminApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedType, setSelectedType] = useState('all');

  // Modal
  const [selectedApproval, setSelectedApproval] = useState<AdminApproval | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [selectedModule, selectedStatus, selectedType, refreshTrigger]);

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getApprovals({
        module: selectedModule,
        status: selectedStatus,
        type: selectedType
      });
      if (res.success) {
        setApprovals(res.approvals);
      }
    } catch (err: any) {
      showToast('Failed to load approvals queue', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDecision = async (approval: AdminApproval, decision: 'approved' | 'rejected') => {
    try {
      await adminApi.submitApprovalDecision(approval.id, decision, `Quick ${decision} by Super Admin`);
      showToast(`Request ${approval.title} has been ${decision}`, decision === 'approved' ? 'success' : 'warning');
      loadApprovals();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit decision', 'error');
    }
  };

  const getModuleBadge = (mod: SystemModuleKey) => {
    switch (mod) {
      case 'central':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 font-extrabold text-[9.5px] uppercase border border-sky-200 dark:border-sky-900/40">
            <Building2 size={11} />
            <span>Central</span>
          </span>
        );
      case 'home_health':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-extrabold text-[9.5px] uppercase border border-emerald-200 dark:border-emerald-900/40">
            <Stethoscope size={11} />
            <span>Home Health</span>
          </span>
        );
      case 'connect':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 font-extrabold text-[9.5px] uppercase border border-purple-200 dark:border-purple-900/40">
            <MessageSquare size={11} />
            <span>Connect</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <CheckSquare size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Approvals & Verification Hub</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-tiered administrative sign-offs for clinician credentials, physician orders, and emergency overrides
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold self-start sm:self-auto">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                selectedStatus === st
                  ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Module Filter */}
          <div className="flex items-center gap-1.5 font-bold text-slate-500">
            <span>Module:</span>
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Three Modules</option>
              <option value="central">CareOrbit Central</option>
              <option value="home_health">CareOrbit Home Health</option>
              <option value="connect">CareOrbit Connect</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 font-bold text-slate-500">
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Verification Types</option>
              <option value="clinician_credential">Clinician Credentialing</option>
              <option value="doctor_order_signature">Physician Verbal Orders</option>
              <option value="prior_authorization">Prior Authorizations</option>
              <option value="emergency_override">Emergency Overrides</option>
              <option value="incident_signoff">Clinical Incident Reports</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-bold">
          Found <strong>{approvals.length}</strong> items in database
        </div>
      </div>

      {/* 3. Approvals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto text-rose-600 mb-2" />
            <span>Loading verification queue...</span>
          </div>
        ) : approvals.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
            <div className="font-extrabold text-slate-700 dark:text-slate-300">Verification Queue Clear</div>
            <div className="text-xs text-slate-400 mt-0.5">Zero requests matching selected criteria.</div>
          </div>
        ) : (
          approvals.map(item => {
            const isPending = item.status === 'pending';
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-amber-400 dark:hover:border-amber-800 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModuleBadge(item.module)}
                      <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase ${
                        item.priority === 'critical'
                          ? 'bg-rose-600 text-white'
                          : item.priority === 'urgent'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase ${
                      item.status === 'approved'
                        ? 'text-emerald-600'
                        : item.status === 'rejected'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Requester / Date */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{item.requested_by}</strong></span>
                    <span className="font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-pearl-100 dark:border-charcoal-750 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApproval(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Inspect Evidence</span>
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickDecision(item, 'rejected')}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDecision(item, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-2xs transition cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  )}

                  {!isPending && item.reviewed_by && (
                    <span className="text-[10px] text-slate-400 italic">
                      Reviewed by {item.reviewed_by}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Detail Modal */}
      <ApprovalDetailModal
        approval={selectedApproval}
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        onDecisionSubmitted={loadApprovals}
      />
    </div>
  );
};
