Project rules in this file override any agent persona.
Stack: NestJS, TypeORM, PostgreSQL, React (Vite). Do not introduce Prisma or Next.js-specific APIs.
# Project Management System (Jira/Trello-like, Scrum/Kanban)

## Overview
Web app to manage Workspaces > Projects > Tasks/Sprints, with Board, Calendar,
Gantt views, comments/attachments, and AI document analysis (upload a document,
AI proposes Tasks, member reviews and confirms).

## Stack
- Backend: NestJS (TypeScript), PostgreSQL, TypeORM, JWT, WebSocket, REST (JSON)
- Frontend: Next.js (React). Language: <JS or TS, fill in>
- Backend and frontend are separate projects talking only via REST + WebSocket.

## Role
Act as a senior NestJS developer. Use NestJS-first patterns, not generic Express
approaches. Prefer the simplest solution that fits the existing code.

## Backend structure
- Feature modules in src/modules/<name>/ with: module, controller, service,
  entities/, dto/
- Shared guards, interceptors, filters, decorators in src/common/
- Modules: auth (QLTK), workspace (QLWS), project (QLDA), task (QLT),
  view (QLV), collaboration (QLC), project-config (QLCF),
  ai-document (AIDOC), settings-permission (QLQ)
- Use Nest CLI to generate: nest g module / service / controller

## Code standards
- Never instantiate services or repositories with `new`. Use constructor
  injection. Register in `providers`; share across modules via `exports`+`imports`.
- Controllers only handle HTTP and call services. Business logic lives in services.
- Every request body uses a DTO class with class-validator decorators.
  ValidationPipe is global (whitelist: true, transform: true).
- Use TypeORM Repository via @InjectRepository(Entity). No raw SQL unless required.
- Define relations, unique and foreign key constraints on entities.
- Add indexes on frequently queried columns.
- Throw Nest exceptions (NotFoundException, ForbiddenException...), never
  return error objects manually.

## Auth & permissions
- JWT auth via JwtAuthGuard. Authorization via RolesGuard (RBAC).
- Roles: Guest, User, Member, Owner (project), Workspace Admin, Admin, Viewer.
- Permission checks happen on the backend only. Never trust role/user id sent
  by the client; read them from the verified JWT (request.user).
- Destructive actions (delete Workspace/Project/Task) require confirmation
  and a permission check.

## API conventions
- Success: { statusCode, message, data } via TransformInterceptor.
- Errors: same shape with data: null via a global exception filter.
- Endpoints are plural nouns: /workspaces, /projects, /tasks.
- Real-time updates (task changes, comments, notifications) go through WebSocket.

## Commands
- Backend (chạy trong thư mục /backend): npm run start:dev | npm run build | npm run test
- Frontend (chạy trong thư mục /frontend): npm run dev | npm run build
- Migrations: <fill in your command>

## Do NOT
- Do not add new libraries without asking.
- Do not use Prisma, Mongoose or any ORM other than TypeORM.
- Do not put secrets in code; use .env and ConfigService.
- Do not rewrite or rename existing files unless asked.
- Do not skip validation or permission checks to make something "work".
- Keep changes small. Explain briefly what you changed.

## Working style
- For non-trivial features, propose a short plan first, then implement.
- Match existing naming and style in the file you are editing.
- After finishing, list the files changed and how to test.

## Frontend rules

### Stack
- React + TypeScript (Vite), react-router-dom, Tailwind CSS, Zustand, lucide-react,
  @react-oauth/google. Do not introduce Next.js-specific APIs unless the project migrates.
- UI text for users is Vietnamese. Identifiers are English. Comments: short, Vietnamese OK.

### Structure
- `src/pages/<area>/`      route-level pages only
- `src/components/<area>/` reusable UI (e.g. components/auth/AuthLayout, TextField, AlertBanner)
- `src/hooks/`             logic hooks (e.g. useLogin)
- `src/services/`          API calls only, one file per backend module
- `src/stores/`            Zustand stores
- `src/types/`             shared types (User, ApiError, ...). Import types from here,
  never from a store or a page, to avoid circular imports.

### Pages
- A page composes components and calls hooks. It contains NO API calls, NO business logic,
  and no long inline JSX blocks.
- Extract a component when the same UI appears 2+ times, or the page exceeds ~150 lines.
- Before writing new UI, check `components/` for an existing component and reuse it.
  Auth pages must use AuthLayout, TextField, PasswordInput, AlertBanner.
- Do not leave unused state, imports, or components (e.g. a "remember me" checkbox
  that is never sent to the backend, an unused icon component).

### State and errors
- Prefer one `status: 'idle' | 'loading' | 'error' | 'success'` over several booleans
  that can contradict each other.
- API client throws a typed `ApiError { statusCode, code, message }`.
  Branch on `code` or `statusCode`, NEVER on message text.
  Avoid `catch (err: any)`; use `unknown` and narrow with `instanceof ApiError`.
- Success and failure messages need an explicit flag; never show a failure in a success banner.
- Never use `alert()`, `confirm()`, or `prompt()`. Use in-app components.

### Forms and accessibility
- Every input has a `<label htmlFor>` bound to the input `id`.
- Set `autoComplete` (`email`, `current-password`, `new-password`, `one-time-code`).
- Icon-only buttons need `aria-label`.
- Disable ALL submit paths while a request is running (including the Google button).
- Validate on the client for UX only; the backend is the source of truth.

### API and auth
- All HTTP goes through `lib/api`. Components never call fetch/axios directly.
- Services return the already-unwrapped `data` (backend responses are `{ statusCode, message, data }`).
- JSON fields are camelCase and must match backend DTOs exactly.
- Name request/response types `XxxPayload` / `XxxResponse`, not `Dto` (Dto is a backend term).
- Access token: in memory only (Zustand, no persist). NEVER store tokens in localStorage
  or sessionStorage. Refresh token lives in an httpOnly cookie; send `credentials: 'include'`.
- On 401: refresh once (single in-flight refresh), retry the request; never refresh on
  `/auth/login` or `/auth/refresh` themselves.
- Never log or store passwords, tokens, or OTP codes.

### Navigation
- After login, return to the originally requested route (`location.state.from`),
  default to the workspace page.
- Logged-in users visiting login/register are redirected away.

### Styling
- Use Tailwind theme tokens (`primary`, `surface`, ...) defined in the Tailwind config.
  Do not repeat raw hex colors across files.
- Mobile first and responsive. Reuse existing spacing and radius conventions.

### Do NOT
- Do not add dependencies without asking. Pin versions (no `^`) and keep the lockfile committed.
- Do not rename or restructure existing files unless asked.
- Do not copy-paste a block that already exists elsewhere; extract it.
- Keep changes small and list the files changed at the end.