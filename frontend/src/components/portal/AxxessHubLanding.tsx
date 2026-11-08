import React from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  MessageSquareText,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sun,
  UsersRound,
  Workflow,
} from 'lucide-react';
import { AxxessLogo } from '../../assets/AxxessLogo';
import { useHealthcare } from '../../context/HealthcareContext';
import { Healthcare3DHero } from './Healthcare3DHero';
import './AxxessHubLanding.css';

type WorkspaceId = 'central' | 'connect' | 'home_health';

export const AxxessHubLanding: React.FC = () => {
  const {
    setCurrentWebsite,
    organization,
    census,
    scheduledSummary,
    theme,
    toggleTheme,
    unreadCount,
  } = useHealthcare();

  const workspaces = [
    {
      id: 'central' as WorkspaceId,
      number: '01',
      title: 'Axxess Central',
      category: 'Operations & intake',
      badge: 'Available now',
      icon: Building2,
      description: 'Your command center for census, referrals, patient records, schedules, and reporting.',
      features: ['Referral pipeline', 'Patient charts', 'Schedule & reports'],
      metric: `${census.total} active patients`,
      action: 'Open Central',
      tone: 'central',
      comingSoon: false,
    },
    {
      id: 'connect' as WorkspaceId,
      number: '02',
      title: 'Axxess Connect',
      category: 'Care team & planning',
      badge: 'Available now',
      icon: MessageSquareText,
      description: 'Keep your interdisciplinary team in sync with secure messaging, calls, and field plans.',
      features: ['Care team messaging', 'Telehealth calls', 'Visit route planner'],
      metric: `${unreadCount} team messages`,
      action: 'Open Connect',
      tone: 'connect',
      comingSoon: false,
    },
    {
      id: 'home_health' as WorkspaceId,
      number: '03',
      title: 'Axxess Home Health',
      category: 'Clinical EHR & Operations',
      badge: 'Available now',
      icon: Stethoscope,
      description: 'The comprehensive clinical EHR and point-of-care platform for Standards Home Care. Clinical dashboard, patient encounters, OASIS-E engine, and schedule tasks.',
      features: ['Clinical charting', 'OASIS-E guidance', 'Schedule tasks & Recerts'],
      metric: 'Clinical EHR Live',
      action: 'Open Home Health',
      tone: 'home-health',
      comingSoon: false,
    },
  ];

  const launchWorkspace = (id: WorkspaceId) => setCurrentWebsite(id);

  return (
    <div className="portal-site">
      <header className="portal-header">
        <a className="portal-brand" href="#top" aria-label="Axxess home">
          <AxxessLogo size="sm" />
        </a>

        <nav className="portal-nav" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#products">Workspaces</a>
          <a href="#care-flow">Care delivery</a>
        </nav>

        <div className="portal-header-actions">
          <span className="portal-header-status"><span /> Standards Home Care</span>
          <button
            className="portal-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="portal-header-cta" type="button" onClick={() => launchWorkspace('central')}>
            <span>Open workspace</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="portal-hero" id="platform" aria-labelledby="portal-hero-title">
          <div className="portal-hero-backdrop" aria-hidden="true">
            <Healthcare3DHero />
            <div className="portal-hero-wash" />
            <div className="portal-hero-grain" />
          </div>

          <div className="portal-hero-inner">
            <div className="portal-hero-copy">
              <div className="portal-eyebrow"><span className="portal-eyebrow-icon"><HeartPulse size={14} /></span> Connected care, made clearer</div>
              <h1 id="portal-hero-title">A better way<br />to <span>care together.</span></h1>
              <p className="portal-hero-description">
                Bring your care operations into focus. Axxess connects the people, plans, and details behind every home health journey.
              </p>
              <div className="portal-hero-buttons">
                <button className="portal-button-primary" type="button" onClick={() => launchWorkspace('central')}>
                  Explore Axxess Central <ArrowRight size={17} />
                </button>
                <a className="portal-button-link" href="#products">Meet the platform <ArrowDown size={16} /></a>
              </div>
              <div className="portal-hero-proof">
                <div className="portal-avatar-stack" aria-hidden="true">
                  <span>RN</span><span>PT</span><span>CM</span>
                </div>
                <div><strong>One team, in sync</strong><small>From intake to the next visit</small></div>
                <div className="portal-proof-divider" />
                <div className="portal-live-label"><span /> Live care network</div>
              </div>
            </div>

            <div className="portal-hero-visual" aria-label="Axxess operations dashboard preview">
              <div className="portal-preview-card">
                <div className="portal-preview-topbar">
                  <div className="portal-preview-brand"><span className="portal-preview-mark"><Activity size={14} /></span><span>Axxess <b>Central</b></span></div>
                  <span className="portal-preview-network"><i />Care network</span>
                </div>
                <div className="portal-preview-heading">
                  <div><span className="portal-preview-overline">YOUR OPERATIONS AT A GLANCE</span><h2>Good morning, Hilder</h2></div>
                  <span className="portal-preview-user">HM</span>
                </div>
                <div className="portal-preview-kpis">
                  <div className="portal-preview-kpi">
                    <span>Active census</span><strong>{census.total}</strong><small><span className="portal-kpi-trend">↗</span> Patients in care</small>
                  </div>
                  <div className="portal-preview-kpi">
                    <span>Visits to assign</span><strong>{scheduledSummary.unassigned}</strong><small>Across your team</small>
                  </div>
                  <div className="portal-preview-kpi">
                    <span>30 day visits</span><strong>{scheduledSummary.completed}</strong><small><span className="portal-kpi-trend">↗</span> Completed</small>
                  </div>
                </div>
                <div className="portal-preview-chart">
                  <div className="portal-preview-chart-title"><span>Care activity</span><span className="portal-chart-period">This week <ChevronRight size={12} /></span></div>
                  <svg viewBox="0 0 480 105" role="presentation" preserveAspectRatio="none">
                    <defs><linearGradient id="portalChartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#e11d48" stopOpacity=".22" /><stop offset="100%" stopColor="#e11d48" stopOpacity="0" /></linearGradient></defs>
                    <path className="portal-chart-area" d="M0 80 C30 77 36 60 70 65 S110 77 142 56 184 61 211 44 251 57 282 38 320 49 350 28 389 39 420 22 456 28 480 12 L480 105 L0 105Z" />
                    <path className="portal-chart-line" d="M0 80 C30 77 36 60 70 65 S110 77 142 56 184 61 211 44 251 57 282 38 320 49 350 28 389 39 420 22 456 28 480 12" />
                    <circle cx="420" cy="22" r="4" className="portal-chart-point" />
                  </svg>
                  <div className="portal-preview-chart-days"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>
                </div>
                <div className="portal-preview-footer">
                  <span className="portal-preview-status"><span /> All systems are running smoothly</span>
                  <span>Updated just now</span>
                </div>
              </div>

              <div className="portal-float-card portal-float-visits">
                <span className="portal-float-icon"><CalendarDays size={17} /></span>
                <span><small>Today’s schedule</small><strong>Care in motion</strong></span>
                <span className="portal-float-check"><Check size={13} /></span>
              </div>
              <div className="portal-float-card portal-float-team">
                <span className="portal-team-avatars"><i>AM</i><i>JT</i><i>+4</i></span>
                <span><small>Care team</small><strong>Connected</strong></span>
                <span className="portal-team-live" />
              </div>
            </div>
          </div>

          <div className="portal-hero-bottom">
            <span>Built around the moments that matter</span>
            <span className="portal-scroll-indicator"><span /> Scroll to explore</span>
          </div>
        </section>

        <section className="portal-trust-strip" aria-label="Axxess platform capabilities">
          <div className="portal-trust-intro"><span>THE AXXESS PLATFORM</span><strong>Every part of care,<br className="portal-trust-break" /> working together.</strong></div>
          <div className="portal-trust-item"><span className="portal-trust-icon rose"><Workflow size={18} /></span><div><strong>One connected flow</strong><small>Across care operations</small></div></div>
          <div className="portal-trust-item"><span className="portal-trust-icon teal"><UsersRound size={18} /></span><div><strong>Teams in sync</strong><small>Wherever care happens</small></div></div>
          <div className="portal-trust-item"><span className="portal-trust-icon amber"><ShieldCheck size={18} /></span><div><strong>Built for confidence</strong><small>Clear, reliable workflows</small></div></div>
        </section>

        <section className="portal-section portal-workspaces" id="products">
          <div className="portal-section-heading">
            <div>
              <span className="portal-section-kicker">YOUR WORKSPACES</span>
              <h2>Everything you need,<br /><span>right where you need it.</span></h2>
            </div>
            <p>Purpose-built tools for the work behind great care. Move between each workspace as your day unfolds.</p>
          </div>

          <div className="portal-workspace-grid">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;
              return (
                <article className={`portal-workspace-card ${workspace.tone}`} key={workspace.id}>
                  <div className="portal-card-topline"><span>{workspace.number} / WORKSPACE</span><span className={`portal-workspace-badge ${workspace.comingSoon ? 'soon' : ''}`}><i />{workspace.badge}</span></div>
                  <div className="portal-workspace-icon"><Icon size={22} strokeWidth={1.8} /></div>
                  <span className="portal-workspace-category">{workspace.category}</span>
                  <h3>{workspace.title}</h3>
                  <p className="portal-workspace-description">{workspace.description}</p>
                  <div className="portal-workspace-features">
                    {workspace.features.map((feature) => <span key={feature}><CheckCircle2 size={15} />{feature}</span>)}
                  </div>
                  <div className="portal-workspace-card-bottom">
                    <span className="portal-workspace-metric"><span />{workspace.metric}</span>
                    <button type="button" onClick={() => launchWorkspace(workspace.id)} aria-label={`${workspace.action}: ${workspace.title}`}>
                      {workspace.action}<ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="portal-care-flow" id="care-flow">
          <div className="portal-care-flow-copy">
            <span className="portal-section-kicker">A CLEARER VIEW OF CARE</span>
            <h2>From the first<br />hello to <span>every follow-through.</span></h2>
            <p>Keep the details connected across the moments your team manages every day. The right information stays close, so your people can stay focused on care.</p>
            <a href="#products" className="portal-inline-link">Explore the workspaces <ArrowRight size={16} /></a>
          </div>
          <div className="portal-flow-steps">
            <div className="portal-flow-rail"><span /><i /><i /><i /></div>
            <article className="portal-flow-step"><span className="portal-flow-number">01</span><div className="portal-flow-icon"><MessageSquareText size={18} /></div><div><h3>Welcome every referral</h3><p>Bring new inquiries and referral details into one clear intake view.</p></div><span className="portal-flow-state">Intake</span></article>
            <article className="portal-flow-step"><span className="portal-flow-number">02</span><div className="portal-flow-icon"><Activity size={18} /></div><div><h3>Coordinate the next step</h3><p>Keep patient records, team conversations, and scheduling in reach.</p></div><span className="portal-flow-state">Coordinate</span></article>
            <article className="portal-flow-step"><span className="portal-flow-number">03</span><div className="portal-flow-icon"><CheckCircle2 size={18} /></div><div><h3>Close the loop with confidence</h3><p>See the day’s activity clearly and keep your team moving together.</p></div><span className="portal-flow-state">Follow through</span></article>
          </div>
        </section>

        <section className="portal-cta-band">
          <div className="portal-cta-decoration" aria-hidden="true"><span /><span /><span /></div>
          <div className="portal-cta-content"><span className="portal-section-kicker">MADE FOR YOUR TEAM</span><h2>Care works better<br />when we work <em>together.</em></h2></div>
          <button className="portal-button-primary" type="button" onClick={() => launchWorkspace('central')}>Open your workspace <ArrowUpRight size={17} /></button>
        </section>
      </main>

      <footer className="portal-footer">
        <div className="portal-footer-main"><AxxessLogo size="sm" /><span className="portal-footer-divider" /><span>Connected care for every day.</span></div>
        <div className="portal-footer-meta"><span>{organization.name}</span><span>Release {organization.releaseVersion}</span><span><Clock3 size={13} /> Dallas, Texas</span></div>
        <span className="portal-footer-copy">© 2026 Axxess. All rights reserved.</span>
      </footer>
    </div>
  );
};
