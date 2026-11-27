import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Building2,
  User,
  MapPin,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminVisit } from '../types/admin';

export const SchedulingGovernancePage: React.FC = () => {
  const { refreshTrigger, showToast } = useAdmin();
  const [visits, setVisits] = useState<AdminVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [evvStatus, setEvvStatus] = useState('all');

  useEffect(() => {
    loadVisits();
  }, [search, status, evvStatus, refreshTrigger]);

  const loadVisits = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getVisits({
        search,
        status,
        evvStatus
      });
      if (res.success) {
        setVisits(res.visits || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch visits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalVisits = visits.length;
  const verifiedCount = visits.filter(v => v.evv_status === 'Verified' || v.evv_status === 'verified').length;
  const deviationCount = visits.filter(v => v.is_deviation || v.evv_status?.toLowerCase().includes('deviation') || v.evv_status?.toLowerCase().includes('missing')).length;
  const completedCount = visits.filter(v => v.status?.toLowerCase() === 'completed').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-charcoal-850 p-6 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CalendarDays size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Scheduling & EVV Governance
              </h1>
              {deviationCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1 border border-rose-500/20 animate-pulse">
                  <AlertTriangle size={12} />
                  {deviationCount} Deviations Flagged
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supervise clinical visit schedules, Electronic Visit Verification (EVV) compliance, GPS time stamps, and missed visits.
            </p>
          </div>
        </div>

        <button
          onClick={loadVisits}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Scheduled Visits</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalVisits}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active schedule roster</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>EVV Verified</span>
            <CheckCircle2 size={14} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{verifiedCount}</div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">GPS & Timestamp Certified</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center justify-between">
            <span>EVV Deviations</span>
            <AlertTriangle size={14} />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{deviationCount}</div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Requires audit mediation</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Completed Visits</span>
            <FileCheck2 size={14} />
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{completedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Documentation signed</div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, clinician, visit task, time slot..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Visit Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Deviated">Deviated</option>
          </select>

          <select
            value={evvStatus}
            onChange={(e) => setEvvStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All EVV States</option>
            <option value="Verified">Verified</option>
            <option value="Deviation">Deviation / Flagged</option>
            <option value="Missing Signature">Missing Signature</option>
          </select>
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Patient & MRN</th>
                <th className="py-3.5 px-4">Assigned Clinician</th>
                <th className="py-3.5 px-4">Clinical Task</th>
                <th className="py-3.5 px-4">Schedule Window</th>
                <th className="py-3.5 px-4">Visit Status</th>
                <th className="py-3.5 px-4 text-center">EVV Compliance</th>
                <th className="py-3.5 px-4 text-right">Audit Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading visit schedule...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No visit records found matching your filters.
                  </td>
                </tr>
              ) : (
                visits.map((v) => {
                  const isDeviated = v.is_deviation || v.evv_status?.toLowerCase().includes('deviation') || v.evv_status?.toLowerCase().includes('missing');
                  const isVerified = v.evv_status?.toLowerCase() === 'verified';

                  return (
                    <tr key={v.id} className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 transition-colors ${
                      isDeviated ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}>
                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{v.patient_name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            #{v.mrn}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 size={10} />
                          {v.branch || 'Standards Home Care'}
                        </div>
                      </td>

                      {/* Clinician */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <User size={12} className="text-indigo-500" />
                          <span>{v.employee_name || 'Unassigned'}</span>
                        </div>
                        {v.address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={v.address}>
                            {v.address}
                          </div>
                        )}
                      </td>

                      {/* Task */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {v.task}
                        </div>
                        {v.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={v.notes}>
                            {v.notes}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {v.scheduled_date}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={10} />
                          {v.time_slot || 'All Day'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : v.status === 'In Progress'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-pearl-100 text-slate-700 dark:bg-charcoal-750 dark:text-slate-300'
                        }`}>
                          {v.status || 'Scheduled'}
                        </span>
                      </td>

                      {/* EVV Compliance */}
                      <td className="py-3.5 px-4 text-center">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Verified
                          </span>
                        )}
                        {isDeviated && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                            <AlertTriangle size={11} />
                            {v.evv_status || 'Deviation'}
                          </span>
                        )}
                        {!isVerified && !isDeviated && (
                          <span className="text-[10px] text-slate-400">
                            {v.evv_status || 'Pending Verification'}
                          </span>
                        )}
                      </td>

                      {/* Findings */}
                      <td className="py-3.5 px-4 text-right">
                        {v.deviation_reason ? (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            {v.deviation_reason}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Compliant</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
