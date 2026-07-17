@echo off
setlocal

echo ===================================================
echo    VantEndpoint - Shutdown Script
echo ===================================================

echo Stopping Frontend and Backend Servers...

:: Kill node.js server processes (assuming dev server)
taskkill /F /IM node.js /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

:: Kill python backend processes
taskkill /F /FI "WINDOWTITLE eq VantEndpoint Backend*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VantEndpoint Frontend*" /T >nul 2>&1

:: Additionally fallback to search python running manage.py (careful with other python processes)
:: WMI is safer if needed, but window titles should be enough for now.

echo ===================================================
echo Servers stopped successfully.
echo ===================================================
pause
