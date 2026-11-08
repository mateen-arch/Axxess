import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ServiceLine, EmployeeVisit } from '../../types';

interface ScheduleNewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClinicianId?: string;
  defaultPatientName?: string;
  defaultDay?: number;
  defaultDate?: string;
  onSuccess?: (msg: string) => void;
}

export const ScheduleNewVisitModal: React.FC<ScheduleNewVisitModalProps> = ({
  isOpen,
  onClose,
  defaultClinicianId,
  defaultPatientName = '',
  defaultDay = 2,
  defaultDate,
  onSuccess
}) => {
  const { clinicians, addEmployeeVisit } = useHealthcare();

  const [selectedClinicianId, setSelectedClinicianId] = useState(defaultClinicianId || (clinicians[0]?.id ?? 'emp-01'));
  const [patientName, setPatientName] = useState(defaultPatientName);
  const [serviceLine, setServiceLine] = useState<ServiceLine>('home_health');
  const [visitType, setVisitType] = useState('Skilled Nurse Visit');
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate || '2026-11-03');
  const [timeSlot, setTimeSlot] = useState('09:30 AM');
  const [address, setAddress] = useState('1420 Harvard St, Boston MA');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (defaultClinicianId) setSelectedClinicianId(defaultClinicianId);
      if (defaultPatientName) setPatientName(defaultPatientName);
      if (defaultDate) setScheduledDate(defaultDate);
      setError('');
    }
  }, [isOpen, defaultClinicianId, defaultPatientName, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please provide patient name.');
      return;
    }

    const clinician = clinicians.find(c => c.id === selectedClinicianId) || clinicians[0];
    const dateObj = new Date(scheduledDate + 'T00:00:00');
    const dayOfWeek = isNaN(dateObj.getDay()) ? defaultDay : dateObj.getDay();

    const newVisit: Omit<EmployeeVisit, 'id'> = {
      employeeId: clinician.id,
      employeeName: clinician.name,
      patientName: patientName.trim(),
      visitType: visitType,
      serviceLine: serviceLine,
      dayOfWeek: dayOfWeek,
      date: scheduledDate,
      timeSlot: timeSlot,
      status: 'scheduled',
      locationType: 'home',
      evvStatus: 'pending',
      address: address.trim(),
      notes: notes.trim()
    };

    addEmployeeVisit(newVisit);
    onSuccess?.(`Scheduled visit for ${newVisit.patientName} with ${clinician.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col transition-colors animate-scaleIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-bold shadow-2xs">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Schedule New Visit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatch field encounter & configure EVV
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Clinician Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Field Clinician
            </label>
            <select
              value={selectedClinicianId}
              onChange={(e) => setSelectedClinicianId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {clinicians.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.credentials}) — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Patient Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Latia Williams or Hernandez, Robert"
              value={patientName}
              onChange={(e) => {
                setPatientName(e.target.value);
                setError('');
              }}
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Service Line & Visit Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Line of Service
              </label>
              <select
                value={serviceLine}
                onChange={(e) => setServiceLine(e.target.value as ServiceLine)}
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="home_health">Home Health</option>
                <option value="home_care">Home Care</option>
                <option value="hospice">Hospice</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Visit Type
              </label>
              <input
                type="text"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                placeholder="e.g. Skilled Nurse Visit (AM)"
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Scheduled Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Time Slot
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 09:30 AM or PM"
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Patient Address (EVV Geofence)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 1420 Harvard St, Boston MA"
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Clinical Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wound assessment and diabetic insulin check"
              className="w-full p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

