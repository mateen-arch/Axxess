import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  Activity,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Info,
  SlidersHorizontal,
  Bookmark,
  ShieldCheck,
  Stethoscope,
  Download
} from 'lucide-react';
import { api } from '../../services/api';

interface ReportCenterViewProps {
  onBack?: () => void;
  onNavigate?: (tabId: string) => void;
  brandTitle?: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  icon: string;
  isActive: boolean;
  reportCount: number;
}

export interface ReportItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  name: string;
  slug: string;
  description: string;
  route: string | null;
  displayOrder: number;
  isActive: boolean;
  isImplemented: boolean;
}

export const ReportCenterView: React.FC<ReportCenterViewProps> = ({
  onBack,
  onNavigate,
  brandTitle = 'CareOrbit Home Health'
}) => {
  // State
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected report for detail/preview dialog (when no live route yet)
  const [selectedReportForModal, setSelectedReportForModal] = useState<ReportItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch categories and reports from backend on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catRes, repRes] = await Promise.all([
        api.getReportCenterCategories(),
        api.getReportCenterReports()
      ]);

      if (catRes && catRes.categories) {
        setCategories(catRes.categories);
      }
      if (repRes && repRes.reports) {
        setReports(repRes.reports);
      }
    } catch (err: any) {
      console.error('Error loading report center data:', err);
      showToast(err.message || 'Failed to load report center catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered reports by Category and Search
  const filteredReports = useMemo(() => {
    let result = reports;

    // Filter by Category
    if (selectedCategorySlug !== 'all') {
      result = result.filter(r => r.categorySlug === selectedCategorySlug);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [reports, selectedCategorySlug, searchQuery]);

  // Handle report item click
  const handleReportClick = (report: ReportItem) => {
    if (report.route && onNavigate) {
      onNavigate(report.route);
    } else {
      setSelectedReportForModal(report);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'patient-reports':
        return <Users size={16} className="text-indigo-600 dark:text-indigo-400" />;
      case 'schedule-reports':
        return <Calendar size={16} className="text-rose-600 dark:text-rose-400" />;
      case 'employee-reports':
        return <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'clinician-reports':
        return <Stethoscope size={16} className="text-purple-600 dark:text-purple-400" />;
      default:
        return <Layers size={16} className="text-slate-600 dark:text-slate-400" />;
    }
  };

  // Category Badge color helper
  const getCategoryBadgeClass = (slug: string) => {
    switch (slug) {
      case 'patient-reports':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
      case 'schedule-reports':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      case 'employee-reports':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'clinician-reports':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      default:
        return 'bg-pearl-100 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300 border-pearl-200 dark:border-charcoal-600';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pearl-100 dark:bg-charcoal-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Segment (Consistent with CareOrbit & Axxess Home Health) */}
      <div className="bg-white/90 dark:bg-charcoal-850/90 border-b border-pearl-200 dark:border-charcoal-700 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <span>{brandTitle.toUpperCase()}</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span>REPORTS</span>
              <span className="text-pearl-400 dark:text-charcoal-600">/</span>
              <span className="text-slate-900 dark:text-white font-extrabold">Report Center</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Standards Home Care • Centralized Operational & Clinical Intelligence
            </div>
          </div>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-72 sm:w-88">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 61 reports by name or category..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            title="Refresh Report Catalog from Database"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-rose-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('completed-reports')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
              title="View Completed Reports Archive"
            >
              <Download size={13} className="text-rose-600 dark:text-rose-400" />
              <span className="hidden md:inline">Completed Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        {/* 2. Four Category Navigation Tabs */}
        <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-rose-600 dark:text-rose-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Report Categories
              </h2>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Stored & managed in PostgreSQL database • Admin panel compatible
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Reports Tab */}
            <button
              type="button"
              onClick={() => setSelectedCategorySlug('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategorySlug === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-pearl-50 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-700'
              }`}
            >
              <FileText size={14} />
              <span>All Reports</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategorySlug === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
              }`}>
                {reports.length}
              </span>
            </button>

            {/* 4 Distinct Category Tabs */}
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-pearl-50 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-700'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : ''}>
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span>{cat.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.reportCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search & Results Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{' '}
            <strong className="font-black text-slate-800 dark:text-slate-100">
              {filteredReports.length}
            </strong>{' '}
            of <strong className="font-black text-slate-800 dark:text-slate-100">{reports.length}</strong> reports
            {selectedCategorySlug !== 'all' && (
              <span>
                {' '}in{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
                  {categories.find(c => c.slug === selectedCategorySlug)?.name}
                </strong>
              </span>
            )}
            {searchQuery && (
              <span>
                {' '}matching &quot;<span className="font-bold text-slate-700 dark:text-slate-200">{searchQuery}</span>&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Direct Page Route</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-charcoal-600"></span>
              <span>Template Specification</span>
            </span>
          </div>
        </div>

        {/* 4. Report Grid Display */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850">
            <RefreshCw size={28} className="animate-spin text-rose-600 mx-auto mb-2" />
            <p className="font-semibold text-xs">Loading database report catalog...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 p-6">
            <Filter size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3 stroke-[1.5]" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No reports found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No report names in &quot;{categories.find(c => c.slug === selectedCategorySlug)?.name || 'All Categories'}&quot; match your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategorySlug('all');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 text-xs font-bold text-slate-700 hover:text-rose-600 transition cursor-pointer"
            >
              Clear Search & Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredReports.map((report) => {
              const hasRoute = Boolean(report.route && report.isImplemented);
              return (
                <div
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  className="group relative rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 p-4 transition-all duration-200 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800/80 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Category Pill & Route Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(report.categorySlug)}`}>
                        {report.categoryName}
                      </span>

                      {hasRoute ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={10} />
                          <span>Live Page</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-pearl-100 dark:bg-charcoal-750 px-2 py-0.5 rounded-full">
                          <span>Template</span>
                        </span>
                      )}
                    </div>

                    {/* Report Name */}
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors leading-snug">
                      {report.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="mt-4 pt-3 border-t border-pearl-100 dark:border-charcoal-750 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-rose-600">
                    <span>{hasRoute ? 'Open Report' : 'View Specification'}</span>
                    <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Report Specification Modal (for reports without dedicated live route yet) */}
      {selectedReportForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 max-w-lg w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Report Specification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 space-y-3.5">
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${getCategoryBadgeClass(selectedReportForModal.categorySlug)}`}>
                  {selectedReportForModal.categoryName}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedReportForModal.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedReportForModal.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Database Slug:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {selectedReportForModal.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Admin Managed:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yes (PostgreSQL)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Registered Template
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">
                  This report definition is stored dynamically in the agency database. It is registered for future administration via the Admin Panel and queued for live dashboard rendering.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={async () => {
                  if (!selectedReportForModal) return;
                  setIsGenerating(true);
                  try {
                    await api.requestGenerateReport({
                      reportId: selectedReportForModal.id,
                      reportName: selectedReportForModal.name,
                      categoryName: selectedReportForModal.categoryName,
                      format: 'XLSX',
                      filters: { trigger: 'Manual Dispatch from Report Center' }
                    });
                    showToast(`Report "${selectedReportForModal.name}" generated & archived!`);
                    setSelectedReportForModal(null);
                    if (onNavigate) {
                      onNavigate('completed-reports');
                    }
                  } catch (err: any) {
                    showToast(err.message || 'Failed to dispatch generation');
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                <Download size={13} />
                <span>{isGenerating ? 'Generating...' : 'Generate & Archive'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReportForModal(null)}
                  className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Template registered for ${selectedReportForModal.name}`);
                    setSelectedReportForModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
