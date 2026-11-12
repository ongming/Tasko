# Graph Report - Tasko  (2026-11-12)

## Corpus Check
- 135 files · ~49,160 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 863 nodes · 1633 edges · 54 communities (44 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9dd7e933`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
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
- react-router-dom
- compilerOptions
- LoginPage.tsx
- devDependencies
- backend/README.md
- useTasksQuery.ts
- lucide-react
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
- dependencies
- CreateWorkspaceDto
- vitest
- workspaces.service.ts
- index.tsx
- main.ts
- App.tsx
- @testing-library/jest-dom
- AuthService
- backend/package.json
- jwt.strategy.ts
- oxlint-tsgolint@^7.0.2001
- @nestjs/config
- @vitest/coverage-v8@^4.1.2
- @types/nodemailer@^8.0.2
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
9. `compilerOptions` - 17 edges
10. `Workspace` - 17 edges

## Surprising Connections (you probably didn't know these)
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `Workspace` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts
- `WorkspaceMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace-member.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (54 total, 10 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.11
Nodes (31): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps, MethodCard() (+23 more)

### Community 2 - "useAuthStore"
Cohesion: 0.24
Nodes (8): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, OverviewHeaderProps, MembersPage(), MembersPage, useAuthStore

### Community 3 - "workspaces.module.ts"
Cohesion: 0.14
Nodes (3): CurrentUser, WorkspaceResponseDto, WorkspacesController

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (21): API and auth, API conventions, Auth & permissions, Backend structure, Code standards, Commands, Do NOT, Do NOT (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.13
Nodes (21): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0 (+13 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+15 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "WorkspaceSidebar.tsx"
Cohesion: 0.07
Nodes (32): INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebar(), WorkspaceSidebarProps, projectKeys, api, refreshAccessToken() (+24 more)

### Community 10 - "auth.service.ts"
Cohesion: 0.11
Nodes (7): AuthModule, AuthTokensResult, EmailVerification, Session, User, @nestjs/jwt, typeorm

### Community 11 - "app.module.ts"
Cohesion: 0.14
Nodes (9): AppController, AppModule, ObserveModule, AppService, databaseConfig, jwtConfig, WorkspacesModule, @nestjs/common (+1 more)

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

### Community 16 - "react-router-dom"
Cohesion: 0.15
Nodes (13): AuthLayout(), AuthLayoutProps, Logo(), LogoProps, WorkspaceTopbar(), WorkspaceTopbarProps, FormStatus, WorkspaceLayout() (+5 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.18
Nodes (16): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, GoogleButton(), GoogleButtonProps, GoogleIcon(), PasswordInput() (+8 more)

### Community 19 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, prettier@^3.4.2, source-map-support@^0.5.21, supertest@^7.0.0 (+16 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useTasksQuery.ts"
Cohesion: 0.12
Nodes (12): @tanstack/react-query@^5.104.2, taskKeys, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, KanbanBoardView, CreateTaskPayload, taskService (+4 more)

### Community 22 - "lucide-react"
Cohesion: 0.16
Nodes (14): AiCreateModalProps, ALL_VIEW_TYPES, ProjectTabBar(), ProjectLayout(), CalendarView(), GanttTask, GanttView(), SprintView() (+6 more)

### Community 23 - "vite.config.ts"
Cohesion: 0.20
Nodes (8): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, __dirname, __dirname, @tailwindcss/vite, vite, @vitejs/plugin-react

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
Cohesion: 0.11
Nodes (6): class-validator@^0.15.1, GoogleLoginDto, LoginDto, RegisterDto, ResendVerificationDto, class-validator

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "WorkspaceTopbar.tsx"
Cohesion: 0.46
Nodes (5): Footer(), Header(), MainLayout(), MainLayoutProps, react

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 35 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3, @nestjs/observe@^0.3.0 (+19 more)

### Community 38 - "vitest"
Cohesion: 0.29
Nodes (4): @testing-library/react@^16.3.3, vitest@^5.1.0, @testing-library/react, vitest

### Community 39 - "workspaces.service.ts"
Cohesion: 0.28
Nodes (7): WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, WorkspacesService, @nestjs/typeorm

### Community 40 - "index.tsx"
Cohesion: 0.13
Nodes (12): ActivityItem, MetricCard, CalendarView, ControlBoardView, LoginPage, PageLoadingFallback(), ProjectsPage, RegisterPage (+4 more)

### Community 41 - "main.ts"
Cohesion: 0.13
Nodes (11): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap() (+3 more)

### Community 42 - "App.tsx"
Cohesion: 0.38
Nodes (4): App(), rootElement, AppRoutes(), @react-oauth/google

### Community 45 - "backend/package.json"
Cohesion: 0.11
Nodes (17): author, description, @nestjs/schematics@^12.0.0, @types/bcrypt@^6.0.0, @types/passport-jwt@^4.0.1, @types/supertest@^7.0.0, typescript@^6.0.2, typescript (+9 more)

### Community 46 - "jwt.strategy.ts"
Cohesion: 0.18
Nodes (4): JwtAuthGuard, JwtPayload, JwtStrategy, @nestjs/passport

### Community 48 - "@nestjs/config"
Cohesion: 0.31
Nodes (3): MailModule, MailService, @nestjs/config

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `./tsconfig.json`, `ADMIN`, `MEMBER`, `OWNER`, `VIEWER`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 340 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `WorkspaceSidebar.tsx`, `vite.config.ts`, `frontend/package.json`, `workspaces.service.ts`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **What connects `./tsconfig.json`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11382113821138211 - nodes in this community are weakly interconnected._
- **Why does `react` connect `WorkspaceTopbar.tsx` to `CreateProjectPage.tsx`, `useAuthStore`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `index.tsx`, `WorkspaceSidebar.tsx`, `App.tsx`, `useAuthStore`, `react-router-dom`, `LoginPage.tsx`, `useTasksQuery.ts`, `lucide-react`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `workspaces.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `useTasksQuery.ts` to `auth.service.ts`, `Workspace`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._