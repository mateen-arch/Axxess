import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HeartPulse,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Building2,
  ShieldAlert,
  Calendar,
  Phone,
  MapPin,
  FileText,
  UserCheck,
  Stethoscope,
  X
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminPatient } from '../types/admin';

export const PatientsGovernancePage: React.FC = () => {
  const { refreshTrigger, triggerRefresh, showToast } = useAdmin();
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [serviceLine, setServiceLine] = useState('all');
  const [approvalStatus, setApprovalStatus] = useState('all');
  const [branch, setBranch] = useState('all');

  // Modal / Drawer state
  const [inspectPatient, setInspectPatient] = useState<AdminPatient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<AdminPatient | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, [search, serviceLine, approvalStatus, branch, refreshTrigger]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPatients({
        search,
        serviceLine,
        approvalStatus,
        branch
      });
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch patients', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (patient: AdminPatient) => {
    try {
      setActionInProgressId(patient.id);
      const res = await adminApi.approvePatient(patient.id);
      if (res.success) {
        showToast(`Patient ${patient.first_name} ${patient.last_name} approved & published to CareOrbit!`, 'success');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (patient: AdminPatient) => {
    const reason = window.prompt(`Provide rejection reason for ${patient.first_name} ${patient.last_name}:`, 'Incomplete clinical referral data');
    if (reason === null) return;

    try {
      setActionInProgressId(patient.id);
      const res = await adminApi.rejectPatient(patient.id, reason);
      if (res.success) {
        showToast(`Patient ${patient.first_name} ${patient.last_name} marked as rejected.`, 'info');
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    try {
      setActionInProgressId(patientToDelete.id);
      const res = await adminApi.deletePatient(patientToDelete.id);
      if (res.success) {
        showToast(`Patient ${patientToDelete.first_name} ${patientToDelete.last_name} removed.`, 'info');
        setPatientToDelete(null);
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Metrics
  const totalCount = patients.length;
  const pendingCount = patients.filter(p => p.approval_status === 'pending_approval').length;
  const approvedCount = patients.filter(p => p.approval_status === 'approved' || !p.approval_status).length;
  const rejectedCount = patients.filter(p => p.approval_status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-charcoal-850 p-6 rounded-2xl border border-pearl-200 dark:border-charcoal-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <HeartPulse size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Patients Governance & Approvals
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1 border border-amber-500/20 animate-pulse">
                  <Clock size={12} />
                  {pendingCount} Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supervise patient admissions across Central Intake and Home Health. Unapproved patients stay hidden from the client portal.
            </p>
          </div>
        </div>

        <button
          onClick={loadPatients}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Stat Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all branches & services</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock size={14} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Hidden from client website</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Approved & Active</span>
            <CheckCircle2 size={14} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Visible in clinical portal</div>
        </div>

        <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Rejected / Inactive</span>
            <XCircle size={14} />
          </div>
          <div className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1">{rejectedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Discharged or declined</div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white dark:bg-charcoal-850 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, MRN, diagnosis, or attending doctor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Service Line Filter */}
          <select
            value={serviceLine}
            onChange={(e) => setServiceLine(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">All Service Lines</option>
            <option value="home_health">Home Health</option>
            <option value="home_care">Home Care</option>
            <option value="hospice">Hospice</option>
          </select>

          {/* Approval Status Filter */}
          <select
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">All Approval States</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved & Active</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Branch Filter */}
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">All Branches</option>
            <option value="Main Branch">Main Branch</option>
            <option value="Standards Home Care">Standards Home Care</option>
            <option value="North Texas Regional">North Texas Regional</option>
          </select>
        </div>
      </div>

      {/* 4. Patients Master Table */}
      <div className="bg-white dark:bg-charcoal-850 rounded-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-100/70 dark:bg-charcoal-800/70 border-b border-pearl-200 dark:border-charcoal-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Patient & MRN</th>
                <th className="py-3.5 px-4">Service & Branch</th>
                <th className="py-3.5 px-4">Clinical Diagnosis</th>
                <th className="py-3.5 px-4">Attending Physician</th>
                <th className="py-3.5 px-4">Admission Date</th>
                <th className="py-3.5 px-4 text-center">Risks</th>
                <th className="py-3.5 px-4 text-center">Governance Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading patient governance records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No patient records matched the specified filters.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const isPending = p.approval_status === 'pending_approval';
                  const isRejected = p.approval_status === 'rejected';
                  const isApproved = p.approval_status === 'approved' || !p.approval_status;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-pearl-50/80 dark:hover:bg-charcoal-800/50 transition-colors ${
                        isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Name & MRN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                            isPending
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{p.last_name}, {p.first_name}</span>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                #{p.mrn}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              DOB: {p.dob || 'N/A'} • {p.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service & Branch */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {p.service_line?.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 size={10} />
                          {p.branch || 'Main Branch'}
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="font-medium text-slate-700 dark:text-slate-300 truncate" title={p.primary_diagnosis}>
                          {p.primary_diagnosis || 'Unspecified'}
                        </div>
                        {p.insurance_name && (
                          <div className="text-[10px] text-slate-400 truncate">
                            Ins: {p.insurance_name}
                          </div>
                        )}
                      </td>

                      {/* Attending Physician */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {p.attending_physician || 'None Assigned'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Nurse: {p.assigned_clinician_name || 'Unassigned'}
                        </div>
                      </td>

                      {/* Admission Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {p.admission_date || p.start_of_care_date || 'N/A'}
                        </div>
                        {p.episode_end && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            End: {p.episode_end}
                          </div>
                        )}
                      </td>

                      {/* Risk Factors */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.fall_risk && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-extrabold text-[9px]" title="High Fall Risk">
                              FALL
                            </span>
                          )}
                          {p.hospitalization_risk && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 font-extrabold text-[9px]" title="Hospitalization Risk">
                              HOSP
                            </span>
                          )}
                          {!p.fall_risk && !p.hospitalization_risk && (
                            <span className="text-[10px] text-slate-400">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                            <Clock size={11} />
                            Pending Admin Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Approved & Published
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle size={11} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(p)}
                                disabled={actionInProgressId === p.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Approve patient and publish to client portal"
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(p)}
                                disabled={actionInProgressId === p.id}
                                className="px-2 py-1 rounded-lg bg-pearl-200 hover:bg-rose-100 hover:text-rose-700 dark:bg-charcoal-750 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                                title="Reject admission"
                              >
                                <XCircle size={12} />
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setInspectPatient(p)}
                            className="p-1.5 rounded-lg hover:bg-pearl-200 dark:hover:bg-charcoal-750 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Inspect full medical chart & demographics"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => setPatientToDelete(p)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                            title="Delete patient from database"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Patient Detail Modal (Portaled to body to avoid clipping) */}
      {inspectPatient && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setInspectPatient(null)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-pearl-200 dark:border-charcoal-700 flex items-center justify-between bg-pearl-50/50 dark:bg-charcoal-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                  {inspectPatient.first_name[0]}{inspectPatient.last_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {inspectPatient.last_name}, {inspectPatient.first_name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    MRN #{inspectPatient.mrn} • Status: {inspectPatient.approval_status}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectPatient(null)}
                className="p-1.5 rounded-lg hover:bg-pearl-200 dark:hover:bg-charcoal-700 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Demographics Card */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Demographics & Address</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-pearl-50 dark:bg-charcoal-800 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectPatient.dob || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gender</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{inspectPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Branch</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectPatient.branch || 'Main Branch'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block">Residential Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {inspectPatient.address_street || 'N/A'}, {inspectPatient.address_city} {inspectPatient.address_state} {inspectPatient.address_zip}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {inspectPatient.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical EHR Information */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Clinical EHR Profile</h4>
                <div className="grid grid-cols-2 gap-3 bg-pearl-50 dark:bg-charcoal-800 p-4 rounded-xl border border-pearl-200 dark:border-charcoal-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Primary Diagnosis</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectPatient.primary_diagnosis || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Attending Physician</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectPatient.attending_physician || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Primary Insurance</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectPatient.insurance_name || 'N/A'} ({inspectPatient.policy_number || 'No Policy #'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Start of Care / Cert Period</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {inspectPatient.start_of_care_date || inspectPatient.admission_date || 'N/A'} to {inspectPatient.episode_end || 'Open'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Protocol Settings */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Patient Safety & Code Status</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    inspectPatient.fall_risk ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-pearl-100 text-slate-600 dark:bg-charcoal-800 dark:text-slate-300'
                  }`}>
                    Fall Risk: {inspectPatient.fall_risk ? 'YES (High)' : 'Standard'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    inspectPatient.hospitalization_risk ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-pearl-100 text-slate-600 dark:bg-charcoal-800 dark:text-slate-300'
                  }`}>
                    Hospitalization Risk: {inspectPatient.hospitalization_risk ? 'YES' : 'No'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pearl-100 text-slate-600 dark:bg-charcoal-800 dark:text-slate-300">
                    Code Status: {inspectPatient.full_code ? 'FULL CODE' : 'DNR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-end gap-2 bg-pearl-50/50 dark:bg-charcoal-800/50">
              {inspectPatient.approval_status === 'pending_approval' && (
                <button
                  onClick={() => {
                    handleApprove(inspectPatient);
                    setInspectPatient(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Approve & Publish to Portal
                </button>
              )}
              <button
                onClick={() => setInspectPatient(null)}
                className="px-4 py-2 rounded-xl bg-pearl-200 hover:bg-pearl-300 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. Delete Confirmation Modal */}
      {patientToDelete && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setPatientToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Patient Record</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{patientToDelete.first_name} {patientToDelete.last_name}</strong> (MRN #{patientToDelete.mrn})? This will cascade delete associated tasks, visits, and clinical episodes.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-3.5 py-2 rounded-xl bg-pearl-100 hover:bg-pearl-200 dark:bg-charcoal-750 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
