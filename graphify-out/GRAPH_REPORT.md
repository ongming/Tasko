# Graph Report - Tasko  (2026-11-17)

## Corpus Check
- 179 files · ~73,815 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1187 nodes · 2615 edges · 59 communities (51 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c735fbf`
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
- lucide-react
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useOverview.ts
- backend-ci.yml
- scripts
- main.ts
- compilerOptions
- app.module.ts
- Workspace
- backend/README.md
- lib/api.ts
- projects.service.ts
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- EmailVerification
- vite-env.d.ts
- CurrentUser
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- taskService.ts
- ref_vitest
- dependencies
- User
- users.service.ts
- ProjectTabBar
- authService.ts
- index.tsx
- UsersService
- react-router-dom
- AppService
- WorkspaceLayout.tsx
- CreateProjectDto
- @testing-library/jest-dom
- react-router-dom
- ProjectsService
- auth.service.spec.ts
- ProjectMember
- CreateTaskDto
- auth.controller.ts
- react-router-dom
- ProjectRole
- backend/package.json
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 66 edges
2. `lucide-react` - 49 edges
3. `@nestjs/common` - 32 edges
4. `User` - 32 edges
5. `react-router-dom` - 31 edges
6. `ProjectsService` - 30 edges
7. `useAuthStore` - 30 edges
8. `CurrentUser` - 29 edges
9. `Project` - 27 edges
10. `ProjectsController` - 25 edges

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

## Communities (59 total, 8 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (38): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid() (+30 more)

### Community 1 - "AuthService"
Cohesion: 0.06
Nodes (6): AuthController, AuthService, LoginDto, RegisterDto, ResetPasswordDto, JwtStrategy

### Community 2 - "workspaces.service.ts"
Cohesion: 0.10
Nodes (11): CreateWorkspaceDto, WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER, OWNER, VIEWER, WorkspacesController (+3 more)

### Community 3 - "Task"
Cohesion: 0.08
Nodes (3): Status, Task, WorkType

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.11
Nodes (25): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0 (+17 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+14 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "VerifyEmailPage.tsx"
Cohesion: 0.21
Nodes (10): Footer(), Header(), Logo(), LogoProps, WorkspaceTopbarProps, MainLayout(), MainLayoutProps, VerifyEmailPage() (+2 more)

### Community 10 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 11 - "lucide-react"
Cohesion: 0.22
Nodes (14): CompleteSprintModal(), CompleteSprintModalProps, StartSprintModal(), StartSprintModalProps, BacklogView(), BoardColumn, KanbanBoardView(), sprintService (+6 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.11
Nodes (31): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+23 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "main.ts"
Cohesion: 0.13
Nodes (11): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.15
Nodes (8): AppModule, ObserveModule, cloudinaryConfig, databaseConfig, jwtConfig, AuthModule, ProjectsModule, UsersModule

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "lib/api.ts"
Cohesion: 0.22
Nodes (10): PasswordInput(), PasswordInputProps, refreshAccessToken(), request(), RequestOptions, ResetPasswordPage(), getInitials(), SettingsPage() (+2 more)

### Community 22 - "projects.service.ts"
Cohesion: 0.14
Nodes (8): CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED, PLANNED

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

### Community 28 - "EmailVerification"
Cohesion: 0.11
Nodes (4): EmailVerification, PasswordResetToken, User, Column

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "taskService.ts"
Cohesion: 0.17
Nodes (11): @tanstack/react-query@^5.104.2, taskKeys, taskService, Assignee, CreateTaskPayload, MoveTaskPayload, Task, TaskItem (+3 more)

### Community 35 - "ref_vitest"
Cohesion: 0.18
Nodes (5): @testing-library/react@^16.3.3, CreateWorkspaceData, CreateWorkspaceModalProps, api, @testing-library/react

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, cloudinary@^2.11.0, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1 (+24 more)

### Community 37 - "User"
Cohesion: 0.16
Nodes (7): Project, Sprint, StatusCategory, DONE, IN_PROGRESS, TODO, typeorm

### Community 38 - "users.service.ts"
Cohesion: 0.10
Nodes (9): Session, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, SanitizedUser, UsersService, bcrypt (+1 more)

### Community 39 - "ProjectTabBar"
Cohesion: 0.16
Nodes (11): ProjectTabBar(), ProjectLayout(), CalendarView(), GanttTask, GanttView(), TimelineModule, TimelineTask, TimelineView() (+3 more)

### Community 40 - "authService.ts"
Cohesion: 0.17
Nodes (17): LoginDto, RegisterDto, userService, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse (+9 more)

### Community 41 - "index.tsx"
Cohesion: 0.10
Nodes (24): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, rootElement, MembersPage(), AppRoutes() (+16 more)

### Community 42 - "UsersService"
Cohesion: 0.09
Nodes (3): ChangePasswordDto, UpdateProfileDto, UsersController

### Community 43 - "react-router-dom"
Cohesion: 0.12
Nodes (21): ALL_VIEW_TYPES, ProjectTabBarProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, mockNavigate (+13 more)

### Community 45 - "WorkspaceLayout.tsx"
Cohesion: 0.32
Nodes (3): WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceLayout()

### Community 48 - "react-router-dom"
Cohesion: 0.17
Nodes (16): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, TextField(), TextFieldProps (+8 more)

### Community 50 - "auth.service.spec.ts"
Cohesion: 0.16
Nodes (11): AuthTokensResult, JwtPayload, IMailService, MAIL_SERVICE, MailModule, MailService, class-transformer, @nestjs/common (+3 more)

### Community 52 - "CreateTaskDto"
Cohesion: 0.23
Nodes (8): CreateTaskDto, MoveTaskDto, UpdateTaskDto, TaskPriority, HIGH, LOW, MEDIUM, URGENT

### Community 53 - "auth.controller.ts"
Cohesion: 0.10
Nodes (6): JwtAuthGuard, ForgotPasswordDto, GoogleLoginDto, ResendVerificationDto, VerifyOtpDto, class-validator

### Community 54 - "react-router-dom"
Cohesion: 0.24
Nodes (9): @react-oauth/google@^0.13.5, GoogleButton(), GoogleButtonProps, GoogleIcon(), FormStatus, useLogin(), LoginPage(), LoginPage (+1 more)

### Community 57 - "ProjectRole"
Cohesion: 0.50
Nodes (4): ProjectRole, MEMBER, OWNER, VIEWER

### Community 61 - "backend/package.json"
Cohesion: 0.05
Nodes (51): author, description, devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint@^1.58.0 (+43 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **18 isolated node(s):** `OWNER`, `MEMBER`, `VIEWER`, `PLANNED`, `ACTIVE` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 453 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `EmailVerification` to `taskService.ts`, `Task`, `User`, `users.service.ts`, `Workspace`, `ProjectMember`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `OWNER`, `MEMBER`, `VIEWER` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09941944847605225 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CreateProjectPage.tsx` to `ref_vitest`, `frontend/package.json`, `dependencies`, `ProjectTabBar`, `index.tsx`, `LandingPage.tsx`, `VerifyEmailPage.tsx`, `lucide-react`, `useOverview.ts`, `react-router-dom`, `WorkspaceLayout.tsx`, `react-router-dom`, `lib/api.ts`, `react-router-dom`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.0633879781420765 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `auth.service.spec.ts` to `workspaces.service.ts`, `dependencies`, `User`, `users.service.ts`, `AppService`, `main.ts`, `app.module.ts`, `CreateTaskDto`, `auth.controller.ts`, `backend/package.json`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `workspaces.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09743589743589744 - nodes in this community are weakly interconnected._