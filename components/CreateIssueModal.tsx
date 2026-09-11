'use client';

import { useState } from 'react';
import { X, Plus, User } from 'lucide-react';
import {
  Issue, Sprint, Project, IssueType, IssuePriority, IssueStatus,
  PRIORITY_CONFIG, TYPE_CONFIG, COLUMNS,
} from '@/lib/types';

interface CreateIssueModalProps {
  onClose: () => void;
  onSave: (issue: Partial<Issue>) => void;
  defaultStatus: IssueStatus;
  currentProject: Project | null;
  currentSprint: Sprint | null;
  sprints: Sprint[];
  existingAssignees?: string[];
}

export default function CreateIssueModal({
  onClose,
  onSave,
  defaultStatus,
  currentProject,
  currentSprint,
  sprints,
  existingAssignees = [],
}: CreateIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('task');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [status, setStatus] = useState<IssueStatus>(defaultStatus);
  const [assignee, setAssignee] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [sprintId, setSprintId] = useState(currentSprint?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      type,
      priority,
      status,
      assignee: assignee.trim() || null,
      story_points: storyPoints ? parseInt(storyPoints) : null,
      sprint_id: sprintId || null,
    });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Create Issue</h2>
              {currentProject && (
                <p className="text-xs text-slate-500">{currentProject.name} · {currentProject.key}</p>
              )}
            </div>
          </div>
          <button
            id="close-create-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label htmlFor="new-issue-title" className="block text-xs font-medium text-slate-400 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="new-issue-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                autoFocus
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all placeholder-slate-600"
              />
            </div>

            {/* Type + Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-issue-type" className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                <select
                  id="new-issue-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as IssueType)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer"
                >
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key} className="bg-slate-900">
                      {cfg.emoji} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="new-issue-priority" className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
                <select
                  id="new-issue-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className={`w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-sm rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${PRIORITY_CONFIG[priority].text}`}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key} className="bg-slate-900 text-slate-200">
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status + Assignee row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-issue-status" className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select
                  id="new-issue-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer"
                >
                  {COLUMNS.map((col) => (
                    <option key={col.id} value={col.id} className="bg-slate-900">{col.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="new-issue-assignee" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Assignee <span className="text-slate-600">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="new-issue-assignee"
                    type="text"
                    list="create-assignee-suggestions"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. Dylan or leave blank"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none transition-all placeholder-slate-600"
                  />
                  <datalist id="create-assignee-suggestions">
                    {existingAssignees.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Sprint + Story Points row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-issue-sprint" className="block text-xs font-medium text-slate-400 mb-1.5">Sprint</label>
                <select
                  id="new-issue-sprint"
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900">No Sprint (Direct to Backlog/Board)</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id} className="bg-slate-900">
                      {sprint.name} {sprint.status === 'active' ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="new-issue-points" className="block text-xs font-medium text-slate-400 mb-1.5">Story Points</label>
                <input
                  id="new-issue-points"
                  type="number"
                  min="0"
                  max="100"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="new-issue-description" className="block text-xs font-medium text-slate-400 mb-1.5">
                Description <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                id="new-issue-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details or notes..."
                rows={3}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500/60 text-slate-300 text-sm rounded-lg px-3.5 py-2.5 outline-none resize-none transition-all placeholder-slate-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              id="submit-create-issue-btn"
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              {submitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
