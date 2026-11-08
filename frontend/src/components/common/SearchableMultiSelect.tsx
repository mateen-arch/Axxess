import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
  category?: string;
  badge?: string;
  badgeColor?: string;
}

interface SearchableMultiSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  headerTitle?: string;
  options: (string | MultiSelectOption)[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  allLabel?: string;
  showSelectAll?: boolean;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  headerTitle,
  options,
  selectedValues,
  onChange,
  className = '',
  allLabel = 'All Selected',
  showSelectAll = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to MultiSelectOption
  const normalizedOptions: MultiSelectOption[] = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { id: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(o =>
      o.label.toLowerCase().includes(q) || (o.category && o.category.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  const isAllSelected = selectedValues.length === normalizedOptions.length && normalizedOptions.length > 0;

  const handleToggleAll = () => {
    if (isAllSelected || selectedValues.length > 0) {
      onChange([]);
    } else {
      onChange(normalizedOptions.map(o => o.id));
    }
  };

  const handleToggleOption = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter(v => v !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  // Determine button display text
  const buttonText = useMemo(() => {
    if (selectedValues.length === 0) return 'Nothing selected';
    if (selectedValues.length === normalizedOptions.length) return allLabel;
    if (selectedValues.length === 1) {
      const match = normalizedOptions.find(o => o.id === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    return `${selectedValues.length} Selected`;
  }, [selectedValues, normalizedOptions, allLabel]);

  // Group by category if available
  const groupedOptions = useMemo(() => {
    const map = new Map<string, MultiSelectOption[]>();
    filteredOptions.forEach(opt => {
      const cat = opt.category || '__default__';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(opt);
    });
    return map;
  }, [filteredOptions]);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-3 py-1.5 rounded-xl border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs hover:border-rose-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
      >
        <span className="truncate">{buttonText}</span>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {/* Searchable Multi-Select Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 max-w-[90vw] z-[100] bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden animate-fadeIn">
          {/* Search Box Header */}
          <div className="p-2 border-b border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-2.5 pr-8 py-1.5 text-xs rounded-lg border border-pearl-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500"
              />
              <Search size={14} className="absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-2 px-1 text-[11px] space-y-1">
              {showSelectAll && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleAll}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Select All</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px]">
                {selectedValues.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Clear selected items
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">Nothing selected</span>
                )}
              </div>

              {headerTitle && (
                <div className="pt-1.5 font-black text-xs text-slate-900 dark:text-white border-t border-pearl-200/60 dark:border-charcoal-700">
                  {headerTitle}
                </div>
              )}
            </div>
          </div>

          {/* Options Checklist */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching options found.
              </div>
            ) : (
              Array.from(groupedOptions.entries()).map(([category, items]) => (
                <div key={category} className="space-y-0.5">
                  {category !== '__default__' && (
                    <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-pearl-100 dark:border-charcoal-750">
                      {category}
                    </div>
                  )}
                  {items.map(option => {
                    const isChecked = selectedValues.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-slate-900 dark:text-white font-bold'
                            : 'hover:bg-pearl-100/70 dark:hover:bg-charcoal-800 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleOption(option.id)}
                            className="rounded text-rose-600 focus:ring-rose-500 shrink-0 cursor-pointer"
                          />
                          <span className="truncate">{option.label}</span>
                        </div>

                        {option.badge && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                            option.badgeColor || 'bg-pearl-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {option.badge}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Close Button Footer */}
          <div className="p-2 border-t border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800/50 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-pearl-200 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
