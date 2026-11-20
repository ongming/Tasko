# Graph Report - Tasko  (2026-11-20)

## Corpus Check
- 224 files · ~117,828 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1505 nodes · 3873 edges · 76 communities (56 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e3ab5ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthController
- workspaces.service.ts
- react
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
- Task
- compilerOptions
- app.module.ts
- AuthService
- backend/README.md
- SprintsService
- projects.service.ts
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- auth.service.spec.ts
- vite-env.d.ts
- projectService.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- ref_vitest
- useTasksQuery.ts
- dependencies
- typeorm
- backend/package.json
- frontend/package.json
- authService.ts
- main.ts
- users.service.ts
- ref_vitest
- Status
- AppService
- useSprintsQuery.ts
- projects.controller.spec.ts
- react
- RequirePermission
- @nestjs/config
- ProjectRole
- BacklogView.tsx
- main.tsx
- react
- auth.service.ts
- transform.interceptor.ts
- ProjectConfigForm.tsx
- LoginDto
- workspace.ts
- @testing-library/jest-dom
- devDependencies
- @nestjs/schematics@^12.0.0
- @types/cookie-parser@^1.4.10
- @types/multer@^2.3.0
- Workspace
- source-map-support@^0.5.21
- @types/streamifier@^0.1.2
- AuthModule
- @types/supertest@^7.0.0
- UsersModule
- WorkspacesModule
- @types/express@^5.0.0
- vitest@^4.1.2
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 74 edges
2. `lucide-react` - 55 edges
3. `RequirePermission()` - 49 edges
4. `@nestjs/common` - 46 edges
5. `Project` - 44 edges
6. `User` - 40 edges
7. `useAuthStore` - 40 edges
8. `react-router-dom` - 39 edges
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

## Communities (76 total, 20 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.12
Nodes (33): AiCreateModal(), AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid(), DomainSelectorGridProps (+25 more)

### Community 2 - "workspaces.service.ts"
Cohesion: 0.07
Nodes (12): CreateWorkspaceDto, UpdateWorkspaceDto, AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspaceResponseDto, WorkspaceRole, ADMIN, MEMBER (+4 more)

### Community 3 - "react"
Cohesion: 0.20
Nodes (11): AiCreateModalProps, Footer(), Header(), Logo(), LogoProps, WorkspaceTopbarProps, MainLayout(), MainLayoutProps (+3 more)

### Community 4 - "Project Management System (Jira/Trello-like, Scrum/Kanban)"
Cohesion: 0.09
Nodes (22): API and auth, API conventions, Architecture & Dependency Inversion (Interface Scalability), Auth & permissions, Backend structure, Code standards, Commands, Do NOT (+14 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer@^10.6.1, jsdom@^31.0.0, postcss@^8.5.30, tailwindcss@^4.3.3, @testing-library/react@^16.3.3, @types/react-dom@^19.3.0, typescript@^7.0.2 (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @hookform/resolvers@^5.9.1, lucide-react@^1.57.0, react@^19.2.8 (+11 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 9 - "tasks.controller.ts"
Cohesion: 0.13
Nodes (10): CreateTaskDto, MoveTaskDto, TaskQueryDto, UpdateTaskDto, TaskPriority, HIGH, LOW, MEDIUM (+2 more)

### Community 10 - "LandingPage.tsx"
Cohesion: 0.31
Nodes (7): DoodleArrowLeft(), DoodleProps, DoodleSparksRight(), GithubIcon(), LandingPage(), LinkedinIcon(), QuoteIcon()

### Community 11 - "Role"
Cohesion: 0.10
Nodes (10): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+2 more)

### Community 12 - "README: Hệ thống quản lý dự án và công việc cho doanh nghiệp"
Cohesion: 0.12
Nodes (15): 10. Các điểm còn mở (hỏi người dùng khi cần), 1. Bối cảnh, 2. Công nghệ và kiến trúc, 3. Xác thực và phân quyền, 4. Danh sách chức năng (theo phân hệ), 5. Mô hình dữ liệu (tóm tắt), 6. NHIỆM VỤ CỦA BẠN, 7. Activity Diagram: danh sách 18 sơ đồ (đã có bản nháp) (+7 more)

### Community 13 - "useOverview.ts"
Cohesion: 0.09
Nodes (32): ActiveProjectsGrid(), ActiveProjectsGridProps, ActivityTimelineStream(), ActivityTimelineStreamProps, ExecutiveStatsRibbon(), ExecutiveStatsRibbonProps, MyTasksTracker(), MyTasksTrackerProps (+24 more)

### Community 14 - "backend-ci.yml"
Cohesion: 0.07
Nodes (27): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+19 more)

### Community 15 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "Task"
Cohesion: 0.09
Nodes (4): Project, Sprint, Task, @nestjs/typeorm

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
Cohesion: 0.09
Nodes (11): JwtAuthGuard, CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED (+3 more)

### Community 22 - "projects.service.ts"
Cohesion: 0.16
Nodes (22): CreateCustomFieldDto, CreateStatusDto, CreateWorkflowDto, CreateWorkTypeDto, DeleteStatusDto, DeleteWorkTypeDto, TransitionItemDto, UpdateCustomFieldDto (+14 more)

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
Cohesion: 0.09
Nodes (7): ForgotPasswordDto, GoogleLoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyOtpDto, class-validator

### Community 29 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (4): *.jpeg, *.jpg, *.png, *.svg

### Community 30 - "projectService.ts"
Cohesion: 0.18
Nodes (16): ProjectSettingsPage(), SettingsTab, mockNavigate, ProjectSettingsPage, CreateCustomFieldPayload, CreateStatusPayload, CreateWorkTypePayload, CustomField (+8 more)

### Community 31 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 33 - "frontend-ci.yml"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, run, defaults, runs-on, steps, jobs (+19 more)

### Community 34 - "ref_vitest"
Cohesion: 0.25
Nodes (4): api, refreshAccessToken(), request(), RequestOptions

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1, @nestjs/config@^12.0.1 (+21 more)

### Community 37 - "typeorm"
Cohesion: 0.18
Nodes (4): CustomField, Status, TaskCustomFieldValueInput, typeorm

### Community 38 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, cloudinary@^2.11.0, description, oxlint-tsgolint@^7.0.2001, prettier@^3.4.2, @types/passport-jwt@^4.0.1, license, name (+7 more)

### Community 39 - "frontend/package.json"
Cohesion: 0.15
Nodes (12): react-hook-form@^7.90.0, zod@^4.6.7, @types/node@^26.6.5, @types/react@^19.3.0, @types/node, name, private, type (+4 more)

### Community 40 - "authService.ts"
Cohesion: 0.16
Nodes (18): LoginDto, RegisterDto, AuthState, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse (+10 more)

### Community 41 - "main.ts"
Cohesion: 0.20
Nodes (6): cookie-parser@^1.4.7, AppModule, ObserveInstrument, HttpExceptionFilter, bootstrap(), cookie-parser

### Community 42 - "users.service.ts"
Cohesion: 0.06
Nodes (9): CloudinaryModule, CloudinaryService, CLOUDINARY_SERVICE, ICloudinaryService, ChangePasswordDto, UpdateProfileDto, UsersController, SanitizedUser (+1 more)

### Community 43 - "ref_vitest"
Cohesion: 0.16
Nodes (22): ProjectMembersModalProps, WorkspaceMembersTab(), WorkspaceMembersTabProps, EMPTY_STATS, mockNavigate, getInitials(), SettingsPage(), projectService (+14 more)

### Community 44 - "Status"
Cohesion: 0.06
Nodes (5): WorkType, Workflow, WorkflowTransition, CustomFieldValue, Column

### Community 47 - "projects.controller.spec.ts"
Cohesion: 0.12
Nodes (6): RbacPermissionGuard, CreateProjectDto, ProjectMethodology, KANBAN, SCRUM, SCRUMBAN

### Community 48 - "react"
Cohesion: 0.11
Nodes (31): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), AuthLayoutProps, GoogleButton(), GoogleButtonProps (+23 more)

### Community 49 - "RequirePermission"
Cohesion: 0.06
Nodes (9): CurrentUser, RequirePermission(), AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto, ProjectResponseDto, ProjectsController, ProjectsService (+1 more)

### Community 50 - "@nestjs/config"
Cohesion: 0.20
Nodes (5): IMailService, MAIL_SERVICE, MailModule, MailService, @nestjs/config

### Community 51 - "ProjectRole"
Cohesion: 0.50
Nodes (4): ProjectRole, MEMBER, OWNER, VIEWER

### Community 52 - "BacklogView.tsx"
Cohesion: 0.13
Nodes (32): CompleteSprintModal(), CompleteSprintModalProps, CreateTaskModal(), CreateTaskModalProps, StartSprintModal(), StartSprintModalProps, TaskDetailDrawer(), TaskDetailDrawerProps (+24 more)

### Community 53 - "main.tsx"
Cohesion: 0.40
Nodes (3): @react-oauth/google@^0.13.5, rootElement, @react-oauth/google

### Community 54 - "react"
Cohesion: 0.08
Nodes (30): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, ProjectMembersModal(), ProjectTabBar(), WorkspaceSidebar() (+22 more)

### Community 55 - "auth.service.ts"
Cohesion: 0.08
Nodes (8): AuthTokensResult, EmailVerification, PasswordResetToken, Session, JwtPayload, bcrypt, @nestjs/jwt, @nestjs/passport

### Community 56 - "transform.interceptor.ts"
Cohesion: 0.29
Nodes (4): rxjs@^7.8.1, ApiResponse, TransformInterceptor, rxjs

### Community 59 - "workspace.ts"
Cohesion: 0.11
Nodes (15): ALL_VIEW_TYPES, ProjectTabBarProps, INITIAL_WORKSPACES, StarredItem, WorkspaceItem, WorkspaceSidebarProps, projectKeys, ProjectsPage() (+7 more)

### Community 61 - "devDependencies"
Cohesion: 0.09
Nodes (22): devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/testing@^12.0.1, oxlint@^1.58.0, supertest@^7.0.0, @types/bcrypt@^6.0.0, @types/node@^24.0.0 (+14 more)

### Community 67 - "Workspace"
Cohesion: 0.09
Nodes (9): PERMISSIONS_KEY, User, ProjectMember, Workspace, WorkspaceMember, class-transformer, @nestjs/common, @nestjs/core (+1 more)

### Community 93 - "Product"
Cohesion: 0.29
Nodes (6): Brand Commitments, Operating Context, Platform, Product, Product Purpose, Users

### Community 97 - "Tasko Design Guidelines"
Cohesion: 0.33
Nodes (5): 1. Anti-AI Slop Mandates, 2. Typography & Hierarchy, 3. Cards & Surfaces, 4. Workspaces & Jira/Linear Standards, Tasko Design Guidelines

## Knowledge Gaps
- **27 isolated node(s):** `TEXT`, `NUMBER`, `DATE`, `SELECT`, `OWNER` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 560 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `Workspace` to `workspaces.service.ts`, `dependencies`, `typeorm`, `backend/package.json`, `main.ts`, `users.service.ts`, `Role`, `AppService`, `Task`, `app.module.ts`, `@nestjs/config`, `SprintsService`, `projects.service.ts`, `auth.service.ts`, `transform.interceptor.ts`, `auth.service.spec.ts`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11818181818181818 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `dependencies`, `frontend/package.json`, `LandingPage.tsx`, `ref_vitest`, `useOverview.ts`, `react`, `BacklogView.tsx`, `main.tsx`, `react`, `ProjectConfigForm.tsx`, `workspace.ts`, `projectService.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `workspaces.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `Status` to `Workspace`, `typeorm`, `Role`, `Task`, `BacklogView.tsx`, `auth.service.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `Project Management System (Jira/Trello-like, Scrum/Kanban)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._