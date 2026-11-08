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
  CheckCircle2,
  FileText,
  X,
  Save,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface TemplateListViewProps {
  onBack: () => void;
}

export interface TemplateItem {
  id: string;
  name: string;
  created: string;
  modified: string;
  text: string;
}

export const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'tmpl-1',
    name: 'Communication Note For PA Approvals',
    created: '9/25/2017',
    modified: '9/25/2017',
    text: 'Mass Health PA Approvals\n\nSkilled Nursing: __________________',
  },
  {
    id: 'tmpl-2',
    name: 'HHA Frequency',
    created: '3/22/2013',
    modified: '3/22/2013',
    text: 'Home Health Aide services approved for personal care and ADLs:\nFrequency: ___x week for ___ weeks.',
  },
  {
    id: 'tmpl-3',
    name: 'Private Duty Nursing Frequency',
    created: '8/29/2016',
    modified: '8/29/2016',
    text: 'Continuous Skilled Nursing (CSN / PDN) authorized hours per week: ___.\nAuthorized shifts: Day / Evening / Night.',
  },
  {
    id: 'tmpl-4',
    name: 'SHC - Discharge (goals met)',
    created: '11/28/2015',
    modified: '11/28/2015',
    text: 'Patient has successfully met all rehabilitation and skilled nursing goals. Discharged from home health services with physician concurrence.',
  },
  {
    id: 'tmpl-5',
    name: 'SHC - Recertification',
    created: '11/28/2015',
    modified: '11/30/2015',
    text: 'Recertification assessment completed. Continued homebound status verified due to impaired mobility. 60-day episode extended.',
  },
  {
    id: 'tmpl-6',
    name: 'SHC - ROC',
    created: '11/28/2015',
    modified: '11/28/2015',
    text: 'Resumption of Care (ROC) following inpatient hospital discharge. Medication reconciliation and wound care assessment performed.',
  },
  {
    id: 'tmpl-7',
    name: 'SHC - Start of Care',
    created: '11/28/2015',
    modified: '11/30/2015',
    text: 'Comprehensive OASIS Start of Care completed. Skilled need identified and initial 485 Plan of Care established with attending MD.',
  },
  {
    id: 'tmpl-8',
    name: 'SHC - Transfer (not discharged)',
    created: '11/28/2015',
    modified: '11/28/2015',
    text: 'Patient transferred to acute inpatient medical facility for evaluation of acute condition changes. Agency holds episode active.',
  },
  {
    id: 'tmpl-9',
    name: 'TEACHING DISEASE (Celiac Disease)',
    created: '3/22/2013',
    modified: '3/22/2013',
    text: 'Patient and primary caregiver instructed regarding strict gluten-free diet, identifying hidden wheat/gluten sources, and label reading.',
  },
];

export const TemplateListView: React.FC<TemplateListViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  const [templateList, setTemplateList] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templateList;
    const q = searchQuery.toLowerCase();
    return templateList.filter(
      (t) => t.name.toLowerCase().includes(q) || t.text.toLowerCase().includes(q)
    );
  }, [templateList, searchQuery]);

  const handleStartEdit = (template: TemplateItem) => {
    setEditingTemplateId(template.id);
    setEditName(template.name);
    setEditText(template.text);
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setEditName('');
    setEditText('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      showToast('Template name cannot be empty.');
      return;
    }
    const today = new Date().toLocaleDateString('en-US');
    setTemplateList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: editName.trim(), text: editText, modified: today } : t
      )
    );
    setEditingTemplateId(null);
    showToast('Template updated successfully.');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      setTemplateList((prev) => prev.filter((t) => t.id !== id));
      if (editingTemplateId === id) handleCancelEdit();
      showToast(`Template "${name}" deleted.`);
    }
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const today = new Date().toLocaleDateString('en-US');
    const created: TemplateItem = {
      id: `tmpl-${Date.now()}`,
      name: newName.trim(),
      created: today,
      modified: today,
      text: newText,
    };
    setTemplateList([created, ...templateList]);
    setIsNewTemplateModalOpen(false);
    setNewName('');
    setNewText('');
    showToast(`Created template: ${created.name}`);
  };

  const handleExportToExcel = () => {
    const headers = ['Name', 'Created', 'Modified', 'Text'];
    const rows = filteredTemplates.map((t) => [
      `"${t.name}"`,
      `"${t.created}"`,
      `"${t.modified}"`,
      `"${t.text.replace(/\n/g, ' ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Axxess_Templates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Templates exported to Excel.');
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
                Templates
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Standard Clinical Narrative & Documentation Templates
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Templates refreshed.')}
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
        {/* Single Row Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Templates Directory
            </span>

            {/* Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewTemplateModalOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Template
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
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {filteredTemplates.length} template(s) available
          </div>
        </div>

        {/* Templates Table Card */}
        <div className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="border-b border-pearl-200 bg-pearl-100/70 text-[11px] font-bold text-slate-600 dark:border-charcoal-700 dark:bg-charcoal-750 dark:text-slate-300">
                <th className="py-2.5 px-4">Name ▲</th>
                <th className="py-2.5 px-4 w-36">Created</th>
                <th className="py-2.5 px-4 w-36">Modified</th>
                <th className="py-2.5 pr-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No templates found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => {
                  const isEditing = editingTemplateId === template.id;

                  return (
                    <React.Fragment key={template.id}>
                      {/* Normal Table Row */}
                      <tr
                        className={`border-b border-pearl-150 transition-colors ${
                          isEditing
                            ? 'bg-rose-50/50 dark:bg-rose-950/20'
                            : 'hover:bg-pearl-50/70 dark:border-charcoal-700/60 dark:hover:bg-charcoal-750/50'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white truncate">
                          {template.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {template.created}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {template.modified}
                        </td>
                        <td className="py-3 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Edit Template"
                              onClick={() => {
                                if (isEditing) handleCancelEdit();
                                else handleStartEdit(template);
                              }}
                              className="rounded p-1 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete Template"
                              onClick={() => handleDelete(template.id, template.name)}
                              className="rounded p-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline Edit View (Matching Screenshot 6) */}
                      {isEditing && (
                        <tr className="border-b border-pearl-200 bg-pearl-50/60 dark:border-charcoal-700 dark:bg-charcoal-850/60">
                          <td colSpan={4} className="p-4 sm:p-6">
                            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-md dark:border-charcoal-600 dark:bg-charcoal-800 space-y-4">
                              {/* Name Input */}
                              <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                                  Name <span className="text-rose-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-9 w-full sm:max-w-md rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                                />
                              </div>

                              {/* Textarea */}
                              <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                                  Text <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                  rows={7}
                                  maxLength={5000}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full rounded-xl border border-pearl-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                                />
                                <div className="mt-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                  You have <span className="font-bold text-slate-900 dark:text-white">{5000 - editText.length}</span> characters remaining.
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-center gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(template.id)}
                                  className="inline-flex h-9 items-center justify-center rounded-xl bg-rose-700 hover:bg-rose-800 px-6 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="inline-flex h-9 items-center justify-center rounded-xl border border-pearl-300 bg-white hover:bg-pearl-100 px-6 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Template Modal */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-pearl-200 bg-white p-6 shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800">
            <div className="flex items-center justify-between border-b border-pearl-200 pb-3 dark:border-charcoal-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white">New Template</h3>
              <button
                type="button"
                onClick={() => setIsNewTemplateModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Template Name: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Communication Note for MD Orders"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-pearl-300 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Template Text: <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={6}
                  maxLength={5000}
                  required
                  placeholder="Enter template text with placeholders..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full rounded-xl border border-pearl-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-100"
                />
                <div className="mt-1 text-right text-[11px] text-slate-400">
                  {5000 - newText.length} characters remaining
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-pearl-150 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(false)}
                  className="rounded-lg border border-pearl-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-pearl-100 dark:border-charcoal-600 dark:text-slate-300 dark:hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition active:scale-95 cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

