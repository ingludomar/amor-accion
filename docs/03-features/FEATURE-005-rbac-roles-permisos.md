# Feature-005: RBAC — Roles y Permisos por Módulo

## Información General
- **ID**: FEATURE-005
- **Prioridad**: Alta
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-restrict-login`
- **Fecha completado**: Mar 2026

## Descripción
Sistema de control de acceso basado en roles (RBAC). Cada rol tiene permisos configurables (ver, crear, editar, eliminar) por módulo. El sidebar y las rutas se adaptan automáticamente según los permisos del usuario autenticado.

## Contexto
- Antes del feature, cualquier usuario autenticado podía ver todo
- Se necesitaba restringir por rol: admin vs profesor
- Los permisos deben ser editables sin tocar código

---

## Especificaciones Técnicas

### Modelo de Datos

```sql
CREATE TABLE role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name   TEXT NOT NULL,
  module      TEXT NOT NULL,
  can_view    BOOLEAN DEFAULT false,
  can_create  BOOLEAN DEFAULT false,
  can_edit    BOOLEAN DEFAULT false,
  can_delete  BOOLEAN DEFAULT false,
  UNIQUE(role_name, module)
);
```

### Hook principal

```typescript
// hooks/usePermission.ts
usePermission(module: string) → { canView, canCreate, canEdit, canDelete }
```

### Componentes

- **ProtectedRoute.tsx** — envuelve rutas, redirige si no tiene `canView`
- **Roles.tsx** — página `/roles` con matriz visual editable (solo admin)
- **Layout.tsx** — filtra ítems del sidebar según permisos

### Flujo

```
Login → cargar role_permissions en authStore → usePermission() → sidebar filtrado
```

---

## Archivos clave

- `frontend/src/hooks/usePermission.ts`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/pages/Roles.tsx`
- `frontend/src/store/authStore.ts`
- `database/migration-rbac.sql`

---

## Criterios de Aceptación ✅

- [x] Admin puede ver y editar todos los módulos
- [x] Profesor solo ve los módulos permitidos
- [x] Sidebar muestra solo ítems con `canView = true`
- [x] Rutas protegidas redirigen a dashboard si no hay permiso
- [x] Página `/roles` permite cambiar permisos en tiempo real
