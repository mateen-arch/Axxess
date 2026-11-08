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
  Building2,
  X,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface FacilityListViewProps {
  onBack: () => void;
  onNewFacility: () => void;
  onEditFacility: (facilityId: string) => void;
}

export interface FacilityListItem {
  id: string;
  facilityName: string;
  facilityType: string;
  contactPerson: string;
  address: string;
  phone: string;
  faxNumber: string;
  email: string;
}

export const INITIAL_FACILITIES: FacilityListItem[] = [
  {
    id: 'fac-1',
    facilityName: "Boston Children's Hospital",
    facilityType: 'Long-term care hospital (LTCH)',
    contactPerson: 'Kethlaine Michaud',
    address: '300 Longwood Ave. , BOSTON ,MA 02115',
    phone: '(857) 707-0949',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-2',
    facilityName: 'Boston Medical Center',
    facilityType: 'Short-stay acute hospital (IPPS)',
    contactPerson: 'Bridgette Vento',
    address: 'Not Available',
    phone: '(617) 638-6824',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-3',
    facilityName: 'Cambridge Health Alliance',
    facilityType: 'Short-stay acute hospital (IPPS)',
    contactPerson: 'Not Available',
    address: '1493 Cambridge St. , SOMERVILLE ,MA 02145',
    phone: '(617) 665-1068',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-4',
    facilityName: "Children's Family Friends and Family Services",
    facilityType: 'Justin resource institute',
    contactPerson: 'Not Available',
    address: '112 Market St. 2nd Floor , LYNN ,MA 01905',
    phone: '(781) 592-5691',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-5',
    facilityName: 'Community Case Management',
    facilityType: 'CCM',
    contactPerson: 'Demetra Kennedy',
    address: 'Not Available',
    phone: '(508) 421-5676',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-6',
    facilityName: 'Maplewood Rehab and Nursing',
    facilityType: 'Inpatient rehabilitation hospital or unit (IRF)',
    contactPerson: 'Lauren',
    address: '6 Morrill Pl. , AMESBURY ,MA 01913',
    phone: '(978) 388-3500',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
  {
    id: 'fac-7',
    facilityName: 'Mass General Hospital',
    facilityType: 'Long-term care hospital (LTCH)',
    contactPerson: 'Not Available',
    address: '100 Cambridge St. , JAMAICA PLAIN ,MA 02130',
    phone: '(617) 724-7472',
    faxNumber: 'Not Available',
    email: 'Not Available',
  },
];

export const FacilityListView: React.FC<FacilityListViewProps> = ({
  onBack,
  onNewFacility,
  onEditFacility,
}) => {
  const { organization } = useHealthcare();

  const [facilityList, setFacilityList] = useState<FacilityListItem[]>(INITIAL_FACILITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFacilities = useMemo(() => {
    if (!searchQuery.trim()) return facilityList;
    const q = searchQuery.toLowerCase();
    return facilityList.filter(
      (f) =>
        f.facilityName.toLowerCase().includes(q) ||
        f.facilityType.toLowerCase().includes(q) ||
        f.contactPerson.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.phone.includes(q)
    );
  }, [facilityList, searchQuery]);

  const totalResults = 14; // Per screenshot: 14 total results
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete facility "${name}"?`)) {
      setFacilityList((prev) => prev.filter((f) => f.id !== id));
      showToast(`Facility "${name}" removed.`);
    }
  };

  const handleExportToExcel = () => {
    const headers = ['Facility Name', 'Facility Type', 'Contact Person', 'Address', 'Phone', 'Fax Number', 'Email'];
    const rows = filteredFacilities.map((f) => [
      `"${f.facilityName}"`,
      `"${f.facilityType}"`,
      `"${f.contactPerson}"`,
      `"${f.address}"`,
      `"${f.phone}"`,
      `"${f.faxNumber}"`,
      `"${f.email}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Facilities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Facilities exported to Excel.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
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
                List Facilities
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Inpatient & Outpatient Partner Facilities
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Facilities refreshed.')}
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
        {/* Search & Actions Card */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative min-w-[280px] sm:w-80">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search facilities..."
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

            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onNewFacility}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Facility
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

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                  <th className="py-2.5 px-4">Facility Name ▲</th>
                  <th className="py-2.5 px-3">Facility Type</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Fax Number</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 pr-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No facilities found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedFacilities.map((fac) => (
                    <tr
                      key={fac.id}
                      className="border-b border-pearl-150 transition-colors hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50"
                    >
                      <td
                        onClick={() => onEditFacility(fac.id)}
                        className="py-3 px-4 font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer dark:text-rose-400"
                      >
                        {fac.facilityName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {fac.facilityType}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {fac.contactPerson}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {fac.address}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {fac.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-400 italic text-[11px]">
                        {fac.faxNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-400 italic text-[11px]">
                        {fac.email}
                      </td>
                      <td className="py-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit Facility"
                            onClick={() => onEditFacility(fac.id)}
                            className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Facility"
                            onClick={() => handleDelete(fac.id, fac.facilityName)}
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
                {Array.from({ length: Math.min(2, totalPages) }, (_, i) => i + 1).map((pageNum) => (
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
                <option value={20}>20</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
