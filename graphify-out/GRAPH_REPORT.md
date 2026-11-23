# Graph Report - Tasko  (2026-11-23)

## Corpus Check
- 258 files · ~128,854 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1587 nodes · 4324 edges · 75 communities (56 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89add08f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- WorkspacesController
- UpdateProfileDto
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- CreateTaskDto
- LandingPage.tsx
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
- @nestjs/common
- sprint.ts
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
- WorkType
- projects.service.ts
- react-router-dom
- CreateProjectDto
- Task
- ForgotPasswordPage.tsx
- WorkspaceTopbar.tsx
- lucide-react
- authService.ts
- auth.service.ts
- AuthService
- LoginPage.tsx
- RequirePermission
- CustomField
- UpdateSprintDto
- react
- EmailVerification
- ref_vitest
- auth.service.spec.ts
- ChangePasswordDto
- TasksController
- main.ts
- ListView.tsx
- users.service.spec.ts
- backend/package.json
- UsersController
- index.tsx
- Session
- projects.service.ts
- LoginDto
- AddWorkspaceMemberDto
- UpdateWorkspaceDto
- main.tsx
- @testing-library/jest-dom
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 92 edges
2. `lucide-react` - 68 edges
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

## Communities (75 total, 19 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.10
Nodes (36): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid() (+28 more)

### Community 3 - "UpdateProfileDto"
Cohesion: 0.22
Nodes (3): class-transformer@^0.5.1, UpdateProfileDto, class-transformer

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

### Community 10 - "LandingPage.tsx"
Cohesion: 0.27
Nodes (8): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon(), LandingPage

### Community 11 - "Role"
Cohesion: 0.10
Nodes (10): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+2 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.10
Nodes (30): ActiveProjectsGrid(), ActiveProjectsGridProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps, NoWorkspaceEmptyState(), NoWorkspaceEmptyStateProps (+22 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "projectService.ts"
Cohesion: 0.12
Nodes (36): CustomFieldsSettingsTab(), CustomFieldsSettingsTabProps, GeneralSettingsTab(), StatusesSettingsTab(), StatusesSettingsTabProps, WorkflowsSettingsTab(), WorkflowsSettingsTabProps, WorkTypesSettingsTab() (+28 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.08
Nodes (14): AppController, AppModule, ObserveModule, AppService, cloudinaryConfig, databaseConfig, jwtConfig, AuthModule (+6 more)

### Community 19 - "workspaces.service.ts"
Cohesion: 0.08
Nodes (12): User, CreateWorkspaceDto, WorkspaceResponseDto, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER (+4 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "@nestjs/common"
Cohesion: 0.26
Nodes (5): PERMISSIONS_KEY, JwtAuthGuard, RbacPermissionGuard, CreateSprintDto, @nestjs/common

### Community 22 - "sprint.ts"
Cohesion: 0.19
Nodes (5): sprintKeys, CompleteSprintPayload, CreateSprintPayload, SprintStatus, StartSprintPayload

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
Cohesion: 0.23
Nodes (13): CreateCustomFieldDto, CreateStatusDto, CreateWorkflowDto, CreateWorkTypeDto, DeleteStatusDto, DeleteWorkTypeDto, TransitionItemDto, UpdateCustomFieldDto (+5 more)

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 35 - "SprintsService"
Cohesion: 0.12
Nodes (3): CompleteSprintDto, SprintsController, SprintsService

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, bcrypt@^6.0.0, class-validator@^0.15.1, cloudinary@^2.11.0, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1 (+23 more)

### Community 37 - "WorkType"
Cohesion: 0.09
Nodes (4): ProjectMember, WorkType, Workflow, Column

### Community 38 - "projects.service.ts"
Cohesion: 0.15
Nodes (5): Project, Status, WorkflowTransition, @nestjs/typeorm, typeorm

### Community 39 - "react-router-dom"
Cohesion: 0.14
Nodes (16): taskKeys, AVATAR_COLORS, EMPTY_STATS, mockNavigate, projectService, sprintService, taskService, Assignee (+8 more)

### Community 42 - "ForgotPasswordPage.tsx"
Cohesion: 0.14
Nodes (18): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), TextField(), TextFieldProps, refreshAccessToken() (+10 more)

### Community 43 - "WorkspaceTopbar.tsx"
Cohesion: 0.16
Nodes (10): AuthLayoutProps, Logo(), LogoProps, WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceTopbarProps, WorkspaceLayout(), VerifyEmailPage() (+2 more)

### Community 44 - "lucide-react"
Cohesion: 0.11
Nodes (17): ProjectMembersModal(), ALL_VIEW_TYPES, ProjectTabBar(), ProjectTabBarProps, GeneralSettingsTabProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem (+9 more)

### Community 45 - "authService.ts"
Cohesion: 0.16
Nodes (18): LoginDto, RegisterDto, AuthState, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse (+10 more)

### Community 46 - "auth.service.ts"
Cohesion: 0.15
Nodes (9): AuthTokensResult, JwtPayload, IMailService, MAIL_SERVICE, MailModule, MailService, @nestjs/config, @nestjs/jwt (+1 more)

### Community 48 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): @react-oauth/google@^0.13.5, GoogleButton(), GoogleButtonProps, GoogleIcon(), PasswordInput(), PasswordInputProps, FormStatus, useLogin() (+7 more)

### Community 49 - "RequirePermission"
Cohesion: 0.17
Nodes (3): CurrentUser, RequirePermission(), ProjectsController

### Community 51 - "UpdateSprintDto"
Cohesion: 0.20
Nodes (6): StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED, PLANNED

### Community 52 - "react"
Cohesion: 0.10
Nodes (38): BacklogDroppableContainer(), BacklogDroppableContainerProps, BacklogIssueRow(), BacklogIssueRowProps, CreateSprintModal(), CreateSprintModalProps, SprintSection(), SprintSectionProps (+30 more)

### Community 54 - "ref_vitest"
Cohesion: 0.14
Nodes (17): ProjectMembersModalProps, WorkspaceGeneralTabProps, WorkspaceMembersTabProps, api, RequestOptions, UserSearchItem, userService, workspaceService (+9 more)

### Community 55 - "auth.service.spec.ts"
Cohesion: 0.09
Nodes (7): ForgotPasswordDto, GoogleLoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyOtpDto, class-validator

### Community 58 - "main.ts"
Cohesion: 0.13
Nodes (11): cookie-parser@^1.4.7, @nestjs/core@^12.0.1, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap() (+3 more)

### Community 59 - "ListView.tsx"
Cohesion: 0.16
Nodes (18): TaskDetailDrawer(), WorkTypeIcon(), WorkTypeIconProps, MockTask, useDragAndDrop(), UseDragAndDropOptions, UseDragAndDropReturn, CalendarDayCell() (+10 more)

### Community 60 - "users.service.spec.ts"
Cohesion: 0.27
Nodes (4): CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService

### Community 61 - "backend/package.json"
Cohesion: 0.05
Nodes (51): author, description, devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint@^1.58.0 (+43 more)

### Community 63 - "index.tsx"
Cohesion: 0.08
Nodes (31): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, Footer(), Header(), getInitials() (+23 more)

### Community 65 - "Session"
Cohesion: 0.23
Nodes (3): Session, SanitizedUser, bcrypt

### Community 66 - "projects.service.ts"
Cohesion: 0.10
Nodes (20): AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto, CustomFieldType, DATE, NUMBER, SELECT, TEXT (+12 more)

### Community 70 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.2.8, rootElement, react-dom

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 570 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `Session`, `projects.service.ts`, `dependencies`, `projects.service.ts`, `Role`, `auth.service.ts`, `app.module.ts`, `workspaces.service.ts`, `auth.service.spec.ts`, `main.ts`, `users.service.spec.ts`, `backend/package.json`, `projects.controller.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09725490196078432 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `WorkType` to `Session`, `projects.service.ts`, `react-router-dom`, `Task`, `Role`, `CustomField`, `workspaces.service.ts`, `EmailVerification`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `frontend/package.json`, `main.tsx`, `dependencies`, `react-router-dom`, `ForgotPasswordPage.tsx`, `WorkspaceTopbar.tsx`, `LandingPage.tsx`, `useOverview.ts`, `lucide-react`, `LoginPage.tsx`, `projectService.ts`, `ref_vitest`, `ListView.tsx`, `index.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._