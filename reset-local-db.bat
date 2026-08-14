@echo off
title SURA SHOP - Reset local database
cd /d "%~dp0"
echo ============================================================
echo   Resetting the LOCAL development database
echo   (Your code is untouched. Demo data will be recreated.)
echo ============================================================
echo.
echo NOTE: this stops any running PostgreSQL on this PC. If you use
echo PostgreSQL for something else, close this window now.
echo.
timeout /t 4 /nobreak >nul

echo Stopping database processes...
taskkill /F /IM postgres.exe >nul 2>nul
timeout /t 3 /nobreak >nul

echo Removing old database files...
if exist ".pgdata" rmdir /s /q ".pgdata"
if exist ".setup-done" del /f /q ".setup-done"
if exist ".pgdata" (
  echo.
  echo [ERROR] Could not delete .pgdata - a program is still using it.
  echo Restart your PC and run this file again.
  pause
  exit /b 1
)

echo Done. Starting SURA SHOP fresh...
echo.
node scripts\dev.mjs --rebuild
pause
