# Graph Report - Tasko  (2026-11-13)

## Corpus Check
- 150 files · ~56,847 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 926 nodes · 1834 edges · 70 communities (42 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18fdd609`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- workspaces.service.ts
- lucide-react
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- LoginPage.tsx
- auth.service.ts
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useAuthStore
- backend-ci.yml
- scripts
- react
- compilerOptions
- WorkspaceSidebar.tsx
- backend/package.json
- backend/README.md
- useTasksQuery.ts
- @nestjs/common
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.service.ts
- vite-env.d.ts
- ProjectsService
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- workspaces.service.ts
- LandingPage.tsx
- dependencies
- AuthService
- @nestjs/cli@^12.0.0
- WorkspacesService
- index.tsx
- @nestjs/schematics@^12.0.0
- authService.ts
- @testing-library/jest-dom
- oxlint@^1.58.0
- react-router-dom
- @nestjs/config
- source-map-support@^0.5.21
- supertest
- @types/bcrypt@^6.0.0
- @types/express@^5.0.0
- @types/nodemailer@^8.0.2
- CreateProjectDto
- CreateWorkspaceDto
- vite@^8.0.0
- @vitest/coverage-v8@^4.1.2
- @types/node@^24.0.0
- Project
- workspace.ts
- LoginDto
- devDependencies
- RegisterDto
- ProjectConfigForm.tsx
- @testing-library/react
- prettier@^3.4.2
- typescript@^6.0.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `lucide-react` - 43 edges
3. `react-router-dom` - 27 edges
4. `@nestjs/common` - 26 edges
5. `useAuthStore` - 26 edges
6. `Workspace` - 23 edges
7. `User` - 21 edges
8. `WorkspaceMember` - 21 edges
9. `compilerOptions` - 20 edges
10. `AuthService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts
- `Project` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project.entity.ts → frontend/src/types/task.ts
- `WorkspaceMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace-member.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (70 total, 28 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.08
Nodes (39): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+31 more)

### Community 2 - "workspaces.service.ts"
Cohesion: 0.30
Nodes (8): WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, class-transformer, class-validator

### Community 3 - "lucide-react"
Cohesion: 0.13
Nodes (17): CreateWorkspaceData, CreateWorkspaceModalProps, ALL_VIEW_TYPES, ProjectTabBar(), ProjectLayout(), CalendarView(), GanttTask, GanttView() (+9 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.10
Nodes (27): zustand@^5.0.15, devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @types/node@^26.6.5, @types/react@^19.3.0 (+19 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "LoginPage.tsx"
Cohesion: 0.18
Nodes (17): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+9 more)

### Community 11 - "app.module.ts"
Cohesion: 0.06
Nodes (22): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, @nestjs/observe@^0.3.0, rxjs@^7.8.1, AppController, AppModule, ObserveInstrument, ObserveModule (+14 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useAuthStore"
Cohesion: 0.11
Nodes (32): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+24 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "react"
Cohesion: 0.23
Nodes (11): Footer(), Header(), Logo(), LogoProps, WorkspaceTopbarProps, MainLayout(), MainLayoutProps, VerifyEmailPage() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "WorkspaceSidebar.tsx"
Cohesion: 0.19
Nodes (8): INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebar(), WorkspaceSidebarProps, WorkspaceTopbar(), WorkspaceLayout(), Project

### Community 19 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, @nestjs/platform-express@^12.0.1, passport@^0.7.0, pg@^8.23.1, reflect-metadata@^0.2.2, description, license, name (+7 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useTasksQuery.ts"
Cohesion: 0.12
Nodes (12): @tanstack/react-query@^5.104.2, taskKeys, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, KanbanBoardView, CreateTaskPayload, taskService (+4 more)

### Community 22 - "@nestjs/common"
Cohesion: 0.22
Nodes (5): CurrentUser, JwtAuthGuard, GoogleLoginDto, ResendVerificationDto, @nestjs/common

### Community 23 - "vite.config.ts"
Cohesion: 0.22
Nodes (6): @tailwindcss/vite@^4.3.3, @vitejs/plugin-react@^6.1.1, __dirname, __dirname, @tailwindcss/vite, @vitejs/plugin-react

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

### Community 28 - "auth.service.ts"
Cohesion: 0.17
Nodes (5): AuthTokensResult, Session, User, bcrypt, @nestjs/jwt

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "ProjectsService"
Cohesion: 0.14
Nodes (3): ProjectResponseDto, ProjectsController, ProjectsService

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "workspaces.service.ts"
Cohesion: 0.16
Nodes (4): Workspace, WorkspaceMember, @nestjs/typeorm, typeorm

### Community 35 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 36 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3 (+10 more)

### Community 40 - "index.tsx"
Cohesion: 0.11
Nodes (15): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ActivityItem, MetricCard, ControlBoardView, LoginPage (+7 more)

### Community 42 - "authService.ts"
Cohesion: 0.15
Nodes (15): App(), rootElement, AppRoutes(), LoginDto, RegisterDto, AuthState, GoogleLoginPayload, LoginPayload (+7 more)

### Community 45 - "react-router-dom"
Cohesion: 0.24
Nodes (7): @react-oauth/google@^0.13.5, FormStatus, FormStatus, ApiError, ApiResponse, @react-oauth/google, react-router-dom

### Community 46 - "@nestjs/config"
Cohesion: 0.24
Nodes (5): IMailService, MAIL_SERVICE, MailModule, MailService, @nestjs/config

### Community 58 - "workspace.ts"
Cohesion: 0.25
Nodes (7): MembersPage(), MembersPage, CreateWorkspacePayload, NavItem, WorkspaceMember, WorkspaceResponse, WorkspaceRole

### Community 61 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint-tsgolint@^7.0.2001, @types/cookie-parser@^1.4.10, @types/passport-jwt@^4.0.1, @types/supertest@^7.0.0, vitest@^4.1.2 (+6 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 370 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `useTasksQuery.ts` to `Project`, `auth.service.ts`, `auth.service.ts`, `workspaces.service.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0750925436277102 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `LandingPage.tsx`, `lucide-react`, `frontend/package.json`, `dependencies`, `index.tsx`, `LoginPage.tsx`, `authService.ts`, `useAuthStore`, `react-router-dom`, `WorkspaceSidebar.tsx`, `useTasksQuery.ts`, `workspace.ts`, `ProjectConfigForm.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `CreateProjectPage.tsx`, `lucide-react`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `index.tsx`, `LoginPage.tsx`, `useAuthStore`, `react`, `WorkspaceSidebar.tsx`, `useTasksQuery.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._