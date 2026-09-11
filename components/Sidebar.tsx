'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Kanban, List, ChevronDown, ChevronRight,
  Plus, Zap, Circle, CheckCircle2, Clock,
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
}

const TEAM_MEMBERS = [
  { name: 'Alex Chen', initials: 'AC', color: '#6366f1' },
  { name: 'Sarah Kim', initials: 'SK', color: '#10b981' },
  { name: 'Marcus Lee', initials: 'ML', color: '#f59e0b' },
  { name: 'Jordan Patel', initials: 'JP', color: '#ef4444' },
  { name: 'Riley Wong', initials: 'RW', color: '#8b5cf6' },
];

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'board', label: 'Board', icon: Kanban },
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
}: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [sprintsOpen, setSprintsOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(false);

  const sprintIcon = (status: string) => {
    if (status === 'active') return <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400" />;
    if (status === 'completed') return <CheckCircle2 className="w-3 h-3 text-slate-500" />;
    return <Clock className="w-3 h-3 text-indigo-400" />;
  };

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      <aside
        className={`
          flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800/80
          transition-all duration-300 ease-in-out overflow-hidden z-30
          ${isOpen ? 'w-64' : 'w-0'}
        `}
      >
        <div className="flex flex-col h-full min-w-[256px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">Jiraint</h2>
              <p className="text-xs text-slate-500">Project Management</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            {/* Navigation */}
            <div className="px-3 mb-4">
              <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">
                Navigation
              </p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
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

            {/* Projects */}
            <div className="px-3 mb-4">
              <button
                id="projects-section-toggle"
                onClick={() => setProjectsOpen((o) => !o)}
                className="w-full flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1 hover:text-slate-400 transition-colors"
              >
                {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Projects
              </button>

              {projectsOpen && (
                <div className="space-y-0.5 animate-fade-in">
                  {projects.map((project) => {
                    const active = currentProject?.id === project.id;
                    return (
                      <button
                        key={project.id}
                        id={`project-${project.key}`}
                        onClick={() => onProjectChange(project)}
                        className={`
                          w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm
                          transition-all duration-150
                          ${active
                            ? 'bg-slate-800 text-slate-100'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }
                        `}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.key.slice(0, 2)}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-medium truncate">{project.name}</p>
                          <p className="text-[10px] text-slate-600">{project.key}</p>
                        </div>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                  {projects.length === 0 && (
                    <p className="px-2 py-2 text-xs text-slate-600 italic">No projects found</p>
                  )}
                </div>
              )}
            </div>

            {/* Sprints */}
            {sprints.length > 0 && (
              <div className="px-3 mb-4">
                <button
                  id="sprints-section-toggle"
                  onClick={() => setSprintsOpen((o) => !o)}
                  className="w-full flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1 hover:text-slate-400 transition-colors"
                >
                  {sprintsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Sprints
                </button>

                {sprintsOpen && (
                  <div className="space-y-0.5 animate-fade-in">
                    <button
                      onClick={() => onSprintChange(null)}
                      className={`
                        w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                        transition-all duration-150
                        ${!currentSprint ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'}
                      `}
                    >
                      <List className="w-3 h-3" />
                      All issues
                    </button>
                    {sprints.map((sprint) => {
                      const active = currentSprint?.id === sprint.id;
                      return (
                        <button
                          key={sprint.id}
                          id={`sprint-${sprint.id.slice(0, 8)}`}
                          onClick={() => onSprintChange(sprint)}
                          className={`
                            w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                            transition-all duration-150
                            ${active
                              ? 'bg-slate-800 text-slate-200'
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
            )}

            {/* Team */}
            <div className="px-3">
              <button
                id="team-section-toggle"
                onClick={() => setTeamOpen((o) => !o)}
                className="w-full flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1 hover:text-slate-400 transition-colors"
              >
                {teamOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Team
              </button>

              {teamOpen && (
                <div className="space-y-0.5 animate-fade-in">
                  {TEAM_MEMBERS.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </div>
                      <span className="text-xs text-slate-400">{member.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: quick add */}
          <div className="p-3 border-t border-slate-800/60">
            <button
              id="quick-create-issue-btn"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-400 rounded-lg text-xs font-medium transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Issue
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
