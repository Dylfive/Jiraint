'use client';

import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { Issue, IssueStatus, PRIORITY_CONFIG, TYPE_CONFIG, COLUMNS } from '@/lib/types';
import { AlertCircle, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  onQuickMove?: (newStatus: IssueStatus) => void;
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

const STATUS_ORDER: IssueStatus[] = ['todo', 'in_progress', 'review', 'done'];

export default function IssueCard({
  issue,
  onClick,
  onQuickMove,
  dragHandleProps,
  draggableProps,
  innerRef,
  isDragging,
}: IssueCardProps) {
  const priority = PRIORITY_CONFIG[issue.priority];
  const type = TYPE_CONFIG[issue.type];

  const currentIndex = STATUS_ORDER.indexOf(issue.status);
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;
  const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      onClick={onClick}
      className={`
        group relative bg-slate-800/90 border rounded-xl p-3.5 cursor-pointer
        transition-all duration-200 select-none touch-manipulation
        ${isDragging
          ? 'kanban-card-dragging border-indigo-500/60 bg-slate-800'
          : 'border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/20'
        }
      `}
    >
      {/* Priority left-border accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: priority.color }}
      />

      {/* Top row: Type, Priority, and Drag Handle */}
      <div className="flex items-center justify-between mb-2 pl-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${type.bg} ${type.text}`}>
            <span>{type.emoji}</span>
            {type.label}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
            {issue.priority === 'critical' && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
            {priority.label}
          </span>
        </div>

        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="text-slate-500 hover:text-slate-300 p-1 -mr-1 rounded cursor-grab active:cursor-grabbing opacity-60 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
          title="Drag issue"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-slate-200 font-medium leading-snug pl-2 mb-3 line-clamp-2">
        {issue.title}
      </p>

      {/* Footer: Quick Move (Mobile Friendly) + Assignee + Points */}
      <div className="flex items-center justify-between pl-2 pt-1 border-t border-slate-700/40">
        <div className="flex items-center gap-2">
          {/* Quick mobile move arrows */}
          {onQuickMove && (
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {prevStatus && (
                <button
                  onClick={() => onQuickMove(prevStatus)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title={`Move back to ${COLUMNS.find((c) => c.id === prevStatus)?.label}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {nextStatus && (
                <button
                  onClick={() => onQuickMove(nextStatus)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title={`Move to ${COLUMNS.find((c) => c.id === nextStatus)?.label}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {issue.story_points && (
            <span className="text-[10px] text-slate-500 bg-slate-900/60 border border-slate-700/50 px-1.5 py-0.5 rounded font-mono">
              {issue.story_points}pt
            </span>
          )}
        </div>

        {/* Assignee Avatar / Name */}
        {issue.assignee ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${issue.assignee}`}>
            <span className="text-[10px] text-slate-400 max-w-[90px] truncate hidden sm:inline">
              {issue.assignee}
            </span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: getAvatarColor(issue.assignee) }}
            >
              {getInitials(issue.assignee)}
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-slate-600 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
}
