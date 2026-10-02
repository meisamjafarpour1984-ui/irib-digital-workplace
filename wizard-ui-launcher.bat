@echo off
chcp 65001 >nul
echo ==========================================
echo IRIB Digital Workplace - Wizard UI
echo ==========================================
echo.

REM Kill any existing Next.js processes to avoid port conflicts
echo Checking for existing Next.js processes...
tasklist | findstr "node.exe" >nul
if %errorlevel% equ 0 (
    echo Found existing Node.js processes. Please stop them manually or run:
    echo taskkill /F /IM node.exe
    echo.
)

REM Check if backend is running
echo Checking backend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/docs' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Backend is not running. Starting backend in background...
    start /b cmd /c "cd /d %~dp0backend && npm run start:dev > backend.log 2>&1"
    echo Waiting for backend to start...
    timeout /t 15 /nobreak >nul
) else (
    echo Backend is already running.
)

REM Check if frontend is running on port 3002
echo Checking frontend on port 3002...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3002' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Frontend is not running on port 3002. Starting frontend...
    start "IRIB Frontend" cmd /k "cd /d %~dp0 && npm run dev"
    echo Waiting for frontend to start...
    timeout /t 15 /nobreak >nul
) else (
    echo Frontend is already running on port 3002.
)

echo.
echo Opening Wizard UI in browser...
start http://localhost:3002/wizard

echo.
echo ==========================================
echo Wizard UI is now opening in your browser
echo ==========================================
echo.
echo If the browser doesn't open automatically, please visit:
echo http://localhost:3002/wizard
echo.
echo Backend: http://localhost:3001/api/docs
echo Frontend: http://localhost:3002
echo.
echo Note: Frontend is running in a visible window. Check for any port conflicts.
echo.
timeout /t 2
