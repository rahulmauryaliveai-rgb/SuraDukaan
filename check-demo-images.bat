@echo off
title SURA SHOP - Check demo images
cd /d "%~dp0"
node scripts\check-demo-images.mjs
echo.
pause
