'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Issue, Filters, IssueStatus, COLUMNS, PRIORITY_CONFIG } from '@/lib/types';
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-5 h-full overflow-x-auto min-h-0">
        {COLUMNS.map((column) => {
          const colIssues = getColumnIssues(column.id);
          const allColIssues = boardIssues.filter((i) => i.status === column.id);
          const isFiltered = allColIssues.length !== colIssues.length;

          return (
            <div
              key={column.id}
              id={`kanban-column-${column.id}`}
              className="flex flex-col w-72 flex-shrink-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
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
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
                  title={`Add issue to ${column.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 rounded-xl p-2.5 min-h-[200px] overflow-y-auto
                      transition-all duration-200
                      ${snapshot.isDraggingOver
                        ? 'bg-indigo-500/8 border border-indigo-500/20'
                        : 'bg-slate-900/50 border border-transparent'
                      }
                    `}
                  >
                    <div className="space-y-2.5">
                      {colIssues.map((issue, index) => (
                        <Draggable
                          key={issue.id}
                          draggableId={issue.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <IssueCard
                              issue={issue}
                              onClick={() => onIssueClick(issue)}
                              innerRef={provided.innerRef}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                            />
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {colIssues.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div
                            className="w-8 h-8 rounded-full mb-2 flex items-center justify-center opacity-30"
                            style={{ backgroundColor: column.color + '33' }}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
                          </div>
                          <p className="text-xs text-slate-600">
                            {filters.search || filters.priority || filters.type
                              ? 'No matches'
                              : 'No issues'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>

              {/* Add Issue Footer */}
              <button
                onClick={() => onCreateIssue(column.id)}
                className="mt-2 w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs text-slate-600 hover:text-slate-300 hover:bg-slate-800/80 transition-all duration-150 group"
              >
                <Plus className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
                Add issue
              </button>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
