# Graph Report - Tasko  (2026-10-30)

## Corpus Check
- 124 files · ~44,444 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 776 nodes · 1481 edges · 53 communities (35 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97d52599`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- index.tsx
- useAuthStore
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- workspaces.service.ts
- dependencies
- app.module.ts
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- EmailVerification
- backend/package.json
- scripts
- lucide-react
- compilerOptions
- LoginPage.tsx
- devDependencies
- backend/README.md
- authService.ts
- auth.module.ts
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.controller.ts
- vite-env.d.ts
- frontend/package.json
- scripts
- frontend/tsconfig.json
- vitest
- Workspace
- ProjectConfigForm.tsx
- @nestjs/cli@^12.0.0
- @nestjs/schematics@^12.0.0
- Session
- oxlint-tsgolint@^7.0.2001
- source-map-support@^0.5.21
- supertest
- @types/cookie-parser@^1.4.10
- oxlint@^1.58.0
- @nestjs/mau@^0.2.6
- lucide-react
- prettier@^3.4.2
- @types/express@^5.0.0
- @types/supertest@^7.0.0
- typescript@^6.0.2
- @vitest/coverage-v8@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 58 edges
2. `lucide-react` - 42 edges
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

## Communities (53 total, 18 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.20
Nodes (17): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps, MethodCard() (+9 more)

### Community 1 - "AuthService"
Cohesion: 0.11
Nodes (3): AuthController, AuthService, JwtStrategy

### Community 2 - "index.tsx"
Cohesion: 0.11
Nodes (15): ProtectedRoute(), ProtectedRouteProps, ActivityItem, MetricCard, ControlBoardView, CreateProjectPage, LoginPage, OverviewPage (+7 more)

### Community 3 - "useAuthStore"
Cohesion: 0.06
Nodes (53): react-dom@^19.2.8, ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker() (+45 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (21): API and auth, API conventions, Auth & permissions, Backend structure, Code standards, Commands, Do NOT, Do NOT (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.30, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2, vite@^8.3.0 (+7 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, date-fns@^4.4.0, @dnd-kit/sortable@^10.0.0, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8, react-hook-form@^7.90.0, @react-oauth/google@^0.13.5 (+9 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 9 - "workspaces.service.ts"
Cohesion: 0.33
Nodes (3): AuthTokensResult, User, typeorm

### Community 10 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcrypt@^6.0.0, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/jwt@^12.0.3, @nestjs/passport@^12.0.0, @nestjs/typeorm@^12.0.2 (+8 more)

### Community 11 - "app.module.ts"
Cohesion: 0.06
Nodes (23): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, @nestjs/observe@^0.3.0, rxjs@^7.8.1, AppController, AppModule, ObserveInstrument, ObserveModule (+15 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 14 - "backend/package.json"
Cohesion: 0.11
Nodes (17): author, class-transformer@^0.5.1, @nestjs/platform-express@^12.0.1, passport@^0.7.0, pg@^8.23.1, reflect-metadata@^0.2.2, description, license (+9 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "lucide-react"
Cohesion: 0.14
Nodes (18): TextFieldProps, AiCreateModalProps, ALL_VIEW_TYPES, ProjectTabBar(), ProjectLayout(), CalendarView(), GanttTask, GanttView() (+10 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "LoginPage.tsx"
Cohesion: 0.22
Nodes (15): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), GoogleButton(), GoogleButtonProps, GoogleIcon() (+7 more)

### Community 19 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, @nestjs/testing@^12.0.1, @types/bcrypt@^6.0.0, @types/node@^24.0.0, @types/nodemailer@^8.0.2, @types/passport-jwt@^4.0.1, vite@^8.0.0, @types/node (+4 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "authService.ts"
Cohesion: 0.09
Nodes (15): @tanstack/react-query@^5.104.2, App(), taskKeys, rootElement, INITIAL_COLUMNS, KanbanBoardView(), AppRoutes(), BacklogView (+7 more)

### Community 22 - "auth.module.ts"
Cohesion: 0.23
Nodes (7): CurrentUser, JwtAuthGuard, JwtPayload, MailModule, @nestjs/common, @nestjs/config, @nestjs/passport

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
Cohesion: 0.11
Nodes (6): class-validator@^0.15.1, GoogleLoginDto, LoginDto, RegisterDto, ResendVerificationDto, class-validator

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): @dnd-kit/core@^6.3.1, @dnd-kit/utilities@^3.2.2, tailwindcss@^4.3.3, name, private, type, version, @dnd-kit/core (+2 more)

### Community 31 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 34 - "Workspace"
Cohesion: 0.06
Nodes (11): CreateWorkspaceDto, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER, OWNER (+3 more)

### Community 45 - "lucide-react"
Cohesion: 0.05
Nodes (44): AuthLayoutProps, GuestRoute(), GuestRouteProps, DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), Footer(), Header() (+36 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **5 isolated node(s):** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 302 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `authService.ts` to `workspaces.service.ts`, `Workspace`, `EmailVerification`, `Session`?**
  _High betweenness centrality (0.333) - this node is a cross-community bridge._
- **What connects `OWNER`, `ADMIN`, `MEMBER` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.10810810810810811 - nodes in this community are weakly interconnected._
- **Why does `react` connect `lucide-react` to `CreateProjectPage.tsx`, `index.tsx`, `ProjectConfigForm.tsx`, `useAuthStore`, `dependencies`, `lucide-react`, `LoginPage.tsx`, `authService.ts`, `frontend/package.json`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1067193675889328 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `CreateProjectPage.tsx`, `index.tsx`, `ProjectConfigForm.tsx`, `useAuthStore`, `dependencies`, `lucide-react`, `LoginPage.tsx`, `authService.ts`, `frontend/package.json`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `useAuthStore` be split into smaller, more focused modules?**
  _Cohesion score 0.05719298245614035 - nodes in this community are weakly interconnected._