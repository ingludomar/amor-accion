# CLAUDE.md

Guía para Claude Code en este repositorio.

## Descripción del proyecto

Sistema de gestión de asistencia estudiantil para **Amor Acción**, una ONG que trabaja con niños en situación vulnerable. Permite a voluntarios registrar estudiantes, acudientes, familias y tomar asistencia por sede.

**Arquitectura:** React + TypeScript + Vite (frontend) · Supabase (base de datos, auth, storage) · Vercel (deploy)

**No hay backend propio.** Toda la lógica de datos va directo a Supabase desde el frontend.

---

## Estructura del proyecto

```
AttendanceSystem/
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── pages/             # Páginas de la app
│   │   ├── components/        # Componentes reutilizables
│   │   ├── lib/               # Clientes y APIs
│   │   │   ├── supabaseClient.ts   # Cliente Supabase
│   │   │   ├── supabaseApi.ts      # Todas las llamadas a BD (fuente de verdad)
│   │   │   ├── storageApi.ts       # Subida de archivos (logos, fotos)
│   │   │   └── api.ts              # Re-exporta todo + tipos adicionales
│   │   └── store/
│   │       └── authStore.ts        # Estado de autenticación (Zustand)
├── database/                  # Scripts SQL para configurar Supabase
│   ├── supabase-schema.sql         # Schema completo (ejecutar primero)
│   ├── supabase-storage-setup.sql  # Configuración de buckets
│   └── migration-*.sql             # Migraciones incrementales
├── vercel.json                # Configuración de deploy
└── CLAUDE.md
```

---

## Páginas implementadas

| Ruta | Página | Estado |
|------|--------|--------|
| `/login` | Login | ✅ Funcional |
| `/dashboard` | Dashboard | ✅ Funcional |
| `/campuses` | Sedes | ✅ Funcional |
| `/users` | Usuarios | ✅ Funcional |
| `/students` | Estudiantes | ✅ Funcional |
| `/families` | Familias | ✅ Funcional |
| `/guardians` | Acudientes | ✅ Funcional |
| `/school-years` | Años escolares | ✅ Funcional |
| `/attendance` | Asistencia | ⚠️ Incompleto |
| `/settings` | Configuración | ✅ Funcional |

---

## Tablas en Supabase

- `campuses` — Sedes de la organización
- `students` — Estudiantes (código generado automático)
- `guardians` — Acudientes/padres
- `student_guardians` — Relación estudiante-acudiente (many-to-many)
- `families` — Grupos familiares
- `student_families` — Relación estudiante-familia
- `guardian_families` — Relación acudiente-familia
- `school_years` — Años escolares por sede
- `class_sessions` — Sesiones de clase
- `attendance_records` — Registros de asistencia
- `profiles` — Perfiles de usuarios (ligado a Supabase Auth)

---

## Comandos de desarrollo

```bash
# Instalar dependencias
cd frontend && npm install

# Desarrollo local
cd frontend && npm run dev
# → http://localhost:5173

# Build de producción
cd frontend && npm run build

# Tests
cd frontend && npm test
```

---

## Variables de entorno

Archivo `frontend/.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

---

## Patrones de código

**Llamadas a datos:** Siempre usar los objetos API de `supabaseApi.ts` (campusAPI, studentAPI, etc.). No hacer llamadas directas a `supabase` desde los componentes.

**Estado de auth:** Usar `authStore` (Zustand). El store persiste en localStorage.

**Rutas protegidas:** Envolver con `<ProtectedRoute>` en `App.tsx`.

**Subida de archivos:** Usar `storageApi.ts` para logos y fotos de estudiantes.

**Fetch de datos:** Usar TanStack Query (`useQuery`, `useMutation`) en las páginas.

---

## Deploy

El proyecto está conectado a Vercel. El deploy se activa automáticamente con cada push a `main`.

Configurar en Vercel dashboard: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

---

## Lo que falta por implementar

1. **Asistencia** — la página existe pero está incompleta. Falta: crear/gestionar sesiones de clase, tomar asistencia de la lista de estudiantes de un grupo, ver historial.
2. **Grupos/Clases** — no existe todavía. Necesita tabla `course_groups` en Supabase + página.
3. **Reportes** — ninguno implementado aún.
