@echo off
setlocal

echo ===================================================
echo    VantEndpoint - Shutdown Script
echo ===================================================

echo Stopping Frontend and Backend Servers...

:: Terminate named windows
taskkill /F /FI "WINDOWTITLE eq VantEndpoint Backend*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VantEndpoint Frontend*" /T >nul 2>&1

:: Free port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Free port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Terminate any residual node.exe dev servers
taskkill /F /IM node.exe /T >nul 2>&1

echo ===================================================
echo Servers stopped successfully.
echo ===================================================
pause
