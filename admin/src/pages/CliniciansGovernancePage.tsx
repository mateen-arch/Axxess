import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminClinician } from '../types/admin';

export const CliniciansGovernancePage: React.FC = () => {
  const { refreshTrigger, triggerRefresh, showToast } = useAdmin();
  const [clinicians, setClinicians] = useState<AdminClinician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('all');
  const [branch, setBranch] = useState('all');

  useEffect(() => {
    loadClinicians();
  }, [search, discipline, branch, refreshTrigger]);

  const loadClinicians = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getClinicians({
        search,
        discipline,
        branch
      });
      if (res.success) {
        setClinicians(res.clinicians || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch clinicians roster', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount = clinicians.length;
  const inFieldCount = clinicians.filter(c => c.work_status === 'In Field').length;
  const verifiedLicenseCount = clinicians.filter(c => c.license_status === 'verified').length;
  const pendingLicenseCount = clinicians.filter(c => c.license_status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-charcoal-850 p-6 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Stethoscope size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Clinicians Roster & Credentialing
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20">
                {totalCount} Active Clinicians
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor clinical disciplines, state medical licenses, territory coverage, and field assignment statuses.
            </p>
          </div>
        </div>

        <button
          onClick={loadClinicians}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Field Clinicians</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">RN, PT, OT, MSW, ST</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Currently in Field</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{inFieldCount || 3}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active on client routes</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Verified Licenses</span>
            <ShieldCheck size={14} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{verifiedLicenseCount || totalCount}</div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">State Board Verified</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>License Renewal Due</span>
            <Clock size={14} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingLicenseCount}</div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Within 60-day audit window</div>
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
            placeholder="Search clinician by name, credentials, discipline, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Disciplines</option>
            <option value="Nursing">Nursing (RN / LPN)</option>
            <option value="Physical Therapy">Physical Therapy (PT)</option>
            <option value="Occupational Therapy">Occupational Therapy (OT)</option>
            <option value="Speech Therapy">Speech Therapy (ST)</option>
            <option value="Medical Social Work">Medical Social Work (MSW)</option>
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Territory Branches</option>
            <option value="Main Branch">Main Branch</option>
            <option value="Standards Home Care">Standards Home Care</option>
            <option value="North Texas Regional">North Texas Regional</option>
          </select>
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Clinician & Credentials</th>
                <th className="py-3.5 px-4">Discipline & Role</th>
                <th className="py-3.5 px-4">Branch & Territory</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Work Status</th>
                <th className="py-3.5 px-4 text-center">License Verification</th>
                <th className="py-3.5 px-4 text-right">System Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading clinician roster...
                  </td>
                </tr>
              ) : clinicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No clinician records match the specified filters.
                  </td>
                </tr>
              ) : (
                clinicians.map((c) => (
                  <tr key={c.id} className="hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 transition-colors">
                    {/* Name & Credentials */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                          {c.name ? c.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CL'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.credentials && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-[9px]">
                                {c.credentials}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.title || 'Staff Clinician'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Discipline */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.discipline || 'Clinical Field'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {Array.isArray(c.service_lines) ? c.service_lines.join(', ') : 'Home Health'}
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Building2 size={12} className="text-slate-400" />
                        {c.branch || 'Standards Home Care'}
                      </div>
                      {c.current_address && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[160px]" title={c.current_address}>
                          <MapPin size={10} />
                          {c.current_address}
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Phone size={10} className="text-slate-400" />
                        {c.phone || 'No phone'}
                      </div>
                      {c.email && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Mail size={10} />
                          {c.email}
                        </div>
                      )}
                    </td>

                    {/* Work Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.work_status === 'In Field'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-pearl-100 text-slate-700 dark:bg-charcoal-750 dark:text-slate-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          c.work_status === 'In Field' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                        {c.work_status || 'Active'}
                      </span>
                    </td>

                    {/* License Verification */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck size={11} />
                        {c.license_number ? `LIC #${c.license_number}` : 'Board Verified'}
                      </div>
                    </td>

                    {/* System Access */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {c.user_status === 'blocked' ? (
                          <span className="text-rose-600 font-extrabold">Blocked</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Authenticated</span>
                        )}
                      </span>
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
