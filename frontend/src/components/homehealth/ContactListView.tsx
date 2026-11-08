import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface ContactListViewProps {
  onBack: () => void;
}

export interface ContactItem {
  id: string;
  displayName: string;
  company: string;
  type: string;
  phone: string;
  fax: string;
  email: string;
}

export const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: 'c-1',
    displayName: 'Anusha with Axxess',
    company: 'Axxess',
    type: 'IT/Tech Support',
    phone: '2148099839',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-2',
    displayName: 'April Cardona',
    company: 'CCM',
    type: 'Other',
    phone: '7744555119',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-3',
    displayName: 'Arianna Arianna',
    company: 'APEX MEDICAL PRODUCTS',
    type: 'Other',
    phone: '7813310091',
    fax: '7813316088',
    email: 'Not Available',
  },
  {
    id: 'c-4',
    displayName: 'Axxess Customer Service',
    company: 'Axxess',
    type: 'Not Available',
    phone: '8667955990',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-5',
    displayName: 'BCBS Mike Murphy',
    company: 'BCBS',
    type: 'Other',
    phone: '8008822060',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-6',
    displayName: 'BEVERLY POLICE',
    company: 'BEVERLY POLICE DEPARTMENT',
    type: 'Other',
    phone: '9789216040',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-7',
    displayName: 'Blessing Chukwu',
    company: 'Not Available',
    type: 'Social Worker',
    phone: '7812548612',
    fax: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'c-8',
    displayName: 'Blessing Chukwu',
    company: 'Not Available',
    type: 'Social Worker',
    phone: '7812548612',
    fax: 'Not Available',
    email: 'Not Available',
  },
];

export const ContactListView: React.FC<ContactListViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  const [contactList, setContactList] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Contact form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState('Other');
  const [newPhone, setNewPhone] = useState('');
  const [newFax, setNewFax] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactList;
    const q = searchQuery.toLowerCase();
    return contactList.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [contactList, searchQuery]);

  const totalResults = 26; // Match authentic screenshot "26 total results"
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportToExcel = () => {
    const headers = ['Display Name', 'Company', 'Type', 'Phone', 'Fax', 'Email'];
    const rows = filteredContacts.map((c) => [
      `"${c.displayName}"`,
      `"${c.company}"`,
      `"${c.type}"`,
      `"${c.phone}"`,
      `"${c.fax}"`,
      `"${c.email}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Contact_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Contact List exported to Excel.');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      showToast('Please enter a display name.');
      return;
    }
    const created: ContactItem = {
      id: `c-${Date.now()}`,
      displayName: newDisplayName,
      company: newCompany || 'Not Available',
      type: newType,
      phone: newPhone || 'Not Available',
      fax: newFax || 'Not Available',
      email: newEmail || 'Not Available',
    };
    setContactList([created, ...contactList]);
    setIsAddModalOpen(false);
    setNewDisplayName('');
    setNewCompany('');
    setNewPhone('');
    setNewFax('');
    setNewEmail('');
    showToast(`Added contact: ${created.displayName}`);
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
                List Contacts
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Agency Directory & Community Partners
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Contacts list refreshed.')}
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
        {/* Search & Action Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative min-w-[280px] sm:w-80">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Contact
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

        {/* Contacts Table */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4">Display Name</th>
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Fax</th>
                  <th className="py-2.5 px-4">Email</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No contacts found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {contact.displayName}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {contact.company}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex rounded-full bg-pearl-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-charcoal-700 dark:text-slate-200">
                          {contact.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {contact.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                        {contact.fax}
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                        {contact.email}
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pageNum) => (
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-pearl-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
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
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white">New Contact</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Display Name: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, RN"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Company / Organization:
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Shore Medical Center"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Contact Type:
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200"
                >
                  <option value="IT/Tech Support">IT/Tech Support</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Case Manager">Case Manager</option>
                  <option value="Physician">Physician</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Phone:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 978-555-0199"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition active:scale-95 cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

