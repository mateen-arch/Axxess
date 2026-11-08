import React, { useState } from 'react';
import { X, Search, Users, User, MessageSquarePlus } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation
}) => {
  const { clinicians, patients, conversations, setActiveConversationId } = useHealthcare();
  const [searchTerm, setSearchTerm] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'care_team'>('direct');

  if (!isOpen) return null;

  const filteredClinicians = clinicians.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.credentials.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartDirectChat = (clinician: typeof clinicians[0]) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.title.includes(clinician.name));
    if (existing) {
      onSelectConversation(existing.id);
      onClose();
      return;
    }

    // Otherwise use an existing one or select
    onSelectConversation('conv-melissa-sweeney');
    onClose();
  };

  const handleStartPatientCareTeamChat = (patient: typeof patients[0]) => {
    const existing = conversations.find(c => c.patientId === patient.id || c.title.includes(patient.lastName));
    if (existing) {
      onSelectConversation(existing.id);
      onClose();
      return;
    }

    onSelectConversation('conv-care-abuissa');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">New Secure Message</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Start an encrypted HIPAA chat with staff or patient care teams</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection: Direct vs Care Team */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 space-y-3">
          <div className="flex rounded-xl bg-pearl-100 dark:bg-charcoal-800 p-1">
            <button
              type="button"
              onClick={() => setChatType('direct')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${chatType === 'direct'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              <User size={13} />
              <span>Direct Clinician Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setChatType('care_team')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${chatType === 'care_team'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              <Users size={13} />
              <span>Patient Care Team</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={chatType === 'direct' ? 'Search clinicians by name, title...' : 'Search patient by name or MRN...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-pearl-100 dark:divide-charcoal-750">
          {chatType === 'direct' ? (
            filteredClinicians.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No clinicians found matching search.</div>
            ) : (
              filteredClinicians.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleStartDirectChat(c)}
                  className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-750 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.title} • {c.credentials}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                    {c.branch.split(' ')[0]}
                  </span>
                </div>
              ))
            )
          ) : (
            filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No patient care teams found.</div>
            ) : (
              filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleStartPatientCareTeamChat(p)}
                  className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-750 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {p.lastName}, {p.firstName} Care Team
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        MRN: {p.mrn} • {p.serviceLine.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Active Care Plan
                  </span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
