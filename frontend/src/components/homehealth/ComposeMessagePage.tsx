import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bold,
  Check,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Filter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Mail,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Strikethrough,
  Underline,
  User,
  Users,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { PriorityLevel } from '../../types';

interface ComposeMessagePageProps {
  onBack: () => void;
  onMessageSent?: () => void;
}

interface RecipientItem {
  id: string;
  fullName: string;
  role: string;
  email?: string;
}

export interface MessageAttachment {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}

export const ComposeMessagePage: React.FC<ComposeMessagePageProps> = ({ onBack, onMessageSent }) => {
  const { organization, patients, clinicians, addMessage } = useHealthcare();

  // Populate recipients dynamically from actual clinicians with standardized roles (no dummy hardcoded data)
  const recipientsList: RecipientItem[] = useMemo(() => {
    return clinicians.map((c, idx) => {
      let role = c.credentials || c.title || 'Staff';
      const upper = role.toUpperCase();
      if (upper.includes('RN')) role = 'RN';
      else if (upper.includes('LPN')) role = 'LPN';
      else if (upper.includes('HHA') || upper.includes('AIDE')) role = 'HHA';
      else if (upper.includes('PT') || upper.includes('PHYSICAL')) role = 'PT';
      else if (upper.includes('OT') || upper.includes('OCCUPATIONAL')) role = 'OT';
      else if (upper.includes('PTA')) role = 'PTA';

      return {
        id: c.id || `recip-${idx}`,
        fullName: c.name,
        role,
        email: (c as any).email,
      };
    });
  }, [clinicians]);

  // Recipient search & selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'RN' | 'LPN' | 'HHA' | 'Therapy' | 'Other'>('All');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());

  // Message Form State - clean empty defaults with no dummy data
  const [subject, setSubject] = useState('');
  const [regardingPatientId, setRegardingPatientId] = useState('');
  const [requestReadReceipt, setRequestReadReceipt] = useState(false);
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [messageBody, setMessageBody] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('routine');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('13px');

  // Textarea Ref for rich-text manipulation
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // UI State
  const [showErrors, setShowErrors] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return recipientsList.filter((item) => {
      const matchesSearch =
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (roleFilter === 'All') return true;
      if (roleFilter === 'RN') return item.role === 'RN';
      if (roleFilter === 'LPN') return item.role === 'LPN';
      if (roleFilter === 'HHA') return item.role === 'HHA';
      if (roleFilter === 'Therapy') return item.role === 'PT' || item.role === 'PTA' || item.role === 'OT';
      if (roleFilter === 'Other') return !['RN', 'LPN', 'HHA', 'PT', 'PTA', 'OT'].includes(item.role);
      return true;
    });
  }, [recipientsList, searchQuery, roleFilter]);

  const allFilteredSelected = useMemo(() => {
    if (filteredRecipients.length === 0) return false;
    return filteredRecipients.every((item) => selectedRecipientIds.has(item.id));
  }, [filteredRecipients, selectedRecipientIds]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedRecipientIds);
    if (allFilteredSelected) {
      filteredRecipients.forEach((item) => next.delete(item.id));
    } else {
      filteredRecipients.forEach((item) => next.add(item.id));
    }
    setSelectedRecipientIds(next);
  };

  const handleToggleRecipient = (id: string) => {
    const next = new Set(selectedRecipientIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRecipientIds(next);
  };

  const selectedRecipientNames = useMemo(() => {
    return recipientsList
      .filter((item) => selectedRecipientIds.has(item.id))
      .map((item) => `${item.fullName} ${item.role !== 'Staff' ? item.role : ''}`.trim());
  }, [recipientsList, selectedRecipientIds]);

  // Actual file reading and storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          name: file.name,
          size: sizeStr,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedPatientObj = useMemo(() => {
    return patients.find((p) => p.id === regardingPatientId || p.mrn === regardingPatientId);
  }, [patients, regardingPatientId]);

  // Validation
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (selectedRecipientIds.size === 0) errs.recipients = 'Please select at least one recipient.';
    if (!subject.trim()) errs.subject = 'Subject is required.';
    if (!messageBody.trim()) errs.body = 'Message body cannot be empty.';
    return errs;
  }, [selectedRecipientIds, subject, messageBody]);

  const isValid = Object.keys(validationErrors).length === 0;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    try {
      setIsSending(true);
      const patientName = selectedPatientObj
        ? `${selectedPatientObj.lastName}, ${selectedPatientObj.firstName}`
        : undefined;

      const attachmentsPayload = attachment ? [attachment] : [];

      await addMessage({
        senderName: 'Hilder Magessa RN',
        senderRole: 'Clinical Supervisor',
        subject: subject.trim(),
        snippet: messageBody.slice(0, 140) + (messageBody.length > 140 ? '...' : ''),
        serviceLine: 'home_health',
        organizationName: organization.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isRead: true,
        priority,
        patientName,
        recipientNames: selectedRecipientNames,
        body: messageBody,
        regardingPatientId: regardingPatientId || undefined,
        readReceiptRequested: requestReadReceipt,
        attachmentName: attachment?.name,
        attachments: attachmentsPayload,
      } as any);

      setIsSuccess(true);
      setTimeout(() => {
        if (onMessageSent) onMessageSent();
        else onBack();
      }, 1000);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const applyTextFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageBody((prev) => `${prev}${prefix}${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextText = text.slice(0, start) + replacement + text.slice(end);
    setMessageBody(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 0);
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL (e.g., https://example.com):', 'https://');
    if (url) {
      applyTextFormat('[', `](${url})`);
    }
  };

  const insertTemplateText = (snippet: string) => {
    setMessageBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans dark:bg-charcoal-900 transition-colors">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-black uppercase tracking-[.14em] text-rose-600 dark:text-rose-400">
                Home Health
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Create
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New
              </span>
              <span className="text-slate-300 dark:text-charcoal-600 font-light">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Compose Message
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">HIPAA Secure Care-Team Messaging</span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-8 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Message successfully sent to {selectedRecipientIds.size} recipient(s)! Returning to dashboard...</span>
        </div>
      )}

      {/* Validation Banner */}
      {showErrors && !isValid && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50/90 px-6 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>Please select at least one recipient and enter both a Subject and Message body before sending.</span>
        </div>
      )}

      {/* 2. Workspace Layout: Left Recipient List Rail + Right Message Editor */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Recipient List */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col border-r border-pearl-200/90 bg-white/70 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/70 overflow-hidden">
          {/* Recipient Header */}
          <div className="p-4 border-b border-pearl-200/80 dark:border-charcoal-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Recipient List
                </h2>
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {selectedRecipientIds.size} of {recipientsList.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient name or title..."
                className="h-9 w-full rounded-xl border border-pearl-200 bg-pearl-50/70 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white dark:focus:bg-charcoal-750"
              />
            </div>

            {/* Quick Role Filters */}
            <div className="flex flex-wrap gap-1">
              {(['All', 'RN', 'LPN', 'HHA', 'Therapy', 'Other'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                    roleFilter === role
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-pearl-100 text-slate-600 hover:bg-pearl-200 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Select All Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
                />
                <span>Select All</span>
              </label>

              {selectedRecipientIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRecipientIds(new Set())}
                  className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Recipient Checkbox Items */}
          <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredRecipients.map((item) => {
              const isChecked = selectedRecipientIds.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition select-none ${
                    isChecked
                      ? 'bg-rose-50/80 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200 font-bold'
                      : 'text-slate-700 hover:bg-pearl-100/70 dark:text-slate-300 dark:hover:bg-charcoal-800/70 font-medium'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleRecipient(item.id)}
                    className="h-3.5 w-3.5 rounded accent-rose-600 shrink-0 cursor-pointer"
                  />
                  <span className="min-w-0 flex-1 truncate">{item.fullName}</span>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      item.role === 'RN'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                        : item.role === 'LPN'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                        : item.role === 'HHA'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                        : item.role === 'PT' || item.role === 'OT' || item.role === 'PTA'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-pearl-200 text-slate-700 dark:bg-charcoal-700 dark:text-slate-300'
                    }`}
                  >
                    {item.role}
                  </span>
                </label>
              );
            })}

            {filteredRecipients.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No recipients match your search or filter criteria.
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Compose Message Form */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-pearl-50/50 dark:bg-charcoal-900/40">
          <form onSubmit={handleSendMessage} className="mx-auto max-w-4xl space-y-5">
            {/* Form Top Section: Large Send Button + Message Header */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-5 border-b border-pearl-200/80 dark:border-charcoal-700/80">
                {/* Big Send Button per reference image */}
                <button
                  type="submit"
                  disabled={isSuccess || isSending}
                  className="flex flex-col items-center justify-center gap-1.5 h-20 w-24 shrink-0 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/25 transition hover:scale-[1.02] hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  title="Send message now"
                >
                  <Send size={22} className="stroke-[2.5]" />
                  <span className="text-xs font-black uppercase tracking-wider">{isSending ? 'Sending...' : 'Send'}</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-rose-600 dark:text-rose-400" />
                    <h1 className="text-xl font-black text-slate-950 dark:text-white">
                      New Message
                    </h1>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Interdisciplinary care coordination message delivered to recipient dashboards and secure email.
                  </p>
                </div>
              </div>

              {/* Message Meta Fields: To, Subject, Regarding, Options */}
              <div className="mt-5 space-y-4">
                {/* To Field */}
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] items-start gap-2">
                  <label className="pt-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    To <span className="text-rose-600">*</span>
                  </label>
                  <div>
                    <div className={`min-h-10 rounded-xl border bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-2 shadow-2xs ${
                      showErrors && validationErrors.recipients ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-pearl-200'
                    }`}>
                      {selectedRecipientNames.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {selectedRecipientNames.slice(0, 8).map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/90 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                            >
                              <span className="truncate max-w-[200px]">{name}</span>
                            </span>
                          ))}
                          {selectedRecipientNames.length > 8 && (
                            <span className="inline-flex items-center rounded-lg bg-pearl-100 px-2 py-0.5 text-xs font-black text-slate-700 dark:bg-charcoal-700 dark:text-slate-200">
                              +{selectedRecipientNames.length - 8} more
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 ml-auto">
                            ({selectedRecipientNames.length} selected from list)
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-1">
                          Select one or more staff members from the Recipient List on the left.
                        </p>
                      )}
                    </div>
                    {showErrors && validationErrors.recipients && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {validationErrors.recipients}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] items-center gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Subject <span className="text-rose-600">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter message subject"
                      className={`h-10 w-full rounded-xl border bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${
                        showErrors && validationErrors.subject ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-pearl-200'
                      }`}
                    />
                    {showErrors && validationErrors.subject && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} className="shrink-0" />
                        {validationErrors.subject}
                      </span>
                    )}
                  </div>
                </div>

                {/* Regarding (Patient Selection) */}
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] items-center gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Regarding
                  </label>
                  <select
                    value={regardingPatientId}
                    onChange={(e) => setRegardingPatientId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 px-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.lastName}, {pat.firstName} (MRN: #{pat.mrn}) · DOB: {pat.dob || '—'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Read Receipt & Priority Options */}
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] items-center gap-2">
                  <div />
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={requestReadReceipt}
                        onChange={(e) => setRequestReadReceipt(e.target.checked)}
                        className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
                      />
                      <span>Request a Read Receipt</span>
                    </label>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Priority:</span>
                      {(['routine', 'urgent', 'stat', 'critical'] as PriorityLevel[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition ${
                            priority === p
                              ? p === 'urgent' || p === 'stat' || p === 'critical'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-white dark:bg-charcoal-700'
                              : 'bg-pearl-100 text-slate-600 dark:bg-charcoal-800 dark:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attachment Field */}
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] items-center gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Attachment
                  </label>
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-800 p-2 shadow-2xs">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-pearl-300 bg-pearl-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-pearl-200 dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200 transition">
                      <FileUp size={14} />
                      <span>Choose File</span>
                      <input type="file" onChange={handleFileChange} className="hidden" />
                    </label>

                    <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {attachment ? `${attachment.name} (${attachment.size})` : 'No file chosen'}
                    </span>

                    {attachment && (
                      <div className="ml-auto flex items-center gap-2">
                        {attachment.dataUrl && (
                          <a
                            href={attachment.dataUrl}
                            download={attachment.name}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition"
                            title="Download / preview attached file"
                          >
                            Download
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remove file"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Editor Toolbar & Message Body Card */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-pearl-200/90 dark:border-charcoal-700/80 bg-white/95 dark:bg-charcoal-850/95 shadow-2xs backdrop-blur-md">
              {/* Rich Text Toolbar per reference screenshot */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-pearl-200/80 bg-pearl-50/70 p-2.5 dark:border-charcoal-700/80 dark:bg-charcoal-800/60 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-0.5 border-r border-pearl-200 pr-2 dark:border-charcoal-700">
                  <button
                    type="button"
                    onClick={() => applyTextFormat('**', '**')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 font-bold transition"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat('*', '*')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 italic transition"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat('<u>', '</u>')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 underline transition"
                    title="Underline"
                  >
                    <Underline size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat('~~', '~~')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 line-through transition"
                    title="Strikethrough"
                  >
                    <Strikethrough size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2 border-r border-pearl-200 px-2 dark:border-charcoal-700">
                  <select
                    className="h-7 rounded-md border border-pearl-200 bg-white px-2 text-[11px] font-medium outline-none dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-white"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Calibri, sans-serif">Calibri</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                  </select>
                  <select
                    className="h-7 rounded-md border border-pearl-200 bg-white px-2 text-[11px] font-medium outline-none dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-white"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="11px">11px</option>
                    <option value="13px">13px</option>
                    <option value="15px">15px</option>
                    <option value="18px">18px</option>
                  </select>
                </div>

                <div className="flex items-center gap-0.5 border-r border-pearl-200 px-2 dark:border-charcoal-700">
                  <button
                    type="button"
                    onClick={() => applyTextFormat('1. ')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 transition"
                    title="Numbered List"
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat('• ')}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 transition"
                    title="Bullet List"
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white dark:hover:bg-charcoal-750 transition"
                    title="Insert Link"
                  >
                    <Link2 size={14} />
                  </button>
                </div>

                {/* Quick Care Team Templates */}
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 hidden md:inline">Quick Notes:</span>
                  {[
                    'In-service rescheduled',
                    'Recertification due',
                    'Physician order update',
                  ].map((tmpl) => (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => insertTemplateText(`Regarding patient care: ${tmpl}. Please review and confirm acknowledgment.`)}
                      className="rounded-md border border-pearl-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Body Area */}
              <div className="p-4 sm:p-5">
                <textarea
                  ref={textareaRef}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Type your secure message content here..."
                  rows={10}
                  style={{ fontFamily, fontSize }}
                  className="w-full bg-transparent leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 resize-y"
                />
                {showErrors && validationErrors.body && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{validationErrors.body}</p>
                )}
              </div>

              {/* Character and Attachment Footer */}
              <div className="flex items-center justify-between border-t border-pearl-200/80 px-5 py-2.5 text-[11px] text-slate-400 dark:border-charcoal-700/80 bg-pearl-50/40 dark:bg-charcoal-900/30">
                <span>Care team messages are encrypted and audited for HIPAA compliance.</span>
                <span>{messageBody.length} characters</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="h-10 rounded-xl border border-pearl-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:bg-charcoal-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSuccess || isSending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-6 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-50"
              >
                <Send size={15} />
                <span>{isSending ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
