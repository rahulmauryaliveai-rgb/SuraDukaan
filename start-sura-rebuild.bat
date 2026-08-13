@echo off
title SURA SHOP - Rebuild and Start
cd /d "%~dp0"
echo Rebuilding SURA SHOP with your latest code changes...
node scripts\dev.mjs --rebuild
pause
