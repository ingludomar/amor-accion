#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║    Sistema de Asistencia - Verificación de Requisitos    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
echo -n "Verificando Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Instalado${NC} (versión $DOCKER_VERSION)"
    DOCKER_OK=1
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "  → Instalar desde: https://www.docker.com/products/docker-desktop"
    DOCKER_OK=0
fi

# Check Docker Compose
echo -n "Verificando Docker Compose... "
if command -v docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    echo -e "${GREEN}✓ Instalado${NC} (versión $COMPOSE_VERSION)"
    COMPOSE_OK=1
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "  → Viene incluido con Docker Desktop"
    COMPOSE_OK=0
fi

# Check if Docker is running
if [ $DOCKER_OK -eq 1 ]; then
    echo -n "Verificando Docker daemon... "
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Corriendo${NC}"
        DAEMON_OK=1
    else
        echo -e "${RED}✗ No está corriendo${NC}"
        echo "  → Iniciar Docker Desktop"
        DAEMON_OK=0
    fi
fi

# Check project files
echo ""
echo "Verificando archivos del proyecto:"
FILES=(
    "docker-compose.yml"
    "backend/requirements.txt"
    "backend/app/main.py"
    "frontend/package.json"
    ".env.example"
    "scripts/seed_initial.py"
)

FILES_OK=1
for file in "${FILES[@]}"; do
    echo -n "  Verificando $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        FILES_OK=0
    fi
done

# Check .env file
echo ""
echo -n "Verificando archivo .env... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Existe${NC}"

    # Check if SECRET_KEY is set
    if grep -q "SECRET_KEY=your-secret-key" .env 2>/dev/null; then
        echo -e "  ${YELLOW}⚠ SECRET_KEY no ha sido generado${NC}"
        echo "  → Ejecutar: openssl rand -hex 32"
        ENV_OK=0
    else
        echo -e "  ${GREEN}✓ SECRET_KEY configurado${NC}"
        ENV_OK=1
    fi
else
    echo -e "${YELLOW}⚠ No existe${NC}"
    echo "  → Se creará automáticamente con ./deploy.sh"
    ENV_OK=1
fi

# Check ports
echo ""
echo "Verificando puertos disponibles:"
PORTS=(8000 5432 5173)
PORTS_OK=1

for port in "${PORTS[@]}"; do
    echo -n "  Puerto $port... "
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ En uso${NC}"
        PROCESS=$(lsof -Pi :$port -sTCP:LISTEN | tail -1 | awk '{print $1}')
        echo "    (usado por: $PROCESS)"
        PORTS_OK=0
    else
        echo -e "${GREEN}✓ Disponible${NC}"
    fi
done

# Check disk space
echo ""
echo -n "Verificando espacio en disco... "
if command -v df &> /dev/null; then
    AVAILABLE=$(df -h . | tail -1 | awk '{print $4}')
    echo -e "${GREEN}✓${NC} ($AVAILABLE disponible)"
else
    echo -e "${YELLOW}⚠ No se pudo verificar${NC}"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                        RESUMEN                            "
echo "═══════════════════════════════════════════════════════════"
echo ""

READY=1

if [ $DOCKER_OK -eq 1 ] && [ $COMPOSE_OK -eq 1 ] && [ $DAEMON_OK -eq 1 ] && [ $FILES_OK -eq 1 ]; then
    echo -e "${GREEN}✓ LISTO PARA DEPLOY${NC}"
    echo ""
    echo "Para iniciar el sistema ejecuta:"
    echo -e "${BLUE}  ./deploy.sh${NC}"
    echo ""
    READY=1
else
    echo -e "${RED}✗ NO LISTO PARA DEPLOY${NC}"
    echo ""
    echo "Pasos para resolver:"

    if [ $DOCKER_OK -eq 0 ] || [ $COMPOSE_OK -eq 0 ]; then
        echo "  1. Instalar Docker Desktop:"
        echo "     https://www.docker.com/products/docker-desktop"
    fi

    if [ $DAEMON_OK -eq 0 ]; then
        echo "  2. Iniciar Docker Desktop"
    fi

    if [ $FILES_OK -eq 0 ]; then
        echo "  3. Verificar que estás en el directorio correcto:"
        echo "     cd /Users/luisdominguez/attendance-system"
    fi

    if [ $PORTS_OK -eq 0 ]; then
        echo "  4. Liberar puertos en uso o cambiarlos en docker-compose.yml"
    fi

    echo ""
    echo "Después ejecutar este script nuevamente:"
    echo "  ./check-ready.sh"
    echo ""
    READY=0
fi

echo "═══════════════════════════════════════════════════════════"

if [ $READY -eq 1 ]; then
    echo ""
    echo -e "${GREEN}¡Todo listo! 🚀${NC}"
    echo ""
fi

exit $((1 - READY))
