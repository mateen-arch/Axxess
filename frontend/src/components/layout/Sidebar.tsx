import React, { useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import {
  House,
  UserCheck,
  CalendarDots,
  UsersFour,
  ChartLineUp,
  ChatCenteredText,
  CheckSquare,
  VideoCamera,
  ClipboardText,
  NotePencil,
  Sparkle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Buildings,
  PlusCircle,
  MagnifyingGlass,
  Question,
  CaretDown,
  CaretRight,
} from '@phosphor-icons/react';
import { AxxessLogo } from '../../assets/AxxessLogo';
import { useHealthcare } from '../../context/HealthcareContext';
import { HOME_HEALTH_NAV_SECTIONS, type HomeHealthNavNode } from '../homehealth/homeHealthNavigation';

// 96px collapsed gives ample room for 46px circular icons with clean frosted glass borders; 304px expanded fits all text labels & badges
const COLLAPSED_WIDTH = 96;
const EXPANDED_WIDTH = 304;
const ICON_TILE_SIZE = 46;

const GLASS_BLUR_STYLE = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
} as const;

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  onAction?: () => void;
}

function NavItemRow({
  item,
  index,
  isActive,
  isOpen,
  onActivate,
  theme,
  trailing,
}: {
  item: NavItemConfig;
  index: number;
  isActive: boolean;
  isOpen: boolean;
  onActivate: () => void;
  theme: 'light' | 'dark';
  trailing?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  useEffect(() => {
    setHovered(false);
  }, [isOpen]);

  const glassTooltipStyle =
    theme === 'dark'
      ? {
        background: 'rgba(20, 20, 24, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }
      : {
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid rgba(220, 220, 230, 0.9)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      };

  return (
    <div className={`relative flex w-full items-center ${isOpen ? 'justify-start' : 'justify-center'}`}>
      {/* Floating Tooltip when Collapsed */}
      <AnimatePresence>
        {!isOpen && hovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-[calc(100%+14px)] z-50 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white/95"
            style={{ ...glassTooltipStyle, ...GLASS_BLUR_STYLE }}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                style={{
                  background: `${item.color}25`,
                  color: item.color,
                  border: `1px solid ${item.color}40`,
                }}
              >
                {item.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          if (item.onAction) {
            item.onAction();
          } else {
            onActivate();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          scale: hovered ? (isOpen ? 1.02 : 1.1) : 1,
          x: hovered ? (isOpen ? 2 : 0) : 0,
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className={`flex items-center cursor-pointer transition-all ${isOpen
          ? 'w-full gap-3 p-1.5 rounded-2xl justify-start'
          : 'w-full p-0 rounded-full justify-center'
          }`}
        style={{
          background: isOpen && isActive
            ? `${item.color}14`
            : isOpen && hovered
              ? theme === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.03)'
              : 'transparent',
          border: isOpen && isActive ? `1px solid ${item.color}35` : '1px solid transparent',
          outline: 'none',
        }}
        aria-label={item.label}
      >
        {/* Colorful Glowing Icon Tile: Circular when Collapsed */}
        <motion.div
          className={`relative flex shrink-0 items-center justify-center transition-all duration-200 ${isOpen ? 'rounded-xl' : 'rounded-full'
            }`}
          style={{
            width: ICON_TILE_SIZE,
            height: ICON_TILE_SIZE,
            minWidth: ICON_TILE_SIZE,
            minHeight: ICON_TILE_SIZE,
            background: isActive ? `${item.color}28` : `${item.color}15`,
            border: `1px solid ${isActive ? `${item.color}55` : `${item.color}24`}`,
            boxShadow: isActive ? `0 0 16px ${item.color}35` : 'none',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, border-radius 0.2s',
          }}
        >
          <Icon
            size={22}
            weight={isActive ? 'fill' : 'regular'}
            style={{ color: item.color }}
          />

          {/* Micro Notification Dot for Collapsed mode */}
          {!isOpen && item.badge && (
            <span
              className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-charcoal-900"
              style={{ background: item.color }}
            />
          )}
        </motion.div>

        {/* Full Text Label & Badge when Expanded */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { duration: 0.2, ease: 'easeOut', delay: 0.04 + index * 0.015 },
              }}
              exit={{ opacity: 0, x: -8, transition: { duration: 0.1 } }}
              className="flex-1 min-w-0 flex items-center justify-between text-left pr-1"
            >
              <span
                className={`truncate text-sm font-bold font-sans ${isActive
                  ? 'font-black'
                  : 'text-slate-800 dark:text-slate-200'
                  }`}
                style={{
                  color: isActive ? item.color : undefined,
                }}
              >
                {item.label}
              </span>

              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {item.badge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 whitespace-nowrap"
                    style={{
                      background: `${item.color}22`,
                      color: item.color,
                      border: `1px solid ${item.color}38`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {trailing}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

interface SidebarProps {
  variant?: 'central' | 'home_health' | 'connect';
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  variant = 'central',
  currentTab = 'dashboard',
  onTabChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [toggleHovered, setToggleHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['home']));
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(new Set(['new', 'lists']));
  const [collapsedHoverSection, setCollapsedHoverSection] = useState<string | null>(null);

  const {
    activeNavTab,
    setActiveNavTab,
    connectModule,
    setConnectModule,
    setCurrentWebsite,
    organization,
    census,
    patients,
    conversations,
    theme,
  } = useHealthcare();

  const widthSpring = useSpring(isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH, {
    stiffness: 280,
    damping: 26,
  });

  function toggle() {
    const next = !isOpen;
    setIsOpen(next);
    widthSpring.set(next ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
    if (!next) {
      setCollapsedHoverSection(null);
    }
  }

  const glassStyle =
    theme === 'dark'
      ? {
        background: 'rgba(20, 20, 24, 0.70)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }
      : {
        background: 'rgba(255, 255, 255, 0.82)',
        border: '1px solid rgba(220, 220, 232, 0.85)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
      };

  const glassFlyoutStyle =
    theme === 'dark'
      ? {
        background: 'rgba(24, 24, 30, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }
      : {
        background: 'rgba(255, 255, 255, 0.98)',
        border: '1px solid rgba(220, 220, 232, 0.95)',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
      };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const homeHealthPatientsCount =
    patients.filter((p) => p.serviceLine === 'home_health').length || 24;

  const isHomeHealth = variant === 'home_health';
  const isConnect = variant === 'connect';

  const productLabel = isHomeHealth ? 'Home Health' : isConnect ? 'Connect' : 'Central';

  // Section icons mapping for Home Health
  const sectionIcons: Record<string, React.ElementType> = {
    home: House,
    create: PlusCircle,
    patients: UsersFour,
    schedule: CalendarDots,
    view: MagnifyingGlass,
    reports: ChartLineUp,
    help: Question,
    'axxess-intelligence': Sparkle,
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleSubsection = (subId: string) => {
    setExpandedSubsections((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  const doesSectionContainTab = (node: HomeHealthNavNode, targetTab: string): boolean => {
    if (node.id === targetTab) return true;
    if (node.children) {
      return node.children.some((child) => doesSectionContainTab(child, targetTab));
    }
    return false;
  };

  // Central Nav Items
  const centralNavItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: House,
      color: '#E11D48',
    },
    {
      id: 'intake',
      label: 'Central Intake',
      icon: UserCheck,
      color: '#E11D48',
      badge: '6',
    },
    {
      id: 'schedule',
      label: 'Schedule Center',
      icon: CalendarDots,
      color: '#E11D48',
    },
    {
      id: 'patients',
      label: 'Patients Directory',
      icon: UsersFour,
      color: '#E11D48',
      badge: `${census.total}`,
    },
    {
      id: 'reports',
      label: 'Reports & Census',
      icon: ChartLineUp,
      color: '#E11D48',
    },
  ];

  // Connect Nav Items
  const connectNavItems: NavItemConfig[] = [
    {
      id: 'connect',
      label: 'Care Team Chat',
      icon: ChatCenteredText,
      color: '#E11D48',
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
      onAction: () => setConnectModule('connect'),
    },
    {
      id: 'planner',
      label: 'Route Planner',
      icon: CheckSquare,
      color: '#E11D48',
      badge: '3',
      onAction: () => setConnectModule('planner'),
    },
    {
      id: 'telehealth',
      label: 'Telehealth Rooms',
      icon: VideoCamera,
      color: '#E11D48',
      badge: 'Live',
      onAction: () => setConnectModule('connect'),
    },
  ];

  return (
    <motion.aside
      style={{ width: widthSpring }}
      className="relative shrink-0 h-screen sticky top-0 p-2 z-40 select-none overflow-visible flex flex-col"
    >
      {/* Frosted Glass Outer Container */}
      <div
        className="relative isolate flex h-full flex-col items-center justify-between overflow-visible rounded-3xl p-3 transition-colors"
        style={glassStyle}
      >
        {/* Pure Glass Blur Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-[-1] rounded-3xl"
          style={GLASS_BLUR_STYLE}
        />

        {/* Top Section: Logo Header + Collapse Button + Agency Status */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Brand Header with Circular Collapse Button */}
          <div
            className={`flex w-full pt-1 px-1 transition-all ${
              isOpen ? 'items-center justify-between' : 'flex-col items-center gap-2.5'
            }`}
          >
            <button
              type="button"
              onClick={() => setCurrentWebsite('hub')}
              className="flex cursor-pointer items-center border-0 bg-transparent p-0"
              aria-label="Return to Portal Hub"
              title="Return to Portal Hub"
            >
              <AxxessLogo size="sm" collapsed={!isOpen} productLabel={productLabel} />
            </button>

            {/* Circular Collapse Toggle Button */}
            <motion.button
              type="button"
              onClick={toggle}
              onMouseEnter={() => setToggleHovered(true)}
              onMouseLeave={() => setToggleHovered(false)}
              animate={{ scale: toggleHovered ? 1.12 : 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center cursor-pointer transition-colors"
              style={{
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                border:
                  theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                outline: 'none',
              }}
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="left"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    <ArrowLeft size={15} weight="bold" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="right"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    <ArrowRight size={15} weight="bold" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Agency Badge / Card */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="agency-expanded"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="w-full p-2.5 rounded-2xl border transition-colors"
                style={{
                  background:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                  borderColor:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <Buildings size={14} className="text-rose-600 dark:text-rose-400" />
                    Agency
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="font-extrabold text-slate-950 dark:text-white text-xs truncate">
                  {organization.name}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between mt-1 font-semibold">
                  <span>ID: {organization.code}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                    {isHomeHealth ? homeHealthPatientsCount : census.total} Active
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="agency-collapsed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center font-black text-xs border self-center shadow-xs shrink-0"
                style={{
                  background: 'rgba(225, 29, 72, 0.14)',
                  borderColor: 'rgba(225, 29, 72, 0.32)',
                  color: '#e11d48',
                }}
                title={organization.name}
              >
                SHC
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="w-full"
            style={{
              height: 1,
              background:
                theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            }}
          />
        </div>

        {/* Center Section: Navigation Items */}
        <div className="flex-1 w-full flex flex-col gap-1.5 overflow-y-auto overflow-x-visible py-2 px-0.5 scrollbar-none">
          <div
            className={`mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
              isOpen ? 'px-2.5' : 'text-center'
            }`}
          >
            {isOpen ? 'Clinical Modules' : '•••'}
          </div>

          {/* ================================================================= */}
          {/* HOME HEALTH VARIANT: Unified Category Headings + Accordion Submenu */}
          {/* ================================================================= */}
          {isHomeHealth ? (
            <div className="flex flex-col gap-1.5">
              {HOME_HEALTH_NAV_SECTIONS.map((section, sIndex) => {
                const IconComponent = sectionIcons[section.id] || Sparkle;
                const isSectionActive = doesSectionContainTab(section, currentTab);
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div
                    key={section.id}
                    className="relative w-full"
                    onMouseEnter={() => {
                      if (!isOpen) setCollapsedHoverSection(section.id);
                    }}
                    onMouseLeave={() => {
                      if (!isOpen) setCollapsedHoverSection(null);
                    }}
                  >
                    {/* Primary Section Tile */}
                    <NavItemRow
                      item={{
                        id: section.id,
                        label: section.label,
                        icon: IconComponent,
                        color: '#E11D48',
                        badge: section.badge,
                      }}
                      index={sIndex}
                      isActive={isSectionActive}
                      isOpen={isOpen}
                      onActivate={() => {
                        if (!isOpen) {
                          setIsOpen(true);
                          widthSpring.set(EXPANDED_WIDTH);
                          setExpandedSections(new Set([section.id]));
                        } else {
                          toggleSection(section.id);
                        }
                      }}
                      theme={theme}
                      trailing={
                        section.children?.length ? (
                          <span className="text-slate-400 dark:text-slate-500">
                            {isExpanded ? (
                              <CaretDown size={14} weight="bold" />
                            ) : (
                              <CaretRight size={14} weight="bold" />
                            )}
                          </span>
                        ) : undefined
                      }
                    />

                    {/* Expanded Accordion Children */}
                    <AnimatePresence initial={false}>
                      {isOpen && isExpanded && section.children && (
                        <motion.div
                          key="accordion"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="overflow-hidden ml-4 pl-3.5 my-1 border-l-2 border-rose-200/50 dark:border-rose-900/40 space-y-1"
                        >
                          {section.children.map((child) => {
                            const hasSubChildren = Boolean(child.children?.length);
                            const isSubExpanded = expandedSubsections.has(child.id);
                            const isChildActive = child.id === currentTab;

                            return (
                              <div key={child.id} className="w-full">
                                {hasSubChildren ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggleSubsection(child.id)}
                                      className="flex w-full items-center justify-between py-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-pearl-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-charcoal-800 transition cursor-pointer"
                                    >
                                      <span className="truncate">{child.label}</span>
                                      <span className="text-slate-400">
                                        {isSubExpanded ? (
                                          <CaretDown size={12} weight="bold" />
                                        ) : (
                                          <CaretRight size={12} weight="bold" />
                                        )}
                                      </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {isSubExpanded && child.children && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.15 }}
                                          className="overflow-hidden ml-2.5 pl-2.5 my-0.5 border-l border-pearl-200 dark:border-charcoal-700 space-y-0.5"
                                        >
                                          {child.children.map((subChild) => {
                                            const isSubActive = subChild.id === currentTab;
                                            return (
                                              <button
                                                key={subChild.id}
                                                type="button"
                                                onClick={() => onTabChange?.(subChild.id)}
                                                className={`flex w-full items-center justify-between py-1 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                                                  isSubActive
                                                    ? 'bg-rose-50 font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                                                    : 'font-medium text-slate-600 hover:bg-pearl-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-charcoal-800 dark:hover:text-slate-200'
                                                }`}
                                              >
                                                <span className="truncate">{subChild.label}</span>
                                                {subChild.badge && (
                                                  <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                                    {subChild.badge}
                                                  </span>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onTabChange?.(child.id)}
                                    className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition cursor-pointer ${
                                      isChildActive
                                        ? 'bg-rose-50 font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                                        : 'font-semibold text-slate-700 hover:bg-pearl-100/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-charcoal-800 dark:hover:text-white'
                                    }`}
                                  >
                                    <span className="truncate">{child.label}</span>
                                    {child.badge && (
                                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                        {child.badge}
                                      </span>
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Collapsed Mode Floating Flyout Popover */}
                    <AnimatePresence>
                      {!isOpen && collapsedHoverSection === section.id && (
                        <motion.div
                          key="flyout"
                          initial={{ opacity: 0, x: -10, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-[calc(100%+14px)] top-0 z-50 w-64 max-h-[82vh] overflow-y-auto rounded-2xl p-2.5 backdrop-blur-2xl transition-colors scrollbar-none"
                          style={{ ...glassFlyoutStyle, ...GLASS_BLUR_STYLE }}
                        >
                          <div className="flex items-center gap-2 px-2 pb-2 mb-1.5 border-b border-pearl-200/80 dark:border-charcoal-700">
                            <IconComponent size={16} weight="fill" className="text-rose-600" />
                            <span className="text-xs font-black text-slate-950 dark:text-white">
                              {section.label}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {section.children?.map((child) => (
                              <div key={child.id}>
                                {child.children ? (
                                  <div className="pt-1.5 pb-0.5">
                                    <div className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      {child.label}
                                    </div>
                                    <div className="mt-1 space-y-0.5 pl-1.5">
                                      {child.children.map((sub) => (
                                        <button
                                          key={sub.id}
                                          type="button"
                                          onClick={() => {
                                            setCollapsedHoverSection(null);
                                            onTabChange?.(sub.id);
                                          }}
                                          className={`flex w-full items-center justify-between py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                            sub.id === currentTab
                                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold'
                                              : 'text-slate-700 hover:bg-pearl-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-charcoal-800 dark:hover:text-white'
                                          }`}
                                        >
                                          <span className="truncate">{sub.label}</span>
                                          {sub.badge && (
                                            <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                              {sub.badge}
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCollapsedHoverSection(null);
                                      onTabChange?.(child.id);
                                    }}
                                    className={`flex w-full items-center justify-between py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                      child.id === currentTab
                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                        : 'text-slate-700 hover:bg-pearl-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-charcoal-800 dark:hover:text-white'
                                    }`}
                                  >
                                    <span className="truncate">{child.label}</span>
                                    {child.badge && (
                                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                        {child.badge}
                                      </span>
                                    )}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : isConnect ? (
            /* ================================================================= */
            /* CONNECT VARIANT: Authentic 3 Headings                              */
            /* ================================================================= */
            connectNavItems.map((item, index) => (
              <NavItemRow
                key={item.id}
                item={item}
                index={index}
                isActive={connectModule === item.id}
                isOpen={isOpen}
                onActivate={() => setConnectModule(item.id as any)}
                theme={theme}
              />
            ))
          ) : (
            /* ================================================================= */
            /* CENTRAL VARIANT: Authentic Central Headings                       */
            /* ================================================================= */
            centralNavItems.map((item, index) => (
              <NavItemRow
                key={item.id}
                item={item}
                index={index}
                isActive={activeNavTab === item.id}
                isOpen={isOpen}
                onActivate={() => setActiveNavTab(item.id)}
                theme={theme}
              />
            ))
          )}
        </div>

        {/* Bottom Section: User Profile Only */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <div
            className="w-full"
            style={{
              height: 1,
              background:
                theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            }}
          />

          {/* User Profile Card */}
          {isOpen ? (
            <div
              className="flex items-center gap-2.5 p-2 rounded-2xl border transition-colors"
              style={{
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                borderColor:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {isHomeHealth ? 'HM' : 'AN'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-charcoal-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-slate-950 dark:text-white truncate flex items-center gap-1">
                  {isHomeHealth ? 'Hilder M., RN' : 'Alexandria Nelson'}
                  <ShieldCheck
                    size={14}
                    className="text-rose-600 dark:text-rose-400 shrink-0"
                    weight="fill"
                  />
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate">
                  Clinical Supervisor
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex justify-center py-1"
              title={
                isHomeHealth
                  ? 'Hilder M., RN (Clinical Supervisor)'
                  : 'Alexandria Nelson (Clinical Supervisor)'
              }
            >
              <div className="relative shrink-0">
                <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {isHomeHealth ? 'HM' : 'AN'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-charcoal-900" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
