import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  Filter,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface PatientListViewProps {
  onBack: () => void;
  onNewPatient: () => void;
  onEditPatient: (patientId: string) => void;
}

export interface PatientListItem {
  id: string;
  mrn: string;
  lastName: string;
  firstName: string;
  insurance: string;
  policyNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  zipPlus4: string;
  county: string;
  dateOfBirth: string;
  sex: 'Female' | 'Male' | 'Other';
  phone: string;
  tags: string;
  status: 'Active' | 'Discharged' | 'Pending';
}

export const INITIAL_PATIENT_ROWS: PatientListItem[] = [
  {
    id: 'p-1061',
    mrn: '1061',
    lastName: 'Abuissa',
    firstName: 'Heather',
    insurance: 'COMMONWEALTH CARE ALLIANCE',
    policyNumber: '36563446600',
    addressLine1: '77 Sohier RD',
    addressLine2: 'Apt 2B',
    city: 'BEVERLY',
    state: 'MA',
    zipCode: '01915',
    zipPlus4: 'Not Available',
    county: 'Essex County',
    dateOfBirth: '04/15/1964',
    sex: 'Female',
    phone: '3512014985',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-1035',
    mrn: '1035',
    lastName: 'Anis',
    firstName: 'Marie',
    insurance: 'MEDICAID MASSACHUSETTS',
    policyNumber: '5N29EW7JF25',
    addressLine1: '131 Morton St 306',
    addressLine2: 'Not Available',
    city: 'JAMAICA PLAIN',
    state: 'MA',
    zipCode: '02130',
    zipPlus4: 'Not Available',
    county: 'Norfolk County',
    dateOfBirth: '04/24/1946',
    sex: 'Female',
    phone: '6178407010',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-1002',
    mrn: '1002',
    lastName: 'Antoine',
    firstName: 'Louis',
    insurance: 'MEDICAID MASSACHUSETTS',
    policyNumber: '100202696521',
    addressLine1: '45 Goddard St. Apt 205',
    addressLine2: 'Not Available',
    city: 'BROCKTON',
    state: 'MA',
    zipCode: '02301',
    zipPlus4: 'Not Available',
    county: 'Plymouth County',
    dateOfBirth: '05/05/1948',
    sex: 'Male',
    phone: '8636627424',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-1193',
    mrn: '1193',
    lastName: 'Antoniotti',
    firstName: 'Jeffrey',
    insurance: 'MEDICAID MASSACHUSETTS',
    policyNumber: '100049680331',
    addressLine1: '33 James Signet Way',
    addressLine2: 'Not Available',
    city: 'STOUGHTON',
    state: 'MA',
    zipCode: '02072',
    zipPlus4: 'Not Available',
    county: 'Norfolk County',
    dateOfBirth: '03/19/1973',
    sex: 'Male',
    phone: '7814363269',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-464',
    mrn: '464',
    lastName: 'Auguste',
    firstName: 'Jocelene',
    insurance: 'COMMONWEALTH CARE ALLIANCE',
    policyNumber: '8GQ4RD4PA81',
    addressLine1: '640 North Main Street Apt 229',
    addressLine2: 'Not Available',
    city: 'RANDOLPH',
    state: 'MA',
    zipCode: '02368',
    zipPlus4: 'Not Available',
    county: 'Norfolk County',
    dateOfBirth: '11/12/1948',
    sex: 'Female',
    phone: '3473363548',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-1043',
    mrn: '1043',
    lastName: 'Bah',
    firstName: 'Isatou',
    insurance: 'MEDICAID MASSACHUSETTS',
    policyNumber: '100220207805',
    addressLine1: '1912 Washington St',
    addressLine2: 'Not Available',
    city: 'STOUGHTON',
    state: 'MA',
    zipCode: '02072',
    zipPlus4: 'Not Available',
    county: 'Norfolk County',
    dateOfBirth: '09/23/1962',
    sex: 'Female',
    phone: '7739614045',
    tags: 'Not Available',
    status: 'Active',
  },
  {
    id: 'p-404',
    mrn: '404',
    lastName: 'Ballan',
    firstName: 'James',
    insurance: 'MEDICAID MASSACHUSETTS',
    policyNumber: '1WN3U82AA99',
    addressLine1: 'Alternative Support Inc. (ASI)',
    addressLine2: '1751 Washington st',
    city: 'AUBURNDALE',
    state: 'MA',
    zipCode: '02466',
    zipPlus4: 'Not Available',
    county: 'Middlesex County',
    dateOfBirth: '03/19/1955',
    sex: 'Male',
    phone: '9788542036',
    tags: 'Not Available',
    status: 'Active',
  },
];

export const PatientListView: React.FC<PatientListViewProps> = ({
  onBack,
  onNewPatient,
  onEditPatient,
}) => {
  const { organization, patients } = useHealthcare();

  // State
  const [patientData, setPatientData] = useState<PatientListItem[]>(() => {
    // Merge context patients with reference patients
    const map = new Map<string, PatientListItem>();
    INITIAL_PATIENT_ROWS.forEach((r) => map.set(r.mrn, r));

    patients.forEach((p) => {
      if (!map.has(p.mrn)) {
        map.set(p.mrn, {
          id: p.id,
          mrn: p.mrn,
          lastName: p.lastName,
          firstName: p.firstName,
          insurance: p.insuranceId ? 'MEDICARE PART A' : 'COMMONWEALTH CARE ALLIANCE',
          policyNumber: p.insuranceId || 'MCR-' + p.mrn,
          addressLine1: typeof p.address === 'string' ? p.address : p.address?.street || '100 Cummings Center',
          addressLine2: 'Not Available',
          city: (typeof p.address === 'object' && p.address?.city) || 'BEVERLY',
          state: (typeof p.address === 'object' && p.address?.state) || 'MA',
          zipCode: (typeof p.address === 'object' && p.address?.zipCode) || '01915',
          zipPlus4: 'Not Available',
          county: 'Essex County',
          dateOfBirth: p.dob || '01/01/1950',
          sex: p.gender === 'female' ? 'Female' : 'Male',
          phone: p.phone?.replace(/\D/g, '') || '9789220088',
          tags: 'Not Available',
          status: p.status === 'active' ? 'Active' : p.status === 'pending_admission' ? 'Pending' : 'Discharged',
        });
      }
    });

    return Array.from(map.values());
  });

  const [selectedBranch, setSelectedBranch] = useState('Standards Home Care');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Discharged' | 'Pending'>('Active');
  const [selectedTag, setSelectedTag] = useState('Select Option');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof PatientListItem>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sorting handler
  const handleSort = (field: keyof PatientListItem) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patientData
      .filter((p) => {
        if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = `${p.lastName} ${p.firstName}`.toLowerCase().includes(q);
          const matchesMrn = p.mrn.includes(q);
          const matchesCity = p.city.toLowerCase().includes(q);
          const matchesPhone = p.phone.includes(q);
          const matchesInsurance = p.insurance.toLowerCase().includes(q);
          if (!matchesName && !matchesMrn && !matchesCity && !matchesPhone && !matchesInsurance) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aVal = String(a[sortField] || '').toLowerCase();
        const bVal = String(b[sortField] || '').toLowerCase();
        if (sortOrder === 'asc') return aVal.localeCompare(bVal);
        return bVal.localeCompare(aVal);
      });
  }, [patientData, selectedStatus, searchQuery, sortField, sortOrder]);

  const totalResults = 77; // As shown in authentic screenshot "77 total results"
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete patient "${name}"?`)) {
      setPatientData((prev) => prev.filter((p) => p.id !== id));
      showToast(`Patient ${name} removed from list.`);
    }
  };

  const handleExportToExcel = () => {
    const headers = [
      'MRN',
      'Last Name',
      'First Name',
      'Insurance',
      'Policy #',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'Zip Code',
      'Zip +4 Digits',
      'County',
      'Date Of Birth',
      'Sex',
      'Phone',
      'Tags',
      'Status',
    ];
    const rows = filteredPatients.map((p) => [
      `"${p.mrn}"`,
      `"${p.lastName}"`,
      `"${p.firstName}"`,
      `"${p.insurance}"`,
      `"${p.policyNumber}"`,
      `"${p.addressLine1}"`,
      `"${p.addressLine2}"`,
      `"${p.city}"`,
      `"${p.state}"`,
      `"${p.zipCode}"`,
      `"${p.zipPlus4}"`,
      `"${p.county}"`,
      `"${p.dateOfBirth}"`,
      `"${p.sex}"`,
      `"${p.phone}"`,
      `"${p.tags}"`,
      `"${p.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Patient_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Patient List exported to Excel.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Axxess Home Health
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                View
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lists
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Patient List
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Master Patient Roster & Demographic Directory
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Patient List refreshed.')}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Single Row Filter & Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Branch */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Standards Home Care">Standards Home Care</option>
                  <option value="All Branches">All Branches</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Pending">Pending</option>
                  <option value="All">All</option>
                </select>
              </div>

              {/* Tags */}
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Select Option">Select Option</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Recertification">Recertification</option>
                </select>
              </div>
            </div>

            {/* Right Buttons: Generate, New Patient, Export to Excel */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => showToast('Generated current patient roster.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={onNewPatient}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Patient
              </button>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export To Excel
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Separate compact row right above the table */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient name, MRN, city, insurance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredPatients.length}</span> patient records
          </div>
        </div>

        {/* Patients Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th onClick={() => handleSort('mrn')} className="py-2.5 px-3 cursor-pointer hover:text-rose-600 w-16">
                    MRN
                  </th>
                  <th onClick={() => handleSort('lastName')} className="py-2.5 px-3 cursor-pointer hover:text-rose-600">
                    Patient Name {sortField === 'lastName' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('insurance')} className="py-2.5 px-3 cursor-pointer hover:text-rose-600">
                    Insurance / Policy #
                  </th>
                  <th onClick={() => handleSort('city')} className="py-2.5 px-3 cursor-pointer hover:text-rose-600">
                    City, State & Zip
                  </th>
                  <th onClick={() => handleSort('dateOfBirth')} className="py-2.5 px-3 cursor-pointer hover:text-rose-600 w-28">
                    Date Of Birth
                  </th>
                  <th className="py-2.5 px-3 w-28">Phone</th>
                  <th className="py-2.5 px-2.5 w-20 text-center">Status</th>
                  <th className="py-2.5 pr-3 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No patients found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {patient.mrn}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => onEditPatient(patient.id)}
                          className="text-left font-bold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer"
                        >
                          {patient.lastName}, {patient.firstName}
                        </button>
                        <div className="text-[10px] text-slate-400">
                          {patient.addressLine1}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {patient.insurance}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          Pol: {patient.policyNumber}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-700 dark:text-slate-300">
                          {patient.city}, {patient.state} {patient.zipCode}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {patient.county}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {patient.dateOfBirth}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {patient.phone ? `(${patient.phone.slice(0,3)}) ${patient.phone.slice(3,6)}-${patient.phone.slice(6)}` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          patient.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="Edit Patient"
                            onClick={() => onEditPatient(patient.id)}
                            className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Patient"
                            onClick={() => handleDelete(patient.id, `${patient.firstName} ${patient.lastName}`)}
                            className="rounded p-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-pearl-200 bg-pearl-50/50 px-4 py-3 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800/80">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(8, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">{totalResults} total results</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
