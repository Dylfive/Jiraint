'use client';

import { useMemo } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, BarChart3,
  TrendingUp, Users,
} from 'lucide-react';
import { Issue, Sprint, Project, PRIORITY_CONFIG, TYPE_CONFIG } from '@/lib/types';

interface DashboardViewProps {
  issues: Issue[];
  sprints: Sprint[];
  currentSprint: Sprint | null;
  currentProject: Project | null;
}

function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="text-[11px] sm:text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500">{label}</p>
      {sub && <p className="text-[11px] sm:text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardView({
  issues,
  currentSprint,
}: DashboardViewProps) {
  const stats = useMemo(() => {
    const total = issues.length;
    const done = issues.filter((i) => i.status === 'done').length;
    const inProgress = issues.filter((i) => i.status === 'in_progress').length;
    const review = issues.filter((i) => i.status === 'review').length;
    const todo = issues.filter((i) => i.status === 'todo').length;
    const critical = issues.filter((i) => i.priority === 'critical').length;
    const bugs = issues.filter((i) => i.type === 'bug').length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
    const totalPoints = issues.reduce((sum, i) => sum + (i.story_points || 0), 0);
    const donePoints = issues
      .filter((i) => i.status === 'done')
      .reduce((sum, i) => sum + (i.story_points || 0), 0);

    const byPriority = Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      color: cfg.color,
      count: issues.filter((i) => i.priority === key).length,
    }));

    const byType = Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      emoji: cfg.emoji,
      count: issues.filter((i) => i.type === key).length,
    }));

    const byAssignee = Array.from(
      issues.reduce((map, issue) => {
        const name = issue.assignee?.trim() || 'Unassigned';
        const curr = map.get(name) || { name, total: 0, done: 0 };
        curr.total++;
        if (issue.status === 'done') curr.done++;
        map.set(name, curr);
        return map;
      }, new Map<string, { name: string; total: number; done: number }>())
    ).map(([, v]) => v).sort((a, b) => b.total - a.total).slice(0, 5);

    return {
      total, done, inProgress, review, todo, critical, bugs,
      completionPct, totalPoints, donePoints, byPriority, byType, byAssignee,
    };
  }, [issues]);

  const sprintDaysLeft = useMemo(() => {
    if (!currentSprint?.end_date) return null;
    const end = new Date(currentSprint.end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [currentSprint]);

  const recentIssues = useMemo(
    () => [...issues].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [issues]
  );

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 className="w-7 h-7 text-indigo-400" />
        </div>
        <h3 className="text-slate-300 font-semibold text-base mb-1.5">No tasks recorded yet</h3>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xs">
          Create issues in the Board view to see your metrics, progress, and workload here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Sprint Banner (if sprint active) */}
      {currentSprint && (
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">Active Sprint</p>
            </div>
            <h2 className="text-slate-100 font-semibold text-base sm:text-lg">{currentSprint.name}</h2>
            {currentSprint.start_date && currentSprint.end_date && (
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {new Date(currentSprint.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(currentSprint.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          {sprintDaysLeft !== null && (
            <div className="sm:text-right">
              <div className={`text-xl sm:text-2xl font-bold ${sprintDaysLeft < 0 ? 'text-red-400' : sprintDaysLeft <= 3 ? 'text-orange-400' : 'text-slate-100'}`}>
                {sprintDaysLeft < 0 ? `${Math.abs(sprintDaysLeft)}d over` : `${sprintDaysLeft}d left`}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">to end of sprint</p>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Issues"
          value={stats.total}
          sub={`${stats.totalPoints} points`}
          icon={BarChart3}
          color="#6366f1"
        />
        <StatCard
          label="Completed"
          value={`${stats.completionPct}%`}
          sub={`${stats.done} of ${stats.total} done`}
          icon={CheckCircle2}
          color="#22c55e"
          trend={stats.done > 0 ? `${stats.done} done` : undefined}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          sub={`${stats.review} in review`}
          icon={Clock}
          color="#6366f1"
        />
        <StatCard
          label="Critical Issues"
          value={stats.critical}
          sub={`${stats.bugs} bug${stats.bugs !== 1 ? 's' : ''} open`}
          icon={AlertTriangle}
          color="#ef4444"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Overall Progress</h3>
          <span className="text-xs sm:text-sm text-slate-400 font-mono">{stats.completionPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>
        {/* Column breakdown */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'To Do', value: stats.todo, color: '#64748b' },
            { label: 'In Progress', value: stats.inProgress, color: '#6366f1' },
            { label: 'Review', value: stats.review, color: '#f59e0b' },
            { label: 'Done', value: stats.done, color: '#22c55e' },
          ].map((col) => (
            <div key={col.label} className="text-center p-2 rounded-xl bg-slate-800/40">
              <div
                className="text-base sm:text-xl font-bold mb-0.5"
                style={{ color: col.color }}
              >
                {col.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">{col.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* By Priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200 mb-3.5">By Priority</h3>
          <div className="space-y-3">
            {stats.byPriority.map((p) => (
              <div key={p.key}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-slate-400">{p.label}</span>
                  <span className="text-slate-500 font-mono">{p.count}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: stats.total > 0 ? `${(p.count / stats.total) * 100}%` : '0%',
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200 mb-3.5">By Type</h3>
          <div className="space-y-2.5">
            {stats.byType.map((t) => (
              <div key={t.key} className="flex items-center gap-2.5">
                <span className="text-sm">{t.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="text-slate-400">{t.label}</span>
                    <span className="text-slate-500 font-mono">{t.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500/70 rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${(t.count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload by Assignee */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3.5">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Workload by Assignee</h3>
          </div>
          <div className="space-y-3">
            {stats.byAssignee.map((member) => (
              <div key={member.name} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-slate-300 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono ml-2">{member.done}/{member.total}</p>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70 rounded-full"
                      style={{ width: member.total > 0 ? `${(member.done / member.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.byAssignee.length === 0 && (
              <p className="text-xs text-slate-600 italic">No assigned tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Recent Issues</h3>
          <span className="text-xs text-slate-600">{issues.length} total</span>
        </div>
        <div className="space-y-2">
          {recentIssues.map((issue) => {
            const priority = PRIORITY_CONFIG[issue.priority];
            const type = TYPE_CONFIG[issue.type];
            return (
              <div
                key={issue.id}
                className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-all"
              >
                <span className="text-xs sm:text-sm">{type.emoji}</span>
                <p className="flex-1 text-xs sm:text-sm text-slate-300 truncate">{issue.title}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ color: priority.color, backgroundColor: priority.color + '20' }}
                  >
                    {priority.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
