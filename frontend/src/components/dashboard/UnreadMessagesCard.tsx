import React, { useState } from 'react';
import {
  MessageSquare,
  AlertCircle,
  CheckCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const UnreadMessagesCard: React.FC = () => {
  const {
    messages,
    unreadCount,
    markMessageRead,
    setSelectedMessage,
    setActiveNavTab,
    serviceFilter
  } = useHealthcare();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'home_care' | 'home_health'>('all');

  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === 'urgent') return msg.priority === 'urgent';
    if (activeFilter === 'home_care') return msg.serviceLine === 'home_care';
    if (activeFilter === 'home_health') return msg.serviceLine === 'home_health';
    if (serviceFilter !== 'all') return msg.serviceLine === serviceFilter;
    return true;
  });

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Unread Messages</h3>
              <span className="badge badge-crimson text-[11px] font-mono">
                {unreadCount} Total
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Clinical alerts & communication log</span>
          </div>
        </div>

        <button
          onClick={() => setActiveNavTab('messages')}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 group"
        >
          <span>Axxess Connect</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto text-[11px]">
        {(['all', 'urgent', 'home_care', 'home_health'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap capitalize ${
              activeFilter === filter
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-pearl-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-pearl-200 dark:hover:bg-charcoal-700'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Messages Stream List */}
      <div className="my-2 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
              !msg.isRead
                ? 'bg-rose-50/40 dark:bg-charcoal-800/80 border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-50/70 dark:hover:bg-charcoal-750 hover:shadow-sm'
                : 'bg-pearl-50/50 dark:bg-charcoal-850/60 border-pearl-200 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-800'
            }`}
          >
            {/* Header: Sender & Date */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-bold text-[10px] flex items-center justify-center">
                  {msg.senderName[0]}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">• {msg.senderRole}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <Clock size={11} />
                <span>{msg.date}</span>
              </div>
            </div>

            {/* Subject */}
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 line-clamp-1 mb-1 transition-colors">
              {msg.subject}
            </div>

            {/* Snippet */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {msg.snippet}
            </p>

            {/* Metadata Pills */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-1.5">
                <span className="badge badge-slate dark:bg-charcoal-700 dark:text-slate-300 dark:border-charcoal-600 text-[10px]">
                  {msg.serviceLine === 'home_care' ? 'Home Care' : 'Home Health'}
                </span>
                {msg.priority === 'urgent' && (
                  <span className="badge badge-crimson text-[10px] flex items-center gap-1">
                    <AlertCircle size={10} /> Urgent Action
                  </span>
                )}
                {msg.patientName && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Pt: {msg.patientName}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markMessageRead(msg.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition-opacity"
                title="Mark as read"
              >
                <CheckCheck size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">
          Showing 5 of {unreadCount} unread items
        </span>
        <button
          onClick={() => setActiveNavTab('messages')}
          className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs"
        >
          View All Inbox ({unreadCount})
        </button>
      </div>
    </div>
  );
};
