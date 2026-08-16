@echo off
title SURA SHOP - Push to GitHub
cd /d "%~dp0"
echo ============================================
echo   Pushing SURA SHOP to GitHub
echo   Repo: rahulmauryaliveai-rgb/SuraDukaan
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed or not in PATH.
  pause
  exit /b 1
)

if not exist .git (
  echo Initializing git repository...
  git init -b main
)

rem Ensure a commit identity exists (local to this repo only)
git config user.name >nul 2>nul || git config user.name "Rahul Maurya"
git config user.email >nul 2>nul || git config user.email "rahulmauryaliveai@gmail.com"

rem An interrupted git command (or a PC lock mid-push) can leave this behind and
rem block every later commit. No git process runs at this point, so it is stale.
if exist ".git\index.lock" (
  echo Clearing a leftover git lock file...
  del /f /q ".git\index.lock"
)

echo Adding files...
git add -A

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "SURA SHOP - multi-tenant WhatsApp commerce SaaS (initial release)"
) else (
  echo Nothing new to commit.
)

git remote remove origin >nul 2>nul
git remote add origin https://github.com/rahulmauryaliveai-rgb/SuraDukaan.git

echo.
echo Pushing to GitHub...
echo (If a GitHub sign-in window opens, please complete the login.)
git push -u origin main

if errorlevel 1 (
  echo.
  echo [NOTE] If the push was rejected because the repo already has files,
  echo run this command here manually:  git push -u origin main --force
)
echo.
pause
