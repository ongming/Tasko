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
- Backend: npm run start:dev | npm run build | npm run test
- Frontend: npm run dev | npm run build
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