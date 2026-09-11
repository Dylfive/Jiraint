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

-- 4. Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table sprints enable row level security;
alter table issues enable row level security;

-- 5. Policies for public/anon access (demo purposes)
create policy "Allow all for anon" on projects for all to anon using (true) with check (true);
create policy "Allow all for anon" on sprints for all to anon using (true) with check (true);
create policy "Allow all for anon" on issues for all to anon using (true) with check (true);

-- Also allow authenticated users
create policy "Allow all for auth" on projects for all to authenticated using (true) with check (true);
create policy "Allow all for auth" on sprints for all to authenticated using (true) with check (true);
create policy "Allow all for auth" on issues for all to authenticated using (true) with check (true);

-- 6. Sample Seed Data
insert into projects (id, name, key, description, color) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Phoenix Platform', 'PHX', 'Core platform infrastructure and services', '#6366f1'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Mobile App', 'MOB', 'iOS and Android mobile applications', '#10b981'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Design System', 'DS', 'Component library and design tokens', '#f59e0b')
on conflict (key) do nothing;

insert into sprints (id, project_id, name, status, start_date, end_date) values
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sprint 1 - Foundation', 'active', '2026-09-01', '2026-09-14'),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sprint 2 - Auth & APIs', 'planning', '2026-09-15', '2026-09-28'),
  ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Sprint 1 - MVP', 'active', '2026-09-01', '2026-09-21')
on conflict do nothing;

insert into issues (id, project_id, sprint_id, title, description, type, priority, status, assignee, story_points, issue_order) values
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'task', 'high', 'todo', 'Alex Chen', 5, 1),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Fix authentication token refresh bug', 'Tokens are not being refreshed properly causing session expiry', 'bug', 'critical', 'in_progress', 'Sarah Kim', 3, 2),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Implement user onboarding flow', 'Create step-by-step onboarding for new users with tooltips', 'story', 'medium', 'in_progress', 'Marcus Lee', 8, 3),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Add rate limiting to API endpoints', 'Prevent abuse by implementing rate limiting middleware', 'task', 'high', 'review', 'Alex Chen', 3, 4),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Database schema optimization', 'Add indexes and optimize slow queries identified in prod', 'task', 'medium', 'done', 'Jordan Patel', 5, 5),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Write API documentation', 'Document all REST endpoints using OpenAPI 3.0 spec', 'task', 'low', 'done', 'Sarah Kim', 2, 6),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '33333333-3333-3333-3333-333333333333', 'Design home screen layout', 'Create pixel-perfect home screen per Figma designs', 'story', 'high', 'todo', 'Riley Wong', 5, 1),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '33333333-3333-3333-3333-333333333333', 'Implement push notifications', 'Set up FCM for Android and APNS for iOS notifications', 'task', 'medium', 'in_progress', 'Marcus Lee', 8, 2),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '33333333-3333-3333-3333-333333333333', 'App crashes on iOS 17.4', 'Random crashes when opening camera permission dialog', 'bug', 'critical', 'review', 'Riley Wong', 2, 3);
