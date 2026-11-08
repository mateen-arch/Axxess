import React from 'react';
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  Sparkles,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';

type HomeHealthPage = string;

const pageContent: Record<
  string,
  { title: string; description: string; icon: React.ElementType; features: string[] }
> = {
  'patient-charts': {
    title: 'Patient Charts & Roster',
    description:
      'A dedicated Home Health patient workspace is currently in development for clinical chart reviews, plan of care documentation, and episode histories.',
    icon: Users,
    features: ['Comprehensive patient roster', 'OASIS chart integration', 'Episode timeline view'],
  },
  'pending-admissions': {
    title: 'Pending Admissions',
    description:
      'Track referral intakes and pre-admission documentation awaiting clinical supervisor review.',
    icon: ClipboardList,
    features: ['Intake verification', 'Physician certification readiness', 'Care team assignment'],
  },
  'my-schedule-tasks': {
    title: 'My Schedule & Tasks',
    description:
      'A streamlined field clinician schedule for daily visit tracking, visit verification, and route optimization.',
    icon: CalendarClock,
    features: ['Daily visit schedule', 'EVV visit verification', 'Field task checklist'],
  },
  'schedule-center': {
    title: 'Schedule Center',
    description:
      'Agency-wide multi-discipline scheduler with drag-and-drop clinician reassignment and branch filters.',
    icon: Calendar,
    features: ['Multi-clinician calendar', 'Discipline filtering (SN, PT, OT, ST, MSW, HHA)', 'Conflict alerts'],
  },
  'report-center': {
    title: 'Report Center',
    description:
      'Standard CMS cost reports, clinical quality measures, census statistics, and OASIS export logs.',
    icon: Activity,
    features: ['CMS cost reports', 'Clinical quality measures', 'Census & utilization analytics'],
  },
  'upcoming-recerts': {
    title: 'Upcoming Recertifications',
    description:
      'Monitor 60-day episode expiration dates, recertification assessment deadlines, and MD signature tracking.',
    icon: FileCheck2,
    features: ['60-day episode tracker', 'Recert assessment alerts', 'MD order compliance'],
  },
  'past-due-recertifications-report': {
    title: 'Past Due Recertifications Report',
    description:
      'Audit overdue recertifications and manage immediate corrective actions for Medicare compliance.',
    icon: FileText,
    features: ['Overdue episode tracking', 'Compliance audit log', 'Supervisor alert triggers'],
  },
  'qa-center': {
    title: 'Quality Assurance (QA) Center',
    description:
      'Clinical QA approval queue for OASIS assessments, clinician notes, and physician orders.',
    icon: ShieldCheck,
    features: ['OASIS scrubber findings', 'Clinical documentation review', 'Approval workflow'],
  },
  'blank-forms': {
    title: 'Blank Forms Library',
    description:
      'Printable and digital blank clinical forms, consent documents, and emergency care kits.',
    icon: Layers,
    features: ['Admission form packets', 'Emergency disaster plans', 'Patient consent forms'],
  },
  'help-center': {
    title: 'Help Center & Documentation',
    description:
      'Knowledge base, regulatory guides, video tutorials, and Axxess compliance handbooks.',
    icon: HelpCircle,
    features: ['Step-by-step guides', 'Video walkthroughs', 'CMS regulation updates'],
  },
  'ask-axxess': {
    title: 'Ask Axxess (AI Assistant)',
    description:
      'Clinical generative AI assistant designed to summarize complex chart histories, OASIS responses, and Medicare guidelines.',
    icon: Sparkles,
    features: ['Clinical summarization', 'OASIS guidance', 'Policy & protocol lookup'],
  },
};

function humanize(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const HomeHealthComingSoon: React.FC<{
  page: HomeHealthPage;
  title?: string;
  onBack: () => void;
}> = ({ page, title, onBack }) => {
  const displayTitle = title || humanize(page);
  const matched = pageContent[page];

  const content = matched || {
    title: displayTitle,
    description: `The ${displayTitle} module is scheduled for implementation. We are designing it specifically for Axxess Home Health workflows.`,
    icon: Sparkles,
    features: [
      'Built for modern Home Health workflows',
      'Unified with your agency database',
      'Coming in upcoming iteration',
    ],
  };

  const Icon = content.icon;

  return (
    <section
      className="mx-auto flex min-h-[min(680px,calc(100vh-190px))] w-full max-w-4xl items-center justify-center py-8 px-4"
      aria-labelledby="home-health-coming-title"
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-pearl-200 bg-white p-7 shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850 sm:p-12 transition-colors">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/5" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/5" />

        <div className="relative max-w-2xl">
          {/* Module Icon Tile */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 shadow-2xs">
            <Icon size={26} strokeWidth={1.8} />
          </div>

          {/* Status Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.12em] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Home Health Module • Coming Soon
          </div>

          <h1
            id="home-health-coming-title"
            className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            {content.title}
          </h1>

          <p className="mt-3.5 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            {content.description}
          </p>

          {/* Planned Features */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {content.features.map((feature, index) => (
              <div
                key={feature}
                className="rounded-2xl border border-pearl-200 bg-pearl-50/80 p-3.5 dark:border-charcoal-700 dark:bg-charcoal-800/70"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="text-[10px] font-black tracking-widest text-rose-600 dark:text-rose-400">
                    PHASE 0{index + 1}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* Action Back Button */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-extrabold text-white shadow-xs transition hover:-translate-y-0.5 hover:bg-rose-700 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
