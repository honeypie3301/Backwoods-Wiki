@echo off
cd /d "%~dp0"

REM 1. Auto-install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [Backwoods Wiki] Installing missing dependencies...
    call npm install
)

REM 2. Build production bundle (keeps wiki updated every start)
call npm run build
if errorlevel 1 (
    echo [Backwoods Wiki] Build failed. Checking dependencies...
    call npm install
    call npm run build
)

REM 3. Stop any existing instance cleanly, then start fresh
call pm2 delete backwoods-wiki >nul 2>&1
call pm2 start dist/server.cjs --name backwoods-wiki
echo.
echo Backwoods Wiki server started at http://localhost:4000
for /f "tokens=*" %%a in ('git log -1 --oneline') do echo Latest Commit: %%a
