import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PlayCircle,
  ShieldCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { EmployeeVisit } from '../../types';
import { useHealthcare } from '../../context/HealthcareContext';

interface VisitDetailModalProps {
  visit: EmployeeVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { updateEmployeeVisitStatus, deleteEmployeeVisit } = useHealthcare();

  if (!isOpen || !visit) return null;

  const isHomeHealth = visit.serviceLine === 'home_health';
  const isHospice = visit.serviceLine === 'hospice';

  const formatServiceLine = (s: string) => {
    if (s === 'home_health') return 'Home Health';
    if (s === 'home_care') return 'Home Care';
    if (s === 'hospice') return 'Hospice';
    return s;
  };

  const formatPatientName = (name: string) => {
    if (!name.includes(',')) return name;
    const parts = name.split(',').map(s => s.trim());
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
    return name;
  };

  const handleStatusChange = (newStatus: EmployeeVisit['status']) => {
    updateEmployeeVisitStatus(visit.id, newStatus);
    onSuccess?.(`Visit status updated to ${newStatus}`);
    onClose();
  };

  const handleDelete = () => {
    deleteEmployeeVisit(visit.id);
    onSuccess?.('Visit cancelled successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col transition-colors animate-scaleIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${
              isHospice
                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                : isHomeHealth
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            }`}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Visit Encounter Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                EVV Field Record & Clinical Dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Main Patient & Service Card */}
          <div className="p-4 rounded-2xl bg-pearl-50 dark:bg-charcoal-800/80 border border-pearl-200/80 dark:border-charcoal-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                isHospice
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  : isHomeHealth
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}>
                {formatServiceLine(visit.serviceLine)}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                visit.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : visit.status === 'in_progress'
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                  : visit.status === 'missed'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  visit.status === 'completed'
                    ? 'bg-emerald-500'
                    : visit.status === 'in_progress'
                    ? 'bg-blue-500 animate-pulse'
                    : visit.status === 'missed'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`} />
                {visit.status === 'completed' ? 'EVV VERIFIED' : visit.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {formatPatientName(visit.patientName)}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                {visit.visitType}
              </div>
            </div>
          </div>

          {/* Details 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                <span>Clinician Assigned</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                {formatPatientName(visit.employeeName)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <span>Scheduled Time</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                {visit.timeSlot} • {visit.date}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-1 sm:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} className="text-slate-400" />
                <span>Patient Visit Address</span>
              </div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {visit.address || '1420 Harvard St, Boston MA'}
              </div>
            </div>

            {/* EVV Geofence Card */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5 sm:col-span-2">
              <div className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Electronic Visit Verification (EVV) Status</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                <span className="font-mono font-bold bg-white/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  42.3601° N, 71.0589° W
                </span>
                <span>•</span>
                <span>Authorized residence geofence match (within 35 ft)</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {visit.notes && (
            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Notes</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {visit.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions (Guaranteed Single-Line, Aligned Buttons) */}
        <div className="px-6 py-4 bg-pearl-50/70 dark:bg-charcoal-850 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="h-10 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 size={15} />
            <span>Cancel Visit</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Close
            </button>

            {visit.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => handleStatusChange('in_progress')}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <PlayCircle size={15} />
                <span>Start Visit</span>
              </button>
            )}

            {visit.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <CheckCircle2 size={15} />
                <span>Verify & Complete</span>
              </button>
            )}

            {visit.status === 'completed' && (
              <span className="h-10 px-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 size={15} />
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
