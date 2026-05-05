# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Dashboard Artifact (`artifacts/dashboard`)

React + Vite weekly status dashboard. Preview path: `/`.

### Features
- **3 categories**: Documentations, Risk Assessments, Others
- **Draggable cards** within each category (drag-and-drop reorder via `@dnd-kit`)
- **Priorities P1–P5** (empty by default); P4 = purple, P5 = teal
- **Support & Issues page** — two line-item tables (Support Needed / Issues & Concerns) with tagging to any action item
- **Risk Assessments drill-down** — large pie chart with data labels, summary text box, per-item pie charts, sub-charts per item (e.g. per social media account)
- **Filter by Status** — table view of all items matching a selected status
- **Filter by Priority** — table view of all items matching a selected priority
- **Sub-charts on risk cards** — add named sub-items each with their own risk distribution

### Key files
- `src/types.ts` — shared TypeScript types
- `src/config.ts` — colour palette, status/priority styles, risk config
- `src/data.ts` — initial seed data
- `src/App.tsx` — top-level state + navigation
- `src/pages/Dashboard.tsx` — main dashboard + DnD item cards
- `src/pages/RiskDrillDown.tsx` — risk analytics view
- `src/pages/SupportIssues.tsx` — support & issues tables
- `src/pages/FilterView.tsx` — status/priority filter view

### Dependencies added
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag and drop
- `recharts` — charts
- `lucide-react` — icons
