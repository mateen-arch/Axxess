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
  CheckCircle2,
  Users as UsersIcon,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface UsersListViewProps {
  onBack: () => void;
  onEditUser?: (userId: string) => void;
}

export interface UserListItem {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  employmentType: string;
  gender: string;
  ssn: string;
  created: string;
  status: 'Active' | 'Inactive';
}

export const INITIAL_USERS: UserListItem[] = [
  {
    id: 'usr-1',
    name: 'Abnia Jean HHA',
    title: 'Home Health Aide/Nurse Aide',
    email: 'abniajean@gmail.com',
    phone: 'Not Available',
    mobile: '(617) 792-4227',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: '****80172',
    created: '8/24/2021',
    status: 'Active',
  },
  {
    id: 'usr-2',
    name: 'Adeige Durette HHA',
    title: 'Home Health Aide/Nurse Aide',
    email: 'bertin.durette@gmail.com',
    phone: '(774) 360-0409',
    mobile: 'Not Available',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: '****42613',
    created: '11/29/2014',
    status: 'Active',
  },
  {
    id: 'usr-3',
    name: 'Afia Osei Assibey RN',
    title: 'Registered Nurse',
    email: 'afia52@hotmail.com',
    phone: 'Not Available',
    mobile: '(978) 710-1119',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '12/17/2025',
    status: 'Active',
  },
  {
    id: 'usr-4',
    name: 'Agnes Moses',
    title: 'Administrator',
    email: 'agnes@standardsincare.com',
    phone: '(419) 889-8651',
    mobile: '(419) 889-8651',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '3/22/2013',
    status: 'Active',
  },
  {
    id: 'usr-5',
    name: 'Agness Chirwa LPN',
    title: 'LVN/LPN',
    email: 'agness27@standardsincare.com',
    phone: 'Not Available',
    mobile: '(978) 328-7823',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '10/31/2025',
    status: 'Active',
  },
  {
    id: 'usr-6',
    name: 'Ailen Santos',
    title: 'Administrative Assistant',
    email: 'ailenm@standardsincare.com',
    phone: 'Not Available',
    mobile: '(978) 922-0088',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '4/10/2026',
    status: 'Active',
  },
  {
    id: 'usr-7',
    name: 'Aline Jean Marie HHA',
    title: 'Home Health Aide/Nurse Aide',
    email: 'alinejeanmarie707@gmail.com',
    phone: '(978) 594-6640',
    mobile: '(978) 594-6640',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '2/13/2026',
    status: 'Active',
  },
  {
    id: 'usr-8',
    name: 'Ana Beatriz Morel HHA',
    title: 'Home Health Aide/Nurse Aide',
    email: 'anamorel26@gmail.com',
    phone: 'Not Available',
    mobile: '(978) 407-6449',
    employmentType: 'Employee',
    gender: 'Female',
    ssn: 'Not Available',
    created: '7/14/2023',
    status: 'Active',
  },
];

export const UsersListView: React.FC<UsersListViewProps> = ({
  onBack,
  onEditUser,
}) => {
  const { organization } = useHealthcare();

  const [users, setUsers] = useState<UserListItem[]>(INITIAL_USERS);
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Inactive' | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedStatus !== 'All' && u.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.mobile.includes(q)
        );
      }
      return true;
    });
  }, [users, selectedStatus, searchQuery]);

  const totalResults = 146; // Authentic screenshot total
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportToExcel = () => {
    const headers = ['Name', 'Title', 'Email', 'Phone', 'Mobile', 'Employment Type', 'Gender', 'SSN', 'Created', 'Status'];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.title}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.mobile}"`,
      `"${u.employmentType}"`,
      `"${u.gender}"`,
      `"${u.ssn}"`,
      `"${u.created}"`,
      `"${u.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Users List exported to Excel.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

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
                Users
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Agency Staff, Clinicians & Permissions Directory
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Users roster refreshed.')}
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
        {/* Single Row Filter & Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Filter */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 items-center gap-1.5 rounded-xl border border-pearl-300 bg-white px-3 shadow-2xs dark:border-charcoal-600 dark:bg-charcoal-750">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => showToast('Invite user feature triggered.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New User
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

        {/* Search Bar - Separate compact row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name, title, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredUsers.length}</span> staff members ({totalResults} total active profiles)
          </div>
        </div>

        {/* Beautiful Users Table */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4 w-52">Name ▲</th>
                  <th className="py-2.5 px-4 w-48">Title</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4 w-36">Mobile</th>
                  <th className="py-2.5 px-3 w-28 text-center">Type</th>
                  <th className="py-2.5 px-3 w-28 text-center">Created</th>
                  <th className="py-2.5 pr-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No users found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white truncate">
                        <button
                          type="button"
                          onClick={() => onEditUser?.(user.id)}
                          className="text-left font-bold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer truncate"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate">
                        {user.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {user.mobile}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex rounded-full bg-pearl-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-200">
                          {user.employmentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {user.created}
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => onEditUser?.(user.id)}
                            className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Reset Signature"
                            onClick={() => showToast(`Signature key reset dispatched for ${user.name}`)}
                            className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
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
                className="rounded-lg border border-pearl-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
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

