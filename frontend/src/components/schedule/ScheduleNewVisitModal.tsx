import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, User, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
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
  defaultDay,
  defaultDate,
  onSuccess
}) => {
  const { clinicians, patients, addEmployeeVisit, employeeVisits } = useHealthcare();

  // All fields start without pre-filled default values per user instruction
  const [selectedClinicianId, setSelectedClinicianId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('home_health');
  const [visitType, setVisitType] = useState('Skilled Nurse Visit');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync / reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedClinicianId(defaultClinicianId || '');
      setSelectedPatientId('');
      setPatientName(defaultPatientName || '');
      setScheduledDate(defaultDate || '');
      setTimeSlot('');
      setAddress('');
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultClinicianId, defaultPatientName, defaultDate]);

  if (!isOpen) return null;

  // Detect booked slots for the selected clinician on the chosen date
  const clinicianBookedSlots = employeeVisits
    .filter(v => selectedClinicianId && v.employeeId === selectedClinicianId && v.date === scheduledDate && v.status !== 'cancelled')
    .map(v => v.timeSlot);

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    setError('');
    if (!patId) {
      setPatientName('');
      setAddress('');
      return;
    }
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      const full = `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || `Patient (${pat.mrn})`;
      setPatientName(full);
      if (pat.serviceLine) setServiceLine(pat.serviceLine);
      const addr = pat.street
        ? `${pat.street}, ${pat.city || ''} ${pat.state || ''}`.trim()
        : pat.address?.street
        ? `${pat.address.street}, ${pat.address.city || ''} ${pat.address.state || ''}`.trim()
        : '';
      if (addr) setAddress(addr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClinicianId) {
      setError('Please select an assigned field clinician.');
      return;
    }

    if (!patientName.trim()) {
      setError('Please select or specify a patient.');
      return;
    }

    if (!scheduledDate) {
      setError('Please select a scheduled date.');
      return;
    }

    if (!timeSlot.trim()) {
      setError('Please specify or select a time slot.');
      return;
    }

    const clinician = clinicians.find(c => c.id === selectedClinicianId);
    if (!clinician) {
      setError('Please select a valid active field clinician.');
      return;
    }

    // Client-side conflict detection
    const isConflict = employeeVisits.some(v =>
      v.employeeId === clinician.id &&
      v.date === scheduledDate &&
      v.timeSlot &&
      v.timeSlot.trim().toLowerCase() === timeSlot.trim().toLowerCase() &&
      v.status !== 'cancelled'
    );

    if (isConflict) {
      setError(`Time Slot Conflict: ${clinician.name} is already booked for another visit at ${timeSlot} on ${scheduledDate}. Please select a different time slot.`);
      return;
    }

    const dateObj = new Date(scheduledDate + 'T00:00:00');
    const dayOfWeek = isNaN(dateObj.getDay()) ? (defaultDay ?? 2) : dateObj.getDay();

    const newVisit: any = {
      employeeId: clinician.id,
      clinicianId: clinician.id,
      employeeName: clinician.name,
      patientId: selectedPatientId || undefined,
      patientName: patientName.trim(),
      visitType: visitType,
      serviceLine: serviceLine,
      dayOfWeek: dayOfWeek,
      date: scheduledDate,
      scheduledDate: scheduledDate,
      timeSlot: timeSlot.trim(),
      status: 'scheduled',
      locationType: 'home',
      evvStatus: 'pending',
      address: address.trim(),
      notes: notes.trim()
    };

    try {
      setIsSubmitting(true);
      setError('');
      await addEmployeeVisit(newVisit);
      onSuccess?.(`Scheduled visit for ${newVisit.patientName} with ${clinician.name}`);
      onClose();
    } catch (err: any) {
      console.error('Visit dispatch error:', err);
      setError(err.message || 'Failed to schedule visit in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden my-auto flex flex-col transition-colors animate-scaleIn max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-850 shrink-0">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Assigned Field Clinician Dropdown (Not pre-filled) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Stethoscope size={13} className="text-rose-600" />
              <span>Assigned Field Clinician *</span>
            </label>
            <select
              value={selectedClinicianId}
              onChange={(e) => {
                setSelectedClinicianId(e.target.value);
                setError('');
              }}
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="">-- Select Field Clinician --</option>
              {clinicians.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.credentials}) — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Dropdown (Not pre-filled, lists all available patients) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-rose-600" />
                <span>Patient *</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {patients.length} active patients
              </span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} (MRN: {p.mrn}) — {p.primaryDiagnosis || 'Clinical Care'}
                </option>
              ))}
            </select>
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
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
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

          {/* Scheduled Date & Time Slot (Not pre-filled) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={13} className="text-rose-600" />
                <span>Scheduled Date *</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value);
                  setError('');
                }}
                className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-rose-600" />
                  <span>Time Slot *</span>
                </span>
                {clinicianBookedSlots.length > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                    Booked: {clinicianBookedSlots.join(', ')}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => {
                    setTimeSlot(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. 09:30 AM"
                  list="schedule-timeslot-presets"
                  className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                />
                <datalist id="schedule-timeslot-presets">
                  <option value="08:00 AM" />
                  <option value="08:30 AM" />
                  <option value="09:00 AM" />
                  <option value="09:30 AM" />
                  <option value="10:00 AM" />
                  <option value="10:30 AM" />
                  <option value="11:00 AM" />
                  <option value="11:30 AM" />
                  <option value="01:00 PM" />
                  <option value="01:30 PM" />
                  <option value="02:00 PM" />
                  <option value="02:30 PM" />
                  <option value="03:00 PM" />
                  <option value="03:30 PM" />
                  <option value="04:00 PM" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Patient Address (EVV Geofence) - Not pre-filled unless patient selected */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin size={13} className="text-rose-600" />
              <span>Patient Address (EVV Geofence)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 1420 Harvard St, Dallas TX"
              className="w-full h-10 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Clinical Instructions / Notes */}
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
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Confirm & Dispatch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
