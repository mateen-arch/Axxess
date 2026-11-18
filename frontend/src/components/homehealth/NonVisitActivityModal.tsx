import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Clock,
  Calendar,
  Car,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export interface NonVisitActivity {
  id: string;
  clinicianName: string;
  activityType: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  mileage: number;
  comments: string;
  createdAt?: string;
}

interface NonVisitActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicianName?: string;
}

const ACTIVITY_TYPES = [
  'Case Conference',
  'Care Coordination',
  'Office / Administrative / Documentation',
  'In-Service Training',
  'Supervision / Mentoring',
  'Physician Order Follow-up',
  'Travel Time',
  'Patient Triage / On-Call',
];

export const NonVisitActivityModal: React.FC<NonVisitActivityModalProps> = ({
  isOpen,
  onClose,
  clinicianName = 'Hilder Magessa, RN',
}) => {
  const [activities, setActivities] = useState<NonVisitActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form state
  const [activityType, setActivityType] = useState<string>(ACTIVITY_TYPES[0]);
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [endTime, setEndTime] = useState<string>('09:45 AM');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [mileage, setMileage] = useState<number>(0);
  const [comments, setComments] = useState<string>('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getNonVisitActivities();
      setActivities(data);
    } catch (err: any) {
      console.error('Error fetching non-visit activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!activityType || !activityDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const newAct = await api.createNonVisitActivity({
        clinicianName,
        activityType,
        activityDate,
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes) || 30,
        mileage: Number(mileage) || 0,
        comments,
      });

      setActivities((prev) => [newAct, ...prev]);
      showToast('Non-visit activity logged successfully!');
      setActiveTab('list');
      // Reset form
      setComments('');
      setMileage(0);
      setDurationMinutes(30);
    } catch (err: any) {
      console.error('Failed to log activity:', err);
      setErrorMessage(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this non-visit activity entry?')) return;
    try {
      await api.deleteNonVisitActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      showToast('Activity entry removed.');
    } catch (err: any) {
      alert('Failed to delete activity: ' + err.message);
    }
  };

  const handleExportCsv = () => {
    if (activities.length === 0) {
      alert('No activities to export.');
      return;
    }
    const headers = ['Clinician', 'Activity Type', 'Date', 'Start Time', 'End Time', 'Duration (Min)', 'Mileage', 'Comments'];
    const rows = activities.map((a) => [
      `"${a.clinicianName}"`,
      `"${a.activityType}"`,
      `"${a.activityDate}"`,
      `"${a.startTime}"`,
      `"${a.endTime}"`,
      a.durationMinutes,
      a.mileage,
      `"${(a.comments || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Non_Visit_Activities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported non-visit activities to CSV.');
  };

  const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalMileage = activities.reduce((sum, a) => sum + (Number(a.mileage) || 0), 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pearl-200/90 px-6 py-4 dark:border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-700">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Non-Visit Activity Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record and track indirect clinical labor, travel, case conferences, and administrative tasks
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

        {/* Feedback Alert */}
        {toastMessage && (
          <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Metric Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pearl-100 bg-pearl-50/70 px-6 py-3 text-xs dark:border-charcoal-750 dark:bg-charcoal-800/50">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Logged: <strong className="text-rose-600 font-black">{activities.length}</strong> entries
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Hours: <strong className="text-slate-900 dark:text-white font-black">{totalHours} hrs</strong> ({totalMinutes} mins)
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Mileage: <strong className="text-slate-900 dark:text-white font-black">{totalMileage} mi</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center rounded-xl border border-pearl-200 bg-white p-0.5 dark:border-charcoal-700 dark:bg-charcoal-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Activity List
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <Plus size={12} />
                <span>Log Activity</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' ? (
            <div>
              {loading ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  Loading activity logs from database...
                </div>
              ) : activities.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-sm font-bold text-slate-500">No non-visit activities logged yet.</div>
                  <p className="mt-1 text-xs text-slate-400">
                    Click "Log Activity" above to record indirect care or travel time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Activity Type</th>
                        <th className="px-4 py-3">Time Window</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Mileage</th>
                        <th className="px-4 py-3">Comments</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750 font-medium">
                      {activities.map((a) => (
                        <tr key={a.id} className="hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {a.activityDate}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                              {a.activityType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {a.startTime} - {a.endTime}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {a.durationMinutes} min
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {a.mileage > 0 ? `${a.mileage} mi` : '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={a.comments}>
                            {a.comments || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(a.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer transition"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateActivity} className="space-y-4 max-w-xl mx-auto">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Type *
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    required
                  >
                    {ACTIVITY_TYPES.map((t) => (
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
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
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
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                    required
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
                  Comments / Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Detail notes regarding the non-visit activity..."
                  className="w-full rounded-xl border border-pearl-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="rounded-xl border border-pearl-200 bg-pearl-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 cursor-pointer transition"
                >
                  {submitting ? 'Saving Activity...' : 'Save Activity Entry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

