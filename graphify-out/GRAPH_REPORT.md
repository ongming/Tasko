# Graph Report - Tasko  (2026-11-12)

## Corpus Check
- 129 files · ~47,919 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 847 nodes · 1577 edges · 48 communities (44 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `15018e5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- index.tsx
- workspaces.module.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- auth.service.ts
- dependencies
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useAuthStore
- backend-ci.yml
- scripts
- TimelineView.tsx
- compilerOptions
- LoginPage.tsx
- backend/package.json
- backend/README.md
- authService.ts
- auth.service.ts
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
- main.ts
- CreateWorkspaceDto
- authService.ts
- workspaces.service.ts
- react-router-dom
- app.e2e-spec.ts
- App.tsx
- useRegister.ts
- WorkspaceTopbar.tsx
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

## Communities (48 total, 4 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.08
Nodes (43): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+35 more)

### Community 1 - "AuthService"
Cohesion: 0.08
Nodes (5): AuthController, AuthService, LoginDto, RegisterDto, JwtStrategy

### Community 2 - "index.tsx"
Cohesion: 0.14
Nodes (17): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ProjectLayout(), MembersPage(), AppRoutes() (+9 more)

### Community 3 - "workspaces.module.ts"
Cohesion: 0.15
Nodes (3): WorkspaceResponseDto, WorkspacesController, WorkspacesService

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (21): API and auth, API conventions, Auth & permissions, Backend structure, Code standards, Commands, Do NOT, Do NOT (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.12
Nodes (22): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.30, tailwindcss@^4.3.3, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2 (+14 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 9 - "auth.service.ts"
Cohesion: 0.11
Nodes (3): EmailVerification, Session, User

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (28): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3 (+20 more)

### Community 11 - "app.module.ts"
Cohesion: 0.15
Nodes (7): AppController, ObserveModule, AppService, databaseConfig, jwtConfig, AuthModule, WorkspacesModule

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useAuthStore"
Cohesion: 0.08
Nodes (42): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+34 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "TimelineView.tsx"
Cohesion: 0.50
Nodes (3): TimelineModule, TimelineTask, TimelineView

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (19): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), GoogleButton(), GoogleButtonProps, GoogleIcon() (+11 more)

### Community 19 - "backend/package.json"
Cohesion: 0.06
Nodes (44): author, description, devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, oxlint@^1.58.0, oxlint-tsgolint@^7.0.2001 (+36 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "authService.ts"
Cohesion: 0.09
Nodes (16): @tanstack/react-query@^5.104.2, projectKeys, taskKeys, api, INITIAL_COLUMNS, KanbanBoardView(), BacklogView, KanbanBoardView (+8 more)

### Community 22 - "auth.service.ts"
Cohesion: 0.22
Nodes (8): AuthTokensResult, JwtPayload, MailModule, MailService, @nestjs/common, @nestjs/config, @nestjs/jwt, @nestjs/passport

### Community 23 - "vite.config.ts"
Cohesion: 0.25
Nodes (4): @tailwindcss/vite@^4.3.3, __dirname, @tailwindcss/vite, @vitejs/plugin-react

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
Cohesion: 0.17
Nodes (5): CurrentUser, JwtAuthGuard, GoogleLoginDto, ResendVerificationDto, class-validator

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "WorkspaceTopbar.tsx"
Cohesion: 0.26
Nodes (8): Footer(), Header(), Logo(), LogoProps, MainLayout(), MainLayoutProps, VerifyEmailPage(), VerifyEmailPage

### Community 31 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 35 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 36 - "main.ts"
Cohesion: 0.13
Nodes (11): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap() (+3 more)

### Community 38 - "authService.ts"
Cohesion: 0.23
Nodes (12): LoginDto, RegisterDto, AuthState, GoogleLoginPayload, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse (+4 more)

### Community 39 - "workspaces.service.ts"
Cohesion: 0.25
Nodes (7): WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, @nestjs/typeorm, typeorm

### Community 40 - "react-router-dom"
Cohesion: 0.15
Nodes (7): AuthLayoutProps, OverviewHeaderProps, ActivityItem, MetricCard, ControlBoardView, ProjectsPage, react-router-dom

### Community 41 - "app.e2e-spec.ts"
Cohesion: 0.29
Nodes (5): @nestjs/testing@^12.0.1, supertest@^7.0.0, AppModule, @nestjs/testing, supertest

### Community 42 - "App.tsx"
Cohesion: 0.29
Nodes (5): react-dom@^19.2.8, @react-oauth/google@^0.13.5, rootElement, react-dom, @react-oauth/google

### Community 43 - "useRegister.ts"
Cohesion: 0.25
Nodes (7): FormStatus, refreshAccessToken(), request(), RequestOptions, authService, ApiError, ApiResponse

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 339 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `authService.ts` to `auth.service.ts`, `Workspace`?**
  _High betweenness centrality (0.291) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08248587570621468 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CreateProjectPage.tsx` to `index.tsx`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `react-router-dom`, `App.tsx`, `useRegister.ts`, `WorkspaceTopbar.tsx`, `useAuthStore`, `TimelineView.tsx`, `LoginPage.tsx`, `authService.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.07801418439716312 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `CreateProjectPage.tsx` to `index.tsx`, `LandingPage.tsx`, `frontend/package.json`, `dependencies`, `react-router-dom`, `WorkspaceTopbar.tsx`, `useAuthStore`, `TimelineView.tsx`, `LoginPage.tsx`, `authService.ts`, `WorkspaceTopbar.tsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13666666666666666 - nodes in this community are weakly interconnected._