# Graph Report - Tasko  (2026-11-22)

## Corpus Check
- 253 files · ~125,056 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 1575 nodes · 4202 edges · 68 communities (51 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76114dbc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CreateProjectPage.tsx
- AuthService
- User
- users.service.ts
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
- VerifyEmailPage.tsx
- backend/README.md
- tasks.controller.ts
- ProjectsService
- vite.config.ts
- .oxlintrc.json
- tsconfig.build.json
- nest-cli.json
- utils.ts
- lucide-react
- vite-env.d.ts
- projects.controller.ts
- scripts
- frontend/tsconfig.json
- frontend-ci.yml
- projects.service.ts
- SprintsService
- dependencies
- CustomField
- WorkType
- task.ts
- projects.controller.spec.ts
- RequirePermission
- ForgotPasswordPage.tsx
- ref_vitest
- sprints.controller.ts
- authService.ts
- EmailVerification
- main.ts
- LoginPage.tsx
- ProjectsController
- @nestjs/common
- AuthService
- BacklogView.tsx
- TasksService
- react
- auth.service.spec.ts
- AddProjectMemberDto
- PasswordResetToken
- Task
- AppService
- RegisterDto
- backend/package.json
- Status
- main.tsx
- @testing-library/jest-dom
- Product
- Tasko Design Guidelines

## God Nodes (most connected - your core abstractions)
1. `react` - 91 edges
2. `lucide-react` - 67 edges
3. `RequirePermission()` - 49 edges
4. `@nestjs/common` - 46 edges
5. `Project` - 44 edges
6. `react-router-dom` - 42 edges
7. `useAuthStore` - 42 edges
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

## Communities (68 total, 17 thin omitted)

### Community 0 - "CreateProjectPage.tsx"
Cohesion: 0.09
Nodes (37): AiCreateModal(), AiCreateModalProps, AGILE_METHODS, BUSINESS_DOMAINS, DEFAULT_WORK_TYPES, generateProjectKey(), METHOD_DETAILS, DomainSelectorGrid() (+29 more)

### Community 1 - "AuthService"
Cohesion: 0.12
Nodes (3): AuthController, GoogleLoginDto, ResendVerificationDto

### Community 2 - "User"
Cohesion: 0.05
Nodes (17): PERMISSIONS_KEY, User, CreateWorkspaceDto, UpdateWorkspaceDto, AddWorkspaceMemberDto, UpdateWorkspaceMemberRoleDto, WorkspaceResponseDto, Workspace (+9 more)

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
Nodes (11): Permission, Role, RoleScope, PROJECT, WORKSPACE, RolePermission, RbacController, PermissionSeed (+3 more)

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

### Community 16 - "projectService.ts"
Cohesion: 0.10
Nodes (37): ALL_VIEW_TYPES, ProjectTabBarProps, CustomFieldsSettingsTab(), CustomFieldsSettingsTabProps, GeneralSettingsTab(), GeneralSettingsTabProps, StatusesSettingsTab(), StatusesSettingsTabProps (+29 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+4 more)

### Community 18 - "app.module.ts"
Cohesion: 0.08
Nodes (16): @nestjs/observe@^0.3.0, supertest@^7.0.0, AppModule, ObserveModule, cloudinaryConfig, databaseConfig, jwtConfig, AuthModule (+8 more)

### Community 19 - "VerifyEmailPage.tsx"
Cohesion: 0.19
Nodes (9): AuthLayoutProps, Logo(), LogoProps, refreshAccessToken(), request(), VerifyEmailPage(), VerifyEmailPage, ApiError (+1 more)

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

### Community 28 - "lucide-react"
Cohesion: 0.11
Nodes (24): CompleteSprintModalProps, StartSprintModalProps, TaskDetailDrawer(), TaskDetailDrawerProps, WorkTypeIcon(), WorkTypeIconProps, sprintKeys, CalendarDayCell() (+16 more)

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

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, bcrypt@^6.0.0, class-transformer@^0.5.1, class-validator@^0.15.1, cloudinary@^2.11.0, google-auth-library@^11.3.1, multer@^2.5.0, @nestjs/common@^12.0.1 (+24 more)

### Community 38 - "WorkType"
Cohesion: 0.07
Nodes (5): ProjectMember, WorkType, Workflow, WorkflowTransition, Column

### Community 39 - "task.ts"
Cohesion: 0.11
Nodes (18): TaskFilterBarProps, taskKeys, useBacklogBoard(), MockTask, useDragAndDrop(), UseDragAndDropOptions, UseDragAndDropReturn, useKanbanBoard() (+10 more)

### Community 40 - "projects.controller.spec.ts"
Cohesion: 0.08
Nodes (19): CreateProjectDto, CustomFieldType, DATE, NUMBER, SELECT, TEXT, ProjectMethodology, KANBAN (+11 more)

### Community 41 - "RequirePermission"
Cohesion: 0.16
Nodes (3): CurrentUser, RequirePermission(), TasksController

### Community 42 - "ForgotPasswordPage.tsx"
Cohesion: 0.18
Nodes (15): AlertBanner(), AlertBannerProps, AlertVariant, variantStyles, AuthLayout(), TextField(), TextFieldProps, ForgotPasswordPage() (+7 more)

### Community 43 - "ref_vitest"
Cohesion: 0.12
Nodes (18): ProjectMembersModalProps, api, RequestOptions, mockNavigate, ProjectsPage(), UserSearchItem, userService, workspaceService (+10 more)

### Community 44 - "sprints.controller.ts"
Cohesion: 0.19
Nodes (8): CompleteSprintDto, CreateSprintDto, StartSprintDto, UpdateSprintDto, SprintStatus, ACTIVE, COMPLETED, PLANNED

### Community 45 - "authService.ts"
Cohesion: 0.17
Nodes (18): LoginDto, RegisterDto, AuthState, ChangePasswordPayload, ForgotPasswordPayload, GoogleLoginPayload, LoginPayload, LoginResponse (+10 more)

### Community 47 - "main.ts"
Cohesion: 0.15
Nodes (9): cookie-parser@^1.4.7, rxjs@^7.8.1, ObserveInstrument, HttpExceptionFilter, ApiResponse, TransformInterceptor, bootstrap(), cookie-parser (+1 more)

### Community 48 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): @react-oauth/google@^0.13.5, GoogleButton(), GoogleButtonProps, GoogleIcon(), PasswordInput(), PasswordInputProps, FormStatus, useLogin() (+7 more)

### Community 50 - "@nestjs/common"
Cohesion: 0.16
Nodes (10): AuthTokensResult, JwtPayload, IMailService, MAIL_SERVICE, MailModule, MailService, @nestjs/common, @nestjs/config (+2 more)

### Community 52 - "BacklogView.tsx"
Cohesion: 0.13
Nodes (25): BacklogDroppableContainer(), BacklogDroppableContainerProps, BacklogIssueRow(), BacklogIssueRowProps, CreateSprintModal(), CreateSprintModalProps, SprintSection(), SprintSectionProps (+17 more)

### Community 54 - "react"
Cohesion: 0.06
Nodes (49): App(), GuestRoute(), GuestRouteProps, ProtectedRoute(), ProtectedRouteProps, Footer(), Header(), OverviewHeaderProps (+41 more)

### Community 55 - "auth.service.spec.ts"
Cohesion: 0.12
Nodes (5): ForgotPasswordDto, LoginDto, ResetPasswordDto, VerifyOtpDto, class-validator

### Community 56 - "AddProjectMemberDto"
Cohesion: 0.31
Nodes (3): AddProjectMemberDto, TransferOwnershipDto, UpdateProjectMemberRoleDto

### Community 61 - "backend/package.json"
Cohesion: 0.06
Nodes (49): author, description, devDependencies, @nestjs/cli@^12.0.0, @nestjs/mau@^0.2.6, @nestjs/schematics@^12.0.0, @nestjs/testing@^12.0.1, oxlint@^1.58.0 (+41 more)

### Community 63 - "main.tsx"
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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 565 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `CreateProjectPage.tsx`, `frontend/package.json`, `dependencies`, `task.ts`, `ForgotPasswordPage.tsx`, `LandingPage.tsx`, `ref_vitest`, `useOverview.ts`, `LoginPage.tsx`, `projectService.ts`, `VerifyEmailPage.tsx`, `BacklogView.tsx`, `lucide-react`, `main.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `TEXT`, `NUMBER`, `DATE` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CreateProjectPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._
- **Why does `Column` connect `WorkType` to `User`, `users.service.ts`, `projects.service.ts`, `CustomField`, `task.ts`, `Role`, `EmailVerification`, `PasswordResetToken`, `Task`, `Status`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `User`, `users.service.ts`, `dependencies`, `projects.service.ts`, `projects.controller.spec.ts`, `Role`, `sprints.controller.ts`, `main.ts`, `app.module.ts`, `tasks.controller.ts`, `auth.service.spec.ts`, `AppService`, `backend/package.json`, `projects.controller.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.05030525030525031 - nodes in this community are weakly interconnected._