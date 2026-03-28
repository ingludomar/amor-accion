# Feature-014: Alertas de Inasistencia

## Información General
- **ID**: FEATURE-014
- **Prioridad**: Baja
- **Estado**: 🟢 Pendiente
- **Rama**: `dev-feature-alertas`
- **Fecha estimada**: Por definir

## Descripción
Notificar visualmente cuando un estudiante supera un umbral configurable de ausencias en el mes. El dashboard ya muestra el top 5 de ausencias — este feature agrega una capa de alerta activa.

---

## Especificaciones Técnicas

### Configuración del umbral
- Campo en `/settings`: "Umbral de alertas de inasistencia" (número, ej: 3)
- Guardado en tabla `settings` o en `role_permissions` como config global

### Dónde se muestran las alertas
| Lugar | Indicador |
|-------|-----------|
| Dashboard | Badge rojo en card "Ausencias" si hay estudiantes sobre umbral |
| Ficha del estudiante | Banner de alerta visible si supera el umbral en el mes |
| Lista de estudiantes | Ícono de alerta en la fila del estudiante |

### Lógica
```typescript
// Contar ausencias del mes para un estudiante
const ausenciasMes = attendanceRecords.filter(
  r => r.status === 'ausente' && isSameMonth(r.date, today)
).length;

const tieneAlerta = ausenciasMes >= umbral;
```

### No incluye (por ahora)
- Notificaciones por WhatsApp o email al acudiente
- Historial de alertas

---

## Archivos a modificar/crear

- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Students.tsx`
- `frontend/src/pages/Settings.tsx` — campo de umbral
- `frontend/src/lib/supabaseApi.ts` — query de ausencias por mes

---

## Criterios de Aceptación

- [ ] Admin configura umbral desde `/settings`
- [ ] Dashboard muestra indicador si hay estudiantes sobre umbral
- [ ] Ficha del estudiante muestra alerta si supera el umbral
- [ ] Alerta desaparece si las ausencias bajan del umbral
