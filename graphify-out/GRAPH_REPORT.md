# Graph Report - Tasko  (2026-11-23)

## Corpus Check
- 257 files · ~128,603 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1582 nodes · 4285 edges · 73 communities (55 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `31febee8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- WorkspacesController
- users.service.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- CreateTaskDto
- react
- Role
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useOverview.ts
- backend-ci.yml
- scripts
- projectService.ts
- compilerOptions
- app.module.ts
- workspaces.service.ts
- backend/README.md
- RbacPermissionGuard
- WorkType
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- ProjectsService
- vite-env.d.ts
- projects.controller.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- UsersService
- SprintsService
- dependencies
- projects.service.ts
- Project
- TaskDetailDrawer.tsx
- CreateProjectDto
- Task
- LoginPage.tsx
- WorkspaceSidebar.tsx
- ListView.tsx
- authService.ts
- auth.service.ts
- ForgotPasswordPage.tsx
- KanbanBoardView.tsx
- RequirePermission
- backend/package.json
- useRegister.ts
- BacklogView.tsx
- main.tsx
- ref_vitest
- auth.service.spec.ts
- CreateTaskModal.tsx
- TasksController
- ProjectRole
- @testing-library/jest-dom
- cloudinary
- devDependencies
- reflect-metadata@^0.2.2
- index.tsx
- oxlint-tsgolint@^7.0.2001
- source-map-support@^0.5.21
- @types/express@^5.0.0
- @types/multer@^2.3.0
- @types/streamifier@^0.1.2
- @vitest/coverage-v8@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 91 edges
2. `lucide-react` - 67 edges
3. `RequirePermission()` - 49 edges
4. `@nestjs/common` - 46 edges
5. `react-router-dom` - 46 edges
6. `Project` - 44 edges
7. `useAuthStore` - 43 edges
8. `User` - 40 edges
9. `typeorm` - 38 edges
10. `ProjectsService` - 38 edges

## Surprising Connections (you probably didn't know these)
- `EmailVerification` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/email-verification.entity.ts → frontend/src/types/task.ts
- `PasswordResetToken` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/password-reset-token.entity.ts → frontend/src/types/task.ts
- `Session` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/session.entity.ts → frontend/src/types/task.ts
- `User` --references--> `Column`  [EXTRACTED]
  backend/src/modules/auth/entities/user.entity.ts → frontend/src/types/task.ts
- `CustomField` --references--> `Column`  [EXTRACTED]
  backend/src/modules/projects/entities/custom-field.entity.ts → frontend/src/types/task.ts

## Import Cycles
- None detected.

## Communities (73 total, 18 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (36): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid() (+28 more)

### Community 1 - "AuthService"
Cohesion: 0.09
Nodes (4): AuthController, AuthService, GoogleLoginDto, VerifyOtpDto

### Community 2 - "WorkspacesController"
Cohesion: 0.08
Nodes (5): CreateWorkspaceDto, UpdateWorkspaceDto, AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspacesController

### Community 3 - "users.service.ts"
Cohesion: 0.08
Nodes (10): Session, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, ChangePasswordDto, UpdateProfileDto, SanitizedUser (+2 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.10
Nodes (26): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @testing-library/react@^16.3.3, @types/node@^26.6.5, @types/react@^19.3.0 (+18 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+10 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "CreateTaskDto"
Cohesion: 0.19
Nodes (10): CreateTaskDto, MoveTaskDto, TaskCustomFieldValueInput, TaskQueryDto, UpdateTaskDto, TaskPriority, HIGH, LOW (+2 more)

### Community 10 - "react"
Cohesion: 0.22
Nodes (10): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), Logo(), LogoProps, GithubIcon(), LandingPage(), LinkedinIcon() (+2 more)

### Community 11 - "Role"
Cohesion: 0.10
Nodes (12): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+4 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.14
Nodes (23): ActiveProjectsGrid(), ActiveProjectsGridProps, ExecutiveStatsRibbon(), MyTasksTracker(), MyTasksTrackerProps, NoWorkspaceEmptyState(), NoWorkspaceEmptyStateProps, OverviewHeader() (+15 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "projectService.ts"
Cohesion: 0.13
Nodes (28): CustomFieldsSettingsTab(), CustomFieldsSettingsTabProps, GeneralSettingsTab(), GeneralSettingsTabProps, StatusesSettingsTab(), StatusesSettingsTabProps, WorkflowsSettingsTab(), WorkflowsSettingsTabProps (+20 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.05
Nodes (23): cookie-parser@^1.4.7, rxjs@^7.8.1, AppController, AppModule, ObserveInstrument, ObserveModule, AppService, HttpExceptionFilter (+15 more)

### Community 19 - "workspaces.service.ts"
Cohesion: 0.10
Nodes (12): PERMISSIONS_KEY, User, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER (+4 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

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

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "projects.controller.ts"
Cohesion: 0.11
Nodes (30): CreateCustomFieldDto, CreateStatusDto, CreateWorkflowDto, CreateWorkTypeDto, DeleteStatusDto, DeleteWorkTypeDto, TransitionItemDto, UpdateCustomFieldDto (+22 more)

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 35 - "SprintsService"
Cohesion: 0.09
Nodes (11): JwtAuthGuard, CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED (+3 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1 (+21 more)

### Community 37 - "projects.service.ts"
Cohesion: 0.07
Nodes (5): ProjectMember, Status, Workflow, WorkflowTransition, Column

### Community 38 - "Project"
Cohesion: 0.19
Nodes (3): Project, WorkType, typeorm

### Community 39 - "TaskDetailDrawer.tsx"
Cohesion: 0.13
Nodes (19): TaskDetailDrawer(), TaskDetailDrawerProps, WorkTypeIcon(), WorkTypeIconProps, taskKeys, CalendarDayCell(), CalendarTaskPill(), CalendarView() (+11 more)

### Community 42 - "LoginPage.tsx"
Cohesion: 0.17
Nodes (16): GoogleButton(), GoogleButtonProps, GoogleIcon(), PasswordInput(), PasswordInputProps, TextField(), TextFieldProps, getInitials() (+8 more)

### Community 43 - "WorkspaceSidebar.tsx"
Cohesion: 0.13
Nodes (10): CreateWorkspaceData, CreateWorkspaceModalProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebar(), WorkspaceSidebarProps, WorkspaceTopbar() (+2 more)

### Community 44 - "ListView.tsx"
Cohesion: 0.13
Nodes (16): ALL_VIEW_TYPES, ProjectTabBar(), ProjectTabBarProps, projectKeys, AVATAR_COLORS, EMPTY_STATS, mapPriority(), useOverview() (+8 more)

### Community 45 - "authService.ts"
Cohesion: 0.16
Nodes (18): LoginDto, RegisterDto, AuthState, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse (+10 more)

### Community 46 - "auth.service.ts"
Cohesion: 0.07
Nodes (12): AuthTokensResult, EmailVerification, PasswordResetToken, JwtPayload, JwtStrategy, IMailService, MAIL_SERVICE, MailModule (+4 more)

### Community 47 - "ForgotPasswordPage.tsx"
Cohesion: 0.21
Nodes (13): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, ForgotPasswordPage(), ResetPasswordPage() (+5 more)

### Community 48 - "KanbanBoardView.tsx"
Cohesion: 0.11
Nodes (21): KanbanCard(), KanbanColumn(), KanbanColumnProps, sprintKeys, useBacklogBoard(), MockTask, useDragAndDrop(), UseDragAndDropOptions (+13 more)

### Community 49 - "RequirePermission"
Cohesion: 0.17
Nodes (3): CurrentUser, RequirePermission(), ProjectsController

### Community 50 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, description, @nestjs/schematics@^12.0.0, @types/node@^24.0.0, @types/nodemailer@^8.0.2, @types/passport-jwt@^4.0.1, @types/node, license (+7 more)

### Community 51 - "useRegister.ts"
Cohesion: 0.21
Nodes (8): FormStatus, refreshAccessToken(), request(), VerifyEmailPage(), VerifyEmailPage, authService, ApiError, ApiResponse

### Community 52 - "BacklogView.tsx"
Cohesion: 0.13
Nodes (25): BacklogDroppableContainer(), BacklogDroppableContainerProps, BacklogIssueRow(), BacklogIssueRowProps, CreateSprintModal(), CreateSprintModalProps, SprintSection(), SprintSectionProps (+17 more)

### Community 53 - "main.tsx"
Cohesion: 0.29
Nodes (5): react-dom@^19.2.8, @react-oauth/google@^0.13.5, rootElement, react-dom, @react-oauth/google

### Community 54 - "ref_vitest"
Cohesion: 0.13
Nodes (23): App(), ProjectMembersModal(), ProjectMembersModalProps, WorkspaceGeneralTab(), WorkspaceGeneralTabProps, WorkspaceMembersTab(), WorkspaceMembersTabProps, ProjectLayout() (+15 more)

### Community 55 - "auth.service.spec.ts"
Cohesion: 0.10
Nodes (6): ForgotPasswordDto, LoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, class-validator

### Community 56 - "CreateTaskModal.tsx"
Cohesion: 0.16
Nodes (15): CreateTaskModal(), TaskFilterBar(), TaskFilterBarProps, Select(), SelectOption, SelectProps, AddProjectMemberPayload, MemberUser (+7 more)

### Community 58 - "ProjectRole"
Cohesion: 0.50
Nodes (4): ProjectRole, MEMBER, OWNER, VIEWER

### Community 61 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, prettier@^3.4.2, supertest@^7.0.0, @types/bcrypt@^6.0.0 (+16 more)

### Community 63 - "index.tsx"
Cohesion: 0.07
Nodes (26): GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, Footer(), Header(), MainLayout(), MainLayoutProps (+18 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 567 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Column` connect `projects.service.ts` to `users.service.ts`, `Project`, `TaskDetailDrawer.tsx`, `Task`, `Role`, `auth.service.ts`, `workspaces.service.ts`, `WorkType`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09725490196078432 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `users.service.ts` to `WorkspacesController`, `SprintsService`, `dependencies`, `Project`, `CreateTaskDto`, `Role`, `auth.service.ts`, `backend/package.json`, `workspaces.service.ts`, `app.module.ts`, `auth.service.spec.ts`, `projects.controller.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.08865248226950355 - nodes in this community are weakly interconnected._
- **Why does `react` connect `BacklogView.tsx` to `CreateProjectPage.tsx`, `frontend/package.json`, `dependencies`, `TaskDetailDrawer.tsx`, `LoginPage.tsx`, `react`, `ListView.tsx`, `useOverview.ts`, `WorkspaceSidebar.tsx`, `ForgotPasswordPage.tsx`, `KanbanBoardView.tsx`, `projectService.ts`, `useRegister.ts`, `main.tsx`, `ref_vitest`, `CreateTaskModal.tsx`, `index.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `WorkspacesController` be split into smaller, more focused modules?**
  _Cohesion score 0.07549361207897794 - nodes in this community are weakly interconnected._