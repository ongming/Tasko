# Graph Report - Tasko  (2026-11-24)

## Corpus Check
- 264 files · ~132,241 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1623 nodes · 4435 edges · 87 communities (57 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04892075`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- WorkspacesController
- WorkflowsSettingsTab.tsx
- Project Management System (Jira/Trello-like, Scrum/Kanban)
- frontend/package.json
- compilerOptions
- dependencies
- compilerOptions
- taskService.ts
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
- sprints.controller.ts
- ref_vitest
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
- main.ts
- SprintsService
- dependencies
- WorkType
- projects.service.ts
- ref_vitest
- CreateProjectDto
- useKanbanBoard.ts
- RegisterPage.tsx
- projects.service.ts
- workspace.ts
- authService.ts
- auth.service.ts
- AuthService
- Session
- RequirePermission
- backend/package.json
- AppService
- react
- EmailVerification
- CalendarView.tsx
- auth.service.spec.ts
- cloudinary.module.ts
- TasksController
- users.controller.ts
- UpdateProfileDto
- useAuthStore
- devDependencies
- sprint.ts
- index.tsx
- UsersService
- AddProjectMemberDto
- LoginDto
- UsersController
- ProjectMember
- MailService
- setup.ts
- TeamPresenceWidget.tsx
- @nestjs/cli@^12.0.0
- @nestjs/schematics@^12.0.0
- oxlint-tsgolint@^7.0.2001
- supertest
- @types/cookie-parser@^1.4.10
- @types/node@^24.0.0
- @types/passport-jwt@^4.0.1
- @types/supertest@^7.0.0
- vite@^8.0.0
- @vitest/coverage-v8@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 95 edges
2. `lucide-react` - 71 edges
3. `RequirePermission()` - 49 edges
4. `@nestjs/common` - 46 edges
5. `react-router-dom` - 46 edges
6. `Project` - 44 edges
7. `useAuthStore` - 44 edges
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

## Communities (87 total, 30 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.09
Nodes (37): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid() (+29 more)

### Community 2 - "WorkspacesController"
Cohesion: 0.08
Nodes (7): CreateWorkspaceDto, UpdateWorkspaceDto, AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspaceResponseDto, WorkspacesController, WorkspacesService

### Community 3 - "WorkflowsSettingsTab.tsx"
Cohesion: 0.15
Nodes (25): @xyflow/react@^13.0.3, EDGE_TYPES, NODE_TYPES, QUICK_LABELS, WorkflowDiagramCanvas(), WorkflowDiagramCanvasProps, CATEGORY_META, WorkflowStatusFlowNode (+17 more)

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
Cohesion: 0.10
Nodes (20): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "taskService.ts"
Cohesion: 0.09
Nodes (24): BacklogDroppableContainer(), BacklogDroppableContainerProps, BacklogIssueRow(), BacklogIssueRowProps, CreateSprintModal(), SprintSection(), SprintSectionProps, KanbanCardProps (+16 more)

### Community 10 - "react"
Cohesion: 0.13
Nodes (18): CreateSprintModalProps, DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), Footer(), Header(), Logo(), LogoProps (+10 more)

### Community 11 - "Role"
Cohesion: 0.10
Nodes (10): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+2 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.12
Nodes (26): ActiveProjectsGrid(), ActiveProjectsGridProps, ExecutiveStatsRibbon(), MyTasksTracker(), MyTasksTrackerProps, NoWorkspaceEmptyState(), NoWorkspaceEmptyStateProps, OverviewHeader() (+18 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "projectService.ts"
Cohesion: 0.13
Nodes (28): CustomFieldsSettingsTab(), CustomFieldsSettingsTabProps, GeneralSettingsTab(), GeneralSettingsTabProps, StatusesSettingsTab(), StatusesSettingsTabProps, WorkflowsSettingsTabProps, WorkTypesSettingsTab() (+20 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.11
Nodes (11): AppModule, ObserveModule, cloudinaryConfig, databaseConfig, jwtConfig, ProjectsModule, RbacModule, SprintsModule (+3 more)

### Community 19 - "workspaces.service.ts"
Cohesion: 0.09
Nodes (13): PERMISSIONS_KEY, User, SanitizedUser, Workspace, WorkspaceMember, WorkspaceRole, ADMIN, MEMBER (+5 more)

### Community 20 - "backend/README.md"
Cohesion: 0.18
Nodes (10): Compile and run the project, Deployment, Description, License, Observability, Project setup, Resources, Run tests (+2 more)

### Community 21 - "sprints.controller.ts"
Cohesion: 0.15
Nodes (10): JwtAuthGuard, RbacPermissionGuard, CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE (+2 more)

### Community 22 - "ref_vitest"
Cohesion: 0.13
Nodes (25): ProjectMembersModalProps, getInitials(), ProfileSecurityTab(), WorkspaceGeneralTab(), WorkspaceGeneralTabProps, WorkspaceMembersTab(), WorkspaceMembersTabProps, api (+17 more)

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

### Community 34 - "main.ts"
Cohesion: 0.15
Nodes (9): cookie-parser@^1.4.7, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap(), cookie-parser (+1 more)

### Community 36 - "dependencies"
Cohesion: 0.11
Nodes (17): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, google-auth-library@^11.3.1, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1, @nestjs/core@^12.0.1, @nestjs/jwt@^12.0.3 (+9 more)

### Community 37 - "WorkType"
Cohesion: 0.05
Nodes (6): Status, WorkType, Workflow, WorkflowTransition, CustomFieldValue, Column

### Community 38 - "projects.service.ts"
Cohesion: 0.09
Nodes (4): Project, Sprint, Task, @nestjs/typeorm

### Community 39 - "ref_vitest"
Cohesion: 0.21
Nodes (11): TaskDetailDrawerProps, AVATAR_COLORS, EMPTY_STATS, ControlBoardView(), mockNavigate, projectService, sprintService, taskService (+3 more)

### Community 41 - "useKanbanBoard.ts"
Cohesion: 0.23
Nodes (11): TaskFilterBarProps, useBacklogBoard(), MockTask, useDragAndDrop(), UseDragAndDropOptions, UseDragAndDropReturn, useKanbanBoard(), ProjectMember (+3 more)

### Community 42 - "RegisterPage.tsx"
Cohesion: 0.12
Nodes (30): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+22 more)

### Community 43 - "projects.service.ts"
Cohesion: 0.15
Nodes (19): CustomField, CustomFieldType, DATE, NUMBER, SELECT, TEXT, ProjectMethodology, KANBAN (+11 more)

### Community 44 - "workspace.ts"
Cohesion: 0.11
Nodes (17): ALL_VIEW_TYPES, ProjectTabBarProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, MembersPage() (+9 more)

### Community 45 - "authService.ts"
Cohesion: 0.18
Nodes (16): LoginDto, RegisterDto, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse, RegisterPayload (+8 more)

### Community 46 - "auth.service.ts"
Cohesion: 0.14
Nodes (11): AuthModule, AuthTokensResult, RegisterDto, JwtPayload, IMailService, MAIL_SERVICE, MailModule, bcrypt (+3 more)

### Community 49 - "RequirePermission"
Cohesion: 0.17
Nodes (3): CurrentUser, RequirePermission(), ProjectsController

### Community 50 - "backend/package.json"
Cohesion: 0.10
Nodes (19): author, @nestjs/observe@^0.3.0, passport@^0.7.0, pg@^8.23.1, reflect-metadata@^0.2.2, description, source-map-support@^0.5.21, vitest@^4.1.2 (+11 more)

### Community 52 - "react"
Cohesion: 0.18
Nodes (18): KanbanCard(), KanbanColumn(), KanbanColumnProps, CompleteSprintModal(), CreateTaskModal(), TaskDetailDrawer(), TaskFilterBar(), Button() (+10 more)

### Community 54 - "CalendarView.tsx"
Cohesion: 0.31
Nodes (9): WorkTypeIcon(), WorkTypeIconProps, CalendarDayCell(), CalendarDayCellProps, CalendarTaskPill(), CalendarTaskPillProps, CalendarView(), TimelineView() (+1 more)

### Community 55 - "auth.service.spec.ts"
Cohesion: 0.10
Nodes (7): class-validator@^0.15.1, ForgotPasswordDto, GoogleLoginDto, ResendVerificationDto, ResetPasswordDto, VerifyOtpDto, class-validator

### Community 56 - "cloudinary.module.ts"
Cohesion: 0.17
Nodes (8): cloudinary@^2.11.0, streamifier@^0.1.1, CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, cloudinary, streamifier

### Community 57 - "TasksController"
Cohesion: 0.08
Nodes (12): CreateTaskDto, MoveTaskDto, TaskCustomFieldValueInput, TaskQueryDto, UpdateTaskDto, TaskPriority, HIGH, LOW (+4 more)

### Community 58 - "users.controller.ts"
Cohesion: 0.18
Nodes (5): multer@^2.5.0, @nestjs/platform-express@^12.0.1, ChangePasswordDto, multer, @nestjs/platform-express

### Community 60 - "useAuthStore"
Cohesion: 0.13
Nodes (15): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ExecutiveStatsRibbonProps, ProjectMembersModal(), ProjectTabBar() (+7 more)

### Community 61 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, prettier@^3.4.2, @types/bcrypt@^6.0.0, @types/express@^5.0.0, @types/multer@^2.3.0 (+12 more)

### Community 62 - "sprint.ts"
Cohesion: 0.19
Nodes (5): sprintKeys, CompleteSprintPayload, CreateSprintPayload, SprintStatus, StartSprintPayload

### Community 63 - "index.tsx"
Cohesion: 0.08
Nodes (21): WorkspaceSidebar(), WorkspaceTopbar(), WorkspaceLayout(), ProjectsPage(), BacklogView, CalendarView, ControlBoardView, ForgotPasswordPage (+13 more)

### Community 66 - "AddProjectMemberDto"
Cohesion: 0.39
Nodes (3): AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 580 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `workspaces.service.ts` to `main.ts`, `WorkspacesController`, `dependencies`, `projects.service.ts`, `projects.service.ts`, `Role`, `auth.service.ts`, `app.module.ts`, `backend/package.json`, `AppService`, `sprints.controller.ts`, `auth.service.spec.ts`, `cloudinary.module.ts`, `TasksController`, `users.controller.ts`, `projects.controller.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `WorkType` to `ProjectMember`, `projects.service.ts`, `taskService.ts`, `projects.service.ts`, `Role`, `Session`, `workspaces.service.ts`, `EmailVerification`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `WorkspacesController` be split into smaller, more focused modules?**
  _Cohesion score 0.07653061224489796 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `WorkflowsSettingsTab.tsx`, `frontend/package.json`, `dependencies`, `ref_vitest`, `taskService.ts`, `RegisterPage.tsx`, `TeamPresenceWidget.tsx`, `workspace.ts`, `useOverview.ts`, `useKanbanBoard.ts`, `projectService.ts`, `react`, `ref_vitest`, `CalendarView.tsx`, `useAuthStore`, `index.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._