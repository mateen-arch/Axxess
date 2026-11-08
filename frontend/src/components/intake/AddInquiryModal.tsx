import React, { useState } from 'react';
import { X, Search, Phone, User, Calendar, Building2, FileText, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ServiceLine, PriorityLevel } from '../../types';

export const AddInquiryModal: React.FC = () => {
  const { isInquiryModalOpen, setIsInquiryModalOpen, addNewInquiry } = useHealthcare();

  // Contact State
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactMiddleInitial, setContactMiddleInitial] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhoneType, setContactPhoneType] = useState<'Home' | 'Mobile' | 'Work'>('Home');
  const [contactPhoneExtn, setContactPhoneExtn] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Daughter / Family');

  // Client / Patient State
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientMiddleInitial, setClientMiddleInitial] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPhoneType, setClientPhoneType] = useState<'Home' | 'Mobile' | 'Work'>('Home');

  // Operational State
  const [branch, setBranch] = useState('Dallas Main Branch');
  const [inquiryDate, setInquiryDate] = useState('2026-11-02');
  const [serviceRequested, setServiceRequested] = useState('Skilled Nursing & Wound Care');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('home_health');
  const [assignedTeamMember, setAssignedTeamMember] = useState('Sarah Jenkins, RN');
  const [followUpDate, setFollowUpDate] = useState('2026-11-04');
  const [comments, setComments] = useState('');
  const [urgency, setUrgency] = useState<PriorityLevel>('routine');

  // Quick Template Search & Picker
  const [templateSearch, setTemplateSearch] = useState('');
  const templates = [
    { title: 'Post-Surgical Hospital Discharge', text: 'Hospital discharge pending. Patient requires post-operative wound assessment, surgical dressing changes, and in-home medication reconciliation.' },
    { title: 'Physical Therapy / Fall Rehab', text: 'Patient experienced recent mobility decline / fall. Physician orders gait training, home safety assessment, and physical rehabilitation.' },
    { title: 'Home Care Personal Assistance', text: 'Family requesting personal care aide assistance with bathing, dressing, meal preparation, and transfer safety support.' },
    { title: 'Palliative Comfort Consultation', text: 'Family requesting initial consult on palliative comfort management, symptom relief, and interdisciplinary support services.' }
  ];

  if (!isInquiryModalOpen) return null;

  const handleApplyTemplate = (text: string) => {
    setComments(prev => prev ? `${prev}\n\n${text}` : text);
    setTemplateSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFirstName.trim() || !contactLastName.trim()) {
      alert('Please fill out the contact name.');
      return;
    }
    if (!contactPhone.trim()) {
      alert('Please enter a contact phone number.');
      return;
    }

    addNewInquiry({
      inquiryDate,
      clientFirstName: clientFirstName.trim() || contactFirstName.trim(),
      clientMiddleInitial,
      clientLastName: clientLastName.trim() || contactLastName.trim(),
      clientPhone,
      clientPhoneType,
      contactFirstName: contactFirstName.trim(),
      contactMiddleInitial,
      contactLastName: contactLastName.trim(),
      contactPhone: contactPhone.trim(),
      contactPhoneType,
      contactPhoneExtn,
      contactRelationship,
      branch,
      organization: 'Standards Home Care',
      serviceRequested,
      serviceLine,
      assignedTeamMember,
      followUpDate,
      comments,
      status: 'new',
      urgency
    });

    setIsInquiryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col my-auto transition-colors">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 rounded-full bg-rose-600"></div>
            <div>
              <h3 className="font-extrabold text-slate-950 dark:text-white text-lg tracking-tight">Add Inquiry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standards Home Care • Central Intake Intake Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInquiryModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-750 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Visual Blue Left Accent Line (matching reference screenshot) */}
            <div className="hidden md:block absolute -left-6 top-0 bottom-0 w-1 bg-sky-500 rounded-r-md"></div>

            {/* LEFT COLUMN: Contact / Caller Information */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <User size={13} className="stroke-[2.5]" />
                <span>Contact / Inquirer Information</span>
              </div>

              {/* Name fields */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Contact Name <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <input
                      type="text"
                      required
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder="First Name *"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={contactMiddleInitial}
                      onChange={(e) => setContactMiddleInitial(e.target.value)}
                      placeholder="M.I."
                      className="w-full px-2 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-center focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder="Last Name *"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Contact Phone Number <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={contactPhoneType}
                    onChange={(e) => setContactPhoneType(e.target.value as any)}
                    className="w-24 px-2 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Work">Work</option>
                  </select>

                  <div className="flex items-center px-2 py-2 border border-pearl-200 dark:border-charcoal-700 bg-pearl-100/70 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg shrink-0">
                    🇺🇸 +1
                  </div>

                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(214) 555-0199 *"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="text"
                    value={contactPhoneExtn}
                    onChange={(e) => setContactPhoneExtn(e.target.value)}
                    placeholder="Extn."
                    className="w-16 px-2 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Relationship to Client
                </label>
                <select
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="Daughter / Family">Daughter / Primary Family</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Self">Self (Patient Inquiring)</option>
                  <option value="Power of Attorney">Legal Power of Attorney</option>
                  <option value="Hospital Social Worker">Hospital Social Worker / Discharge Planner</option>
                  <option value="Physician Office">Physician Clinic Coordinator</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Branch <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="Dallas Main Branch">Standards Home Care - Dallas Main Branch</option>
                  <option value="Fort Worth Branch">Standards Home Care - Fort Worth Branch</option>
                  <option value="Plano Regional Branch">Standards Home Care - Plano Regional Branch</option>
                </select>
              </div>

              {/* Inquiry Date & Follow-Up */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Inquiry Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={inquiryDate}
                    onChange={(e) => setInquiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Client (Patient) Information & Comments */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <User size={13} className="stroke-[2.5]" />
                <span>Client / Patient Information</span>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Client Name (Leave blank if same as Contact)
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={clientFirstName}
                      onChange={(e) => setClientFirstName(e.target.value)}
                      placeholder="Client First Name"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={clientMiddleInitial}
                      onChange={(e) => setClientMiddleInitial(e.target.value)}
                      placeholder="M.I."
                      className="w-full px-2 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-center focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={clientLastName}
                      onChange={(e) => setClientLastName(e.target.value)}
                      placeholder="Client Last Name"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Client Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Client Phone Number
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={clientPhoneType}
                    onChange={(e) => setClientPhoneType(e.target.value as any)}
                    className="w-24 px-2 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Work">Work</option>
                  </select>

                  <div className="flex items-center px-2 py-2 border border-pearl-200 dark:border-charcoal-700 bg-pearl-100/70 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg shrink-0">
                    🇺🇸 +1
                  </div>

                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Enter Client Phone Number"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Service Requested & Line */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Service Line
                  </label>
                  <select
                    value={serviceLine}
                    onChange={(e) => setServiceLine(e.target.value as ServiceLine)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="home_health">Home Health</option>
                    <option value="home_care">Home Care</option>
                    <option value="hospice">Hospice Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Service Focus
                  </label>
                  <input
                    type="text"
                    value={serviceRequested}
                    onChange={(e) => setServiceRequested(e.target.value)}
                    placeholder="e.g. Skilled Nursing, Physical Therapy"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Comments & Template Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Comments / Clinical Notes
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Intake Log</span>
                </div>

                {/* Template Search Bar */}
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search for Clinical Template..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Filtered Template Badges */}
                {templateSearch && (
                  <div className="p-2 mb-2 rounded-lg bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block">Click to insert template:</span>
                    {templates
                      .filter(t => t.title.toLowerCase().includes(templateSearch.toLowerCase()))
                      .map((t, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleApplyTemplate(t.text)}
                          className="w-full text-left p-1.5 rounded hover:bg-white dark:hover:bg-charcoal-700 font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between"
                        >
                          <span>{t.title}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold">+ Insert</span>
                        </button>
                      ))}
                  </div>
                )}

                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter detailed comments, referral source context, physician orders, or patient mobility needs..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium leading-relaxed resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsInquiryModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-sm transition-all"
            >
              Add Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
