@echo off
echo ========================================
echo    Headless Web Runner - Easy Start
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies... This may take a few minutes.
    call npm run install:all
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

:: Start the application
echo Starting Headless Web Runner...
echo.
echo The application will start two services:
echo - Backend Server: http://localhost:3001
echo - Frontend Dashboard: http://localhost:3000
echo.
echo The dashboard will automatically open in your default browser.
echo Press Ctrl+C to stop both services when you're done.
echo.

start http://localhost:3000

call npm run dev