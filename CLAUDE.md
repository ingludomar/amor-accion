# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-campus school attendance management system with JWT authentication, role-based access control, and comprehensive student/class management. Built with FastAPI (backend), React + TypeScript (frontend), PostgreSQL database, and Docker containerization.

**Current Status**: MVP 80% complete - Auth, Campus management, Users/Teachers module (backend + frontend), and database fully functional. Complete CRUD interface for user management with roles and campus assignments.

## Quick Start Commands

### Local Development with Docker

```bash
# Start all services (database, backend, frontend)
cd /Users/luisdominguez/attendance-system
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart specific service after code changes
docker compose restart backend
docker compose restart frontend

# Stop all services
docker compose stop

# Remove containers and volumes (WARNING: deletes data)
docker compose down -v
```

### Database Migrations

```bash
# Generate new migration after model changes
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker compose exec backend alembic upgrade head

# Rollback one migration
docker compose exec backend alembic downgrade -1

# View migration history
docker compose exec backend alembic history
```

### Seeding and Database Access

```bash
# Run initial seed (creates roles, admin user, demo campus)
docker compose exec backend python scripts/seed_initial.py

# Direct database access
docker compose exec db psql -U postgres -d attendance_db

# Check tables
docker compose exec db psql -U postgres -d attendance_db -c "\dt"
```

### Testing API

```bash
# Health check
curl http://localhost:8000/health

# Interactive API docs (Swagger)
open http://localhost:8000/docs

# Test login and get token
curl -X POST 'http://localhost:8000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@colegio.edu","password":"changeme123"}'
```

## Architecture Overview

### Backend Architecture (FastAPI)

**Layered Architecture Pattern:**
- **API Layer** (`app/api/v1/`): FastAPI routers, request/response handling
- **Service Layer** (`app/services/`): Business logic, orchestration
- **Repository Layer** (`app/repositories/`): Data access abstraction
- **Models** (`app/models/`): SQLAlchemy ORM models (database schema)
- **Schemas** (`app/schemas/`): Pydantic models (validation, serialization)

**Key Concepts:**
1. **Repository Pattern**: All database queries go through repositories that extend `BaseRepository`
2. **Service Layer**: Contains business logic, calls multiple repositories, handles transactions
3. **Dependency Injection**: FastAPI `Depends()` for database sessions, authentication
4. **JWT Authentication**: Token-based auth with access/refresh tokens in `core/security.py`
5. **RBAC**: Role-Based Access Control via `core/deps.py` decorators (`get_current_user`, `require_permission`)

**Authentication Flow:**
1. Login → `auth.py` → `AuthService` validates credentials
2. Returns JWT access_token + refresh_token
3. Protected endpoints use `Depends(get_current_user)` to validate token
4. Token decoded in `core/deps.py`, user loaded from database
5. Permissions checked via user roles (stored in `role.permissions` JSON field)

**Database Models (11 main models):**
- `User`, `Role`, `UserRole` - Authentication & RBAC
- `Campus`, `UserCampus` - Multi-campus support
- `Teacher`, `Student`, `Guardian` - Core entities
- `SchoolYear`, `Period`, `CourseGroup`, `Subject` - Academic structure
- `Enrollment`, `Transfer` - Student-course relationships
- `ClassSession`, `AttendanceRecord` - Attendance tracking

### Frontend Architecture (React + TypeScript)

**Structure:**
- **Pages** (`src/pages/`): Route-level components (Login, Dashboard, Campuses, Users)
- **Components** (`src/components/`): Reusable UI components (Layout, ProtectedRoute)
- **State Management** (`src/store/`): Zustand stores with persistence
- **API Client** (`src/lib/api.ts`): Axios instance with interceptors, typed endpoints
- **Routing**: React Router with protected routes

**Implemented Pages:**
- ✅ **Login** - Authentication with JWT
- ✅ **Dashboard** - Overview with stats and quick actions
- ✅ **Campuses** - CRUD for school campuses
- ✅ **Users** - Complete user management (create, edit, assign roles/campuses, deactivate)
- ⏳ **Students** - Pending implementation
- ⏳ **Attendance** - Pending implementation

**Key Patterns:**
1. **API Integration**: Centralized axios instance with JWT token injection in interceptors
2. **State Persistence**: Zustand + localStorage for auth state (survives page refresh)
3. **Protected Routes**: `ProtectedRoute` wrapper checks `isAuthenticated` before rendering
4. **TanStack Query**: Data fetching, caching, mutations for server state
5. **Tailwind CSS**: Utility-first styling, light mode forced in `index.css`

### Database Schema

**Multi-tenancy via Campus:**
- Users can belong to multiple campuses (many-to-many via `user_campus`)
- Students belong to one campus (filtered by user permissions)
- All queries should be campus-aware for non-superusers

**Audit Trail:**
- `AttendanceChangeLog` tracks all attendance modifications
- Base model has `created_at`, `updated_at` timestamps
- Soft deletes via `is_active` field (never hard delete)

## Current Issues & Known Bugs

### ✅ FIXED - Backend Syntax Errors (2026-01-23)

**File**: `backend/app/api/v1/users.py`
**Issue**: Multiple syntax errors from automated script that incorrectly added `meta` parameters
**Status**: **RESOLVED** - All 6 syntax errors fixed on 2026-01-23
- Fixed lines: 100, 140, 208, 272, 310, 332
- All `APIResponse()` calls now follow the correct pattern:
```python
return APIResponse(
    success=True,
    action="action.name",
    message="Message text",
    data={...},
    meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
)
```
- Backend restarts correctly with hot-reload enabled
- Users API endpoints now functional

### Development Notes

**When Adding New API Endpoints:**
1. Create model in `app/models/`
2. Create Pydantic schemas in `app/schemas/`
3. Create repository in `app/repositories/` extending `BaseRepository`
4. Create service in `app/services/` for business logic
5. Create API router in `app/api/v1/`
6. Register router in `app/main.py`
7. Generate migration: `alembic revision --autogenerate`
8. Apply migration: `alembic upgrade head`

**When Adding Frontend Pages:**
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Layout.tsx`
4. Create API functions in `src/lib/api.ts`
5. Use TanStack Query for data fetching (`useQuery`, `useMutation`)

**Docker Compose Configuration:**
- Backend uses `Dockerfile.simple` (WeasyPrint dependencies removed due to build issues)
- Frontend uses standard Node Dockerfile
- Hot reload enabled for both (volumes mounted)
- Environment variables in `docker-compose.yml` override `.env` files

## URLs & Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Database**: localhost:5432 (postgres/changeme123)

**Default Credentials:**
- Email: `admin@colegio.edu`
- Password: `changeme123`
- Role: SuperAdmin
- Campus: Sede Principal

## Important Files

- `docker-compose.yml` - Service orchestration (uses Dockerfile.simple for backend)
- `backend/app/main.py` - FastAPI app initialization, router registration
- `backend/app/core/config.py` - Settings with Pydantic, env var handling
- `backend/app/core/deps.py` - Auth dependencies (`get_current_user`, RBAC)
- `backend/app/core/security.py` - JWT + bcrypt password hashing
- `backend/alembic/env.py` - Migration configuration
- `frontend/src/store/authStore.ts` - Authentication state management
- `frontend/src/lib/api.ts` - API client with interceptors
- `scripts/seed_initial.py` - Initial data (4 roles, admin user, demo campus)

## Development Workflow

**Typical Feature Addition:**
1. Define database model and relationships
2. Generate migration and apply
3. Create Pydantic schemas for validation
4. Implement repository methods
5. Write service layer with business logic
6. Create API endpoints
7. Add frontend API client functions
8. Build UI components
9. Test end-to-end via Swagger and browser

**Code Style:**
- Backend: Follow existing patterns (services call repos, no direct DB in endpoints)
- Frontend: Functional components, hooks, TypeScript strict mode
- All API responses use `APIResponse` wrapper with `meta` field
- Use `datetime.utcnow()` for timestamps (not `datetime.now()`)

## Deployment

System is deployment-ready for Render.com or similar PaaS:
- PostgreSQL database (Render managed)
- Backend web service (FastAPI/Uvicorn)
- Frontend static site (Vite build)

See `DEPLOY_AHORA.md` for production deployment guide.
