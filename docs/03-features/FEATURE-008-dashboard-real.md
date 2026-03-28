# Feature-008: Dashboard con Datos Reales

## Información General
- **ID**: FEATURE-008
- **Prioridad**: Alta
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-dashboard-real`
- **Fecha completado**: Mar 2026

## Descripción
Dashboard principal con estadísticas reales del sistema en tiempo real, reemplazando los datos de muestra que existían inicialmente.

## Contexto
- El dashboard inicial mostraba datos estáticos/hardcodeados
- Se necesitaba conectar a Supabase para mostrar métricas reales

---

## Especificaciones Técnicas

### Tarjetas de estadísticas
| Métrica | Fuente |
|---------|--------|
| Total estudiantes activos | `COUNT(students WHERE is_active)` |
| Sesiones del mes | `COUNT(class_sessions WHERE mes actual)` |
| % asistencia promedio | `AVG(presentes/total) por sesión del mes` |
| Ausencias del mes | `COUNT(attendance_records WHERE status='ausente')` |

### Secciones adicionales
- **Top 5 ausencias** — estudiantes con más inasistencias en el mes
- **Sesiones recientes** — últimas 5 sesiones con grupo, fecha y % asistencia

### Queries principales
```typescript
dashboardAPI.getStats()         // tarjetas resumen
dashboardAPI.getTopAbsences()   // top 5 ausentes
dashboardAPI.getRecentSessions() // últimas sesiones
```

---

## Archivos clave

- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/lib/supabaseApi.ts` — `dashboardAPI`

---

## Criterios de Aceptación ✅

- [x] Tarjetas muestran datos reales de Supabase
- [x] Top 5 de estudiantes con más ausencias
- [x] Sesiones recientes con % de asistencia
- [x] Carga en menos de 2 segundos
- [x] Se actualiza al navegar al dashboard
