import React, { useState } from 'react';
import { X, UserCheck, Stethoscope, MapPin, Calendar, Clock, AlertCircle, Phone, Award, CheckCircle2 } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { UnassignedPatientVisit, EmployeeClinician } from '../../types';

interface AssignClinicianModalProps {
  visit: UnassignedPatientVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AssignClinicianModal: React.FC<AssignClinicianModalProps> = ({
  visit,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { clinicians, assignVisitToClinician, employeeVisits } = useHealthcare();
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('');
  const [filterCred, setFilterCred] = useState<string>('all');

  if (!isOpen || !visit) return null;

  // Filter clinicians based on credentials or status
  const filteredClinicians = clinicians.filter(c => {
    if (c.status !== 'active') return false;
    if (filterCred === 'all') return true;
    return c.credentials === filterCred;
  });

  const handleAssign = (clinicianId: string) => {
    const clinician = clinicians.find(c => c.id === clinicianId);
    if (!clinician) return;

    assignVisitToClinician(visit.id, clinician.id);
    onSuccess(`Assigned ${visit.task} for ${visit.patientName} to ${clinician.name}, ${clinician.credentials}`);
    onClose();
  };

  const formatServiceLine = (s: string) => {
    if (s === 'home_health') return 'Home Health';
    if (s === 'home_care') return 'Home Care';
    if (s === 'hospice') return 'Hospice';
    return s;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shadow-2xs">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Dispatch & Assign Clinician
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match unassigned field visit to credentialed healthcare staff
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Visit Context Card */}
          <div className="p-4 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  visit.serviceLine === 'home_health'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : visit.serviceLine === 'home_care'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                }`}>
                  {formatServiceLine(visit.serviceLine)}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Required: {visit.requiredCredentials}
                </span>
              </div>

              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                visit.priority === 'urgent' || visit.priority === 'stat' || visit.priority === 'critical'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-700 dark:text-slate-300'
              }`}>
                {visit.priority.toUpperCase()}
              </span>
            </div>

            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {visit.task}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                Patient: <span className="font-extrabold text-slate-900 dark:text-white">{visit.patientName}</span> ({visit.patientMrn})
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-pearl-200/60 dark:border-charcoal-700">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-rose-500" />
                <span>{visit.dayOfWeek}, {visit.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-500" />
                <span>{visit.timeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin size={13} className="text-emerald-500 shrink-0" />
                <span className="truncate">{visit.patientAddress}</span>
              </div>
            </div>

            {visit.notes && (
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-charcoal-900/60 text-[11px] text-slate-600 dark:text-slate-300 italic border border-pearl-200/50 dark:border-charcoal-750">
                "{visit.notes}"
              </div>
            )}
          </div>

          {/* Clinician Selector Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Available Clinician
              </label>

              {/* Credential Quick Filter */}
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className="text-slate-400 mr-1">Filter:</span>
                {['all', 'RN', 'LPN', 'PT', 'HHA'].map(cred => (
                  <button
                    key={cred}
                    type="button"
                    onClick={() => setFilterCred(cred)}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      filterCred === cred
                        ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                        : 'bg-pearl-100 dark:bg-charcoal-750 text-slate-600 dark:text-slate-300 hover:bg-pearl-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {cred === 'all' ? 'All' : cred}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinician Roster Grid */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {filteredClinicians.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-pearl-50 dark:bg-charcoal-800 rounded-2xl">
                  No clinicians found matching the selected credential.
                </div>
              ) : (
                filteredClinicians.map(clinician => {
                  const currentCaseload = employeeVisits.filter(v => v.employeeId === clinician.id && v.date === visit.scheduledDate).length;
                  const isRecommended = clinician.credentials === visit.requiredCredentials;

                  return (
                    <div
                      key={clinician.id}
                      className="p-3.5 rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          isRecommended
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-600'
                        }`}>
                          {clinician.credentials}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {clinician.name}
                            </span>
                            {isRecommended && (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-wide uppercase">
                                Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {clinician.title} • {clinician.branch}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Phone: {clinician.phone}</span>
                            <span>•</span>
                            <span className="font-mono">{currentCaseload} visits on this date</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAssign(clinician.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-extrabold shadow-sm hover:shadow-rose-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <UserCheck size={14} />
                        <span>Assign</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-pearl-50 dark:bg-charcoal-800 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

