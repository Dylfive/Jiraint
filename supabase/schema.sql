-- Jira Clone Schema for Supabase
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  key text not null unique,
  description text,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- 2. Sprints table
create table if not exists sprints (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  status text default 'planning' check (status in ('planning', 'active', 'completed')),
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 3. Issues table
create table if not exists issues (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  sprint_id uuid references sprints(id) on delete set null,
  title text not null,
  description text,
  type text default 'task' check (type in ('bug', 'task', 'story', 'epic')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  assignee text,
  story_points integer,
  issue_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Row Level Security policies
alter table projects enable row level security;
alter table sprints enable row level security;
alter table issues enable row level security;

create policy "Allow all for anon" on projects for all to anon using (true) with check (true);
create policy "Allow all for anon" on sprints for all to anon using (true) with check (true);
create policy "Allow all for anon" on issues for all to anon using (true) with check (true);

create policy "Allow all for auth" on projects for all to authenticated using (true) with check (true);
create policy "Allow all for auth" on sprints for all to authenticated using (true) with check (true);
create policy "Allow all for auth" on issues for all to authenticated using (true) with check (true);

-- 5. Default starter project (Personal Board)
insert into projects (name, key, description, color) values
  ('Personal Board', 'PB', 'My personal tasks, ideas, and projects', '#6366f1')
on conflict (key) do nothing;
