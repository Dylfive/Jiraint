'use client';

import { useState } from 'react';
import {
  X, Trash2, Save, AlertCircle, Clock, User,
  Tag, Flag, Layers,
} from 'lucide-react';
import {
  Issue, Sprint, IssueType, IssuePriority, IssueStatus,
  PRIORITY_CONFIG, TYPE_CONFIG, COLUMNS,
} from '@/lib/types';

interface IssueModalProps {
  issue: Issue;
  sprints: Sprint[];
  existingAssignees?: string[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Issue>) => void;
  onDelete: (id: string) => void;
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 py-1">
      <div className="flex items-center gap-2 sm:w-28 flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function IssueModal({
  issue,
  sprints,
  existingAssignees = [],
  onClose,
  onSave,
  onDelete,
}: IssueModalProps) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [type, setType] = useState<IssueType>(issue.type);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [assignee, setAssignee] = useState(issue.assignee || '');
  const [storyPoints, setStoryPoints] = useState(issue.story_points?.toString() || '');
  const [sprintId, setSprintId] = useState(issue.sprint_id || '');
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const markDirty = () => setIsDirty(true);

  const handleSave = () => {
    onSave(issue.id, {
      title: title.trim(),
      description: description.trim() || null,
      type,
      priority,
      status,
      assignee: assignee.trim() || null,
      story_points: storyPoints ? parseInt(storyPoints) : null,
      sprint_id: sprintId || null,
    });
    setIsDirty(false);
  };

  const priorityCfg = PRIORITY_CONFIG[priority];
  const typeCfg = TYPE_CONFIG[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{typeCfg.emoji}</span>
            <span className="text-xs font-mono text-slate-500">
              #{issue.id.slice(0, 8)}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
              {priorityCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isDirty && (
              <button
                id="save-issue-btn"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            <button
              id="delete-issue-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-issue-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">
              Title
            </label>
            <textarea
              id="issue-title-input"
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty(); }}
              className="w-full bg-slate-800/40 hover:bg-slate-800/70 focus:bg-slate-800 border border-slate-700/60 focus:border-indigo-500 rounded-lg px-3 py-2 text-base font-semibold text-slate-100 resize-none outline-none placeholder-slate-600 transition-all leading-snug"
              placeholder="Issue title..."
              rows={2}
            />
          </div>

          {/* Metadata fields */}
          <div className="space-y-2 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <Field label="Status" icon={Layers}>
              <select
                id="issue-status-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value as IssueStatus); markDirty(); }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id} className="bg-slate-900">
                    {col.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority" icon={Flag}>
              <select
                id="issue-priority-select"
                value={priority}
                onChange={(e) => { setPriority(e.target.value as IssuePriority); markDirty(); }}
                className={`w-full bg-slate-800 border text-sm rounded-lg px-2.5 py-1.5 outline-none transition-all cursor-pointer ${priorityCfg.text} border-slate-700 focus:border-indigo-500`}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-200">
                    {cfg.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Type" icon={Tag}>
              <select
                id="issue-type-select"
                value={type}
                onChange={(e) => { setType(e.target.value as IssueType); markDirty(); }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-slate-900">
                    {cfg.emoji} {cfg.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assignee" icon={User}>
              <div className="relative">
                <input
                  id="issue-assignee-input"
                  type="text"
                  list="edit-assignee-suggestions"
                  value={assignee}
                  onChange={(e) => { setAssignee(e.target.value); markDirty(); }}
                  placeholder="e.g. Dylan or leave unassigned"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
                />
                <datalist id="edit-assignee-suggestions">
                  {existingAssignees.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </Field>

            <Field label="Sprint" icon={Clock}>
              <select
                id="issue-sprint-select"
                value={sprintId}
                onChange={(e) => { setSprintId(e.target.value); markDirty(); }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-900">No Sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id} className="bg-slate-900">
                    {sprint.name} {sprint.status === 'active' ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Points" icon={AlertCircle}>
              <input
                id="issue-points-input"
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => { setStoryPoints(e.target.value); markDirty(); }}
                placeholder="Story points (optional)"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
              />
            </Field>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea
              id="issue-description-input"
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty(); }}
              placeholder="Add more details, tasks, or notes..."
              rows={4}
              className="w-full bg-slate-800/40 hover:bg-slate-800/70 focus:bg-slate-800 border border-slate-700/60 focus:border-indigo-500/60 text-slate-300 text-sm rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all placeholder-slate-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer with save */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
          <span className="text-xs text-slate-500">
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              Close
            </button>
            {isDirty && (
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-6 z-20 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Delete this issue?</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                This action cannot be undone. Are you sure you want to remove &ldquo;{issue.title}&rdquo;?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-issue-btn"
                  onClick={() => onDelete(issue.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
