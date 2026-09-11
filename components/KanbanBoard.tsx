'use client';

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Issue, Filters, IssueStatus, COLUMNS } from '@/lib/types';
import IssueCard from './IssueCard';

interface KanbanBoardProps {
  issues: Issue[];
  filters: Filters;
  onIssueClick: (issue: Issue) => void;
  onUpdateIssue: (id: string, updates: Partial<Issue>) => void;
  onCreateIssue: (status: IssueStatus) => void;
}

function applyFilters(issues: Issue[], filters: Filters): Issue[] {
  return issues.filter((issue) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !issue.title.toLowerCase().includes(q) &&
        !(issue.description?.toLowerCase().includes(q)) &&
        !(issue.assignee?.toLowerCase().includes(q))
      ) return false;
    }
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.type && issue.type !== filters.type) return false;
    if (filters.assignee && issue.assignee?.toLowerCase() !== filters.assignee.toLowerCase()) return false;
    return true;
  });
}

export default function KanbanBoard({
  issues,
  filters,
  onIssueClick,
  onUpdateIssue,
  onCreateIssue,
}: KanbanBoardProps) {
  const [boardIssues, setBoardIssues] = useState<Issue[]>(issues);
  const [activeMobileCol, setActiveMobileCol] = useState<IssueStatus>('todo');
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setBoardIssues(issues);
  }, [issues]);

  const filteredIssues = applyFilters(boardIssues, filters);

  const getColumnIssues = (status: IssueStatus) =>
    filteredIssues
      .filter((i) => i.status === status)
      .sort((a, b) => a.issue_order - b.issue_order);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as IssueStatus;

    // Optimistic local update
    setBoardIssues((prev) =>
      prev.map((issue) =>
        issue.id === draggableId ? { ...issue, status: newStatus } : issue
      )
    );

    // Persist to Supabase
    onUpdateIssue(draggableId, { status: newStatus });
  };

  const scrollToColumn = (status: IssueStatus) => {
    setActiveMobileCol(status);
    const el = columnRefs.current[status];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mobile Column Quick Switcher Tabs */}
      <div className="sm:hidden px-3 pt-2.5 pb-1 border-b border-slate-800/60 flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-950/40">
        {COLUMNS.map((col) => {
          const count = filteredIssues.filter((i) => i.status === col.id).length;
          const isActive = activeMobileCol === col.id;
          return (
            <button
              key={col.id}
              onClick={() => scrollToColumn(col.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${isActive
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-300'
                }
              `}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              {col.label}
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-5 h-full overflow-x-auto snap-x-mandatory min-h-0">
          {COLUMNS.map((column) => {
            const colIssues = getColumnIssues(column.id);
            const allColIssues = boardIssues.filter((i) => i.status === column.id);
            const isFiltered = allColIssues.length !== colIssues.length;

            return (
              <div
                key={column.id}
                ref={(el) => { columnRefs.current[column.id] = el; }}
                id={`kanban-column-${column.id}`}
                className="flex flex-col w-[85vw] max-w-[320px] sm:w-72 flex-shrink-0 snap-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="text-sm font-semibold text-slate-200">{column.label}</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {isFiltered ? `${colIssues.length}/${allColIssues.length}` : allColIssues.length}
                    </span>
                  </div>
                  <button
                    id={`add-issue-${column.id}`}
                    onClick={() => onCreateIssue(column.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
                    title={`Add issue to ${column.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Droppable Column Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 rounded-2xl p-2 sm:p-2.5 transition-all duration-200 overflow-y-auto space-y-2.5
                        ${snapshot.isDraggingOver
                          ? 'bg-slate-800/70 ring-2 ring-indigo-500/30 ring-inset'
                          : 'bg-slate-900/50 border border-slate-800/60'
                        }
                      `}
                    >
                      {colIssues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <IssueCard
                              issue={issue}
                              innerRef={dragProvided.innerRef}
                              draggableProps={dragProvided.draggableProps}
                              dragHandleProps={dragProvided.dragHandleProps}
                              isDragging={dragSnapshot.isDragging}
                              onClick={() => onIssueClick(issue)}
                              onQuickMove={(newStatus) => onUpdateIssue(issue.id, { status: newStatus })}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colIssues.length === 0 && (
                        <div
                          onClick={() => onCreateIssue(column.id)}
                          className="flex flex-col items-center justify-center h-28 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all group"
                        >
                          <Plus className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mb-1 transition-colors" />
                          <p className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                            Add an issue
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
