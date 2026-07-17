@echo off
setlocal
echo ===================================================
echo    VantEndpoint - Update Script
echo ===================================================

echo [1/2] Updating Python Dependencies...
cd /d "%~dp0backend"
if exist venv (
    call venv\Scripts\activate
    python -m pip install --upgrade -r requirements.txt
    call deactivate
) else (
    echo [WARNING] Virtual environment not found. Run Install_Dependencies.bat first.
)

echo [2/2] Updating Node.js Dependencies...
cd /d "%~dp0frontend"
npm update

echo ===================================================
echo Dependencies updated successfully.
echo ===================================================
pause
