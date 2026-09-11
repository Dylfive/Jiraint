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
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-slate-700/40"
    >
      <span className="text-sm w-5 text-center flex-shrink-0">{type.emoji}</span>

      <p className="flex-1 text-sm text-slate-200 truncate group-hover:text-white transition-colors">
        {issue.title}
      </p>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Status pill */}
        <span
          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-400"
          style={{ borderLeft: `2px solid ${col?.color || '#64748b'}` }}
        >
          {col?.label}
        </span>

        {/* Priority */}
        <span
          className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ color: priority.color, backgroundColor: priority.color + '20' }}
        >
          {priority.label}
        </span>

        {/* Assignee */}
        {issue.assignee && (
          <span className="hidden lg:inline text-[10px] text-slate-500 max-w-[80px] truncate">
            {issue.assignee.split(' ')[0]}
          </span>
        )}

        {/* Points */}
        {issue.story_points && (
          <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
            {issue.story_points}p
          </span>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
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
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-slate-300 font-semibold text-lg mb-2">Backlog is empty</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          {filters.search || filters.priority || filters.type
            ? 'No issues match your current filters.'
            : 'Create your first issue to get started.'}
        </p>
        <button
          onClick={() => onCreateIssue()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 animate-fade-in">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest border-b border-slate-800">
        <span className="w-5" />
        <span className="flex-1">Issue</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline w-20 text-right">Status</span>
          <span className="hidden md:inline w-16 text-right">Priority</span>
          <span className="hidden lg:inline w-20 text-right">Assignee</span>
          <span className="w-8 text-right">Pts</span>
          <span className="w-4" />
        </div>
      </div>

      {grouped.map(({ sprint, issues: groupIssues }) => (
        <div key={sprint?.id || '__none__'}>
          {/* Sprint Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {sprint ? (
                <>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sprint.status === 'active'
                        ? 'bg-emerald-400'
                        : sprint.status === 'planning'
                        ? 'bg-indigo-400'
                        : 'bg-slate-600'
                    }`}
                  />
                  <h3 className="text-sm font-semibold text-slate-300">{sprint.name}</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      sprint.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : sprint.status === 'planning'
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    {sprint.status}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-500">No Sprint</h3>
                </>
              )}
              <span className="text-xs text-slate-600">({groupIssues.length})</span>
            </div>

            <button
              onClick={() => onCreateIssue('todo')}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-400 transition-colors px-2 py-1 hover:bg-slate-800 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Issues */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
            {groupIssues.map((issue, idx) => (
              <div
                key={issue.id}
                className={idx < groupIssues.length - 1 ? 'border-b border-slate-800/40' : ''}
              >
                <BacklogIssueRow issue={issue} onClick={() => onIssueClick(issue)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
