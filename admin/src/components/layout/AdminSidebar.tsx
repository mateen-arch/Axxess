import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CheckSquare,
  Layers,
  FileClock,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Building2,
  Stethoscope,
  MessageSquare,
  HeartPulse,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { useAdmin, AdminTab } from '../../context/AdminContext';
import { SystemModuleKey } from '../../types/admin';

interface AdminSidebarProps {
  pendingReportsCount?: number;
  pendingApprovalsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  pendingReportsCount = 0,
  pendingApprovalsCount = 0,
}) => {
  const { activeTab, setActiveTab, selectedModule, setSelectedModule } = useAdmin();

  const coreNavItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }> = [
      { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
      { id: 'users', label: 'User Directory', icon: Users },
      {
        id: 'moderation',
        label: 'Moderation & Safety',
        icon: ShieldAlert,
        badge: pendingReportsCount,
        badgeColor: 'bg-rose-500 text-white'
      },
      {
        id: 'approvals',
        label: 'Approvals & Verify',
        icon: CheckSquare,
        badge: pendingApprovalsCount,
        badgeColor: 'bg-amber-500 text-white'
      },
      { id: 'modules', label: 'Modules Management', icon: Layers },
      { id: 'audit', label: 'Audit Trail', icon: FileClock },
      { id: 'settings', label: 'System Settings', icon: Sliders },
    ];

  const operationsNavItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ElementType;
  }> = [
      { id: 'patients', label: 'Patients Governance', icon: HeartPulse },
      { id: 'clinicians', label: 'Clinicians & Roster', icon: Stethoscope },
      { id: 'scheduling', label: 'Scheduling & EVV', icon: CalendarDays },
      { id: 'clinical_emr', label: 'Clinical EMR Hub', icon: Layers },
      { id: 'reports_census', label: 'Reports & Census', icon: BarChart3 },
    ];

  const modulesList: Array<{ id: SystemModuleKey; label: string; icon: React.ElementType; color: string }> = [
    { id: 'central', label: 'CareOrbit Central', icon: Building2, color: 'text-sky-500' },
    { id: 'home_health', label: 'CareOrbit Home Health', icon: Stethoscope, color: 'text-emerald-500' },
    { id: 'connect', label: 'CareOrbit Connect', icon: MessageSquare, color: 'text-purple-500' },
  ];

  return (
    <aside className="w-64 sm:w-72 bg-white dark:bg-charcoal-850 border-r border-pearl-200 dark:border-charcoal-700 flex flex-col shrink-0 transition-colors select-none">
      {/* 1. Brand Logo Header */}
      <div className="h-16 px-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <ShieldCheck size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">CareOrbit</span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-extrabold text-[9px] uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400">Governance & Compliance</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Admin */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Core Administration
          </div>
          <nav className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold shadow-2xs border border-rose-200/60 dark:border-rose-900/40'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Clinical & Operations Governance */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Clinical & Operations Hub
          </div>
          <nav className="space-y-1">
            {operationsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold shadow-2xs border border-rose-200/60 dark:border-rose-900/40'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. The Three System Modules (Managed Separately) */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              System Modules (3)
            </span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="space-y-1">
            {modulesList.map((m) => {
              const MIcon = m.icon;
              const isSelected = activeTab === 'modules' && selectedModule === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveTab('modules');
                    setSelectedModule(m.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                      ? 'bg-pearl-200/80 dark:bg-charcoal-750 text-slate-950 dark:text-white font-extrabold border border-pearl-300 dark:border-charcoal-600'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-pearl-100 dark:hover:bg-charcoal-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <MIcon size={14} className={m.color} />
                    <span>{m.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Client Platform Launcher */}
      <div className="p-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/40">
        <a
          href="https://careorbit-central.vercel.app/hub#top"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-charcoal-700 transition-all border border-pearl-200 dark:border-charcoal-650 shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>Open Client Platform</span>
          </div>
        </a>
      </div>
    </aside>
  );
};
