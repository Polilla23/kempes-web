# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kempes Master League - Football league management system with multi-tier leagues, cups with group stages and knockouts. Monorepo with separate `backend/` and `frontend/` directories.

## Commands

### Development (run from root)
```bash
npm run dev              # Backend + Frontend concurrently
npm run dev:backend      # Solo backend (localhost:3000)
npm run dev:frontend     # Solo frontend (localhost:5173)
```

### Backend (run from backend/)
```bash
npm run dev              # Start with ts-node + nodemon
npm run test             # Run Jest tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage
npm run seed             # Seed database
```

### Frontend (run from frontend/)
```bash
npm run dev              # Vite dev server
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint (v9 flat config)
npm run preview          # Preview production build
```

### Database (run from root)
```bash
npm run migrate          # Run Prisma migrations
npm run generate         # Regenerate Prisma client
```

### Running a single backend test
```bash
cd backend && npx jest --testPathPattern="clubs" --no-coverage
```

### API Docs
Swagger UI available at `http://localhost:3000/apidocs` when backend is running.

## Stack

- **Backend**: Fastify v5 + TypeScript, Prisma + PostgreSQL, Awilix DI, JWT (httpOnly cookies), Zod validation
- **Frontend**: React 19 + TypeScript, TanStack Router (file-based), Shadcn/Radix UI + Tailwind CSS, React Hook Form + Zod, i18next (ES/EN)

## Architecture

### Backend: Controller → Service → Repository

```
backend/src/features/[feature]/
├── [feature].controller.ts    # HTTP handlers, validates input, uses mapper for response
├── [feature].service.ts       # Business logic
├── [feature].repository.ts    # Data access (Prisma)
├── [feature].routes.ts        # Route definitions
├── [feature].schema.ts        # Swagger schemas
├── [feature].errors.ts        # Custom errors
└── interfaces/
    └── I[Feature]Repository.ts
```

**Key wiring files:**
- DI Container: `backend/src/features/core/container/index.ts` — register repository, controller, service as singletons
- Routes registry: `backend/src/features/api/routes.ts` — all routes under `/api/v1` prefix
- Mappers: `backend/src/mappers/[entity].mapper.ts` — static `toDTO()`, `toDTOArray()`, `toPaginatedDTO()` methods
- Core barrel export: `backend/src/features/core/index.ts` — re-exports Response helpers, errors, env config, mappers, types

### Backend Conventions

**Naming:**
| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `ClubController` |
| Interfaces | `I` prefix | `IClubRepository` |
| Methods | camelCase | `findAllClubs` |
| Errors | `[Feature]Error` | `ClubNotFoundError` |
| Files | kebab-case | `clubs.controller.ts` |

**Validation** — use `Validator` from `@/features/utils/validation`:
```typescript
const validId = Validator.uuid(id)
const validName = Validator.string(name, 1, 100)
```

**Responses** — use helpers from `@/features/core`:
```typescript
import { Response } from '@/features/core'
return Response.success(reply, data, 'Message')
return Response.created(reply, data, 'Created')
return Response.notFound(reply, 'Entity', id)
```

**Error classes** (from `@/features/core`): BadRequestError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, InternalServerError.

### Backend Test Configuration

- Framework: Jest with ts-jest
- Tests live in `backend/src/features/[feature]/__tests__/*.test.ts`
- Path alias `@/` mapped to `<rootDir>/src/`
- Coverage excludes `.d.ts`, `.interface.ts`, `server.ts`

### Frontend Architecture

```
frontend/src/
├── routes/          # TanStack Router (file-based, auto code-splitting)
├── services/        # API service layer (static methods wrapping fetch)
├── components/ui/   # Shadcn components
├── components/table/# Data table components
├── context/         # React Context (UserProvider, ThemeProvider)
├── lib/             # Utilities (form-schemas.ts, utils.ts)
├── i18n/locales/    # en/ and es/ JSON translation files
└── types/           # Shared TypeScript types
```

**Vite config** (`frontend/vite.config.ts`): Uses `@tanstack/router-plugin/vite` with autoCodeSplitting. Route file ignore patterns exclude `_components/`, form files, and layout files from route generation.

**API service pattern** (`frontend/src/services/api.ts`):
- Base URL: `http://localhost:3000`, credentials: 'include'
- Methods: `api.get<T>()`, `api.post<T>()`, `api.patch<T>()`, `api.delete<T>()`
- 401 responses trigger `onUnauthorized` callback
- Services are static classes wrapping these calls, e.g. `ClubService.getAll()`

**i18n** — register new namespaces in `frontend/src/i18n/config.ts` with imports for both `en` and `es` locales.

**Root layout** (`frontend/src/routes/__root.tsx`): Wraps app in UserProvider → ThemeProvider → SidebarProvider.

## Database (Prisma)

Schema: `backend/prisma/schema.prisma`

**Conventions:**
- IDs: UUID with `@id @default(uuid())`
- Field names: camelCase in code, snake_case in DB with `@map()`
- Table names: plural with `@@map("table_name")`
- Relations: `onDelete: Cascade` where appropriate

**TypeScript path alias:** `@/` → `backend/src/` (configured in tsconfig.json and jest.config.js)

## Environment Variables

Backend `.env` requires:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — minimum 32 chars
- `FASTIFY_COOKIE_SECRET` — minimum 16 chars
- `FRONT_URL`, `BACK_URL` — CORS origins
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — file storage

Frontend `.env` requires:
- `VITE_API_URL=http://localhost:3000`

## Reference Files

When creating new features, use as templates:
- **Backend feature**: `backend/src/features/clubs/`
- **Mapper**: `backend/src/mappers/club.mapper.ts`
- **Frontend page**: `frontend/src/routes/management/clubs/`
- **Frontend service**: `frontend/src/services/club.service.ts`
- **i18n**: `frontend/src/i18n/locales/es/clubs.json`
