# 🎓 Amor Acción - Sistema de Asistencia

> **Sistema de gestión de asistencia estudiantil para organizaciones sin fines de lucro.**  
> **Desarrollado con arquitectura multi-agente para garantizar calidad y escalabilidad.**

---

## ⚡ EMPIEZA AQUÍ (2 minutos)

### 👋 ¿Primera vez?
→ Lee **[ONBOARDING.md](./ONBOARDING.md)** (10 minutos de lectura, 0 confusiones)

### 🎯 ¿Qué se está trabajando AHORA?
→ Ve **[STATUS.md](./STATUS.md)** (Estado actual en 2 minutos)

### 🤖 ¿Cuál es tu rol?
→ Lee **[docs/02-architecture/AGENTS.md](./docs/02-architecture/AGENTS.md)**

### 🔄 ¿Cómo funciona el proceso?
→ Lee **[docs/02-architecture/WORKFLOW.md](./docs/02-architecture/WORKFLOW.md)**

---

## 📊 Estado del Proyecto

```
┌────────────────────────────────────────────────────┐
│  FASE 1: Configuración Inicial                     │
│  Progreso: [████░░░░░░░░░░░░░░░░░░] 15%           │
│  Estado: 🔄 En desarrollo                          │
│                                                     │
│  Última actualización: 17 Feb 2026                 │
│  Feature activo: Gestión de Sedes (FEATURE-001)    │
└────────────────────────────────────────────────────┘
```

**Ver detalles completos en [STATUS.md](./STATUS.md)**

---

## 🚀 Sistema Multi-Agente

Este proyecto utiliza un workflow de **5 agentes especializados** que trabajan en secuencia para garantizar calidad en cada feature:

```
Feature Request
      ↓
🏗️ AGENT-ARCHITECT (Diseña)
      ↓
💻 AGENT-DEVELOPER (Codifica)
      ↓
🧪 AGENT-TESTER (Testea >80% cobertura)
      ↓
🔍 AGENT-REVIEWER (Revisa)
      ↓
🔄 AGENT-INTEGRATOR (Deploya)
      ↓
   ✅ PRODUCCIÓN
```

**Reglas de Oro:**
1. ✅ **NO saltar agentes** - Cada uno completa su checklist
2. ✅ **Checkpoints obligatorios** - Documentación requerida
3. ✅ **Handoffs estructurados** - Continuidad garantizada
4. ✅ **CI/CD automatizado** - Validación en cada etapa

---

## 📁 Estructura del Proyecto

```
AttendanceSystem/
│
├─ 📊 STATUS.md                    ← VER ESTO PRIMERO
├─ 📖 ONBOARDING.md                ← Guía para nuevos agentes
├─ 🚀 README.md                    ← Este archivo
│
├─ 📚 docs/                        ← Documentación completa
│  ├─ 01-overview/                 📊 Visión general
│  │  ├─ PROJECT-GUIDE.md          Guía completa del proyecto
│  │  └─ PLANIFICADOR.md           Plan de desarrollo
│  ├─ 02-architecture/             🏗️ Arquitectura
│  │  ├─ AGENTS.md                 Roles de agentes
│  │  ├─ WORKFLOW.md               Proceso de trabajo
│  │  └─ CHECKLIST-MIGRACION.md    Verificación migración
│  ├─ 03-features/                 🎯 Features activos
│  │  └─ FEATURE-001-gestion-sedes.md
│  ├─ 04-guides/                   📖 Guías
│  ├─ 05-sessions/                 📝 Handoffs
│  │  └─ HANDOFF-TEMPLATE.md
│  └─ 06-references/               📎 Referencias
│     └─ DEPURACION.md
│
├─ 💻 frontend/                    ← Código fuente
│  ├─ src/
│  │  ├─ pages/                    Páginas de la app
│  │  ├─ components/               Componentes reutilizables
│  │  ├─ lib/                      APIs y utilidades
│  │  ├─ store/                    Estado global (Zustand)
│  │  └─ test/                     Tests (Vitest)
│  ├─ package.json
│  └─ ...
│
├─ 🗄️ database/                    ← SQL y esquemas
├─ 🤖 .github/workflows/           ← CI/CD
└─ ⚙️ .opencode/                   ← Configuración
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilos** | Tailwind CSS |
| **Estado** | Zustand |
| **Testing** | Vitest + React Testing Library |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Deploy** | Vercel |
| **CI/CD** | GitHub Actions |

---

## 🚀 Iniciar el Proyecto

### Requisitos
- Node.js 20+
- Git

### Instalación (3 minutos)

```bash
# 1. Clonar
git clone <tu-repo>
cd AttendanceSystem

# 2. Instalar
cd frontend
npm install

# 3. Configurar variables
cp .env.example .env
# Editar .env con tus credenciales Supabase

# 4. Iniciar
npm run dev

# 5. Abrir http://localhost:5173
```

### Credenciales de Prueba
```
Email: admin@amoraccion.com
Password: A1morA2ccion
```

---

## 🌐 Versión en Producción

**Aplicación deployada y funcionando:**

🔗 **URL:** https://frontend-1to1ghb2h-ingludomars-projects.vercel.app

**Features activos en producción:**
- ✅ Autenticación de usuarios
- ✅ Gestión de Sedes (CRUD completo)

**Último deploy:** 17 Feb 2026 - FEATURE-001: Gestión de Sedes

---

## 📖 Documentación

### Documentación Esencial (Leer en orden)

1. **[STATUS.md](./STATUS.md)** - Estado actual del proyecto
2. **[ONBOARDING.md](./ONBOARDING.md)** - Guía para nuevos agentes
3. **[docs/PLANIFICADOR.md](./docs/01-overview/PLANIFICADOR.md)** - Plan completo
4. **[docs/AGENTS.md](./docs/02-architecture/AGENTS.md)** - Roles y responsabilidades
5. **[docs/WORKFLOW.md](./docs/02-architecture/WORKFLOW.md)** - Proceso de trabajo

### Features en Desarrollo

- **[FEATURE-001: Gestión de Sedes](./docs/03-features/FEATURE-001-gestion-sedes.md)** - 📋 Listo para desarrollo

### Guías de Referencia Rápida

| Guía | Descripción |
|------|-------------|
| [AGENTS.md](./docs/02-architecture/AGENTS.md) | Roles de los 5 agentes |
| [WORKFLOW.md](./docs/02-architecture/WORKFLOW.md) | Proceso paso a paso |
| [CHECKLIST-MIGRACION.md](./docs/02-architecture/CHECKLIST-MIGRACION.md) | Verificación de migración |

---

## ⚡ Comandos Útiles

```bash
# Desarrollo
cd frontend && npm run dev        # Iniciar desarrollo
npm run build                     # Build producción
npm run lint                      # Verificar estilo

# Testing
npm test                          # Ejecutar tests
npm run test:coverage             # Tests con cobertura

# Git
git checkout -b feature/XXX       # Nueva feature
git checkout develop              # Cambiar a develop
```

---

## 🎯 Roadmap

### Fase 1: Configuración (Actual - 15%)
- [x] Sistema multi-agente
- [x] Autenticación
- [ ] Gestión de Sedes ← **EN PROGRESO**

### Fase 2: Funcionalidades Básicas (0%)
- [ ] Años Escolares
- [ ] Estudiantes
- [ ] Acudientes

### Fase 3: Personalización (0%)
- [ ] Settings
- [ ] Logo organización

### Fase 4: Asistencia (0%)
- [ ] Grupos
- [ ] Toma de asistencia
- [ ] Reportes

### Fase 5: Testing (0%)
- [ ] Tests E2E
- [ ] Testing con usuarios

### Fase 6: Producción (0%)
- [ ] Deploy Vercel
- [ ] Configuración producción

**Ver plan completo en [PLANIFICADOR.md](./docs/01-overview/PLANIFICADOR.md)**

---

## 🤝 Contribuir

### Para Agregar un Feature

1. **Architect** crea especificación en `docs/03-features/`
2. **Developer** implementa en branch `feature/XXX`
3. **Tester** agrega tests (cobertura >80%)
4. **Reviewer** aprueba el PR
5. **Integrator** hace merge y deploy

### Handoffs de Sesión

Si no completas tu trabajo:
1. Usa el template en `docs/05-sessions/HANDOFF-TEMPLATE.md`
2. Guarda en `docs/05-sessions/YYYY-MM-DD-handoff-descripcion.md`
3. Actualiza `STATUS.md`

---

## 🐛 Problemas Conocidos

Ver [STATUS.md](./STATUS.md) sección "Problemas Conocidos" para lista actualizada.

---

## 📞 Soporte

- **Duda general:** Leer STATUS.md primero
- **Duda de rol:** Consultar AGENTS.md
- **Duda de proceso:** Consultar WORKFLOW.md
- **Bug:** Crear issue en GitHub

---

## 📄 Licencia

MIT - Libre uso para proyectos sociales

---

**Desarrollado con ❤️ para Amor Acción y organizaciones similares**

**Versión:** 1.0.0-alpha  
**Última actualización:** Febrero 2026  
**Sistema multi-agente:** ✅ Activo

---

> 💡 **Tip:** Guarda `STATUS.md` en tus favoritos. Es tu mapa del proyecto.
