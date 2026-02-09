#!/bin/bash
set -e

echo "=================================================="
echo "  Sistema de Gestión de Asistencia - Deploy"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    echo "Por favor inicia Docker Desktop y vuelve a intentar"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker está corriendo"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠${NC}  No existe archivo .env, creando desde .env.example..."
    cp .env.example .env

    # Generate SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        sed -i '' "s/your-secret-key-here-generate-with-openssl-rand-hex-32/$SECRET_KEY/" .env
    else
        # Linux
        sed -i "s/your-secret-key-here-generate-with-openssl-rand-hex-32/$SECRET_KEY/" .env
    fi

    echo -e "${GREEN}✓${NC} Archivo .env creado con SECRET_KEY generado"
else
    echo -e "${GREEN}✓${NC} Archivo .env existe"
fi

# Stop any running containers
echo ""
echo "Deteniendo contenedores existentes..."
docker compose down -v 2>/dev/null || true

# Build and start services
echo ""
echo "=================================================="
echo "  Construyendo e iniciando servicios..."
echo "=================================================="
docker compose up -d --build

# Wait for database to be healthy
echo ""
echo "Esperando a que la base de datos esté lista..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Base de datos lista"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Error: Base de datos no respondió después de $max_attempts intentos${NC}"
    exit 1
fi

# Wait a bit more for backend to be ready
echo ""
echo "Esperando a que el backend esté listo..."
sleep 5

# Generate and apply migrations
echo ""
echo "=================================================="
echo "  Generando y aplicando migraciones..."
echo "=================================================="

echo "Generando migración inicial..."
docker compose exec -T backend alembic revision --autogenerate -m "Initial migration" || {
    echo -e "${YELLOW}⚠${NC}  Migración ya existe o error, continuando..."
}

echo "Aplicando migraciones..."
docker compose exec -T backend alembic upgrade head

echo -e "${GREEN}✓${NC} Migraciones aplicadas"

# Run seed
echo ""
echo "=================================================="
echo "  Poblando base de datos inicial..."
echo "=================================================="
docker compose exec -T backend python scripts/seed_initial.py

# Check health
echo ""
echo "=================================================="
echo "  Verificando estado del sistema..."
echo "=================================================="

echo -n "Backend health check... "
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

echo -n "Frontend... "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

# Show services status
echo ""
echo "Estado de servicios:"
docker compose ps

# Final message
echo ""
echo "=================================================="
echo -e "  ${GREEN}✓ Deploy completado exitosamente${NC}"
echo "=================================================="
echo ""
echo "URLs de acceso:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Credenciales por defecto:"
echo "  Email:     admin@colegio.edu"
echo "  Password:  changeme123"
echo ""
echo -e "${YELLOW}⚠ IMPORTANTE: Cambiar la contraseña después del primer login${NC}"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:           docker compose logs -f"
echo "  Detener servicios:  docker compose stop"
echo "  Reiniciar:          docker compose restart"
echo "  Eliminar todo:      docker compose down -v"
echo ""
echo "=================================================="
