# Jiraint 🚀

A modern, fast, production-ready Jira replacement built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Configured for static export and deployment to **GitHub Pages**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)

---

## ✨ Features

- 📋 **Interactive Kanban Board**: Drag-and-drop issues between columns (*To Do*, *In Progress*, *In Review*, *Done*) with fluid animations powered by `@hello-pangea/dnd`.
- 📊 **Executive Sprint Dashboard**: Real-time project metrics, completion percentage, workload by assignee, priority breakdown, and recent activity feed.
- 📑 **Sprint Backlog View**: Grouped by sprints and backlog, complete with quick issue creation and status badges.
- 🔍 **Real-time Search & Filters**: Search across issue titles and descriptions, filter by priority (Critical, High, Medium, Low), type (Bug, Task, Story, Epic), and assignee.
- 📝 **Full Issue Lifecycle**: Create, view, edit details (title, description, status, priority, type, story points, assignee), and delete issues with instant optimistic UI updates.
- 🌓 **Dark-Mode-First UI**: Sleek, modern slate aesthetic built with Tailwind CSS v4 and Lucide React icons.
- 🚀 **GitHub Pages Ready**: Static export configuration (`output: 'export'`) and automated GitHub Actions CI/CD deployment workflow.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19, App Router)
- **Styling**: Tailwind CSS v4 + Custom Modern Dark Design System
- **Icons**: Lucide React
- **Drag & Drop**: `@hello-pangea/dnd`
- **Backend / Database**: Supabase (PostgreSQL with Row Level Security)
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Dylfive/Jiraint.git
cd Jiraint
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase Database
1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run the script.
4. This will create the `projects`, `sprints`, and `issues` tables, configure RLS policies, and seed sample data.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to GitHub Pages

The repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml`.

To enable GitHub Pages:
1. Go to your repository settings on GitHub: **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Pushes to `main` will automatically build and deploy the app to:
   `https://<username>.github.io/Jiraint/`

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages CI/CD workflow
├── app/
│   ├── globals.css         # Custom dark theme styles & scrollbars
│   ├── layout.tsx          # Root layout and metadata
│   └── page.tsx            # Main application controller & state
├── components/
│   ├── BacklogView.tsx     # Sprint & backlog issue list
│   ├── CreateIssueModal.tsx# New issue modal dialog
│   ├── DashboardView.tsx   # Visual project dashboard & metrics
│   ├── FilterBar.tsx       # Search and filter controls
│   ├── IssueCard.tsx       # Draggable Kanban card
│   ├── IssueModal.tsx      # Issue detail viewer and editor
│   ├── KanbanBoard.tsx     # Drag-and-drop Kanban columns
│   └── Sidebar.tsx         # Navigation & project/sprint switcher
├── lib/
│   ├── supabase.ts         # Supabase client instance
│   └── types.ts            # Data models and constants
├── public/
│   └── .nojekyll           # Bypass Jekyll processing on GitHub Pages
└── supabase/
    └── schema.sql          # PostgreSQL schema and seed data
```

---

## 📄 License

MIT
