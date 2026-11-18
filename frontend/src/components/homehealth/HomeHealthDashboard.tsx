import React, { useState, useMemo, useEffect } from 'react';
import {
  Mail,
  Calendar,
  Play,
  RotateCw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  X,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { PatientBirthdaysStrip } from './PatientBirthdaysStrip';

interface HomeHealthDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenMessage?: (message: any) => void;
}

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  category: string;
  readTime: string;
  summary: string;
  date: string;
}

const DASHBOARD_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'How CareOrbit Care Helps Home Care Organizations Solve Staffing Challenges',
    url: 'https://www.careorbit.com/blog/home-care/how-careorbit-care-helps-home-care-organizations-solve-staffing-challenges/',
    category: 'Home Care • Staffing Innovation',
    readTime: '4 min read',
    summary: 'Staffing shortages remain one of the most pressing hurdles for care at home agencies. Learn how CareOrbit Care helps home care organizations solve staffing challenges with on-demand qualified clinician staffing.',
    date: 'CareOrbit Blog'
  },
  {
    id: 'news-2',
    title: 'How CareOrbit Intelligence Reduces Administrative Burden in Care at Home',
    url: 'https://www.careorbit.com/blog/hospice/how-careorbit-intelligence-reduces-administrative-burden-in-care-at-home/',
    category: 'Hospice & Home Health • AI Efficiency',
    readTime: '5 min read',
    summary: 'Administrative responsibilities continue to grow across care at home. Discover how CareOrbit Intelligence automates clinical documentation workflows, streamlines QA checks, and reduces administrative burden in care at home.',
    date: 'CareOrbit Blog'
  }
];

export const HomeHealthDashboard: React.FC<HomeHealthDashboardProps> = ({
  onNavigate,
  onOpenMessage,
}) => {
  const {
    organization,
    messages,
    markMessageRead,
    employeeVisits,
    chartTasks,
    patients,
    setCurrentWebsite,
    setConnectModule,
    setActiveConversationId,
    setIsCommandPaletteOpen
  } = useHealthcare();

  // Dynamic live time
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. Real Unread Messages from PostgreSQL database
  const unreadMessages = useMemo(() => {
    return (messages || []).filter(m => !m.isRead);
  }, [messages]);

  // 2. Real Schedule Tasks from PostgreSQL database (employeeVisits or chartTasks)
  const scheduledTasks = useMemo(() => {
    if (employeeVisits && employeeVisits.length > 0) {
      return employeeVisits.slice(0, 5).map(v => ({
        id: v.id,
        patientName: v.patientName,
        mrn: v.patientMrn || 'MRN-78210',
        activity: v.serviceLine === 'home_health' ? 'SN' : v.serviceLine === 'home_care' ? 'HCA' : 'HOSP',
        task: v.visitType,
        date: v.timeSlot ? `${v.date} ${v.timeSlot}` : v.date,
        status: v.status
      }));
    }
    if (chartTasks && chartTasks.length > 0) {
      return chartTasks.slice(0, 5).map(t => {
        const pat = patients.find(p => p.id === t.patientId);
        return {
          id: t.id,
          patientName: pat ? `${pat.lastName}, ${pat.firstName}` : 'Heather Abuissa',
          mrn: pat?.mrn || '1061',
          activity: t.discipline,
          task: t.task,
          date: `${t.scheduleStart} ${t.scheduleEnd}`,
          status: t.status
        };
      });
    }
    return [];
  }, [employeeVisits, chartTasks, patients]);

  // 3. Real Recertification Stats calculated from active database patients
  const { pastDueRecertsCount, upcomingRecertsCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fourteenDaysLater = new Date(today);
    fourteenDaysLater.setDate(today.getDate() + 14);

    let pastDue = 0;
    let upcoming = 0;

    patients.forEach(p => {
      if (p.status === 'active' && p.episodeEnd) {
        const epDate = new Date(p.episodeEnd);
        if (!isNaN(epDate.getTime())) {
          if (epDate < today) {
            pastDue++;
          } else if (epDate >= today && epDate <= fourteenDaysLater) {
            upcoming++;
          }
        }
      }
    });

    return { pastDueRecertsCount: pastDue, upcomingRecertsCount: upcoming };
  }, [patients]);

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeMessage, setComposeMessage] = useState('');

  const handleDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markMessageRead(id);
  };

  const handleOpenConnect = () => {
    if (onNavigate) {
      onNavigate('my-messages');
    } else {
      setCurrentWebsite('connect');
      setConnectModule('connect');
      setActiveConversationId('conv-care-abuissa');
    }
  };

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans">
      {/* ==================================================================== */}
      {/* 1. DASHBOARD HEADER & CONTEXT ROW                                    */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white/70 dark:bg-charcoal-850/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Good Afternoon, Hilder
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-mono">
              Clinical Supervisor
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1 font-mono">
            <Clock size={12} className="text-rose-600" />
            <span>{currentTime}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide">
            {organization.name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            BEVERLY, MA 01915 • Branch Sector #04
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. PATIENT BIRTHDAYS STRIP (Calculated dynamically from DB)          */}
      {/* ==================================================================== */}
      <PatientBirthdaysStrip onViewAll={() => { if (onNavigate) onNavigate('patient-charts'); }} />

      {/* ==================================================================== */}
      {/* 3. CORE TWO-ROW CLINICAL WIDGETS GRID                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================================================================== */}
        {/* WIDGET 1: Unread Message (Col span 4)                              */}
        {/* ================================================================== */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-rose-600" />
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Unread Messages ({unreadMessages.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('compose-message');
                else setIsComposeModalOpen(true);
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Compose Message
            </button>
          </div>

          <div className="flex-1 p-3.5 divide-y divide-pearl-100 dark:divide-charcoal-750 min-h-[140px] flex flex-col justify-center">
            {unreadMessages.length > 0 ? (
              unreadMessages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (onOpenMessage) onOpenMessage(msg);
                    else onNavigate?.('my-messages');
                  }}
                  className="py-2.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors truncate">
                      {msg.senderName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                      {msg.subject}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMessage(msg.id, e)}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-bold cursor-pointer p-1"
                      title="Mark as read"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                No unread messages.
              </div>
            )}
          </div>

          <div className="p-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30 text-right">
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('my-messages');
                else handleOpenConnect();
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Messages</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* WIDGET 2: My Schedule Tasks (Col span 4)                           */}
        {/* ================================================================== */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-rose-600" />
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
                My Schedule Tasks ({scheduledTasks.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('my-schedule-tasks')}
              className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
            >
              Schedule Center
            </button>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[140px] flex flex-col justify-center">
            {scheduledTasks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium italic">
                No Scheduled Tasks Found.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-pearl-50 dark:bg-charcoal-800/80 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Patient Name</th>
                    <th className="py-2 px-2 text-center">Discipline</th>
                    <th className="py-2 px-3">Task</th>
                    <th className="py-2 px-3 text-right">Time / Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                  {scheduledTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => onNavigate?.('my-schedule-tasks')}
                      className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {task.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">MRN: {task.mrn}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono">
                          {task.activity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[120px]">
                        {task.task}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[10.5px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {task.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30 text-right">
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('my-schedule-tasks');
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Tasks</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* WIDGET 3: CareOrbit Home Health Video Spotlight (Col span 4)          */}
        {/* ================================================================== */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope size={15} className="text-rose-600" />
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
                CareOrbit Home Health Spotlight
              </h2>
            </div>
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider font-mono">
              True Partner
            </span>
          </div>

          <div
            onClick={() => setIsVideoModalOpen(true)}
            className="flex-1 relative m-3 rounded-xl overflow-hidden cursor-pointer group shadow-sm bg-slate-900 flex flex-col justify-end min-h-[160px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />

            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
              alt="Deborah Lollar Video Thumbnail"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75"
            />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={20} className="fill-white translate-x-0.5" />
              </div>
            </div>

            <div className="relative z-20 p-3.5 text-white">
              <div className="font-extrabold text-xs text-white leading-tight">
                "CareOrbit is a True Partner"
              </div>
              <div className="text-[10.5px] text-slate-300 font-medium mt-0.5 truncate">
                Deborah Lollar, President & CEO • Healthcare Management Services
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LOWER ROW: RECERTIFICATIONS DUE & NEWS/UPDATES                   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================================================================== */}
        {/* WIDGET 4: Recertifications Due (Col span 5)                        */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck size={15} className="text-rose-600" />
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Recertifications Due (60-Day OASIS)
              </h2>
            </div>
            <span className="text-[10.5px] font-bold text-slate-400">Live Episode Tracking</span>
          </div>

          <div className="p-6 flex flex-col justify-center flex-1">
            <div className="grid grid-cols-2 gap-6 text-center">
              {/* Past Due Gauge */}
              <button
                type="button"
                onClick={() => onNavigate?.('past-due-recertifications')}
                className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/60 transition-all"
                title="View Past Due Recertifications Report"
              >
                <div className="relative w-24 h-24 rounded-full border-4 border-rose-500/20 dark:border-rose-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-20 h-20 rounded-full border-4 border-rose-600 flex items-center justify-center shadow-xs">
                    <span className="text-2xl font-black text-rose-600 font-mono">
                      {pastDueRecertsCount}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2.5 group-hover:text-rose-600 transition-colors">
                  Past Due
                </span>
                <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  {pastDueRecertsCount === 0 ? '✓ Up to Date' : `${pastDueRecertsCount} Action Needed`}
                </span>
              </button>

              {/* Upcoming Recertifications Gauge */}
              <button
                type="button"
                onClick={() => onNavigate?.('upcoming-recerts')}
                className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/60 transition-all"
                title="View Upcoming Recertifications Schedule"
              >
                <div className="relative w-24 h-24 rounded-full border-4 border-pearl-300 dark:border-charcoal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-700 dark:border-slate-300 flex items-center justify-center shadow-xs">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {upcomingRecertsCount}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2.5 group-hover:text-rose-600 transition-colors">
                  Upcoming (Next 14 Days)
                </span>
                <span className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                  {upcomingRecertsCount === 0 ? 'All Episodes Monitored' : `${upcomingRecertsCount} In Pipeline`}
                </span>
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30 flex items-center justify-between text-xs px-4">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Automated OASIS-E Recertification Engine
            </span>
            <button
              type="button"
              onClick={() => onNavigate?.('past-due-recertifications')}
              className="text-rose-600 font-bold text-xs hover:underline cursor-pointer"
            >
              View Reports
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* WIDGET 5: News & Updates (Col span 7)                              */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl glass-panel border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-rose-600" />
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
                News & Updates (CareOrbit Intelligence®)
              </h2>
            </div>
            <span className="text-[10.5px] font-mono text-slate-400">Industry Insights</span>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {DASHBOARD_NEWS_ARTICLES.map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article.url)}
                className="p-4 rounded-xl border border-pearl-200/80 dark:border-charcoal-750 bg-pearl-50/40 dark:bg-charcoal-800/40 hover:border-rose-400 hover:bg-white dark:hover:bg-charcoal-750 transition-all cursor-pointer group shadow-2xs"
                title={`Open article: ${article.title}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-rose-600 transition-colors">
                    <span>Read Article</span>
                    <ExternalLink size={13} />
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors mt-1.5 leading-snug">
                  {article.title}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5 line-clamp-2">
                  {article.summary}
                </p>

                <div className="text-[10px] text-slate-400 font-mono mt-2">
                  {article.date} • {article.readTime}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30 text-right px-4">
            <button
              type="button"
              onClick={() => window.open('https://www.careorbit.com/blog/', '_blank', 'noopener,noreferrer')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All CareOrbit Insights</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. SPOTLIGHT VIDEO MODAL                                             */}
      {/* ==================================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-charcoal-700 p-4 space-y-3">
            <div className="flex items-center justify-between text-white px-2">
              <span className="font-extrabold text-sm">
                CareOrbit Home Health Overview & Spotlight
              </span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/h01W6AoSm4Q?autoplay=1"
                title="CareOrbit Home Health Spotlight"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. QUICK COMPOSE MESSAGE MODAL                                       */}
      {/* ==================================================================== */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Compose Care Team Message
              </h3>
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Clinician:
                </label>
                <select
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 font-medium"
                >
                  <option value="">Select Clinician...</option>
                  <option value="Carla Rania, RN">Carla Rania, RN (Field Nurse)</option>
                  <option value="Melissa Sweeney, RN">Melissa Sweeney, RN (Case Manager)</option>
                  <option value="David Lee, PT">David Lee, PT (Physical Therapist)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Message Body:
                </label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  rows={3}
                  placeholder="Enter message details or clinical instruction..."
                  className="w-full p-3 rounded-xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pearl-200 dark:border-charcoal-700">
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-slate-500 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('compose-message');
                  }
                  setIsComposeModalOpen(false);
                  setComposeMessage('');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
