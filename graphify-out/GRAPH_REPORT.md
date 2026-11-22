# Graph Report - Tasko  (2026-11-22)

## Corpus Check
- 232 files · ~122,130 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1522 nodes · 3941 edges · 82 communities (57 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8607a886`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- WorkspacesService
- users.service.ts
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- tasks.controller.ts
- LandingPage.tsx
- Role
- README: Hệ thống quản lý dự án và công việc cho doanh nghiệp
- useOverview.ts
- backend-ci.yml
- scripts
- main.ts
- compilerOptions
- app.module.ts
- ProjectMember
- backend/README.md
- @nestjs/common
- LoginDto
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- ProjectsService
- vite-env.d.ts
- projectService.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- Project
- SprintsService
- dependencies
- projects.controller.ts
- WorkType
- useDragAndDrop.ts
- KanbanBoardView.tsx
- AuthService
- task.ts
- ref_vitest
- Task
- authService.ts
- EmailVerification
- CurrentUser
- ForgotPasswordPage.tsx
- RequirePermission
- @nestjs/config
- backend/package.json
- BacklogView.tsx
- UpdateSprintDto
- react
- auth.service.spec.ts
- lib/api.ts
- AppService
- RegisterPage.tsx
- WorkspaceSidebar.tsx
- LoginPage.tsx
- devDependencies
- CreateProjectDto
- AddProjectMemberDto
- transform.interceptor.ts
- ProjectRole
- projects.service.ts
- @testing-library/jest-dom
- passport@^0.7.0
- streamifier
- supertest
- @types/cookie-parser@^1.4.10
- @types/express@^5.0.0
- @types/multer@^2.3.0
- @types/streamifier@^0.1.2
- @types/supertest@^7.0.0
- AuthModule
- UsersModule
- WorkspacesModule
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 77 edges
2. `lucide-react` - 56 edges
3. `RequirePermission()` - 49 edges
4. `@nestjs/common` - 46 edges
5. `Project` - 44 edges
6. `User` - 40 edges
7. `react-router-dom` - 40 edges
8. `useAuthStore` - 40 edges
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

## Communities (82 total, 25 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (36): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+28 more)

### Community 2 - "WorkspacesService"
Cohesion: 0.12
Nodes (3): AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspacesController

### Community 3 - "users.service.ts"
Cohesion: 0.05
Nodes (11): Session, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, ChangePasswordDto, UpdateProfileDto, UsersController (+3 more)

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
Nodes (19): dependencies, date-fns@^4.4.0, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8 (+11 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "tasks.controller.ts"
Cohesion: 0.12
Nodes (11): CreateTaskDto, MoveTaskDto, TaskCustomFieldValueInput, TaskQueryDto, UpdateTaskDto, TaskPriority, HIGH, LOW (+3 more)

### Community 10 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (12): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), Logo(), LogoProps, VerifyEmailPage(), GithubIcon(), LandingPage() (+4 more)

### Community 11 - "Role"
Cohesion: 0.09
Nodes (12): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+4 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.12
Nodes (26): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), MyTasksTracker(), MyTasksTrackerProps, NoWorkspaceEmptyState() (+18 more)

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

### Community 21 - "@nestjs/common"
Cohesion: 0.17
Nodes (7): PERMISSIONS_KEY, JwtAuthGuard, RbacPermissionGuard, UpdateWorkspaceDto, @nestjs/common, @nestjs/core, @nestjs/testing

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

### Community 30 - "projectService.ts"
Cohesion: 0.10
Nodes (26): ALL_VIEW_TYPES, ProjectTabBarProps, WorkspaceItem, projectKeys, ProjectSettingsPage(), SettingsTab, mockNavigate, CreateProjectPayload (+18 more)

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "Project"
Cohesion: 0.10
Nodes (17): CustomField, CustomFieldType, DATE, NUMBER, SELECT, TEXT, Project, ProjectMethodology (+9 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (28): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, cloudinary@^2.11.0, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1 (+20 more)

### Community 37 - "projects.controller.ts"
Cohesion: 0.23
Nodes (13): CreateCustomFieldDto, CreateStatusDto, CreateWorkflowDto, CreateWorkTypeDto, DeleteStatusDto, DeleteWorkTypeDto, TransitionItemDto, UpdateCustomFieldDto (+5 more)

### Community 38 - "WorkType"
Cohesion: 0.08
Nodes (3): WorkType, Workflow, WorkflowTransition

### Community 39 - "useDragAndDrop.ts"
Cohesion: 0.29
Nodes (6): @dnd-kit/core@^6.3.1, MockTask, useDragAndDrop(), UseDragAndDropOptions, UseDragAndDropReturn, @dnd-kit/core

### Community 40 - "KanbanBoardView.tsx"
Cohesion: 0.21
Nodes (16): KanbanCard(), KanbanCardProps, KanbanColumn(), KanbanColumnProps, CompleteSprintModal(), CompleteSprintModalProps, CreateTaskModal(), CreateTaskModalProps (+8 more)

### Community 42 - "task.ts"
Cohesion: 0.13
Nodes (10): TaskFilterBarProps, taskKeys, ProjectMember, Assignee, CreateTaskPayload, MoveTaskPayload, Task, TaskCustomFieldValue (+2 more)

### Community 43 - "ref_vitest"
Cohesion: 0.12
Nodes (22): PasswordInput(), PasswordInputProps, ProjectMembersModalProps, WorkspaceMembersTab(), WorkspaceMembersTabProps, mockNavigate, getInitials(), SettingsPage() (+14 more)

### Community 44 - "Task"
Cohesion: 0.07
Nodes (3): Status, CustomFieldValue, Task

### Community 45 - "authService.ts"
Cohesion: 0.19
Nodes (16): LoginDto, RegisterDto, AuthState, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse, RegisterPayload (+8 more)

### Community 48 - "ForgotPasswordPage.tsx"
Cohesion: 0.17
Nodes (16): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, TextField(), TextFieldProps (+8 more)

### Community 50 - "@nestjs/config"
Cohesion: 0.15
Nodes (9): AuthTokensResult, JwtPayload, IMailService, MAIL_SERVICE, MailModule, MailService, @nestjs/config, @nestjs/jwt (+1 more)

### Community 51 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, description, @nestjs/mau@^0.2.6, prettier@^3.4.2, vite@^8.0.0, @vitest/coverage-v8@^4.1.2, vite, license (+7 more)

### Community 52 - "BacklogView.tsx"
Cohesion: 0.15
Nodes (14): StartSprintModal(), StartSprintModalProps, TaskDetailDrawerProps, sprintKeys, projectService, sprintService, taskService, ProjectStatus (+6 more)

### Community 53 - "UpdateSprintDto"
Cohesion: 0.23
Nodes (8): CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED, PLANNED

### Community 54 - "react"
Cohesion: 0.07
Nodes (42): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, AiCreateModalProps, Footer(), Header() (+34 more)

### Community 55 - "auth.service.spec.ts"
Cohesion: 0.09
Nodes (7): ForgotPasswordDto, GoogleLoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyOtpDto, class-validator

### Community 56 - "lib/api.ts"
Cohesion: 0.22
Nodes (8): api, refreshAccessToken(), request(), RequestOptions, ApiError, ApiResponse, ChangePasswordPayload, UpdateProfilePayload

### Community 58 - "RegisterPage.tsx"
Cohesion: 0.31
Nodes (7): GoogleButton(), GoogleButtonProps, GoogleIcon(), FormStatus, useRegister(), RegisterPage(), RegisterPage

### Community 59 - "WorkspaceSidebar.tsx"
Cohesion: 0.15
Nodes (9): CreateWorkspaceData, CreateWorkspaceModal(), CreateWorkspaceModalProps, INITIAL_WORKSPACES, StarredItem, WorkspaceSidebar(), WorkspaceSidebarProps, rootElement (+1 more)

### Community 60 - "LoginPage.tsx"
Cohesion: 0.33
Nodes (6): @react-oauth/google@^0.13.5, FormStatus, useLogin(), LoginPage(), LoginPage, @react-oauth/google

### Community 61 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli@^12.0.0, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint@^1.58.0, oxlint-tsgolint@^7.0.2001, source-map-support@^0.5.21, @types/bcrypt@^6.0.0 (+16 more)

### Community 63 - "AddProjectMemberDto"
Cohesion: 0.39
Nodes (3): AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto

### Community 65 - "transform.interceptor.ts"
Cohesion: 0.29
Nodes (4): rxjs@^7.8.1, ApiResponse, TransformInterceptor, rxjs

### Community 66 - "ProjectRole"
Cohesion: 0.50
Nodes (4): ProjectRole, MEMBER, OWNER, VIEWER

### Community 67 - "projects.service.ts"
Cohesion: 0.08
Nodes (11): User, CreateWorkspaceDto, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER (+3 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 564 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `frontend/package.json`, `dependencies`, `KanbanBoardView.tsx`, `useDragAndDrop.ts`, `LandingPage.tsx`, `ref_vitest`, `task.ts`, `useOverview.ts`, `ForgotPasswordPage.tsx`, `BacklogView.tsx`, `RegisterPage.tsx`, `WorkspaceSidebar.tsx`, `LoginPage.tsx`, `projectService.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09959183673469388 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `transform.interceptor.ts`, `Project`, `users.service.ts`, `dependencies`, `projects.controller.ts`, `projects.service.ts`, `Role`, `main.ts`, `app.module.ts`, `backend/package.json`, `@nestjs/config`, `auth.service.spec.ts`, `AppService`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `WorkspacesService` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `Role` to `Project`, `projects.service.ts`, `users.service.ts`, `WorkType`, `task.ts`, `Task`, `EmailVerification`, `ProjectMember`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `users.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05336538461538461 - nodes in this community are weakly interconnected._