import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Phone,
  Calendar,
  Building2,
  HeartPulse,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ServiceLine, PriorityLevel, Referral, Inquiry } from '../../types';

interface IntakeEntryModalProps {
  type: 'inquiry' | 'referral';
  isOpen: boolean;
  onClose: () => void;
  initialData?: Referral | Inquiry | null;
  onSuccess?: (msg: string) => void;
}

export const IntakeEntryModal: React.FC<IntakeEntryModalProps> = ({
  type,
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const { addNewReferral, addNewInquiry } = useHealthcare();

  const isReferral = type === 'referral';
  const isEditing = Boolean(initialData);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('(214) 555-0199');
  const [dob, setDob] = useState('1952-04-15');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // Contact / Caller fields (for Inquiries)
  const [contactName, setContactName] = useState('Maria Hernandez');
  const [contactPhone, setContactPhone] = useState('(214) 555-0483');
  const [contactRelation, setContactRelation] = useState('Daughter / Family');

  // Operational fields
  const [serviceLine, setServiceLine] = useState<ServiceLine | string>('home_health');
  const [branch, setBranch] = useState('Standards Home Care');
  const [sourceOrService, setSourceOrService] = useState('Hospital Discharge');
  const [targetDate, setTargetDate] = useState('2026-11-04');
  const [assignedClinician, setAssignedClinician] = useState('Sarah Jenkins, RN');

  // Tags & Notes
  const [selectedServices, setSelectedServices] = useState<string[]>(['Skilled Nursing']);
  const [selectedDme, setSelectedDme] = useState<string[]>(['Walker']);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Available tag choices
  const availableServices = [
    'Skilled Nursing',
    'Physical Therapy',
    'Occupational Therapy',
    'Home Health Aide',
    'Speech Therapy',
    'Medical Social Work'
  ];

  const availableDme = ['Wheelchair', 'Hospital Bed', 'Walker', 'Oxygen Concentrator', 'Nebulizer'];

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) {
      setError('');
      return;
    }

    if (initialData) {
      if (isReferral) {
        const ref = initialData as Referral;
        const parts = ref.patientName.split(', ');
        setLastName(parts[0] || ref.patientName);
        setFirstName(parts[1] || '');
        setPhone(ref.patientPhone);
        setDob(ref.dob);
        setGender(ref.sex || 'Female');
        setServiceLine(ref.lineOfService.toLowerCase().includes('health') ? 'home_health' : ref.lineOfService.toLowerCase().includes('hospice') ? 'hospice' : 'home_care');
        setBranch(ref.branch);
        setSourceOrService(ref.referralType || 'Hospital Discharge');
        setTargetDate(ref.requestedSoc);
        setNotes(ref.notes || '');
      } else {
        const inq = initialData as Inquiry;
        setFirstName(inq.clientFirstName);
        setLastName(inq.clientLastName);
        setPhone(inq.clientPhone || '');
        setContactName(`${inq.contactFirstName} ${inq.contactLastName}`);
        setContactPhone(inq.contactPhone);
        setContactRelation(inq.contactRelationship || 'Family');
        setServiceLine(inq.serviceLine);
        setBranch(inq.branch);
        setSourceOrService(inq.serviceRequested);
        setTargetDate(inq.followUpDate);
        setAssignedClinician(inq.assignedTeamMember);
        setNotes(inq.comments || '');
      }
    } else {
      // Defaults for New
      setFirstName('');
      setLastName('');
      setPhone(isReferral ? '(857) 249-0056' : '(214) 555-0482');
      setDob('1952-04-15');
      setGender('Female');
      setContactName('Maria Hernandez');
      setContactPhone('(214) 555-0483');
      setContactRelation('Daughter / Family');
      setServiceLine(isReferral ? 'home_care' : 'home_health');
      setBranch('Standards Home Care');
      setSourceOrService(isReferral ? 'Hospital Discharge' : 'Skilled Nursing & Wound Care');
      setTargetDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
      setAssignedClinician('Sarah Jenkins, RN');
      setSelectedServices(['Skilled Nursing']);
      setSelectedDme(['Walker']);
      setNotes('');
      setError('');
    }
  }, [isOpen, initialData, isReferral]);

  if (!isOpen) return null;

  const toggleService = (svc: string) => {
    setSelectedServices(prev =>
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  const toggleDme = (dme: string) => {
    setSelectedDme(prev =>
      prev.includes(dme) ? prev.filter(d => d !== dme) : [...prev, dme]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide both First Name and Last Name.');
      return;
    }

    const readableServiceLine =
      serviceLine === 'home_health' ? 'Home Health' : serviceLine === 'hospice' ? 'Hospice' : 'Home Care';

    if (isReferral) {
      if (initialData) {
        // Edit existing referral
        const ref = initialData as Referral;
        ref.patientName = `${lastName.trim()}, ${firstName.trim()}`;
        ref.patientPhone = phone;
        ref.lineOfService = readableServiceLine;
        ref.branch = branch;
        ref.referralType = sourceOrService;
        ref.requestedSoc = targetDate;
        ref.notes = notes;
        onSuccess?.(`Updated referral for ${ref.patientName}`);
      } else {
        // Create new referral
        const newRef: Omit<Referral, 'id'> = {
          referralDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          requestedSoc: targetDate,
          patientName: `${lastName.trim()}, ${firstName.trim()}`,
          patientPhone: phone || '(555) 000-0000',
          patientMrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
          branch: branch,
          organization: 'Standards Home Care',
          lineOfService: readableServiceLine,
          referralType: sourceOrService || 'Hospital Discharge',
          dob: dob,
          sex: gender,
          createdBy: 'MELISSA SWEENEY',
          liaison: 'Baylor Scott & White',
          tags: selectedServices.join(', ') || 'Direct Intake',
          status: 'pending',
          notes: notes || `Requested services: ${selectedServices.join(', ')}. Equipment: ${selectedDme.join(', ')}.`
        };
        addNewReferral(newRef);
        onSuccess?.(`Created referral for ${newRef.patientName}`);
      }
    } else {
      if (initialData) {
        // Edit existing inquiry
        const inq = initialData as Inquiry;
        inq.clientFirstName = firstName.trim();
        inq.clientLastName = lastName.trim();
        inq.clientPhone = phone;
        inq.serviceLine = (serviceLine as ServiceLine) || 'home_health';
        inq.branch = branch;
        inq.serviceRequested = sourceOrService;
        inq.followUpDate = targetDate;
        inq.assignedTeamMember = assignedClinician;
        inq.comments = notes;
        onSuccess?.(`Updated inquiry for ${inq.clientFirstName} ${inq.clientLastName}`);
      } else {
        // Create new inquiry
        const contactParts = contactName.trim().split(' ');
        const newInq: Omit<Inquiry, 'id'> = {
          inquiryDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          clientFirstName: firstName.trim(),
          clientLastName: lastName.trim(),
          clientPhone: phone,
          clientPhoneType: 'Home',
          contactFirstName: contactParts[0] || 'Family',
          contactLastName: contactParts.slice(1).join(' ') || 'Contact',
          contactPhone: contactPhone || phone,
          contactPhoneType: 'Mobile',
          contactRelationship: contactRelation,
          branch: branch,
          organization: 'Standards Home Care',
          serviceRequested: sourceOrService || 'Skilled Nursing Assessment',
          serviceLine: (serviceLine as ServiceLine) || 'home_health',
          assignedTeamMember: assignedClinician,
          followUpDate: targetDate,
          comments: notes,
          status: 'new',
          urgency: 'urgent'
        };
        addNewInquiry(newInq);
        onSuccess?.(`Created inquiry for ${newInq.clientFirstName} ${newInq.clientLastName}`);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col my-auto transition-colors animate-scaleIn">
        
        {/* Header (Shared between Inquiry & Referral) */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${
              isReferral
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            }`}>
              {isReferral ? <HeartPulse size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-950 dark:text-white tracking-tight">
                {isEditing
                  ? `Edit ${isReferral ? 'Referral' : 'Inquiry'} — ${lastName}, ${firstName}`
                  : `New ${isReferral ? 'Patient Referral' : 'Lead Inquiry'}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Central Intake • Standards Home Care
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div className="space-y-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Patient Demographics & Contact
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carmene"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hileus"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-mono font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-9 px-2.5 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Caller / Contact details for Inquiry mode */}
            {!isReferral && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact / Caller</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Hernandez"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-mono font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Daughter"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Service Line & Operations */}
          <div className="space-y-3 pt-3 border-t border-pearl-200 dark:border-charcoal-750">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              2. Service Line & Operations
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Line of Service</label>
                <select
                  value={serviceLine}
                  onChange={(e) => setServiceLine(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="home_health">Home Health</option>
                  <option value="home_care">Home Care</option>
                  <option value="hospice">Hospice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Standards Home Care">Standards Home Care</option>
                  <option value="Dallas Main Branch">Dallas Main Branch</option>
                  <option value="Plano Regional Branch">Plano Regional Branch</option>
                  <option value="Fort Worth Branch">Fort Worth Branch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isReferral ? 'Referral Source' : 'Service Requested'}
                </label>
                <input
                  type="text"
                  placeholder={isReferral ? 'e.g. Baylor Scott & White' : 'e.g. Skilled Nursing Assessment'}
                  value={sourceOrService}
                  onChange={(e) => setSourceOrService(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isReferral ? 'Requested SOC Date' : 'Follow-Up Date'}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Services & Notes */}
          <div className="space-y-3 pt-3 border-t border-pearl-200 dark:border-charcoal-750">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              3. Clinical Services & Triage Notes
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Services</label>
              <div className="flex flex-wrap gap-1.5">
                {availableServices.map((svc) => {
                  const isSelected = selectedServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {isReferral && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">DME Equipment Needed</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableDme.map((dme) => {
                    const isSelected = selectedDme.includes(dme);
                    return (
                      <button
                        key={dme}
                        type="button"
                        onClick={() => toggleDme(dme)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 border border-pearl-200 dark:border-charcoal-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {dme}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Notes & Observations</label>
              <textarea
                rows={3}
                placeholder="Enter diagnosis, hospital discharge summary, primary caregiver instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-pearl-200 dark:border-charcoal-750 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-pearl-50 dark:hover:bg-charcoal-750 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              {isEditing
                ? 'Save Changes'
                : isReferral
                ? 'Create Referral'
                : 'Create Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

