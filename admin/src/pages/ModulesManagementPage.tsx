import React, { useState, useEffect } from 'react';
import {
  Layers,
  Building2,
  Stethoscope,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Save,
  Users,
  Settings,
  ShieldCheck,
  RefreshCw,
  Power
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { ModuleConfig, SystemModuleKey, AdminUser } from '../types/admin';

export const ModulesManagementPage: React.FC = () => {
  const { selectedModule, setSelectedModule, refreshTrigger, showToast } = useAdmin();
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [moduleUsers, setModuleUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable settings draft
  const [settingsDraft, setSettingsDraft] = useState<Record<string, any>>({});
  const [statusDraft, setStatusDraft] = useState<'operational' | 'maintenance' | 'restricted'>('operational');

  useEffect(() => {
    loadModuleData();
  }, [refreshTrigger]);

  useEffect(() => {
    const current = modules.find(m => m.id === selectedModule);
    if (current) {
      setSettingsDraft(current.settings || {});
      setStatusDraft(current.status || 'operational');
      loadUsersForModule(selectedModule);
    }
  }, [selectedModule, modules]);

  const loadModuleData = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getModules();
      if (res.success) {
        setModules(res.modules);
        const current = res.modules.find((m: ModuleConfig) => m.id === selectedModule) || res.modules[0];
        if (current) {
          setSettingsDraft(current.settings || {});
          setStatusDraft(current.status || 'operational');
          loadUsersForModule(current.id);
        }
      }
    } catch (err: any) {
      showToast('Failed to load module configurations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersForModule = async (modKey: SystemModuleKey) => {
    try {
      const res = await adminApi.getUsers({ module: modKey });
      if (res.success) {
        setModuleUsers(res.users);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const res = await adminApi.updateModuleConfig(selectedModule, {
        status: statusDraft,
        settings: settingsDraft
      });

      if (res.success) {
        showToast(`${res.module.name} settings successfully saved to PostgreSQL database`, 'success');
        setModules(prev => prev.map(m => (m.id === selectedModule ? { ...m, ...res.module } : m)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save module settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentModule = modules.find(m => m.id === selectedModule);

  const modulesTabs: Array<{ id: SystemModuleKey; label: string; icon: React.ElementType }> = [
    { id: 'central', label: '1. CareOrbit Central', icon: Building2 },
    { id: 'home_health', label: '2. CareOrbit Home Health', icon: Stethoscope },
    { id: 'connect', label: '3. CareOrbit Connect & Planner', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Layers size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>System Modules Management</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              CareOrbit Central, Home Health, and Connect are governed independently with dedicated configurations
            </p>
          </div>
        </div>

        {/* The 3 Modules Segmented Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold self-start sm:self-auto overflow-x-auto">
          {modulesTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedModule(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-charcoal-750 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentModule && (
        <div className="space-y-5">
          {/* 2. Operational Status Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">{currentModule.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  statusDraft === 'operational'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200'
                }`}>
                  ● {statusDraft}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">v{currentModule.version}</span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">{currentModule.description}</p>
            </div>

            {/* Status Control Toggle */}
            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusDraft('operational')}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusDraft === 'operational'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Operational
                </button>
                <button
                  type="button"
                  onClick={() => setStatusDraft('maintenance')}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusDraft === 'maintenance'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Maintenance Mode
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          {/* 3. Live Stats from PostgreSQL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {selectedModule === 'central' && (
              <>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Active Patients</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {currentModule.stats?.totalPatients ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Intake & Referrals Logged</div>
                  <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                    {currentModule.stats?.intakeReferralsCount ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Operational Branches</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentModule.stats?.activeBranchesCount ?? 1}
                  </div>
                </div>
              </>
            )}

            {selectedModule === 'home_health' && (
              <>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Active 60-Day Episodes</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {currentModule.stats?.activeEpisodes ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Clinical Visits Recorded</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentModule.stats?.totalVisits ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Medical Orders Processed</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {currentModule.stats?.totalOrders ?? 0}
                  </div>
                </div>
              </>
            )}

            {selectedModule === 'connect' && (
              <>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Care Team Channels</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {currentModule.stats?.activeChannels ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Secured Chat Messages</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {currentModule.stats?.totalMessages ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Enforced Blocked Users</div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {currentModule.stats?.blockedUsers ?? 0}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4. Module-Specific Configuration Parameters */}
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-4">
            <div className="border-b border-pearl-100 dark:border-charcoal-750 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={15} className="text-rose-600" />
                  <span>Module Rules & Administrative Policies</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Toggles and thresholds are persisted directly to PostgreSQL and take effect immediately in real-time
                </p>
              </div>
            </div>

            {/* Dynamic settings controls based on selectedModule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {selectedModule === 'central' && (
                <>
                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Intake Auto-Routing</div>
                      <div className="text-[11px] text-slate-400">Automatically assign inquiries to territory field liaisons</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.intakeAutoRouting)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, intakeAutoRouting: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Allow Cross-Branch Transfers</div>
                      <div className="text-[11px] text-slate-400">Enable clinicians to transfer patients across branches</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.allowCrossBranchTransfers)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, allowCrossBranchTransfers: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Referral SLA Threshold (Hours)</div>
                      <div className="text-[11px] text-slate-400">Target turnaround time for intake follow-up</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.referralThresholdHours || 24}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, referralThresholdHours: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Max Active Census per Branch</div>
                      <div className="text-[11px] text-slate-400">Capacity alert threshold for clinical team sizing</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.maxActiveCensusPerBranch || 500}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, maxActiveCensusPerBranch: Number(e.target.value) }))}
                      className="w-24 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>
                </>
              )}

              {selectedModule === 'home_health' && (
                <>
                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">OASIS-E Compliance Window (Days)</div>
                      <div className="text-[11px] text-slate-400">Mandatory submission window from Start of Care</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.oasisComplianceDays || 5}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, oasisComplianceDays: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">EVV Geofence Radius (Meters)</div>
                      <div className="text-[11px] text-slate-400">Electronic verification tolerance from patient address</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.evvGeofenceRadiusMeters || 150}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, evvGeofenceRadiusMeters: Number(e.target.value) }))}
                      className="w-24 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Auto-Lock Approved Episodes</div>
                      <div className="text-[11px] text-slate-400">Prevent accidental post-signoff clinical edits</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.autoLockApprovedEpisodes)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, autoLockApprovedEpisodes: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Infection Surveillance Alerts</div>
                      <div className="text-[11px] text-slate-400">Trigger immediate infection control officer dispatch</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.infectionSurveillanceAlerts)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, infectionSurveillanceAlerts: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>
                </>
              )}

              {selectedModule === 'connect' && (
                <>
                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Automated HIPAA PHI Guard</div>
                      <div className="text-[11px] text-slate-400">Real-time AI scanning for unredacted patient SSN or IDs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.autoFlagPhiDisclosures)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, autoFlagPhiDisclosures: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Automated Profanity & Conduct Filter</div>
                      <div className="text-[11px] text-slate-400">Flag inappropriate language in care team channels</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft.autoFilterProfanity)}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, autoFilterProfanity: e.target.checked }))}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Message Retention Window (Days)</div>
                      <div className="text-[11px] text-slate-400">HIPAA compliant chat history auto-archival</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.chatRetentionDays || 365}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, chatRetentionDays: Number(e.target.value) }))}
                      className="w-24 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Max File Attachment Size (MB)</div>
                      <div className="text-[11px] text-slate-400">Limit on clinical PDFs and wound photo uploads</div>
                    </div>
                    <input
                      type="number"
                      value={settingsDraft.maxAttachmentSizeMb || 25}
                      onChange={e => setSettingsDraft(prev => ({ ...prev, maxAttachmentSizeMb: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-center font-bold"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 5. Users Authorized for this specific Module */}
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pearl-100 dark:border-charcoal-750">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Authorized Personnel Roster ({moduleUsers.length})
                </h3>
              </div>
              <div className="text-[11px] text-slate-400">
                Staff with verified permission flag <code className="text-rose-600 font-bold">{selectedModule}</code>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {moduleUsers.slice(0, 9).map(u => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{u.role.replace('_', ' ')} • {u.department}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
