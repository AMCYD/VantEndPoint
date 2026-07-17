@echo off
setlocal

echo ===================================================
echo    VantEndpoint - Startup Script
echo ===================================================

echo [1/4] Checking Virtual Environment...
cd /d "%~dp0backend"
if not exist venv (
    echo [ERROR] Virtual environment not found. Please run Install_Dependencies.bat first.
    pause
    exit /b 1
)

echo [2/4] Starting Backend Server (Background)...
start /B "" cmd /c "cd /d ""%~dp0backend"" && call venv\Scripts\activate && python manage.py runserver"

echo [3/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server (Background)...
start /B "" cmd /c "cd /d ""%~dp0frontend"" && npm run dev"

echo Opening Browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo ===================================================
echo VantEndpoint is running!
echo Both backend and frontend are running in the background of this window.
echo Run Stop_VantEndpoint.bat to shutdown the servers.
echo You can close this window now.
echo ===================================================
pause
