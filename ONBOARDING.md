# 🎓 ONBOARDING - Guía para Nuevos Agentes

> **Bienvenido al proyecto Amor Acción!**  
> Esta guía te permitirá empezar a trabajar en **menos de 10 minutos**.

---

## ⚡ EMPEZAR AHORA (3 pasos)

### Paso 1: Lee el Estado Actual (2 min)
📊 **[STATUS.md](../STATUS.md)** ← Haz clic aquí

Este archivo te dice:
- En qué fase está el proyecto
- Qué se está trabajando ahora
- Qué debes hacer según tu rol
- Métricas y problemas conocidos

### Paso 2: Identifica tu Rol (1 min)

**¿Eres Architect, Developer, Tester, Reviewer o Integrator?**

| Tu Rol | Lee Esto | Tiempo |
|--------|----------|--------|
| **Architect** | `docs/AGENTS.md` (sección Architect) + `docs/features/` | 5 min |
| **Developer** | `docs/AGENTS.md` (sección Developer) + `docs/WORKFLOW.md` | 5 min |
| **Tester** | `docs/AGENTS.md` (sección Tester) + Tests existentes | 5 min |
| **Reviewer** | `docs/AGENTS.md` (sección Reviewer) + Código reciente | 3 min |
| **Integrator** | `docs/AGENTS.md` (sección Integrator) + CI/CD | 5 min |

### Paso 3: Empieza a Trabajar (5 min)

**Según tu rol:**

#### 🏗️ Architect
```bash
# 1. Revisa features pendientes
ls docs/features/

# 2. Abre el feature asignado
code docs/features/FEATURE-XXX.md

# 3. Actualiza estado a "En Progreso"
# 4. Completa tu checklist
# 5. Marca como listo para Developer
```

#### 💻 Developer
```bash
# 1. Asegúrate de estar en develop
git checkout develop
git pull origin develop

# 2. Crea tu branch
git checkout -b feature/FEATURE-XXX-nombre

# 3. Lee la especificación
code docs/features/FEATURE-XXX.md

# 4. Implementa siguiendo el workflow
# 5. Corre tests: npm test
```

#### 🧪 Tester
```bash
# 1. Revisa tests existentes
ls frontend/src/test/

# 2. Verifica cobertura actual
cd frontend && npm run test:coverage

# 3. Identifica qué falta testear
# 4. Crea tests siguiendo patrones existentes
```

#### 🔍 Reviewer
```bash
# 1. Abre el PR en GitHub
# 2. Revisa cambios file por file
# 3. Usa checklist de AGENTS.md
# 4. Comenta o aprueba
```

#### 🔄 Integrator
```bash
# 1. Verifica PR tiene aprobación
# 2. Revisa CI/CD está verde
# 3. Merge siguiendo el workflow
# 4. Deploy a staging
```

---

## 📚 ARQUITECTURA DEL PROYECTO (5 min)

### ¿Qué estamos construyendo?

**Sistema de gestión de asistencia estudiantil** para organizaciones sin fines de lucro.

**Características principales:**
- ✅ Autenticación segura
- 🏫 Gestión de múltiples sedes
- 👨‍🎓 Registro de estudiantes
- 📸 Subida de fotos (carnets)
- ✔️ Toma de asistencia
- 📊 Reportes y estadísticas

### Stack Tecnológico

```
Frontend          Backend           Deploy
─────────         ───────           ──────
React 18     →    Supabase     →    Vercel
TypeScript        PostgreSQL        CI/CD GitHub
Tailwind          Auth              Serverless
Zustand           Storage
Vitest            Real-time
```

### Fases del Proyecto

```
FASE 1: Configuración Inicial    [░░░░░░░░░░] 15%  ← ESTAMOS AQUÍ
FASE 2: Funcionalidades Básicas  [░░░░░░░░░░] 0%
FASE 3: Personalización          [░░░░░░░░░░] 0%
FASE 4: Sistema de Asistencia    [░░░░░░░░░░] 0%
FASE 5: Testing Completo         [░░░░░░░░░░] 0%
FASE 6: Deploy Producción        [░░░░░░░░░░] 0%
```

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

### Archivos Importantes (Memorizar)

| Archivo | Para qué sirve | Cuándo consultar |
|---------|---------------|------------------|
| `STATUS.md` | Estado actual | AL INICIO de cada sesión |
| `README.md` | Overview general | Primera vez |
| `ONBOARDING.md` | Esta guía | Primera vez |
| `docs/PLANIFICADOR.md` | Plan completo | Necesitas contexto |
| `docs/AGENTS.md` | Tu rol específico | Necesitas saber qué hacer |
| `docs/WORKFLOW.md` | Proceso paso a paso | Duda sobre proceso |
| `docs/features/FEATURE-XXX.md` | Feature específico | Vas a trabajar en X |

### Estructura de Carpetas

```
AttendanceSystem/
│
├─ 📊 STATUS.md                 ← VER PRIMERO SIEMPRE
├─ 🚀 README.md                 ← Overview
├─ 📖 ONBOARDING.md             ← Esta guía
│
├─ 📚 docs/                     ← Documentación
│  ├─ 📋 PLANIFICADOR.md        ← Plan maestro
│  ├─ 🤖 AGENTS.md              ← Roles de agentes
│  ├─ 🔄 WORKFLOW.md            ← Proceso de trabajo
│  ├─ ✅ CHECKLIST-MIGRACION.md ← Verificación
│  ├─ 🎯 features/              ← Features activos
│  │  └─ FEATURE-001-xxx.md
│  └─ 📝 sessions/              ← Handoffs de sesiones
│     └─ 2026-02-17-handoff.md
│
├─ 💻 frontend/                 ← Código
│  ├─ src/
│  │  ├─ pages/                 ← Páginas
│  │  ├─ components/            ← Componentes
│  │  ├─ lib/                   ← APIs
│  │  ├─ store/                 ← Estado
│  │  └─ test/                  ← Tests
│  └─ package.json
│
├─ 🗄️ database/                 ← SQL
├─ 🤖 .github/workflows/        ← CI/CD
└─ ⚙️ .opencode/                ← Configuración
```

---

## 🔄 SISTEMA MULTI-AGENTE

### ¿Qué es?

Un workflow donde **5 agentes especializados** trabajan en secuencia para garantizar calidad:

```
Feature Request
      ↓
🏗️ Architect (Diseña)
      ↓
💻 Developer (Codifica)
      ↓
🧪 Tester (Testea >80%)
      ↓
🔍 Reviewer (Revisa)
      ↓
🔄 Integrator (Deploya)
      ↓
   ✅ PRODUCCIÓN
```

### Reglas de Oro

1. **NO saltar agentes** - Cada uno debe completar su trabajo
2. **Checklist obligatorio** - Cada agente tiene su checklist
3. **Documentar todo** - Siempre dejar traza escrita
4. **Un feature a la vez** - No mezclar responsabilidades

### Tu Checklist según Rol

**Architect:**
- [ ] Leer requerimientos
- [ ] Diseñar solución
- [ ] Documentar en `docs/features/`
- [ ] Marcar como "Listo para Developer"

**Developer:**
- [ ] Leer especificación
- [ ] Crear branch
- [ ] Implementar
- [ ] Testing manual
- [ ] Documentar cambios
- [ ] Crear PR

**Tester:**
- [ ] Revisar código
- [ ] Crear tests
- [ ] Verificar cobertura >80%
- [ ] Probar edge cases
- [ ] Documentar bugs

**Reviewer:**
- [ ] Revisar código file por file
- [ ] Verificar estándares
- [ ] Identificar problemas
- [ ] Aprobar o solicitar cambios

**Integrator:**
- [ ] Verificar aprobación
- [ ] Resolver conflictos
- [ ] Merge a develop
- [ ] Deploy a staging
- [ ] Verificar en staging

---

## 🛠️ SETUP LOCAL (5 min)

### Requisitos
- Node.js 20+
- Git
- Código del proyecto

### Instalación Rápida

```bash
# 1. Clonar (si no lo tienes)
git clone <repo-url>
cd AttendanceSystem

# 2. Instalar dependencias
cd frontend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

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

## 🧪 COMANDOS ESENCIALES

### Desarrollo
```bash
cd frontend

npm run dev           # Iniciar desarrollo
npm run build         # Build producción
npm run lint          # Verificar estilo
npx tsc --noEmit      # Verificar TypeScript
```

### Testing
```bash
npm test              # Ejecutar tests
npm run test:coverage # Tests con cobertura
npm test -- --watch   # Modo watch
```

### Git
```bash
# Nueva feature
git checkout -b feature/FEATURE-XXX-descripcion

# Actualizar develop
git checkout develop
git pull origin develop

# Merge
git checkout develop
git merge feature/FEATURE-XXX

# Push
git push origin develop
```

---

## 🆘 TROUBLESHOOTING

### "No sé qué hacer"
1. Leer `STATUS.md`
2. Identificar tu rol
3. Ver sección "¿QUÉ HACER AHORA?" en STATUS.md

### "Tests fallan"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Ejecutar de nuevo
npm test

# Si sigue fallando, revisar:
# - ¿Estás en el directorio frontend?
# - ¿Node version 20+?
# - ¿Variables de entorno configuradas?
```

### "No puedo hacer login"
1. Verificar `.env` tiene variables correctas
2. Verificar Supabase está online
3. Probar credenciales: admin@colegio.edu / changeme123
4. Revisar consola del navegador (F12)

### "Build falla"
```bash
# Verificar TypeScript
npx tsc --noEmit

# Verificar lint
npm run lint

# Verificar dependencias
npm install
```

### "Merge conflicts"
```bash
# 1. Guardar tu trabajo
git stash

# 2. Actualizar develop
git checkout develop
git pull origin develop

# 3. Volver a tu branch
git checkout tu-branch
git rebase develop

# 4. Resolver conflictos
# Editar archivos con conflictos

# 5. Continuar
git add .
git rebase --continue
```

---

## 📝 HANDBOOK RÁPIDO

### Antes de empezar a trabajar
```
□ Leer STATUS.md
□ Identificar tu rol
□ Verificar rama correcta
□ Leer feature asignado (si aplica)
□ Actualizar este archivo si es necesario
```

### Durante el trabajo
```
□ Seguir tu checklist de AGENTS.md
□ Hacer commits frecuentes
□ Documentar decisiones importantes
□ Probar manualmente
□ Mantener código limpio
```

### Al terminar sesión
```
□ Actualizar STATUS.md
□ Crear handoff en docs/sessions/
□ Comitear cambios
□ Push a tu branch
□ Actualizar feature document
```

### Handoff Template (si no terminas)
```markdown
# Handoff - [Fecha] - [Tu Nombre]

## Trabajo Realizado
- [ ] Tarea 1 completada
- [ ] Tarea 2 en progreso (50%)

## Pendiente
- [ ] Terminar tarea 2
- [ ] Iniciar tarea 3

## Notas Importantes
- Contexto específico
- Problemas encontrados
- Decisiones tomadas

## Próximos Pasos
1. Hacer X
2. Luego Y
3. Finalmente Z
```

---

## 🎯 EJERCICIO DE PRÁCTICA

Para familiarizarte con el proyecto:

1. **5 min:** Lee STATUS.md de arriba abajo
2. **3 min:** Navega docs/ y abre 3 archivos al azar
3. **5 min:** Explora frontend/src/ viendo la estructura
4. **2 min:** Corre `npm test` en frontend/
5. **5 min:** Inicia el proyecto con `npm run dev` y explora

**Total: 20 minutos para ser experto en el proyecto!**

---

## 📞 RECURSOS

### Documentación Interna
- [STATUS.md](../STATUS.md) - Estado actual
- [README.md](../README.md) - Overview
- [docs/AGENTS.md](./AGENTS.md) - Roles
- [docs/WORKFLOW.md](./WORKFLOW.md) - Proceso
- [docs/PLANIFICADOR.md](./PLANIFICADOR.md) - Plan

### Documentación Externa
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vitest Docs](https://vitest.dev)
- [Tailwind Docs](https://tailwindcss.com)

---

## ✅ CHECKLIST FINAL

Antes de decir "Listo, entendí":

- [ ] Leí STATUS.md completamente
- [ ] Identifiqué mi rol
- [ ] Sé dónde encontrar mi checklist
- [ ] Entendí el flujo multi-agente
- [ ] Pude iniciar el proyecto localmente
- [ ] Sé cómo ejecutar tests
- [ ] Sé a quién escalar si tengo dudas

**¿Todo checked?** ¡Estás listo para trabajar! 🚀

---

**Bienvenido al equipo!**  
**Tiempo estimado de onboarding:** 10 minutos  
**Próxima actualización:** Automática

---

> 💡 **Recuerda:** La documentación es tu amiga. Si tienes duda, revisa docs/ primero.
