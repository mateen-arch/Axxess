import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Plus,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

interface AddCalendarActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  onActivityAdded: () => void;
}

const COMMON_VISIT_TASKS = [
  'Skilled Nursing Assessment',
  'SN Visit - Wound Care Evaluation',
  'SN Wound VAC Dressing Change',
  'Medication Administration & Monitoring',
  'Comprehensive Cardiopulmonary Assessment',
  'OASIS Recertification Assessment',
  'Physical Therapy Assessment',
  'Physical Therapy Balance Training',
  'Occupational Therapy ADL Assessment',
  'Diabetic Foot Examination',
  'Foley Catheter Maintenance',
  'IV Infusion Monitoring',
  'Aide Personal Care & ADL Assistance',
];

const NON_VISIT_TYPES = [
  'Case Conference',
  'Care Coordination',
  'Office / Administrative / Documentation',
  'In-Service Training',
  'Supervision / Mentoring',
  'Physician Order Follow-up',
  'Travel Time',
];

export const AddCalendarActivityModal: React.FC<AddCalendarActivityModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  onActivityAdded,
}) => {
  const [activityCategory, setActivityCategory] = useState<'visit' | 'non_visit'>('visit');
  const [patients, setPatients] = useState<any[]>([]);
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Visit form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedClinicianId, setSelectedClinicianId] = useState('');
  const [visitTask, setVisitTask] = useState(COMMON_VISIT_TASKS[0]);
  const [scheduledDate, setScheduledDate] = useState(
    defaultDate || new Date().toISOString().slice(0, 10)
  );
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [serviceLine, setServiceLine] = useState('home_health');
  const [notes, setNotes] = useState('');

  // Non-visit form state
  const [nonVisitType, setNonVisitType] = useState(NON_VISIT_TYPES[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('09:45 AM');
  const [mileage, setMileage] = useState(0);
  const [nonVisitComments, setNonVisitComments] = useState('');

  useEffect(() => {
    if (defaultDate) {
      setScheduledDate(defaultDate);
    }
  }, [defaultDate]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          setLoadingInitial(true);
          const [pList, cList] = await Promise.all([
            api.getPatients(),
            api.getClinicians(),
          ]);
          setPatients(pList || []);
          setClinicians(cList || []);
          if (pList && pList.length > 0 && !selectedPatientId) {
            setSelectedPatientId(pList[0].id);
          }
          if (cList && cList.length > 0 && !selectedClinicianId) {
            setSelectedClinicianId(cList[0].id);
          }
        } catch (err) {
          console.error('Failed to load modal dependencies:', err);
        } finally {
          setLoadingInitial(false);
        }
      };
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      setSubmitting(true);

      if (activityCategory === 'visit') {
        const patient = patients.find((p) => p.id === selectedPatientId);
        const patientName = patient
          ? `${patient.lastName || patient.last_name}, ${patient.firstName || patient.first_name}`
          : 'Patient';

        await api.createScheduleVisit({
          patientId: selectedPatientId,
          patientName,
          employeeId: selectedClinicianId || (clinicians[0]?.id ?? 'c1111111-1111-1111-1111-111111111111'),
          visitType: visitTask,
          task: visitTask,
          scheduledDate,
          timeSlot,
          serviceLine,
          address: patient?.address?.street || '1420 Harvard St, Dallas TX',
          notes,
        });
      } else {
        await api.createNonVisitActivity({
          activityType: nonVisitType,
          activityDate: scheduledDate,
          startTime,
          endTime,
          durationMinutes: Number(durationMinutes) || 45,
          mileage: Number(mileage) || 0,
          comments: nonVisitComments,
          clinicianName: 'Hilder Magessa, RN',
        });
      }

      onActivityAdded();
      onClose();
    } catch (err: any) {
      console.error('Error creating activity:', err);
      setErrorMessage(err.message || 'Failed to save activity to calendar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pearl-200/90 px-6 py-4 dark:border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Add Activity / Visit to Calendar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Schedule a patient encounter or log an administrative activity for this calendar date
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-pearl-100 hover:text-slate-600 dark:hover:bg-charcoal-700 dark:hover:text-slate-200 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Activity Category Selector */}
        <div className="border-b border-pearl-100 bg-pearl-50/70 px-6 py-3 dark:border-charcoal-750 dark:bg-charcoal-800/50">
          <div className="flex items-center rounded-xl border border-pearl-200 bg-white p-0.5 dark:border-charcoal-700 dark:bg-charcoal-800">
            <button
              type="button"
              onClick={() => setActivityCategory('visit')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                activityCategory === 'visit'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <Briefcase size={13} />
              <span>Patient Clinical Visit</span>
            </button>
            <button
              type="button"
              onClick={() => setActivityCategory('non_visit')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                activityCategory === 'non_visit'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <Layers size={13} />
              <span>Non-Visit Activity / Training</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {activityCategory === 'visit' ? (
            <>
              {/* Patient Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName || p.last_name}, {p.firstName || p.first_name} (MRN: #{p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task / Visit Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task / Visit Type *
                </label>
                <select
                  value={visitTask}
                  onChange={(e) => setVisitTask(e.target.value)}
                  className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  required
                >
                  {COMMON_VISIT_TASKS.map((task) => (
                    <option key={task} value={task}>
                      {task}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Clinician Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Clinician *
                  </label>
                  <select
                    value={selectedClinicianId}
                    onChange={(e) => setSelectedClinicianId(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    required
                  >
                    {clinicians.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Line */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Line
                  </label>
                  <select
                    value={serviceLine}
                    onChange={(e) => setServiceLine(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  >
                    <option value="home_health">Home Health</option>
                    <option value="hospice">Hospice</option>
                    <option value="home_care">Home Care</option>
                  </select>
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    required
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clinical objectives, wound supply notes, or precautions..."
                  className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                />
              </div>
            </>
          ) : (
            <>
              {/* Non-Visit Activity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Type *
                  </label>
                  <select
                    value={nonVisitType}
                    onChange={(e) => setNonVisitType(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  >
                    {NON_VISIT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="09:45 AM"
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mileage (Miles)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Comments / Objectives
                </label>
                <textarea
                  rows={2}
                  value={nonVisitComments}
                  onChange={(e) => setNonVisitComments(e.target.value)}
                  placeholder="Details for this non-visit activity..."
                  className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pearl-100 dark:border-charcoal-750">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-pearl-200 bg-pearl-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 cursor-pointer transition flex items-center gap-1.5"
            >
              {submitting ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Save to Calendar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

