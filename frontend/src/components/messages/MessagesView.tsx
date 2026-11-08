import React from 'react';
import { MessageSquareText, Search, Clock, CheckCheck, AlertCircle, Plus } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const MessagesView: React.FC = () => {
  const { messages, unreadCount, setSelectedMessage, markMessageRead } = useHealthcare();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquareText className="text-rose-600 dark:text-rose-400" size={24} />
            Axxess Connect (Secure Messaging)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            HIPAA-compliant interdisciplinary messaging between clinical supervisors, physicians, and field nurses
          </p>
        </div>

        <button className="btn-primary text-xs">
          <Plus size={16} />
          <span>New Clinical Message</span>
        </button>
      </div>

      {/* Messages Main Box */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-charcoal-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">All Clinical Messages</span>
            <span className="badge badge-crimson text-xs">{unreadCount} Unread</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Standards Home Care Gateway</span>
        </div>

        <div className="space-y-2.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                !msg.isRead
                  ? 'bg-rose-50/40 dark:bg-charcoal-800/80 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50/80 dark:hover:bg-charcoal-750 shadow-xs'
                  : 'bg-white dark:bg-charcoal-850 border-slate-200/80 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {msg.senderName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{msg.senderName}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">• {msg.senderRole}</span>
                    <span className="badge badge-slate text-[10px]">
                      {msg.serviceLine === 'home_care' ? 'Home Care' : 'Home Health'}
                    </span>
                    {msg.priority === 'urgent' && (
                      <span className="badge badge-crimson text-[10px]">
                        <AlertCircle size={10} /> Urgent
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs mt-1">
                    {msg.subject}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-1">
                    {msg.snippet}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-[11px]">{msg.date}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markMessageRead(msg.id);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-charcoal-700 text-slate-600 dark:text-slate-300"
                  title="Mark as read"
                >
                  <CheckCheck size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
