@echo off
cd /d "%~dp0"
title Backwoods Wiki - Stopping

echo ========================================================
echo  Stopping Backwoods Wiki server (Port 3000)...
echo ========================================================

set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set FOUND=1
    echo Terminating PID: %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Also try closing any window titled "Backwoods Wiki Server"
taskkill /F /FI "WINDOWTITLE eq Backwoods Wiki Server*" >nul 2>&1

if "%FOUND%"=="1" (
    echo [SUCCESS] Server stopped successfully.
) else (
    echo [INFO] No server found running on port 3000.
)

echo.
timeout /t 2 >nul
