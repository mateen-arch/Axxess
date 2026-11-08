import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Video,
  Sparkles,
  Search,
  Sun,
  Moon,
  Bell,
  Building2,
  ShieldCheck,
  ChevronRight,
  Phone,
  LayoutGrid,
  X,
  Bot
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ConnectSidebar } from '../connect/ConnectSidebar';
import { AxxessConnectView } from '../connect/AxxessConnectView';
import { AxxessPlannerView } from '../planner/AxxessPlannerView';
import { ActiveCallDialog } from '../connect/ActiveCallDialog';
import { AppSwitcherModal } from '../portal/AppSwitcherModal';

export const AxxessConnectApp: React.FC = () => {
  const {
    connectModule,
    setConnectModule,
    setCurrentWebsite,
    theme,
    toggleTheme,
    unreadCount,
    conversations,
    setIsCommandPaletteOpen
  } = useHealthcare();

  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [showAiBar, setShowAiBar] = useState(true);
  const [telehealthInCall, setTelehealthInCall] = useState(false);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* ==================================================================== */}
      {/* 1. MODERN COLLAPSIBLE SIDEBAR (Matches Central Aesthetics)            */}
      {/* ==================================================================== */}
      <ConnectSidebar />

      {/* ==================================================================== */}
      {/* 2. MAIN MODERN WORKSPACE                                             */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 glass-panel !rounded-none !border-t-0 !border-x-0 !border-b border-pearl-200 dark:border-charcoal-700 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 transition-colors">
          {/* Left: Breadcrumbs & Real-time HIPAA badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAppSwitcherOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pearl-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold border border-pearl-200 dark:border-charcoal-700 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-2xs"
              title="Axxess App Switcher"
            >
              <LayoutGrid size={15} className="text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Axxess Apps</span>
            </button>

            <span className="text-slate-300 dark:text-charcoal-700 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900 dark:text-white">Axxess Connect</span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pearl-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                HIPAA & WebRTC Active
              </span>
            </div>
          </div>

          {/* Center: Interactive Module Pill Tabs */}
          <div className="hidden lg:flex items-center p-1 rounded-2xl bg-pearl-200/60 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setConnectModule('connect')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${connectModule === 'connect'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-sm font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <MessageSquare size={14} />
              <span>Care Team Chat</span>
              {unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-600 text-white">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setConnectModule('planner')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${connectModule === 'planner'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-sm font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Calendar size={14} />
              <span>Field Route Planner</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-pearl-200 dark:bg-charcoal-600 text-slate-700 dark:text-slate-200">
                3 Stops
              </span>
            </button>
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick jump to Central */}
            <button
              type="button"
              onClick={() => setCurrentWebsite('central')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pearl-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-pearl-200 dark:border-charcoal-700 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-2xs"
            >
              <Building2 size={13} className="text-rose-600" />
              <span>Axxess Central</span>
            </button>

            {/* Quick Search */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Search Messages & Clinicians (Ctrl K)"
            >
              <Search size={15} />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-600 dark:text-slate-300 relative cursor-pointer"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center font-mono">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          {connectModule === 'connect' && <AxxessConnectView />}
          {connectModule === 'planner' && <AxxessPlannerView />}
        </main>

        {/* Modern Floating AI Copilot Bar */}
        {showAiBar && (
          <div className="absolute bottom-5 left-6 right-6 z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto glass-panel p-3.5 px-5 rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/90 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-charcoal-850/90 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0 text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                    <span>Axxess Care Intelligence</span>
                    <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 uppercase">
                      Realtime Copilot
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {connectModule === 'planner'
                      ? '3 scheduled visits today • 14.8 miles total • All clinicians confirmed.'
                      : 'Melissa Sweeney RN and 4 team clinicians are currently active in care channels.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Bot size={13} />
                  <span>Ask Copilot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiBar(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
                  title="Dismiss AI Bar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <ActiveCallDialog />
      <AppSwitcherModal
        isOpen={isAppSwitcherOpen}
        onClose={() => setIsAppSwitcherOpen(false)}
      />
    </div>
  );
};
