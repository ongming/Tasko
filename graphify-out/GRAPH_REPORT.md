# Graph Report - Tasko  (2026-11-12)

## Corpus Check
- 135 files · ~49,160 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 865 nodes · 1633 edges · 64 communities (41 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0166518e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- useAuthStore
- workspaces.module.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- WorkspaceSidebar.tsx
- auth.service.ts
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useAuthStore
- backend-ci.yml
- scripts
- lib/api.ts
- compilerOptions
- LoginPage.tsx
- devDependencies
- backend/README.md
- useTasksQuery.ts
- authService.ts
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
- frontend-ci.yml
- Workspace
- LandingPage.tsx
- backend/package.json
- CreateWorkspaceDto
- workspaces.service.ts
- index.tsx
- supertest
- App.tsx
- @testing-library/jest-dom
- WorkspaceTopbar.tsx
- @nestjs/schematics@^12.0.0
- oxlint@^1.58.0
- oxlint-tsgolint@^7.0.2001
- prettier@^3.4.2
- source-map-support@^0.5.21
- @types/cookie-parser@^1.4.10
- passport@^0.7.0
- @types/node@^24.0.0
- @types/nodemailer@^8.0.2
- @types/supertest@^7.0.0
- typescript@^6.0.2
- @nestjs/mau@^0.2.6
- date-fns@^4.4.0
- @types/bcrypt@^6.0.0
- @types/passport-jwt@^4.0.1
- vitest@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `lucide-react` - 43 edges
3. `useAuthStore` - 26 edges
4. `react-router-dom` - 25 edges
5. `@nestjs/common` - 21 edges
6. `compilerOptions` - 20 edges
7. `AuthService` - 18 edges
8. `User` - 18 edges
9. `WorkspaceMember` - 17 edges
10. `Workspace` - 17 edges

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

## Communities (64 total, 23 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.08
Nodes (45): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+37 more)

### Community 1 - "AuthService"
Cohesion: 0.09
Nodes (4): AuthController, AuthService, LoginDto, RegisterDto

### Community 2 - "useAuthStore"
Cohesion: 0.20
Nodes (12): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ProjectLayout(), MembersPage(), MembersPage, AuthState (+4 more)

### Community 3 - "workspaces.module.ts"
Cohesion: 0.16
Nodes (4): CurrentUser, JwtAuthGuard, WorkspacesController, WorkspacesService

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (21): API and auth, API conventions, Auth & permissions, Backend structure, Code standards, Commands, Do NOT, Do NOT (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.10
Nodes (27): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @testing-library/react@^16.3.3, @types/node@^26.6.5, @types/react@^19.3.0 (+19 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8 (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "WorkspaceSidebar.tsx"
Cohesion: 0.12
Nodes (16): INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, api, ProjectsPage, CreateProjectPayload (+8 more)

### Community 10 - "auth.service.ts"
Cohesion: 0.06
Nodes (27): dependencies, bcrypt@^6.0.0, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3, @nestjs/passport@^12.0.0, @nestjs/typeorm@^12.0.2 (+19 more)

### Community 11 - "app.module.ts"
Cohesion: 0.06
Nodes (21): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, @nestjs/observe@^0.3.0, rxjs@^7.8.1, AppController, AppModule, ObserveInstrument, ObserveModule (+13 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useAuthStore"
Cohesion: 0.10
Nodes (33): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+25 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "lib/api.ts"
Cohesion: 0.22
Nodes (9): FormStatus, FormStatus, refreshAccessToken(), request(), RequestOptions, authService, ApiError, ApiResponse (+1 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.18
Nodes (17): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+9 more)

### Community 19 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, @nestjs/cli@^12.0.0, @nestjs/testing@^12.0.1, @types/express@^5.0.0, vite@^8.0.0, @vitest/coverage-v8@^4.1.2, vite, @nestjs/cli (+2 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useTasksQuery.ts"
Cohesion: 0.12
Nodes (12): @tanstack/react-query@^5.104.2, taskKeys, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, KanbanBoardView, CreateTaskPayload, taskService (+4 more)

### Community 22 - "authService.ts"
Cohesion: 0.27
Nodes (10): LoginDto, RegisterDto, GoogleLoginPayload, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse, ResendVerificationPayload (+2 more)

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

### Community 28 - "auth.controller.ts"
Cohesion: 0.20
Nodes (4): class-validator@^0.15.1, GoogleLoginDto, ResendVerificationDto, class-validator

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "WorkspaceTopbar.tsx"
Cohesion: 0.29
Nodes (7): Footer(), Header(), Logo(), LogoProps, MainLayout(), MainLayoutProps, VerifyEmailPage()

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 35 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 36 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, class-transformer@^0.5.1, @nestjs/platform-express@^12.0.1, pg@^8.23.1, reflect-metadata@^0.2.2, description, license, name (+7 more)

### Community 39 - "workspaces.service.ts"
Cohesion: 0.29
Nodes (9): WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, @nestjs/common, @nestjs/testing (+1 more)

### Community 40 - "index.tsx"
Cohesion: 0.14
Nodes (12): ActivityItem, MetricCard, ControlBoardView, CreateProjectPage, LoginPage, OverviewPage, PageLoadingFallback(), RegisterPage (+4 more)

### Community 42 - "App.tsx"
Cohesion: 0.47
Nodes (3): App(), rootElement, AppRoutes()

### Community 44 - "WorkspaceTopbar.tsx"
Cohesion: 0.27
Nodes (4): WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceTopbarProps, WorkspaceLayout()

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 341 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `useTasksQuery.ts` to `auth.service.ts`, `Workspace`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07834101382488479 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CreateProjectPage.tsx` to `useAuthStore`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `index.tsx`, `WorkspaceSidebar.tsx`, `App.tsx`, `WorkspaceTopbar.tsx`, `useAuthStore`, `lib/api.ts`, `LoginPage.tsx`, `useTasksQuery.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.09080841638981174 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `CreateProjectPage.tsx` to `useAuthStore`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `index.tsx`, `WorkspaceSidebar.tsx`, `WorkspaceTopbar.tsx`, `useAuthStore`, `LoginPage.tsx`, `useTasksQuery.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._