@echo off
cd /d "%~dp0"
title Backwoods Wiki - Starting

echo ========================================================
echo  Checking and stopping any running instance on port 3000...
echo ========================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping process PID: %%a listening on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================================
echo  Building project (npm run build)...
echo ========================================================
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] npm run build failed! Please check errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo  Starting Backwoods Wiki server...
echo  Localhost URL: http://localhost:3000
echo ========================================================

set NODE_ENV=production
start "Backwoods Wiki Server" cmd /k "title Backwoods Wiki Server && npm run start"

echo.
echo Server started in a new background window!
timeout /t 2 >nul
