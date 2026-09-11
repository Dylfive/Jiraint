'use client';

import { useMemo } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import {
  Issue, Sprint, Filters, IssueStatus, PRIORITY_CONFIG, TYPE_CONFIG, COLUMNS,
} from '@/lib/types';

interface BacklogViewProps {
  issues: Issue[];
  filters: Filters;
  sprints: Sprint[];
  currentSprint: Sprint | null;
  onIssueClick: (issue: Issue) => void;
  onCreateIssue: (status?: IssueStatus) => void;
}

function applyFilters(issues: Issue[], filters: Filters): Issue[] {
  return issues.filter((issue) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !issue.title.toLowerCase().includes(q) &&
        !(issue.description?.toLowerCase().includes(q)) &&
        !(issue.assignee?.toLowerCase().includes(q))
      )
        return false;
    }
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.type && issue.type !== filters.type) return false;
    return true;
  });
}

function BacklogIssueRow({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick: () => void;
}) {
  const priority = PRIORITY_CONFIG[issue.priority];
  const type = TYPE_CONFIG[issue.type];
  const col = COLUMNS.find((c) => c.id === issue.status);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-slate-700/40"
    >
      <span className="text-sm w-5 text-center flex-shrink-0">{type.emoji}</span>

      <p className="flex-1 text-xs sm:text-sm text-slate-200 truncate group-hover:text-white transition-colors">
        {issue.title}
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Status pill */}
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
          style={{ borderLeft: `2px solid ${col?.color || '#64748b'}` }}
        >
          {col?.label}
        </span>

        {/* Priority */}
        <span
          className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ color: priority.color, backgroundColor: priority.color + '20' }}
        >
          {priority.label}
        </span>

        {/* Assignee */}
        {issue.assignee && (
          <span className="hidden md:inline text-[10px] text-slate-400 max-w-[80px] truncate">
            {issue.assignee}
          </span>
        )}

        {/* Points */}
        {issue.story_points && (
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
            {issue.story_points}pt
          </span>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
}

export default function BacklogView({
  issues,
  filters,
  sprints,
  onIssueClick,
  onCreateIssue,
}: BacklogViewProps) {
  const filteredIssues = useMemo(() => applyFilters(issues, filters), [issues, filters]);

  // Group by sprint (and "No Sprint")
  const grouped = useMemo(() => {
    const sprintMap = new Map<string, { sprint: Sprint | null; issues: Issue[] }>();

    // Add sprint groups in order
    sprints.forEach((sprint) => {
      sprintMap.set(sprint.id, { sprint, issues: [] });
    });
    sprintMap.set('__none__', { sprint: null, issues: [] });

    filteredIssues.forEach((issue) => {
      const key = issue.sprint_id || '__none__';
      if (!sprintMap.has(key)) {
        sprintMap.set(key, { sprint: null, issues: [] });
      }
      sprintMap.get(key)!.issues.push(issue);
    });

    return Array.from(sprintMap.values()).filter((g) => g.issues.length > 0);
  }, [filteredIssues, sprints]);

  if (filteredIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
        <div className="text-3xl mb-3">📋</div>
        <h3 className="text-slate-300 font-semibold text-base mb-1.5">No tasks in backlog</h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-5 max-w-xs">
          {filters.search || filters.priority || filters.type
            ? 'No tasks match your current filter criteria.'
            : 'Create your first task to start organizing.'}
        </p>
        <button
          onClick={() => onCreateIssue()}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest border-b border-slate-800">
        <span className="w-5" />
        <span className="flex-1">Task</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-16 sm:w-20 text-right">Status</span>
          <span className="hidden sm:inline w-16 text-right">Priority</span>
          <span className="hidden md:inline w-20 text-right">Assignee</span>
          <span className="w-8 text-right">Pts</span>
          <span className="w-4" />
        </div>
      </div>

      {grouped.map(({ sprint, issues: groupIssues }) => (
        <div key={sprint ? sprint.id : 'no-sprint'} className="space-y-1.5">
          {/* Group Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {sprint ? sprint.name : 'Backlog / Unassigned Sprints'}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
                {groupIssues.length}
              </span>
            </div>
            <button
              onClick={() => onCreateIssue()}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Group Issues */}
          <div className="divide-y divide-slate-800/40 bg-slate-900/30 rounded-xl border border-slate-800/40 overflow-hidden">
            {groupIssues.map((issue) => (
              <BacklogIssueRow
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
