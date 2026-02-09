# Guía de Instalación Local

Esta guía explica cómo instalar y configurar el Sistema de Gestión de Asistencia en tu entorno local para desarrollo o pruebas.

## Requisitos del Sistema

### Hardware Mínimo
- **RAM**: 4GB mínimo, 8GB recomendado
- **Disco**: 20GB de espacio libre
- **CPU**: Procesador de 2 núcleos o superior

### Software Requerido
- **Docker**: Versión 24.0 o superior
- **Docker Compose**: V2 (incluido en Docker Desktop)
- **Git**: Para clonar el repositorio
- **Editor de código**: VS Code, PyCharm, o similar (opcional)

### Sistemas Operativos Soportados
- ✅ Linux (Ubuntu 22.04+, Debian, Fedora)
- ✅ macOS (11.0+)
- ✅ Windows 11 con WSL2

## Instalación Paso a Paso

### 1. Instalar Docker

#### En Linux (Ubuntu/Debian)
```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión para aplicar cambios
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

#### En macOS
1. Descargar [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Instalar el .dmg
3. Iniciar Docker Desktop
4. Verificar en terminal:
```bash
docker --version
docker compose version
```

#### En Windows 11
1. Habilitar WSL2:
```powershell
wsl --install
```
2. Descargar [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
3. Instalar y reiniciar
4. Verificar en PowerShell o WSL:
```bash
docker --version
docker compose version
```

### 2. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/tu-organizacion/attendance-system.git
cd attendance-system

# Verificar estructura
ls -la
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor preferido
nano .env  # o: vim .env, code .env
```

**Variables importantes a configurar:**

```env
# Entorno (development, production)
ENVIRONMENT=development

# Base de datos
DATABASE_URL=postgresql://postgres:TU_PASSWORD_SEGURO@db:5432/attendance_db
DB_PASSWORD=TU_PASSWORD_SEGURO

# Seguridad - GENERAR NUEVO SECRET_KEY
SECRET_KEY=<generar-con-comando-abajo>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS - Ajustar según tu configuración
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Generar SECRET_KEY seguro:**
```bash
openssl rand -hex 32
```

Copiar el resultado y pegarlo en `SECRET_KEY` en el archivo `.env`.

### 4. Iniciar los Servicios

```bash
# Iniciar todos los servicios en background
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# O ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
```

**Salida esperada:**
```
[+] Running 4/4
 ✔ Network attendance-system_attendance-network  Created
 ✔ Container attendance-system-db-1              Started
 ✔ Container attendance-system-backend-1         Started
 ✔ Container attendance-system-frontend-1        Started
```

### 5. Verificar que los Servicios Están Corriendo

```bash
docker compose ps
```

Deberías ver todos los servicios en estado `Up`:
```
NAME                            STATUS
attendance-system-db-1          Up (healthy)
attendance-system-backend-1     Up
attendance-system-frontend-1    Up
```

### 6. Ejecutar Migraciones de Base de Datos

```bash
# Ejecutar migraciones con Alembic
docker compose exec backend alembic upgrade head
```

**Salida esperada:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> xxxxx, Initial migration
```

### 7. Poblar Base de Datos con Datos Iniciales

```bash
# Ejecutar script de seed
docker compose exec backend python scripts/seed_initial.py
```

**Salida esperada:**
```
Starting database seeding...

1. Creating roles...
  ✓ Created role: SuperAdmin
  ✓ Created role: AdminSede
  ✓ Created role: Profesor
  ✓ Created role: Secretaria

2. Creating demo campus...
  ✓ Created campus: Sede Principal

3. Creating admin user...
  ✓ Created admin user: admin@colegio.edu
  ✓ Password: changeme123
  ✓ Role: SuperAdmin
  ✓ Campus: Sede Principal

4. Creating demo school year...
  ✓ Created school year: 2024-2025

============================================================
✓ Database seeding completed successfully!
============================================================

Default credentials:
  Email:    admin@colegio.edu
  Password: changeme123

⚠ IMPORTANT: Change the admin password immediately!
============================================================
```

### 8. Acceder a la Aplicación

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API (Swagger)**: http://localhost:8000/docs
- **Documentación API (ReDoc)**: http://localhost:8000/redoc

### 9. Iniciar Sesión

1. Abrir el navegador en http://localhost:5173
2. Usar las credenciales:
   - **Email**: `admin@colegio.edu`
   - **Password**: `changeme123`
3. **Cambiar la contraseña inmediatamente** después del primer login

## Comandos Útiles

### Gestión de Servicios

```bash
# Detener servicios
docker compose stop

# Iniciar servicios detenidos
docker compose start

# Reiniciar servicios
docker compose restart

# Detener y eliminar contenedores (mantiene volúmenes)
docker compose down

# Detener y eliminar TODO (incluidos volúmenes)
docker compose down -v
```

### Logs y Depuración

```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs backend
docker compose logs -f backend

# Ver últimas 100 líneas
docker compose logs --tail=100 backend
```

### Acceso a Contenedores

```bash
# Shell en el contenedor backend
docker compose exec backend bash

# Shell en el contenedor de base de datos
docker compose exec db psql -U postgres attendance_db

# Ejecutar comando sin entrar al shell
docker compose exec backend python --version
```

### Base de Datos

```bash
# Backup de base de datos
docker compose exec db pg_dump -U postgres attendance_db > backup.sql

# Restore de backup
cat backup.sql | docker compose exec -T db psql -U postgres attendance_db

# Acceder a psql
docker compose exec db psql -U postgres attendance_db
```

### Frontend

```bash
# Reinstalar dependencias de npm
docker compose exec frontend npm install

# Ver logs de build
docker compose logs -f frontend
```

## Verificación de Instalación

### 1. Health Check del Backend

```bash
curl http://localhost:8000/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. Verificar Base de Datos

```bash
docker compose exec db psql -U postgres attendance_db -c "\dt"
```

Deberías ver una lista de todas las tablas creadas.

### 3. Verificar Frontend

Abrir http://localhost:5173 en el navegador. Deberías ver la página de inicio del sistema.

## Troubleshooting

### Error: Puerto ya en uso

**Problema**: `Error: bind: address already in use`

**Solución**:
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :8000  # o :5173, :5432

# Matar el proceso
sudo kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
```

### Error: Docker no tiene permisos

**Problema**: `permission denied while trying to connect to the Docker daemon socket`

**Solución**:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Error: Migraciones fallan

**Problema**: `alembic upgrade head` falla

**Solución**:
```bash
# Ver estado de migraciones
docker compose exec backend alembic current

# Resetear base de datos (⚠️ elimina todos los datos)
docker compose down -v
docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_initial.py
```

### Error: Frontend no carga

**Problema**: Pantalla en blanco o errores en consola

**Solución**:
```bash
# Reinstalar dependencias
docker compose exec frontend rm -rf node_modules
docker compose exec frontend npm install

# O reconstruir contenedor
docker compose down
docker compose up -d --build frontend
```

### Error: No se puede conectar a la base de datos

**Problema**: `could not connect to server`

**Solución**:
```bash
# Verificar que la base de datos está corriendo
docker compose ps db

# Ver logs
docker compose logs db

# Reiniciar base de datos
docker compose restart db

# Esperar a que esté healthy
docker compose ps
```

## Desinstalación

### Eliminar contenedores y volúmenes (mantiene imágenes)
```bash
docker compose down -v
```

### Eliminar todo (incluidas imágenes)
```bash
docker compose down -v --rmi all
```

### Eliminar carpeta del proyecto
```bash
cd ..
rm -rf attendance-system
```

## Próximos Pasos

Una vez instalado exitosamente:

1. **Cambiar contraseña del admin** (ir a Perfil → Cambiar Contraseña)
2. **Crear sedes adicionales** (si tienes más de una sede)
3. **Crear usuarios** (profesores, secretaría)
4. **Importar datos** (estudiantes, cursos, materias)
5. **Leer la [Guía de Administración](ADMIN_GUIDE.md)**

## Ayuda Adicional

- **Documentación completa**: Ver carpeta `docs/`
- **Issues**: Reportar problemas en [GitHub Issues]
- **Email**: soporte@colegio.edu

---

**Actualizado**: 2024-01-22
**Versión**: 1.0.0
