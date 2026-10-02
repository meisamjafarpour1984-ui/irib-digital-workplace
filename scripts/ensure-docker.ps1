# IRIB Digital Workplace - Docker Desktop Setup Script
# All rights reserved © 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Desktop Setup & Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop is installed
$dockerPath1 = "$env:LOCALAPPDATA\Docker\Docker Desktop\Docker Desktop.exe"
$dockerPath2 = "$env:PROGRAMFILES\Docker\Docker\Docker Desktop.exe"
$dockerPath = if (Test-Path $dockerPath1) { $dockerPath1 } elseif (Test-Path $dockerPath2) { $dockerPath2 } else { $null }
$dockerInstalled = $null -ne $dockerPath

if (-not $dockerInstalled) {
    Write-Host "Docker Desktop is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please download and install Docker Desktop from:" -ForegroundColor White
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Docker Desktop is installed at: $dockerPath" -ForegroundColor Green
Write-Host ""

# Check if Docker Desktop is already running
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host "Docker Desktop is already running." -ForegroundColor Green
} else {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process $dockerPath
    
    # Wait for Docker Desktop to start
    Write-Host "Waiting for Docker Desktop to start..." -ForegroundColor Yellow
    $maxWait = 120 # 2 minutes
    $waited = 0
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
        
        if ($dockerProcess) {
            Write-Host "Docker Desktop process started." -ForegroundColor Green
            break
        }
        
        Write-Host "Waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
    }
    
    if (-not $dockerProcess) {
        Write-Host "Failed to start Docker Desktop within timeout." -ForegroundColor Red
        exit 1
    }
}

# Wait for Docker daemon to be ready
Write-Host ""
Write-Host "Waiting for Docker daemon to be ready..." -ForegroundColor Yellow
$maxWait = 180 # 3 minutes
$waited = 0

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 3
    $waited += 3
    
    try {
        $result = docker version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker daemon is ready." -ForegroundColor Green
            break
        }
    } catch {
        # Docker not ready yet
    }
    
    Write-Host "Waiting for Docker daemon... ($waited/$maxWait seconds)" -ForegroundColor Gray
}

if ($waited -ge $maxWait) {
    Write-Host "Docker daemon did not become ready within timeout." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
