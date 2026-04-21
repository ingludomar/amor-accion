# TRACKING DE PROGRESO - Amor Acción

> Fuente de verdad del estado actual del proyecto. Actualizar al finalizar cada feature.
> **Última actualización:** 28 Mar 2026 (Feature 15)

---

## Estado General

```
╔══════════════════════════════════════════════════════════════╗
║  AMOR ACCIÓN - SISTEMA DE ASISTENCIA                         ║
║  Progreso General: 100%                                      ║
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
| Reportes        | ✅ Completo   | PDF export + sin registro |
| Buzón sugerencias | ✅ Completo | Modal para todos, gestión para admin |

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
| 11 | Buzón de sugerencias | dev-feature-buzon-sugerencias | Mar 2026 |
| 13 | Escaneo QR en asistencia | dev-feature-qr-asistencia | Mar 2026 |
| 14 | Alertas de inasistencia (consecutivas + anual) | dev-feature-alertas | Mar 2026 |
| 15 | PWA instalable | dev-feature-pwa | Mar 2026 |
| 16 | Login con username | dev-feature-login-username | Abr 2026 |
| 17 | Boletín de calificaciones PDF | dev-feature-boletin-pdf | Abr 2026 |
| 18 | WhatsApp avisar acudientes + registro | dev-feature-whatsapp-acudiente | Abr 2026 |
| 19 | Calendario de actividades y clases | dev-feature-calendario | Abr 2026 |

---

## Backlog pendiente

Ver [BACKLOG.md](./BACKLOG.md) para el detalle completo.

| # | Feature | Prioridad |
|---|---------|-----------|
| ~~8~~ | ~~Escaneo QR en asistencia~~ | ✅ Completo |
| ~~9~~ | ~~Alertas de inasistencia~~ | ✅ Completo |
| ~~10~~ | ~~PWA instalable~~ | ✅ Completo |
| 11 | ~~Buzón de sugerencias~~ | ✅ Completo |

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
- `grades` — calificaciones por estudiante y tema
- `grade_scale` — escala de calificaciones parametrizable
- `suggestions` — buzón de sugerencias
