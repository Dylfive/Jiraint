'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Kanban, List, ChevronDown, ChevronRight,
  Plus, Zap, Circle, CheckCircle2, Clock, X, FolderPlus, CalendarPlus,
} from 'lucide-react';
import { Project, Sprint, ViewType } from '@/lib/types';

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectChange: (project: Project) => void;
  sprints: Sprint[];
  currentSprint: Sprint | null;
  onSprintChange: (sprint: Sprint | null) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCreateIssue?: () => void;
  onNewProject?: () => void;
  onNewSprint?: () => void;
}

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'board', label: 'Board', icon: Kanban },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'backlog', label: 'Backlog', icon: List },
];

export default function Sidebar({
  projects,
  currentProject,
  onProjectChange,
  sprints,
  currentSprint,
  onSprintChange,
  currentView,
  onViewChange,
  isOpen,
  onToggle,
  onCreateIssue,
  onNewProject,
  onNewSprint,
}: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [sprintsOpen, setSprintsOpen] = useState(true);

  const sprintIcon = (status: string) => {
    if (status === 'active') return <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400" />;
    if (status === 'completed') return <CheckCircle2 className="w-3 h-3 text-slate-500" />;
    return <Clock className="w-3 h-3 text-indigo-400" />;
  };

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleProjectClick = (proj: Project) => {
    onProjectChange(proj);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleSprintClick = (sprint: Sprint | null) => {
    onSprintChange(sprint);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Dimmed backdrop on mobile when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800/80
          transition-all duration-300 ease-in-out overflow-hidden shadow-2xl lg:shadow-none
          ${isOpen ? 'translate-x-0 w-72 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
        `}
      >
        <div className="flex flex-col h-full w-72 lg:w-64 min-w-[256px]">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 tracking-tight">Jiraint</h2>
                <p className="text-[11px] text-slate-500">Task & Project Board</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Hide sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            {/* Main Navigation */}
            <div className="px-3 mb-4">
              <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                Views
              </p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150 mb-0.5
                      ${active
                        ? 'bg-indigo-500/15 text-indigo-400 shadow-inner'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : ''}`} />
                    {item.label}
                    {active && (
                      <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Projects Section */}
            <div className="px-3 mb-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <button
                  id="projects-section-toggle"
                  onClick={() => setProjectsOpen((o) => !o)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
                >
                  {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Projects ({projects.length})
                </button>
                {onNewProject && (
                  <button
                    onClick={onNewProject}
                    className="text-slate-500 hover:text-indigo-400 p-0.5 rounded transition-colors"
                    title="Add Project"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {projectsOpen && (
                <div className="space-y-0.5 animate-fade-in">
                  {projects.map((project) => {
                    const active = currentProject?.id === project.id;
                    return (
                      <button
                        key={project.id}
                        id={`project-${project.key}`}
                        onClick={() => handleProjectClick(project)}
                        className={`
                          w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm
                          transition-all duration-150
                          ${active
                            ? 'bg-slate-800 text-slate-100 font-medium'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }
                        `}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        >
                          {project.key.slice(0, 2)}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{project.name}</p>
                          <p className="text-[10px] text-slate-500">{project.key}</p>
                        </div>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                  {projects.length === 0 && (
                    <div className="px-2 py-2 text-xs text-slate-500 italic">
                      No projects yet.{' '}
                      {onNewProject && (
                        <button onClick={onNewProject} className="text-indigo-400 hover:underline">
                          Create one
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sprints Section (if sprints exist or user adds one) */}
            <div className="px-3 mb-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <button
                  id="sprints-section-toggle"
                  onClick={() => setSprintsOpen((o) => !o)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
                >
                  {sprintsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Sprints ({sprints.length})
                </button>
                {onNewSprint && (
                  <button
                    onClick={onNewSprint}
                    className="text-slate-500 hover:text-indigo-400 p-0.5 rounded transition-colors"
                    title="Add Sprint"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {sprintsOpen && (
                <div className="space-y-0.5 animate-fade-in">
                  <button
                    onClick={() => handleSprintClick(null)}
                    className={`
                      w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                      transition-all duration-150
                      ${!currentSprint ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'}
                    `}
                  >
                    <List className="w-3.5 h-3.5 text-slate-400" />
                    All issues (No sprint)
                  </button>
                  {sprints.map((sprint) => {
                    const active = currentSprint?.id === sprint.id;
                    return (
                      <button
                        key={sprint.id}
                        id={`sprint-${sprint.id.slice(0, 8)}`}
                        onClick={() => handleSprintClick(sprint)}
                        className={`
                          w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                          transition-all duration-150
                          ${active
                            ? 'bg-slate-800 text-slate-200 font-medium'
                            : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                          }
                        `}
                      >
                        {sprintIcon(sprint.status)}
                        <span className="truncate flex-1 text-left">{sprint.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action: Quick Create Issue */}
          {onCreateIssue && (
            <div className="p-3 border-t border-slate-800/60">
              <button
                id="quick-create-issue-btn"
                onClick={() => {
                  onCreateIssue();
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-indigo-600/20 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Create Issue
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
