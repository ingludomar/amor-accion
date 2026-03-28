# BACKLOG - Amor Acción

> Registro completo de todos los features del proyecto. Ver [TRACKING.md](./TRACKING.md) para el estado general.
> **Última actualización:** 28 Mar 2026

---

## Resumen de features

| # | Feature | Estado | Rama | Fecha |
|---|---------|--------|------|-------|
| 1 | RBAC — Roles y permisos por módulo | ✅ Completo | dev-feature-restrict-login | Mar 2026 |
| 2 | Username auto-generado en usuarios | ✅ Completo | dev-feature-auto-username | Mar 2026 |
| 3 | Historial de asistencia + navegación sidebar | ✅ Completo | dev-feature-historial-asistencia | Mar 2026 |
| 4 | Dashboard con datos reales | ✅ Completo | dev-feature-dashboard-real | Mar 2026 |
| 5 | Cambio de contraseña | ✅ Completo | dev-feature-cambio-password | Mar 2026 |
| 6 | Sistema de calificaciones + escala parametrizable | ✅ Completo | dev-feature-calificaciones | Mar 2026 |
| 7 | Reportes + exportación PDF + sin registro | ✅ Completo | dev-feature-reportes | Mar 2026 |
| 8 | Escaneo QR en asistencia | ✅ Completo | dev-feature-qr-asistencia | Mar 2026 |
| 9 | Alertas de inasistencia (consecutivas + anual) | ✅ Completo | dev-feature-alertas | Mar 2026 |
| 10 | PWA instalable | ✅ Completo | dev-feature-pwa | Mar 2026 |
| 11 | Buzón de sugerencias | ✅ Completo | dev-feature-buzon-sugerencias | Mar 2026 |

---

## Flujo de trabajo obligatorio para cada feature

```bash
# 1. Partir desde main actualizado
git checkout main && git pull origin main

# 2. Crear rama
git checkout -b dev-feature-nombre

# 3. Desarrollar + commitear
git add . && git commit -m "feat: descripción"
git push origin dev-feature-nombre
# → Vercel genera URL de preview automáticamente

# 4. Usuario verifica en la URL de preview

# 5. Cuando confirma → merge a producción
git checkout main
git merge dev-feature-nombre
git push origin main

# 6. Limpiar rama
git branch -d dev-feature-nombre
git push origin --delete dev-feature-nombre
```

**Regla:** Cada feature termina con un commit de docs. Nunca push directo a `main`.

---

## Feature 1 — RBAC: Roles y permisos por módulo ✅

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-restrict-login`

### Descripción
Sistema de control de acceso basado en roles. Cada rol tiene permisos configurables (ver, crear, editar, eliminar) por módulo.

### Alcance
- Tabla `role_permissions`: rol + módulo + can_view/can_create/can_edit/can_delete
- Hook `usePermission(module)` → devuelve `{ canView, canCreate, canEdit, canDelete }`
- Página `/roles` (solo admin): matriz visual editable de permisos
- Sidebar filtra items según permisos del usuario
- Solo `admin@amoraccion.com` puede acceder inicialmente
- Rutas protegidas con `<ProtectedRoute module="...">` en App.tsx

---

## Feature 2 — Username auto-generado ✅

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-auto-username`

### Descripción
Al crear un usuario, el sistema genera automáticamente un username a partir del nombre y apellido.

### Alcance
- Formato: `nombre.apellido` (minúsculas, sin tildes)
- Si ya existe, agrega sufijo numérico: `nombre.apellido2`
- Se muestra en la ficha del usuario
- No editable por el usuario (solo admin puede modificar)

---

## Feature 3 — Historial de asistencia + navegación sidebar ✅

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-historial-asistencia`

### Descripción
Vista de historial de sesiones pasadas con sus registros de asistencia, accesible desde la página de Asistencia.

### Alcance
- Tabs en `/attendance`: "Tomar asistencia" | "Historial"
- Historial: lista de sesiones pasadas filtrable por grupo y fecha
- Al abrir una sesión: ver lista completa con estado de cada estudiante
- Sidebar con todos los módulos navegables

---

## Feature 4 — Dashboard con datos reales ✅

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-dashboard-real`

### Descripción
Dashboard principal con estadísticas reales del sistema, no datos de muestra.

### Alcance
- Tarjetas: total estudiantes activos, sesiones del mes, % asistencia promedio
- Gráfico de tendencia de asistencia (últimas semanas)
- Top 5 estudiantes con más ausencias
- Sesiones recientes
- Datos en tiempo real desde Supabase

---

## Feature 5 — Cambio de contraseña ✅

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-cambio-password`

### Descripción
Cada usuario puede cambiar su propia contraseña desde la app, sin depender del admin.

### Alcance
- Sección en `/settings`
- Campos: nueva contraseña + confirmar contraseña
- Mínimo 8 caracteres
- Usa `supabase.auth.updateUser({ password })`
- Feedback visual de éxito o error

### No incluye
- Reset por email (Supabase ya lo maneja en login)
- Admin cambiando contraseña de otro usuario

---

## Feature 6 — Sistema de calificaciones ✅

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-calificaciones`

### Descripción
Registrar una calificación por estudiante por tema. La escala es parametrizable desde Configuración.

### Alcance
- Tabla `grades`: `student_id`, `topic_id`, `score (1-5)`, `notes`, `UNIQUE(student_id, topic_id)`
- Tabla `grade_scale`: score → label + color (configurable)
- Botón ⭐ en temas marcados como realizados → modal de calificación grupal
- Ficha del estudiante: sección "Calificaciones" con historial por tema
- Página Configuración: editor de escala (etiqueta + color por cada puntaje 1-5)
- Hook `useGradeScale()` compartido entre Topics, Students y Settings

### Escala por defecto
| Puntaje | Etiqueta | Color |
|---------|----------|-------|
| 1 | Deficiente | Rojo |
| 2 | Regular | Naranja |
| 3 | Bueno | Amarillo |
| 4 | Muy bueno | Azul |
| 5 | Excelente | Verde |

---

## Feature 7 — Reportes + exportación PDF ✅

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-reportes`

### Descripción
Página `/reports` con reportes de asistencia y exportación a PDF.

### Alcance
- Reporte general: todas las sesiones con % por grupo
- Reporte por grupo: detalle de cada sesión + estudiantes sin registro
- Reporte por estudiante: historial completo de asistencias
- Filtros: rango de fechas, grupo, estudiante
- Exportar a PDF con `jspdf` + `jspdf-autotable`
- Columna "Sin registro" (SR) para estudiantes no registrados en sesión
- Nota al pie en reporte de estudiante sobre sesiones sin registro

---

## Feature 8 — Escaneo QR en asistencia 🟡 Pendiente

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-qr-asistencia`

### Descripción
Tomar asistencia escaneando el carnet QR del estudiante con la cámara del celular.

### Alcance
- Botón "Escanear QR" en la vista de tomar asistencia
- Abrir cámara del dispositivo (usar `html5-qrcode` o similar)
- Decodificar QR → `student_code` → buscar estudiante → marcar presente
- Feedback visual: nombre del estudiante + confirmación
- Funcionar en móvil (principal) y desktop con cámara

### Notas
- El QR ya existe en el carnet del estudiante, contiene `student_code`
- Complementa (no reemplaza) el listado manual

---

## Feature 9 — Alertas de inasistencia 🟢 Pendiente

**Prioridad:** 🟢 Baja
**Rama:** `dev-feature-alertas`

### Descripción
Notificar visualmente cuando un estudiante supera un umbral de ausencias en el mes.

### Alcance
- Configurar umbral desde `/settings` (ej: 3 ausencias en el mes)
- Badge de alerta en dashboard y ficha del estudiante
- El dashboard ya muestra el top 5 de ausencias — esto es una capa activa encima

### No incluye (por ahora)
- Notificaciones por WhatsApp/email al acudiente

---

## Feature 10 — PWA instalable 🟢 Pendiente

**Prioridad:** 🟢 Baja
**Rama:** `dev-feature-pwa`

### Descripción
Convertir la app en una Progressive Web App para instalarse como app nativa en celulares.

### Alcance
- Configurar `vite-plugin-pwa`
- Manifest: nombre, íconos, colores de Amor Acción
- Service worker: cache básico para uso offline
- Botón "Instalar app" en Settings o en pantalla de inicio
- Íconos en tamaños 192x192 y 512x512

### Notas
- Vercel soporta PWA sin configuración adicional
- Útil para profesores que usan el celular para tomar asistencia

---

## Feature 11 — Buzón de sugerencias ✅

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-buzon-sugerencias`

### Descripción
Canal interno para que cualquier usuario envíe ideas, errores o comentarios sobre la app. El admin las gestiona desde una página dedicada.

### Categorías
- **Nueva función** — ideas de cosas que quisieran tener
- **Mejora** — algo que ya existe pero podría funcionar mejor
- **Error** — algo que no funciona como debería
- **Comentario** — cualquier otra observación

### Alcance
- Tabla `suggestions`: categoría, mensaje, estado, usuario, fecha
- Botón "Enviar sugerencia" en el sidebar (visible a todos los roles)
- Modal para enviar: seleccionar categoría + escribir mensaje + confirmación
- Página `/suggestions` solo para admin: listado filtrable por categoría y estado
- Admin puede cambiar estado: Pendiente → Revisado → Descartado

### No incluye
- Respuestas del admin al usuario
- Notificaciones por email

---
