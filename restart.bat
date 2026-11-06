@echo off
cd /d "%~dp0"
title Backwoods Wiki - Restarting

echo ========================================================
echo  Restarting Backwoods Wiki...
echo ========================================================
call "%~dp0stop.bat"
echo.
call "%~dp0start.bat"
