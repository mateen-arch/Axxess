import React, { useState } from 'react';
import { X, Search, Check, UserCheck, Calendar, Clock, AlertCircle } from 'lucide-react';
import { PatientChartTask, EmployeeClinician } from '../../types';
import { useHealthcare } from '../../context/HealthcareContext';

interface ReassignTaskModalProps {
  isOpen: boolean;
  task: PatientChartTask | null;
  patientName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ReassignTaskModal: React.FC<ReassignTaskModalProps> = ({
  isOpen,
  task,
  patientName,
  onClose,
  onSuccess,
}) => {
  const { clinicians, reassignPatientTask } = useHealthcare();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('');

  if (!isOpen || !task) return null;

  // Filter clinicians by search query
  const filteredClinicians = clinicians.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.credentials.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const selected = clinicians.find(c => c.id === selectedClinicianId);
    if (!selected) {
      alert('Please select a clinician to reassign this task.');
      return;
    }

    reassignPatientTask(task.id, selected.name, selected.id);
    onSuccess(`Task "${task.task}" reassigned to ${selected.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Reassign Clinical Task
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <span className="font-bold text-slate-700 dark:text-slate-200">{patientName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="p-4 bg-pearl-50/50 dark:bg-charcoal-800/40 border-b border-pearl-100 dark:border-charcoal-750 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{task.task}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                {task.discipline}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-mono">
                <Calendar size={12} className="text-slate-400" />
                {task.scheduleStart} {task.scheduleStart !== task.scheduleEnd && `- ${task.scheduleEnd}`}
              </span>
              <span>
                Currently assigned: <strong className="text-slate-700 dark:text-slate-200">{task.assignedTo}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
            <AlertCircle size={13} />
            <span>Reassigning In Progress</span>
          </div>
        </div>

        {/* Content Body: Select User */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Type to Select User / Clinician
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search clinician by name, credential, or title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Clinicians List */}
          <div className="border border-pearl-200 dark:border-charcoal-700 rounded-xl overflow-hidden divide-y divide-pearl-100 dark:divide-charcoal-750 max-h-60 overflow-y-auto">
            {filteredClinicians.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active clinicians found matching "{searchTerm}"
              </div>
            ) : (
              filteredClinicians.map(clinician => {
                const isSelected = selectedClinicianId === clinician.id;
                const isCurrent = clinician.name === task.assignedTo;

                return (
                  <div
                    key={clinician.id}
                    onClick={() => setSelectedClinicianId(clinician.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-white'
                        : 'hover:bg-pearl-50 dark:hover:bg-charcoal-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {clinician.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{clinician.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-pearl-200 dark:bg-charcoal-700 text-slate-600 dark:text-slate-300">
                            {clinician.credentials}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {clinician.title} • {clinician.branch}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-pearl-300 dark:border-charcoal-600'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedClinicianId}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Save Reassignment
          </button>
        </div>
      </div>
    </div>
  );
};

