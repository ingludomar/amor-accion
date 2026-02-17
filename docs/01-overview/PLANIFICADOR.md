# 📋 PLANIFICADOR DE PROYECTO - Amor Acción

**Fecha de inicio:** Febrero 2026  
**Estado:** Configuración inicial de Supabase en progreso  
**Progreso general:** 15% completado

---

## 🎯 FASES DEL PROYECTO

### ✅ FASE 1: CONFIGURACIÓN INICIAL (En Progreso)
**Tiempo estimado:** 1-2 semanas  
**Estado:** 🔧 En desarrollo

#### 1.1 Configuración de Supabase
- [ ] Crear proyecto en Supabase
- [ ] Ejecutar script `supabase-schema.sql` en SQL Editor
- [ ] Configurar buckets de Storage (logos, student-photos)
- [ ] Ejecutar script `supabase-storage-setup.sql`
- [ ] Crear usuario admin inicial (admin@amoraccion.com)
- [ ] Configurar políticas RLS (Row Level Security)
- [ ] Verificar conexión desde el frontend

#### 1.2 Variables de Entorno
- [ ] Copiar `frontend/.env.example` a `frontend/.env`
- [ ] Configurar `VITE_SUPABASE_URL`
- [ ] Configurar `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar que las variables funcionen en local

#### 1.3 Instalación Local
- [ ] Clonar repositorio
- [ ] Ejecutar `cd frontend && npm install`
- [ ] Probar `npm run dev`
- [ ] Verificar que no hay errores en consola
- [ ] Probar login con credenciales de prueba

#### 1.4 Docker (Opcional)
- [ ] Verificar Docker instalado
- [ ] Ejecutar `docker-compose up -d`
- [ ] Verificar contenedor corre en puerto 5173
- [ ] Confirmar hot-reload funciona

**Checkpoints Fase 1:**
- [ ] ✅ Login funciona correctamente
- [ ] ✅ Se ven las sedes en el dashboard
- [ ] ✅ No hay errores rojos en la consola del navegador

---

### 🔨 FASE 2: FUNCIONALIDADES BÁSICAS (Pendiente)
**Tiempo estimado:** 2-3 semanas  
**Estado:** ⏳ No iniciado

#### 2.1 Gestión de Sedes (Campus)
- [ ] Crear primera sede de prueba
- [ ] Verificar que se guarda en Supabase
- [ ] Editar sede existente
- [ ] Verificar cambios se reflejan inmediatamente
- [ ] Listar todas las sedes correctamente

#### 2.2 Gestión de Años Escolares
- [ ] Crear año escolar 2025-2026
- [ ] Verificar fechas de inicio y fin
- [ ] Marcar año como "actual"
- [ ] Listar años escolares por sede

#### 2.3 Gestión de Estudiantes (Básico)
- [ ] Crear primer estudiante de prueba
- [ ] Verificar código de estudiante se genera automático
- [ ] Subir foto de estudiante (usar Storage)
- [ ] Verificar foto se muestra correctamente
- [ ] Editar datos del estudiante
- [ ] Buscar estudiante por nombre
- [ ] Filtrar estudiantes por sede

#### 2.4 Gestión de Acudientes
- [ ] Crear acudiente vinculado a estudiante
- [ ] Verificar relación estudiante-acudiente
- [ ] Editar información del acudiente
- [ ] Listar acudientes de un estudiante

**Checkpoints Fase 2:**
- [ ] ✅ Se pueden crear 10+ estudiantes sin errores
- [ ] ✅ Las fotos se suben y se ven correctamente
- [ ] ✅ Los acudientes se vinculan correctamente
- [ ] ✅ La navegación entre páginas es fluida

---

### 🎨 FASE 3: PERSONALIZACIÓN (Pendiente)
**Tiempo estimado:** 1 semana  
**Estado:** ⏳ No iniciado

#### 3.1 Logo de la Organización
- [ ] Ir a `/settings`
- [ ] Subir logo de Amor Acción
- [ ] Verificar logo aparece en el header
- [ ] Probar con diferentes formatos (PNG, JPG)
- [ ] Verificar logo se ve bien en móvil

#### 3.2 Ajustes de Diseño
- [ ] Verificar colores corporativos
- [ ] Confirmar tipografía es legible
- [ ] Probar responsive en tablet
- [ ] Probar responsive en móvil
- [ ] Verificar contraste de colores (accesibilidad)

#### 3.3 Configuración de Campos
- [ ] Revisar campos obligatorios de estudiantes
- [ ] Agregar/quitar campos según necesidad
- [ ] Configurar tipos de documento (CC, TI, PAS)
- [ ] Configurar tipos de sangre

**Checkpoints Fase 3:**
- [ ] ✅ El logo se ve profesional
- [ ] ✅ La app se ve bien en celular
- [ ] ✅ Todos los campos son relevantes

---

### 📊 FASE 4: SISTEMA DE ASISTENCIA (Pendiente)
**Tiempo estimado:** 3-4 semanas  
**Estado:** ⏳ No iniciado  
**⚠️ Prioridad: ALTA - Es el corazón del sistema**

#### 4.1 Gestión de Clases/Grupos
- [ ] Crear tabla/colección de grupos en Supabase
- [ ] Crear interfaz para crear grupos
- [ ] Asignar estudiantes a grupos
- [ ] Asignar profesor/voluntario a grupo
- [ ] Definir horario del grupo
- [ ] Listar grupos por sede y año escolar

#### 4.2 Sesiones de Clase
- [ ] Crear sesión de clase (fecha, hora, grupo)
- [ ] Listar sesiones del día
- [ ] Ver sesiones pasadas
- [ ] Editar/cancelar sesión

#### 4.3 Toma de Asistencia
- [ ] Abrir interfaz de toma de asistencia
- [ ] Ver lista de estudiantes del grupo
- [ ] Marcar: Presente ✅, Ausente ❌, Tarde ⏰, Excusado 📝
- [ ] Guardar asistencia en Supabase
- [ ] Verificar se guarda correctamente
- [ ] Permitir editar asistencia ya guardada
- [ ] Agregar notas/observaciones

#### 4.4 Reportes Básicos
- [ ] Ver asistencia por estudiante (historial)
- [ ] Ver asistencia por grupo (diaria)
- [ ] Ver porcentaje de asistencia
- [ ] Exportar a PDF (opcional)
- [ ] Exportar a Excel (opcional)

**Checkpoints Fase 4:**
- [ ] ✅ Se puede tomar asistencia de 30+ estudiantes rápidamente
- [ ] ✅ Los reportes muestran datos reales
- [ ] ✅ No se pierden datos de asistencia
- [ ] ✅ Es fácil corregir errores

---

### 🧪 FASE 5: TESTING Y CALIDAD (Pendiente)
**Tiempo estimado:** 2 semanas  
**Estado:** ⏳ No iniciado

#### 5.1 Testing Manual
- [ ] Crear 50 estudiantes de prueba
- [ ] Crear 5 grupos diferentes
- [ ] Tomar asistencia por 5 días consecutivos
- [ ] Verificar todos los reportes
- [ ] Probar en diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Probar en celular (iOS y Android)

#### 5.2 Testing con Usuarios Reales
- [ ] Invitar a 2-3 voluntarios a probar
- [ ] Darles tareas específicas (crear estudiante, tomar asistencia)
- [ ] Observar dónde se confunden
- [ ] Anotar bugs o mejoras
- [ ] Corregir problemas encontrados

#### 5.3 Pruebas de Estrés
- [ ] Verificar sistema con 100+ estudiantes
- [ ] Verificar carga de 10+ fotos simultáneas
- [ ] Probar con 5 usuarios al mismo tiempo
- [ ] Medir velocidad de carga

#### 5.4 Validación de Datos
- [ ] Verificar no se permiten emails duplicados
- [ ] Verificar códigos de estudiante son únicos
- [ ] Validar fechas (no fechas futuras en nacimiento)
- [ ] Verificar campos obligatorios

**Checkpoints Fase 5:**
- [ ] ✅ 3 voluntarios usaron el sistema sin ayuda
- [ ] ✅ No hay errores críticos
- [ ] ✅ El sistema es rápido
- [ ] ✅ Los datos son consistentes

---

### 🚀 FASE 6: DEPLOY Y PRODUCCIÓN (Pendiente)
**Tiempo estimado:** 1 semana  
**Estado:** ⏳ No iniciado

#### 6.1 Preparación para Deploy
- [ ] Revisar `vercel.json` configurado correctamente
- [ ] Verificar variables de entorno listas
- [ ] Hacer build local: `npm run build`
- [ ] Verificar no hay errores de build
- [ ] Optimizar imágenes y assets

#### 6.2 Deploy en Vercel
- [ ] Crear cuenta en Vercel (si no existe)
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno en Vercel
- [ ] Hacer deploy
- [ ] Verificar URL funciona
- [ ] Probar login en producción

#### 6.3 Configuración de Dominio (Opcional)
- [ ] Configurar dominio personalizado (ej: asistencia.amoraccion.org)
- [ ] Configurar SSL (HTTPS)
- [ ] Verificar certificado válido

#### 6.4 Backup y Seguridad
- [ ] Configurar backups automáticos en Supabase
- [ ] Documentar proceso de restore
- [ ] Verificar políticas RLS están activas
- [ ] Cambiar contraseña del admin por una segura
- [ ] Crear usuarios para cada voluntario

#### 6.5 Capacitación
- [ ] Crear guía rápida de uso (1 página)
- [ ] Hacer reunión de capacitación con voluntarios
- [ ] Dejar video tutorial corto (opcional)
- [ ] Establecer canal de soporte (WhatsApp/Email)

**Checkpoints Fase 6:**
- [ ] ✅ La URL pública funciona perfecto
- [ ] ✅ Los voluntarios pueden entrar sin problemas
- [ ] ✅ Los datos se guardan correctamente en producción
- [ ] ✅ Hay un plan si algo falla

---

## 📅 CRONOGRAMA SUGERIDO

```
Semana 1-2:  FASE 1 (Configuración inicial)
Semana 3-5:  FASE 2 (Funcionalidades básicas)
Semana 6:    FASE 3 (Personalización)
Semana 7-10: FASE 4 (Sistema de asistencia) ← CRÍTICA
Semana 11-12:FASE 5 (Testing)
Semana 13:   FASE 6 (Deploy)

Total: ~3 meses para versión 1.0 completa
```

---

## ⚠️ DEPENDENCIAS CRÍTICAS

1. **FASE 1 debe completarse antes de FASE 2**
   - No se pueden crear estudiantes sin Supabase configurado

2. **FASE 4 requiere FASE 2 completada**
   - No se puede tomar asistencia sin estudiantes

3. **FASE 6 solo cuando FASE 5 esté al 100%**
   - No deployar con bugs críticos

---

## 🎯 MÉTRICAS DE ÉXITO

### Métricas Técnicas:
- [ ] Tiempo de carga < 3 segundos
- [ ] 99% de uptime
- [ ] 0 bugs críticos
- [ ] Compatible con 95% de navegadores

### Métricas de Usuario:
- [ ] Voluntario puede crear estudiante en < 2 minutos
- [ ] Tomar asistencia de 30 estudiantes en < 5 minutos
- [ ] 90% de voluntarios usan sistema sin ayuda después de capacitación
- [ ] Reducción de 50% en tiempo de registro vs método anterior

---

## 📝 NOTAS Y OBSERVACIONES

### Problemas Conocidos Actuales:
- ⚠️ Algunos errores de TypeScript en consola (no críticos)
- ⚠️ Página de asistencia está simplificada (falta desarrollo completo)
- ⚠️ No hay sistema de reportes aún

### Decisiones Pendientes:
- ¿Se necesita app móvil nativa o con web es suficiente?
- ¿Qué reportes específicos necesitan los voluntarios?
- ¿Se requiere impresión de carnets físicos o digital es suficiente?

---

## ✅ CÓMO USAR ESTE PLANIFICADOR

1. **Revisa la fase actual** (marcada arriba)
2. **Trabaja en las tareas unchecked** de esa fase
3. **Marca [x] cuando completes** cada tarea
4. **Actualiza el progreso general** abajo
5. **Mueve a la siguiente fase** solo cuando la actual esté 100%

**Regla de oro:** Mejor hacer bien una fase que hacer mal todas.

---

## 📊 PROGRESO GENERAL

**Completado:** ░░░░░░░░░░ 15%

**Fase actual:** 1 - Configuración Inicial  
**Próximo milestone:** Primer estudiante creado exitosamente

**Última actualización:** Febrero 2026  
**Próxima revisión:** [Fecha pendiente]

---

## 💡 TIPS PARA EL EQUIPO

1. **No saltar fases** - Cada una depende de la anterior
2. **Probar en cada tarea** - No acumular pruebas al final
3. **Documentar errores** - Si algo falla, anótalo aquí
4. **Pedir ayuda temprano** - Si algo toma más de 2 días, consultar
5. **Hacer backups** - Antes de cambios grandes en la BD
6. **Comunicar avances** - Actualizar este archivo semanalmente

---

**¡Manos a la obra! 🚀**

Empezar por la Fase 1, tarea 1.1.1: Crear proyecto en Supabase.
