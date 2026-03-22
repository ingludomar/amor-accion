# Feature-001: Sistema de Gestión de Sedes (Campuses)

## Información General
- **ID**: FEATURE-001
- **Prioridad**: Alta
- **Fase**: 2
- **Fecha inicio**: 2026-02-17
- **Estimación**: 3-4 días

## Descripción
Implementar el sistema completo de gestión de sedes/campus donde se impartirán las clases. Esto incluye crear, listar, editar y eliminar sedes.

## Contexto
Las organizaciones pueden tener múltiples sedes (ej: sede principal, sede norte, sede sur). Cada sede tendrá sus propios años escolares, grupos y estudiantes.

## Agente Responsable
- **Architect**: @agent-architect
- **Developer**: @agent-developer
- **Tester**: @agent-tester
- **Reviewer**: @agent-reviewer
- **Integrator**: @agent-integrator

---

## Especificaciones Técnicas

### Modelo de Datos

```typescript
// Supabase Schema
interface Campus {
  id: string;                    // UUID
  name: string;                  // Nombre de la sede
  address: string;               // Dirección
  phone: string;                 // Teléfono
  email: string;                 // Email de contacto
  logo_url: string | null;       // URL del logo (Storage)
  is_active: boolean;            // Sede activa/inactiva
  created_at: string;            // Timestamp
  updated_at: string;            // Timestamp
  created_by: string;            // User ID
}
```

### API Methods

```typescript
// lib/supabaseApi.ts

// Crear sede
const createCampus = (campus: Omit<Campus, 'id' | 'created_at' | 'updated_at'>) => Promise<Campus>

// Listar todas las sedes
const getCampuses = () => Promise<Campus[]>

// Obtener sede por ID
const getCampusById = (id: string) => Promise<Campus | null>

// Actualizar sede
const updateCampus = (id: string, updates: Partial<Campus>) => Promise<Campus>

// Eliminar sede
const deleteCampus = (id: string) => Promise<void>
```

### Componentes

1. **Campuses.tsx** - Página principal de listado
   - Tabla de sedes
   - Botón crear nueva sede
   - Acciones: Editar, Eliminar, Ver
   - Filtros: Activas/Inactivas
   - Paginación (si hay muchas)

2. **CampusForm.tsx** - Formulario crear/editar
   - Inputs: Nombre, Dirección, Teléfono, Email
   - Upload de logo (opcional)
   - Checkbox: Activa/Inactiva
   - Validación de campos
   - Botón Guardar/Cancelar

3. **CampusCard.tsx** - Tarjeta de sede (opcional para grid view)
   - Logo
   - Nombre
   - Dirección
   - Acciones rápidas

### Páginas/Rutas

- `/campuses` - Lista de sedes (ProtectedRoute)
- `/campuses/new` - Crear nueva sede
- `/campuses/:id` - Ver detalle de sede
- `/campuses/:id/edit` - Editar sede

### Flujo de Datos

```
Usuario → Campuses Page → supabaseApi → Supabase DB
              ↓
         CampusForm → Crear/Editar → Supabase DB
              ↓
         Actualizar UI → Mostrar cambios
```

### Dependencias

- **Bloqueado por:** Ninguno (puede empezarse en paralelo)
- **Bloquea a:** 
  - School Years (necesita campus_id)
  - Students (necesita campus_id)
  - Groups (necesita campus_id)

### Integración con Supabase

#### Tabla a crear:
```sql
create table campuses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  phone text,
  email text,
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users(id)
);

-- Políticas RLS
alter table campuses enable row level security;

create policy "Usuarios autenticados pueden ver sedes"
  on campuses for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear sedes"
  on campuses for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Usuarios autenticados pueden actualizar sedes"
  on campuses for update
  to authenticated
  using (true);
```

### Riesgos

1. **Riesgo:** Logo muy grande puede hacer lenta la carga
   - **Mitigación:** Limitar tamaño a 2MB, usar compresión

2. **Riesgo:** No hay sedes, usuarios no pueden crear estudiantes
   - **Mitigación:** Crear sede "Sede Principal" por defecto

3. **Riesgo:** Eliminar sede con datos relacionados
   - **Mitigación:** Soft delete (is_active = false) o mostrar advertencia

---

## Criterios de Aceptación

### Funcionales
- [ ] Usuario puede ver lista de todas las sedes
- [ ] Usuario puede crear nueva sede con todos los campos
- [ ] Usuario puede editar sede existente
- [ ] Usuario puede "eliminar" sede (soft delete)
- [ ] Usuario puede subir logo de la sede
- [ ] Logo se muestra correctamente en la lista
- [ ] Campos obligatorios: Nombre, Dirección
- [ ] Validación de email
- [ ] Mensajes de error amigables

### No Funcionales
- [ ] Tiempo de carga de lista < 2 segundos
- [ ] Crear sede < 3 segundos
- [ ] Diseño responsive
- [ ] Funciona en Chrome, Firefox, Safari

---

## Checklist de Progreso

### Architect ✅ (2026-02-17)
- [x] Requerimientos analizados
- [x] Modelo de datos definido
- [x] API diseñada
- [x] Componentes identificados
- [x] Riesgos identificados
- [x] Dependencias mapeadas
- [x] Especificación documentada

### Developer ⏳ (Estimado: 2026-02-19)
- [ ] Crear tabla en Supabase
- [ ] Implementar supabaseApi.ts methods
- [ ] Crear página Campuses.tsx
- [ ] Crear componente CampusForm.tsx
- [ ] Implementar validaciones
- [ ] Integrar upload de logo
- [ ] Probar en local
- [ ] Documentar uso

**Notas de implementación:**
[Espacio para Developer]

### Tester ⏳ (Estimado: 2026-02-20)
- [ ] Tests unitarios CampusForm
- [ ] Tests unitarios Campuses page
- [ ] Tests de integración CRUD completo
- [ ] Test de subida de logo
- [ ] Test de validaciones
- [ ] Cobertura > 80%
- [ ] Probar casos edge (sin datos, muchos datos)

**Bugs encontrados:**
[Espacio para Tester]

### Reviewer ⏳ (Estimado: 2026-02-20)
- [ ] Código revisado
- [ ] Estándares verificados
- [ ] Seguridad revisada
- [ ] Performance revisada
- [ ] Aprobado/Rechazado

**Comentarios:**
[Espacio para Reviewer]

### Integrator ⏳ (Estimado: 2026-02-21)
- [ ] PR mergeado
- [ ] CI/CD pasó
- [ ] Deploy a staging
- [ ] Smoke tests en staging
- [ ] Issue cerrado

**Notas:**
[Espacio para Integrator]

---

## Recursos

### Mockups/UI
[Links a diseños en Figma o descripción]

### Referencias
- Ejemplo similar: Gestión de usuarios (si existe)
- Documentación Supabase: https://supabase.com/docs

### Datos de Prueba
```typescript
const mockCampuses = [
  {
    id: '1',
    name: 'Sede Principal',
    address: 'Calle Principal 123',
    phone: '555-0100',
    email: 'principal@amoraccion.org',
    is_active: true
  },
  {
    id: '2',
    name: 'Sede Norte',
    address: 'Calle Norte 456',
    phone: '555-0200',
    email: 'norte@amoraccion.org',
    is_active: true
  }
];
```

---

## Notas Adicionales

### Preguntas Pendientes
- [ ] ¿Necesitamos campo "Horario de atención"?
- [ ] ¿Soportar múltiples fotos por sede?
- [ ] ¿Necesitamos coordinador de sede?

### Decisiones Tomadas
- Usar soft delete (is_active) en lugar de delete físico
- Logo es opcional (mostrar placeholder si no hay)
- Una sede puede tener múltiples años escolares

---

**Estado:** En desarrollo  
**Última actualización:** 2026-02-17  
**Próximo milestone:** Developer completa implementación

**Historial de cambios:**
- 2026-02-17: Creado por Architect
