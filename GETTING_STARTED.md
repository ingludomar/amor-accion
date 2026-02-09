# Guía de Inicio Rápido

## 🚀 Deploy en 2 Minutos

### Opción 1: Script Automático (Recomendado)

```bash
cd attendance-system
./deploy.sh
```

¡Eso es todo! El script automáticamente:
- ✅ Verifica Docker
- ✅ Crea .env con SECRET_KEY
- ✅ Inicia todos los servicios
- ✅ Ejecuta migraciones
- ✅ Crea datos iniciales
- ✅ Verifica que todo funciona

### Opción 2: Manual

```bash
# 1. Configurar environment
cp .env.example .env
# Editar .env y agregar SECRET_KEY (generar con: openssl rand -hex 32)

# 2. Iniciar servicios
docker compose up -d --build

# 3. Configurar base de datos
docker compose exec backend alembic revision --autogenerate -m "Initial migration"
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_initial.py

# 4. Verificar
curl http://localhost:8000/health
```

## 📱 Acceder al Sistema

### URLs
- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:8000
- **API Documentación**: http://localhost:8000/docs (Swagger UI interactivo)

### Credenciales por Defecto
```
Email:    admin@colegio.edu
Password: changeme123
```

**⚠️ CAMBIAR LA CONTRASEÑA INMEDIATAMENTE**

## 🎮 Primeros Pasos

### 1. Explorar API Interactiva

1. Abrir: http://localhost:8000/docs
2. Click en "Authorize" (candado arriba derecha)
3. En "username" poner: `admin@colegio.edu`
4. En "password" poner: `changeme123`
5. Click "Authorize"
6. Ahora puedes probar todos los endpoints

### 2. Probar Autenticación

En la API Docs:
1. Expandir `POST /api/v1/auth/login`
2. Click "Try it out"
3. Modificar el JSON:
```json
{
  "email": "admin@colegio.edu",
  "password": "changeme123"
}
```
4. Click "Execute"
5. Ver la respuesta con el access_token

### 3. Crear tu Primera Sede

1. En API Docs, expandir `POST /api/v1/campuses`
2. Click "Try it out"
3. Modificar el JSON:
```json
{
  "name": "Sede Norte",
  "code": "NORTE",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "phone": "3001234567",
  "email": "norte@colegio.edu"
}
```
4. Click "Execute"
5. Ver la sede creada

### 4. Listar Sedes

1. Expandir `GET /api/v1/campuses`
2. Click "Try it out"
3. Click "Execute"
4. Ver todas las sedes (incluida "Sede Principal" del seed)

## 🧪 Probar Funcionalidades

### Ver Información del Usuario Actual
```bash
# Primero obtener token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@colegio.edu","password":"changeme123"}' \
  | jq -r '.data.access_token')

# Usar token para obtener info
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Crear Sede via cURL
```bash
curl -X POST http://localhost:8000/api/v1/campuses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sede Sur",
    "code": "SUR",
    "address": "Carrera 50 #30-20",
    "city": "Medellín",
    "phone": "3009876543",
    "email": "sur@colegio.edu"
  }' | jq
```

## 📊 Estado Actual del Proyecto

### ✅ Implementado y Funcional
- Autenticación completa (JWT con roles)
- API de Sedes (CRUD completo)
- Sistema multi-sede
- Base de datos con 11 tablas
- Docker containerización
- API Documentation (Swagger)

### ⚠️ En Desarrollo
- Frontend React (estructura lista, pantallas pendientes)
- API de Estudiantes
- API de Asistencia
- API de Reportes
- Generación de PDFs/Carnets

**Ver `PROJECT_STATUS.md` para más detalles**

## 🛠️ Comandos Útiles

### Ver Logs
```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo base de datos
docker compose logs -f db

# Solo frontend
docker compose logs -f frontend
```

### Gestión de Servicios
```bash
# Detener servicios (mantiene datos)
docker compose stop

# Iniciar servicios detenidos
docker compose start

# Reiniciar servicios
docker compose restart

# Reiniciar solo backend
docker compose restart backend

# Ver estado
docker compose ps
```

### Base de Datos
```bash
# Acceder a PostgreSQL
docker compose exec db psql -U postgres attendance_db

# Hacer backup
docker compose exec db pg_dump -U postgres attendance_db > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T db psql -U postgres attendance_db

# Ver tablas
docker compose exec db psql -U postgres attendance_db -c "\dt"
```

### Migraciones
```bash
# Crear nueva migración
docker compose exec backend alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones pendientes
docker compose exec backend alembic upgrade head

# Ver historial de migraciones
docker compose exec backend alembic history

# Revertir última migración
docker compose exec backend alembic downgrade -1
```

### Desarrollo
```bash
# Acceder al shell del backend
docker compose exec backend bash

# Ejecutar tests (cuando estén implementados)
docker compose exec backend pytest

# Ver variables de entorno
docker compose exec backend env | grep -E "(DATABASE|SECRET)"

# Reinstalar dependencias del frontend
docker compose exec frontend npm install

# Limpiar y reconstruir todo
docker compose down -v
docker compose up -d --build
```

## 🐛 Troubleshooting

### Error: Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
lsof -i :8000  # o :5173, :5432

# Matar el proceso
kill -9 <PID>

# O cambiar puerto en docker-compose.yml
```

### Error: Docker no tiene permisos
```bash
# Linux
sudo usermod -aG docker $USER
newgrp docker
```

### Error: Base de datos no conecta
```bash
# Verificar que está corriendo
docker compose ps db

# Reiniciar
docker compose restart db

# Esperar a que esté healthy
docker compose ps
```

### Limpiar Todo y Empezar de Nuevo
```bash
# ⚠️ Esto elimina TODOS los datos
docker compose down -v
./deploy.sh
```

## 📚 Documentación Adicional

- [`README.md`](README.md) - Overview del proyecto
- [`INSTALLATION.md`](docs/INSTALLATION.md) - Instalación detallada
- [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Deploy en producción
- [`PROJECT_STATUS.md`](PROJECT_STATUS.md) - Estado y próximos pasos
- [`QUICK_START.md`](QUICK_START.md) - Inicio rápido alternativo

## 🎯 Próximos Pasos Sugeridos

1. ✅ Cambiar contraseña del admin
2. ✅ Crear sedes adicionales
3. ✅ Explorar toda la API en /docs
4. ✅ Leer PROJECT_STATUS.md para entender qué falta
5. ✅ Decidir si completar el desarrollo o deployar lo actual

## 💡 Tips

- **API Docs es tu amigo**: Todo está documentado en http://localhost:8000/docs
- **Los logs son útiles**: `docker compose logs -f` muestra todo lo que pasa
- **Backups son importantes**: Hacer backups antes de experimentos
- **Git es tu red de seguridad**: Commitear cambios frecuentemente

## 🆘 Ayuda

¿Problemas? Revisa:
1. Logs con `docker compose logs -f backend`
2. Estado con `docker compose ps`
3. Health check: `curl http://localhost:8000/health`
4. Documentación en carpeta `docs/`

---

**¡Disfruta explorando el sistema!** 🚀
