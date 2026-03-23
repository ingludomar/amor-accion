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

## Deploy y flujo de ramas

### URLs
- **Producción:** https://amor-accion.vercel.app — rama `main` (NO tocar directamente)
- **Preview:** URL temporal generada por Vercel por cada rama distinta a `main`

### Flujo obligatorio para cada feature

```bash
# 1. Siempre partir desde main actualizado
git checkout main
git pull origin main

# 2. Crear rama para la feature
git checkout -b dev-feature-nombre

# 3. Desarrollar, commitear y publicar
git add .
git commit -m "feat: descripción"
git push origin dev-feature-nombre
# → Vercel genera URL de preview automáticamente

# 4. El usuario verifica en la URL de preview
# 5. Cuando confirma que funciona → merge a producción
git checkout main
git merge dev-feature-nombre
git push origin main
# → Se actualiza amor-accion.vercel.app

# 6. Limpiar rama
git branch -d dev-feature-nombre
git push origin --delete dev-feature-nombre
```

### Reglas importantes
- **Nunca** hacer push directo a `main` con features sin probar
- Cada feature o corrección = su propia rama `dev-feature-*`
- Solo mergear a `main` cuando el usuario confirme que la preview funciona
- La URL de producción `amor-accion.vercel.app` es estable y no cambia

Configurar en Vercel dashboard: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

---

## Estado actual de módulos

| Módulo | Estado | Notas |
|--------|--------|-------|
| Login | ✅ Completo | |
| Dashboard | ✅ Completo | |
| Sedes (Campuses) | ✅ Completo | Logo, ciudad, activar/desactivar |
| Usuarios | ✅ Completo | Roles: admin / coordinador / profesor |
| Estudiantes | ✅ Completo | Foto, grupo, sede, acudientes, carnet con QR |
| Acudientes | ✅ Completo | |
| Grupos | ✅ Completo | Jardín / Infancia / Pre-Juventud, múltiples profesores por grupo |
| Años escolares | ✅ Completo | |
| Configuración | ✅ Completo | |
| **Asistencia** | ⚠️ Incompleto | Página existe. Falta: crear sesiones, tomar asistencia por grupo, ver historial |
| **Reportes** | ❌ Pendiente | No implementado |

## Lo que falta por implementar

1. **Asistencia** — la página existe pero está incompleta. Falta: crear/gestionar sesiones de clase, tomar asistencia de la lista de estudiantes de un grupo, ver historial de asistencia.
2. **Reportes** — ninguno implementado aún. Posibles: asistencia por grupo, por estudiante, por fecha.
