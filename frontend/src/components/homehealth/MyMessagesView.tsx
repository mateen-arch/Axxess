import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Send,
  Trash2,
  Archive,
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
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface MyMessagesViewProps {
  onBack: () => void;
  onComposeNew?: () => void;
}

interface MessageDetail {
  id: string;
  fromName: string;
  fromRole: string;
  fromEmail: string;
  toRecipients: string[];
  sentDate: string;
  timestamp: string;
  subject: string;
  body: string;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'trash';
}

const INITIAL_MESSAGES: MessageDetail[] = [
  {
    id: 'msg-1',
    fromName: 'Carla Rania RN',
    fromRole: 'Clinical Staff Educator',
    fromEmail: 'c.rania@standardsincare.com',
    toRecipients: [
      'Abnia Jean HHA',
      'Adelge Durette HHA',
      'Afia Osei Assibey RN',
      'Agnes Moses',
      'Agness Chirwa LPN',
      'Allen Santos',
      'Aline Jean Marie HHA',
      'Ana Beatriz Morel HHA',
      'Andre Bellevue HHA',
      'Angela Sanchez CCA',
      'Antoine Nortelus',
      'Hilder Magessa RN',
    ],
    sentDate: 'Thursday, November 5, 2026 12:55 PM',
    timestamp: 'Nov 5, 2026 12:55 PM',
    subject: 'Inservice canceled',
    body: `Hello ,\n\nDue to scheduling conflict Monday Nov 9 and Weds Nov 11 Inservice will be rescheduled to Monday Nov 23 at 11 AM and Weds Nov 25 at 3PM in Brockton . Sorry for the inconvenience.\n\nCarla Rania RN`,
    isRead: false,
    folder: 'inbox',
  },
  {
    id: 'msg-2',
    fromName: 'Golden Philemon RN',
    fromRole: 'Clinical Supervisor',
    fromEmail: 'g.philemon@standardsincare.com',
    toRecipients: ['Hilder Magessa RN'],
    sentDate: 'Wednesday, November 4, 2026 11:14 AM',
    timestamp: 'Nov 4, 2026 11:14 AM',
    subject: 'RE: QA Center',
    body: `Hilder,\n\nPlease review the pending OASIS recertification for Lantigua Gonzalez, Scarlet (MRN: 1061). All discipline notes have been signed and attached.\n\nThank you,\nGolden Philemon RN`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-3',
    fromName: 'Rima Mikalaciunas RN',
    fromRole: 'Case Manager',
    fromEmail: 'r.mikalaciunas@standardsincare.com',
    toRecipients: ['Hilder Magessa RN', 'QA Team'],
    sentDate: 'Wednesday, November 4, 2026 10:10 AM',
    timestamp: 'Nov 4, 2026 10:10 AM',
    subject: 'QA Center - Wound Care Orders',
    body: `Hi Hilder,\n\nDr. Gupta updated the wound vac frequency order for Doshi, N Kundanika. Ready for your QA approval.\n\nRima M., RN`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-4',
    fromName: 'Carla Rania RN',
    fromRole: 'Clinical Educator',
    fromEmail: 'c.rania@standardsincare.com',
    toRecipients: ['All Clinical Staff'],
    sentDate: 'Tuesday, November 3, 2026 03:03 PM',
    timestamp: 'Nov 3, 2026 03:03 PM',
    subject: 'FW: RE: inservice and flu shots',
    body: `Reminder: Annual influenza immunization attestation documents must be uploaded to HR by Nov 15.\n\nCarla Rania RN`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-5',
    fromName: 'Axxess Support System',
    fromRole: 'Automated Notification',
    fromEmail: 'notifications@axxessweb.com',
    toRecipients: ['Hilder Magessa RN'],
    sentDate: 'Friday, October 30, 2026 11:58 AM',
    timestamp: 'Oct 30, 2026 11:58 AM',
    subject: 'Axxess Intelligence System Maintenance Completed',
    body: `The scheduled maintenance for Axxess Intelligence documentation auto-assist has completed successfully. All services are operating normally.`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-6',
    fromName: 'Golden Philemon RN',
    fromRole: 'Clinical Supervisor',
    fromEmail: 'g.philemon@standardsincare.com',
    toRecipients: ['Hilder Magessa RN'],
    sentDate: 'Friday, October 30, 2026 03:51 AM',
    timestamp: 'Oct 30, 2026 03:51 AM',
    subject: 'ON-CALL LOG & INCIDENT SHEET',
    body: `Attached is the on-call incident report sheet for overnight triage. No acute transfers were required.`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-7',
    fromName: 'Micah Johnson',
    fromRole: 'IT Operations',
    fromEmail: 'm.johnson@standardsincare.com',
    toRecipients: ['Hilder Magessa RN'],
    sentDate: 'Monday, October 26, 2026 12:32 PM',
    timestamp: 'Oct 26, 2026 12:32 PM',
    subject: 'Webmail Login Upgrade',
    body: `Your Axxess Single-Sign-On configuration has been updated for secure two-factor authentication.`,
    isRead: true,
    folder: 'inbox',
  },
  {
    id: 'msg-8',
    fromName: 'Golden Philemon RN',
    fromRole: 'Clinical Supervisor',
    fromEmail: 'g.philemon@standardsincare.com',
    toRecipients: ['Hilder Magessa RN'],
    sentDate: 'Thursday, October 22, 2026 12:01 PM',
    timestamp: 'Oct 22, 2026 12:01 PM',
    subject: 'RE: QI NOTES',
    body: `Quarterly quality improvement indicators have been logged. Outstanding documentation compliance currently stands at 98.4%.`,
    isRead: true,
    folder: 'inbox',
  },
];

export const MyMessagesView: React.FC<MyMessagesViewProps> = ({ onBack, onComposeNew }) => {
  const { organization } = useHealthcare();
  const [messages, setMessages] = useState<MessageDetail[]>(INITIAL_MESSAGES);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('msg-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredMessages = messages.filter((m) => {
    if (m.folder !== selectedFolder) return false;
    if (!searchQuery.trim()) return true;
    return (
      m.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || filteredMessages[0] || null;

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedForBatch.length === filteredMessages.length) {
      setSelectedForBatch([]);
    } else {
      setSelectedForBatch(filteredMessages.map((m) => m.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedForBatch((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedForBatch.length === 0 && selectedMessageId) {
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessageId));
      setToastMessage('Message deleted.');
    } else {
      setMessages((prev) => prev.filter((m) => !selectedForBatch.includes(m.id)));
      setToastMessage(`${selectedForBatch.length} messages deleted.`);
      setSelectedForBatch([]);
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim() || !selectedMessage) return;
    setToastMessage(`Reply sent to ${selectedMessage.fromName}!`);
    setQuickReplyText('');
    setShowReplyBox(false);
    setTimeout(() => setToastMessage(''), 3000);
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
                Axxess Home Health
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
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Main 2-Pane Messaging Workspace */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Folder Navigation & Message List */}
        <div className="flex w-full md:w-[420px] lg:w-[460px] shrink-0 flex-col border-b md:border-b-0 md:border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70">
          {/* Top Folder Bar & Actions (Matching Screenshot 1) */}
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
                  className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-rose-700 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              {/* Folder Selector Dropdown */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value as 'inbox' | 'sent' | 'trash')}
                className="h-8 rounded-xl border border-pearl-200 bg-white px-2.5 text-xs font-bold text-slate-800 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500"
              >
                <option value="inbox">Inbox ({messages.filter((m) => m.folder === 'inbox').length})</option>
                <option value="sent">Sent Items</option>
                <option value="trash">Trash</option>
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
                  checked={selectedForBatch.length > 0 && selectedForBatch.length === filteredMessages.length}
                  onChange={handleToggleSelectAll}
                  className="accent-rose-600 rounded"
                />
                <span>Select All</span>
              </label>
              <span>{filteredMessages.length} messages</span>
            </div>
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-pearl-100 dark:divide-charcoal-750">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No messages found in this folder.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isChecked = selectedForBatch.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg.id)}
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
                        <span className="truncate text-xs text-slate-900 dark:text-white">
                          {msg.fromName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {msg.timestamp.split(' ').slice(0, 3).join(' ')}
                        </span>
                      </div>
                      <div className="truncate text-xs text-slate-700 dark:text-slate-300">
                        {msg.subject}
                      </div>
                      <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {msg.body.replace(/\n+/g, ' ')}
                      </p>
                    </div>

                    {!msg.isRead && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-600 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Strip (Matching Screenshot 1: Displaying items 1 - 75 of 682) */}
          <div className="flex items-center justify-between border-t border-pearl-200/80 p-2.5 text-[11px] text-slate-500 dark:border-charcoal-700/80 bg-pearl-50/50 dark:bg-charcoal-900/40">
            <div className="flex items-center gap-1 font-bold">
              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-white">1</span>
              <span className="px-1 hover:text-rose-600 cursor-pointer">2</span>
              <span className="px-1 hover:text-rose-600 cursor-pointer">3</span>
              <span>...</span>
              <span className="px-1 hover:text-rose-600 cursor-pointer">10</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              Displaying items 1 - {filteredMessages.length} of 682
            </span>
          </div>
        </div>

        {/* Right Pane: Message Viewer & Thread */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white/50 dark:bg-charcoal-850/50">
          {selectedMessage ? (
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Message Header & Action Bar (Matching Screenshot 1: Reply, Reply to All, Forward, Delete, Print) */}
              <div className="border-b border-pearl-200/90 p-4 sm:p-5 dark:border-charcoal-700/80 bg-white/80 dark:bg-charcoal-900/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowReplyBox(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Reply size={13} />
                      <span>Reply</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplyBox(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Users size={13} />
                      <span>Reply to All</span>
                    </button>
                    <button
                      type="button"
                      onClick={onComposeNew}
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
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedMessage.sentDate}
                  </span>
                </div>

                {/* Sender & Recipient Metadata */}
                <div className="space-y-2 rounded-xl bg-pearl-50/70 p-3.5 dark:bg-charcoal-800/60 border border-pearl-200/80 dark:border-charcoal-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="w-16 shrink-0 text-slate-500 font-bold">From:</strong>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedMessage.fromName} ({selectedMessage.fromEmail})
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <strong className="w-16 shrink-0 text-slate-500 font-bold pt-0.5">To:</strong>
                    <div className="flex flex-wrap gap-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {selectedMessage.toRecipients.map((recip) => (
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

              {/* Quick Inline Reply */}
              {showReplyBox && (
                <div className="border-t border-pearl-200/90 p-4 bg-white/90 dark:border-charcoal-700/80 dark:bg-charcoal-900/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Reply to {selectedMessage.fromName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReplyBox(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={quickReplyText}
                    onChange={(e) => setQuickReplyText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full rounded-xl border border-pearl-200 bg-white p-3 text-xs font-medium text-slate-900 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyBox(false)}
                      className="rounded-xl border border-pearl-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-pearl-50 dark:border-charcoal-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendQuickReply}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a message to view content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
