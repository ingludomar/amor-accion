# Sistema de Gestión de Asistencia Escolar - Amor y Acción

## 1. Descripción General

**Nombre del Proyecto:** Sistema de Gestión de Asistencia Escolar para Amor y Acción  
**Tipo:** Aplicación web multi-sede  
**Organización:** ONG Amor y Acción (trabaja con niños en situación vulnerable)  
**Propósito:** Registrar y gestionar la asistencia de estudiantes a las actividades de la organización

---

## 2. Funcionalidades del Sistema

### 2.1 Gestión de Sedes (Campuses)
- CRUD completo de sedes
- Cada sede tiene: nombre, dirección, ciudad, logo
- Posibilidad de activar/desactivar sedes

### 2.2 Gestión de Usuarios
- **Roles:**
  - Administrador (acceso total)
  - Coordinador (gestiona una sede)
  - Profesor (registra asistencia)
- **Campos de usuario:** email, nombre completo, documento, teléfono, roles, sedes asignadas
- Autenticación JWT

### 2.3 Gestión de Estudiantes
- CRUD completo de estudiantes
- **Campos:** nombre, apellido, fecha nacimiento, género, tipo/número documento, email, teléfono, dirección, tipo sangre, alergias
- Asignación a sede
- **Relación con Acudientes:**绑定 uno o varios acudientes (padre, madre, abuelo, etc.)
- **Hermanos:** estudiantes que comparten padre/madre se identifican como hermanos

### 2.4 Gestión de Acudientes
- CRUD completo de acudientes
- **Campos:** nombre, apellido, documento, teléfonos (casa, móvil), WhatsApp, email, dirección, ocupación
- **Tipos de relación:**
  - Padre
  - Madre
  - Abuelo/Abuela
  - Tío/Tía
  - Hermano/Hermana
  - Tutor legal
  - Otro

### 2.5 Gestión de Familias *(Opcional)*
- Agrupar estudiantes que viven en el mismo hogar
- **Campos:** nombre familia, dirección, teléfono, contactos de emergencia
- Relacionar estudiantes a familia

### 2.6 Control de Asistencia
- Crear sesiones de clase por sede/año escolar
- Registrar asistencia: Presente, Ausente, Tardanza
- Historial de cambios (quién cambió, cuándo)
- Ver asistencia por estudiante o por grupo

### 2.7 Gestión Académica
- Años escolares por sede
- Grupos de curso ( Jardín, Infancia, Pre-juvenitud)
- Múltiples profesores por grupo

---

## 3. Modelo de Datos

### Tablas Principales
| Tabla | Descripción |
|------|-------------|
| `campuses` | Sedes de la organización |
| `users` | Usuarios del sistema |
| `profiles` | Perfiles (ligado a Supabase Auth) |
| `students` | Estudiantes (código generado automático) |
| `guardians` | Acudientes/padres |
| `student_guardians` | Relación estudiante-acudiente (con tipo relación) |
| `families` | Grupos familiares (opcional) |
| `student_families` | Relación estudiante-familia |
| `school_years` | Años escolares por sede |
| `class_sessions` | Sesiones de clase |
| `attendance_records` | Registros de asistencia |

---

## 4. Tech Stack

| Componente | Tecnología |
|------------|------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend API | Directo a Supabase (sin backend propio) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage (logos, fotos) |
| Despliegue | Vercel |

---

## 5. Flujos Principales

### 5.1 Registro de Estudiante
1. Ir a Estudiantes → Nuevo
2. Llenar datos básicos (nombre, sede, etc.)
3. En pestaña "Acudientes":
   - Buscar y seleccionar acudientes existentes
   - Para cada uno, especificar tipo (padre, madre, etc.)
   - Opcionalmente crear nuevo acudiente
4. Guardar

### 5.2 Registrar Asistencia
1. Ir a Asistencia
2. Seleccionar sede y grupo
3. Seleccionar fecha
4. Ver lista de estudiantes del grupo
5. Marcar: Presente, Ausente, Tardanza
6. Guardar

### 5.3 Ver Hermanos
1. Al ver datos de un estudiante
2. Si tiene padre/madre asignado
3. El sistema muestra otros estudiantes con el mismo padre/madre

---

## 6. Roles y Permisos

| Rol | Permisos |
|-----|----------|
| Administrador | Acceso total a todas las sedes |
| Coordinador | Gestiona usuarios y estudiantes de su sede |
| Profesor | Solo registra asistencia |

---

## 7. Estados de Funcionalidades

| Módulo | Estado | Notas |
|--------|--------|-------|
| Login | ✅ Completo | |
| Dashboard | ✅ Completo | |
| Sedes | ✅ Completo | Logo, ciudad, activar/desactivar |
| Usuarios | ✅ Completo | Roles: admin, coordinador, profesor |
| Estudiantes | ✅ Completo | Foto, grupo, sede, acudientes |
| Acudientes | ✅ Completo | |
| Familias | ✅ Completo | Opcional |
| Años escolares | ✅ Completo | |
| **Asistencia** | ⚠️ Incompleto | Falta: crear sesiones, tomar asistencia |
| **Reportes** | ❌ Pendiente | No implementado |

---

## 8. Requisitos No Funcionales

- **Rendimiento:** Carga de página < 3 segundos
- **Responsive:** Funciona en móvil y escritorio
- **Seguridad:** Autenticación JWT, RLS en Supabase
- **Mantenibilidad:** Código documentado, tests

---

## 9. Futuras Mejoras (Backlog)

1. **Reportes de Asistencia**
   - Por estudiante (mensual, anual)
   - Por grupo
   - Por sede
   - Porcentaje de asistencia

2. **Notificaciones**
   - SMS/WhatsApp a padres cuando niño falta
   - Recordatorios de actividades

3. **Dashboard Mejorado**
   - Gráficos de asistencia
   - Indicadores clave

4. **Importación Masiva**
   - Cargar estudiantes desde Excel

5. **App Móvil**
   - Para que profesores registren asistencia

---

*Documento creado para referencia y documentación de requerimientos del proyecto*