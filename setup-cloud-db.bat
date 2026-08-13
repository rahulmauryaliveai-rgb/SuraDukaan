@echo off
title SURA SHOP - Set up cloud database (Supabase)
cd /d "%~dp0"
echo ============================================================
echo   Create the SURA SHOP tables + demo data in Supabase
echo ============================================================
echo.
echo You need the DIRECT connection string from Supabase:
echo   Supabase dashboard - Project Settings - Database
echo   - Connection string - URI  (the one on port 5432)
echo   - replace [YOUR-PASSWORD] with your database password
echo.
set /p DBURL=Paste the connection string here:

if "%DBURL%"=="" (
  echo No connection string entered. Exiting.
  pause
  exit /b 1
)

set DATABASE_URL=%DBURL%
set DIRECT_URL=%DBURL%
set AUTH_SECRET=temporary-secret-used-only-for-seeding-1234567890

echo.
echo Creating tables...
call npx prisma db push --skip-generate
if errorlevel 1 (
  echo [ERROR] Could not create tables. Check the connection string and try again.
  pause
  exit /b 1
)

echo.
echo Seeding plans, admin user and demo shop...
call npx tsx prisma/seed.ts

echo.
echo ============================================================
echo   Done. Your cloud database is ready.
echo   Admin login:      9999999999
echo   Demo shop owner:  8888888888
echo ============================================================
pause
