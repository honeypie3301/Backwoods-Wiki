@echo off
cd /d "%~dp0"

REM 1. Auto-install dependencies if node_modules or vite is missing
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

REM 3. Launch server with PM2 or Node fallback
if exist "dist\server.cjs" (
    set PORT=6000
    call pm2 restart backwoods-wiki >nul 2>&1 || call pm2 start dist/server.cjs --name backwoods-wiki --env PORT=6000 >nul 2>&1 || goto fallback
    echo Backwoods Wiki server started in the background at http://localhost:6000
    for /f "tokens=*" %%a in ('git log -1 --oneline') do echo Latest Commit: %%a
    goto end
)

:fallback
echo Starting Backwoods Wiki server at http://localhost:6000...
set PORT=6000
if exist "dist\server.cjs" (
    node dist/server.cjs
) else (
    call npx tsx server.ts
)

:end
