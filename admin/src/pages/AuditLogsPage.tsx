import React, { useState, useEffect } from 'react';
import {
  FileClock,
  Search,
  Download,
  Filter,
  RefreshCw,
  ShieldCheck,
  Building2,
  Stethoscope,
  MessageSquare,
  Globe
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminAuditLog } from '../types/admin';

export const AuditLogsPage: React.FC = () => {
  const { refreshTrigger, showToast } = useAdmin();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');

  useEffect(() => {
    loadAuditLogs();
  }, [search, selectedModule, selectedAction, refreshTrigger]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAuditLogs({
        search,
        module: selectedModule,
        action: selectedAction
      });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err: any) {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('No logs to export', 'info');
      return;
    }

    const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const rows = logs.map(l => [
      `"${new Date(l.created_at).toISOString()}"`,
      `"${l.admin_name}"`,
      `"${l.admin_email}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id || ''}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
      `"${l.ip_address}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `careorbit_admin_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported to CSV successfully', 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <FileClock size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Security & Administrative Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable compliance ledger tracking user actions, blocklist enforcements, and configuration modifications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Download size={13} className="text-rose-600" />
          <span>Export Audit Ledger</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by admin, action, or entity..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-medium placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="central">Central</option>
            <option value="home_health">Home Health</option>
            <option value="connect">Connect</option>
            <option value="global">Global</option>
          </select>

          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Action Types</option>
            <option value="USER_BLOCKED">USER_BLOCKED</option>
            <option value="USER_UNBLOCKED">USER_UNBLOCKED</option>
            <option value="USER_APPROVED">USER_APPROVED</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="MODERATION_RESOLVED">MODERATION_RESOLVED</option>
            <option value="APPROVAL_DECISION">APPROVAL_DECISION</option>
            <option value="MODULE_CONFIG_UPDATE">MODULE_CONFIG_UPDATE</option>
            <option value="MESSAGE_DELETED">MESSAGE_DELETED</option>
          </select>
        </div>
      </div>

      {/* 3. Audit Table */}
      <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-50/80 dark:bg-charcoal-800/80 border-b border-pearl-200 dark:border-charcoal-700 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Timestamp</th>
                <th className="py-3 px-4">Super Admin User</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">System Module</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Payload Specifications</th>
                <th className="py-3 px-4 text-right">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto text-rose-600 mb-1.5" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <span>No audit entries found.</span>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{log.admin_name}</div>
                      <div className="text-[10px] text-slate-400">{log.admin_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-pearl-100 dark:bg-charcoal-800 font-mono text-[10.5px] font-black text-rose-600 dark:text-rose-400 border border-pearl-200 dark:border-charcoal-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-pearl-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{log.entity_type}</div>
                      {log.entity_id && <div className="text-[10px] font-mono text-slate-400">{log.entity_id.slice(0, 16)}</div>}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate bg-pearl-50 dark:bg-charcoal-800 p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
