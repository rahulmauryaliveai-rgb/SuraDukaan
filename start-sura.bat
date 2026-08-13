@echo off
title SURA SHOP - Local Server
cd /d "%~dp0"
echo ============================================
echo   SURA SHOP - starting local development
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

if not exist .env (
  echo Creating .env from .env.example ...
  copy /y .env.example .env >nul
)

if not exist node_modules (
  echo Installing packages - this can take a few minutes on first run...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection and re-run.
    pause
    exit /b 1
  )
)

node scripts\dev.mjs
echo.
echo Server stopped.
pause
