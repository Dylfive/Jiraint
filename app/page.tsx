'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  Loader2, Kanban, LayoutDashboard, List, Plus, X, FolderPlus, CalendarPlus,
} from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Project modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');

  // New Sprint modal state
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');

  // Set initial sidebar state based on screen width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

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
          // If no projects exist, initialize a clean default Personal Board
          const defaultProj = {
            name: 'Personal Board',
            key: 'PB',
            description: 'My personal tasks and goals',
            color: '#6366f1',
          };
          const { data: created, error: createErr } = await supabase
            .from('projects')
            .insert([defaultProj])
            .select()
            .single();

          if (!createErr && created) {
            setProjects([created]);
            setCurrentProject(created);
          } else {
            setLoading(false);
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to connect to Supabase.');
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
        // By default, do NOT force filter by sprint; show all issues unless user explicitly picks one
        const active = data.find((s) => s.status === 'active') || null;
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
      // Keep existing issues
    } finally {
      setLoading(false);
    }
  };

  // Derive existing assignees dynamically from issues
  const existingAssignees = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => {
      if (i.assignee?.trim()) set.add(i.assignee.trim());
    });
    return Array.from(set);
  }, [issues]);

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const key = (newProjectKey.trim() || newProjectName.slice(0, 3)).toUpperCase();
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProjectName.trim(),
          key,
          color: randomColor,
        }])
        .select()
        .single();

      if (!error && data) {
        setProjects((prev) => [...prev, data]);
        setCurrentProject(data);
        setCurrentSprint(null);
        setIssues([]);
        setSprints([]);
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectKey('');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim() || !currentProject) return;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          project_id: currentProject.id,
          name: newSprintName.trim(),
          status: 'active',
        }])
        .select()
        .single();

      if (!error && data) {
        setSprints((prev) => [data, ...prev]);
        setCurrentSprint(data);
        setShowNewSprintModal(false);
        setNewSprintName('');
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="max-w-md w-full p-6 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl font-bold">!</span>
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Connection Error</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar with mobile backdrop and hideable drawer */}
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
        onCreateIssue={() => handleCreateClick('todo')}
        onNewProject={() => setShowNewProjectModal(true)}
        onNewSprint={() => setShowNewSprintModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 px-3 sm:px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Hamburger Button */}
            <button
              id="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all flex-shrink-0"
              title="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Project / View Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 leading-none mb-1 truncate">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentProject?.color || '#6366f1' }}
                />
                <span className="truncate">{currentProject?.name || 'Personal Board'}</span>
                <span className="text-slate-700">/</span>
                <span className="capitalize">{currentView}</span>
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 leading-tight truncate">
                {currentView === 'board'
                  ? currentSprint ? currentSprint.name : 'Board'
                  : currentView === 'dashboard'
                  ? 'Overview & Metrics'
                  : 'Backlog'}
              </h1>
            </div>
          </div>

          {/* Header Actions / Sprint Pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentSprint && (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium hidden sm:inline-flex items-center gap-1.5 ${
                  currentSprint.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {currentSprint.name}
              </span>
            )}

            {/* Quick create button in header */}
            <button
              onClick={() => handleCreateClick('todo')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Issue</span>
            </button>
          </div>
        </header>

        {/* Filter Bar (Active on Board view) */}
        {currentView === 'board' && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onCreateIssue={() => handleCreateClick('todo')}
            totalIssues={issues.length}
          />
        )}

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-auto relative min-h-0">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs sm:text-sm">Loading tasks...</span>
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

        {/* Mobile Bottom Navigation Bar for Instant 1-Tap Switching */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-2 py-2 flex-shrink-0 z-20">
          <button
            onClick={() => setCurrentView('board')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-medium transition-colors ${
              currentView === 'board' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span className="text-[11px]">Board</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-medium transition-colors ${
              currentView === 'dashboard' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[11px]">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('backlog')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-medium transition-colors ${
              currentView === 'backlog' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-[11px]">Backlog</span>
          </button>
        </div>
      </div>

      {/* Issue Detail & Edit Modal */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          sprints={sprints}
          existingAssignees={existingAssignees}
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
          existingAssignees={existingAssignees}
        />
      )}

      {/* Create Project Modal */}
      {showNewProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewProjectModal(false); }}
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">Create Project</h3>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Key (2-4 letters)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={newProjectKey}
                  onChange={(e) => setNewProjectKey(e.target.value.toUpperCase())}
                  placeholder="e.g. WEB"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 uppercase outline-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showNewSprintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewSprintModal(false); }}
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">Create Sprint</h3>
              </div>
              <button
                onClick={() => setShowNewSprintModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSprint} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sprint Name</label>
                <input
                  type="text"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder="e.g. Sprint 1 - MVP"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSprintModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSprintName.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
