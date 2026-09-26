@echo off
setlocal
title VantEndpoint Console

echo ===================================================
echo    VantEndpoint - Startup Script
echo ===================================================

echo [1/5] Checking Virtual Environment...
cd /d "%~dp0backend"
if not exist venv (
    echo [ERROR] Virtual environment not found. Please run Install_Dependencies.bat first.
    pause
    exit /b 1
)

echo [2/5] Applying Database Migrations...
call venv\Scripts\activate
python manage.py migrate --noinput
call deactivate

echo [3/5] Starting Backend Server in this window...
start /b "" cmd /c "cd /d ""%~dp0backend"" && call venv\Scripts\activate && python manage.py runserver 127.0.0.1:8000"

echo [4/5] Starting Frontend Server in this window...
timeout /t 3 /nobreak >nul
start /b "" cmd /c "cd /d ""%~dp0frontend"" && npm run dev"

echo [5/5] Launching Browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo ===================================================
echo VantEndpoint is running in this window!
echo Frontend: http://localhost:3000
echo Backend API: http://127.0.0.1:8000/api/
echo Swagger UI:  http://127.0.0.1:8000/api/docs/
echo.
echo Both servers are active in the background of this window.
echo Run Stop_VantEndpoint.bat or close this window to shutdown.
echo ====================================================aat
pause
