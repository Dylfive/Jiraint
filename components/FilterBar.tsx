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
    <div className="flex-shrink-0 px-5 py-3 border-b border-slate-800/60 bg-slate-950/50 flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          id="issue-search-input"
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
        />
        {filters.search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Priority Filter */}
      <div className="relative">
        <select
          id="priority-filter-select"
          value={filters.priority}
          onChange={(e) => update('priority', e.target.value)}
          className={`
            appearance-none bg-slate-800/80 border rounded-lg px-3 py-1.5 text-sm outline-none
            transition-all cursor-pointer pr-7
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
      <div className="relative">
        <select
          id="type-filter-select"
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className={`
            appearance-none bg-slate-800/80 border rounded-lg px-3 py-1.5 text-sm outline-none
            transition-all cursor-pointer pr-7
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}

      {/* Issue count */}
      <div className="text-xs text-slate-600 ml-1">
        {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Create Issue */}
      <button
        id="create-issue-btn"
        onClick={onCreateIssue}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
      >
        <Plus className="w-4 h-4" />
        Create Issue
      </button>
    </div>
  );
}
