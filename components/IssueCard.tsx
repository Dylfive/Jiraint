'use client';

import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { Issue, PRIORITY_CONFIG, TYPE_CONFIG } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  draggableProps?: DraggableProvidedDraggableProps;
  innerRef?: (el: HTMLElement | null) => void;
  isDragging?: boolean;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name: string | null): string {
  if (!name) return '#475569';
  const colors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function IssueCard({
  issue,
  onClick,
  dragHandleProps,
  draggableProps,
  innerRef,
  isDragging,
}: IssueCardProps) {
  const priority = PRIORITY_CONFIG[issue.priority];
  const type = TYPE_CONFIG[issue.type];

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      onClick={onClick}
      className={`
        group relative bg-slate-800/90 border rounded-xl p-3.5 cursor-pointer
        transition-all duration-200 select-none
        ${isDragging
          ? 'kanban-card-dragging border-indigo-500/60 bg-slate-800'
          : 'border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/20'
        }
      `}
    >
      {/* Priority left-border accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
        style={{ backgroundColor: priority.color }}
      />

      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-slate-700 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </div>

      {/* Type + Priority badges */}
      <div className="flex items-center gap-1.5 mb-2.5 pl-2">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${type.bg} ${type.text}`}>
          <span>{type.emoji}</span>
          {type.label}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
          {issue.priority === 'critical' && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-slate-200 font-medium leading-snug pl-2 pr-6 mb-3 line-clamp-2">
        {issue.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-2">
          {/* Assignee avatar */}
          {issue.assignee ? (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: getAvatarColor(issue.assignee) }}
              title={issue.assignee}
            >
              {getInitials(issue.assignee)}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center" title="Unassigned">
              <span className="text-[8px] text-slate-600">?</span>
            </div>
          )}

          {/* Story points */}
          {issue.story_points && (
            <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              {issue.story_points} pts
            </span>
          )}
        </div>

        {/* Issue key */}
        <span className="text-[10px] text-slate-600 font-mono">
          #{issue.id.slice(-4).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
