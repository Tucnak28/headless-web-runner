@echo off
setlocal enabledelayedexpansion
title Headless Web Runner - Service Manager

:: Initialize variables
set backend_pid=
set frontend_pid=
set backend_status=STOPPED
set frontend_status=STOPPED

:: Create PID files directory
if not exist "pids" mkdir pids

:main
cls
echo ========================================
echo    Headless Web Runner - Service Manager
echo ========================================
echo.
call :check_services
echo Current Status:
echo   [1] Backend  : !backend_status!
echo   [2] Frontend : !frontend_status!
echo.
echo Actions:
echo   [3] Toggle Backend
echo   [4] Toggle Frontend  
echo   [5] Start Both Services
echo   [6] Stop All Services
echo   [7] View Backend Logs
echo   [8] Open Dashboard (if running)
echo   [9] Install Dependencies
echo   [U] Update Project from Git
echo   [0] Exit
echo.
set /p choice="Select option (0-9, U): "

if "!choice!"=="1" goto :show_backend_info
if "!choice!"=="2" goto :show_frontend_info
if "!choice!"=="3" goto :toggle_backend
if "!choice!"=="4" goto :toggle_frontend
if "!choice!"=="5" goto :start_both
if "!choice!"=="6" goto :stop_all
if "!choice!"=="7" goto :view_logs
if "!choice!"=="8" goto :open_dashboard
if "!choice!"=="9" goto :install_deps
if /i "!choice!"=="u" goto :update_project
if "!choice!"=="0" goto :exit
echo Invalid option. Press any key to continue...
pause >nul
goto :main

:check_services
:: Check if backend is running
if exist "pids\backend.pid" (
    set /p backend_pid=<"pids\backend.pid"
    tasklist /fi "pid eq !backend_pid!" 2>nul | find "!backend_pid!" >nul
    if !errorlevel! equ 0 (
        set backend_status=RUNNING ^(PID: !backend_pid!^)
    ) else (
        set backend_status=STOPPED
        del "pids\backend.pid" 2>nul
        set backend_pid=
    )
) else (
    set backend_status=STOPPED
    set backend_pid=
)

:: Check if frontend is running
if exist "pids\frontend.pid" (
    set /p frontend_pid=<"pids\frontend.pid"
    tasklist /fi "pid eq !frontend_pid!" 2>nul | find "!frontend_pid!" >nul
    if !errorlevel! equ 0 (
        set frontend_status=RUNNING ^(PID: !frontend_pid!^)
    ) else (
        set frontend_status=STOPPED
        del "pids\frontend.pid" 2>nul
        set frontend_pid=
    )
) else (
    set frontend_status=STOPPED
    set frontend_pid=
)
exit /b

:show_backend_info
cls
echo ========================================
echo           Backend Information
echo ========================================
echo.
echo Service: Headless Web Runner Backend
echo Port: 3001
echo URL: http://localhost:3001
echo Status: !backend_status!
echo.
if "!backend_pid!"=="" (
    echo Backend is not running.
    echo This service manages bot instances and provides the API.
) else (
    echo Backend is running with PID: !backend_pid!
    echo API endpoints are available at http://localhost:3001/api/
)
echo.
echo Press any key to return to main menu...
pause >nul
goto :main

:show_frontend_info
cls
echo ========================================
echo          Frontend Information  
echo ========================================
echo.
echo Service: Next.js Dashboard
echo Port: 3000
echo URL: http://localhost:3000
echo Status: !frontend_status!
echo.
if "!frontend_pid!"=="" (
    echo Frontend is not running.
    echo This provides the web dashboard for bot management.
) else (
    echo Frontend is running with PID: !frontend_pid!
    echo Dashboard is accessible at http://localhost:3000
)
echo.
echo Press any key to return to main menu...
pause >nul
goto :main

:toggle_backend
if "!backend_pid!"=="" (
    call :start_backend
) else (
    call :stop_backend
)
goto :main

:toggle_frontend
if "!frontend_pid!"=="" (
    call :start_frontend
) else (
    call :stop_frontend
)
goto :main

:start_backend
echo Starting backend service...
cd backend
start /b cmd /c "npm start > ../logs/backend-output.log 2>&1 & echo %%^! > ../pids/backend.pid"
cd ..
timeout /t 3 >nul
echo Backend service started.
pause
exit /b

:stop_backend
echo Stopping backend service...
if "!backend_pid!"=="" (
    echo Backend is not running.
) else (
    taskkill /pid !backend_pid! /f >nul 2>&1
    del "pids\backend.pid" 2>nul
    echo Backend service stopped.
)
pause
exit /b

:start_frontend
echo Starting frontend service...
cd frontend  
start /b cmd /c "npm run dev > ../logs/frontend-output.log 2>&1 & echo %%^! > ../pids/frontend.pid"
cd ..
timeout /t 5 >nul
echo Frontend service started.
echo Dashboard will be available at http://localhost:3000
pause
exit /b

:stop_frontend
echo Stopping frontend service...
if "!frontend_pid!"=="" (
    echo Frontend is not running.
) else (
    taskkill /pid !frontend_pid! /f >nul 2>&1
    del "pids\frontend.pid" 2>nul
    echo Frontend service stopped.
)
pause
exit /b

:start_both
echo Starting both services...
call :start_backend
timeout /t 2 >nul
call :start_frontend
echo.
echo Both services are starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
timeout /t 3 >nul
start http://localhost:3000
goto :main

:stop_all
echo Stopping all services...
call :stop_backend
call :stop_frontend
echo All services stopped.
pause
goto :main

:view_logs
cls
echo ========================================
echo              Service Logs
echo ========================================
echo.
if exist "logs\backend-output.log" (
    echo === Backend Log (last 20 lines) ===
    powershell "Get-Content 'logs\backend-output.log' -Tail 20"
    echo.
) else (
    echo No backend log file found.
    echo.
)

if exist "logs\frontend-output.log" (
    echo === Frontend Log (last 20 lines) ===  
    powershell "Get-Content 'logs\frontend-output.log' -Tail 20"
    echo.
) else (
    echo No frontend log file found.
    echo.
)
echo Press any key to continue...
pause >nul
goto :main

:open_dashboard
if "!frontend_pid!"=="" (
    echo Frontend is not running. Please start it first.
    pause
) else (
    echo Opening dashboard in browser...
    start http://localhost:3000
)
goto :main

:install_deps
cls
echo ========================================
echo        Installing Dependencies
echo ========================================
echo.
echo This will install all required packages...
echo.
call npm run install:all
echo.
echo Dependencies installation complete!
pause
goto :main

:update_project
cls
echo ========================================
echo         Update Project from Git
echo ========================================
echo.

:: Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH!
    echo Please install Git from: https://git-scm.com/
    pause
    goto :main
)

:: Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This is not a Git repository!
    echo Make sure you're in the correct project folder.
    pause
    goto :main
)

:: Stop all services before updating
echo Stopping all services before update...
call :stop_all

:: Show current status
echo Current version:
git log -1 --oneline
echo.

:: Fetch latest changes
echo Fetching latest changes from remote...
git fetch origin
if %errorlevel% neq 0 (
    echo ERROR: Failed to fetch from remote repository.
    echo Check your internet connection and git credentials.
    pause
    goto :main
)

:: Check if updates available
for /f %%i in ('git rev-list HEAD...origin/main --count') do set update_count=%%i
if "!update_count!"=="0" (
    echo No updates available. You're up to date!
    pause
    goto :main
)

:: Show available updates
echo !update_count! update(s) available:
git log HEAD..origin/main --oneline
echo.

:: Confirm update
set /p update_confirm="Do you want to update? This will pull latest changes (y/n): "
if /i not "!update_confirm!"=="y" (
    echo Update cancelled.
    pause
    goto :main
)

:: Backup current changes (if any)
git diff --quiet
if %errorlevel% neq 0 (
    echo You have uncommitted changes. Creating backup...
    git stash push -m "Auto-backup before update"
    set has_stash=1
) else (
    set has_stash=0
)

:: Pull latest changes
echo Pulling latest changes...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: Git pull failed!
    if "!has_stash!"=="1" (
        echo Restoring your changes...
        git stash pop
    )
    pause
    goto :main
)

:: Check if package.json files changed
git diff HEAD~!update_count! --name-only | findstr "package.json" >nul
if %errorlevel% equ 0 (
    echo Package.json files changed. Updating dependencies...
    call npm run install:all
    if %errorlevel% neq 0 (
        echo WARNING: Dependency installation failed!
        echo You may need to run 'Install Dependencies' manually.
    )
) else (
    echo No dependency changes detected. Skipping npm install.
)

:: Restore stashed changes if any
if "!has_stash!"=="1" (
    echo Restoring your previous changes...
    git stash pop
    if %errorlevel% neq 0 (
        echo WARNING: Could not restore all changes automatically.
        echo Check 'git status' for conflicts.
    )
)

echo.
echo ========================================
echo         Update Complete!
echo ========================================
echo Updated from:
git log -1 --oneline HEAD~!update_count!
echo To:
git log -1 --oneline HEAD
echo.
echo You can now restart your services.
pause
goto :main

:exit
echo.
echo Do you want to stop all running services before exiting? (y/n)
set /p stop_choice="Choice: "
if /i "!stop_choice!"=="y" (
    call :stop_all
    echo All services stopped.
)
echo.
echo Goodbye!
timeout /t 2 >nul
exit