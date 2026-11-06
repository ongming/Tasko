# Graph Report - Tasko  (2026-11-06)

## Corpus Check
- 127 files · ~46,381 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 787 nodes · 1509 edges · 62 communities (43 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1bfd1edb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- index.tsx
- useOverview.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- auth.service.ts
- dependencies
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- overview/index.ts
- backend/package.json
- scripts
- lucide-react
- compilerOptions
- LoginPage.tsx
- devDependencies
- backend/README.md
- useTasksQuery.ts
- @nestjs/config
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.controller.ts
- vite-env.d.ts
- WorkspaceTopbar.tsx
- scripts
- frontend/tsconfig.json
- vitest
- Workspace
- LandingPage.tsx
- react
- @nestjs/schematics@^12.0.0
- overview.ts
- oxlint-tsgolint@^7.0.2001
- authService.ts
- supertest
- App.tsx
- AuthService
- react-router-dom
- useAuthStore
- lib/api.ts
- @types/express@^5.0.0
- RegisterDto
- typescript@^6.0.2
- ActivityTimelineStream.tsx
- JwtStrategy
- react-hook-form@^7.90.0
- @nestjs/cli@^12.0.0
- @types/cookie-parser@^1.4.10
- bcrypt
- class-transformer@^0.5.1
- reflect-metadata@^0.2.2
- @types/nodemailer@^8.0.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `lucide-react` - 43 edges
3. `useAuthStore` - 26 edges
4. `react-router-dom` - 25 edges
5. `@nestjs/common` - 20 edges
6. `compilerOptions` - 20 edges
7. `AuthService` - 18 edges
8. `User` - 18 edges
9. `compilerOptions` - 17 edges
10. `WorkspaceMember` - 16 edges

## Surprising Connections (you probably didn't know these)
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts
- `WorkspaceMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace-member.entity.ts → frontend/src/types/task.ts
- `Workspace` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (62 total, 19 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.14
Nodes (25): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps, MethodCard() (+17 more)

### Community 2 - "index.tsx"
Cohesion: 0.13
Nodes (13): ProtectedRoute(), ProtectedRouteProps, CalendarView, LandingPage, LoginPage, OverviewPage, PageLoadingFallback(), ProjectsPage (+5 more)

### Community 3 - "useOverview.ts"
Cohesion: 0.15
Nodes (15): INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, EMPTY_STATS, api, CreateProjectPayload (+7 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (21): API and auth, API conventions, Auth & permissions, Backend structure, Code standards, Commands, Do NOT, Do NOT (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.13
Nodes (21): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.30, tailwindcss@^4.3.3, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2 (+13 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+11 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 9 - "auth.service.ts"
Cohesion: 0.12
Nodes (6): AuthTokensResult, EmailVerification, Session, User, @nestjs/jwt, typeorm

### Community 10 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, class-validator@^0.15.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/core@^12.0.1, @nestjs/jwt@^12.0.3, @nestjs/observe@^0.3.0 (+16 more)

### Community 11 - "app.module.ts"
Cohesion: 0.08
Nodes (15): AppController, AppModule, ObserveInstrument, ObserveModule, AppService, HttpExceptionFilter, ApiResponse, TransformInterceptor (+7 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "overview/index.ts"
Cohesion: 0.22
Nodes (15): ActiveProjectsGrid(), ActivityTimelineStream(), ExecutiveStatsRibbon(), MyTasksTracker(), NoWorkspaceEmptyState(), NoWorkspaceEmptyStateProps, OverviewHeader(), QuickCreateTaskModal() (+7 more)

### Community 14 - "backend/package.json"
Cohesion: 0.14
Nodes (13): author, cookie-parser@^1.4.7, passport-jwt@^4.0.1, description, @types/bcrypt@^6.0.0, license, name, private (+5 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "lucide-react"
Cohesion: 0.18
Nodes (13): ALL_VIEW_TYPES, ProjectTabBar(), CalendarView(), GanttTask, GanttView(), SprintView(), TimelineModule, TimelineTask (+5 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.18
Nodes (17): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+9 more)

### Community 19 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, prettier@^3.4.2, source-map-support@^0.5.21, @types/node@^24.0.0, @types/passport-jwt@^4.0.1 (+12 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useTasksQuery.ts"
Cohesion: 0.13
Nodes (10): taskKeys, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, KanbanBoardView, CreateTaskPayload, taskService, Assignee (+2 more)

### Community 22 - "@nestjs/config"
Cohesion: 0.31
Nodes (3): MailModule, MailService, @nestjs/config

### Community 23 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): @tailwindcss/vite@^4.3.3, @vitejs/plugin-react@^6.1.1, __dirname, @tailwindcss/vite, @vitejs/plugin-react

### Community 24 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 25 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 26 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 27 - "utils.ts"
Cohesion: 0.33
Nodes (4): clsx@^2.1.1, tailwind-merge@^3.7.0, clsx, tailwind-merge

### Community 28 - "auth.controller.ts"
Cohesion: 0.13
Nodes (7): CurrentUser, JwtAuthGuard, GoogleLoginDto, LoginDto, ResendVerificationDto, class-validator, @nestjs/common

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "WorkspaceTopbar.tsx"
Cohesion: 0.19
Nodes (8): Logo(), LogoProps, WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceTopbarProps, WorkspaceLayout(), VerifyEmailPage(), authService

### Community 31 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 34 - "Workspace"
Cohesion: 0.06
Nodes (11): CreateWorkspaceDto, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER, OWNER (+3 more)

### Community 35 - "LandingPage.tsx"
Cohesion: 0.31
Nodes (7): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon()

### Community 36 - "react"
Cohesion: 0.21
Nodes (8): AiCreateModalProps, AVAILABLE_COLORS, ProjectConfigFormProps, Footer(), Header(), MainLayout(), MainLayoutProps, react

### Community 38 - "overview.ts"
Cohesion: 0.20
Nodes (12): ActiveProjectsGridProps, MyTasksTrackerProps, QuickCreateTaskModalProps, TeamPresenceWidgetProps, WeeklyVelocityChartProps, DailyVelocity, MyTaskItem, NewTaskPayload (+4 more)

### Community 40 - "authService.ts"
Cohesion: 0.23
Nodes (12): LoginDto, RegisterDto, AuthState, GoogleLoginPayload, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse (+4 more)

### Community 42 - "App.tsx"
Cohesion: 0.24
Nodes (7): react-dom@^19.2.8, @tanstack/react-query@^5.104.2, App(), rootElement, AppRoutes(), react-dom, @tanstack/react-query

### Community 44 - "react-router-dom"
Cohesion: 0.20
Nodes (7): FormStatus, FormStatus, ActivityItem, MetricCard, ControlBoardView, @react-oauth/google, react-router-dom

### Community 45 - "useAuthStore"
Cohesion: 0.20
Nodes (10): GuestRoute(), GuestRouteProps, ExecutiveStatsRibbonProps, OverviewHeaderProps, ProjectLayout(), MembersPage(), MembersPage, useAuthStore (+2 more)

### Community 46 - "lib/api.ts"
Cohesion: 0.36
Nodes (5): refreshAccessToken(), request(), RequestOptions, ApiError, ApiResponse

### Community 51 - "JwtStrategy"
Cohesion: 0.25
Nodes (3): JwtPayload, JwtStrategy, @nestjs/passport

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 306 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `useTasksQuery.ts` to `auth.service.ts`, `Workspace`?**
  _High betweenness centrality (0.333) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14260249554367202 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `index.tsx`, `LandingPage.tsx`, `useOverview.ts`, `frontend/package.json`, `overview.ts`, `dependencies`, `App.tsx`, `react-router-dom`, `useAuthStore`, `overview/index.ts`, `lucide-react`, `LoginPage.tsx`, `ActivityTimelineStream.tsx`, `useTasksQuery.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `CreateProjectPage.tsx`, `index.tsx`, `useOverview.ts`, `react`, `frontend/package.json`, `overview.ts`, `dependencies`, `LandingPage.tsx`, `react-router-dom`, `useAuthStore`, `overview/index.ts`, `LoginPage.tsx`, `ActivityTimelineStream.tsx`, `useTasksQuery.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `useOverview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._