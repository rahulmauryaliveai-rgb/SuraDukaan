@echo off
title SURA SHOP - Diagnose
cd /d "%~dp0"
npx tsx scripts\diagnose.ts
echo.
pause
