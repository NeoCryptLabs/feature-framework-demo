# Feature Context

## Feature
Create a fullstack SaaS analytics dashboard called "PulseBoard" to track online business performance. Features: authentication with roles (admin/viewer), dashboard with stat cards and charts, analytics page, settings (admin only). All data from a real database with seed data.

## Slug
pulseboard-saas-dashboard

## Definition

### Stack & Infrastructure
- **Framework:** Next.js + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (email + password)
- **Deployment:** Docker / self-hosted
- **Docker:** Docker Compose (dev + prod configs)

### Frontend
- **UI:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Styling:** Utility-first with component library

### Auth & Roles
- **Method:** Email + password via NextAuth.js credentials provider
- **Roles:** Simple role field on user table (admin / viewer)
- **Admin:** Full access — dashboard, analytics, settings, user management
- **Viewer:** Dashboard and analytics only, no settings access

### Data Model
- **Domain:** Web analytics (page views, visitors, sessions, bounce rate, traffic sources, top pages)
- **Seed data:** 30 days of realistic demo data with trends, 2 users (admin + viewer)

### Inferences
- JWT strategy via NextAuth with httpOnly cookies (default secure config)
- Prisma Migrate for schema migrations
- shadcn/ui components: Card, Table, Dialog, Form, Button, etc.
- Next.js App Router (latest convention)
- Server Components + Server Actions where appropriate
- Middleware for route protection by role

## Detected Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6
- **Auth:** NextAuth.js v4 (credentials provider)
- **CSS:** Tailwind CSS v4 + shadcn/ui
- **CSS color format:** oklch (shadcn/ui default)
- **Charts:** Recharts
- **Package manager:** npm
- **Docker:** Multi-stage Dockerfile + Compose

## Architecture

### Project Structure
```
with-feature/
├── docker-compose.yml              # Dev: app + postgres
├── docker-compose.prod.yml         # Prod: optimized build
├── Dockerfile                      # Multi-stage (deps → build → run)
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json                 # shadcn/ui config
├── prisma/
│   ├── schema.prisma               # User, Visitor, Session, PageView
│   └── seed.ts                     # 30 days of demo data + 2 users
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, fonts)
│   │   ├── page.tsx                # Redirect → /dashboard
│   │   ├── globals.css             # Tailwind + shadcn theme tokens
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Centered card layout
│   │   │   └── login/
│   │   │       └── page.tsx        # Login page
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Sidebar + header shell
│   │       ├── dashboard/
│   │       │   └── page.tsx        # Main dashboard
│   │       ├── analytics/
│   │       │   └── page.tsx        # Detailed analytics
│   │       └── settings/
│   │           └── page.tsx        # Admin-only settings
│   ├── components/
│   │   ├── ui/                     # shadcn components (generated)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx         # Sidebar nav with role-based items
│   │   │   └── header.tsx          # Top bar with user menu
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx       # Single metric card
│   │   │   ├── overview-chart.tsx  # Visitors/day line chart
│   │   │   ├── traffic-sources.tsx # Referrer pie chart
│   │   │   └── top-pages.tsx       # Top pages table
│   │   ├── analytics/
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── page-views-chart.tsx
│   │   │   ├── devices-chart.tsx
│   │   │   └── countries-table.tsx
│   │   ├── settings/
│   │   │   ├── profile-form.tsx
│   │   │   └── users-table.tsx
│   │   └── auth/
│   │       └── login-form.tsx
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config + helpers
│   │   └── utils.ts                # cn() helper
│   ├── actions/
│   │   ├── auth.ts                 # Login action
│   │   ├── dashboard.ts            # Dashboard stats + chart data
│   │   ├── analytics.ts            # Analytics with date filtering
│   │   └── settings.ts             # Profile update + user management
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   └── middleware.ts               # Auth guard + role-based routing
```

### Database Schema
```prisma
enum Role { ADMIN  VIEWER }

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(VIEWER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Visitor {
  id        String    @id @default(cuid())
  country   String
  browser   String
  device    String    // desktop | mobile | tablet
  os        String
  sessions  Session[]
  createdAt DateTime  @default(now())
}

model Session {
  id        String     @id @default(cuid())
  visitorId String
  visitor   Visitor    @relation(fields: [visitorId], references: [id])
  duration  Int        // seconds
  pageViews PageView[]
  startedAt DateTime
  endedAt   DateTime?
}

model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String?  // traffic source
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id])
  createdAt DateTime @default(now())
}
```

### Data Flow
- **Dashboard stats:** Server Component → server action → Prisma aggregate queries
- **Charts:** Server action returns aggregated arrays → Recharts client components
- **Auth:** NextAuth credentials provider → bcrypt verify → JWT session
- **Role guard:** middleware.ts checks session.user.role, redirects if unauthorized
- **Settings:** Server actions with role check → Prisma mutations

### Naming Conventions
- Files: kebab-case (stat-card.tsx)
- Components: PascalCase (StatCard)
- Functions: camelCase (getDashboardStats)
- Server actions: camelCase, "use server" directive
- Types: PascalCase with descriptive names (DashboardStats, AnalyticsData)

## Implementation Plan

### Phase 1: Foundation (backend-dev) — Sequential, blocks everything
**Task 1: Project scaffolding**
- Initialize Next.js with TypeScript in with-feature/
- Install all dependencies (prisma, next-auth, bcryptjs, recharts, date-fns, etc.)
- Configure next.config.ts
- Create .gitignore, .env.example
- Files: package.json, tsconfig.json, next.config.ts, .gitignore, .env.example

**Task 2: Tailwind + shadcn/ui setup**
- Configure Tailwind CSS
- Initialize shadcn/ui with oklch theme
- Add shadcn components: button, card, input, label, table, avatar, dropdown-menu, select, badge, separator, form, tabs, popover, calendar
- Create utils.ts with cn() helper
- Files: tailwind.config.ts, components.json, src/lib/utils.ts, src/app/globals.css, src/components/ui/*

**Task 3: Database + Prisma**
- Create prisma/schema.prisma with all models
- Create prisma/seed.ts with 30 days of realistic web analytics data
  - 2 users: admin@pulseboard.io (admin) / viewer@pulseboard.io (viewer), both password "password"
  - ~500 visitors with varied countries, browsers, devices
  - ~1500 sessions with realistic durations
  - ~4000 page views across /home, /pricing, /docs, /blog, /about, etc.
  - Traffic sources: direct, google, twitter, github, linkedin, newsletter
  - Realistic trends (weekday > weekend, growth over time)
- Create src/lib/db.ts (Prisma client singleton)
- Files: prisma/schema.prisma, prisma/seed.ts, src/lib/db.ts

**Task 4: Authentication**
- Configure NextAuth with credentials provider
- bcrypt password hashing/verification
- JWT session with role included
- Auth helper (getServerSession wrapper)
- Login server action
- Middleware for route protection (/dashboard/*, /analytics/*, /settings/*)
- Settings routes restricted to ADMIN role
- Files: src/lib/auth.ts, src/actions/auth.ts, src/middleware.ts, src/app/api/auth/[...nextauth]/route.ts

**Task 5: Docker**
- Multi-stage Dockerfile (deps → build → runner)
- docker-compose.yml for dev (app + postgres, volumes, hot reload)
- docker-compose.prod.yml for prod (optimized, no hot reload)
- .dockerignore
- Files: Dockerfile, docker-compose.yml, docker-compose.prod.yml, .dockerignore

### Phase 2: UI Shell (frontend-dev) — After Phase 1
**Task 6: Root layout + auth pages**
- Root layout with session provider, fonts (Inter/Geist)
- Root page.tsx (redirect to /dashboard)
- Auth layout (centered card)
- Login page with login form component
- Types file
- Files: src/app/layout.tsx, src/app/page.tsx, src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/components/auth/login-form.tsx, src/types/index.ts

**Task 7: Dashboard layout shell**
- Sidebar component with role-aware navigation
- Header component with user avatar + dropdown (logout)
- Dashboard layout wrapping sidebar + header + content area
- Files: src/app/(dashboard)/layout.tsx, src/components/layout/sidebar.tsx, src/components/layout/header.tsx

### Phase 3: Feature Pages (frontend-dev + backend-dev) — After Phase 2
**Task 8: Dashboard page + data (frontend-dev)**
- Dashboard server actions (getDashboardStats, getVisitorsOverTime, getTrafficSources, getTopPages)
- StatCard component
- OverviewChart (Recharts Line chart — visitors per day)
- TrafficSources (Recharts Pie chart — referrer breakdown)
- TopPages (Table — path, views, unique visitors)
- Dashboard page assembling all components
- Files: src/actions/dashboard.ts, src/app/(dashboard)/dashboard/page.tsx, src/components/dashboard/*

**Task 9: Analytics page + data (frontend-dev)**
- Analytics server actions (getAnalyticsData with date range filter)
- DateRangePicker component
- PageViewsChart (Recharts Area chart)
- DevicesChart (Recharts Pie — desktop/mobile/tablet)
- CountriesTable (Table — country, visitors, percentage)
- Analytics page with date filtering
- Files: src/actions/analytics.ts, src/app/(dashboard)/analytics/page.tsx, src/components/analytics/*

**Task 10: Settings page + data (backend-dev)**
- Settings server actions (updateProfile, getUsers, updateUserRole)
- ProfileForm component
- UsersTable component (admin: list users, change roles)
- Settings page with tabs (Profile, Users)
- Admin-only access enforced at page level
- Files: src/actions/settings.ts, src/app/(dashboard)/settings/page.tsx, src/components/settings/*

## Scope Guard

### Brief → Plan Coverage
| Requirement | Tasks |
|---|---|
| Authentication with roles | Tasks 3, 4, 6 |
| Dashboard with stat cards and charts | Task 8 |
| Analytics page | Task 9 |
| Settings (admin only) | Task 10 |
| Real database with seed data | Task 3 |
| Fullstack on with-feature/ | Tasks 1, 2 |
| Docker deployment | Task 5 |

### Plan → Brief Traceability
All tasks map to explicit requirements. No extraneous tasks.

### UI → Data Sources
| UI Element | Data Source |
|---|---|
| Stat cards (visitors, page views, bounce rate, avg duration) | getDashboardStats() → Prisma aggregates |
| Visitors line chart | getVisitorsOverTime() → GROUP BY date |
| Traffic sources pie chart | getTrafficSources() → GROUP BY referrer |
| Top pages table | getTopPages() → GROUP BY path |
| Analytics charts (page views, devices, countries) | getAnalyticsData(dateRange) → filtered aggregates |
| Settings profile form | updateProfile() → User update |
| User management table | getUsers() / updateUserRole() → User queries |
| Login form | NextAuth credentials → User lookup + bcrypt |

## State
- **Current step:** 4
- **Status:** completed
- **Completed on:** 2026-02-23
- **Started on:** 2026-02-23
- **Mode:** new_feature
- **Auto-commit:** false

## Step History

### Step 0: Definition QCM - COMPLETED
**Summary:** Gathered all architectural decisions via 3 rounds of questions. User chose recommended options across the board.
**Decisions:** Next.js+TS, PostgreSQL, Prisma, NextAuth.js, Tailwind+shadcn/ui, Recharts, Docker Compose, simple roles, web analytics data model, 30-day realistic seed data.

### Step 1: Analysis + Planning - COMPLETED
**Summary:** Designed complete architecture for greenfield PulseBoard project. Defined project structure, database schema, data flow, 10 implementation tasks across 3 phases. Passed scope guard.
**Key decisions:** App Router, Server Actions (not API routes), JWT sessions, middleware-based role guard, 3-phase implementation (foundation → shell → features).

### Step 2: Implementation - COMPLETED
**Summary:** All 10 implementation tasks completed via Agent Teams. 3 specialists: foundation-dev (Tasks 1-7), frontend-dev (Tasks 8-9), backend-dev (Task 10).
**Files created:** 40+ files across project scaffolding, database, auth, Docker, UI components, pages, and server actions.
**Team:** foundation-dev built all infrastructure, then frontend-dev and backend-dev worked in parallel on feature pages.

### Step 3: Review + Tests - COMPLETED
**Summary:** 4 parallel review agents + build test. Build initially failed (TS error in devices-chart.tsx). Found 20+ issues across all severity levels.

#### Code Review
- Issues found: 20+ (Critical: 3, Important: 6, Medium: 11, Low: 5)
- Auto-fixed: All critical and important issues

#### Fixes Applied
**Critical:**
1. Fixed double-wrapped `oklch(var(--chart-X))` → `var(--chart-X)` in all 4 chart components (devices-chart, overview-chart, traffic-sources, page-views-chart)
2. Added auth checks (getAuth) to all 5 unprotected server actions in dashboard.ts and analytics.ts
3. Fixed build error: devices-chart.tsx label `count` → `value` using PieLabelRenderProps

**High:**
4. Added `router.refresh()` + `setIsLoading(false)` in login-form.tsx after successful login
5. Deleted dead code: src/actions/auth.ts (loginAction never imported)
6. Added `url = env("DATABASE_URL")` to prisma/schema.prisma datasource
7. Fixed font variable: `--font-geist-sans` → `--font-inter` in layout.tsx + globals.css
8. Fixed Recharts labelFormatter type annotations (removed explicit `string` type on ReactNode param)
9. Fixed traffic-sources label to use `props.name`/`props.percent` instead of custom fields

**Medium:**
10. Added `invertColor` prop to StatCard + applied on Bounce Rate card (lower = better)
11. Parallelized 6 sequential DB queries in getDashboardStats with Promise.all
12. Added target user existence check in updateUserRole (settings.ts)
13. Added date validation in getAnalyticsData (analytics.ts)
14. Moved prisma from dependencies to devDependencies
15. Used env vars in docker-compose.prod.yml DATABASE_URL

#### Build Status
- `npm run build`: PASS (after fixes)
- Re-review: PASS (no remaining critical/important issues)

#### Fix-Verify Loop
- Iterations: 3 (initial build fail → fix TS errors → fix more TS type issues → pass)
- All builds passing: YES

#### Confidence: HIGH

### Step 4: Final Validation - COMPLETED
**Summary:** Build passes. All critical/important issues fixed. Feature complete.
**Build:** `npm run build` - SUCCESS
**Files:** 60+ files created (40+ custom, 13 shadcn/ui components, config files)
