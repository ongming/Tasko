# Graph Report - Tasko  (2026-11-19)

## Corpus Check
- 220 files · ~112,285 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1487 nodes · 3784 edges · 88 communities (56 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba525375`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- workspaces.service.ts
- projects.service.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- VerifyEmailPage.tsx
- LandingPage.tsx
- Role
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useOverview.ts
- backend-ci.yml
- scripts
- main.ts
- compilerOptions
- app.module.ts
- AuthService
- backend/README.md
- SprintsService
- projects.controller.ts
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.service.spec.ts
- vite-env.d.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- BacklogView.tsx
- tasks.controller.ts
- dependencies
- Project
- backend/package.json
- TaskDetailDrawer.tsx
- authService.ts
- Session
- UsersService
- useOverview.ts
- Task
- ControlBoardView.tsx
- CreateProjectDto
- projectService.ts
- react-router-dom
- ProjectsService
- MailService
- ProjectMember
- useTasksQuery.ts
- auth.controller.ts
- index.tsx
- AppService
- RequirePermission
- AddProjectMemberDto
- frontend/package.json
- CreateWorkspaceModal.tsx
- @nestjs/common
- devDependencies
- lib/api.ts
- transform.interceptor.ts
- @nestjs/mau@^0.2.6
- LoginDto
- ResetPasswordDto
- Workspace
- useProjectsQuery.ts
- @nestjs/cli@^12.0.0
- oxlint@^1.58.0
- prettier@^3.4.2
- source-map-support@^0.5.21
- supertest
- @types/bcrypt@^6.0.0
- @types/cookie-parser@^1.4.10
- @types/multer@^2.3.0
- @types/nodemailer@^8.0.2
- @types/passport-jwt@^4.0.1
- @types/streamifier@^0.1.2
- @types/supertest@^7.0.0
- vite@^8.0.0
- @vitest/coverage-v8@^4.1.2
- AuthModule
- UsersModule
- WorkspacesModule
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 71 edges
2. `lucide-react` - 54 edges
3. `RequirePermission()` - 48 edges
4. `@nestjs/common` - 46 edges
5. `Project` - 44 edges
6. `User` - 40 edges
7. `typeorm` - 38 edges
8. `ProjectsService` - 38 edges
9. `useAuthStore` - 38 edges
10. `react-router-dom` - 37 edges

## Surprising Connections (you probably didn't know these)
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `PasswordResetToken` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/password-reset-token.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts
- `ProjectMember` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/project-member.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (88 total, 32 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.09
Nodes (37): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+29 more)

### Community 2 - "workspaces.service.ts"
Cohesion: 0.08
Nodes (5): CreateWorkspaceDto, AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspacesController, WorkspacesService

### Community 3 - "projects.service.ts"
Cohesion: 0.11
Nodes (18): User, CustomFieldType, DATE, NUMBER, SELECT, TEXT, ProjectMethodology, KANBAN (+10 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.30, @testing-library/jest-dom@^7.0.1, @testing-library/react@^16.3.3, @types/node@^26.6.5, @types/react@^19.3.0, @types/react-dom@^19.3.0 (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, date-fns@^4.4.0, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8 (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "VerifyEmailPage.tsx"
Cohesion: 0.20
Nodes (11): AiCreateModalProps, Footer(), Header(), Logo(), LogoProps, WorkspaceTopbarProps, MainLayout(), MainLayoutProps (+3 more)

### Community 10 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 11 - "Role"
Cohesion: 0.10
Nodes (11): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+3 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.11
Nodes (30): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+22 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "main.ts"
Cohesion: 0.20
Nodes (6): cookie-parser@^1.4.7, AppModule, ObserveInstrument, HttpExceptionFilter, bootstrap(), cookie-parser

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.13
Nodes (10): @nestjs/observe@^0.3.0, ObserveModule, cloudinaryConfig, databaseConfig, jwtConfig, ProjectsModule, RbacModule, SprintsModule (+2 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "SprintsService"
Cohesion: 0.10
Nodes (5): CompleteSprintDto, StartSprintDto, UpdateSprintDto, SprintsController, SprintsService

### Community 22 - "projects.controller.ts"
Cohesion: 0.23
Nodes (13): CreateCustomFieldDto, CreateStatusDto, CreateWorkflowDto, CreateWorkTypeDto, DeleteStatusDto, DeleteWorkTypeDto, TransitionItemDto, UpdateCustomFieldDto (+5 more)

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

### Community 28 - "auth.service.spec.ts"
Cohesion: 0.15
Nodes (10): AuthTokensResult, EmailVerification, JwtPayload, IMailService, MAIL_SERVICE, MailModule, bcrypt, @nestjs/config (+2 more)

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "BacklogView.tsx"
Cohesion: 0.17
Nodes (19): CompleteSprintModal(), CreateTaskModal(), StartSprintModal(), TaskDetailDrawer(), TaskFilterBar(), TaskFilterBarProps, BacklogView(), KanbanBoardView() (+11 more)

### Community 35 - "tasks.controller.ts"
Cohesion: 0.12
Nodes (11): CreateTaskDto, MoveTaskDto, TaskCustomFieldValueInput, TaskQueryDto, UpdateTaskDto, TaskPriority, HIGH, LOW (+3 more)

### Community 36 - "dependencies"
Cohesion: 0.11
Nodes (17): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/core@^12.0.1, @nestjs/jwt@^12.0.3 (+9 more)

### Community 37 - "Project"
Cohesion: 0.07
Nodes (12): Project, StatusCategory, DONE, IN_PROGRESS, TODO, CreateSprintDto, Sprint, SprintStatus (+4 more)

### Community 38 - "backend/package.json"
Cohesion: 0.11
Nodes (17): author, multer@^2.5.0, @nestjs/platform-express@^12.0.1, passport@^0.7.0, pg@^8.23.1, reflect-metadata@^0.2.2, description, license (+9 more)

### Community 39 - "TaskDetailDrawer.tsx"
Cohesion: 0.24
Nodes (8): TaskDetailDrawerProps, ControlBoardView, ListView, projectService, sprintService, taskService, TaskPriority, @testing-library/react

### Community 40 - "authService.ts"
Cohesion: 0.15
Nodes (19): LoginDto, RegisterDto, userService, AuthState, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload (+11 more)

### Community 42 - "UsersService"
Cohesion: 0.05
Nodes (12): cloudinary@^2.11.0, streamifier@^0.1.1, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, ChangePasswordDto, UpdateProfileDto (+4 more)

### Community 43 - "useOverview.ts"
Cohesion: 0.18
Nodes (11): ALL_VIEW_TYPES, ProjectTabBarProps, ProjectsPage(), ProjectsPage, workspaceService, CreateWorkspacePayload, NavItem, Project (+3 more)

### Community 44 - "Task"
Cohesion: 0.07
Nodes (5): CustomField, WorkType, Workflow, CustomFieldValue, Column

### Community 45 - "ControlBoardView.tsx"
Cohesion: 0.16
Nodes (9): CompleteSprintModalProps, StartSprintModalProps, sprintKeys, TimelineView, CompleteSprintPayload, CreateSprintPayload, Sprint, SprintStatus (+1 more)

### Community 47 - "projectService.ts"
Cohesion: 0.18
Nodes (18): ProjectSettingsPage(), SettingsTab, mockNavigate, ProjectSettingsPage, CreateCustomFieldPayload, CreateStatusPayload, CreateWorkTypePayload, CustomField (+10 more)

### Community 48 - "react-router-dom"
Cohesion: 0.12
Nodes (31): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+23 more)

### Community 52 - "useTasksQuery.ts"
Cohesion: 0.13
Nodes (11): CreateTaskModalProps, taskKeys, BoardColumn, CalendarView, Assignee, CreateTaskPayload, MoveTaskPayload, Task (+3 more)

### Community 53 - "auth.controller.ts"
Cohesion: 0.10
Nodes (7): class-validator@^0.15.1, ForgotPasswordDto, GoogleLoginDto, RegisterDto, ResendVerificationDto, VerifyOtpDto, class-validator

### Community 54 - "index.tsx"
Cohesion: 0.11
Nodes (25): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ProjectMembersModal(), ProjectMembersModalProps, ProjectTabBar() (+17 more)

### Community 56 - "RequirePermission"
Cohesion: 0.11
Nodes (4): CurrentUser, RequirePermission(), ProjectsController, TasksController

### Community 57 - "AddProjectMemberDto"
Cohesion: 0.39
Nodes (3): AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto

### Community 58 - "frontend/package.json"
Cohesion: 0.15
Nodes (12): @dnd-kit/core@^6.3.1, jsdom@^31.0.0, tailwindcss@^4.3.3, typescript@^7.0.2, typescript, name, private, type (+4 more)

### Community 59 - "CreateWorkspaceModal.tsx"
Cohesion: 0.11
Nodes (13): CreateWorkspaceData, CreateWorkspaceModal(), CreateWorkspaceModalProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebar(), WorkspaceSidebarProps (+5 more)

### Community 60 - "@nestjs/common"
Cohesion: 0.15
Nodes (12): PERMISSIONS_KEY, JwtAuthGuard, RbacPermissionGuard, WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER, OWNER (+4 more)

### Community 61 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint-tsgolint@^7.0.2001, @types/express@^5.0.0, @types/node@^24.0.0, typescript@^6.0.2, vitest@^4.1.2 (+6 more)

### Community 62 - "lib/api.ts"
Cohesion: 0.39
Nodes (4): api, refreshAccessToken(), request(), RequestOptions

### Community 63 - "transform.interceptor.ts"
Cohesion: 0.29
Nodes (4): rxjs@^7.8.1, ApiResponse, TransformInterceptor, rxjs

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 556 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `Task` to `projects.service.ts`, `Workspace`, `Project`, `Session`, `Role`, `ProjectMember`, `useTasksQuery.ts`, `auth.service.spec.ts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `projects.service.ts`, `dependencies`, `Project`, `backend/package.json`, `UsersService`, `Role`, `main.ts`, `app.module.ts`, `auth.controller.ts`, `projects.controller.ts`, `AppService`, `auth.service.spec.ts`, `transform.interceptor.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `workspaces.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08250355618776671 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `CreateProjectPage.tsx`, `BacklogView.tsx`, `dependencies`, `TaskDetailDrawer.tsx`, `VerifyEmailPage.tsx`, `LandingPage.tsx`, `useOverview.ts`, `useOverview.ts`, `ControlBoardView.tsx`, `projectService.ts`, `useTasksQuery.ts`, `index.tsx`, `frontend/package.json`, `CreateWorkspaceModal.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `projects.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10714285714285714 - nodes in this community are weakly interconnected._