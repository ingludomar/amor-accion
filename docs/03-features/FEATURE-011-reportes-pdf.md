# Feature-011: Reportes + Exportación PDF

## Información General
- **ID**: FEATURE-011
- **Prioridad**: Media
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-reportes`
- **Fecha completado**: Mar 2026

## Descripción
Página `/reports` con tres tipos de reportes de asistencia y exportación a PDF. Incluye detección de estudiantes sin registro en sesiones.

---

## Especificaciones Técnicas

### Tipos de reporte

| Reporte | Descripción |
|---------|-------------|
| General | Todas las sesiones con P/A/E/% por grupo |
| Por grupo | Detalle por sesión + estudiantes sin registro |
| Por estudiante | Historial completo de asistencias |

### Filtros disponibles
- Rango de fechas (desde / hasta)
- Grupo (para reporte por grupo y por estudiante)
- Estudiante (para reporte individual)

### "Sin registro" (SR)
- Estudiantes del grupo que no aparecen en los registros de una sesión
- Se muestran como filas en gris itálico con etiqueta "Sin registro"
- Columna SR en el reporte general (naranja si SR > 0)

### Exportación PDF
```typescript
// Librería: jspdf@4 + jspdf-autotable@5
exportGeneralPDF(sessions, dateFrom, dateTo)
exportGroupPDF(sessions, groupName, dateFrom, dateTo, groupStudents)
exportStudentPDF(records, studentName, dateFrom, dateTo)
```

### Estructura del PDF
- Encabezado azul: título + rango de fechas + timestamp
- Tabla con datos
- Colores en columna de estado (Presente=verde, Ausente=rojo, Excusado=amarillo)
- Filas SR en itálico gris

---

## Archivos clave

- `frontend/src/pages/Reports.tsx`
- `frontend/src/lib/supabaseApi.ts` — `reportAPI`

## Dependencias instaladas

```json
"jspdf": "^4.2.1",
"jspdf-autotable": "^5.0.7"
```

---

## Criterios de Aceptación ✅

- [x] Tres tipos de reporte funcionando con datos reales
- [x] Filtros por fecha y grupo/estudiante
- [x] Columna SR visible en reporte general
- [x] Estudiantes sin registro visibles en reporte por grupo
- [x] Exportación PDF con formato correcto
- [x] Botón PDF solo aparece cuando hay datos
