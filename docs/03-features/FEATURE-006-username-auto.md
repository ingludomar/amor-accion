# Feature-006: Username Auto-generado

## Información General
- **ID**: FEATURE-006
- **Prioridad**: Media
- **Estado**: ✅ Completo
- **Rama**: `dev-feature-auto-username`
- **Fecha completado**: Mar 2026

## Descripción
Al crear un usuario, el sistema genera automáticamente un username a partir del nombre y apellido, sin que el admin tenga que escribirlo manualmente.

## Contexto
- Los usuarios acceden con email, pero el username sirve como identificador amigable
- Evita duplicados con sufijo numérico automático

---

## Especificaciones Técnicas

### Formato
```
nombre.apellido → luis.dominguez
(si existe) → luis.dominguez2, luis.dominguez3, ...
```

### Lógica
1. Tomar `full_name`, separar primer nombre y primer apellido
2. Convertir a minúsculas, eliminar tildes y caracteres especiales
3. Unir con punto: `nombre.apellido`
4. Verificar en `profiles` si ya existe → agregar sufijo numérico si hay conflicto
5. Guardar en campo `username` de la tabla `profiles`

---

## Archivos clave

- `frontend/src/pages/Users.tsx`
- `frontend/src/lib/supabaseApi.ts` — `profileAPI.create()`

---

## Criterios de Aceptación ✅

- [x] Username generado automáticamente al crear usuario
- [x] Sin duplicados (sufijo numérico si hay conflicto)
- [x] Se muestra en la ficha del usuario
- [x] No requiere input manual del admin
