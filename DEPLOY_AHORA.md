# 🚀 INSTRUCCIONES EXACTAS PARA DEPLOY

## ⚡ DEPLOY LOCAL EN TU MÁQUINA (5 MINUTOS)

### PASO 1: Abrir Terminal

**En macOS:**
1. Presiona `Cmd + Espacio`
2. Escribe "Terminal"
3. Presiona Enter

**En Windows:**
1. Presiona `Windows + R`
2. Escribe "cmd" o "powershell"
3. Presiona Enter

**En Linux:**
1. Presiona `Ctrl + Alt + T`

---

### PASO 2: Verificar Docker

En la terminal, copia y pega este comando:

```bash
docker --version
```

**Si sale un número de versión (ej: Docker version 24.0.7):**
✅ ¡Perfecto! Continúa al PASO 3

**Si sale "command not found" o error:**
❌ Necesitas instalar Docker primero:

**Instalar Docker:**
- **macOS/Windows**: https://www.docker.com/products/docker-desktop
  1. Descargar Docker Desktop
  2. Instalar (doble click)
  3. Reiniciar computadora
  4. Abrir Docker Desktop
  5. Esperar que diga "Docker is running"
  6. Volver al PASO 2

- **Linux (Ubuntu/Debian)**:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  newgrp docker
  ```

---

### PASO 3: Navegar al Proyecto

Copia y pega estos comandos UNO POR UNO:

```bash
cd /Users/luisdominguez/attendance-system
```

Verifica que estás en el directorio correcto:
```bash
ls
```

Deberías ver archivos como: `README.md`, `docker-compose.yml`, `deploy.sh`

---

### PASO 4: Dar Permisos al Script

```bash
chmod +x deploy.sh
```

---

### PASO 5: Ejecutar Deploy

```bash
./deploy.sh
```

**Esto tomará 2-3 minutos.** Verás mucho texto en pantalla. Es NORMAL.

Espera a que veas este mensaje:
```
✓ Deploy completado exitosamente
```

---

### PASO 6: Verificar que Funciona

Copia y pega:
```bash
curl http://localhost:8000/health
```

Deberías ver:
```json
{"status":"healthy","version":"1.0.0","environment":"development"}
```

✅ **¡FUNCIONA!**

---

### PASO 7: Abrir en Navegador

Abre estas URLs en tu navegador:

1. **API Interactiva** (EMPIEZA AQUÍ):
   http://localhost:8000/docs

2. **Backend API**:
   http://localhost:8000

3. **Frontend**:
   http://localhost:5173

---

### PASO 8: Hacer Login

En http://localhost:8000/docs:

1. Click en botón verde "Authorize" (candado arriba derecha)
2. Ingresa:
   - **username**: `admin@colegio.edu`
   - **password**: `changeme123`
3. Click "Authorize"
4. Click "Close"

**¡YA PUEDES USAR EL SISTEMA!**

---

## 🧪 PRUEBA RÁPIDA

En http://localhost:8000/docs:

1. Busca `GET /api/v1/campuses`
2. Click "Try it out"
3. Click "Execute"
4. Deberías ver la sede "Sede Principal"

**¡FUNCIONA! 🎉**

---

## 🌐 DEPLOY EN INTERNET (RENDER.COM - GRATIS)

### Por Qué Render.com
- ✅ 100% Gratis (tier gratuito)
- ✅ No requiere tarjeta de crédito
- ✅ HTTPS automático
- ✅ 15 minutos de setup

### PASO 1: Crear Cuenta

1. Ir a https://render.com
2. Click "Get Started"
3. Sign up con GitHub
4. Autorizar Render

### PASO 2: Subir Código a GitHub

**Si no tienes el código en GitHub:**

En terminal:
```bash
cd /Users/luisdominguez/attendance-system

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Sistema de Asistencia"

# Crear repositorio en GitHub:
# 1. Ir a https://github.com/new
# 2. Nombre: attendance-system
# 3. Público o Privado (tu elección)
# 4. NO inicializar con README
# 5. Click "Create repository"

# Conectar y subir (reemplaza TU-USUARIO con tu usuario de GitHub):
git remote add origin https://github.com/TU-USUARIO/attendance-system.git
git branch -M main
git push -u origin main
```

### PASO 3: Crear Base de Datos en Render

1. En Render Dashboard: Click "New +"
2. Seleccionar "PostgreSQL"
3. Configurar:
   - **Name**: `attendance-db`
   - **Database**: `attendance_db`
   - **User**: `postgres`
   - **Region**: Oregon (US West)
   - **Plan**: **Free**
4. Click "Create Database"
5. **IMPORTANTE**: Copiar el "Internal Database URL" (lo necesitarás)

### PASO 4: Crear Web Service (Backend)

1. Dashboard → "New +" → "Web Service"
2. Conectar tu repositorio GitHub
3. Configurar:
   - **Name**: `attendance-backend`
   - **Region**: Oregon (mismo que DB)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**:
     ```
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```
     gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
     ```
   - **Plan**: Free

4. **Environment Variables** - Click "Add Environment Variable":
   ```
   DATABASE_URL = <pegar-Internal-Database-URL-del-PASO-3>
   SECRET_KEY = <generar-nuevo-con-comando-abajo>
   ENVIRONMENT = production
   CORS_ORIGINS = https://attendance-frontend.onrender.com
   ```

   **Generar SECRET_KEY** (en tu terminal local):
   ```bash
   openssl rand -hex 32
   ```
   Copia el resultado y pégalo en SECRET_KEY

5. Click "Create Web Service"

**Espera 5-10 minutos** mientras se hace el deploy.

### PASO 5: Ejecutar Migraciones

Una vez que el servicio esté "Live" (verde):

1. En tu Web Service, ir a "Shell" tab
2. Ejecutar estos comandos UNO POR UNO:

```bash
alembic upgrade head
python scripts/seed_initial.py
```

Si hay errores, intenta:
```bash
cd /opt/render/project/src
alembic upgrade head
python scripts/seed_initial.py
```

### PASO 6: Verificar Backend

Tu backend estará en: `https://attendance-backend.onrender.com`

Verifica:
```bash
curl https://attendance-backend.onrender.com/health
```

O abre en navegador:
https://attendance-backend.onrender.com/docs

**¡FUNCIONA! 🎉**

### PASO 7: Crear Frontend (Opcional)

1. Dashboard → "New +" → "Static Site"
2. Conectar repositorio
3. Configurar:
   - **Name**: `attendance-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL = https://attendance-backend.onrender.com/api/v1
   ```

5. Click "Create Static Site"

**Frontend estará en:** `https://attendance-frontend.onrender.com`

---

## ⚠️ IMPORTANTE - LIMITACIONES FREE TIER

### Render.com Free:
- ✅ Backend funciona perfectamente
- ⚠️ Se "duerme" después de 15 min sin uso
- ⚠️ Primera request tarda ~30 segundos (despierta el servicio)
- ⚠️ PostgreSQL gratis solo 90 días, luego $7/mes

### Solución para "Sleep":
Usar cron-job.org para hacer ping cada 10 minutos:
1. Crear cuenta en https://cron-job.org
2. Crear job:
   - URL: `https://attendance-backend.onrender.com/health`
   - Interval: Every 10 minutes
   - Solo durante horario escolar (8am-5pm)

---

## 📱 USAR EL SISTEMA EN PRODUCCIÓN

### URL de Producción:
- **API Docs**: https://attendance-backend.onrender.com/docs
- **Frontend**: https://attendance-frontend.onrender.com

### Login:
- Email: `admin@colegio.edu`
- Password: `changeme123`

**⚠️ CAMBIAR PASSWORD INMEDIATAMENTE:**
1. En API Docs, usar endpoint `POST /api/v1/auth/change-password`

---

## 🔧 TROUBLESHOOTING

### "docker: command not found"
→ Instalar Docker Desktop (ver PASO 2)

### "Port already in use"
→ Matar proceso:
```bash
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Permission denied: ./deploy.sh"
→ Dar permisos:
```bash
chmod +x deploy.sh
```

### Backend no responde
→ Ver logs:
```bash
docker compose logs -f backend
```

### Base de datos no conecta
→ Reiniciar:
```bash
docker compose restart db
docker compose restart backend
```

### Render: "Build failed"
→ Verificar que root directory sea `backend`
→ Verificar que Build Command sea exacto

### Render: Migraciones fallan
→ Intentar con ruta completa:
```bash
cd /opt/render/project/src
alembic upgrade head
```

---

## 🎯 RESUMEN RÁPIDO

### Local (5 minutos):
```bash
cd /Users/luisdominguez/attendance-system
./deploy.sh
# Abrir: http://localhost:8000/docs
```

### Render.com (15 minutos):
1. Crear cuenta Render
2. Subir código a GitHub
3. Crear PostgreSQL database
4. Crear Web Service con variables de entorno
5. Ejecutar migraciones en Shell
6. Abrir: https://attendance-backend.onrender.com/docs

---

## ✅ CHECKLIST

- [ ] Docker instalado y corriendo
- [ ] Ejecutado `./deploy.sh`
- [ ] http://localhost:8000/docs funciona
- [ ] Login exitoso con admin@colegio.edu
- [ ] Probado GET /api/v1/campuses
- [ ] Creado una sede de prueba

### Para Producción:
- [ ] Código en GitHub
- [ ] Base de datos Render creada
- [ ] Backend Render deployado
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] URL pública funciona
- [ ] Password admin cambiado

---

## 📞 AYUDA

Si tienes problemas:
1. Ver logs: `docker compose logs -f`
2. Reiniciar: `docker compose restart`
3. Limpiar todo: `docker compose down -v` y volver a empezar

---

**¡LISTO! Sistema deployado y funcionando** 🚀

Ahora ve a http://localhost:8000/docs y empieza a usar el sistema.
