import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  CheckSquare,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Building2,
  Stethoscope,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { DashboardStats, SystemModuleKey, ModerationReport, AdminApproval, AdminAuditLog, ModuleConfig } from '../types/admin';
import { ReportDetailModal } from '../components/modals/ReportDetailModal';
import { ApprovalDetailModal } from '../components/modals/ApprovalDetailModal';

export const OverviewPage: React.FC = () => {
  const { setActiveTab, setSelectedModule, refreshTrigger, showToast } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      showToast('Failed to load real-time dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleIcon = (id: SystemModuleKey) => {
    switch (id) {
      case 'central':
        return <Building2 size={20} className="text-sky-500" />;
      case 'home_health':
        return <Stethoscope size={20} className="text-emerald-500" />;
      case 'connect':
        return <MessageSquare size={20} className="text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Super Admin Command Center</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unified governance, real-time security moderation, and clinical verification across all 3 CareOrbit systems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>PostgreSQL Synchronized</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => setActiveTab('users')}
          className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-rose-300 dark:hover:border-rose-900/60 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Platform Users</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-rose-600 transition">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white mt-2">
            {stats?.users.total_users || '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
            <span>Active: <strong className="text-emerald-600">{stats?.users.active_users || 0}</strong></span>
            <span>Pending: <strong className="text-amber-600">{stats?.users.pending_users || 0}</strong></span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setActiveTab('approvals')}
          className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-amber-300 dark:hover:border-amber-900/60 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {stats?.approvals.pending_approvals || '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
            <span>Central: {stats?.approvals.central_pending || 0}</span>
            <span>HH: {stats?.approvals.home_health_pending || 0}</span>
            <span>Connect: {stats?.approvals.connect_pending || 0}</span>
          </div>
        </div>

        {/* Moderation Reports */}
        <div
          onClick={() => setActiveTab('moderation')}
          className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-rose-300 dark:hover:border-rose-900/60 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Moderation Queue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {stats?.moderation.pending_reports || '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
            <span>Critical Flags: <strong className="text-rose-600">{stats?.moderation.critical_pending || 0}</strong></span>
            <span>Total: {stats?.moderation.total_reports || 0}</span>
          </div>
        </div>

        {/* Blocked Accounts */}
        <div
          onClick={() => setActiveTab('moderation')}
          className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-slate-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blocked Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <Ban size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.users.blocked_users || '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-pearl-100 dark:border-charcoal-750">
            <span>Suspended: {stats?.users.suspended_users || 0}</span>
            <span className="text-red-500 font-semibold">Policy Enforced</span>
          </div>
        </div>
      </div>

      {/* 3. The Three Modules Status Cards (Managed Separately) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              CareOrbit System Modules (Managed Separately)
            </h3>
            <p className="text-xs text-slate-500">
              Each module maintains independent configuration, access controls, and operational workflows
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
          >
            <span>Configure All Modules</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(stats?.modules || []).map((mod: ModuleConfig) => (
            <div
              key={mod.id}
              onClick={() => {
                setActiveTab('modules');
                setSelectedModule(mod.id);
              }}
              className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-rose-400 dark:hover:border-rose-800 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-pearl-100 dark:bg-charcoal-800 flex items-center justify-center">
                      {getModuleIcon(mod.id)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{mod.name}</h4>
                      <div className="text-[10px] text-slate-400">Version {mod.version}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mod.status === 'operational'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200'
                  }`}>
                    {mod.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-pearl-100 dark:border-charcoal-750 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Authorized Users:</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                  {mod.id === 'central'
                    ? stats?.users.central_users
                    : mod.id === 'home_health'
                    ? stats?.users.home_health_users
                    : stats?.users.connect_users} Personnel
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Urgent Action Items Split View: Moderation Queue & Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Pending Moderation Reports */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Urgent Moderation & Safety Incidents
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('moderation')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              View All ({stats?.moderation.pending_reports || 0})
            </button>
          </div>

          <div className="space-y-2.5">
            {stats?.urgentActionItems.reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                <span>Zero pending moderation reports. All communications compliant.</span>
              </div>
            ) : (
              (stats?.urgentActionItems.reports || []).map((rep: ModerationReport) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 hover:border-rose-300 dark:hover:border-rose-900/60 bg-pearl-50/40 dark:bg-charcoal-800/40 transition cursor-pointer flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        rep.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : rep.severity === 'high'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {rep.severity}
                      </span>
                      <strong className="text-slate-900 dark:text-white">{rep.reported_user_name}</strong>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-1">{rep.reason}</p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 transition"
                  >
                    Investigate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Pending Verification Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-pearl-100 dark:border-charcoal-750">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Pending Clinical & Admin Verifications
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              View All ({stats?.approvals.pending_approvals || 0})
            </button>
          </div>

          <div className="space-y-2.5">
            {stats?.urgentActionItems.approvals.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                <span>Zero pending verification items. Everything up to date.</span>
              </div>
            ) : (
              (stats?.urgentActionItems.approvals || []).map((appr: AdminApproval) => (
                <div
                  key={appr.id}
                  onClick={() => setSelectedApproval(appr)}
                  className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 hover:border-amber-300 dark:hover:border-amber-900/60 bg-pearl-50/40 dark:bg-charcoal-800/40 transition cursor-pointer flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300 font-extrabold text-[9px] uppercase">
                        {appr.module}
                      </span>
                      <strong className="text-slate-900 dark:text-white line-clamp-1">{appr.title}</strong>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-1">Requested by: {appr.requested_by}</p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 transition"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Admin Audit Stream */}
      <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-pearl-100 dark:border-charcoal-750">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Real-time Administrative Audit Trail
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            Full Audit Logs
          </button>
        </div>

        <div className="divide-y divide-pearl-100 dark:divide-charcoal-750">
          {(stats?.recentAuditLogs || []).map((log: AdminAuditLog) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">{log.admin_name}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-pearl-100 dark:bg-charcoal-800 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {log.action}
                  </span>
                  <span className="text-slate-500 ml-2">Module: {log.module.toUpperCase()}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onResolved={loadDashboard}
      />

      <ApprovalDetailModal
        approval={selectedApproval}
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        onDecisionSubmitted={loadDashboard}
      />
    </div>
  );
};
