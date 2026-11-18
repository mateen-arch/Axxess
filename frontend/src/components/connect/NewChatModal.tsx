import React, { useState } from 'react';
import { X, Search, Users, User, MessageSquarePlus, Check, Plus, AlertCircle } from 'lucide-react';
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
  const { clinicians, patients, conversations, createNewConversation } = useHealthcare();
  const [chatType, setChatType] = useState<'direct' | 'care_team'>('direct');
  const [searchTerm, setSearchTerm] = useState('');

  // Care Team Group form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [groupTitle, setGroupTitle] = useState<string>('');
  const [selectedClinicianIds, setSelectedClinicianIds] = useState<string[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredClinicians = clinicians.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.credentials || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartDirectChat = async (clinician: typeof clinicians[0]) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // Check if conversation already exists with this clinician
      const existing = conversations.find(c => 
        c.type === 'direct' && (c.title.includes(clinician.name) || c.participants?.some(p => p.name === clinician.name))
      );

      if (existing) {
        onSelectConversation(existing.id);
        onClose();
        return;
      }

      // Create new direct conversation in database
      const created = await createNewConversation({
        type: 'direct',
        title: `${clinician.name}${clinician.credentials ? ', ' + clinician.credentials : ''}`,
        subtitle: `${clinician.title || 'Field Clinician'} • ${clinician.discipline || 'Clinical'}`,
        participants: [
          { name: clinician.name, role: clinician.title || 'Field Clinician', status: 'online' }
        ],
        initialMessage: `Hi ${clinician.name}, initiating secure HIPAA clinical communication channel.`
      });

      onSelectConversation(created.id);
      onClose();
    } catch (err: any) {
      console.error('Error starting direct chat:', err);
      setErrorMessage(err.message || 'Failed to start direct conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPatientForGroup = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setGroupTitle(`${pat.firstName} ${pat.lastName} (${pat.mrn}) Care Team`);
    }
  };

  const toggleClinicianSelection = (cId: string) => {
    setSelectedClinicianIds(prev => 
      prev.includes(cId) ? prev.filter(id => id !== cId) : [...prev, cId]
    );
  };

  const handleCreateCareTeamGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) {
      setErrorMessage('Please provide a care team group name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const pat = patients.find(p => p.id === selectedPatientId);
      const chosenClinicians = clinicians.filter(c => selectedClinicianIds.includes(c.id));
      
      const participants = chosenClinicians.map(c => ({
        name: `${c.name}${c.credentials ? ', ' + c.credentials : ''}`,
        role: c.title || 'Care Team Member',
        status: 'online'
      }));

      const subtitle = chosenClinicians.length > 0 
        ? chosenClinicians.map(c => c.name).slice(0, 3).join(', ')
        : 'Multidisciplinary Care Team';

      const created = await createNewConversation({
        type: 'care_team',
        title: groupTitle.trim(),
        subtitle,
        patientId: pat?.id,
        patientName: pat ? `${pat.firstName} ${pat.lastName}` : undefined,
        participants,
        initialMessage: initialMessage.trim() || `Care team collaboration group created for patient coordination.`
      });

      onSelectConversation(created.id);
      onClose();
    } catch (err: any) {
      console.error('Error creating group chat:', err);
      setErrorMessage(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[88vh]"
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 mx-4 mt-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Selection: Direct vs Care Team Group */}
        <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 space-y-3">
          <div className="flex rounded-xl bg-pearl-100 dark:bg-charcoal-800 p-1">
            <button
              type="button"
              onClick={() => { setChatType('direct'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                chatType === 'direct'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User size={13} />
              <span>Direct Clinician Chat</span>
            </button>
            <button
              type="button"
              onClick={() => { setChatType('care_team'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                chatType === 'care_team'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              <span>New Care Team Group</span>
            </button>
          </div>

          {chatType === 'direct' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search clinicians by name, title, or discipline..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Content Body */}
        {chatType === 'direct' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-pearl-100 dark:divide-charcoal-750">
            {filteredClinicians.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No clinicians found matching search.</div>
            ) : (
              filteredClinicians.map(c => (
                <div
                  key={c.id}
                  onClick={() => !isSubmitting && handleStartDirectChat(c)}
                  className="p-3 rounded-xl hover:bg-pearl-50 dark:hover:bg-charcoal-750 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {c.name ? c.name[0] : 'C'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.title || 'Field Clinician'} • {c.credentials || 'RN'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                    {c.work_status || 'Available'}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Care Team Group Form */
          <form onSubmit={handleCreateCareTeamGroup} className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. Patient Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Patient (Optional)
              </label>
              <select
                value={selectedPatientId}
                onChange={e => handleSelectPatientForGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Patient for Care Team --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (MRN: {p.mrn})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Group Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Care Team Group Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Heather Abuissa (1061) Care Team"
                value={groupTitle}
                onChange={e => setGroupTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:border-rose-500"
              />
            </div>

            {/* 3. Clinician Members Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Add Clinicians to Care Team ({selectedClinicianIds.length} selected)
              </label>
              <div className="max-h-36 overflow-y-auto border border-pearl-200 dark:border-charcoal-700 rounded-xl p-2 space-y-1 bg-pearl-50/50 dark:bg-charcoal-800">
                {clinicians.map(c => {
                  const isSelected = selectedClinicianIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleClinicianSelection(c.id)}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-rose-600 text-white' : 'border border-pearl-400 dark:border-charcoal-500'
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-slate-400">({c.credentials || 'RN'})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{c.title || 'Clinician'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Initial Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Message (Optional)
              </label>
              <textarea
                placeholder="Care team established. Please share updates on clinical plans, orders, and patient progress."
                value={initialMessage}
                onChange={e => setInitialMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:border-rose-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !groupTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>{isSubmitting ? 'Creating Care Team...' : 'Create Care Team Group'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
