# BACKLOG - Amor Acción

> Features pendientes de implementar. Ver [TRACKING.md](./TRACKING.md) para el estado general.
> **Última actualización:** 27 Mar 2026

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

**Regla:** Cada feature termina con un commit. Nunca push directo a `main`.

---

## Feature 5 — Cambio de contraseña

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-cambio-password`

### Descripción
Permitir que cada usuario cambie su propia contraseña desde la app, sin depender del admin.

### Alcance
- Botón o sección en perfil/configuración del usuario
- Formulario: contraseña actual + nueva contraseña + confirmar
- Validar que nueva contraseña tenga mínimo 8 caracteres
- Usar `supabase.auth.updateUser({ password: nuevaPassword })`
- Mostrar éxito o error con feedback visual

### No incluye
- Reset por email (Supabase ya lo maneja)
- Admin cambiando contraseña de otro usuario

---

## Feature 6 — Sistema de calificaciones

**Prioridad:** 🔴 Alta
**Rama:** `dev-feature-calificaciones`

### Descripción
Registrar una nota o calificación por estudiante por tema dado en clase.

### Alcance
- Nueva tabla `grades`: `id`, `student_id`, `topic_id`, `session_id`, `score`, `notes`, `created_by`
- Vista en página de temas: al marcar tema como realizado, opción de ingresar notas
- Vista en ficha del estudiante: historial de calificaciones
- Escala: numérica 1–5 o conceptual (Excelente / Bueno / Regular / Deficiente) — a definir
- Migración SQL nueva

### No incluye (por ahora)
- Exportar calificaciones
- Promedios automáticos

---

## Feature 7 — Reportes + exportación PDF

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-reportes`

### Descripción
Página `/reports` con reportes de asistencia y exportación.

### Alcance
- Reporte de asistencia por grupo (% presencia por fecha)
- Reporte de asistencia por estudiante (historial completo)
- Filtros: rango de fechas, sede, grupo
- Exportar a PDF (usar `jspdf` + `jspdf-autotable`)
- Posible exportar a Excel (`xlsx`)

### Notas
- La página `/reports` ya existe en el sidebar pero sin contenido
- El módulo ya tiene permisos configurados en `role_permissions`

---

## Feature 8 — Escaneo QR en asistencia

**Prioridad:** 🟡 Media
**Rama:** `dev-feature-qr-asistencia`

### Descripción
Tomar asistencia escaneando el carnet QR del estudiante con la cámara del celular.

### Alcance
- Botón "Escanear QR" en la vista de tomar asistencia
- Abrir cámara del dispositivo (usar `html5-qrcode` o similar)
- Decodificar QR → `student_code` → buscar estudiante → marcar presente
- Feedback visual: nombre del estudiante escaneado + estado
- Funcionar en móvil (principal) y desktop con cámara

### Notas
- El QR ya existe en el carnet del estudiante, contiene `student_code`
- Complementa (no reemplaza) el listado manual

---

## Feature 9 — Alertas de inasistencia

**Prioridad:** 🟢 Baja
**Rama:** `dev-feature-alertas`

### Descripción
Notificar cuando un estudiante supera un umbral de ausencias en el mes.

### Alcance
- Configurar umbral (ej: 3 ausencias en el mes)
- Badge o alerta visual en dashboard y ficha del estudiante
- Posiblemente: enviar WhatsApp/email al acudiente (futuro)

### Notas
- El dashboard ya muestra el top 5 de más ausencias — esto sería una capa de alerta activa

---

## Feature 10 — PWA instalable

**Prioridad:** 🟢 Baja
**Rama:** `dev-feature-pwa`

### Descripción
Convertir la app en una Progressive Web App para que pueda instalarse como app nativa en celulares.

### Alcance
- Configurar `vite-plugin-pwa`
- Manifest: nombre, icono, colores
- Service worker: cache básico para uso offline (dashboard, listados)
- Botón "Instalar app" en pantalla de inicio o settings
- Íconos en tamaños requeridos (192x192, 512x512)

### Notas
- Vercel soporta PWA sin configuración adicional
- Útil para profesores que usan el celular para tomar asistencia

---
