'use client';

import { Search, Plus, X, SlidersHorizontal } from 'lucide-react';
import { Filters, IssuePriority, IssueType, PRIORITY_CONFIG, TYPE_CONFIG } from '@/lib/types';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onCreateIssue: () => void;
  totalIssues: number;
}

const PRIORITIES: { value: IssuePriority | ''; label: string }[] = [
  { value: '', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TYPES: { value: IssueType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'bug', label: '🐛 Bug' },
  { value: 'task', label: '✓ Task' },
  { value: 'story', label: '📖 Story' },
  { value: 'epic', label: '⚡ Epic' },
];

export default function FilterBar({ filters, onFiltersChange, onCreateIssue, totalIssues }: FilterBarProps) {
  const hasFilters = filters.search || filters.priority || filters.type;

  const update = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({ search: '', priority: '', type: '', assignee: '' });
  };

  return (
    <div className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800/60 bg-slate-950/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          id="issue-search-input"
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-lg pl-8 pr-7 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
        />
        {filters.search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Priority Filter */}
        <div className="relative flex-shrink-0">
          <select
            id="priority-filter-select"
            value={filters.priority}
            onChange={(e) => update('priority', e.target.value)}
            className={`
              appearance-none bg-slate-800/80 border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none
              transition-all cursor-pointer pr-6
              ${filters.priority
                ? `border-${PRIORITY_CONFIG[filters.priority as IssuePriority]?.border || 'slate-600'} text-slate-200`
                : 'border-slate-700/60 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value} className="bg-slate-900">
                {p.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
        </div>

        {/* Type Filter */}
        <div className="relative flex-shrink-0">
          <select
            id="type-filter-select"
            value={filters.type}
            onChange={(e) => update('type', e.target.value)}
            className={`
              appearance-none bg-slate-800/80 border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none
              transition-all cursor-pointer pr-6
              ${filters.type ? 'border-indigo-500/50 text-slate-200' : 'border-slate-700/60 text-slate-400 hover:border-slate-600'}
            `}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-900">
                {t.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            id="clear-filters-btn"
            onClick={clearAll}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all flex-shrink-0"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        {/* Total Count */}
        <span className="text-[11px] text-slate-600 hidden md:inline whitespace-nowrap ml-1">
          {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
        </span>

        <div className="flex-1 sm:hidden" />

        {/* Create Issue button */}
        <button
          id="create-issue-btn"
          onClick={onCreateIssue}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap flex-shrink-0 ml-auto"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>New Issue</span>
        </button>
      </div>
    </div>
  );
}
