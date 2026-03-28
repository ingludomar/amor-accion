# Feature-009: Cambio de Contraseña

## Información General
- **ID**: FEATURE-009
- **Prioridad**: Alta
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-cambio-password`
- **Fecha completado**: Mar 2026

## Descripción
Permite que cada usuario cambie su propia contraseña desde la app, sin depender del administrador.

## Contexto
- Todos los usuarios iniciaban con contraseña por defecto `Amor2026!`
- No había forma de cambiarla desde la app

---

## Especificaciones Técnicas

### Ubicación
Sección en `/settings` visible para todos los roles.

### Campos del formulario
- Nueva contraseña (mínimo 8 caracteres)
- Confirmar nueva contraseña

### Implementación
```typescript
// Supabase Auth
await supabase.auth.updateUser({ password: nuevaPassword });
```

### Validaciones
- Las dos contraseñas deben coincidir
- Mínimo 8 caracteres
- Feedback visual de éxito o error

### No incluye
- Verificación de contraseña actual (Supabase Auth no lo requiere si hay sesión activa)
- Reset por email (Supabase lo maneja en la pantalla de login)
- Admin cambiando contraseña de otro usuario

---

## Archivos clave

- `frontend/src/pages/Settings.tsx`

---

## Criterios de Aceptación ✅

- [x] Sección de cambio de contraseña visible en `/settings`
- [x] Validación: contraseñas coinciden y mínimo 8 caracteres
- [x] Cambio exitoso → mensaje de confirmación
- [x] Después del cambio se puede cerrar sesión e ingresar con la nueva contraseña
