export type IssueType = 'bug' | 'task' | 'story' | 'epic';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type SprintStatus = 'planning' | 'active' | 'completed';
export type ViewType = 'board' | 'dashboard' | 'backlog';

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Issue {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assignee: string | null;
  story_points: number | null;
  issue_order: number;
  created_at: string;
  updated_at: string;
}

export interface Filters {
  search: string;
  priority: IssuePriority | '';
  type: IssueType | '';
  assignee: string;
}

export const COLUMNS: { id: IssueStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#64748b' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1' },
  { id: 'review', label: 'Review', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  high:     { label: 'High',     color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  medium:   { label: 'Medium',   color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  low:      { label: 'Low',      color: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
};

export const TYPE_CONFIG = {
  bug:   { label: 'Bug',   emoji: '🐛', bg: 'bg-red-500/15',    text: 'text-red-300' },
  task:  { label: 'Task',  emoji: '✓',  bg: 'bg-blue-500/15',   text: 'text-blue-300' },
  story: { label: 'Story', emoji: '📖', bg: 'bg-purple-500/15', text: 'text-purple-300' },
  epic:  { label: 'Epic',  emoji: '⚡', bg: 'bg-yellow-500/15', text: 'text-yellow-300' },
};
