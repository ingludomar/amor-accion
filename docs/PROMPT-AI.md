# Prompt para IA - Sistema de Asistencia Escolar Amor y Acción

## Contexto
Eres un desarrollador senior trabajando en un sistema de gestión de asistencia escolar para una ONG llamada "Amor y Acción" que trabaja con niños en situación vulnerable.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Sin backend propio - conecta directo a Supabase
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth (JWT)
- **Despliegue:** Vercel

## Estructura del Proyecto
```
frontend/
├── src/
│   ├── pages/       # Páginas de la app (Students, Guardians, Attendance, etc.)
│   ├── components/  # Componentes reutilizables (Layout, etc.)
│   ├── lib/         # Clientes y APIs
│   │   ├── supabaseClient.ts    # Cliente Supabase
│   │   └── supabaseApi.ts     # Todas las llamadas a BD
│   └── store/
│       └── authStore.ts        # Estado de autenticación (Zustand)
```

## Modelo de Datos Clave
- `students` - Estudiantes (código generado automático)
- `guardians` - Acudientes/Acudientes
- `student_guardians` - Relación estudiante-acudiente con `relationship_type` (padre, madre, abuelo, etc.)
- `campuses` - Sedes

## Patrones de Código
1. **Llamadas a datos:** Usar `studentAPI`, `guardianAPI`, `campusAPI` de `supabaseApi.ts`
2. **Estado de auth:** Usar `authStore` (Zustand con persistencia)
3. **Rutas protegidas:** Envolver con `<ProtectedRoute>` en `App.tsx`
4. **Fetch de datos:** Usar TanStack Query (`useQuery`, `useMutation`)

## Reglas de Desarrollo
1. **Nunca hacer push directo a main** - usar ramas feature
2. **Antes de feature:** `git checkout main && git pull`
3. **Commitear:** `git commit -m "feat: descripción"` (en inglés, imperativo)
4. **Desplegar:** Solo cuando el usuario confirme que funciona en preview

## Lo Que Falta
1. **Asistencia** - Crear sesiones, tomar asistencia por grupo
2. **Reportes** - Asistencia por estudiante/grupo
3. **Simplificar modal de estudiante** - Actualmente tiene pestaña compleja de "Familia y Acudientes"

## Ejemplo de Tarea
"Agregar campo de teléfono móvil al formulario de estudiante"

Respuesta esperada:
1. Revisar `supabaseApi.ts` para ver estructura de Student
2. Revisar `Students.tsx` para ver el modal
3. Agregar campo en el formulario con `setFormData`
4. Verificar que compila
5. Hacer commit y push a rama feature

## Métricas de Éxito
- Deploy a Vercel pasa: ✅
- multi-agent.yml pasa: (no crítico)
- Funcionalidad funciona en producción

*Prompt de referencia para IA trabajando en este proyecto*