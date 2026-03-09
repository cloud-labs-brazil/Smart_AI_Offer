#!/bin/bash
# Smart Offer - Bootstrap Script (Linux/macOS)
# Validates prerequisites and starts the Docker Compose stack with health checks.

set -e

# --- Formatting Helpers ---
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[1;30m'
NC='\033[0m' # No Color

write_header() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

write_success() {
    echo -e " ${GREEN}[OK]${NC} $1"
}

write_warning() {
    echo -e " ${YELLOW}[WARN]${NC} $1"
}

write_fatal() {
    echo -e " ${RED}[FATAL]${NC} $1"
    exit 1
}

# --- Parse Arguments ---
BACKEND_ONLY=0
FRONTEND_ONLY=0
REBUILD=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --backend-only) BACKEND_ONLY=1 ;;
        --frontend-only) FRONTEND_ONLY=1 ;;
        --rebuild) REBUILD=1 ;;
        *) write_fatal "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# --- 1. Pre-flight Checks ---
write_header "Pre-flight Checks"

if ! command -v docker &> /dev/null; then
    write_fatal "Docker is not installed or not in PATH."
fi

if ! docker info &> /dev/null; then
    write_fatal "Docker daemon is not running."
fi
write_success "Docker is running."

ENV_FILE="./infra/.env"
if [ ! -f "$ENV_FILE" ]; then
    write_warning "infra/.env not found. Copying infra/.env.example to infra/.env..."
    if [ -f "./infra/.env.example" ]; then
        cp ./infra/.env.example ./infra/.env
        write_success "infra/.env created. Please update it with real values if needed."
    else
        write_fatal "infra/.env.example not found. Cannot create .env."
    fi
else
    write_success "infra/.env found."
fi

# --- 2. Determine Services to Start ---
write_header "Starting Services"

COMPOSE_FILE="./infra/docker-compose.yml"
COMPOSE_CMD="docker compose -f $COMPOSE_FILE up -d"

if [ $REBUILD -eq 1 ]; then
    COMPOSE_CMD="$COMPOSE_CMD --build"
fi

if [ $BACKEND_ONLY -eq 1 ]; then
    echo -e "${YELLOW}Starting Backend services only (db, backend)...${NC}"
    COMPOSE_CMD="$COMPOSE_CMD db backend"
elif [ $FRONTEND_ONLY -eq 1 ]; then
    echo -e "${YELLOW}Starting Frontend service only...${NC}"
    COMPOSE_CMD="$COMPOSE_CMD frontend"
else
    echo -e "${YELLOW}Starting full stack (db, backend, frontend)...${NC}"
fi

echo -e "${GRAY}Running: $COMPOSE_CMD${NC}"
eval $COMPOSE_CMD

# --- 3. Wait for Health Checks ---
write_header "Waiting for Services to become Healthy"

SERVICES=()
if [ $BACKEND_ONLY -eq 1 ]; then
    SERVICES=("smartoffer-db" "smartoffer-api")
elif [ $FRONTEND_ONLY -eq 1 ]; then
    SERVICES=("smartoffer-web")
else
    SERVICES=("smartoffer-db" "smartoffer-api" "smartoffer-web")
fi

MAX_ATTEMPTS=30
DELAY_SECONDS=3
ALL_HEALTHY=1

for SERVICE in "${SERVICES[@]}"; do
    printf "Waiting for %s..." "$SERVICE"
    IS_HEALTHY=0

    for ((i=1; i<=MAX_ATTEMPTS; i++)); do
        STATUS=$(docker inspect --format='{{json .State.Health.Status}}' "$SERVICE" 2>/dev/null | tr -d '"')
        
        if [ "$STATUS" = "healthy" ]; then
            IS_HEALTHY=1
            echo -e " ${GREEN}[HEALTHY]${NC}"
            break
        elif [ "$STATUS" = "unhealthy" ]; then
            echo -e " ${RED}[FAILED HEALTHCHECK]${NC}"
            ALL_HEALTHY=0
            break
        fi
        
        printf "${GRAY}.${NC}"
        sleep $DELAY_SECONDS
    done

    if [ $IS_HEALTHY -eq 0 ] && [ "$STATUS" != "unhealthy" ]; then
        echo -e " ${RED}[TIMEOUT]${NC}"
        ALL_HEALTHY=0
    fi
done

# --- 4. Final Status ---
write_header "Stack Status"

docker compose -f $COMPOSE_FILE ps

if [ $ALL_HEALTHY -eq 1 ]; then
    echo -e "\n🚀 ${GREEN}All requested services are up and healthy!${NC}"
    if [ $BACKEND_ONLY -eq 0 ]; then
        echo -e "${CYAN}Frontend is available at: http://localhost:3000${NC}"
    fi
    if [ $FRONTEND_ONLY -eq 0 ]; then
        echo -e "${CYAN}Backend API is available at: http://localhost:8000/docs${NC}"
    fi
else
    write_warning "Some services failed to report as healthy. Check container logs with: docker compose -f ./infra/docker-compose.yml logs"
fi
