# Graph Report - Tasko  (2026-11-12)

## Corpus Check
- 138 files · ~52,573 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 868 nodes · 1670 edges · 48 communities (40 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5c8742e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- CreateWorkspaceDto
- react-router-dom
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- authService.ts
- auth.service.ts
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useAuthStore
- backend-ci.yml
- scripts
- VerifyEmailPage.tsx
- compilerOptions
- LoginPage.tsx
- backend/package.json
- backend/README.md
- useTasksQuery.ts
- WorkspacesController
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- @nestjs/common
- vite-env.d.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- workspaces.service.ts
- LandingPage.tsx
- dependencies
- WorkspaceLayout.tsx
- index.tsx
- main.ts
- App.tsx
- @testing-library/jest-dom
- auth.service.ts
- @types/node@^24.0.0
- vitest@^4.1.2
- date-fns@^4.4.0
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `lucide-react` - 43 edges
3. `react-router-dom` - 26 edges
4. `useAuthStore` - 26 edges
5. `@nestjs/common` - 22 edges
6. `compilerOptions` - 20 edges
7. `AuthService` - 19 edges
8. `User` - 19 edges
9. `WorkspaceMember` - 17 edges
10. `Workspace` - 17 edges

## Surprising Connections (you probably didn't know these)
- `WorkspaceMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace-member.entity.ts → frontend/src/types/task.ts
- `Workspace` --references--> `Column`  [EXTRACTED]
  backend/src/modules/workspaces/entities/workspace.entity.ts → frontend/src/types/task.ts
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (48 total, 8 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.08
Nodes (46): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+38 more)

### Community 1 - "AuthController"
Cohesion: 0.10
Nodes (4): AuthController, AuthService, ResendVerificationDto, JwtStrategy

### Community 3 - "react-router-dom"
Cohesion: 0.28
Nodes (5): AuthLayoutProps, FormStatus, FormStatus, authService, react-router-dom

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

### Community 9 - "authService.ts"
Cohesion: 0.06
Nodes (34): CreateWorkspaceData, CreateWorkspaceModal(), CreateWorkspaceModalProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys (+26 more)

### Community 10 - "auth.service.ts"
Cohesion: 0.11
Nodes (4): EmailVerification, Session, User, Column

### Community 11 - "app.module.ts"
Cohesion: 0.12
Nodes (10): @nestjs/testing@^12.0.1, AppController, AppModule, ObserveModule, AppService, databaseConfig, jwtConfig, AuthModule (+2 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useAuthStore"
Cohesion: 0.08
Nodes (39): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps (+31 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "VerifyEmailPage.tsx"
Cohesion: 0.26
Nodes (8): Footer(), Header(), Logo(), LogoProps, MainLayout(), MainLayoutProps, VerifyEmailPage(), VerifyEmailPage

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.20
Nodes (16): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), GoogleButton(), GoogleButtonProps, GoogleIcon() (+8 more)

### Community 19 - "backend/package.json"
Cohesion: 0.07
Nodes (42): author, description, devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, oxlint@^1.58.0, oxlint-tsgolint@^7.0.2001 (+34 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "useTasksQuery.ts"
Cohesion: 0.16
Nodes (8): @tanstack/react-query@^5.104.2, taskKeys, BacklogView, CreateTaskPayload, taskService, Assignee, Task, @tanstack/react-query

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

### Community 28 - "@nestjs/common"
Cohesion: 0.24
Nodes (5): CurrentUser, JwtAuthGuard, GoogleLoginDto, class-validator, @nestjs/common

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "workspaces.service.ts"
Cohesion: 0.11
Nodes (10): WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER (+2 more)

### Community 35 - "LandingPage.tsx"
Cohesion: 0.31
Nodes (7): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon()

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3 (+19 more)

### Community 37 - "WorkspaceLayout.tsx"
Cohesion: 0.27
Nodes (4): WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceTopbarProps, WorkspaceLayout()

### Community 40 - "index.tsx"
Cohesion: 0.10
Nodes (16): ActivityItem, MetricCard, INITIAL_COLUMNS, KanbanBoardView(), ControlBoardView, CreateProjectPage, KanbanBoardView, LandingPage (+8 more)

### Community 41 - "main.ts"
Cohesion: 0.13
Nodes (11): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap() (+3 more)

### Community 42 - "App.tsx"
Cohesion: 0.38
Nodes (4): App(), rootElement, AppRoutes(), @react-oauth/google

### Community 46 - "auth.service.ts"
Cohesion: 0.12
Nodes (11): AuthTokensResult, LoginDto, RegisterDto, JwtPayload, MailModule, MailService, bcrypt, @nestjs/config (+3 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 341 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `auth.service.ts` to `index.tsx`, `workspaces.service.ts`, `useTasksQuery.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0763888888888889 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CreateProjectPage.tsx` to `react-router-dom`, `LandingPage.tsx`, `frontend/package.json`, `WorkspaceLayout.tsx`, `dependencies`, `index.tsx`, `authService.ts`, `App.tsx`, `useAuthStore`, `VerifyEmailPage.tsx`, `LoginPage.tsx`, `useTasksQuery.ts`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Should `AuthController` be split into smaller, more focused modules?**
  _Cohesion score 0.09634146341463415 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `CreateProjectPage.tsx`, `LandingPage.tsx`, `frontend/package.json`, `WorkspaceLayout.tsx`, `dependencies`, `index.tsx`, `authService.ts`, `useAuthStore`, `VerifyEmailPage.tsx`, `LoginPage.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._