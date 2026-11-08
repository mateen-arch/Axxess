import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Printer,
  RefreshCw,
  Edit2,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Home,
  DollarSign,
  Paperclip,
  MoreHorizontal,
  Maximize2,
  FileText,
  Clock,
  Shield,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface PatientChartsViewProps {
  onBack?: () => void;
  onNewPatient?: () => void;
  onEditPatient?: (patientId: string) => void;
}

interface ChartPatientRecord {
  id: string;
  mrn: string;
  lastName: string;
  firstName: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  status: 'Active' | 'Discharged' | 'Pending';
  episodeStart: string;
  episodeEnd: string;
  startOfCareDate: string;
  attendingPhysician: string;
  insuranceName: string;
  policyNumber: string;
  primaryContact: string;
  secondaryContact: string;
  risks: string[];
}

interface ScheduleTaskRow {
  id: string;
  task: string;
  scheduleDate: string;
  assignedTo: string;
  status: string;
  comments: string;
  hasAttachment?: boolean;
}

const SAMPLE_CHART_PATIENTS: ChartPatientRecord[] = [
  {
    id: 'pat-abuissa',
    mrn: '1061',
    lastName: 'ABUISSA',
    firstName: 'HEATHER',
    dob: '04/15/1964',
    age: 62,
    gender: 'Female',
    phone: '(351) 201-4985',
    address: '77 Sohier RD Apt 2B, Beverly, MA 01915',
    status: 'Active',
    episodeStart: '10/26/2026',
    episodeEnd: '12/24/2026',
    startOfCareDate: '10/26/2026',
    attendingPhysician: 'RIGALI, LESLIE DO',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    policyNumber: '36563446600',
    primaryContact: 'Not Available',
    secondaryContact: 'DEREK PRIME (617) 595-9512',
    risks: ['Full Code', 'Fall Risk', 'Hospitalization Risk', 'Infection Risk'],
  },
  {
    id: 'pat-anis',
    mrn: '1062',
    lastName: 'ANIS',
    firstName: 'MARIE V',
    dob: '02/10/1958',
    age: 68,
    gender: 'Female',
    phone: '(617) 293-8472',
    address: '14 Harvard Ave, Boston, MA 02134',
    status: 'Active',
    episodeStart: '10/15/2026',
    episodeEnd: '12/13/2026',
    startOfCareDate: '10/15/2026',
    attendingPhysician: 'GUPTA, MAULSHREE MD',
    insuranceName: 'MEDICARE PART A',
    policyNumber: 'MCR-9920192',
    primaryContact: 'Jean Anis (617) 293-8470',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk'],
  },
  {
    id: 'pat-antoine',
    mrn: '1063',
    lastName: 'ANTOINE',
    firstName: 'LOUIS',
    dob: '11/04/1952',
    age: 74,
    gender: 'Male',
    phone: '(781) 948-2831',
    address: '88 Washington St, Lynn, MA 01902',
    status: 'Active',
    episodeStart: '10/01/2026',
    episodeEnd: '11/29/2026',
    startOfCareDate: '10/01/2026',
    attendingPhysician: 'KOWALOFF, EDWARD M.D.',
    insuranceName: 'MEDICAID',
    policyNumber: 'MCD-839210',
    primaryContact: 'Marie Antoine (781) 948-2830',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Hospitalization Risk'],
  },
  {
    id: 'pat-antoniotti',
    mrn: '1064',
    lastName: 'ANTONIOTTI',
    firstName: 'JEFFREY C',
    dob: '08/21/1960',
    age: 66,
    gender: 'Male',
    phone: '(978) 582-1920',
    address: '402 Cabot St, Beverly, MA 01915',
    status: 'Active',
    episodeStart: '10/10/2026',
    episodeEnd: '12/08/2026',
    startOfCareDate: '10/10/2026',
    attendingPhysician: 'GUPTA, MAULSHREE MD',
    insuranceName: 'MEDICAID',
    policyNumber: 'MCD-910283',
    primaryContact: 'Jeffrey Antoniotti Jr (978) 582-1922',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk', 'Infection Risk'],
  },
  {
    id: 'pat-auguste',
    mrn: '1065',
    lastName: 'AUGUSTE',
    firstName: 'JOCELENE',
    dob: '06/18/1971',
    age: 55,
    gender: 'Female',
    phone: '(617) 582-9011',
    address: '22 River St, Mattapan, MA 02126',
    status: 'Active',
    episodeStart: '10/18/2026',
    episodeEnd: '12/16/2026',
    startOfCareDate: '10/18/2026',
    attendingPhysician: 'MUQQADUS, SYED M.D',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    policyNumber: 'CCA-109283',
    primaryContact: 'Not Available',
    secondaryContact: 'Not Available',
    risks: ['Full Code'],
  },
  {
    id: 'pat-bah',
    mrn: '1066',
    lastName: 'BAH',
    firstName: 'ISATOU',
    dob: '03/05/1982',
    age: 44,
    gender: 'Female',
    phone: '(978) 420-1922',
    address: '150 Central St, Lowell, MA 01852',
    status: 'Active',
    episodeStart: '10/20/2026',
    episodeEnd: '12/18/2026',
    startOfCareDate: '10/20/2026',
    attendingPhysician: 'YAO, YUAN M.D.',
    insuranceName: 'MEDICAID MASSACHUSETTS',
    policyNumber: 'MCD-440219',
    primaryContact: 'Mamadou Bah',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk'],
  },
  {
    id: 'pat-balian',
    mrn: '1067',
    lastName: 'BALIAN',
    firstName: 'JAMES',
    dob: '09/12/1948',
    age: 78,
    gender: 'Male',
    phone: '(781) 648-9102',
    address: '54 Mass Ave, Arlington, MA 02476',
    status: 'Active',
    episodeStart: '09/15/2026',
    episodeEnd: '11/13/2026',
    startOfCareDate: '09/15/2026',
    attendingPhysician: 'KOWALOFF, EDWARD M.D.',
    insuranceName: 'MEDICARE PART A',
    policyNumber: 'MCR-2938102',
    primaryContact: 'Nancy Balian',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk', 'Hospitalization Risk'],
  },
  {
    id: 'pat-beattie',
    mrn: '1068',
    lastName: 'BEATTIE',
    firstName: 'HELEN',
    dob: '12/03/1939',
    age: 87,
    gender: 'Female',
    phone: '(978) 745-9201',
    address: '12 Essex St, Salem, MA 01970',
    status: 'Active',
    episodeStart: '10/05/2026',
    episodeEnd: '12/03/2026',
    startOfCareDate: '10/05/2026',
    attendingPhysician: 'GUPTA, MAULSHREE MD',
    insuranceName: 'MEDICARE PART A',
    policyNumber: 'MCR-1029384',
    primaryContact: 'Robert Beattie',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk', 'Infection Risk'],
  },
  {
    id: 'pat-damitie',
    mrn: '1069',
    lastName: 'DAMITIE',
    firstName: 'CEDENIEZE',
    dob: '05/25/1959',
    age: 67,
    gender: 'Female',
    phone: '(617) 829-3019',
    address: '94 Blue Hill Ave, Roxbury, MA 02119',
    status: 'Active',
    episodeStart: '10/12/2026',
    episodeEnd: '12/10/2026',
    startOfCareDate: '10/12/2026',
    attendingPhysician: 'SANNAPAREDDY, SASIKALA M.D.',
    insuranceName: 'COMMONWEALTH CARE ALLIANCE',
    policyNumber: 'CCA-948201',
    primaryContact: 'Not Available',
    secondaryContact: 'Not Available',
    risks: ['Full Code'],
  },
  {
    id: 'pat-david',
    mrn: '1070',
    lastName: 'DAVID',
    firstName: 'JANEY',
    dob: '07/19/1963',
    age: 63,
    gender: 'Female',
    phone: '(508) 584-9021',
    address: '31 Main St, Brockton, MA 02301',
    status: 'Active',
    episodeStart: '09/28/2026',
    episodeEnd: '11/26/2026',
    startOfCareDate: '09/28/2026',
    attendingPhysician: 'RIGALI, LESLIE DO',
    insuranceName: 'MEDICAID',
    policyNumber: 'MCD-302918',
    primaryContact: 'Peter David',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk'],
  },
  {
    id: 'pat-davis',
    mrn: '1071',
    lastName: 'DAVIS',
    firstName: 'JAMES',
    dob: '01/14/1945',
    age: 81,
    gender: 'Male',
    phone: '(617) 492-3019',
    address: '100 Cambridge St, Cambridge, MA 02138',
    status: 'Active',
    episodeStart: '10/22/2026',
    episodeEnd: '12/20/2026',
    startOfCareDate: '10/22/2026',
    attendingPhysician: 'BAHNG, EDWARD M.D.',
    insuranceName: 'MEDICARE PART A',
    policyNumber: 'MCR-9482019',
    primaryContact: 'Sarah Davis',
    secondaryContact: 'Not Available',
    risks: ['Full Code', 'Fall Risk', 'Hospitalization Risk'],
  },
  {
    id: 'pat-deceus',
    mrn: '1072',
    lastName: 'DECEUS',
    firstName: 'JAVENS J.',
    dob: '10/08/1990',
    age: 36,
    gender: 'Male',
    phone: '(781) 593-1029',
    address: '45 Union St, Lynn, MA 01901',
    status: 'Active',
    episodeStart: '10/11/2026',
    episodeEnd: '12/09/2026',
    startOfCareDate: '10/11/2026',
    attendingPhysician: 'YAO, YUAN M.D.',
    insuranceName: 'MEDICAID',
    policyNumber: 'MCD-910293',
    primaryContact: 'Not Available',
    secondaryContact: 'Not Available',
    risks: ['Full Code'],
  },
];

const SAMPLE_SCHEDULE_TASKS: ScheduleTaskRow[] = [
  {
    id: 'st-1',
    task: 'LVN/LPN Visit',
    scheduleDate: '12/24/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-2',
    task: 'LVN/LPN Visit',
    scheduleDate: '12/23/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-3',
    task: 'LVN/LPN Visit',
    scheduleDate: '12/22/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-4',
    task: 'LVN/LPN Visit',
    scheduleDate: '12/21/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-5',
    task: 'OASIS-E2 Recertification',
    scheduleDate: '12/20/2026',
    assignedTo: 'Mary Kyalikunda RN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: false,
  },
  {
    id: 'st-6',
    task: 'LVN/LPN Supervisory Visit',
    scheduleDate: '12/15/2026',
    assignedTo: 'Mary Kyalikunda RN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: false,
  },
  {
    id: 'st-7',
    task: 'Coordination of Care',
    scheduleDate: '12/15/2026',
    assignedTo: 'Mary Kyalikunda RN',
    status: 'Not Yet Due',
    comments: 'Not Available',
    hasAttachment: false,
  },
  {
    id: 'st-8',
    task: 'LVN/LPN Visit',
    scheduleDate: '11/08/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Started',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-9',
    task: 'LVN/LPN Visit',
    scheduleDate: '11/07/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Not Yet Started',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-10',
    task: 'LVN/LPN Visit',
    scheduleDate: '11/02/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Submitted With Signature',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-11',
    task: 'LVN/LPN Visit',
    scheduleDate: '11/01/2026',
    assignedTo: 'Marrio Fortune LPN',
    status: 'Submitted With Signature',
    comments: 'Not Available',
    hasAttachment: true,
  },
  {
    id: 'st-12',
    task: 'Face-to-Face Encounter',
    scheduleDate: '10/26/2026',
    assignedTo: 'Selina Mwakipunda',
    status: 'Returned w/ Physician Signature',
    comments: 'Not Available',
    hasAttachment: true,
  },
];

const QUICK_LINKS = [
  'Allergy Profile',
  'Medication Profile',
  'Immunization Profile',
  'Infectious Disease Profile',
  'Authorization Listing',
  'Preadmission Notes',
  'Communication Notes',
  'Orders and Care Plans',
  'Plan of Care Summary',
  'Episode Summaries',
  'Vital Signs Charts',
];

export const PatientChartsView: React.FC<PatientChartsViewProps> = ({
  onBack,
  onNewPatient,
  onEditPatient,
}) => {
  const { organization } = useHealthcare();

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-abuissa');

  // Left sidebar filters
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active Patients');
  const [payerFilter, setPayerFilter] = useState('All');
  const [patientSearch, setPatientSearch] = useState('');

  // Right top sub-tabs
  const [topTab, setTopTab] = useState<'insights' | 'documents' | 'print'>('insights');

  // Table activity sub-tabs
  const [activityTab, setActivityTab] = useState<'schedule' | 'visit_comments' | 'episode_comments' | 'missed'>('schedule');
  const [showFilter, setShowFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('This Episode');

  // Quick action modal / toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModalLink, setActiveModalLink] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered patients for left list
  const filteredPatients = useMemo(() => {
    return SAMPLE_CHART_PATIENTS.filter((p) => {
      if (statusFilter === 'Active Patients' && p.status !== 'Active') return false;
      if (patientSearch.trim()) {
        const q = patientSearch.toLowerCase();
        return (
          p.lastName.toLowerCase().includes(q) ||
          p.firstName.toLowerCase().includes(q) ||
          p.mrn.includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, patientSearch]);

  // Current active patient
  const currentPatient = useMemo(() => {
    return (
      SAMPLE_CHART_PATIENTS.find((p) => p.id === selectedPatientId) ||
      SAMPLE_CHART_PATIENTS[0]
    );
  }, [selectedPatientId]);

  // Filtered schedule tasks
  const filteredTasks = useMemo(() => {
    return SAMPLE_SCHEDULE_TASKS.filter((t) => {
      if (showFilter !== 'All' && t.status !== showFilter) return false;
      return true;
    });
  }, [showFilter]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-pearl-200 bg-white px-4 py-2 text-xs dark:border-charcoal-700 dark:bg-charcoal-850">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          )}
          <span className="text-slate-300 dark:text-charcoal-600">/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Patients</span>
          <span className="text-slate-300 dark:text-charcoal-600">/</span>
          <span className="font-bold text-rose-700 dark:text-rose-400">Patient Charts</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Viewing: <strong className="text-slate-800 dark:text-slate-100">{currentPatient.lastName}, {currentPatient.firstName}</strong> (MRN: {currentPatient.mrn})
        </div>
      </div>

      {/* Main Split Layout: Left Roster Sidebar + Right Clinical Chart Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar: Patient Selector & Filters */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-pearl-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-850">
          {/* Add New Patient Button */}
          <div className="p-3 border-b border-pearl-100 dark:border-charcoal-700">
            <button
              type="button"
              onClick={onNewPatient}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-800 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Patient</span>
            </button>
          </div>

          {/* Left Roster Filters */}
          <div className="space-y-2 border-b border-pearl-100 p-3 text-xs dark:border-charcoal-700">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Branch</label>
              <select
                aria-label="Filter by branch"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-36 rounded border border-pearl-200 bg-pearl-50 px-2 py-1 text-[11px] text-slate-700 focus:border-rose-400 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
              >
                <option value="All">All</option>
                <option value="Standards Home Care">Standards Home Care</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status</label>
              <select
                aria-label="Filter by patient status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-36 rounded border border-pearl-200 bg-pearl-50 px-2 py-1 text-[11px] text-slate-700 focus:border-rose-400 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
              >
                <option value="Active Patients">Active Patients</option>
                <option value="Discharged">Discharged</option>
                <option value="All">All</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Payer</label>
              <select
                aria-label="Filter by insurance payer"
                value={payerFilter}
                onChange={(e) => setPayerFilter(e.target.value)}
                className="w-36 rounded border border-pearl-200 bg-pearl-50 px-2 py-1 text-[11px] text-slate-700 focus:border-rose-400 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
              >
                <option value="All">All</option>
                <option value="Commonwealth">Commonwealth Care</option>
                <option value="Medicare">Medicare</option>
                <option value="Medicaid">Medicaid</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative pt-1">
              <Search className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Patients"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full rounded-md border border-pearl-200 bg-pearl-50 py-1.5 pl-8 pr-2 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-400 focus:bg-white focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Patient Roster List */}
          <div className="flex-1 overflow-y-auto">
            {filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition flex items-center justify-between border-b border-pearl-100 dark:border-charcoal-700 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-700 text-white font-extrabold shadow-inner'
                      : 'text-slate-700 hover:bg-rose-50/50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-charcoal-800'
                  }`}
                >
                  <span className="truncate">
                    {p.lastName}, {p.firstName}
                  </span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-rose-200' : 'text-slate-400'}`}>
                    {p.mrn}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Area: Demographic Card & Activities Table */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-pearl-50 p-4 dark:bg-charcoal-900">
          {/* Top Tabs */}
          <div className="mb-3 flex items-center justify-between border-b border-pearl-200 bg-white px-4 py-2 rounded-t-xl dark:border-charcoal-700 dark:bg-charcoal-850">
            <div className="flex items-center gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => showToast('New menu options: Order, Episode, Communication Note')}
                className="flex items-center gap-1 text-slate-600 hover:text-rose-700 dark:text-slate-300 cursor-pointer"
              >
                <span>New</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setTopTab('insights')}
                className={`py-1 cursor-pointer transition ${
                  topTab === 'insights'
                    ? 'border-b-2 border-rose-700 font-extrabold text-rose-700 dark:text-rose-400'
                    : 'text-slate-600 hover:text-rose-700 dark:text-slate-300'
                }`}
              >
                Clinical Insights
              </button>
              <button
                type="button"
                onClick={() => setTopTab('documents')}
                className={`py-1 cursor-pointer transition ${
                  topTab === 'documents'
                    ? 'border-b-2 border-rose-700 font-extrabold text-rose-700 dark:text-rose-400'
                    : 'text-slate-600 hover:text-rose-700 dark:text-slate-300'
                }`}
              >
                Documents
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopTab('print');
                  showToast('Opening Print Chart dialog...');
                  setTimeout(() => window.print(), 300);
                }}
                className={`py-1 cursor-pointer transition ${
                  topTab === 'print'
                    ? 'border-b-2 border-rose-700 font-extrabold text-rose-700 dark:text-rose-400'
                    : 'text-slate-600 hover:text-rose-700 dark:text-slate-300'
                }`}
              >
                Print Chart
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('Refreshed chart data')}
                className="rounded border border-pearl-200 bg-pearl-50 p-1 text-slate-500 hover:text-rose-700 dark:border-charcoal-600 dark:bg-charcoal-750 cursor-pointer"
                title="Refresh Chart"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Demographic & Clinical Card */}
          <div className="mb-4 rounded-xl border border-pearl-200 bg-white p-4 shadow-2xs dark:border-charcoal-700 dark:bg-charcoal-850">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Left Column: Avatar & Status */}
              <div className="flex flex-col items-center justify-center border-b border-pearl-100 pb-4 lg:col-span-2 lg:border-b-0 lg:border-r lg:pr-4 dark:border-charcoal-700">
                <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-pearl-200 text-slate-400 dark:bg-charcoal-700 dark:text-slate-500">
                  <User className="h-10 w-10" />
                </div>
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {currentPatient.status}
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Change status dialog opened')}
                  className="mt-1 text-[11px] font-medium text-rose-700 hover:underline dark:text-rose-400 cursor-pointer"
                >
                  Change Status
                </button>
              </div>

              {/* Middle Column: Demographics & Clinical Information */}
              <div className="space-y-3 lg:col-span-7">
                {/* Header line with Name, MRN, Edit Link */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold uppercase text-slate-900 dark:text-white">
                    {currentPatient.lastName}, {currentPatient.firstName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    MRN: <strong className="font-mono text-slate-800 dark:text-slate-100">{currentPatient.mrn}</strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <button
                    type="button"
                    onClick={() => onEditPatient && onEditPatient(currentPatient.id)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline dark:text-rose-400 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Patient</span>
                  </button>
                </div>

                {/* Risk Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="rounded bg-pearl-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-200">
                    {currentPatient.gender}
                  </span>
                  {currentPatient.risks.map((risk, idx) => (
                    <span
                      key={idx}
                      className={`rounded px-2 py-0.5 font-bold ${
                        risk === 'Full Code'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {risk}
                    </span>
                  ))}
                </div>

                {/* Address & Phone */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-rose-600" />
                    <span>{currentPatient.address}</span>
                  </span>
                  <span>•</span>
                  <span>{currentPatient.dob} ({currentPatient.age})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-100">
                    <Phone className="h-3 w-3 text-rose-600" />
                    <span>{currentPatient.phone}</span>
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Episode</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.episodeStart} - {currentPatient.episodeEnd}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Start of Care Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.startOfCareDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast('Admission periods: 10/26/2026 - Present')}
                      className="ml-1 text-[10px] text-rose-700 hover:underline dark:text-rose-400 cursor-pointer"
                    >
                      View Admission Periods
                    </button>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Attending Physician</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.attendingPhysician}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Insurance Name/ID</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.insuranceName} / {currentPatient.policyNumber}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Primary Contact</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.primaryContact}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Secondary Contact</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentPatient.secondaryContact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Buttons & Quick Links */}
              <div className="flex flex-col justify-between border-t border-pearl-100 pt-4 lg:col-span-3 lg:border-t-0 lg:border-l lg:pl-4 dark:border-charcoal-700">
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => showToast(`Opening patient profile for ${currentPatient.lastName}`)}
                    className="rounded border border-pearl-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-pearl-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
                  >
                    Patient Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Patient is now in focus')}
                    className="rounded border border-pearl-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-pearl-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
                  >
                    Change In Focus
                  </button>
                </div>

                <div>
                  <h4 className="mb-1 text-[11px] font-extrabold text-slate-700 uppercase tracking-wide dark:text-slate-300">
                    Quick Links
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] lg:grid-cols-1">
                    {QUICK_LINKS.map((link) => (
                      <button
                        key={link}
                        type="button"
                        onClick={() => setActiveModalLink(link)}
                        className="text-left font-medium text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer truncate"
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Activity Section */}
          <div className="flex-1 rounded-xl border border-pearl-200 bg-white shadow-2xs dark:border-charcoal-700 dark:bg-charcoal-850">
            {/* Activity Header Sub-Tabs & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pearl-200 p-3 text-xs dark:border-charcoal-700">
              {/* Left Activity Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivityTab('schedule')}
                  className={`rounded-md px-3 py-1.5 font-bold transition cursor-pointer ${
                    activityTab === 'schedule'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-pearl-100 text-slate-700 hover:bg-pearl-200 dark:bg-charcoal-750 dark:text-slate-200'
                  }`}
                >
                  Schedule Activity
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('visit_comments')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
                    activityTab === 'visit_comments'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-pearl-100 text-slate-700 hover:bg-pearl-200 dark:bg-charcoal-750 dark:text-slate-200'
                  }`}
                >
                  Visit Comments
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('episode_comments')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
                    activityTab === 'episode_comments'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-pearl-100 text-slate-700 hover:bg-pearl-200 dark:bg-charcoal-750 dark:text-slate-200'
                  }`}
                >
                  Episode Comments
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('missed')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
                    activityTab === 'missed'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-pearl-100 text-slate-700 hover:bg-pearl-200 dark:bg-charcoal-750 dark:text-slate-200'
                  }`}
                >
                  Missed/Returned
                </button>
              </div>

              {/* Right Activity Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-500 text-[11px] dark:text-slate-400">Show</span>
                  <select
                    aria-label="Filter schedule status"
                    value={showFilter}
                    onChange={(e) => setShowFilter(e.target.value)}
                    className="rounded border border-pearl-200 bg-pearl-50 px-2 py-1 text-xs text-slate-700 focus:border-rose-400 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                  >
                    <option value="All">All</option>
                    <option value="Not Yet Due">Not Yet Due</option>
                    <option value="Not Yet Started">Not Yet Started</option>
                    <option value="Submitted With Signature">Submitted With Signature</option>
                    <option value="Returned w/ Physician Signature">Returned w/ Physician Signature</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-500 text-[11px] dark:text-slate-400">Date</span>
                  <select
                    aria-label="Filter schedule date range"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded border border-pearl-200 bg-pearl-50 px-2 py-1 text-xs text-slate-700 focus:border-rose-400 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-200"
                  >
                    <option value="This Episode">This Episode</option>
                    <option value="All Dates">All Dates</option>
                  </select>
                </div>

                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {currentPatient.episodeStart} - {currentPatient.episodeEnd}
                </span>

                <button
                  type="button"
                  onClick={() => showToast('Expanded view toggled')}
                  className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Expand"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Schedule Activity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-pearl-200 bg-pearl-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300">
                    <th className="py-2.5 px-3 w-8">A</th>
                    <th className="py-2.5 px-3">Task</th>
                    <th className="py-2.5 px-3">Schedule Date</th>
                    <th className="py-2.5 px-3">Assigned To</th>
                    <th className="py-2.5 px-3">Axxess Care</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Comments</th>
                    <th className="py-2.5 px-3 text-center w-24">Indicators</th>
                    <th className="py-2.5 px-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-700">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        No scheduled activities found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr
                        key={t.id}
                        className="transition hover:bg-rose-50/30 dark:hover:bg-rose-950/20"
                      >
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                          {t.id.replace('st-', '')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer">
                          {t.task}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {t.scheduleDate}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {t.assignedTo}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => showToast(`Posting ${t.task} to Axxess Care...`)}
                            className="font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer text-[11px]"
                          >
                            Post to Axxess Care
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              t.status === 'Submitted With Signature' || t.status === 'Returned w/ Physician Signature'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                                : t.status === 'Not Yet Due'
                                ? 'bg-pearl-100 text-slate-600 dark:bg-charcoal-700 dark:text-slate-300'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 italic text-[11px]">
                          {t.comments}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <span title="Home visit"><Home className="h-3 w-3 hover:text-slate-700 cursor-pointer" /></span>
                            <span title="Billable"><DollarSign className="h-3 w-3 hover:text-slate-700 cursor-pointer" /></span>
                            {t.hasAttachment && (
                              <span title="Attachment available"><Paperclip className="h-3 w-3 text-rose-600 cursor-pointer" /></span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                showToast(`Printing task ${t.task}...`);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-pearl-100 hover:text-rose-700 dark:hover:bg-charcoal-750 cursor-pointer"
                              title="Print Task"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Actions menu for ${t.task}`)}
                              className="rounded p-1 text-slate-400 hover:bg-pearl-100 hover:text-slate-700 dark:hover:bg-charcoal-750 cursor-pointer"
                              title="More Options"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-pearl-200 bg-pearl-50/50 px-4 py-2 text-xs text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800/50 dark:text-slate-400">
              <span>{filteredTasks.length} total scheduled tasks in episode</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Episode: {currentPatient.episodeStart} - {currentPatient.episodeEnd}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Quick Link Detail Modal */}
      {activeModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-850 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-700 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {activeModalLink}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalLink(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-pearl-100 hover:text-slate-600 dark:hover:bg-charcoal-750"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Patient: <strong className="text-slate-800 dark:text-white">{currentPatient.lastName}, {currentPatient.firstName}</strong> (MRN: {currentPatient.mrn})
              </p>
              <p>
                Current Episode: {currentPatient.episodeStart} - {currentPatient.episodeEnd}
              </p>
              <div className="rounded-lg border border-pearl-200 bg-pearl-50 p-3 text-[11px] text-slate-500 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-400">
                Detailed {activeModalLink.toLowerCase()} records are synchronized with electronic health record standards.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalLink(null)}
                className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
