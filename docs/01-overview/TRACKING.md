# TRACKING DE PROGRESO - Amor Acción

> Fuente de verdad del estado actual del proyecto. Actualizar al finalizar cada feature.
> **Última actualización:** 27 Mar 2026

---

## Estado General

```
╔══════════════════════════════════════════════════════════════╗
║  AMOR ACCIÓN - SISTEMA DE ASISTENCIA                         ║
║  Progreso General: 88%                                       ║
║  Estado: 🟢 En Producción / Desarrollo activo               ║
║  URL Producción: https://amor-accion.vercel.app              ║
║  Rama principal: main                                        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Módulos implementados

| Módulo          | Estado        | Notas |
|-----------------|---------------|-------|
| Login           | ✅ Completo   | Supabase Auth |
| Dashboard       | ✅ Completo   | Datos reales: stats, sesiones, ausencias |
| Sedes           | ✅ Completo   | Logo, ciudad, activar/desactivar |
| Usuarios        | ✅ Completo   | RBAC, username auto-generado |
| Roles/Permisos  | ✅ Completo   | Matriz por módulo, editable |
| Estudiantes     | ✅ Completo   | Foto, grupo, sede, acudientes, carnet QR |
| Acudientes      | ✅ Completo   | |
| Familias        | ✅ Completo   | |
| Grupos          | ✅ Completo   | Jardín / Infancia / Pre-Juventud |
| Temas           | ✅ Completo   | Por grupo, marcar como realizado |
| Años escolares  | ✅ Completo   | |
| Configuración   | ✅ Completo   | |
| Asistencia      | ✅ Completo   | Tomar asistencia + Historial |
| **Reportes**    | ❌ Pendiente  | Ver BACKLOG |

---

## Features completados (en orden)

| # | Feature | Rama | Fecha |
|---|---------|------|-------|
| 1 | RBAC - Roles y permisos | dev-feature-restrict-login | Mar 2026 |
| 2 | Username auto-generado en usuarios | dev-feature-auto-username | Mar 2026 |
| 3 | Historial de asistencia + Sidebar nav | dev-feature-historial-asistencia | Mar 2026 |
| 4 | Dashboard con datos reales | dev-feature-dashboard-real | Mar 2026 |
| 5 | Cambio de contraseña | dev-feature-cambio-password | Mar 2026 |
| 6 | Sistema de calificaciones + escala parametrizable | dev-feature-calificaciones | Mar 2026 |
| 7 | Reportes + exportación PDF + sin registro | dev-feature-reportes | Mar 2026 |

---

## Backlog pendiente

Ver [BACKLOG.md](./BACKLOG.md) para el detalle completo.

| # | Feature | Prioridad |
|---|---------|-----------|
| 8 | Escaneo QR en asistencia | 🟡 Media |
| 9 | Alertas de inasistencia | 🟢 Baja |
| 10 | PWA instalable | 🟢 Baja |

---

## Infraestructura

| Componente | Detalle |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email confirmation desactivado) |
| Storage | Supabase Storage (logos, fotos) |
| Deploy | Vercel — auto-deploy en push a `main` |
| Preview | Vercel genera URL por cada rama `dev-feature-*` |

---

## Usuarios del sistema

| Email | Rol | Estado |
|---|---|---|
| admin@amoraccion.com | admin | ✅ Activo |
| almicar.pertuz@amoraccion.com | admin | ✅ Activo |
| lourdes.escalante@amoraccion.com | profesor | ✅ Activo |
| alberto.gomez@amoraccion.com | profesor | ✅ Activo |
| julisa.gonzalez@amoraccion.com | profesor | ✅ Activo |
| mariaines.marulanda@amoraccion.com | profesor | ✅ Activo |
| iracema.polo@amoraccion.com | profesor | ✅ Activo |

**Contraseña inicial todos:** `Amor2026!`

---

## Base de datos (tablas activas)

- `profiles` — usuarios del sistema
- `roles` — roles del sistema
- `role_permissions` — permisos por rol y módulo
- `campuses` — sedes
- `students` — estudiantes
- `guardians` — acudientes
- `student_guardians` — relación estudiante-acudiente
- `families` — grupos familiares
- `student_families` — relación estudiante-familia
- `guardian_families` — relación acudiente-familia
- `groups` — grupos de clases
- `topics` — temas por grupo
- `class_sessions` — sesiones de clase
- `attendance_records` — registros de asistencia
- `school_years` — años escolares
