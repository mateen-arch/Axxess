import React from 'react';
import { X, Building2, Stethoscope, MessageSquare, ArrowRight, LayoutGrid } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface AppSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSwitcherModal: React.FC<AppSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentWebsite, setCurrentWebsite } = useHealthcare();

  if (!isOpen) return null;

  const websites = [
    {
      id: 'central' as const,
      title: 'Axxess Central',
      category: 'Enterprise, Intake & Operations Hub',
      icon: Building2,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Active System',
      description: 'Executive census dashboard, central intake pipeline, patient directory & charts, schedule center, and reports.'
    },
    {
      id: 'connect' as const,
      title: 'Axxess Connect',
      category: 'Messaging & Route Planner',
      icon: MessageSquare,
      color: 'from-purple-600 to-pink-600',
      badge: 'Active System',
      description: 'HIPAA care team messaging, telehealth calling, and daily territory route planner with Leaflet GIS map.'
    },
    {
      id: 'home_health' as const,
      title: 'Axxess Home Health',
      category: 'Clinical Point-of-Care EHR',
      icon: Stethoscope,
      color: 'from-amber-600 to-rose-600',
      badge: 'Active System',
      description: 'Comprehensive point-of-care clinical EHR platform with automated OASIS-E engine, schedule tasks, and patient encounters.'
    }
  ];

  const handleSelect = (id: 'central' | 'home_health' | 'connect') => {
    setCurrentWebsite(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Axxess App Switcher</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch workspace or return to the main portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Apps List */}
        <div className="p-4 space-y-2.5">
          {websites.map(app => {
            const Icon = app.icon;
            const isCurrent = currentWebsite === app.id;

            return (
              <div
                key={app.id}
                onClick={() => handleSelect(app.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isCurrent
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs ring-1 ring-rose-500/20'
                    : 'border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-pearl-50 dark:hover:bg-charcoal-750'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors truncate">
                        {app.title}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Return to Portal Hub */}
        <div className="p-4 bg-pearl-50/60 dark:bg-charcoal-800/40 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Standards Home Care Suite</span>
          <button
            type="button"
            onClick={() => {
              setCurrentWebsite('hub');
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 hover:bg-pearl-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            ← Return to Portal Hub
          </button>
        </div>
      </div>
    </div>
  );
};

