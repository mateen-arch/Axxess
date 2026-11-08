import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { AppSwitcherModal } from '../portal/AppSwitcherModal';

export const TopHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    unreadCount,
    setIsNewPatientModalOpen,
    setIsCommandPaletteOpen
  } = useHealthcare();

  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full glass-panel !rounded-none !border-t-0 !border-x-0 !border-b border-pearl-200 dark:border-charcoal-700 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
        {/* App switcher and one clear page heading */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsAppSwitcherOpen(true)}
            className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-2xs"
            title="Switch Axxess Apps"
          >
            <LayoutGrid size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="hidden md:inline">Apps</span>
          </button>

          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white whitespace-nowrap">Axxess Central</h1>
        </div>

      {/* Search */}
      <div className="flex-1 min-w-0 max-w-lg hidden sm:block">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="theme-btn-control w-full h-9 px-3.5 rounded-xl flex items-center justify-between gap-2.5 text-xs transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <Search size={14} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 shrink-0 transition-colors stroke-[2.2]" />
            <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              Search patients, MRN, OASIS...
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden lg:inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-pearl-100 dark:bg-charcoal-700 border border-pearl-200 dark:border-charcoal-600 shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Section: Streamlined Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Theme Toggle (Light Pearl <-> Charcoal Grey Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-btn-control h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer text-slate-700 dark:text-slate-200"
          title={theme === 'dark' ? 'Switch to Light Pearl Mode' : 'Switch to Charcoal Grey Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={16} className="text-amber-400 transition-transform hover:rotate-45 stroke-[2.5]" />
          ) : (
            <Moon size={16} className="text-slate-700 dark:text-slate-200 transition-transform hover:-rotate-12 stroke-[2.5]" />
          )}
        </button>

        {/* Notification Bell with Clean Badge */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="theme-btn-control relative h-9 w-9 rounded-xl flex items-center justify-center transition-colors shadow-2xs shrink-0 text-slate-700 dark:text-slate-200 cursor-pointer"
          title={`${unreadCount} Unread Notifications`}
        >
          <Bell size={16} className="stroke-[2.2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-charcoal-900 shadow-2xs font-mono">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* New Patient CTA Button */}
        <button
          type="button"
          onClick={() => setIsNewPatientModalOpen(true)}
          className="h-9 w-9 sm:w-auto px-0 sm:px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-xs hover:shadow-sm active:translate-y-px transition-all flex items-center justify-center sm:justify-start gap-1.5 select-none shrink-0 cursor-pointer"
          aria-label="New Patient"
        >
          <Plus size={15} className="stroke-[2.8]" />
          <span className="hidden sm:inline whitespace-nowrap">New Patient</span>
        </button>
      </div>
    </header>

    <AppSwitcherModal
      isOpen={isAppSwitcherOpen}
      onClose={() => setIsAppSwitcherOpen(false)}
    />
  </>
);
};
