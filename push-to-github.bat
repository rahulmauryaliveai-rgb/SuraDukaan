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

rem An interrupted git command - or OneDrive holding a file open mid-write - can
rem leave lock files behind and block every later commit. No git process runs at
rem this point, so any lock still on disk is stale and safe to remove.
echo Clearing any leftover git lock files...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\config.lock" del /f /q ".git\config.lock"
if exist ".git\objects\maintenance.lock" del /f /q ".git\objects\maintenance.lock"
for /r ".git\refs" %%L in (*.lock) do del /f /q "%%L" 2>nul
del /f /q ".git\objects\??\tmp_obj_*" 2>nul

echo Adding files...
git add -A

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "SURA SHOP - update"
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
