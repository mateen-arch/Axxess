import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ServiceLine } from '../../types';

export const NewPatientModal: React.FC = () => {
  const { isNewPatientModalOpen, setIsNewPatientModalOpen, addNewPatient } = useHealthcare();

  const [serviceLine, setServiceLine] = useState<ServiceLine>('home_health');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mrn, setMrn] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [insuranceName, setInsuranceName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [startOfCareDate, setStartOfCareDate] = useState('');
  const [episodeStart, setEpisodeStart] = useState('');
  const [episodeEnd, setEpisodeEnd] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [secondaryContact, setSecondaryContact] = useState('');
  const [fullCode, setFullCode] = useState(true);
  const [fallRisk, setFallRisk] = useState(false);
  const [hospitalizationRisk, setHospitalizationRisk] = useState(false);
  const [infectionRisk, setInfectionRisk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isNewPatientModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (phone && phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await addNewPatient({
        mrn: mrn.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob,
        gender,
        serviceLine,
        status: 'active',
        primaryDiagnosis: diagnosis.trim() || 'Clinical Assessment & Plan of Care',
        phone: phone.trim() || '(555) 000-0000',
        secondaryPhone: secondaryPhone.trim() || undefined,
        email: email.trim() || undefined,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        },
        admissionDate: startOfCareDate,
        startOfCareDate,
        episodeStart,
        episodeEnd,
        attendingPhysician: attendingPhysician.trim() || 'RIGALI, LESLIE',
        insuranceName: insuranceName.trim() || 'MEDICARE PART A',
        policyNumber: policyNumber.trim() || 'MCR-' + Math.floor(100000 + Math.random() * 900000),
        primaryContact: primaryContact.trim() || 'Not Available',
        secondaryContact: secondaryContact.trim() || 'Not Available',
        fullCode,
        fallRisk,
        hospitalizationRisk,
        infectionRisk,
      });

      setIsNewPatientModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create patient:', err);
      setError(err?.message || 'Failed to save patient. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50/70 dark:bg-charcoal-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Admit New Patient</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standards Home Care • Electronic Health Record Intake
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewPatientModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Service Line Pill Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Line
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'home_health', label: 'Home Health' },
                  { id: 'home_care', label: 'Home Care' },
                  { id: 'hospice', label: 'Hospice' },
                ] as const
              ).map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setServiceLine(line.id as ServiceLine)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    serviceLine === line.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {line.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-slate-50/50 dark:bg-charcoal-900/30 p-3.5 rounded-xl border border-slate-200/70 dark:border-charcoal-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Patient Demographics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Heather"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Abuissa"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  MRN (Optional)
                </label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  placeholder="e.g. 1061"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50/50 dark:bg-charcoal-900/30 p-3.5 rounded-xl border border-slate-200/70 dark:border-charcoal-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Contact & Location
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(351) 201-4985"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Secondary Phone
                </label>
                <input
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="(617) 555-0199"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="heather.abuissa@gmail.com"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="77 Sohier RD Apt 2B"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Beverly"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  State & ZIP
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="MA"
                    className="w-12 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 uppercase"
                  />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="01915"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Episode & Physician */}
          <div className="bg-slate-50/50 dark:bg-charcoal-900/30 p-3.5 rounded-xl border border-slate-200/70 dark:border-charcoal-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Clinical Episode & Care Team
            </h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Primary Diagnosis / Clinical Order
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Type 2 Diabetes Mellitus with Neuropathy & Diabetic Foot Ulcer"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Attending Physician
                </label>
                <input
                  type="text"
                  value={attendingPhysician}
                  onChange={(e) => setAttendingPhysician(e.target.value)}
                  placeholder="RIGALI, LESLIE"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Insurance Name
                </label>
                <input
                  type="text"
                  value={insuranceName}
                  onChange={(e) => setInsuranceName(e.target.value)}
                  placeholder="COMMONWEALTH CARE ALLIANCE"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Policy / ID Number
                </label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="CCA-36563446600"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Start of Care Date
                </label>
                <input
                  type="date"
                  value={startOfCareDate}
                  onChange={(e) => setStartOfCareDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Episode Start
                </label>
                <input
                  type="date"
                  value={episodeStart}
                  onChange={(e) => setEpisodeStart(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Episode End
                </label>
                <input
                  type="date"
                  value={episodeEnd}
                  onChange={(e) => setEpisodeEnd(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Emergency Contact
                </label>
                <input
                  type="text"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  placeholder="Not Available or Name (Phone)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Secondary Emergency Contact
                </label>
                <input
                  type="text"
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  placeholder="DEREK PRIME (617) 595-9512"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Risk Assessment Badges */}
          <div className="bg-slate-50/50 dark:bg-charcoal-900/30 p-3.5 rounded-xl border border-slate-200/70 dark:border-charcoal-700">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2.5">
              Clinical Risk Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700">
                <input
                  type="checkbox"
                  checked={fullCode}
                  onChange={(e) => setFullCode(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Full Code</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700">
                <input
                  type="checkbox"
                  checked={fallRisk}
                  onChange={(e) => setFallRisk(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Fall Risk</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700">
                <input
                  type="checkbox"
                  checked={hospitalizationRisk}
                  onChange={(e) => setHospitalizationRisk(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Hosp. Risk</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700">
                <input
                  type="checkbox"
                  checked={infectionRisk}
                  onChange={(e) => setInfectionRisk(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Infection Risk</span>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-charcoal-700 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsNewPatientModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Admitting Patient...' : 'Complete Admission'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
