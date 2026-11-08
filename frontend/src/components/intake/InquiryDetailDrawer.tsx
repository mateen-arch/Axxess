import React from 'react';
import { X, User, Phone, MapPin, Calendar, HeartPulse, FileText, CheckCircle2, ArrowRight, ShieldCheck, Clock, Building2, Trash2 } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const InquiryDetailDrawer: React.FC = () => {
  const { selectedInquiry, setSelectedInquiry, convertInquiryToReferral, deleteInquiry } = useHealthcare();

  if (!selectedInquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-charcoal-900 h-full shadow-2xl border-l border-pearl-200 dark:border-charcoal-700 flex flex-col justify-between overflow-y-auto transition-colors">
        
        {/* Top Header */}
        <div className="p-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/70 dark:bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
              {selectedInquiry.clientFirstName[0]}{selectedInquiry.clientLastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-950 dark:text-white text-lg">
                  {selectedInquiry.clientFirstName} {selectedInquiry.clientLastName}
                </h3>
                <span className={`badge ${
                  selectedInquiry.serviceLine === 'home_health' ? 'badge-crimson' :
                  selectedInquiry.serviceLine === 'home_care' ? 'badge-slate' : 'badge-green'
                } text-[10px]`}>
                  {selectedInquiry.serviceLine.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Inquiry ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{selectedInquiry.id}</span> • {selectedInquiry.branch}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedInquiry(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-pearl-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status Alert Banner */}
          <div className="p-3.5 rounded-xl bg-pearl-100/70 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                selectedInquiry.status === 'converted' ? 'bg-emerald-500' :
                selectedInquiry.status === 'new' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}></span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Status: {selectedInquiry.status.replace('_', ' ')}
              </span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Inquiry Date: <strong className="text-slate-800 dark:text-slate-200">{selectedInquiry.inquiryDate}</strong>
            </span>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 rounded-xl bg-pearl-50 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <User size={14} className="stroke-[2.5]" />
              <span>Contact / Caller Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Contact Person</span>
                <strong className="text-slate-900 dark:text-white font-bold">{selectedInquiry.contactFirstName} {selectedInquiry.contactLastName}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Relationship</span>
                <strong className="text-slate-900 dark:text-white font-bold">{selectedInquiry.contactRelationship || 'Family'}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Primary Phone</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedInquiry.contactPhone}</span>
                <span className="ml-1 text-[10px] text-slate-400">({selectedInquiry.contactPhoneType})</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Client Phone</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedInquiry.clientPhone || 'Same as contact'}</span>
              </div>
            </div>
          </div>

          {/* Clinical Service & Assignment */}
          <div className="p-4 rounded-xl bg-pearl-50 dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <HeartPulse size={14} className="stroke-[2.5]" />
              <span>Service Request & Assignment</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Service Requested</span>
                <strong className="text-slate-900 dark:text-white font-bold">{selectedInquiry.serviceRequested}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Assigned Team Member</span>
                <strong className="text-rose-600 dark:text-rose-400 font-bold">{selectedInquiry.assignedTeamMember}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Follow-Up Date</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedInquiry.followUpDate}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Branch Location</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedInquiry.branch}</span>
              </div>
            </div>
          </div>

          {/* Clinical Comments & Notes */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={14} className="stroke-[2.5]" />
              <span>Intake Comments & Referral Notes</span>
            </div>
            <div className="p-4 rounded-xl bg-pearl-100/60 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
              {selectedInquiry.comments || 'No comments recorded for this intake lead.'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-850 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              deleteInquiry(selectedInquiry.id);
              setSelectedInquiry(null);
            }}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            title="Delete this inquiry"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pearl-100 dark:hover:bg-charcoal-750 border border-pearl-200 dark:border-charcoal-700 rounded-xl transition-colors"
            >
              Close
            </button>

            {selectedInquiry.status !== 'converted' ? (
              <button
                onClick={() => {
                  convertInquiryToReferral(selectedInquiry.id);
                  setSelectedInquiry(null);
                }}
                className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 size={15} />
                <span>Convert to Referral</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-800">
                Converted to Referral
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
