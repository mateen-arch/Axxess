import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Video,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Paperclip,
  Send,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  CheckCheck,
  FileText,
  ExternalLink,
  ShieldCheck,
  Download,
  Users
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ChatMessage } from '../../types/connectAndPlanner';
import { NewChatModal } from './NewChatModal';

export const AxxessConnectView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messagesMap,
    sendChatMessage,
    markConversationRead,
    callLogs,
    setActiveCallModal,
    setActiveNavTab,
    clinicians
  } = useHealthcare();

  // Rail State: 'chat' | 'calls'
  const [activeRailTab, setActiveRailTab] = useState<'chat' | 'calls'>('chat');

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'care_team' | 'direct' | 'urgent'>('all');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<ChatMessage['attachment'] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Conversation Object
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Active Messages list
  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesMap[activeConversationId] || [];
  }, [messagesMap, activeConversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Mark as read when conversation is selected
  useEffect(() => {
    if (activeConversationId) {
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId]);

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (filterType === 'care_team' && c.type !== 'care_team') return false;
      if (filterType === 'direct' && c.type !== 'direct') return false;
      if (filterType === 'urgent' && !c.isUrgent) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesSubtitle = c.subtitle.toLowerCase().includes(query);
        const matchesLastMsg = c.lastMessage.content.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle && !matchesLastMsg) return false;
      }
      return true;
    });
  }, [conversations, filterType, searchTerm]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId) return;
    if (!messageInput.trim() && !selectedAttachment) return;

    sendChatMessage(activeConversationId, messageInput.trim(), selectedAttachment || undefined);
    setMessageInput('');
    setSelectedAttachment(null);
  };

  const handleQuickReply = (text: string) => {
    if (!activeConversationId) return;
    sendChatMessage(activeConversationId, text);
  };

  const handleStartCall = (contactName: string, callType: 'audio' | 'video') => {
    setActiveCallModal({
      isOpen: true,
      contactName,
      callType
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[750px] max-h-[82vh] bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-sm overflow-hidden">
      {/* ================================================================= */}
      {/* 1. LEFT NARROW ICON RAIL (Matching media_1793908270616_4a3a5326) */}
      {/* ================================================================= */}
      <div className="w-full lg:w-20 bg-pearl-50/90 dark:bg-charcoal-900 border-b lg:border-b-0 lg:border-r border-pearl-200 dark:border-charcoal-700 p-2.5 flex lg:flex-col items-center justify-between lg:justify-start gap-3 shrink-0">
        <div className="flex lg:flex-col items-center gap-2 w-full">
          {/* Chat Rail Tab */}
          <button
            type="button"
            onClick={() => setActiveRailTab('chat')}
            className={`w-full py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeRailTab === 'chat'
                ? 'bg-white dark:bg-charcoal-800 text-rose-600 dark:text-rose-400 shadow-xs border border-pearl-200/80 dark:border-charcoal-650'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-pearl-100 dark:hover:bg-charcoal-800'
            }`}
          >
            <div className="relative">
              <MessageSquare size={20} className={activeRailTab === 'chat' ? 'text-rose-600' : 'text-slate-500'} />
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-charcoal-900">
                3
              </span>
            </div>
            <span className="text-[10px] font-extrabold tracking-tight">Chat</span>
            {activeRailTab === 'chat' && (
              <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-600 rounded-r-full" />
            )}
          </button>

          {/* Calls Rail Tab */}
          <button
            type="button"
            onClick={() => setActiveRailTab('calls')}
            className={`w-full py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
              activeRailTab === 'calls'
                ? 'bg-white dark:bg-charcoal-800 text-rose-600 dark:text-rose-400 shadow-xs border border-pearl-200/80 dark:border-charcoal-650'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-pearl-100 dark:hover:bg-charcoal-800'
            }`}
          >
            <Phone size={20} className={activeRailTab === 'calls' ? 'text-rose-600' : 'text-slate-500'} />
            <span className="text-[10px] font-extrabold tracking-tight">Calls</span>
            {activeRailTab === 'calls' && (
              <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-600 rounded-r-full" />
            )}
          </button>
        </div>

        {/* Security Badge at bottom of rail */}
        <div className="hidden lg:flex flex-col items-center mt-auto text-slate-400 p-1" title="Encrypted HIPAA Chat">
          <ShieldCheck size={18} className="text-emerald-500" />
          <span className="text-[8px] font-mono mt-1">HIPAA</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CHAT TAB VIEW                                                  */}
      {/* ================================================================= */}
      {activeRailTab === 'chat' ? (
        <div className="flex-1 flex flex-col md:flex-row min-w-0 h-full">
          {/* Conversation Roster List (Left pane) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-pearl-200 dark:border-charcoal-700 flex flex-col shrink-0 bg-pearl-50/40 dark:bg-charcoal-850/60">
            {/* Roster Header with Title & Action Icons */}
            <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Chat</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-purple-500/15 to-rose-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                  Premium
                </span>
              </div>

              {/* Action Icons matching screenshot */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="New Conversation"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                  title="Filter Chats"
                >
                  <Filter size={15} />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                  title="More Options"
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-pearl-200/80 dark:border-charcoal-700/80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats, clinicians, patients..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
                />
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
                {(['all', 'care_team', 'direct', 'urgent'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterType(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      filterType === tab
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 border border-pearl-200 dark:border-charcoal-650'
                    }`}
                  >
                    {tab === 'all' ? 'All Chats' : tab === 'care_team' ? 'Care Teams' : tab === 'direct' ? 'Direct' : 'Urgent'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-pearl-100 dark:divide-charcoal-750 p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="font-bold">New Conversations will live here</div>
                  <p className="text-[11px]">Select the New Chat icon above to start a new conversation.</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isSelected = activeConversationId === conv.id;
                  const isCareTeam = conv.type === 'care_team';

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-white dark:bg-charcoal-750 shadow-xs border border-pearl-300 dark:border-charcoal-600'
                          : 'hover:bg-pearl-100/60 dark:hover:bg-charcoal-800/60 border border-transparent'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-2xs ${
                            isCareTeam
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                              : 'bg-gradient-to-tr from-rose-600 to-rose-400'
                          }`}
                        >
                          {isCareTeam ? <Users size={16} /> : conv.title[0]}
                        </div>
                        {conv.participants[0]?.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-charcoal-800" />
                        )}
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {conv.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {conv.lastMessage.timestamp}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {conv.subtitle}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9.5px] font-black shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center Chat View or Empty State */}
          <div className="flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-charcoal-850">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between gap-3 bg-pearl-50/50 dark:bg-charcoal-800/40 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {activeConversation.title[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {activeConversation.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Active Encounter
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activeConversation.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Header Calling & Navigation Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View Patient Chart shortcut button */}
                    {activeConversation.patientId && (
                      <button
                        type="button"
                        onClick={() => setActiveNavTab('patients')}
                        className="px-2.5 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Open Clinical Patient Chart"
                      >
                        <ExternalLink size={13} className="text-rose-600" />
                        <span className="hidden sm:inline">Patient Chart</span>
                      </button>
                    )}

                    {/* Audio Call */}
                    <button
                      type="button"
                      onClick={() => handleStartCall(activeConversation.title, 'audio')}
                      className="p-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
                      title="Start Audio Call"
                    >
                      <Phone size={15} />
                    </button>

                    {/* Video Call */}
                    <button
                      type="button"
                      onClick={() => handleStartCall(activeConversation.title, 'video')}
                      className="p-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer shadow-2xs"
                      title="Start Video Telehealth Call"
                    >
                      <Video size={15} />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-500 dark:text-slate-400 border border-pearl-200 dark:border-charcoal-650">
                      Today • Encrypted Clinical Thread
                    </span>
                  </div>

                  {activeMessages.map(msg => {
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                          <span>•</span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl max-w-lg text-xs font-medium shadow-xs ${
                            msg.isCurrentUser
                              ? 'bg-rose-600 text-white rounded-br-xs'
                              : 'bg-pearl-100/80 dark:bg-charcoal-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-pearl-200/80 dark:border-charcoal-700'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.content}</p>

                          {/* Attachment Card if any */}
                          {msg.attachment && (
                            <div
                              className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                                msg.isCurrentUser
                                  ? 'bg-rose-700/60 border-rose-500/50 text-white'
                                  : 'bg-white dark:bg-charcoal-750 border-pearl-200 dark:border-charcoal-650 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={18} className={msg.isCurrentUser ? 'text-white' : 'text-rose-600'} />
                                <div className="min-w-0">
                                  <div className="font-bold text-xs truncate">{msg.attachment.name}</div>
                                  <div className="text-[10px] opacity-80 font-mono">{msg.attachment.size} • Encrypted PDF</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Read Receipts */}
                        {msg.isCurrentUser && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1 font-mono">
                            <CheckCheck size={12} className="text-emerald-500" />
                            <span>Read</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Clinical Chips */}
                <div className="px-4 py-2 border-t border-pearl-100 dark:border-charcoal-750 bg-pearl-50/40 dark:bg-charcoal-850/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickReply('Order Signed & Verified in Axxess ✓')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700 hover:border-rose-400 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                  >
                    Order Signed ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReply('Arriving in 15 mins for scheduled encounter 🚗')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700 hover:border-rose-400 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                  >
                    On My Way 🚗
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReply('Vital signs elevated. Requesting immediate physician callback 📞')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                  >
                    Vital Alert ⚠️
                  </button>
                </div>

                {/* Message Input Composer */}
                <div className="p-3 sm:p-4 border-t border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shrink-0">
                  {selectedAttachment && (
                    <div className="mb-2 px-3 py-1.5 rounded-xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-rose-600" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAttachment.name}</span>
                        <span className="text-[10px] text-slate-400">({selectedAttachment.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAttachment(null)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAttachment({
                          name: 'Encounter_Documentation_Note.pdf',
                          type: 'pdf',
                          size: '1.2 MB'
                        })
                      }
                      className="p-2.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
                      title="Attach Clinical Document"
                    >
                      <Paperclip size={16} />
                    </button>

                    <input
                      type="text"
                      placeholder="Type a secure HIPAA message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-inner"
                    />

                    <button
                      type="submit"
                      disabled={!messageInput.trim() && !selectedAttachment}
                      className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center"
                      title="Send Message"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* ============================================================= */
              /* AUTHENTIC WELCOME SCREEN (Direct match to media_1793908270616)*/
              /* ============================================================= */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-5 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
                  <MessageSquare size={36} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Welcome to Axxess Connect — your internal messaging solution.
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Start a conversation to share updates, ask questions, or connect with your team.
                  </p>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
                  Clear communication drives great teamwork — and this is where it happens. Stay connected anywhere.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={15} />
                    <span>Start a New Conversation</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-pearl-200 dark:border-charcoal-700 w-full text-[11px] text-slate-400">
                  Download the <span className="font-bold text-slate-700 dark:text-slate-300">Axxess Central Mobile App</span> to message your team on the go.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* 3. CALLS TAB VIEW                                                 */
        /* ================================================================= */
        <div className="flex-1 p-6 space-y-6 overflow-y-auto animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pearl-200 dark:border-charcoal-700">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="text-rose-600" size={20} />
                <span>Axxess Voice & Video Telehealth Calls</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Encrypted direct peer-to-peer and patient consultation audio/video calling
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleStartCall('Melissa Sweeney, RN', 'video')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all self-start sm:self-auto"
            >
              <Video size={14} />
              <span>Start Instant Telehealth Call</span>
            </button>
          </div>

          {/* Quick Call Directory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {clinicians.slice(0, 4).map(c => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 flex items-center justify-between gap-3 hover:border-rose-300 dark:hover:border-rose-800 transition-all"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.title}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartCall(c.name, 'audio')}
                    className="p-2 rounded-lg bg-white dark:bg-charcoal-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-pearl-200 dark:border-charcoal-650 transition-colors cursor-pointer"
                    title={`Call ${c.name}`}
                  >
                    <Phone size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCall(c.name, 'video')}
                    className="p-2 rounded-lg bg-white dark:bg-charcoal-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-pearl-200 dark:border-charcoal-650 transition-colors cursor-pointer"
                    title={`Video Call ${c.name}`}
                  >
                    <Video size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Call Logs Table */}
          <div className="glass-panel rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">Recent Call History</span>
              <span className="text-xs text-slate-400 font-mono">{callLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                    <th className="py-3 px-5">Contact</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Patient Context</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                  {callLogs.map(call => (
                    <tr key={call.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                      <td className="py-3 px-5">
                        <div className="font-bold text-slate-900 dark:text-white">{call.contactName}</div>
                        <div className="text-[10px] text-slate-400">{call.contactRole}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pearl-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300">
                          {call.callType === 'video' ? <Video size={11} className="text-purple-500" /> : <Phone size={11} className="text-emerald-500" />}
                          <span className="capitalize">{call.callType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          {call.direction === 'inbound' && <PhoneIncoming size={12} className="text-emerald-500" />}
                          {call.direction === 'outbound' && <PhoneOutgoing size={12} className="text-blue-500" />}
                          {call.direction === 'missed' && <PhoneMissed size={12} className="text-rose-500" />}
                          <span className="capitalize">{call.direction}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{call.duration}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{call.patientContext || 'General Triage'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{call.timestamp}</td>
                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleStartCall(call.contactName, call.callType)}
                          className="px-2.5 py-1 rounded-lg bg-pearl-100 dark:bg-charcoal-700 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Call Back
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectConversation={id => setActiveConversationId(id)}
      />
    </div>
  );
};
