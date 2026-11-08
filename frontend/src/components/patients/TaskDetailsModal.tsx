import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  Car,
  MapPin,
  Paperclip,
  Upload,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { PatientChartTask } from '../../types';
import { useHealthcare } from '../../context/HealthcareContext';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: PatientChartTask | null;
  patientName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  task,
  patientName,
  onClose,
  onSuccess,
}) => {
  const { clinicians, updatePatientTaskDetails } = useHealthcare();

  const [formData, setFormData] = useState<Partial<PatientChartTask>>({});
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [attachmentsList, setAttachmentsList] = useState<string[]>([
    'Clinical_Assessment_Signed.pdf',
    'Care_Plan_Coordination_Report.docx'
  ]);

  useEffect(() => {
    if (task) {
      setFormData({
        task: task.task,
        discipline: task.discipline,
        serviceLine: task.serviceLine,
        status: task.status,
        scheduleStart: task.scheduleStart,
        scheduleEnd: task.scheduleEnd,
        actualDate: task.actualDate || task.scheduleStart,
        visitTimeIn: task.visitTimeIn || '09:00 AM',
        visitTimeOut: task.visitTimeOut || '10:00 AM',
        travelStartTime: task.travelStartTime || '08:40 AM',
        travelEndTime: task.travelEndTime || '08:55 AM',
        assignedTo: task.assignedTo,
        billable: task.billable ?? true,
        payable: task.payable ?? true,
        surcharge: task.surcharge ?? 0,
        mileage: task.mileage ?? 0,
        serviceLocationCode: task.serviceLocationCode || 'Q5001 - Patient Home',
        autoTravelTime: task.autoTravelTime || '15 mins',
        autoMileage: task.autoMileage || 6.4,
        receivedDate: task.receivedDate || task.scheduleStart,
        confirmationStatus: task.confirmationStatus || 'Confirmed',
        comments: task.comments || '',
        returnReason: task.returnReason || '',
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientTaskDetails(task.id, formData);
    onSuccess(`Task "${formData.task || task.task}" details updated successfully!`);
    onClose();
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setAttachmentsList(prev => [...prev, newAttachmentName.trim()]);
    setNewAttachmentName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/80 dark:bg-charcoal-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-950 dark:text-white text-base">
                  {task.task}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                  Home Health
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
                  Viewing Task Details
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Clinical Encounter Charting for <strong className="text-slate-800 dark:text-slate-200">{patientName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Section 1: Task Type & Payability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Name
              </label>
              <input
                type="text"
                value={formData.task || ''}
                onChange={e => setFormData({ ...formData, task: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-5 pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.billable ?? true}
                  onChange={e => setFormData({ ...formData, billable: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Billable Encounter</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.payable ?? true}
                  onChange={e => setFormData({ ...formData, payable: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Payable Clinician</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Travel Start Time
                </label>
                <div className="relative">
                  <Clock size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.travelStartTime || ''}
                    onChange={e => setFormData({ ...formData, travelStartTime: e.target.value })}
                    placeholder="hh:mm AM"
                    className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Travel End Time
                </label>
                <div className="relative">
                  <Clock size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.travelEndTime || ''}
                    onChange={e => setFormData({ ...formData, travelEndTime: e.target.value })}
                    placeholder="hh:mm AM"
                    className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dates and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Date
              </label>
              <div className="relative">
                <Calendar size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.scheduleStart || ''}
                  onChange={e => setFormData({ ...formData, scheduleStart: e.target.value, scheduleEnd: e.target.value })}
                  className="w-full pl-2.5 pr-8 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Actual Date
              </label>
              <div className="relative">
                <Calendar size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.actualDate || ''}
                  onChange={e => setFormData({ ...formData, actualDate: e.target.value })}
                  className="w-full pl-2.5 pr-8 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Visit Time In
              </label>
              <div className="relative">
                <Clock size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.visitTimeIn || ''}
                  onChange={e => setFormData({ ...formData, visitTimeIn: e.target.value })}
                  placeholder="hh:mm AM"
                  className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Visit Time Out
              </label>
              <div className="relative">
                <Clock size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.visitTimeOut || ''}
                  onChange={e => setFormData({ ...formData, visitTimeOut: e.target.value })}
                  placeholder="hh:mm AM"
                  className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status, Assigned Clinician, Surcharge, Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'Not Yet Due'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500"
              >
                <option value="Completed">Completed</option>
                <option value="Submitted With Signature">Submitted With Signature</option>
                <option value="Returned w/ Physician Signature">Returned w/ Physician Signature</option>
                <option value="Not Yet Due">Not Yet Due</option>
                <option value="Not Yet Started">Not Yet Started</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned To
              </label>
              <select
                value={formData.assignedTo || ''}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500"
              >
                {clinicians.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.credentials})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Surcharge ($)
              </label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.surcharge ?? 0}
                  onChange={e => setFormData({ ...formData, surcharge: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Associated Mileage (mi)
              </label>
              <div className="relative">
                <Car size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.1"
                  value={formData.mileage ?? 0}
                  onChange={e => setFormData({ ...formData, mileage: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-3 pr-7 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Service Location & Auto-Calculated Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-xl bg-pearl-50/70 dark:bg-charcoal-800/50 border border-pearl-200 dark:border-charcoal-700">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" />
                <span>Service Location (Q Codes)</span>
              </label>
              <select
                value={formData.serviceLocationCode || 'Q5001 - Patient Home'}
                onChange={e => setFormData({ ...formData, serviceLocationCode: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="Q5001 - Patient Home">Q5001 - Patient Home</option>
                <option value="Q5002 - Assisted Living Facility">Q5002 - Assisted Living Facility</option>
                <option value="Q5003 - Hospice Facility">Q5003 - Hospice Facility</option>
                <option value="Q5004 - Skilled Nursing Facility">Q5004 - Skilled Nursing Facility</option>
                <option value="Q5009 - Other Inpatient Facility">Q5009 - Other Inpatient Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auto-Calculated Travel Time
              </label>
              <div className="px-3 py-1.5 rounded-lg border border-dashed border-pearl-300 dark:border-charcoal-600 bg-pearl-100/50 dark:bg-charcoal-750/50 font-mono text-slate-700 dark:text-slate-300">
                {formData.autoTravelTime || '15 mins'}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auto-Calculated Mileage
              </label>
              <div className="px-3 py-1.5 rounded-lg border border-dashed border-pearl-300 dark:border-charcoal-600 bg-pearl-100/50 dark:bg-charcoal-750/50 font-mono text-slate-700 dark:text-slate-300">
                {formData.autoMileage || 6.4} miles
              </div>
            </div>
          </div>

          {/* Section 5: Received Date & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Received Date
              </label>
              <div className="relative">
                <Calendar size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.receivedDate || ''}
                  onChange={e => setFormData({ ...formData, receivedDate: e.target.value })}
                  className="w-full pl-2.5 pr-8 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirmation Status
              </label>
              <select
                value={formData.confirmationStatus || 'Confirmed'}
                onChange={e => setFormData({ ...formData, confirmationStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-rose-500"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Signed & Submitted">Signed & Submitted</option>
                <option value="Physician Countersigned">Physician Countersigned</option>
              </select>
            </div>
          </div>

          {/* Section 6: Episode Selection Toggle */}
          <div className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/40 dark:bg-charcoal-800/30">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>Check here to move visit / document to another episode</span>
            </label>
          </div>

          {/* Section 7: Sticky Notes */}
          <div className="space-y-4">
            {/* Comments: Yellow Sticky Note */}
            <div>
              <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block shadow-2xs" />
                <span>Comments (Yellow Sticky Note)</span>
              </label>
              <textarea
                rows={3}
                value={formData.comments || ''}
                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Enter clinical notes, observation comments, or interdisciplinary communication..."
                className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Return Reason: Red Sticky Note */}
            <div>
              <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block shadow-2xs" />
                <span>Return Reason (Red Sticky Note)</span>
              </label>
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-xs">
                {formData.returnReason ? (
                  <span className="font-semibold text-rose-700 dark:text-rose-300">{formData.returnReason}</span>
                ) : (
                  <span className="text-slate-400 italic">No Return Reason Found</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 8: Attachments */}
          <div className="p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip size={14} className="text-slate-400" />
                <span>Attachments ({attachmentsList.length} files attached)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {attachmentsList.map((filename, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-600 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <FileText size={12} className="text-rose-500" />
                  <span className="truncate max-w-[200px]">{filename}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Upload file name or browse..."
                value={newAttachmentName}
                onChange={e => setNewAttachmentName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 py-1.5 rounded-lg bg-pearl-200 hover:bg-pearl-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={13} />
                <span>Save Attachment</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 hover:bg-pearl-100 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

