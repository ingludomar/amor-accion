# PLAN INCREMENTAL - AmorAccion en Supabase

## 📋 CHECKLIST DE DESARROLLO

### FASE 0: PREPARACIÓN (COMPLETADO) ✅
- [x] Crear proyecto en Supabase
- [x] Ejecutar script SQL (tablas creadas)
- [x] Crear usuario admin en Supabase Auth
- [x] Crear perfil admin en tabla profiles
- [x] Repositorio en GitHub

---

### FASE 1: CONEXIÓN BÁSICA (PRIORIDAD ALTA)
**Objetivo:** Conectar frontend con Supabase y autenticación básica

- [ ] Crear archivo `supabaseClient.ts` con configuración correcta
- [ ] Actualizar `authStore.ts` para usar Supabase Auth
- [ ] Actualizar `Login.tsx` (simplificar, solo email/password)
- [ ] Actualizar `Dashboard.tsx` (mínimo, solo mostrar usuario logueado)
- [ ] Testear: Login funciona y redirige a Dashboard

**Archivos a modificar:** 4
**Tiempo estimado:** 30 min
**Tokens estimados:** 15%

---

### FASE 2: SEDES (CAMPUS) (PRIORIDAD ALTA)
**Objetivo:** CRUD básico de sedes - requisito para estudiantes

- [ ] Crear tabla `campuses` en Supabase (si no existe)
- [ ] Insertar sede por defecto: "Sede Principal"
- [ ] Actualizar `Campuses.tsx` (simplificar, solo listar y crear)
- [ ] Actualizar API para usar Supabase en lugar de FastAPI
- [ ] Testear: Ver sedes, crear sede

**Archivos a modificar:** 2
**Tiempo estimado:** 25 min
**Tokens estimados:** 12%

---

### FASE 3: ESTUDIANTES BÁSICO (PRIORIDAD ALTA)
**Objetivo:** CRUD de estudiantes sin acudientes

- [ ] Actualizar `Students.tsx` (listar, crear, editar)
- [ ] Crear tipos TypeScript compatibles con Supabase
- [ ] Implementar funciones CRUD en `api.ts`
- [ ] Relacionar estudiantes con sede (campus_id)
- [ ] Testear: Crear estudiante, ver lista, editar

**Archivos a modificar:** 3
**Tiempo estimado:** 40 min
**Tokens estimados:** 20%

---

### FASE 4: ASISTENCIA BÁSICA (PRIORIDAD MEDIA)
**Objetivo:** Registrar asistencia sin estadísticas complejas

- [ ] Crear tabla `class_sessions` en Supabase
- [ ] Crear tabla `attendance_records` en Supabase
- [ ] Actualizar `Attendance.tsx` (simplificar interfaz)
- [ ] Implementar: Crear sesión, tomar lista, guardar
- [ ] Testear: Crear sesión, marcar asistencia

**Archivos a modificar:** 3
**Tiempo estimado:** 35 min
**Tokens estimados:** 18%

---

### FASE 5: ACUDIENTES (PRIORIDAD MEDIA)
**Objetivo:** Agregar acudientes a estudiantes

- [ ] Crear tabla `guardians` en Supabase
- [ ] Crear tabla `student_guardians` (relación)
- [ ] Actualizar formulario de estudiante para agregar acudientes
- [ ] Testear: Crear estudiante con acudiente

**Archivos a modificar:** 2
**Tiempo estimado:** 30 min
**Tokens estimados:** 15%

---

### FASE 6: USUARIOS Y ROLES (PRIORIDAD BAJA)
**Objetivo:** Gestión de usuarios (después de tener sistema funcional)

- [ ] Actualizar `Users.tsx`
- [ ] Implementar creación de usuarios desde admin
- [ ] Asignar roles básicos (admin, profesor)
- [ ] Testear: Crear usuario, asignar rol

**Archivos a modificar:** 2
**Tiempo estimado:** 25 min
**Tokens estimados:** 12%

---

### FASE 7: REPORTES Y ESTADÍSTICAS (PRIORIDAD BAJA)
**Objetivo:** Dashboard completo y reportes

- [ ] Actualizar `Dashboard.tsx` con estadísticas reales
- [ ] Crear reportes básicos de asistencia
- [ ] Exportar datos
- [ ] Testear: Ver estadísticas

**Archivos a modificar:** 2
**Tiempo estimado:** 20 min
**Tokens estimados:** 10%

---

## 📊 ESTADÍSTICAS DEL PLAN

**Total de Fases:** 7
**Total Archivos a Modificar:** ~18
**Tiempo Total Estimado:** ~3-4 horas
**Tokens Total Estimado:** ~102%

**Estrategia:** Cada fase es funcional por sí sola. Si llegamos al 100% de tokens, la siguiente persona puede continuar desde la última fase completada.

---

## 🔄 CONTINUIDAD DESPUÉS DEL 100% DE TOKENS

### Si llegamos al límite de tokens:

1. **Documentar estado actual:**
   - Última fase completada
   - Archivos modificados
   - Errores pendientes

2. **Crear nuevo chat:**
   - Abrir opencode nuevo
   - Ejecutar: `opencode resume`
   - Leer este checklist
   - Continuar desde la siguiente fase

3. **Backup del código:**
   - Todo está en GitHub
   - Commit con mensaje claro: "Fase X completada - continuar en Fase Y"

---

## 📝 NOTAS IMPORTANTES

### Dependencias del modelo de datos:
```
Campuses → Estudiantes → Acudientes
                ↓
          Sesiones → Asistencia
```

**NO podemos:** Crear estudiante sin sede
**NO podemos:** Tomar asistencia sin estudiantes
**SÍ podemos:** Tener sistema funcional sin acudientes (fase 3)
**SÍ podemos:** Tener sistema funcional sin reportes avanzados (fase 7)

### Arquitectura Supabase:
```
Frontend (Vercel)
      ↓
Supabase Auth (login)
      ↓
Supabase PostgreSQL (datos)
      ↓
RLS Policies (seguridad)
```

### Archivos críticos a mantener limpios:
1. `src/lib/api.ts` - API de Supabase
2. `src/store/authStore.ts` - Autenticación
3. `src/pages/Login.tsx` - Entrada al sistema
4. `supabase-schema.sql` - Estructura BD

---

## ✅ CRITERIOS DE ÉXITO POR FASE

**Fase 1:** Login funciona, sesión persiste al recargar
**Fase 2:** Listar sedes, crear nueva sede
**Fase 3:** CRUD completo de estudiantes
**Fase 4:** Crear sesión, marcar asistencia, guardar
**Fase 5:** Agregar acudiente a estudiante
**Fase 6:** Crear usuarios, asignar roles
**Fase 7:** Dashboard muestra datos reales

---

## 🚀 INSTRUCCIONES PARA CONTINUAR

### Si eres TÚ continuando:
1. Ver último commit en GitHub
2. Ver última fase marcada en este archivo
3. Continuar con la siguiente fase

### Si es ALGUIEN MÁS continuando:
1. Leer este checklist completo
2. Verificar estado en GitHub (último commit)
3. Probar la app en Vercel (¿qué funciona?)
4. Continuar desde la última fase completada

---

**Iniciamos Fase 1 cuando me confirmes.**

**Estado actual:** Fase 0 completada (100%)
**Próxima fase:** Fase 1 - Conexión Básica
**Listo para iniciar:** SÍ
