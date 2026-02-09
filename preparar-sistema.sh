#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        PREPARACIÓN COMPLETA DEL SISTEMA DE ASISTENCIA         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0
WARNINGS=0

# ==================================================================
# FASE 1: VERIFICACIÓN DE REQUISITOS DEL SISTEMA
# ==================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FASE 1: VERIFICANDO REQUISITOS DEL SISTEMA                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1.1 Verificar Docker
echo -n "1.1 Verificando Docker instalado... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓ OK${NC} (versión $DOCKER_VERSION)"
else
    echo -e "${RED}✗ FALTA${NC}"
    echo "    → Necesitas instalar Docker Desktop"
    echo "    → https://www.docker.com/products/docker-desktop"
    ERRORS=$((ERRORS + 1))
fi

# 1.2 Verificar Docker Compose
echo -n "1.2 Verificando Docker Compose... "
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "instalado")
    echo -e "${GREEN}✓ OK${NC} (versión $COMPOSE_VERSION)"
else
    echo -e "${RED}✗ FALTA${NC}"
    echo "    → Docker Compose viene con Docker Desktop"
    ERRORS=$((ERRORS + 1))
fi

# 1.3 Verificar Docker está corriendo
echo -n "1.3 Verificando Docker daemon corriendo... "
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ NO ESTÁ CORRIENDO${NC}"
    echo "    → Abre Docker Desktop y espera a que inicie"
    ERRORS=$((ERRORS + 1))
fi

# 1.4 Verificar conexión a Internet
echo -n "1.4 Verificando conexión a Internet... "
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ SIN CONEXIÓN${NC}"
    echo "    → Verifica tu conexión WiFi/Ethernet"
    ERRORS=$((ERRORS + 1))
fi

# 1.5 Verificar acceso a Docker Hub
echo -n "1.5 Verificando acceso a Docker Hub... "
if curl -s --max-time 5 https://registry-1.docker.io/v2/ &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ LENTO O BLOQUEADO${NC}"
    echo "    → Puede que la descarga de imágenes sea lenta"
    echo "    → Verifica tu firewall o proxy"
    WARNINGS=$((WARNINGS + 1))
fi

# 1.6 Verificar espacio en disco
echo -n "1.6 Verificando espacio en disco... "
AVAILABLE=$(df -h . | tail -1 | awk '{print $4}')
AVAILABLE_GB=$(df -g . | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_GB" -gt 10 ]; then
    echo -e "${GREEN}✓ OK${NC} ($AVAILABLE disponible)"
else
    echo -e "${YELLOW}⚠ POCO ESPACIO${NC} ($AVAILABLE disponible)"
    echo "    → Se recomienda al menos 15GB libres"
    WARNINGS=$((WARNINGS + 1))
fi

# 1.7 Verificar RAM disponible
echo -n "1.7 Verificando RAM disponible... "
if command -v vm_stat &> /dev/null; then
    FREE_BLOCKS=$(vm_stat | grep free | awk '{print $3}' | sed 's/\.//')
    FREE_MB=$((FREE_BLOCKS * 4096 / 1048576))
    if [ "$FREE_MB" -gt 2048 ]; then
        echo -e "${GREEN}✓ OK${NC} (~${FREE_MB}MB libres)"
    else
        echo -e "${YELLOW}⚠ POCA RAM${NC} (~${FREE_MB}MB libres)"
        echo "    → Cierra aplicaciones innecesarias"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ NO SE PUDO VERIFICAR${NC}"
fi

echo ""

# ==================================================================
# FASE 2: VERIFICACIÓN DE ARCHIVOS DEL PROYECTO
# ==================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FASE 2: VERIFICANDO ARCHIVOS DEL PROYECTO                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 2.1 Verificar archivos principales
FILES=(
    "docker-compose.yml:Docker Compose config"
    "backend/requirements.txt:Dependencias Python"
    "backend/app/main.py:Aplicación FastAPI"
    "backend/Dockerfile:Dockerfile backend"
    "frontend/package.json:Dependencias Node"
    "frontend/Dockerfile:Dockerfile frontend"
    ".env.example:Template variables entorno"
    "scripts/seed_initial.py:Script de datos iniciales"
)

for item in "${FILES[@]}"; do
    file="${item%%:*}"
    desc="${item##*:}"
    echo -n "2.$(echo $item | grep -o ':' | wc -l) Verificando $desc... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FALTA${NC} ($file)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# ==================================================================
# FASE 3: VERIFICACIÓN DE PUERTOS
# ==================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FASE 3: VERIFICANDO PUERTOS DISPONIBLES                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

PORTS=(
    "8000:Backend API"
    "5432:PostgreSQL"
    "5173:Frontend"
)

for item in "${PORTS[@]}"; do
    port="${item%%:*}"
    desc="${item##*:}"
    echo -n "3.x Verificando puerto $port ($desc)... "
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        PROCESS=$(lsof -Pi :$port -sTCP:LISTEN | tail -1 | awk '{print $1}')
        PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo -e "${YELLOW}⚠ EN USO${NC} (proceso: $PROCESS, PID: $PID)"
        echo "    → Para liberar: kill -9 $PID"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ DISPONIBLE${NC}"
    fi
done

echo ""

# ==================================================================
# FASE 4: CONFIGURACIÓN DE VARIABLES DE ENTORNO
# ==================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FASE 4: CONFIGURANDO VARIABLES DE ENTORNO                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -n "4.1 Verificando archivo .env... "
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ YA EXISTE${NC}"
    echo "    → Verificando SECRET_KEY..."

    if grep -q "SECRET_KEY=your-secret-key" .env 2>/dev/null || grep -q "SECRET_KEY=$" .env 2>/dev/null; then
        echo -n "    → Generando nuevo SECRET_KEY... "
        SECRET_KEY=$(openssl rand -hex 32)
        if [ "$(uname)" = "Darwin" ]; then
            sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
        else
            sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
        fi
        echo -e "${GREEN}✓ GENERADO${NC}"
    else
        echo -e "    → ${GREEN}✓ SECRET_KEY ya configurado${NC}"
    fi
else
    echo -e "${YELLOW}⚠ NO EXISTE${NC}"
    echo -n "    → Creando desde .env.example... "
    cp .env.example .env

    # Generar SECRET_KEY
    SECRET_KEY=$(openssl rand -hex 32)
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "s/your-secret-key-here-generate-with-openssl-rand-hex-32/$SECRET_KEY/" .env
    else
        sed -i "s/your-secret-key-here-generate-with-openssl-rand-hex-32/$SECRET_KEY/" .env
    fi
    echo -e "${GREEN}✓ CREADO${NC}"
fi

echo ""

# ==================================================================
# FASE 5: DESCARGA DE IMÁGENES DOCKER
# ==================================================================

if [ $ERRORS -eq 0 ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  FASE 5: DESCARGANDO IMÁGENES DOCKER                          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Esta fase puede tomar 5-10 minutos dependiendo de tu conexión..."
    echo ""

    IMAGES=(
        "postgres:16-alpine"
        "python:3.11-slim"
        "node:20-alpine"
    )

    for image in "${IMAGES[@]}"; do
        echo -e "${BLUE}→ Descargando $image...${NC}"
        if docker pull $image; then
            echo -e "${GREEN}  ✓ $image descargado${NC}"
        else
            echo -e "${RED}  ✗ Error descargando $image${NC}"
            ERRORS=$((ERRORS + 1))
        fi
        echo ""
    done
fi

# ==================================================================
# FASE 6: RESUMEN Y RECOMENDACIONES
# ==================================================================

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "                           RESUMEN                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ TODO PERFECTO ✓✓✓${NC}"
    echo ""
    echo -e "${GREEN}El sistema está 100% listo para el deploy.${NC}"
    echo ""
    echo "Para iniciar el sistema ejecuta:"
    echo -e "${BLUE}  ./deploy.sh${NC}"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ LISTO CON ADVERTENCIAS ⚠${NC}"
    echo ""
    echo -e "${YELLOW}Encontradas $WARNINGS advertencia(s)${NC}"
    echo ""
    echo "El sistema puede funcionar, pero revisa las advertencias arriba."
    echo ""
    echo "Para iniciar el sistema ejecuta:"
    echo -e "${BLUE}  ./deploy.sh${NC}"
    echo ""
else
    echo -e "${RED}✗✗✗ PROBLEMAS ENCONTRADOS ✗✗✗${NC}"
    echo ""
    echo -e "${RED}Encontrados $ERRORS error(es) crítico(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}También $WARNINGS advertencia(s)${NC}"
    fi
    echo ""
    echo "DEBES resolver los errores marcados con ✗ antes de continuar."
    echo ""
    echo "Después de resolver los problemas, ejecuta de nuevo:"
    echo -e "${BLUE}  ./preparar-sistema.sh${NC}"
    echo ""
fi

echo "════════════════════════════════════════════════════════════════"
echo ""

# Guardar reporte
REPORT_FILE="verificacion-$(date +%Y%m%d-%H%M%S).log"
{
    echo "REPORTE DE VERIFICACIÓN DEL SISTEMA"
    echo "Fecha: $(date)"
    echo ""
    echo "Errores: $ERRORS"
    echo "Advertencias: $WARNINGS"
    echo ""
    echo "Ver detalles arriba en la terminal"
} > "$REPORT_FILE"

echo -e "${CYAN}→ Reporte guardado en: $REPORT_FILE${NC}"
echo ""

exit $ERRORS
