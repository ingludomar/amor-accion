# Feature-004: Sistema de Gestión de Familias y Acudientes

## Información General
- **ID**: FEATURE-004
- **Prioridad**: Alta
- **Fase**: 2
- **Fecha inicio**: 2026-02-27
- **Estimación**: 2-3 días

## Descripción
Implementar el sistema completo de gestión de familias, padres y acudientes. Permite agrupar estudiantes en familias (hermanos), gestionar información de contacto de padres y acudientes, y mantener un registro de las relaciones.

## Contexto
- Estudiantes pueden ser hermanos (pertenecer a la misma familia)
- Un padre/acudiente puede tener múltiples hijos en el sistema
- Un acudiente puede no ser familiar (tía, abuela, tutor legal)
- Múltiples teléfonos por persona (fijo, móvil, WhatsApp)

## Agente Responsable
- **Architect**: @agent-architect
- **Developer**: @agent-developer
- **Tester**: @agent-tester
- **Reviewer**: @agent-reviewer
- **Integrator**: @agent-integrator

---

## Especificaciones Técnicas

### Modelo de Datos

```sql
-- Tabla: families
CREATE TABLE families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,                     -- "Familia Rodríguez" (opcional)
    address TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: student_families
CREATE TABLE student_families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'hijo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, family_id)
);

-- Tabla: guardian_families
CREATE TABLE guardian_families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    relationship_type TEXT,         -- padre, madre, abuela, tio, tutor
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guardian_id, family_id)
);

-- Modificar tabla guardians
ALTER TABLE guardians 
ADD COLUMN IF NOT EXISTS phone_home TEXT,
ADD COLUMN IF NOT EXISTS phone_mobile TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_note TEXT;
```

### API Methods

```typescript
// familyAPI
familyAPI.getAll(search?: string): Promise<Family[]>
familyAPI.getById(id: string): Promise<FamilyWithMembers>
familyAPI.create(family: CreateFamilyRequest): Promise<Family>
familyAPI.update(id: string, family: UpdateFamilyRequest): Promise<Family>
familyAPI.delete(id: string): Promise<void>
familyAPI.assignStudent(studentId, familyId, relationshipType): Promise<void>
familyAPI.unassignStudent(studentId, familyId): Promise<void>
familyAPI.assignGuardian(guardianId, familyId, relationshipType, isPrimary): Promise<void>
familyAPI.unassignGuardian(guardianId, familyId): Promise<void>
familyAPI.getByStudent(studentId): Promise<StudentFamily[]>
familyAPI.getUnassignedStudents(excludeFamilyId?: string): Promise<Student[]>

// guardianAPI (actualizado)
guardianAPI.getAll(search?: string): Promise<Guardian[]>
guardianAPI.create(guardian: CreateGuardianRequest): Promise<Guardian>
guardianAPI.update(id: string, guardian: UpdateGuardianRequest): Promise<Guardian>
```

### Interfaces TypeScript

```typescript
interface Family {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  students?: Student[];
  guardians?: GuardianWithFamily[];
}

interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type?: string;
  document_number?: string;
  phone_home?: string;
  phone_mobile?: string;
  whatsapp_phone?: string;
  has_whatsapp?: boolean;
  whatsapp_note?: string;
  email?: string;
  address?: string;
  occupation?: string;
}

interface GuardianWithFamily extends Guardian {
  guardian_families?: {
    relationship_type: string;
    is_primary: boolean;
  };
}
```

### Páginas/Rutas

- `/families` - Lista de familias (ProtectedRoute)
- `/families/new` - Crear nueva familia
- `/families/:id` - Ver/editar familia con miembros
- `/guardians` - Lista de padres/acudientes
- `/guardians/new` - Crear nuevo padre/acudiente
- `/guardians/:id` - Ver/editar padre/acudiente

---

## Casos de Uso

### 1. Familia con Hermanos
```
Familia Rodríguez:
  - Juan Rodríguez (estudiante)
  - María Rodríguez (estudiante)
  - Pedro Rodríguez (padre)
  - Ana García (madre)
  - Rosa García (abuela - acudiente)
```

### 2. Acudiente Externo
```
Estudiante: Lucas Pérez
  - Familia Pérez
  - Padres: Luis Pérez, Carmen Ruiz
  - Acudiente: María López (tía - NO es padre)
```

### 3. Múltiples Teléfonos
```
Padre: Pedro Rodríguez
  - Teléfono casa: 601 234 5678
  - Teléfono móvil: 300 123 4567
  - WhatsApp: 300 123 4567 (mismo que móvil)
  - Nota: "Prefiere mensajes por la mañana"
```

---

## Dependencias

- **Bloqueado por:** Ninguno
- **Bloquea a:** 
  - Sistema de notificaciones a padres
  - Reportes familiares
  - Historial de asistencia por familia

---

## Criterios de Aceptación

### Familias
- [ ] Usuario puede crear familia con nombre
- [ ] Usuario puede ver lista de todas las familias
- [ ] Usuario puede editar familia
- [ ] Usuario puede eliminar familia (soft delete)
- [ ] Usuario puede agregar estudiantes a familia
- [ ] Usuario puede agregar padres/acudientes a familia

### Padres/Acudientes
- [ ] Usuario puede crear padre/acudiente con todos los campos de teléfono
- [ ] Usuario puede especificar si tiene WhatsApp
- [ ] Usuario puede poner teléfono de WhatsApp diferente al móvil
- [ ] Usuario puede agregar notas de WhatsApp
- [ ] Usuario puede ver lista de todos los padres/acudientes
- [ ] Usuario puede editar información
- [ ] Sistema muestra indicadores de WhatsApp

---

## Checklist de Progreso

### Architect ✅ (2026-02-27)
- [x] Requerimientos analizados
- [x] Modelo de datos definido
- [x] API diseñada
- [x] Componentes identificados
- [x] Riesgos identificados
- [x] Dependencias mapeadas
- [x] Especificación documentada

### Developer ✅ (2026-02-27)
- [x] Migración SQL creada
- [x] API implementada en supabaseApi.ts
- [x] Componente Families.tsx creado
- [x] Componente Guardians.tsx creado
- [x] Rutas agregadas en App.tsx
- [x] Menú actualizado en Layout.tsx
- [ ] Probar en local (requiere migración)

### Tester ⏳ (Estimado: 2026-02-28)
- [ ] Ejecutar migración en Supabase
- [ ] Testing de CRUD familias
- [ ] Testing de CRUD padres/acudientes
- [ ] Testing de relaciones
- [ ] Verificar UI de teléfonos y WhatsApp

### Reviewer ⏳ (Estimado: 2026-02-28)
- [ ] Código revisado
- [ ] Estándares verificados
- [ ] Seguridad revisada
- [ ] Aprobado/Rechazado

### Integrator ⏳ (Estimado: 2026-02-28)
- [ ] PR mergeado
- [ ] CI/CD pasó
- [ ] Migración ejecutada en Supabase
- [ ] Deploy a producción

---

## ⚠️ Pasos para Deploy

1. **Ejecutar migración en Supabase** (antes del deploy):
   ```sql
   -- Ejecutar el contenido de database/migration-families-guardians.sql
   ```

2. **Hacer deploy** a Vercel

3. **Verificar** que las nuevas páginas funcionen

---

## Recursos

### Referencias
- Documentación Supabase: https://supabase.com/docs
- Patrón de UI: Similar a Campuses.tsx y Users.tsx

### Datos de Prueba
```typescript
const mockFamily = {
  name: 'Familia Rodríguez',
  address: 'Calle 123',
  phone: '3001234567'
};

const mockGuardian = {
  first_name: 'Pedro',
  last_name: 'Rodríguez',
  document_type: 'CC',
  document_number: '12345678',
  phone_mobile: '3001234567',
  has_whatsapp: true,
  whatsapp_phone: '3001234567',
  email: 'pedro@email.com',
  occupation: 'Ingeniero'
};
```

---

**Estado:** En desarrollo  
**Última actualización:** 2026-02-27  
**Próximo milestone:** Testing y deploy

**Historial de cambios:**
- 2026-02-27: Creado por Developer
