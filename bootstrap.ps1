<#
.SYNOPSIS
    Smart Offer - Bootstrap Script (Windows)
.DESCRIPTION
    Validates prerequisites and starts the Docker Compose stack with health checks.
.PARAMETER BackendOnly
    Starts only the DB and API services.
.PARAMETER FrontendOnly
    Starts only the frontend service (assumes DB/API are running or external).
.PARAMETER Rebuild
    Forces a rebuild of the Docker images before starting.
#>
param (
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Rebuild
)

$ErrorActionPreference = "Stop"

# --- Formatting Helpers ---
function Write-Header ($Title) {
    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
}

function Write-Success ($Message) {
    Write-Host " [OK] $Message" -ForegroundColor Green
}

function Write-WarningMsg ($Message) {
    Write-Host " [WARN] $Message" -ForegroundColor Yellow
}

function Write-Fatal ($Message) {
    Write-Host " [FATAL] $Message" -ForegroundColor Red
    exit 1
}

# --- 1. Pre-flight Checks ---
Write-Header "Pre-flight Checks"

# Check Docker
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Fatal "Docker is not installed or not in PATH. Please install Docker Desktop."
}
if (!(docker info 2>$null)) {
    Write-Fatal "Docker daemon is not running. Please start Docker Desktop."
}
Write-Success "Docker is running."

# Check .env file
$envPath = Join-Path $PSScriptRoot "infra" ".env"
if (!(Test-Path $envPath)) {
    Write-WarningMsg "infra/.env not found. Copying infra/.env.example to infra/.env..."
    $examplePath = Join-Path $PSScriptRoot "infra" ".env.example"
    if (Test-Path $examplePath) {
        Copy-Item $examplePath $envPath
        Write-Success "infra/.env created. Please update it with real values if needed."
    } else {
        Write-Fatal "infra/.env.example not found. Cannot create .env."
    }
} else {
    Write-Success "infra/.env found."
}


# --- 2. Determine Services to Start ---
Write-Header "Starting Services"

$composeFile = Join-Path $PSScriptRoot "infra" "docker-compose.yml"
$composeCmd = "docker compose -f `"$composeFile`" up -d"

if ($Rebuild) {
    $composeCmd += " --build"
}

if ($BackendOnly) {
    Write-Host "Starting Backend services only (db, backend)..." -ForegroundColor Magenta
    $composeCmd += " db backend"
} elseif ($FrontendOnly) {
    Write-Host "Starting Frontend service only..." -ForegroundColor Magenta
    $composeCmd += " frontend"
} else {
    Write-Host "Starting full stack (db, backend, frontend)..." -ForegroundColor Magenta
}

# Execute Compose
Write-Host "Running: $composeCmd" -ForegroundColor DarkGray
Invoke-Expression $composeCmd
if ($LASTEXITCODE -ne 0) {
    Write-Fatal "Docker Compose failed to start services."
}


# --- 3. Wait for Health Checks ---
Write-Header "Waiting for Services to become Healthy"

$servicesToCheck = @()
if ($BackendOnly) {
    $servicesToCheck = @("smartoffer-db", "smartoffer-api")
} elseif ($FrontendOnly) {
    $servicesToCheck = @("smartoffer-web")
} else {
    $servicesToCheck = @("smartoffer-db", "smartoffer-api", "smartoffer-web")
}

$maxAttempts = 30
$delaySeconds = 3

$allHealthy = $true

foreach ($serviceName in $servicesToCheck) {
    Write-Host "Waiting for $serviceName..." -NoNewline
    $isHealthy = $false

    for ($i = 1; $i -le $maxAttempts; $i++) {
        $status = (docker inspect --format='{{json .State.Health.Status}}' $serviceName 2>$null).Trim('"')
        
        if ($status -eq "healthy") {
            $isHealthy = $true
            Write-Host " [HEALTHY]" -ForegroundColor Green
            break
        } elseif ($status -eq "unhealthy") {
            Write-Host " [FAILED HEALTHCHECK]" -ForegroundColor Red
            $allHealthy = $false
            break
        }
        
        Write-Host "." -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds $delaySeconds
    }

    if (-not $isHealthy -and $status -ne "unhealthy") {
        Write-Host " [TIMEOUT]" -ForegroundColor Red
        $allHealthy = $false
    }
}


# --- 4. Final Status ---
Write-Header "Stack Status"

docker compose -f $composeFile ps

if ($allHealthy) {
    Write-Host "`n🚀 All requested services are up and healthy!" -ForegroundColor Green
    if (-not $BackendOnly) {
        Write-Host "Frontend is available at: http://localhost:3000" -ForegroundColor Cyan
    }
    if (-not $FrontendOnly) {
        Write-Host "Backend API is available at: http://localhost:8000/docs" -ForegroundColor Cyan
    }
} else {
    Write-WarningMsg "Some services failed to report as healthy. Check container logs with: docker compose -f .\infra\docker-compose.yml logs"
}
