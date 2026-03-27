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

### Cómo obtener la URL de preview de Vercel

Después de hacer `git push origin dev-feature-*`, ejecutar este comando para obtener la URL:

```bash
# 1. Obtener el ID del deployment de preview más reciente
curl -s "https://api.github.com/repos/ingludomar/amor-accion/deployments?per_page=5&environment=Preview" \
  | grep '"id"' | head -1

# 2. Con ese ID, obtener la URL
curl -s "https://api.github.com/repos/ingludomar/amor-accion/deployments/{ID}/statuses" \
  | grep "target_url"
```

O en una sola línea (reemplaza `{ID}` con el resultado del primer comando):
```bash
ID=$(curl -s "https://api.github.com/repos/ingludomar/amor-accion/deployments?per_page=3&environment=Preview" | grep -m1 '"id":' | grep -o '[0-9]*') && curl -s "https://api.github.com/repos/ingludomar/amor-accion/deployments/$ID/statuses" | grep "target_url"
```

**Nota:** Requiere que `vercel.json` tenga `"github": { "enabled": true }`. Vercel tarda ~1-2 minutos en crear el deployment tras el push.

---

## Estado actual de módulos

> Última actualización: 27 Mar 2026 — Ver [TRACKING.md](docs/01-overview/TRACKING.md) para detalle completo.

| Módulo | Estado | Notas |
|--------|--------|-------|
| Login | ✅ Completo | Supabase Auth |
| Dashboard | ✅ Completo | Datos reales: stats, sesiones, ausencias |
| Sedes (Campuses) | ✅ Completo | Logo, ciudad, activar/desactivar |
| Usuarios | ✅ Completo | RBAC, username auto-generado |
| Roles/Permisos | ✅ Completo | Matriz por módulo, editable |
| Estudiantes | ✅ Completo | Foto, grupo, sede, acudientes, carnet con QR |
| Acudientes | ✅ Completo | |
| Familias | ✅ Completo | |
| Grupos | ✅ Completo | Jardín / Infancia / Pre-Juventud |
| Temas | ✅ Completo | Por grupo, marcar como realizado |
| Años escolares | ✅ Completo | |
| Configuración | ✅ Completo | |
| Asistencia | ✅ Completo | Tomar asistencia + Historial por grupo |
| **Reportes** | ❌ Pendiente | Ver BACKLOG |

## Lo que falta por implementar

Ver [BACKLOG.md](docs/01-overview/BACKLOG.md) para descripción detallada de cada feature.

1. **Cambio de contraseña** (🔴 Alta) — cada usuario cambia su propia contraseña
2. **Sistema de calificaciones** (🔴 Alta) — notas por estudiante por tema
3. **Reportes + exportación PDF** (🟡 Media) — asistencia por grupo/estudiante/fecha
4. **Escaneo QR en asistencia** (🟡 Media) — usar cámara para marcar presentes
5. **Alertas de inasistencia** (🟢 Baja) — notificar cuando supera umbral de ausencias
6. **PWA instalable** (🟢 Baja) — instalar app en celular como nativa
