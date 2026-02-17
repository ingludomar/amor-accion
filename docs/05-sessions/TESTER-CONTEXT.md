# 🧪 Tester Context - Amor Acción

> **Archivo de contexto persistente para sesiones de testing manual**
> Este archivo se actualiza después de cada sesión de pruebas

---

## 📋 Información General

**Tester Asignado:** [Pendiente - ingresar nombre]  
**Fecha de Inicio:** 2026-02-17  
**Última Actualización:** 2026-02-17  
**Estado General:** 🟡 En Progreso

---

## 🎯 Feature Actual en Pruebas

### FEATURE-001: Gestión de Sedes (Campuses)

**Estado del Desarrollo:** ✅ Completado  
**Estado de Testing Manual:** 🟡 En Progreso  
**Prioridad:** Alta  
**Tiempo Estimado:** 30-45 minutos

**Descripción:**  
Sistema CRUD completo para gestionar sedes/campus donde se impartirán las clases.

---

## ✅ Checklist de Pruebas Manuales

### FASE 1: Login y Navegación (5 min)
- [ ] **Escenario 1.1:** Login exitoso con credenciales válidas
  - Email: `admin@amoraccion.com`
  - Password: `A1morA2ccion`
  - Verificar redirección al Dashboard
  
- [ ] **Escenario 1.2:** Navegación a página de Sedes
  - Encontrar opción "Sedes" en el menú
  - Verificar carga correcta de la página

**Notas de la Fase 1:**
```
[Espacio para notas del tester]
```

---

### FASE 2: CRUD de Sedes (15-20 min)

#### Crear Sede (C) ✅ COMPLETADO
- [x] **Escenario 2.1:** Crear sede con datos completos
  - Nombre: "Sede Principal Norte"
  - Código: "NORTE"
  - Dirección: "Carrera 45 # 123-45"
  - Ciudad: "Bogotá"
  - Teléfono: "6017654321"
  - Email: "norte@colegio.edu"
  - Logo: (URL opcional)
  - Verificar aparición en lista ✅

- [x] **Escenario 2.2:** Validaciones al crear
  - [x] Intentar sin nombre (debe mostrar error)
  - [x] Intentar con email inválido
  - [x] Intentar con teléfono inválido

**Notas - Crear:**
```
✅ CREATE funciona perfectamente
✅ Se crea sede con todos los campos
✅ Aparece correctamente en la lista
✅ Validaciones funcionan correctamente
```

#### Ver Lista (R) ✅ COMPLETADO
- [x] **Escenario 2.3:** Visualización de sedes
  - [x] Verificar que aparece: nombre, código, ciudad
  - [x] Verificar estado (Activa/Inactiva)
  - [x] Botones Editar y Eliminar visibles
  - [x] Contador total de sedes correcto

**Notas - Lista:**
```
✅ Lista muestra todas las sedes correctamente
✅ Información visible: nombre, código, ciudad, estado
✅ Botones de acción funcionan
✅ Contador actualizado correctamente
```

#### Editar Sede (U) ✅ COMPLETADO
- [x] **Escenario 2.4:** Edición básica
  - Cambiar nombre y ciudad
  - Verificar cambios en lista ✅
  
- [x] **Escenario 2.5:** Cambiar estado
  - Marcar sede como Inactiva
  - Verificar cambio de estado en UI ✅

**Notas - Editar:**
```
✅ UPDATE funciona perfectamente
✅ Todos los campos se mantienen correctamente
✅ Modal se cierra automáticamente después de actualizar
✅ Cambios persisten en la base de datos
✅ Logo URL se guarda y recupera correctamente
```

#### Eliminar Sede (D) ✅ COMPLETADO
- [x] **Escenario 2.6:** Eliminación con confirmación
  - Clic en eliminar
  - Confirmar en diálogo
  - Verificar desaparición de la lista ✅

**Notas - Eliminar:**
```
✅ DELETE funciona perfectamente
✅ Diálogo de confirmación aparece
✅ Sede se elimina correctamente
✅ Lista se actualiza automáticamente
```

**Notas - Eliminar:**
```
[Espacio para notas]
```

---

### FASE 3: Casos Edge y Validaciones (10 min)

- [ ] **Escenario 3.1:** Datos límites
  - [ ] Nombre muy largo (100+ caracteres)
  - [ ] Caracteres especiales (ñ, tildes, símbolos)
  - [ ] Código duplicado

- [ ] **Escenario 3.2:** Campos opcionales
  - [ ] Crear sede solo con obligatorios
  - [ ] Verificar que funciona sin logo/teléfono/email

- [ ] **Escenario 3.3:** Cancelar operaciones
  - [ ] Crear: llenar formulario, cancelar
  - [ ] Editar: hacer cambios, cancelar

**Notas - Edge Cases:**
```
[Espacio para notas]
```

---

### FASE 4: UI/UX (5 min)

- [ ] **Escenario 4.1:** Responsive Design
  - [ ] Desktop (normal)
  - [ ] Tablet (~768px)
  - [ ] Móvil (~375px)

- [ ] **Escenario 4.2:** Estados de carga
  - [ ] Indicador de carga visible
  - [ ] Botones deshabilitados durante operaciones

**Notas - UI/UX:**
```
[Espacio para notas]
```

---

## 🐛 Bugs Encontrados

### Bug #1: Actualización de sedes pierde datos
**Estado:** ✅ Corregido y Verificado  
**Severidad:** Alta  
**Fecha Reporte:** 2026-02-17  
**Fecha Corrección:** 2026-02-17  
**Fecha Verificación:** 2026-02-17  
**Reportado por:** Tester (Usuario)  
**Corregido por:** AGENT-DEVELOPER  
**Verificado por:** Tester (Usuario)

**Descripción:**
Al editar una sede existente y guardar los cambios, los campos de dirección (address), teléfono (phone) y email se pierden o se guardan como vacíos, aunque la sede original tenía estos datos.

**Pasos para Reproducir:**
1. Ir a la página de Sedes
2. Crear una nueva sede con todos los campos: nombre, código, dirección, ciudad, teléfono, email
3. Guardar la sede (se crea correctamente)
4. Hacer clic en "Editar" en la sede recién creada
5. Cambiar solo el nombre o la ciudad
6. Hacer clic en "Actualizar"
7. Verificar la sede en la lista

**Resultado Esperado:**
La sede debería mantener todos sus datos originales (dirección, teléfono, email) y solo actualizar los campos modificados (nombre/ciudad).

**Resultado Actual:**
✅ CORREGIDO Y VALIDADO: Todos los campos se mantienen correctamente.

**Testing Realizado:**
- ✅ CREATE: Crear sede con todos los campos funciona correctamente
- ✅ UPDATE: Editar sede mantiene todos los datos (address, phone, email, logo_url)
- ✅ DELETE: Eliminar sede funciona correctamente
- ✅ Modal se cierra automáticamente después de operaciones exitosas

**Causa Raíz:**
- En `openEditModal`: Los campos address, phone y email se inicializaban como strings vacíos en lugar de los valores originales del campus
- En `handleSubmit`: Solo se enviaban 4 campos (name, city, is_active, logo_url), omitiendo address, phone y email

**Corrección Aplicada:**
- Archivo: `frontend/src/pages/Campuses.tsx`
- Líneas modificadas: 79-90 (openEditModal) y 100-112 (handleSubmit)
- Cambios:
  1. `openEditModal` ahora preserva los valores originales de address, phone y email
  2. `handleSubmit` ahora incluye todos los campos editables en la actualización

**Testing:**
- [ ] Verificar creación de sede con todos los campos
- [ ] Verificar edición manteniendo todos los datos
- [ ] Verificar cambio parcial (solo nombre) no afecta otros campos
- [ ] Verificar cambio de estado activo/inactivo

**Evidencia:**
- [x] Código corregido y revisado
- [ ] Test manual pasado
- [ ] Screenshot de verificación

**Asignado a:** AGENT-DEVELOPER ✓  
**Fecha de Corrección:** 2026-02-17  
**Verificado por:** [Pendiente - Tester debe validar]

---

### Bug #2: Modal no se cierra al actualizar sede - COLUMNA logo_url NO EXISTE
**Estado:** ✅ Corregido y Verificado  
**Severidad:** Alta  
**Fecha Reporte:** 2026-02-17  
**Fecha Corrección:** 2026-02-17  
**Fecha Verificación:** 2026-02-17  
**Reportado por:** Tester (Usuario)  
**Corregido por:** AGENT-DEVELOPER  
**Verificado por:** Tester (Usuario)

**Descripción:**
Al presionar el botón "Actualizar" en el modal de edición de sede, aparece el error: "Could not find the 'logo_url' column of 'campuses' in the schema cache". El modal no se cierra porque la operación de actualización falla en la base de datos.

**Causa Raíz:**
El AGENT-DEVELOPER implementó el feature sin crear la columna `logo_url` en la base de datos, aunque el AGENT-ARCHITECT sí la especificó en FEATURE-001.

**Análisis de Responsabilidad:**
- ✅ **AGENT-ARCHITECT:** Especificó correctamente `logo_url` en el modelo de datos (FEATURE-001 línea 37)
- ✅ **AGENT-ARCHITECT:** Incluyó `logo_url text` en el SQL de ejemplo del feature
- ❌ **AGENT-DEVELOPER:** Usó los archivos SQL antiguos que NO tenían la columna
- ❌ **AGENT-DEVELOPER:** No verificó que el esquema de DB coincidiera con la especificación
- ❌ **AGENT-DEVELOPER:** Asumió que el campo existía y programó el frontend sin validar

**Diagnóstico Técnico:**
- Error en consola: `Could not find the 'logo_url' column of 'campuses' in the schema cache`
- El esquema SQL existente (`supabase-schema.sql`) no incluía la columna `logo_url`
- El código frontend correctamente intenta enviar el campo según la especificación

**Corrección Aplicada:**
1. **Schema actualizado:** `database/supabase-schema.sql` - Agregada columna `logo_url TEXT` a la tabla campuses
2. **Migración creada:** `database/migration-add-logo-url.sql` - Script para agregar la columna a bases de datos existentes
3. **Manejo de errores mejorado:** Se agregó `onError` al `updateMutation` para mostrar mensajes claros al usuario
4. **Migración ejecutada en Supabase:** Tester ejecutó ALTER TABLE para agregar la columna
5. **Frontend reactivado:** Campo logo_url habilitado nuevamente

**Testing Realizado:**
- ✅ Migración ejecutada en Supabase
- ✅ Columna logo_url creada exitosamente
- ✅ Probar actualizar una sede
- ✅ Confirmar que el modal se cierra automáticamente
- ✅ Verificar que todos los campos se mantienen correctamente

**Resultado:**
✅ TODAS LAS PRUEBAS PASARON - Bug completamente resuelto

**Archivos modificados:**
- `database/supabase-schema.sql` (línea 11: agregado logo_url)
- `database/migration-add-logo-url.sql` (nuevo archivo)
- `database/setup-complete.sql` (agregado logo_url)
- `frontend/src/pages/Campuses.tsx` (mejor manejo de errores + reactivación de logo_url)

**Asignado a:** AGENT-DEVELOPER ✓  
**Fecha de Corrección:** 2026-02-17  
**Verificado por:** Tester (Usuario) ✓

---

## 📊 Resumen de Progreso

| Fase | Escenarios | Completados | Pendientes | Estado |
|------|------------|-------------|------------|---------|
| 1 - Login | 2 | 2 | 0 | ✅ |
| 2 - CRUD | 6 | 6 | 0 | ✅ |
| 3 - Edge Cases | 3 | 0 | 3 | ⏳ |
| 4 - UI/UX | 2 | 0 | 2 | ⏳ |
| **TOTAL** | **13** | **8** | **5** | **🟡 62%** |

---

## 🎯 Siguiente Sesión

**Fecha Programada:** Próxima sesión  
**Enfoque:** Completar FASE 3 (Edge Cases) y FASE 4 (UI/UX)  
**Notas Pre-sesión:**
```
CRUD de Sedes completamente validado ✅

Pendientes para próxima sesión:
- FASE 3: Casos Edge (datos límites, campos opcionales, cancelar operaciones)
- FASE 4: UI/UX (responsive design, estados de carga)

Observaciones:
- UPDATE, DELETE y CREATE funcionan perfectamente
- Bugs #1 y #2 corregidos y verificados
- Feature casi listo para producción
```

---

## 💡 Observaciones Generales

```
[Espacio libre para:
- Sugerencias de mejora
- Patrones observados
- Dudas sobre requerimientos
- Notas sobre navegador/dispositivo usado
]
```

---

## 🔗 Referencias Rápidas

- **URL Local:** http://localhost:5174
- **Credenciales:** admin@amoraccion.com / A1morA2ccion
- **Documentación Feature:** [docs/03-features/features/FEATURE-001-gestion-sedes.md](../03-features/features/FEATURE-001-gestion-sedes.md)
- **Página Componente:** [frontend/src/pages/Campuses.tsx](../../../frontend/src/pages/Campuses.tsx)
- **API:** [frontend/src/lib/supabaseApi.ts](../../../frontend/src/lib/supabaseApi.ts)

---

## 📝 Instrucciones de Uso

1. **Antes de empezar:** Leer este archivo completamente
2. **Durante testing:** Marcar checkboxes conforme avanzas
3. **Después de cada sesión:** 
   - Actualizar "Última Actualización"
   - Completar sección "Notas" de cada fase probada
   - Agregar bugs encontrados al registro
   - Actualizar tabla de progreso
   - Completar "Siguiente Sesión"
4. **Al terminar feature:** Mover este archivo a `docs/05-sessions/completed/` y actualizar STATUS.md

---

*Última modificación por: Tester (Usuario) | Fecha: 2026-02-17 | Progreso: CRUD completado (62%)*
