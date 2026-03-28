# Feature-010: Sistema de Calificaciones

## Información General
- **ID**: FEATURE-010
- **Prioridad**: Alta
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-calificaciones`
- **Fecha completado**: Mar 2026

## Descripción
Registrar una calificación por estudiante por tema dado en clase. La escala de calificación es parametrizable desde la página de Configuración.

## Contexto
- Se necesitaba un seguimiento académico por tema
- La escala debía ser flexible (cada organización puede tener su propia nomenclatura)

---

## Especificaciones Técnicas

### Modelo de Datos

```sql
CREATE TABLE grades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id),
  topic_id    UUID REFERENCES topics(id),
  score       SMALLINT CHECK (score BETWEEN 1 AND 5),
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);

CREATE TABLE grade_scale (
  score  SMALLINT PRIMARY KEY CHECK (score BETWEEN 1 AND 5),
  label  TEXT NOT NULL,
  color  TEXT NOT NULL  -- nombre de color: red, orange, yellow, blue, green
);
```

### Escala por defecto
| Score | Label | Color |
|-------|-------|-------|
| 1 | Deficiente | red |
| 2 | Regular | orange |
| 3 | Bueno | yellow |
| 4 | Muy bueno | blue |
| 5 | Excelente | green |

### Flujo de calificación
1. En `/topics`: temas marcados como realizados muestran botón ⭐
2. Al hacer clic: modal con lista de estudiantes del grupo
3. Para cada estudiante: botones de score 1-5 con color y label de la escala
4. Opcionalmente: campo de notas
5. Al guardar: `gradeAPI.upsertBatch()` → un registro por estudiante

### Hook compartido
```typescript
// hooks/useGradeScale.ts
useGradeScale() → { scale, scaleMap }
// scaleMap[score] = { label, color, bg, text, border }
```

### Dónde se muestran las calificaciones
- **Topics.tsx** — modal de calificación por grupo
- **Students.tsx** — sección "Calificaciones" en ficha del estudiante
- **Settings.tsx** — editor de escala (label + color por score)

---

## Archivos clave

- `frontend/src/hooks/useGradeScale.ts`
- `frontend/src/pages/Topics.tsx`
- `frontend/src/pages/Students.tsx`
- `frontend/src/pages/Settings.tsx`
- `frontend/src/lib/supabaseApi.ts` — `gradeAPI`, `gradeScaleAPI`
- `database/migration-grades.sql`

---

## Criterios de Aceptación ✅

- [x] Botón ⭐ aparece en temas marcados como realizados
- [x] Modal muestra todos los estudiantes del grupo con botones de score
- [x] Calificaciones guardadas correctamente (upsert)
- [x] Ficha del estudiante muestra historial de calificaciones
- [x] Escala editable desde Configuración
- [x] Cambios en la escala se reflejan en toda la app
