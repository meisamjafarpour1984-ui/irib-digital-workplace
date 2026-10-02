@echo off
chcp 65001 >nul
title IRIB Digital Workplace - Production Deployment Wizard

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║
echo ║   IRIB Digital Workplace - Production Deployment Wizard
echo ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo This wizard will deploy the application to production environment.
echo Press Ctrl+C to cancel at any time.
echo.
pause

cd /d "%~dp0"
node scripts\deploy-production.js

echo.
echo Press any key to exit...
pause >nul
