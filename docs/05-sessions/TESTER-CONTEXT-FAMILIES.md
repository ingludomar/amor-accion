# Tester Context - FEATURE-004: Gestión de Familias y Acudientes

> **Archivo de contexto persistente para sesiones de testing manual**

---

## Información General

**Tester Asignado:** Luis Dominguez  
**Fecha de Inicio:** 2026-02-27  
**Última Actualización:** 2026-02-27  
**Estado General:** 🟡 En Progreso

---

## Feature Actual en Pruebas

### FEATURE-004: Gestión de Familias y Acudientes

**Estado del Desarrollo:** ✅ Completado  
**Estado de Testing Manual:** 🟡 En Progreso  
**Prioridad:** Alta  
**Tiempo Estimado:** 30-45 minutos

**Descripción:**  
Sistema CRUD completo para gestionar familias, padres y acudientes con múltiples teléfonos y WhatsApp.

**URL de Producción:** https://frontend-1to1ghb2h-ingludomars-projects.vercel.app

---

## ✅ Checklist de Pruebas Manuales

### FASE 1: Login y Navegación (5 min)

- [ ] **Escenario 1.1:** Login exitoso
  - Email: `admin@amoraccion.com`
  - Password: `A1morA2ccion`
  - Verificar redirección al Dashboard

- [ ] **Escenario 1.2:** Navegación a página de Familias
  - Encontrar opción "Familias" en el menú
  - Verificar carga correcta de la página

- [ ] **Escenario 1.3:** Navegación a página de Padres/Acudientes
  - Encontrar opción "Padres/Acudientes" en el menú
  - Verificar carga correcta de la página

---

### FASE 2: CRUD de Familias (10 min)

#### Crear Familia (C)
- [ ] **Escenario 2.1:** Crear familia con datos completos
  - Nombre: "Familia Pérez"
  - Teléfono: "3001234567"
  - Dirección: "Calle 123"
  - Verificar aparición en lista

- [ ] **Escenario 2.2:** Crear familia solo con nombre
  - Solo nombre: "Familia García"
  - Verificar que se crea correctamente

**Notas - Crear Familia:**
```
[Espacio para notas]
```

#### Ver Lista (R)
- [ ] **Escenario 2.3:** Visualización de familias
  - [ ] Verificar columnas: Nombre, Teléfono, Dirección, Estado
  - [ ] Botones Editar y Eliminar visibles
  - [ ] Búsqueda funciona

- [ ] **Escenario 2.4:** Familia sin nombre
  - [ ] Verificar que muestra "Familia sin nombre"

**Notas - Lista Familias:**
```
[Espacio para notas]
```

#### Editar Familia (U)
- [ ] **Escenario 2.5:** Edición básica
  - Cambiar nombre y teléfono
  - Verificar cambios en lista

**Notas - Editar Familia:**
```
[Espacio para notas]
```

#### Eliminar Familia (D)
- [ ] **Escenario 2.6:** Eliminación con confirmación
  - Clic en eliminar
  - Confirmar en diálogo
  - Verificar desaparición de la lista

**Notas - Eliminar Familia:**
```
[Espacio para notas]
```

---

### FASE 3: CRUD de Padres/Acudientes (15 min)

#### Crear Acudiente (C)
- [ ] **Escenario 3.1:** Crear padre con todos los campos
  - Nombre: "Juan"
  - Apellido: "Pérez"
  - Teléfono casa: "6012345678"
  - Teléfono móvil: "3001234567"
  - ✅ WhatsApp: Activar
  - Teléfono WhatsApp: "3001234567"
  - Email: "juan@email.com"
  - Ocupación: "Ingeniero"
  - Verificar aparición en lista

- [ ] **Escenario 3.2:** Crear abuelo/tía (acudiente externo)
  - Nombre: "María"
  - Apellido: "García"
  - Relación: "abuela"
  - Teléfono móvil: "3101234567"
  - ✅ WhatsApp: Activar

- [ ] **Escenario 3.3:** Validaciones
  - [ ] Intentar sin nombre (debe mostrar error)
  - [ ] Intentar sin apellido (debe mostrar error)

**Notas - Crear Acudiente:**
```
[Espacio para notas]
```

#### Ver Lista (R)
- [ ] **Escenario 3.4:** Visualización de acudientes
  - [ ] Verificar columnas: Nombre, Documento, Teléfonos, WhatsApp, Email
  - [ ] Icono de WhatsApp visible cuando tiene
  - [ ] Botones Editar y Eliminar visibles
  - [ ] Búsqueda funciona
  - [ ] Stats: Total, Con WhatsApp, Con Teléfono Móvil

**Notas - Lista Acudientes:**
```
[Espacio para notas]
```

#### Editar Acudiente (U)
- [ ] **Escenario 3.5:** Edición básica
  - Cambiar nombre y teléfono
  - Verificar cambios en lista

- [ ] **Escenario 3.6:** Agregar/remover WhatsApp
  - Quitar checkbox de WhatsApp
  - Verificar que desaparece el campo de teléfono WhatsApp

**Notas - Editar Acudiente:**
```
[Espacio para notas]
```

#### Eliminar Acudiente (D)
- [ ] **Escenario 3.7:** Eliminación
  - Clic en eliminar
  - Confirmar en diálogo
  - Verificar desaparición de la lista

**Notas - Eliminar Acudiente:**
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

- [ ] **Escenario 4.3:** Modal de formulario
  - [ ] Se abre correctamente
  - [ ] Se cierra con X o Cancelar
  - [ ] Validaciones funcionan

**Notas - UI/UX:**
```
[Espacio para notas]
```

---

## 🐛 Bugs Encontrados

### Bug #1: [Título]
**Estado:** [Abierto/Corregido/Verificado]  
**Severidad:** [Alta/Media/Baja]  
**Fecha:** [Fecha de descubrimiento]

**Descripción:**
```
[Descripción detallada]
```

**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:**
```
[Qué debería pasar]
```

**Resultado Actual:**
```
[Qué pasa realmente]
```

---

## 📊 Resumen de Progreso

| Fase | Escenarios | Completados | Pendientes | Estado |
|------|------------|-------------|------------|---------|
| 1 - Login/Nav | 3 | 0 | 3 | ⏳ |
| 2 - Familias | 6 | 0 | 6 | ⏳ |
| 3 - Acudientes | 7 | 0 | 7 | ⏳ |
| 4 - UI/UX | 3 | 0 | 3 | ⏳ |
| **TOTAL** | **19** | **0** | **19** | **⏳ 0%** |

---

## 🎯 Siguiente Sesión

**Fecha Programada:** [Pendiente]  
**Enfoque:** [Pendiente]  
**Notas Pre-sesión:**
```
[Instrucciones especiales para la próxima sesión]
```

---

## 🔗 Referencias Rápidas

- **URL Producción:** https://frontend-1to1ghb2h-ingludomars-projects.vercel.app
- **Credenciales:** admin@amoraccion.com / A1morA2ccion
- **Página Familias:** frontend/src/pages/Families.tsx
- **Página Acudientes:** frontend/src/pages/Guardians.tsx
- **API:** frontend/src/lib/supabaseApi.ts (familyAPI, guardianAPI)

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
4. **Al terminar feature:** Actualizar STATUS.md

---

*Última modificación por: Luis Dominguez | Fecha: 2026-02-27*
