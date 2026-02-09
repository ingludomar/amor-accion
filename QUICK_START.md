# Inicio Rápido - Sistema de Gestión de Asistencia

Guía rápida para poner en marcha el sistema en 5 minutos.

## Requisitos

- Docker 24+ y Docker Compose v2 instalados
- 4GB RAM y 20GB disco disponible

## Pasos

### 1. Clonar y configurar

```bash
git clone <repository-url>
cd attendance-system
cp .env.example .env
```

### 2. Generar SECRET_KEY

```bash
openssl rand -hex 32
```

Copiar el resultado y reemplazar en `.env` la línea:
```
SECRET_KEY=<pegar-aqui>
```

### 3. Iniciar servicios

```bash
docker compose up -d
```

Esperar 30-60 segundos para que los servicios inicien completamente.

### 4. Configurar base de datos

```bash
# Ejecutar migraciones
docker compose exec backend alembic upgrade head

# Crear datos iniciales (roles, admin, sede demo)
docker compose exec backend python scripts/seed_initial.py
```

### 5. Acceder al sistema

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

**Credenciales:**
- Email: `admin@colegio.edu`
- Password: `changeme123`

## Verificar Instalación

```bash
# Ver estado de servicios
docker compose ps

# Ver logs
docker compose logs -f backend

# Health check
curl http://localhost:8000/health
```

## Comandos Útiles

```bash
# Detener servicios
docker compose stop

# Reiniciar servicios
docker compose restart

# Ver logs en tiempo real
docker compose logs -f

# Eliminar todo (⚠️ borra datos)
docker compose down -v
```

## Próximos Pasos

1. ✅ Cambiar contraseña del admin
2. ✅ Explorar la [Documentación API](http://localhost:8000/docs)
3. ✅ Leer la [Guía de Instalación Completa](docs/INSTALLATION.md)
4. ✅ Ver la [Guía de Administración](docs/ADMIN_GUIDE.md)

## Problemas Comunes

**Puerto ocupado**: Cambiar puertos en `docker-compose.yml`

**Servicios no inician**: Verificar que Docker está corriendo:
```bash
docker info
```

**Base de datos no conecta**: Esperar más tiempo o reiniciar:
```bash
docker compose restart db backend
```

## Ayuda

- Documentación completa: `docs/`
- Problemas: [GitHub Issues]
- Email: soporte@colegio.edu

---

**Listo!** 🎉 El sistema está corriendo y listo para usar.
