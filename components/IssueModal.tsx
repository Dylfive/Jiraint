'use client';

import { useState } from 'react';
import {
  X, Trash2, Save, AlertCircle, Clock, User,
  Tag, Flag, Layers, ChevronDown,
} from 'lucide-react';
import {
  Issue, Sprint, IssueType, IssuePriority, IssueStatus,
  PRIORITY_CONFIG, TYPE_CONFIG, COLUMNS,
} from '@/lib/types';

interface IssueModalProps {
  issue: Issue;
  sprints: Sprint[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Issue>) => void;
  onDelete: (id: string) => void;
}

const ASSIGNEES = [
  'Alex Chen', 'Sarah Kim', 'Marcus Lee', 'Jordan Patel', 'Riley Wong',
];

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-2">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function IssueModal({ issue, sprints, onClose, onSave, onDelete }: IssueModalProps) {
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
      title,
      description: description || null,
      type,
      priority,
      status,
      assignee: assignee || null,
      story_points: storyPoints ? parseInt(storyPoints) : null,
      sprint_id: sprintId || null,
    });
    setIsDirty(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete(issue.id);
  };

  const priorityCfg = PRIORITY_CONFIG[priority];
  const typeCfg = TYPE_CONFIG[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${typeCfg.text}`}>{typeCfg.emoji}</span>
            <span className="text-xs text-slate-500 font-mono">
              #{issue.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-xs text-slate-500">
              {new Date(issue.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                id="save-issue-btn"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            <button
              id="delete-issue-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-issue-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Title */}
          <textarea
            id="issue-title-input"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            className="w-full bg-transparent text-lg font-semibold text-slate-100 resize-none outline-none placeholder-slate-600 mb-4 leading-snug hover:bg-slate-800/30 focus:bg-slate-800/50 rounded-lg px-2 py-1.5 -mx-2 transition-all"
            placeholder="Issue title..."
            rows={2}
          />

          {/* Metadata grid */}
          <div className="space-y-2 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
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
              <select
                id="issue-assignee-select"
                value={assignee}
                onChange={(e) => { setAssignee(e.target.value); markDirty(); }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-900">Unassigned</option>
                {ASSIGNEES.map((name) => (
                  <option key={name} value={name} className="bg-slate-900">{name}</option>
                ))}
              </select>
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
                placeholder="Story points"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all"
              />
            </Field>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <textarea
              id="issue-description-input"
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty(); }}
              placeholder="Add a description..."
              rows={6}
              className="w-full bg-slate-800/50 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/60 focus:border-indigo-500/60 text-slate-300 text-sm rounded-xl px-4 py-3 outline-none resize-none transition-all placeholder-slate-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 flex-shrink-0 bg-slate-900/80">
          <p className="text-xs text-slate-600">
            Updated {new Date(issue.updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              id="save-issue-footer-btn"
              onClick={handleSave}
              disabled={!isDirty}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in shadow-2xl">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-center mb-2">Delete Issue?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              This action cannot be undone. The issue will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDelete}
                className="flex-1 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
