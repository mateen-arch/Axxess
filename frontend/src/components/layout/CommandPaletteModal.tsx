import React, { useEffect, useState } from 'react';
import { Search, X, User, Calendar, MessageSquare, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    patients,
    setSelectedPatient,
    setActiveNavTab
  } = useHealthcare();

  const [query, setQuery] = useState('');

  // Handle Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.mrn} ${p.primaryDiagnosis}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-charcoal-700">
          <Search size={20} className="text-rose-600 dark:text-rose-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name or MRN, visits, modules, or ask Axxess AI..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-1.5">
              Quick Navigation
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveNavTab('intake');
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Building2 size={16} />
                  </span>
                  <span>Open Central Intake & Referrals Pipeline</span>
                </div>
                <ArrowRight size={14} className="text-slate-500 dark:text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('schedule');
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Calendar size={16} />
                  </span>
                  <span>View 7-Day Unassigned Visits & Dispatch Matrix</span>
                </div>
                <ArrowRight size={14} className="text-slate-500 dark:text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('messages');
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <MessageSquare size={16} />
                  </span>
                  <span>Axxess Connect Secure Messages (169 Unread)</span>
                </div>
                <ArrowRight size={14} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Patient Matches */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-1.5">
              Matching Active Patients ({filteredPatients.length})
            </div>
            <div className="space-y-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-charcoal-800 text-left transition-colors border border-transparent hover:border-slate-200 dark:hover:border-charcoal-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{patient.firstName} {patient.lastName}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-normal">{patient.mrn}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-sm">
                        {patient.primaryDiagnosis}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-200">
                    {patient.serviceLine.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border-t border-slate-200 dark:border-charcoal-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-500" />
            <span>Type anytime to filter • ESC to close</span>
          </div>
          <div>Standards Home Care System</div>
        </div>
      </div>
    </div>
  );
};
