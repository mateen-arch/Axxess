import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { PlannerTaskItem } from '../../types/connectAndPlanner';

interface AddPlannerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddPlannerTaskModal: React.FC<AddPlannerTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { patients, clinicians, addPlannerTask } = useHealthcare();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<PlannerTaskItem['taskType']>('visit');
  const [discipline, setDiscipline] = useState('Nursing');
  const [assignedClinicianId, setAssignedClinicianId] = useState(clinicians[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-11-07');
  const [dueTime, setDueTime] = useState('10:00 AM');
  const [priority, setPriority] = useState<PlannerTaskItem['priority']>('routine');
  const [notes, setNotes] = useState('');
  const [billable, setBillable] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
    const clinician = clinicians.find(c => c.id === assignedClinicianId);

    addPlannerTask({
      patientId: patient.id,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      patientMrn: patient.mrn,
      serviceLine: patient.serviceLine,
      discipline,
      title: title.trim() || `${discipline} Clinical Encounter`,
      taskType,
      assignedClinicianName: clinician?.name,
      assignedClinicianId: clinician?.id,
      dueDate,
      dueTime,
      stage: 'to_plan',
      priority,
      notes,
      billable,
      qCode: 'Q5001'
    });

    onSuccess(`New planner task "${title || discipline + ' Encounter'}" scheduled successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Plan Clinical Task</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Schedule encounter, 60-day recertification, or supervisory visit</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Patient Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} (MRN: {p.mrn}) • {p.serviceLine.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title / Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 60-Day Recertification Assessment & Care Plan Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
            />
          </div>

          {/* Two-Column Grid: Task Type & Discipline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Task Category</label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
              >
                <option value="visit">Routine Clinical Visit</option>
                <option value="recertification">60-Day Recertification</option>
                <option value="oasis">OASIS Assessment</option>
                <option value="supervisory">Supervisory Visit (14-Day)</option>
                <option value="physician_order">Physician Order Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Discipline</label>
              <select
                value={discipline}
                onChange={e => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
              >
                <option value="Nursing">Nursing (SN / RN)</option>
                <option value="Physical Therapy">Physical Therapy (PT)</option>
                <option value="Occupational Therapy">Occupational Therapy (OT)</option>
                <option value="Speech Therapy">Speech Therapy (ST)</option>
                <option value="Medical Social Work">Medical Social Work (MSW)</option>
                <option value="Home Health Aide">Home Health Aide (HHA / CNA)</option>
              </select>
            </div>
          </div>

          {/* Two-Column Grid: Assigned Clinician & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Clinician</label>
              <select
                value={assignedClinicianId}
                onChange={e => setAssignedClinicianId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
              >
                {clinicians.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Two-Column: Priority & Billable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500 shadow-2xs"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT / Immediate</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="billable"
                checked={billable}
                onChange={e => setBillable(e.target.checked)}
                className="rounded border-pearl-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="billable" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Billable Encounter (Q5001)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Notes & Instructions</label>
            <textarea
              rows={2}
              placeholder="Enter special orders, wound protocol, or supervisory directives..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-2xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-pearl-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-pearl-300 dark:border-charcoal-600 text-slate-700 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              Schedule Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
