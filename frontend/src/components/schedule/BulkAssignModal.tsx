import React, { useState } from 'react';
import { X, Users, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { UnassignedPatientVisit } from '../../types';

interface BulkAssignModalProps {
  selectedVisits: UnassignedPatientVisit[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  selectedVisits,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { clinicians, bulkAssignVisits } = useHealthcare();
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>(clinicians[0]?.id || '');

  if (!isOpen || selectedVisits.length === 0) return null;

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinicianId) return;

    const clinician = clinicians.find(c => c.id === selectedClinicianId);
    if (!clinician) return;

    const visitIds = selectedVisits.map(v => v.id);
    bulkAssignVisits(visitIds, clinician.id);

    onSuccess(`Successfully batch-assigned ${selectedVisits.length} field visits to ${clinician.name}, ${clinician.credentials}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shadow-2xs">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Bulk Assign ({selectedVisits.length} Visits)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatch multiple unassigned visits to a single field staff member
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

        {/* Content */}
        <form onSubmit={handleBulkAssign} className="p-6 space-y-4">
          {/* Selected Visits Summary */}
          <div className="p-3.5 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Selected Encounters to Reassign:
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {selectedVisits.map(v => (
                <div key={v.id} className="text-xs flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200/50 dark:border-charcoal-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{v.task}</span>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">{v.patientName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Target Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to Clinician <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClinicianId}
              onChange={e => setSelectedClinicianId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              {clinicians.filter(c => c.status === 'active').map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.credentials} ({c.title} • {c.branch})
                </option>
              ))}
            </select>
          </div>

          {/* Warning / Confirmation note */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              All {selectedVisits.length} visits will immediately populate on the chosen clinician's mobile EVV schedule and electronic calendar.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm hover:shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Confirm Batch Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

