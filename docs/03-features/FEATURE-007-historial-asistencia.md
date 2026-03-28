# Feature-007: Historial de Asistencia

## Información General
- **ID**: FEATURE-007
- **Prioridad**: Alta
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-historial-asistencia`
- **Fecha completado**: Mar 2026

## Descripción
Vista de historial de sesiones pasadas con sus registros de asistencia. Accesible desde la página de Asistencia como una pestaña adicional.

## Contexto
- Antes solo existía la vista de "tomar asistencia" (sesión activa)
- Se necesitaba poder revisar sesiones anteriores y sus registros

---

## Especificaciones Técnicas

### Tabs en `/attendance`
1. **Tomar asistencia** — crear sesión y registrar presentes/ausentes/excusados
2. **Historial** — ver sesiones pasadas con sus registros

### Historial
- Lista de sesiones filtrable por grupo y rango de fechas
- Al abrir una sesión: tabla con todos los estudiantes y su estado
- Estados: Presente (verde), Ausente (rojo), Excusado (amarillo)

### Queries
```typescript
// Sesiones pasadas por grupo
classSessionAPI.getByGroup(groupId, dateFrom, dateTo)

// Registros de una sesión
attendanceAPI.getBySession(sessionId)
```

---

## Archivos clave

- `frontend/src/pages/Attendance.tsx`
- `frontend/src/lib/supabaseApi.ts` — `classSessionAPI`, `attendanceAPI`

---

## Criterios de Aceptación ✅

- [x] Tab "Historial" visible en `/attendance`
- [x] Filtros por grupo y fecha funcionando
- [x] Al abrir sesión muestra lista completa de estudiantes con estado
- [x] Solo lectura (no se puede modificar historial)
