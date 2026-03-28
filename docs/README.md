# 📚 Documentación del Proyecto

Bienvenido a la documentación de **Amor Acción - Sistema de Asistencia**.

## 🗂️ Estructura de Documentación

Esta carpeta está organizada por secciones numeradas para facilitar la navegación:

```
docs/
├── 01-overview/          📊 Visión general y planificación
├── 02-architecture/      🏗️ Arquitectura y diseño
├── 03-features/          🎯 Features en desarrollo
├── 04-guides/            📖 Guías y manuales
├── 05-sessions/          📝 Handoffs de sesiones
└── 06-references/        📎 Referencias y recursos
```

---

## 🚀 Empezar Rápidamente

### Nuevo en el proyecto?
→ Lee `../ONBOARDING.md` (en raíz del proyecto)

### ¿Qué necesitas hacer AHORA?
→ Lee `../STATUS.md` (estado actual)

### ¿Cuál es tu rol?
→ Lee `02-architecture/AGENTS.md`

---

## 📂 Índice por Sección

### 01-overview/ - Visión General
| Documento | Descripción |
|-----------|-------------|
| [PROJECT-GUIDE.md](./01-overview/PROJECT-GUIDE.md) | Guía completa del proyecto |
| [PLANIFICADOR.md](./01-overview/PLANIFICADOR.md) | Plan de desarrollo y cronograma |

### 02-architecture/ - Arquitectura
| Documento | Descripción |
|-----------|-------------|
| [AGENTS.md](./02-architecture/AGENTS.md) | Roles y responsabilidades de agentes |
| [WORKFLOW.md](./02-architecture/WORKFLOW.md) | Proceso de trabajo multi-agente |
| [CHECKLIST-MIGRACION.md](./02-architecture/CHECKLIST-MIGRACION.md) | Verificación de migración Supabase |

### 03-features/ - Features
| Feature | Estado | Documento |
|---------|--------|-----------|
| 001 — Gestión de Sedes | ✅ Completo | [FEATURE-001](./03-features/FEATURE-001-gestion-sedes.md) |
| 004 — Gestión de Familias y Acudientes | ✅ Completo | [FEATURE-004](./03-features/FEATURE-004-gestion-familias.md) |
| 005 — RBAC: Roles y Permisos | ✅ Completo | [FEATURE-005](./03-features/FEATURE-005-rbac-roles-permisos.md) |
| 006 — Username Auto-generado | ✅ Completo | [FEATURE-006](./03-features/FEATURE-006-username-auto.md) |
| 007 — Historial de Asistencia | ✅ Completo | [FEATURE-007](./03-features/FEATURE-007-historial-asistencia.md) |
| 008 — Dashboard con Datos Reales | ✅ Completo | [FEATURE-008](./03-features/FEATURE-008-dashboard-real.md) |
| 009 — Cambio de Contraseña | ✅ Completo | [FEATURE-009](./03-features/FEATURE-009-cambio-password.md) |
| 010 — Sistema de Calificaciones | ✅ Completo | [FEATURE-010](./03-features/FEATURE-010-calificaciones.md) |
| 011 — Reportes + Exportación PDF | ✅ Completo | [FEATURE-011](./03-features/FEATURE-011-reportes-pdf.md) |
| 012 — Buzón de Sugerencias | ✅ Completo | [FEATURE-012](./03-features/FEATURE-012-buzon-sugerencias.md) |
| 013 — Escaneo QR en Asistencia | 🟡 Pendiente | [FEATURE-013](./03-features/FEATURE-013-escaneo-qr.md) |
| 014 — Alertas de Inasistencia | 🟢 Pendiente | [FEATURE-014](./03-features/FEATURE-014-alertas-inasistencia.md) |
| 015 — PWA Instalable | 🟢 Pendiente | [FEATURE-015](./03-features/FEATURE-015-pwa.md) |

### 04-guides/ - Guías
*(Vacío - por crear según necesidad)*

### 05-sessions/ - Handoffs
*(Vacío - se creará automáticamente)*

### 06-references/ - Referencias
| Documento | Descripción |
|-----------|-------------|
| [DEPURACION.md](./06-references/DEPURACION.md) | Historial de cambios |

---

## 🔄 Convenciones

### Numeración de Archivos
Los archivos de features siguen el patrón:
```
FEATURE-XXX-nombre-descriptivo.md
```

Donde:
- **XXX**: Número secuencial (001, 002, etc.)
- **nombre-descriptivo**: Nombre del feature en kebab-case

### Handoffs de Sesión
Los handoffs se guardan en `05-sessions/` con el formato:
```
YYYY-MM-DD-handoff-descripcion.md
```

### Actualización
- **STATUS.md** se actualiza al final de cada sesión
- **Los features** se actualizan durante el desarrollo
- **PLANIFICADOR.md** se actualiza semanalmente

---

## 📞 Soporte

- **Duda general**: Leer STATUS.md primero
- **Duda de rol**: Leer AGENTS.md
- **Duda de proceso**: Leer WORKFLOW.md
- **Bug o problema**: Documentar en feature correspondiente

---

**Versión:** 1.0  
**Última actualización:** Febrero 2026
