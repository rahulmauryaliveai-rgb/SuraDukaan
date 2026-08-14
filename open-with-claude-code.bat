@echo off
title SURA SHOP - Claude Code
cd /d "%~dp0"
echo ============================================================
echo   Opening SURA SHOP with Claude Code
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed. Get it from https://nodejs.org
  pause
  exit /b 1
)

where claude >nul 2>nul
if errorlevel 1 (
  echo Claude Code is not installed yet. Installing now...
  echo This takes a minute or two.
  echo.
  call npm install -g @anthropic-ai/claude-code
  if errorlevel 1 (
    echo.
    echo [ERROR] Install failed. Try running this file again,
    echo or run this command yourself:  npm install -g @anthropic-ai/claude-code
    pause
    exit /b 1
  )
  echo.
  echo Installed.
  echo.
)

echo Starting Claude Code in:  %CD%
echo.
echo   - On first run it will ask you to log in with your Anthropic account.
echo   - Type your request in plain English, e.g. "add a coupon feature".
echo   - Type  /exit  to quit.
echo.
call claude
pause
