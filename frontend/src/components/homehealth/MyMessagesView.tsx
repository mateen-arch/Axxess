import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Mail,
  Send,
  Trash2,
  Reply,
  Forward,
  Printer,
  Search,
  Plus,
  CheckCircle2,
  Inbox,
  Clock,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  RotateCcw,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { api } from '../../services/api';

interface MyMessagesViewProps {
  onBack: () => void;
  onComposeNew?: () => void;
}

interface MessageItemData {
  id: string;
  senderName: string;
  senderRole?: string;
  senderEmail?: string;
  recipients?: string[];
  subject: string;
  body: string;
  snippet?: string;
  serviceLine?: string;
  organizationName?: string;
  date: string;
  sentDate?: string;
  timestamp?: string;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'trash';
  priority?: string;
  patientName?: string;
}

export const MyMessagesView: React.FC<MyMessagesViewProps> = ({ onBack, onComposeNew }) => {
  const { organization } = useHealthcare();

  // Real Database Messages State
  const [messages, setMessages] = useState<MessageItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Folder & Selection State
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);

  // Pagination State (Dynamic Page Numbers)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Actions State
  const [replyMode, setReplyMode] = useState<'none' | 'reply' | 'replyAll' | 'forward'>('none');
  const [replyText, setReplyText] = useState('');
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch real messages from PostgreSQL database
  const fetchMessagesFromDB = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMessages();
      if (Array.isArray(data)) {
        setMessages(data);
        if (data.length > 0 && !selectedMessageId) {
          setSelectedMessageId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages from PostgreSQL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesFromDB();
  }, []);

  // Filter messages by folder and search query
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const msgFolder = m.folder || 'inbox';
      if (msgFolder !== selectedFolder) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        (m.senderName && m.senderName.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q)) ||
        (m.body && m.body.toLowerCase().includes(q))
      );
    });
  }, [messages, selectedFolder, searchQuery]);

  // Reset to page 1 when folder or search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedForBatch([]);
  }, [selectedFolder, searchQuery]);

  // Dynamic Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMessages = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * pageSize;
    return filteredMessages.slice(startIndex, startIndex + pageSize);
  }, [filteredMessages, effectiveCurrentPage, pageSize]);

  // Currently viewed message
  const selectedMessage = useMemo(() => {
    if (selectedMessageId) {
      const found = messages.find((m) => m.id === selectedMessageId);
      if (found) return found;
    }
    return paginatedMessages[0] || filteredMessages[0] || null;
  }, [messages, selectedMessageId, paginatedMessages, filteredMessages]);

  // Handle message selection & mark read in DB
  const handleSelectMessage = async (msg: MessageItemData) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
      try {
        await api.markMessageRead(msg.id);
      } catch (err) {
        console.error('Error marking message read:', err);
      }
    }
  };

  // Toggle batch selection
  const handleToggleSelectAll = () => {
    if (selectedForBatch.length === paginatedMessages.length && paginatedMessages.length > 0) {
      setSelectedForBatch([]);
    } else {
      setSelectedForBatch(paginatedMessages.map((m) => m.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedForBatch((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete / Trash Action
  const handleDeleteSelected = async () => {
    const idsToDelete = selectedForBatch.length > 0
      ? selectedForBatch
      : (selectedMessageId ? [selectedMessageId] : []);

    if (idsToDelete.length === 0) return;

    try {
      if (idsToDelete.length === 1) {
        await api.deleteMessage(idsToDelete[0]);
      } else {
        await api.batchDeleteMessages(idsToDelete);
      }

      setMessages((prev) =>
        prev.map((m) => (idsToDelete.includes(m.id) ? { ...m, folder: 'trash' } : m))
      );

      setToastMessage(
        selectedFolder === 'trash'
          ? `${idsToDelete.length} message(s) permanently deleted.`
          : `${idsToDelete.length} message(s) moved to Trash.`
      );
      setSelectedForBatch([]);

      // Select next message
      const remaining = filteredMessages.filter((m) => !idsToDelete.includes(m.id));
      if (remaining.length > 0) {
        setSelectedMessageId(remaining[0].id);
      } else {
        setSelectedMessageId('');
      }

      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete message(s):', err);
      setToastMessage('Error deleting message.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Reply / Reply All / Forward Setup
  const openReply = (mode: 'reply' | 'replyAll' | 'forward') => {
    if (!selectedMessage) return;
    setReplyMode(mode);

    if (mode === 'forward') {
      setReplyText(`\n\n--- Forwarded Message ---\nFrom: ${selectedMessage.senderName}\nDate: ${selectedMessage.sentDate || selectedMessage.date}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body}`);
      setForwardRecipient('');
    } else {
      setReplyText(`\n\n--- Original Message ---\nFrom: ${selectedMessage.senderName}\nDate: ${selectedMessage.sentDate || selectedMessage.date}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body}`);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setIsSubmitting(true);
      let subject = selectedMessage.subject;
      let toRecipients: string[] = [];

      if (replyMode === 'reply') {
        subject = subject.startsWith('Re: ') ? subject : `Re: ${subject}`;
        toRecipients = [selectedMessage.senderName];
      } else if (replyMode === 'replyAll') {
        subject = subject.startsWith('Re: ') ? subject : `Re: ${subject}`;
        toRecipients = Array.from(new Set([selectedMessage.senderName, ...(selectedMessage.recipients || [])]));
      } else if (replyMode === 'forward') {
        subject = subject.startsWith('Fwd: ') ? subject : `Fwd: ${subject}`;
        toRecipients = forwardRecipient.trim() ? [forwardRecipient.trim()] : ['Alexandria Nelson, RN'];
      }

      const res = await api.createMessage({
        subject,
        body: replyText,
        toRecipients,
        folder: 'sent'
      });

      if (res.data) {
        setMessages((prev) => [res.data, ...prev]);
      }

      setToastMessage(replyMode === 'forward' ? 'Message forwarded successfully!' : 'Reply sent successfully!');
      setReplyMode('none');
      setReplyText('');
      setForwardRecipient('');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to send reply:', err);
      setToastMessage('Failed to send message.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print clinical message
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 dark:bg-charcoal-900 dark:text-slate-100 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                CareOrbit Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Home
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                My Messages (Hilder's Messages)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Secure Internal Clinical Messaging & Care Team Bulletins
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onComposeNew}
            className="flex h-8 items-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage('')} className="text-emerald-800 hover:text-emerald-950 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main 2-Pane Messaging Workspace */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Folder Navigation & Message List */}
        <div className="flex w-full md:w-[420px] lg:w-[460px] shrink-0 flex-col border-b md:border-b-0 md:border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70">
          {/* Top Folder Bar & Actions */}
          <div className="p-3 border-b border-pearl-200/80 dark:border-charcoal-700/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onComposeNew}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-700 transition cursor-pointer"
                >
                  <Mail size={13} />
                  <span>New</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={selectedForBatch.length === 0 && !selectedMessageId}
                  className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-rose-700 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 transition cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              {/* Folder Selector Dropdown */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value as 'inbox' | 'sent' | 'trash')}
                className="h-8 rounded-xl border border-pearl-200 bg-white px-2.5 text-xs font-bold text-slate-800 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 cursor-pointer shadow-2xs"
              >
                <option value="inbox">
                  Inbox ({messages.filter((m) => (m.folder || 'inbox') === 'inbox').length})
                </option>
                <option value="sent">
                  Sent Items ({messages.filter((m) => m.folder === 'sent').length})
                </option>
                <option value="trash">
                  Trash ({messages.filter((m) => m.folder === 'trash').length})
                </option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages, clinical senders..."
                className="w-full h-8 pl-8 pr-3 rounded-xl border border-pearl-200 bg-pearl-50 text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
              />
            </div>

            {/* Select All Row */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedForBatch.length > 0 && selectedForBatch.length === paginatedMessages.length}
                  onChange={handleToggleSelectAll}
                  className="accent-rose-600 rounded cursor-pointer"
                />
                <span>Select All on Page</span>
              </label>
              <span>{filteredMessages.length} total</span>
            </div>
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-pearl-100 dark:divide-charcoal-750">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                <Loader2 size={16} className="animate-spin text-rose-600" />
                <span>Loading messages from database...</span>
              </div>
            ) : paginatedMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No messages in {selectedFolder}.
              </div>
            ) : (
              paginatedMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isChecked = selectedForBatch.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`flex items-start gap-3 p-3 transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-600'
                        : 'hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/50'
                    } ${!msg.isRead ? 'font-bold' : 'font-normal'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleItem(msg.id);
                      }}
                      className="mt-1 accent-rose-600 rounded shrink-0 cursor-pointer"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs text-slate-900 dark:text-white font-bold">
                          {selectedFolder === 'sent'
                            ? (msg.recipients && msg.recipients.length > 0 ? `To: ${msg.recipients.join(', ')}` : 'To: Care Team')
                            : msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {msg.date}
                        </span>
                      </div>
                      <div className="truncate text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                        {msg.subject}
                      </div>
                      <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {msg.body?.replace(/\n+/g, ' ')}
                      </p>
                    </div>

                    {!msg.isRead && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-600 shrink-0" title="Unread" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Pagination Strip - Strict Page Numbers Matching Database Count */}
          <div className="flex items-center justify-between border-t border-pearl-200/80 p-2.5 text-[11px] text-slate-500 dark:border-charcoal-700/80 bg-pearl-50/50 dark:bg-charcoal-900/40">
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={effectiveCurrentPage <= 1}
                className="p-1 rounded-md text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Exact Page Number Buttons based strictly on available messages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[22px] h-[22px] rounded-md text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                    pageNum === effectiveCurrentPage
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'hover:bg-pearl-100 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={effectiveCurrentPage >= totalPages}
                className="p-1 rounded-md text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <span className="text-[10px] font-medium text-slate-400">
              {filteredMessages.length === 0
                ? '0 items'
                : `Displaying ${(effectiveCurrentPage - 1) * pageSize + 1} - ${Math.min(
                    effectiveCurrentPage * pageSize,
                    filteredMessages.length
                  )} of ${filteredMessages.length}`}
            </span>
          </div>
        </div>

        {/* Right Pane: Message Viewer & Thread */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white/50 dark:bg-charcoal-850/50">
          {selectedMessage ? (
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Message Header & Action Bar */}
              <div className="border-b border-pearl-200/90 p-4 sm:p-5 dark:border-charcoal-700/80 bg-white/80 dark:bg-charcoal-900/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Action Buttons: Reply, Reply to All, Forward, Delete, Print */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openReply('reply')}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Reply size={13} />
                      <span>Reply</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openReply('replyAll')}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Users size={13} />
                      <span>Reply to All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openReply('forward')}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Forward size={13} />
                      <span>Forward</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-charcoal-700 dark:bg-charcoal-800 dark:hover:bg-rose-950/40 shadow-2xs transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedMessage.sentDate || selectedMessage.timestamp || selectedMessage.date}
                  </span>
                </div>

                {/* Sender & Recipient Metadata */}
                <div className="space-y-2 rounded-xl bg-pearl-50/70 p-3.5 dark:bg-charcoal-800/60 border border-pearl-200/80 dark:border-charcoal-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="w-16 shrink-0 text-slate-500 font-bold">From:</strong>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedMessage.senderName} ({selectedMessage.senderEmail || 'staff@standardshomecare.com'})
                    </span>
                    {selectedMessage.senderRole && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">
                        {selectedMessage.senderRole.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <strong className="w-16 shrink-0 text-slate-500 font-bold pt-0.5">To:</strong>
                    <div className="flex flex-wrap gap-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {(selectedMessage.recipients && selectedMessage.recipients.length > 0
                        ? selectedMessage.recipients
                        : ['Hilder Magessa, RN']
                      ).map((recip) => (
                        <span
                          key={recip}
                          className="rounded-md bg-white px-2 py-0.5 border border-pearl-200 dark:bg-charcoal-700 dark:border-charcoal-600 font-medium"
                        >
                          {recip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <strong className="w-16 shrink-0 text-slate-500 font-bold">Subject:</strong>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedMessage.subject}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="flex-1 p-5 sm:p-7 leading-relaxed text-slate-800 dark:text-slate-100 text-xs sm:text-sm whitespace-pre-wrap font-sans">
                {selectedMessage.body}
              </div>

              {/* Quick Inline Reply / Reply All / Forward Box */}
              {replyMode !== 'none' && (
                <div className="border-t border-pearl-200/90 p-4 bg-white/95 dark:border-charcoal-700/80 dark:bg-charcoal-900/95 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Sparkles size={14} className="text-rose-600" />
                      <span>
                        {replyMode === 'reply' && `Replying to ${selectedMessage.senderName}`}
                        {replyMode === 'replyAll' && `Replying to All (${[selectedMessage.senderName, ...(selectedMessage.recipients || [])].join(', ')})`}
                        {replyMode === 'forward' && `Forwarding "${selectedMessage.subject}"`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyMode('none')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {replyMode === 'forward' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Forward To Clinician:
                      </label>
                      <input
                        type="text"
                        value={forwardRecipient}
                        onChange={(e) => setForwardRecipient(e.target.value)}
                        placeholder="e.g. Carla Rania RN, Susanna Welch BSN..."
                        className="w-full h-8 px-3 rounded-xl border border-pearl-200 bg-white text-xs font-medium dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type message content..."
                    className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyMode('none')}
                      className="rounded-xl border border-pearl-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-pearl-50 dark:border-charcoal-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={isSubmitting || !replyText.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>{replyMode === 'forward' ? 'Forward Message' : 'Send Reply'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a message from the list to view its contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
