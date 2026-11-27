import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Paperclip,
  Send,
  CheckCheck,
  FileText,
  ExternalLink,
  ShieldCheck,
  Download,
  Users,
  Check,
  Sparkles,
  Info,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';
import { ChatMessage } from '../../types/connectAndPlanner';
import { NewChatModal } from './NewChatModal';

export const CareOrbitConnectView: React.FC = () => {
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
    setCurrentWebsite,
    patients,
    setSelectedPatient,
    fetchMessagesForConversation,
    refreshConnectConversations,
    connectRailTab,
    setConnectRailTab
  } = useHealthcare();

  // Rail State: 'chat' | 'calls'
  const activeRailTab = connectRailTab;
  const setActiveRailTab = setConnectRailTab;
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'care_team' | 'direct' | 'urgent'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<ChatMessage['attachment'] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);
  const prevConvIdRef = useRef<string | null>(null);

  // Active Conversation Object
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return conversations[0] || null;
    return conversations.find(c => c.id === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  const activeConvId = activeConversation?.id;

  // Direct active messages state keyed by conversation ID to isolate streams and avoid race-condition collisions
  const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessage[]>>(messagesMap || {});

  // Load messages from database whenever active conversation changes + 5s live polling with cancellation guard
  useEffect(() => {
    if (!activeConvId) return;

    markConversationRead(activeConvId);

    let isMounted = true;
    const fetchMsgs = async () => {
      try {
        const msgs = await api.getConnectMessages(activeConvId);
        if (isMounted && Array.isArray(msgs)) {
          setMessagesByConv(prev => ({
            ...prev,
            [activeConvId]: msgs
          }));
        }
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
      }
    };

    fetchMsgs();

    const interval = setInterval(fetchMsgs, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Active Messages list strictly for the selected conversation
  const activeMessages = useMemo(() => {
    if (activeConvId && messagesByConv[activeConvId]) {
      return messagesByConv[activeConvId];
    }
    if (activeConvId && messagesMap[activeConvId]) {
      return messagesMap[activeConvId];
    }
    return [];
  }, [messagesByConv, messagesMap, activeConvId]);

  // Controlled, container-scoped scrolling without viewport shaking
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const currentCount = activeMessages.length;
    const convChanged = prevConvIdRef.current !== activeConvId;

    if (convChanged) {
      prevConvIdRef.current = activeConvId || null;
      prevMsgCountRef.current = currentCount;
      // Instant position at bottom when switching conversations
      container.scrollTop = container.scrollHeight;
    } else if (currentCount > prevMsgCountRef.current) {
      prevMsgCountRef.current = currentCount;
      // Smooth container scroll on new incoming/outgoing message
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [activeMessages.length, activeConvId]);

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (filterType === 'care_team' && c.type !== 'care_team') return false;
      if (filterType === 'direct' && c.type !== 'direct') return false;
      if (filterType === 'urgent' && !c.isUrgent) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        const matchesSubtitle = (c.subtitle || '').toLowerCase().includes(query);
        const matchesLastMsg = (c.lastMessage?.content || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle && !matchesLastMsg) return false;
      }
      return true;
    });
  }, [conversations, filterType, searchTerm]);

  // Total Unread Count for Chat Badge
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConvId) return;
    if (!messageInput.trim() && !selectedAttachment) return;

    const convId = activeConvId;
    const content = messageInput.trim();
    const attachment = selectedAttachment || undefined;
    setMessageInput('');
    setSelectedAttachment(null);
    setIsAttachmentPickerOpen(false);

    // Instant optimistic message append locked to this specific conversation
    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Hilder M., RN',
      senderRole: 'Clinical Supervisor',
      isCurrentUser: true,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isRead: true,
      attachment
    };

    setMessagesByConv(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMsg]
    }));

    try {
      const savedMsg = await api.sendConnectMessage(convId, {
        content,
        senderId: 'current-user',
        senderName: 'Hilder M., RN',
        senderRole: 'Clinical Supervisor',
        attachment
      });

      setMessagesByConv(prev => ({
        ...prev,
        [convId]: (prev[convId] || []).map(m => m.id === optimisticMsg.id ? savedMsg : m)
      }));
      refreshConnectConversations();
    } catch (err) {
      console.error('Failed to send message to database:', err);
    }
  };

  const handleQuickReply = async (text: string) => {
    if (!activeConvId) return;
    const convId = activeConvId;
    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Hilder M., RN',
      senderRole: 'Clinical Supervisor',
      isCurrentUser: true,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      isRead: true
    };
    setMessagesByConv(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMsg]
    }));

    try {
      const savedMsg = await api.sendConnectMessage(convId, {
        content: text,
        senderId: 'current-user',
        senderName: 'Hilder M., RN',
        senderRole: 'Clinical Supervisor'
      });
      setMessagesByConv(prev => ({
        ...prev,
        [convId]: (prev[convId] || []).map(m => m.id === optimisticMsg.id ? savedMsg : m)
      }));
      refreshConnectConversations();
    } catch (err) {
      console.error('Failed to send quick reply:', err);
    }
  };

  const handleDownloadAttachment = (attachment: { name: string; url?: string }) => {
    const downloadUrl = attachment.url || `http://localhost:5000/api/connect/attachments/${encodeURIComponent(attachment.name)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Route directly to Patient Chart in CareOrbit Central
  const handleRouteToPatientChart = () => {
    if (!activeConversation) return;

    if (activeConversation.patientId) {
      const matched = patients.find(p => p.id === activeConversation.patientId || p.mrn === '1061');
      if (matched) {
        setSelectedPatient(matched);
      }
    } else if (activeConversation.patientName) {
      const matched = patients.find(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(activeConversation.patientName!.toLowerCase())
      );
      if (matched) {
        setSelectedPatient(matched);
      }
    } else {
      // Default to Heather Abuissa if care team
      const matched = patients.find(p => p.mrn === '1061');
      if (matched) setSelectedPatient(matched);
    }

    setCurrentWebsite('central');
    setActiveNavTab('patients');
  };

  // Export Chat Transcript as File
  const handleExportTranscript = () => {
    if (!activeConversation) return;
    const lines = [
      `============================================================`,
      `CAREORBIT SECURE CARE TEAM CHAT TRANSCRIPT`,
      `Conversation: ${activeConversation.title}`,
      `Date: ${new Date().toLocaleString()}`,
      `Service Line: ${activeConversation.serviceLine || 'Home Health'}`,
      `============================================================\n`
    ];

    activeMessages.forEach(m => {
      lines.push(`[${m.timestamp}] ${m.senderName} (${m.senderRole || 'Care Team'}):`);
      lines.push(`  ${m.content}`);
      if (m.attachment) {
        lines.push(`  [Attachment: ${m.attachment.name} (${m.attachment.size})]`);
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeConversation.title.replace(/[^a-zA-Z0-9]/g, '_')}_Transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsMoreMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5rem)] min-h-[520px] lg:h-[760px] lg:max-h-[82vh] bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-sm overflow-hidden animate-fadeIn">
      {/* ================================================================= */}
      {/* 1. LEFT NARROW ICON RAIL                                          */}
      {/* ================================================================= */}
      <div className="w-full lg:w-20 bg-pearl-50/90 dark:bg-charcoal-900 border-b lg:border-b-0 lg:border-r border-pearl-200 dark:border-charcoal-700 p-2 lg:p-2.5 flex lg:flex-col items-center justify-between lg:justify-start gap-3 shrink-0">
        <div className="flex lg:flex-col items-center gap-2 w-full">
          {/* Chat Rail Tab */}
          <div className="w-full py-2 lg:py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 bg-white dark:bg-charcoal-800 text-rose-600 dark:text-rose-400 shadow-xs border border-pearl-200/80 dark:border-charcoal-650 relative select-none">
            <div className="relative">
              <MessageSquare size={20} className="text-rose-600" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-charcoal-900">
                  {totalUnreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold tracking-tight">Chat</span>
            <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-600 rounded-r-full" />
          </div>
        </div>

        {/* Security Badge at bottom of rail */}
        <div className="hidden lg:flex flex-col items-center mt-auto text-slate-400 p-1" title="Encrypted HIPAA Chat">
          <ShieldCheck size={18} className="text-emerald-500" />
          <span className="text-[8px] font-mono mt-1 font-bold">HIPAA</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CHAT TAB VIEW                                                  */}
      {/* ================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0 h-full overflow-hidden">
          {/* Conversation Roster List (Left pane) */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-pearl-200 dark:border-charcoal-700 flex flex-col shrink-0 bg-pearl-50/40 dark:bg-charcoal-850/60 h-full ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Roster Header with Title & Action Icons */}
            <div className="p-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Care Team Chat</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Live DB
                </span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="New Conversation or Group"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isFilterMenuOpen ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-pearl-100'
                  }`}
                  title="Filter Chats"
                >
                  <Filter size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isMoreMenuOpen ? 'bg-pearl-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-pearl-100'
                  }`}
                  title="More Options"
                >
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Filter Dropdown Menu */}
              {isFilterMenuOpen && (
                <div className="absolute right-4 top-14 z-30 w-48 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-pearl-200 dark:border-charcoal-650 py-1 text-xs animate-fadeIn">
                  <div className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-pearl-100 dark:border-charcoal-700">
                    Filter Conversations
                  </div>
                  {[
                    { id: 'all', label: 'All Conversations' },
                    { id: 'care_team', label: 'Care Teams Only' },
                    { id: 'direct', label: 'Direct Messages' },
                    { id: 'urgent', label: 'Urgent / Priority' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { setFilterType(f.id as any); setIsFilterMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-pearl-50 dark:hover:bg-charcoal-700 flex items-center justify-between cursor-pointer"
                    >
                      <span className={filterType === f.id ? 'font-bold text-rose-600' : 'text-slate-700 dark:text-slate-200'}>
                        {f.label}
                      </span>
                      {filterType === f.id && <Check size={13} className="text-rose-600" />}
                    </button>
                  ))}
                </div>
              )}

              {/* More Menu Dropdown */}
              {isMoreMenuOpen && (
                <div className="absolute right-4 top-14 z-30 w-52 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-pearl-200 dark:border-charcoal-650 py-1 text-xs animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeConversation) markConversationRead(activeConversation.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-pearl-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCheck size={14} className="text-emerald-500" />
                    <span>Mark Conversation Read</span>
                  </button>
                  {activeConversation?.patientId && (
                    <button
                      type="button"
                      onClick={() => { handleRouteToPatientChart(); setIsMoreMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-pearl-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink size={14} className="text-rose-600" />
                      <span>View Linked Patient Chart</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportTranscript}
                    className="w-full px-3 py-2 text-left hover:bg-pearl-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={14} className="text-blue-500" />
                    <span>Export Chat Transcript</span>
                  </button>
                </div>
              )}
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
                  <p>No conversations found.</p>
                  <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    + Start New Conversation
                  </button>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isSelected = activeConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setMobileShowChat(true);
                      }}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 shadow-xs'
                          : 'hover:bg-pearl-100/60 dark:hover:bg-charcoal-800/60 border border-transparent'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            conv.type === 'care_team'
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                          }`}
                        >
                          {conv.type === 'care_team' ? <Users size={16} /> : conv.title.charAt(0)}
                        </div>
                        {conv.type === 'direct' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-charcoal-850" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {conv.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {conv.lastMessage?.timestamp || 'Today'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {conv.lastMessage?.content || conv.subtitle || 'Conversation ready'}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-pearl-100 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                            {conv.type === 'care_team' ? 'Care Team' : 'Direct'}
                          </span>

                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black shrink-0">
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

          {/* Chat Message Active Pane (Right pane) */}
          <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-charcoal-850 h-full ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}>
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3 px-3 sm:px-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Mobile Back Button to return to conversation list */}
                    <button
                      type="button"
                      onClick={() => setMobileShowChat(false)}
                      className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pearl-200 dark:hover:bg-charcoal-700 transition-colors shrink-0 cursor-pointer"
                      title="Back to conversations"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 font-black flex items-center justify-center shrink-0">
                      {activeConversation.type === 'care_team' ? <Users size={18} /> : activeConversation.title.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {activeConversation.title}
                        </h4>
                        <span className="hidden sm:inline-block px-2 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 shrink-0">
                          {activeConversation.serviceLine?.replace('_', ' ') || 'Home Health'}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activeConversation.subtitle || 'Active Secure Channel'}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Routing to Patient Chart button */}
                    {(activeConversation.patientId || activeConversation.type === 'care_team') && (
                      <button
                        type="button"
                        onClick={handleRouteToPatientChart}
                        className="px-2.5 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Route to Patient EHR Chart in CareOrbit Central"
                      >
                        <ExternalLink size={13} className="text-rose-600" />
                        <span className="hidden sm:inline">Patient Chart</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Stream */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-pearl-100 dark:bg-charcoal-750 text-slate-500 dark:text-slate-400 border border-pearl-200 dark:border-charcoal-650">
                      Encrypted Clinical Record • HIPAA Verified
                    </span>
                  </div>

                  {activeMessages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                      No messages yet in this conversation. Start the discussion below.
                    </div>
                  ) : (
                    activeMessages.map(msg => {
                      const isMe = (msg as any).isOutgoing || msg.isCurrentUser || msg.senderId === 'current-user' || msg.senderName === 'You' || msg.senderName === 'Hilder M., RN';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{isMe ? 'You' : msg.senderName}</span>
                            <span>•</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>

                          {/* Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl max-w-lg text-xs font-medium shadow-xs ${
                              isMe
                                ? 'bg-rose-600 text-white rounded-br-xs'
                                : 'bg-pearl-100/80 dark:bg-charcoal-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-pearl-200/80 dark:border-charcoal-700'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.content}</p>

                            {/* Downloadable Attachment Card */}
                            {msg.attachment && (
                              <div
                                onClick={() => handleDownloadAttachment(msg.attachment!)}
                                className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                                  isMe
                                    ? 'bg-rose-700/80 border-rose-500/50 text-white hover:bg-rose-700'
                                    : 'bg-white dark:bg-charcoal-750 border-pearl-200 dark:border-charcoal-650 text-slate-800 dark:text-slate-200 hover:bg-pearl-50'
                                }`}
                                title="Click to download verified clinical document"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText size={18} className={isMe ? 'text-white' : 'text-rose-600'} />
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs truncate">{msg.attachment.name}</div>
                                    <div className="text-[10px] opacity-80 font-mono">{msg.attachment.size || '380 KB'} • Downloadable PDF</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadAttachment(msg.attachment!);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-black/15 transition-colors cursor-pointer shrink-0"
                                  title="Download Attachment"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Read Receipts */}
                          {isMe && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1 font-mono">
                              <CheckCheck size={12} className="text-emerald-500" />
                              <span>Sent & Delivered</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Selected Attachment Preview Chip */}
                {selectedAttachment && (
                  <div className="px-4 py-2 bg-pearl-50 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                      <FileText size={14} />
                      <span>Attached: {selectedAttachment.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Attachment Preset Picker Drawer */}
                {isAttachmentPickerOpen && (
                  <div className="p-3 bg-pearl-50/90 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 animate-fadeIn">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Attach Clinical Document:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { name: 'Care_Plan_Summary.pdf', type: 'pdf', size: '420 KB' },
                        { name: 'Wound_Progress_Photo.jpg', type: 'image', size: '1.2 MB' },
                        { name: 'Medication_Recon_Protocol.pdf', type: 'pdf', size: '310 KB' },
                        { name: 'OASIS_Recert_Assessment.pdf', type: 'pdf', size: '680 KB' },
                      ].map(doc => (
                        <button
                          key={doc.name}
                          type="button"
                          onClick={() => {
                            setSelectedAttachment({
                              name: doc.name,
                              type: doc.type as any,
                              size: doc.size,
                              url: `/api/connect/attachments/${doc.name}`
                            });
                            setIsAttachmentPickerOpen(false);
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-650 hover:border-rose-500 text-left text-xs font-medium cursor-pointer shadow-2xs"
                        >
                          <div className="font-bold truncate text-[11px] text-slate-900 dark:text-white">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{doc.size}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input Footer */}
                <div className="p-3 sm:p-4 border-t border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850">
                  <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" />
                      Quick:
                    </span>
                    {[
                      'Order signed & verified',
                      'Encounter note completed',
                      'Vitals within normal limits',
                      'Please reschedule 30 mins'
                    ].map(txt => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => handleQuickReply(txt)}
                        className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-pearl-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-pearl-200 dark:border-charcoal-650"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAttachmentPickerOpen(!isAttachmentPickerOpen)}
                      className={`p-2.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 text-slate-500 hover:text-rose-600 hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors cursor-pointer shadow-2xs ${
                        isAttachmentPickerOpen ? 'bg-rose-50 text-rose-600' : ''
                      }`}
                      title="Attach Clinical Document"
                    >
                      <Paperclip size={16} />
                    </button>

                    <input
                      type="text"
                      placeholder="Type a secure HIPAA encrypted message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
                    />

                    <button
                      type="submit"
                      disabled={!messageInput.trim() && !selectedAttachment}
                      className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white shadow-md transition-all cursor-pointer"
                      title="Send Message"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare size={36} className="text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-200">No conversation selected</h4>
                <p className="text-xs mt-1">Select a care team or clinician from the left roster.</p>
              </div>
            )}
          </div>
        </div>

      {/* New Conversation / Group Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveRailTab('chat');
        }}
      />
    </div>
  );
};
