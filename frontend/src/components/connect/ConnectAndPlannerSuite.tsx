import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Sparkles,
  X,
  Smartphone,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { AxxessConnectView } from './AxxessConnectView';
import { AxxessPlannerView } from '../planner/AxxessPlannerView';
import { ActiveCallDialog } from './ActiveCallDialog';

export const ConnectAndPlannerSuite: React.FC = () => {
  const {
    connectModule,
    setConnectModule,
    conversations,
    plannerTasks
  } = useHealthcare();

  const [showIntelligenceBanner, setShowIntelligenceBanner] = useState(true);

  // Compute unread messages count
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingPlannerCount = plannerTasks.filter(t => t.stage === 'to_plan' || t.stage === 'pending_signoff').length;

  return (
    <div className="space-y-4 animate-fadeIn w-full">
      {/* ==================================================================== */}
      {/* 1. TOP SUITE NAVIGATION BAR (Matching media_1793908270616_4a3a5326)  */}
      {/* ==================================================================== */}
      <div className="glass-panel p-4 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* User Welcome & Time Context */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-slate-900 dark:text-white">Welcome Hilder</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                Clinical Supervisor
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime Sync
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock size={13} />
              <span>Friday, Nov 06, 2026 • 12:50 AM PKT</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pearl-100/70 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700 font-medium">
              <Smartphone size={13} className="text-rose-600" />
              <span>Mobile App Synced</span>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Help & User Documentation"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SUB-HEADER TABS: Axxess Connect vs Axxess Planner (Authentic look)   */}
        {/* ==================================================================== */}
        <div className="mt-3 pt-2 border-t border-pearl-200/80 dark:border-charcoal-700/80 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Axxess Connect Tab */}
            <button
              type="button"
              onClick={() => setConnectModule('connect')}
              className={`pb-2.5 text-xs font-bold flex items-center gap-2 relative transition-all cursor-pointer ${
                connectModule === 'connect'
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              <span>Axxess Connect</span>
              {unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black bg-rose-600 text-white">
                  {unreadMessagesCount}
                </span>
              )}
              {connectModule === 'connect' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
              )}
            </button>

            {/* Axxess Planner Tab */}
            <button
              type="button"
              onClick={() => setConnectModule('planner')}
              className={`pb-2.5 text-xs font-bold flex items-center gap-2 relative transition-all cursor-pointer ${
                connectModule === 'planner'
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Axxess Planner</span>
              {pendingPlannerCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black bg-amber-500 text-white">
                  {pendingPlannerCount}
                </span>
              )}
              {connectModule === 'planner' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Right Sub-bar Quick Icons matching screenshot */}
          <div className="flex items-center gap-2.5 text-slate-500 pb-2">
            <button
              type="button"
              onClick={() => setConnectModule('connect')}
              className="p-1.5 rounded-lg hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-slate-500 hover:text-rose-600 transition-colors relative cursor-pointer"
              title="Axxess Connect Messages"
            >
              <MessageSquare size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Menu Options"
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs font-black">≡</span>
                <span className="text-[10px]">▼</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. DYNAMIC WORKSPACE: Connect or Planner                             */}
      {/* ==================================================================== */}
      {connectModule === 'connect' ? <AxxessConnectView /> : <AxxessPlannerView />}

      {/* ==================================================================== */}
      {/* 3. BOTTOM BANNER (Authentic dynamic banner from screenshots)         */}
      {/* ==================================================================== */}
      {showIntelligenceBanner && (
        connectModule === 'planner' ? (
          /* Planner Specific Banner: media_1793910433084_38d1926a */
          <div className="p-3 px-5 rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-amber-300" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white mr-2">Axxess Central</span>
                <span className="text-rose-100 font-medium">Increase your revenue through streamlined Intake</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => alert('Central Intake Referral Pipeline opened!')}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 font-black text-xs transition-colors cursor-pointer shadow-xs"
              >
                Learn More
              </button>
              <button
                type="button"
                onClick={() => setShowIntelligenceBanner(false)}
                className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Connect Specific Banner: media_1793908270616_4a3a5326 */
          <div className="p-3 px-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-amber-300" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-300 mr-2">Axxess intelligence</span>
                <span className="text-slate-200 font-medium">Looking for ways to streamline your operations?</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => alert('Axxess AI Assistant activated!')}
                className="px-4 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs"
              >
                Ask Axxess Now
              </button>
              <button
                type="button"
                onClick={() => setShowIntelligenceBanner(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )
      )}

      {/* Global Active Call Dialog */}
      <ActiveCallDialog />
    </div>
  );
};
