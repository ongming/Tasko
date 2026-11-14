# Graph Report - Tasko  (2026-11-14)

## Corpus Check
- 154 files · ~58,730 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 973 nodes · 1965 edges · 69 communities (44 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab6855a0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- workspaces.service.ts
- useTasksQuery.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- LoginPage.tsx
- User
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useAuthStore
- backend-ci.yml
- scripts
- react
- compilerOptions
- main.ts
- backend/package.json
- backend/README.md
- useOverview.ts
- @nestjs/common
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.service.ts
- vite-env.d.ts
- ProjectsController
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- workspaces.service.ts
- LandingPage.tsx
- dependencies
- Project
- AuthService
- ProjectTabBar.tsx
- index.tsx
- lucide-react
- App.tsx
- @testing-library/jest-dom
- WorkspacesController
- CreateProjectDto
- mail.module.ts
- AppService
- react-router-dom
- ProjectsService
- typescript@^6.0.2
- Status
- projects.service.ts
- WorkType
- LoginDto
- RegisterDto
- ProjectRole
- StatusCategory
- class-transformer
- @nestjs/observe
- pg@^8.23.1
- devDependencies
- @nestjs/schematics@^12.0.0
- @types/bcrypt@^6.0.0
- @types/cookie-parser@^1.4.10
- vite@^8.0.0
- date-fns@^4.4.0
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 62 edges
2. `lucide-react` - 44 edges
3. `react-router-dom` - 27 edges
4. `@nestjs/common` - 26 edges
5. `useAuthStore` - 26 edges
6. `User` - 23 edges
7. `Workspace` - 23 edges
8. `Project` - 22 edges
9. `WorkspaceMember` - 21 edges
10. `compilerOptions` - 20 edges

## Surprising Connections (you probably didn't know these)
- `ProjectMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project-member.entity.ts → frontend/src/types/task.ts
- `Project` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project.entity.ts → frontend/src/types/task.ts
- `Status` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/status.entity.ts → frontend/src/types/task.ts
- `WorkType` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/work-type.entity.ts → frontend/src/types/task.ts
- `WorkspaceMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace-member.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (69 total, 25 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (36): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps, MethodCard() (+28 more)

### Community 2 - "workspaces.service.ts"
Cohesion: 0.16
Nodes (10): CreateWorkspaceDto, WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, WorkspacesService (+2 more)

### Community 3 - "useTasksQuery.ts"
Cohesion: 0.20
Nodes (7): @tanstack/react-query@^5.104.2, taskKeys, CreateTaskPayload, taskService, Assignee, Task, @tanstack/react-query

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

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

### Community 9 - "LoginPage.tsx"
Cohesion: 0.18
Nodes (17): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+9 more)

### Community 10 - "User"
Cohesion: 0.11
Nodes (4): EmailVerification, Session, User, Column

### Community 11 - "app.module.ts"
Cohesion: 0.13
Nodes (10): supertest@^7.0.0, AppModule, ObserveInstrument, ObserveModule, databaseConfig, jwtConfig, AuthModule, ProjectsModule (+2 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useAuthStore"
Cohesion: 0.09
Nodes (31): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), MyTasksTracker(), MyTasksTrackerProps, NoWorkspaceEmptyState() (+23 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "react"
Cohesion: 0.18
Nodes (12): Footer(), Header(), Logo(), LogoProps, WorkspaceTopbar(), WorkspaceTopbarProps, MainLayout(), MainLayoutProps (+4 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "main.ts"
Cohesion: 0.23
Nodes (4): HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap()

### Community 19 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, rxjs@^7.8.1, description, oxlint-tsgolint@^7.0.2001, @types/node@^24.0.0, @types/nodemailer@^8.0.2, @types/node, license (+7 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useOverview.ts"
Cohesion: 0.07
Nodes (37): INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, EMPTY_STATS, api, refreshAccessToken() (+29 more)

### Community 22 - "@nestjs/common"
Cohesion: 0.21
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
Cohesion: 0.28
Nodes (6): AuthTokensResult, JwtPayload, bcrypt, class-validator, @nestjs/config, @nestjs/jwt

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

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
Cohesion: 0.08
Nodes (26): dependencies, bcrypt@^6.0.0, class-validator@^0.15.1, cookie-parser@^1.4.7, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/core@^12.0.1 (+18 more)

### Community 39 - "ProjectTabBar.tsx"
Cohesion: 0.16
Nodes (14): AiCreateModalProps, ALL_VIEW_TYPES, ProjectTabBar(), ProjectLayout(), CalendarView(), GanttTask, GanttView(), SprintView() (+6 more)

### Community 40 - "index.tsx"
Cohesion: 0.11
Nodes (14): ActivityItem, MetricCard, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, CalendarView, ControlBoardView, KanbanBoardView (+6 more)

### Community 41 - "lucide-react"
Cohesion: 0.20
Nodes (10): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ExecutiveStatsRibbonProps, OverviewHeaderProps, MembersPage(), MembersPage (+2 more)

### Community 42 - "App.tsx"
Cohesion: 0.38
Nodes (4): App(), rootElement, AppRoutes(), @react-oauth/google

### Community 46 - "mail.module.ts"
Cohesion: 0.26
Nodes (4): IMailService, MAIL_SERVICE, MailModule, MailService

### Community 48 - "react-router-dom"
Cohesion: 0.27
Nodes (6): FormStatus, FormStatus, authService, ApiError, ApiResponse, react-router-dom

### Community 56 - "ProjectRole"
Cohesion: 0.50
Nodes (4): ProjectRole, MEMBER, OWNER, VIEWER

### Community 57 - "StatusCategory"
Cohesion: 0.50
Nodes (4): StatusCategory, DONE, IN_PROGRESS, TODO

### Community 61 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, prettier@^3.4.2, source-map-support@^0.5.21, @types/express@^5.0.0 (+14 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **11 isolated node(s):** `OWNER`, `MEMBER`, `VIEWER`, `TODO`, `IN_PROGRESS` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `User` to `workspaces.service.ts`, `useTasksQuery.ts`, `Project`, `index.tsx`, `Status`, `WorkType`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `OWNER`, `MEMBER`, `VIEWER` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10040816326530612 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `ProjectTabBar.tsx`, `LoginPage.tsx`, `App.tsx`, `lucide-react`, `index.tsx`, `useAuthStore`, `react-router-dom`, `useOverview.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `CreateProjectPage.tsx`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `ProjectTabBar.tsx`, `LoginPage.tsx`, `lucide-react`, `index.tsx`, `useAuthStore`, `react`, `useOverview.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._