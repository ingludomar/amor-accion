# Feature-012: Buzón de Sugerencias

## Información General
- **ID**: FEATURE-012
- **Prioridad**: Media
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-buzon-sugerencias`
- **Fecha completado**: Mar 2026

## Descripción
Canal interno para que cualquier usuario envíe ideas, errores o comentarios sobre la app. El admin gestiona las sugerencias desde una página dedicada con filtros y cambio de estado.

---

## Especificaciones Técnicas

### Modelo de Datos

```sql
CREATE TABLE suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN ('nueva_funcion','mejora','error','comentario')),
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (status IN ('pendiente','revisado','descartado')),
  created_by  UUID REFERENCES auth.users(id),
  user_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Categorías
| Valor | Label | Descripción |
|-------|-------|-------------|
| `nueva_funcion` | Nueva función | Algo que les gustaría tener |
| `mejora` | Mejora | Algo que podría funcionar mejor |
| `error` | Error | Algo que no funciona bien |
| `comentario` | Comentario | Cualquier otra observación |

### Estados
| Valor | Significado |
|-------|-------------|
| `pendiente` | Recién enviada, sin revisar |
| `revisado` | Admin la revisó |
| `descartado` | No se implementará |

### RLS
- Cualquier usuario autenticado puede insertar
- Cada usuario ve solo sus propias sugerencias
- Admin (`role = 'admin'`) ve todas
- Solo admin puede actualizar el estado

### Componentes

**SuggestionModal.tsx** (todos los usuarios)
- Accesible desde botón "Enviar sugerencia" en el sidebar
- Paso 1: seleccionar categoría (grid 2x2 con ícono + descripción)
- Paso 2: escribir mensaje (textarea)
- Al enviar: pantalla de confirmación con checkmark verde

**Suggestions.tsx** (solo admin — `/suggestions`)
- Lista de todas las sugerencias
- Filtros: por categoría y por estado
- Cada tarjeta: badge categoría, badge estado, mensaje, autor, fecha
- Botones para cambiar estado (muestra las otras opciones)

---

## Archivos clave

- `frontend/src/components/SuggestionModal.tsx`
- `frontend/src/pages/Suggestions.tsx`
- `frontend/src/components/Layout.tsx` — botón sidebar + trigger modal
- `frontend/src/App.tsx` — ruta `/suggestions`
- `frontend/src/lib/supabaseApi.ts` — `suggestionAPI`
- `database/migration-suggestions.sql`

---

## Criterios de Aceptación ✅

- [x] Botón "Enviar sugerencia" visible en sidebar para todos los usuarios
- [x] Modal funciona correctamente (categoría + mensaje + confirmación)
- [x] Sugerencia guardada en Supabase con usuario y fecha
- [x] Página `/suggestions` solo accesible para admin
- [x] Filtros por categoría y estado funcionando
- [x] Admin puede cambiar estado de cada sugerencia
