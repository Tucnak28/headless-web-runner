@echo off
echo ========================================
echo    Headless Web Runner - Quick Fix
echo ========================================
echo.
echo This script will try to fix common problems:
echo.

:: Kill any existing Node processes
echo 1. Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 >nul

:: Clear npm cache
echo 2. Clearing npm cache...
call npm cache clean --force >nul 2>&1

:: Reinstall dependencies if needed
echo 3. Checking dependencies...
if not exist "node_modules" (
    echo    Installing dependencies...
    call npm run install:all
)
if not exist "backend\node_modules" (
    echo    Installing backend dependencies...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules" (
    echo    Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

echo.
echo Quick fix complete! Try running start.bat now.
echo.
pause