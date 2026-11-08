import React, { useState } from 'react';
import { X, UserPlus, Heart, Check } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ServiceLine } from '../../types';

export const NewPatientModal: React.FC = () => {
  const { isNewPatientModalOpen, setIsNewPatientModalOpen, addNewPatient } = useHealthcare();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1950-06-15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('home_health');
  const [diagnosis, setDiagnosis] = useState('');
  const [phone, setPhone] = useState('(214) 555-0199');
  const [street, setStreet] = useState('450 North Central Expy');
  const [city, setCity] = useState('Dallas');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('75206');
  const [assignedNurse, setAssignedNurse] = useState('Susanna Welch, BSN');

  if (!isNewPatientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !diagnosis) {
      alert('Please fill out patient name and diagnosis.');
      return;
    }

    addNewPatient({
      firstName,
      lastName,
      dob,
      gender,
      serviceLine,
      status: 'active',
      primaryDiagnosis: diagnosis,
      phone,
      address: { street, city, state, zipCode },
      admissionDate: new Date().toISOString().split('T')[0],
      assignedNurseName: assignedNurse,
      nextScheduledVisit: 'Scheduled in 48h'
    });

    setIsNewPatientModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50/50 dark:bg-charcoal-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Admit New Patient</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Standards Home Care Admission Intake</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewPatientModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Service Line Pill Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              Service Line
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['home_health', 'home_care', 'hospice'] as const).map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => setServiceLine(line)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center capitalize ${
                    serviceLine === line
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {line.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Eleanor"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pemberton"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Primary Diagnosis / Clinical Order
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Chronic Congestive Heart Failure, Stage 2 Ulcer Rehab"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Address & Clinician */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Assigned Nurse</label>
              <input
                type="text"
                value={assignedNurse}
                onChange={(e) => setAssignedNurse(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-charcoal-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewPatientModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              <Check size={14} />
              <span>Complete Admission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
