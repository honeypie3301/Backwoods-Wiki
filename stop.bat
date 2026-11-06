@echo off
cd /d "%~dp0"
call pm2 stop backwoods-wiki >nul 2>&1
node scripts\stop-background.js
