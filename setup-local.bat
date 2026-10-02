@echo off
chcp 65001 >nul
title IRIB Digital Workplace - Local Development Setup Wizard

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║
echo ║   IRIB Digital Workplace - Local Development Setup Wizard
echo ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo This wizard will help you set up the local development environment.
echo Press Ctrl+C to cancel at any time.
echo.
pause

cd /d "%~dp0"
node scripts\setup-local.js

echo.
echo Press any key to exit...
pause >nul
