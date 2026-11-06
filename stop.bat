@echo off
cd /d "%~dp0"
call pm2 delete backwoods-wiki >nul 2>&1
set PORT=4000
node scripts\stop-background.js
echo.
echo Backwoods Wiki stopped.
