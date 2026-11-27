import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MessageSquare,
  Users,
  Ban,
  Search,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { ModerationReport, AdminUser } from '../types/admin';
import { ReportDetailModal } from '../components/modals/ReportDetailModal';

export const ModerationSafetyPage: React.FC = () => {
  const { refreshTrigger, showToast } = useAdmin();
  const [subTab, setSubTab] = useState<'reported_messages' | 'reported_users' | 'blocked_registry' | 'message_audit'>('reported_messages');

  // Reports state
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<AdminUser[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

  // Message audit state
  const [auditMessages, setAuditMessages] = useState<any[]>([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Selected report for modal
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  useEffect(() => {
    if (subTab === 'reported_messages' || subTab === 'reported_users') {
      loadReports();
    } else if (subTab === 'blocked_registry') {
      loadBlockedUsers();
    } else if (subTab === 'message_audit') {
      loadAuditMessages();
    }
  }, [subTab, refreshTrigger]);

  const loadReports = async () => {
    try {
      setIsLoadingReports(true);
      const res = await adminApi.getModerationReports();
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err: any) {
      showToast('Failed to load moderation reports', 'error');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      setIsLoadingBlocked(true);
      const res = await adminApi.getBlockedUsers();
      if (res.success) {
        setBlockedUsers(res.blockedUsers);
      }
    } catch (err: any) {
      showToast('Failed to load blocked users registry', 'error');
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  const loadAuditMessages = async () => {
    try {
      setIsLoadingAudit(true);
      const res = await adminApi.getMessagesForAudit(messageSearch);
      if (res.success) {
        setAuditMessages(res.messages);
      }
    } catch (err: any) {
      showToast('Failed to audit messages', 'error');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleUnblock = async (user: AdminUser) => {
    try {
      await adminApi.unblockUser(user.id);
      showToast(`User ${user.full_name} has been unblocked`, 'success');
      loadBlockedUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock user', 'error');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Are you sure you want to scrub this message permanently from the database?')) return;
    try {
      await adminApi.deleteMessage(msgId);
      showToast('Message permanently scrubbed from chat records', 'info');
      loadAuditMessages();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete message', 'error');
    }
  };

  // Filter reports by subtab type
  const messageReports = reports.filter(r => r.report_type === 'message' || r.report_type === 'phi_violation');
  const userReports = reports.filter(r => r.report_type === 'user' || r.report_type === 'harassment');

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <ShieldAlert size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Moderation & Safety Center</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review reported messages, enforce anti-harassment/HIPAA policies, and manage blocked users
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Pill */}
        <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('reported_messages')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'reported_messages'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Reported Messages ({messageReports.filter(r => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('reported_users')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'reported_users'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Reported Users ({userReports.filter(r => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('blocked_registry')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'blocked_registry'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Blocked Registry
          </button>
          <button
            type="button"
            onClick={() => setSubTab('message_audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'message_audit'
                ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Live Message Audit
          </button>
        </div>
      </div>

      {/* 2. SUBTAB 1 & 2: REPORTED MESSAGES / USERS */}
      {(subTab === 'reported_messages' || subTab === 'reported_users') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(subTab === 'reported_messages' ? messageReports : userReports).map((rep) => {
              const isPending = rep.status === 'pending';
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs hover:border-rose-400 dark:hover:border-rose-800 transition cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase ${
                        rep.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : rep.severity === 'high'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {rep.severity}
                      </span>
                      <span className={`text-[10px] font-extrabold capitalize ${
                        isPending ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {rep.reported_user_name}
                      </div>
                      <div className="text-[10px] text-slate-400">Reported by: {rep.reporter_name}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      {rep.reason}
                    </div>

                    {rep.message_content && (
                      <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-[11px] font-mono text-rose-800 dark:text-rose-300 line-clamp-2">
                        "{rep.message_content}"
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-pearl-100 dark:border-charcoal-750 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] transition shadow-2xs"
                    >
                      Investigate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {(subTab === 'reported_messages' ? messageReports : userReports).length === 0 && (
            <div className="p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <div className="font-extrabold text-slate-700 dark:text-slate-300">No active incidents</div>
              <div className="text-xs text-slate-400 mt-0.5">All communications conform to CareOrbit conduct policies.</div>
            </div>
          )}
        </div>
      )}

      {/* 3. SUBTAB 3: BLOCKED USERS REGISTRY */}
      {subTab === 'blocked_registry' && (
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Permanently & Temporarily Blocked Platform Users
              </h3>
              <p className="text-[11px] text-slate-400">
                Accounts restricted from CareOrbit Connect messaging and platform login
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-extrabold text-xs">
              {blockedUsers.length} Blocked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pearl-50/80 dark:bg-charcoal-800/80 border-b border-pearl-200 dark:border-charcoal-700 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Blocked User</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4">Reason for Block</th>
                  <th className="py-3 px-4">Enforced By</th>
                  <th className="py-3 px-4">Date Blocked</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                {isLoadingBlocked ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin mx-auto text-rose-600 mb-1.5" />
                      <span>Loading blocked accounts...</span>
                    </td>
                  </tr>
                ) : blockedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                      <span>Zero blocked accounts in registry.</span>
                    </td>
                  </tr>
                ) : (
                  blockedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="capitalize font-bold text-slate-700 dark:text-slate-300">{u.role.replace('_', ' ')}</div>
                        <div className="text-[10px] text-slate-400">{u.department}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
                          {u.blocked_reason || 'Policy violation'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-bold">
                        {u.blocked_by || 'Super Admin'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {u.blocked_at ? new Date(u.blocked_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleUnblock(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs transition cursor-pointer shadow-xs hover:opacity-90"
                        >
                          Unblock Account
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUBTAB 4: LIVE MESSAGE AUDIT BROWSER */}
      {subTab === 'message_audit' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={messageSearch}
                onChange={e => setMessageSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadAuditMessages()}
                placeholder="Search live chat messages across all channels..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-medium placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={loadAuditMessages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold cursor-pointer"
            >
              <Search size={13} />
              <span>Search Database</span>
            </button>
          </div>

          <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-50/80 dark:bg-charcoal-800/80 border-b border-pearl-200 dark:border-charcoal-700 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Channel / Context</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Message Content</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Scrub Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
                  {isLoadingAudit ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto text-rose-600 mb-1.5" />
                        <span>Scanning database messages...</span>
                      </td>
                    </tr>
                  ) : auditMessages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <span>No messages matching search criteria.</span>
                      </td>
                    </tr>
                  ) : (
                    auditMessages.map(msg => (
                      <tr key={msg.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{msg.conversation_title || 'Direct Chat'}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{msg.conversation_type || 'care_team'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{msg.sender_name}</div>
                          <div className="text-[10px] text-slate-400">{msg.sender_role || 'Staff'}</div>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-mono text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed bg-pearl-50 dark:bg-charcoal-800 p-2 rounded-xl">
                            {msg.content}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Scrub Bad Message Permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onResolved={() => {
          loadReports();
          loadBlockedUsers();
        }}
      />
    </div>
  );
};
