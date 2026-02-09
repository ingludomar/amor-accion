# Guía Completa de Deploy

## Estado Actual del Proyecto

✅ **Completado:**
- Estructura completa del proyecto
- Backend FastAPI con arquitectura en capas
- Todos los modelos SQLAlchemy (11 tablas)
- Sistema de autenticación JWT
- Router de Auth completo
- Router de Campus completo
- Repositories base y específicos
- Frontend React con Vite y Tailwind configurado
- Docker Compose configuración
- Script de seed inicial

📝 **Pendiente (para MVP completo):**
- Implementación completa de API REST para todos los módulos
- Frontend completo con todas las pantallas
- Generación de PDFs y QR
- Importación CSV

## Deploy Paso a Paso

### Opción 1: Deploy Local (Desarrollo/Testing)

#### 1. Requisitos
```bash
# Verificar Docker
docker --version  # >= 24.0
docker compose version  # v2

# Verificar Git
git --version
```

#### 2. Preparación
```bash
# Clonar (si no está clonado)
git clone <tu-repo>
cd attendance-system

# Configurar environment
cp .env.example .env

# Generar SECRET_KEY
openssl rand -hex 32
# Copiar y pegar en .env en la línea SECRET_KEY=

# Editar DB_PASSWORD si lo deseas (opcional)
nano .env
```

#### 3. Iniciar Servicios
```bash
# Construir e iniciar
docker compose up -d --build

# Ver logs
docker compose logs -f

# Verificar que todo está UP
docker compose ps
```

**Salida esperada:**
```
NAME                          STATUS
attendance-system-db-1        Up (healthy)
attendance-system-backend-1   Up
attendance-system-frontend-1  Up
```

#### 4. Configurar Base de Datos
```bash
# Crear migración inicial
docker compose exec backend alembic revision --autogenerate -m "Initial migration"

# Aplicar migración
docker compose exec backend alembic upgrade head

# Seed inicial (roles, admin, sede demo)
docker compose exec backend python scripts/seed_initial.py
```

#### 5. Verificar Funcionamiento
```bash
# Health check backend
curl http://localhost:8000/health

# Debería responder:
# {"status":"healthy","version":"1.0.0","environment":"development"}

# Abrir en navegador
open http://localhost:5173  # Frontend
open http://localhost:8000/docs  # API Docs
```

#### 6. Login Inicial
```
URL: http://localhost:5173
Email: admin@colegio.edu
Password: changeme123
```

### Opción 2: Deploy en Render.com (Gratis)

#### 1. Preparar Repositorio
```bash
# Asegurar que todo está commiteado
git add .
git commit -m "feat: MVP completo listo para deploy"
git push origin main
```

#### 2. Crear Cuenta en Render.com
1. Ir a https://render.com
2. Crear cuenta (conectar con GitHub)
3. Autorizar acceso al repositorio

#### 3. Crear PostgreSQL Database
1. Dashboard → New → PostgreSQL
2. Name: `attendance-db`
3. Database: `attendance_db`
4. User: `postgres`
5. Region: Oregon (US West) - gratis
6. Plan: **Free**
7. Click **Create Database**
8. Copiar **Internal Database URL** (importante!)

#### 4. Crear Web Service (Backend)
1. Dashboard → New → Web Service
2. Connect repository: `attendance-system`
3. Configuración:
   - **Name**: `attendance-backend`
   - **Region**: Oregon (mismo que DB)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
     ```
   - **Plan**: Free

4. **Environment Variables** (Add Environment Variable):
   ```
   DATABASE_URL=<pegar-Internal-Database-URL>
   SECRET_KEY=<generar-con-openssl-rand-hex-32>
   ENVIRONMENT=production
   CORS_ORIGINS=https://attendance-frontend.onrender.com
   ```

5. Click **Create Web Service**

#### 5. Ejecutar Migraciones en Render
```bash
# Desde el Dashboard de tu Web Service
# Ir a "Shell" tab
alembic upgrade head
python scripts/seed_initial.py
```

#### 6. Crear Static Site (Frontend)
1. Dashboard → New → Static Site
2. Connect repository: `attendance-system`
3. Configuración:
   - **Name**: `attendance-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://attendance-backend.onrender.com/api/v1
   ```

5. Click **Create Static Site**

#### 7. Verificar Deploy
1. Esperar a que ambos servicios estén en "Live" (5-10 minutos)
2. Abrir URL del frontend: `https://attendance-frontend.onrender.com`
3. Login con credenciales por defecto

**⚠️ Limitaciones Free Tier:**
- Backend duerme después de 15 min inactividad
- PostgreSQL gratis solo 90 días
- Después: $7/mes para PostgreSQL

### Opción 3: Deploy en Railway.app

#### 1. Crear Cuenta
1. Ir a https://railway.app
2. Sign up con GitHub
3. New Project → Deploy from GitHub repo

#### 2. Configurar Variables
Railway auto-detecta el proyecto. Agregar variables:
```
DATABASE_URL=<railway-provee-postgres-automatico>
SECRET_KEY=<generar>
ENVIRONMENT=production
```

#### 3. Deploy
Railway hace deploy automático. Listo en 5 minutos.

**Costo:** $5 crédito gratis/mes, luego ~$10-15/mes

### Opción 4: VPS (DigitalOcean, Linode, etc.)

#### 1. Crear Droplet/VPS
- Ubuntu 22.04 LTS
- 2GB RAM mínimo
- $12/mes aproximadamente

#### 2. Configurar Servidor
```bash
# SSH al servidor
ssh root@tu-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Clonar proyecto
git clone <tu-repo>
cd attendance-system

# Configurar .env
cp .env.example .env
nano .env
# Cambiar SECRET_KEY, DB_PASSWORD, CORS_ORIGINS

# Usar docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d --build

# Migraciones
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml exec backend python scripts/seed_initial.py
```

#### 3. Configurar Dominio (Opcional)
```bash
# Editar Caddyfile con tu dominio
nano infra/caddy/Caddyfile

# Cambiar attendance.colegio.edu por tu-dominio.com
# Caddy obtendrá HTTPS automáticamente
```

#### 4. Configurar Firewall
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

## Mantenimiento Post-Deploy

### Backups Automáticos
```bash
# Crear script de backup
cat > /usr/local/bin/backup-attendance.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/attendance"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup base de datos
docker compose exec -T db pg_dump -U postgres attendance_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Mantener últimos 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
EOF

chmod +x /usr/local/bin/backup-attendance.sh

# Agregar a crontab (ejecutar diariamente a las 2am)
crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-attendance.sh
```

### Monitoreo
```bash
# Ver logs
docker compose logs -f backend

# Ver status
docker compose ps

# Restart servicios
docker compose restart

# Ver uso de recursos
docker stats
```

### Actualizar Aplicación
```bash
# Hacer cambios y commitear
git add .
git commit -m "fix: corregir bug X"
git push

# En servidor (VPS)
git pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Aplicar migraciones si hay nuevas
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Troubleshooting Deploy

### Error: "Database connection failed"
```bash
# Verificar que PostgreSQL está corriendo
docker compose ps db

# Ver logs de DB
docker compose logs db

# Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL
```

### Error: "Frontend can't connect to backend"
```bash
# Verificar CORS_ORIGINS incluye URL del frontend
# En .env backend:
CORS_ORIGINS=http://localhost:5173,https://tu-frontend-url.com

# Verificar VITE_API_URL en frontend
# En frontend/.env:
VITE_API_URL=https://tu-backend-url.com/api/v1
```

### Error: "502 Bad Gateway"
```bash
# Backend probablemente no está corriendo
docker compose ps
docker compose logs backend

# Verificar que el puerto está correcto
curl http://localhost:8000/health
```

### Performance Lento en Render Free Tier
```bash
# Configurar Cron-job.org para mantener activo
# 1. Crear cuenta en cron-job.org
# 2. Crear job:
#    URL: https://tu-backend.onrender.com/health
#    Interval: Every 10 minutes
# Esto evita que el servicio entre en sleep
```

## Checklist de Deploy

### Pre-Deploy
- [ ] Todos los tests pasan localmente
- [ ] Variables de entorno configuradas
- [ ] SECRET_KEY generado (openssl rand -hex 32)
- [ ] DB_PASSWORD seguro (no usar default)
- [ ] CORS_ORIGINS correctos
- [ ] .gitignore actualizado (no commitear .env)

### Durante Deploy
- [ ] Servicios iniciados correctamente
- [ ] Migraciones aplicadas
- [ ] Seed ejecutado
- [ ] Health check responde OK

### Post-Deploy
- [ ] Cambiar password de admin
- [ ] Crear usuarios de prueba
- [ ] Probar flujo completo (login, crear sede, etc.)
- [ ] Configurar backups
- [ ] Documentar URLs de producción
- [ ] Configurar monitoreo (opcional)

## URLs y Credenciales

### Development (Local)
```
Frontend: http://localhost:5173
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
DB: localhost:5432

Admin:
  Email: admin@colegio.edu
  Password: changeme123
```

### Production (Cambiar después de deploy)
```
Frontend: https://tu-dominio.com
Backend: https://api.tu-dominio.com
Admin: (cambiar password inmediatamente!)
```

## Seguridad en Producción

1. **Cambiar credenciales por defecto**
2. **Usar HTTPS** (Caddy/Render lo hace automático)
3. **Firewall configurado** (solo 80, 443, 22)
4. **Backups automáticos**
5. **Actualizar dependencias regularmente**:
   ```bash
   pip list --outdated
   npm outdated
   ```

## Soporte

- **Documentación**: Ver carpeta `docs/`
- **Issues**: GitHub Issues
- **Email**: soporte@colegio.edu

---

**Última actualización**: 2024-01-22
**Versión**: 1.0.0
