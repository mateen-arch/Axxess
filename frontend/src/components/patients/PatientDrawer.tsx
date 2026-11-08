import React from 'react';
import { X, User, Phone, MapPin, Calendar, HeartPulse, FileText, Activity } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const PatientDrawer: React.FC = () => {
  const { selectedPatient, setSelectedPatient } = useHealthcare();

  if (!selectedPatient) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-charcoal-850 h-full shadow-2xl border-l border-slate-200 dark:border-charcoal-700 flex flex-col justify-between overflow-y-auto">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50/70 dark:bg-charcoal-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
              {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <span className="badge badge-crimson text-xs">
                  {selectedPatient.serviceLine.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                MRN: {selectedPatient.mrn} • Status: {selectedPatient.status.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedPatient(null)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Demographics Card */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Date of Birth</span>
              <strong className="text-slate-800 dark:text-slate-100">{selectedPatient.dob}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Gender</span>
              <strong className="text-slate-800 dark:text-slate-100 capitalize">{selectedPatient.gender}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Admission Date</span>
              <strong className="text-slate-800 dark:text-slate-100">{selectedPatient.admissionDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Assigned Clinician</span>
              <strong className="text-rose-700 dark:text-rose-400 font-bold">{selectedPatient.assignedNurseName || 'Unassigned'}</strong>
            </div>
          </div>

          {/* Diagnosis & Care Plan */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <HeartPulse size={14} className="text-rose-600 dark:text-rose-400" />
              Primary Diagnosis & OASIS
            </h4>
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
              {selectedPatient.primaryDiagnosis}
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-600 dark:text-slate-400" />
              Address & Home Dispatch
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-xs space-y-1.5">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedPatient.address.street}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                {selectedPatient.address.city}, {selectedPatient.address.state} {selectedPatient.address.zipCode}
              </div>
              <div className="flex items-center gap-2 pt-1 text-slate-700 dark:text-slate-200">
                <Phone size={13} className="text-slate-500 dark:text-slate-400" />
                <span>{selectedPatient.phone}</span>
              </div>
            </div>
          </div>

          {/* Next Scheduled Visit */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Next Scheduled Visit
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {selectedPatient.nextScheduledVisit || 'No upcoming visit scheduled'}
                </span>
              </div>
            </div>
            <button className="btn-secondary text-xs py-1 px-2.5">
              Reschedule
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-900/60 flex items-center gap-3">
          <button
            onClick={() => setSelectedPatient(null)}
            className="flex-1 btn-secondary text-xs justify-center"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Opening OASIS Clinical Charting for ${selectedPatient.firstName} ${selectedPatient.lastName}`);
            }}
            className="flex-1 btn-primary text-xs justify-center"
          >
            <FileText size={14} />
            <span>Open EHR Chart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
