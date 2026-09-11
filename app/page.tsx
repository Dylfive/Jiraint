'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Project, Sprint, Issue, Filters, ViewType, IssueStatus,
} from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import KanbanBoard from '@/components/KanbanBoard';
import DashboardView from '@/components/DashboardView';
import BacklogView from '@/components/BacklogView';
import IssueModal from '@/components/IssueModal';
import CreateIssueModal from '@/components/CreateIssueModal';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [filters, setFilters] = useState<Filters>({ search: '', priority: '', type: '', assignee: '' });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState<IssueStatus>('todo');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(data);
          setCurrentProject(data[0]);
        } else {
          setLoading(false);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load projects. Check your Supabase setup.');
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch sprints when project changes
  useEffect(() => {
    if (!currentProject) return;
    const fetchSprints = async () => {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSprints(data);
        const active = data.find((s) => s.status === 'active') || data[0] || null;
        setCurrentSprint(active);
      }
    };
    fetchSprints();
  }, [currentProject]);

  // Fetch issues when project or sprint changes
  useEffect(() => {
    if (!currentProject) return;
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, currentSprint]);

  const fetchIssues = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      let query = supabase
        .from('issues')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('issue_order', { ascending: true });

      if (currentSprint) {
        query = query.eq('sprint_id', currentSprint.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIssues(data || []);
    } catch {
      // silently fail, keep existing issues
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (issueData: Partial<Issue>) => {
    try {
      const newIssue = {
        title: issueData.title || 'Untitled Issue',
        description: issueData.description || null,
        type: issueData.type || 'task',
        priority: issueData.priority || 'medium',
        status: issueData.status || 'todo',
        assignee: issueData.assignee || null,
        story_points: issueData.story_points || null,
        project_id: currentProject?.id,
        sprint_id: issueData.sprint_id !== undefined ? issueData.sprint_id : (currentSprint?.id || null),
        issue_order: issues.length + 1,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('issues')
        .insert([newIssue])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setIssues((prev) => [...prev, data]);
      }
    } catch (e) {
      console.error('Failed to create issue:', e);
    }
    setShowCreateModal(false);
  };

  const handleUpdateIssue = async (id: string, updates: Partial<Issue>) => {
    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
    if (selectedIssue?.id === id) {
      setSelectedIssue((prev) => (prev ? { ...prev, ...updates } : prev));
    }

    try {
      const { data, error } = await supabase
        .from('issues')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setIssues((prev) => prev.map((i) => (i.id === id ? data : i)));
        if (selectedIssue?.id === id) setSelectedIssue(data);
      }
    } catch (e) {
      console.error('Failed to update issue:', e);
      // Revert on failure
      fetchIssues();
    }
  };

  const handleDeleteIssue = async (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
    setSelectedIssue(null);
    try {
      await supabase.from('issues').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete issue:', e);
    }
  };

  const handleProjectChange = (project: Project) => {
    setCurrentProject(project);
    setCurrentSprint(null);
    setIssues([]);
    setSprints([]);
  };

  const handleCreateClick = (status: IssueStatus = 'todo') => {
    setDefaultCreateStatus(status);
    setShowCreateModal(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="max-w-md w-full mx-4 p-6 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Connection Error</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <p className="text-slate-500 text-xs">
            Make sure you&apos;ve run the SQL schema in your Supabase project and RLS policies allow access.
          </p>
          <button
            onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
        sprints={sprints}
        currentSprint={currentSprint}
        onSprintChange={setCurrentSprint}
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
              title="Toggle Sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5 flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentProject?.color || '#6366f1' }}
                />
                {currentProject?.name || 'No Project Selected'}
                <span className="text-slate-700">›</span>
                <span className="capitalize">{currentView}</span>
              </p>
              <h1 className="text-base font-semibold text-slate-100 leading-tight">
                {currentView === 'board'
                  ? currentSprint?.name || 'Sprint Board'
                  : currentView === 'dashboard'
                  ? 'Dashboard'
                  : 'Backlog'}
              </h1>
            </div>
          </div>

          {/* Sprint badge */}
          {currentSprint && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  currentSprint.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : currentSprint.status === 'planning'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}
              >
                {currentSprint.status === 'active' && '● '}
                {currentSprint.status.charAt(0).toUpperCase() + currentSprint.status.slice(1)}
              </span>
              {currentSprint.end_date && (
                <span className="text-xs text-slate-500">
                  Due {new Date(currentSprint.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          )}
        </header>

        {/* Filter Bar – only on board view */}
        {currentView === 'board' && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onCreateIssue={() => handleCreateClick('todo')}
            totalIssues={issues.length}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}

          {currentView === 'board' && (
            <KanbanBoard
              issues={issues}
              filters={filters}
              onIssueClick={setSelectedIssue}
              onUpdateIssue={handleUpdateIssue}
              onCreateIssue={handleCreateClick}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              issues={issues}
              sprints={sprints}
              currentSprint={currentSprint}
              currentProject={currentProject}
            />
          )}

          {currentView === 'backlog' && (
            <BacklogView
              issues={issues}
              filters={filters}
              sprints={sprints}
              currentSprint={currentSprint}
              onIssueClick={setSelectedIssue}
              onCreateIssue={handleCreateClick}
            />
          )}
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          sprints={sprints}
          onClose={() => setSelectedIssue(null)}
          onSave={handleUpdateIssue}
          onDelete={handleDeleteIssue}
        />
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateIssue}
          defaultStatus={defaultCreateStatus}
          currentProject={currentProject}
          currentSprint={currentSprint}
          sprints={sprints}
        />
      )}
    </div>
  );
}
