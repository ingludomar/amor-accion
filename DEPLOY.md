# AmorAccion - Sistema de Asistencia

Sistema de gestión de asistencia para el grupo de voluntarios ReeAmor y su actividad social AmorAccion.

## 🚀 Despliegue Rápido

### 1. Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre del repositorio: `amoraccion` (o el que prefieras)
3. Público o Privado (como prefieras)
4. Crea el repositorio

### 2. Subir el código
```bash
git init
git add .
git commit -m "Primer commit - Sistema AmorAccion"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/amoraccion.git
git push -u origin main
```

### 3. Desplegar Backend (Railway)
1. Ve a https://railway.app
2. Regístrate con GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repositorio `amoraccion`
6. Selecciona el directorio `backend`
7. Railway detectará automáticamente el Dockerfile
8. Agrega variables de entorno (ver abajo)
9. Agrega PostgreSQL: Click en "New" → "Database" → "Add PostgreSQL"
10. Espera a que se despliegue

### 4. Desplegar Frontend (Vercel)
1. Ve a https://vercel.com
2. Regístrate con GitHub
3. Click en "Add New..." → "Project"
4. Selecciona tu repositorio `amoraccion`
5. Configura:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Agrega variable de entorno:
   - Name: `VITE_API_URL`
   - Value: `https://TU-APP-DE-RAILWAY.up.railway.app` (copia de Railway)
7. Click "Deploy"

## 📋 Variables de Entorno (Railway)

En Railway, ve a tu proyecto backend → Variables → New Variable:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_URL_UNPOOLED=${{Postgres.DATABASE_URL}}
POSTGRES_DATABASE=${{Postgres.POSTGRES_DATABASE}}
POSTGRES_HOST=${{Postgres.POSTGRES_HOST}}
POSTGRES_PASSWORD=${{Postgres.POSTGRES_PASSWORD}}
POSTGRES_USER=${{Postgres.POSTGRES_USER}}
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-123456789
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["https://amoraccion.vercel.app"]
API_V1_PREFIX=/api/v1
VERSION=1.0.0
PROJECT_NAME=AmorAccion
```

## 🗄️ Base de Datos Inicial

Una vez desplegado en Railway:

1. Ve a tu proyecto en Railway
2. Click en "PostgreSQL" → "Connect"
3. Selecciona "Legacy Connection"
4. Copia el comando para conectar vía CLI
5. Ejecuta el seed:
```bash
railway run python seed_initial.py
```

O usa el plugin de PostgreSQL en Railway Dashboard para ejecutar:
```sql
-- Los datos iniciales se crean automáticamente con el seed
```

## 🔧 Configuración CORS (Importante)

Edita `backend/app/core/config.py` y actualiza:
```python
CORS_ORIGINS: List[str] = [
    "https://amoraccion.vercel.app",  # Tu frontend en Vercel
    "http://localhost:5173",          # Desarrollo local
]
```

## 📱 URLs Finales

- **Frontend:** https://amoraccion.vercel.app
- **Backend API:** https://amoraccion.up.railway.app
- **API Docs:** https://amoraccion.up.railway.app/docs

## 🔐 Credenciales por Defecto

- **Email:** admin@colegio.edu
- **Password:** changeme123
- **Rol:** SuperAdmin

**IMPORTANTE:** Cambia la contraseña después del primer login.

## ⚠️ Limitaciones del Plan Gratuito

- **Railway:** $5 crédito/mes (~500 horas de uso activo)
  - Se duerme después de inactividad (30-60s para despertar)
  - Para uso cada 15 días: Perfectamente suficiente
  
- **Vercel:** Ilimitado para frontend estático
  - Nunca duerme
  - 100GB ancho de banda/mes

## 🆘 Solución de Problemas

### Error "CORS"
Verifica que la URL de Vercel esté en `CORS_ORIGINS` del backend.

### Base de datos no conecta
1. En Railway, ve a PostgreSQL → Variables
2. Copia `DATABASE_URL`
3. Verifica que esté en las variables del backend

### Frontend no encuentra el backend
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `VITE_API_URL` tenga la URL correcta de Railway
3. Re-despliega el frontend

## 💡 Consejos

1. **Antes de usar:** Alguien abre la app 1 minuto antes (para que Railway "despierte")
2. **Backup:** Exporta datos periódicamente desde Railway
3. **Logs:** Railway y Vercel tienen logs en tiempo real para debug

## 📞 Soporte

Si tienes problemas durante el despliegue:
1. Revisa los logs en Railway (backend) y Vercel (frontend)
2. Verifica las variables de entorno
3. Asegúrate que el backend esté desplegado antes que el frontend

---

**Hecho con 💙 por los voluntarios de ReeAmor**
