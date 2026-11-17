# Graph Report - Tasko  (2026-11-17)

## Corpus Check
- 179 files · ~73,505 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1185 nodes · 2603 edges · 60 communities (45 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1143c863`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- workspaces.service.ts
- Task
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- VerifyEmailPage.tsx
- LandingPage.tsx
- multer
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useOverview.ts
- backend-ci.yml
- scripts
- nodemailer
- compilerOptions
- app.module.ts
- streamifier
- backend/README.md
- index.tsx
- projects.controller.ts
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- User
- vite-env.d.ts
- ProjectsService
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- prettier@^3.4.2
- source-map-support@^0.5.21
- dependencies
- projects.service.ts
- users.service.ts
- ProjectTabBar.tsx
- authService.ts
- lucide-react
- UsersService
- KanbanBoardView.tsx
- @types/passport-jwt@^4.0.1
- WorkspaceSidebar.tsx
- @types/supertest@^7.0.0
- @testing-library/jest-dom
- react-router-dom
- MailService
- frontend/package.json
- auth.controller.ts
- backend/package.json
- Session
- devDependencies
- Sprint
- oxlint-tsgolint@^7.0.2001
- @vitest/coverage-v8@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 66 edges
2. `lucide-react` - 49 edges
3. `@nestjs/common` - 32 edges
4. `User` - 32 edges
5. `react-router-dom` - 31 edges
6. `useAuthStore` - 30 edges
7. `ProjectsService` - 29 edges
8. `CurrentUser` - 28 edges
9. `Project` - 27 edges
10. `ProjectsController` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `ProjectMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project-member.entity.ts → frontend/src/types/task.ts
- `Project` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project.entity.ts → frontend/src/types/task.ts
- `Sprint` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/sprint.entity.ts → frontend/src/types/task.ts
- `Status` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/status.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (60 total, 15 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (36): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+28 more)

### Community 1 - "AuthService"
Cohesion: 0.06
Nodes (8): AuthController, AuthService, GoogleLoginDto, LoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, JwtStrategy

### Community 2 - "workspaces.service.ts"
Cohesion: 0.06
Nodes (11): CreateWorkspaceDto, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER, OWNER (+3 more)

### Community 3 - "Task"
Cohesion: 0.08
Nodes (3): Status, Task, WorkType

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, tailwindcss@^4.3.3, @testing-library/react@^16.3.3, @types/node@^26.6.5, @types/react-dom@^19.3.0, typescript@^7.0.2 (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "VerifyEmailPage.tsx"
Cohesion: 0.26
Nodes (8): Footer(), Header(), Logo(), LogoProps, MainLayout(), MainLayoutProps, VerifyEmailPage(), VerifyEmailPage

### Community 10 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.10
Nodes (32): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+24 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.07
Nodes (16): AppController, AppModule, ObserveInstrument, ObserveModule, AppService, HttpExceptionFilter, ApiResponse, TransformInterceptor (+8 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "index.tsx"
Cohesion: 0.14
Nodes (14): ProjectsPage(), getInitials(), SettingsPage(), ForgotPasswordPage, LoginPage, MembersPage, PageLoadingFallback(), ProjectsPage (+6 more)

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

### Community 28 - "User"
Cohesion: 0.09
Nodes (12): AuthTokensResult, EmailVerification, PasswordResetToken, User, JwtPayload, IMailService, MAIL_SERVICE, MailModule (+4 more)

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "ProjectsService"
Cohesion: 0.06
Nodes (16): CurrentUser, ProjectResponseDto, CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, CreateTaskDto, MoveTaskDto (+8 more)

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (28): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, cloudinary@^2.11.0, cookie-parser@^1.4.7, google-auth-library@^11.3.1, @nestjs/common@^12.0.1 (+20 more)

### Community 37 - "projects.service.ts"
Cohesion: 0.12
Nodes (15): Project, ProjectMember, ProjectRole, MEMBER, OWNER, VIEWER, SprintStatus, ACTIVE (+7 more)

### Community 38 - "users.service.ts"
Cohesion: 0.17
Nodes (9): JwtAuthGuard, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, SanitizedUser, bcrypt, @nestjs/common (+1 more)

### Community 39 - "ProjectTabBar.tsx"
Cohesion: 0.10
Nodes (22): AiCreateModalProps, ALL_VIEW_TYPES, ProjectTabBar(), ProjectTabBarProps, ProjectLayout(), CalendarView(), GanttTask, GanttView() (+14 more)

### Community 40 - "authService.ts"
Cohesion: 0.08
Nodes (29): projectKeys, api, refreshAccessToken(), request(), RequestOptions, mockNavigate, LoginDto, RegisterDto (+21 more)

### Community 41 - "lucide-react"
Cohesion: 0.14
Nodes (16): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, OverviewHeaderProps, WorkspaceTopbarProps, FormStatus (+8 more)

### Community 42 - "UsersService"
Cohesion: 0.08
Nodes (4): ChangePasswordDto, UpdateProfileDto, UsersController, UsersService

### Community 43 - "KanbanBoardView.tsx"
Cohesion: 0.11
Nodes (24): CompleteSprintModal(), CompleteSprintModalProps, StartSprintModal(), StartSprintModalProps, taskKeys, BacklogView(), BoardColumn, KanbanBoardView() (+16 more)

### Community 45 - "WorkspaceSidebar.tsx"
Cohesion: 0.14
Nodes (11): CreateWorkspaceData, CreateWorkspaceModal(), CreateWorkspaceModalProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebar(), WorkspaceSidebarProps (+3 more)

### Community 48 - "react-router-dom"
Cohesion: 0.14
Nodes (25): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+17 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.15
Nodes (12): react-hook-form@^7.90.0, zod@^4.6.7, postcss@^8.5.30, @types/react@^19.3.0, name, private, type, version (+4 more)

### Community 53 - "auth.controller.ts"
Cohesion: 0.18
Nodes (4): ForgotPasswordDto, VerifyOtpDto, class-transformer, class-validator

### Community 55 - "backend/package.json"
Cohesion: 0.11
Nodes (17): author, passport@^0.7.0, passport-jwt@^4.0.1, description, supertest@^7.0.0, @types/node@^24.0.0, vite@^8.0.0, @types/node (+9 more)

### Community 61 - "devDependencies"
Cohesion: 0.08
Nodes (26): devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint@^1.58.0, @types/bcrypt@^6.0.0, @types/cookie-parser@^1.4.10 (+18 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **18 isolated node(s):** `OWNER`, `MEMBER`, `VIEWER`, `PLANNED`, `ACTIVE` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 453 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `User` to `workspaces.service.ts`, `Task`, `projects.service.ts`, `KanbanBoardView.tsx`, `Session`, `Sprint`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `OWNER`, `MEMBER`, `VIEWER` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09959183673469388 - nodes in this community are weakly interconnected._
- **Why does `react` connect `lucide-react` to `CreateProjectPage.tsx`, `ProjectTabBar.tsx`, `dependencies`, `VerifyEmailPage.tsx`, `LandingPage.tsx`, `KanbanBoardView.tsx`, `useOverview.ts`, `WorkspaceSidebar.tsx`, `react-router-dom`, `frontend/package.json`, `index.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.055178652193577565 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `users.service.ts` to `workspaces.service.ts`, `dependencies`, `projects.service.ts`, `app.module.ts`, `auth.controller.ts`, `backend/package.json`, `User`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `workspaces.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06428571428571428 - nodes in this community are weakly interconnected._