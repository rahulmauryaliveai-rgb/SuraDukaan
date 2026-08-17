@echo off
title SURA SHOP - Apply Phase 1 (AI photos + new pricing)
cd /d "%~dp0"
echo ============================================================
echo   SURA SHOP - applying Phase 1
echo.
echo   1. Push the new code to GitHub
echo   2. Rebuild the local database (new AI credit tables)
echo   3. Start the shop at http://localhost:3000
echo.
echo   Your code is safe. Only the local DEMO data is recreated.
echo ============================================================
echo.
echo Starting in 5 seconds. Close this window now to cancel.
timeout /t 5 /nobreak >nul

echo.
echo [1/3] Pushing to GitHub...
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo [SKIPPED] Git is not installed - carrying on with the local setup.
) else (
  if exist ".git\index.lock" del /f /q ".git\index.lock"
  git add -A
  git diff --cached --quiet || git commit -m "SURA SHOP - Phase 1 AI photo enhancement"
  git push origin main
  if errorlevel 1 echo [NOTE] Push did not complete. You can retry later with push-to-github.bat
)

echo.
echo [2/3] Rebuilding the local database...
echo.
taskkill /F /IM postgres.exe >nul 2>nul
timeout /t 3 /nobreak >nul
if exist ".pgdata" rmdir /s /q ".pgdata"
if exist ".setup-done" del /f /q ".setup-done"
if exist ".pgdata" (
  echo.
  echo [ERROR] Could not delete .pgdata - a program is still using it.
  echo Restart your PC and run this file again.
  pause
  exit /b 1
)

echo.
echo [3/3] Building and starting SURA SHOP...
echo   This first run takes a few minutes. Leave this window open.
echo.
node scripts\dev.mjs --rebuild
pause
