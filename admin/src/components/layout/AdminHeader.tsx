import React from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  Bell,
  Search,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useAdmin, AdminTab } from '../../context/AdminContext';

interface AdminHeaderProps {
  isLoading?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isLoading = false }) => {
  const { activeTab, isDarkMode, toggleDarkMode, triggerRefresh } = useAdmin();

  const getPageInfo = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Platform Command Center',
          subtitle: 'Live real-time operational status, system KPIs, and pending action queues',
        };
      case 'users':
        return {
          title: 'User & Access Governance',
          subtitle: 'Manage administrative roles, clinician credentialing, and module permissions',
        };
      case 'moderation':
        return {
          title: 'Moderation & Safety Center',
          subtitle: 'Review reported messages, enforce conduct policies, and manage account blocks',
        };
      case 'approvals':
        return {
          title: 'Approvals & Verification Hub',
          subtitle: 'Clinician credential checks, physician verbal orders, and authorization sign-offs',
        };
      case 'modules':
        return {
          title: 'System Modules Management',
          subtitle: 'Independently manage and configure CareOrbit Central, Home Health, and Connect',
        };
      case 'audit':
        return {
          title: 'Security & Compliance Audit Trail',
          subtitle: 'Immutable real-time audit log of all administrative actions and security events',
        };
      case 'settings':
        return {
          title: 'System Configuration & Health',
          subtitle: 'Database connection metrics, API status, and environment variables',
        };
      default:
        return { title: 'Super Admin Portal', subtitle: 'CareOrbit Healthcare System' };
    }
  };

  const { title, subtitle } = getPageInfo(activeTab);

  return (
    <header className="h-16 px-6 bg-white dark:bg-charcoal-850 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between shrink-0 transition-colors">
      {/* 1. Page Title & Subtitle */}
      <div>
        <h1 className="text-base font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 size={11} />
            <span>Database Live</span>
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* 2. Header Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={triggerRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs whitespace-nowrap"
          title="Reload real-time data from PostgreSQL"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin text-rose-600' : 'text-slate-500'} />
          <span className="hidden md:inline">Refresh</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-pearl-200 dark:border-charcoal-700">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SS
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              Dr. Sarah Sterling
            </div>
            <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              Chief Compliance Officer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
