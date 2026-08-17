@echo off
title SURA SHOP - Restart and refresh demo data
cd /d "%~dp0"
echo ============================================================
echo   Refreshing the demo data, then restarting SURA SHOP.
echo   This puts the demo shop on a paid plan so you can try
echo   the new AI photo feature. No rebuild needed - it's quick.
echo ============================================================
echo.
timeout /t 3 /nobreak >nul

if exist ".setup-done" del /f /q ".setup-done"

rem The marketing carousel caches its shop list on disk. Clear it, or the site
rem keeps showing the shops from before the re-seed.
if exist ".next\cache\fetch-cache" rmdir /s /q ".next\cache\fetch-cache"

node scripts\dev.mjs
pause
