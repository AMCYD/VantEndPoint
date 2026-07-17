@echo off
setlocal
echo ===================================================
echo    VantEndpoint - Installation Script
echo ===================================================

echo [1/4] Checking prerequisites...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.13+.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js.
    pause
    exit /b 1
)

echo [2/4] Setting up Python Virtual Environment...
cd /d "%~dp0backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Upgrading pip...
python -m pip install --upgrade pip
echo Installing Python dependencies...
pip install -r requirements.txt
call deactivate

echo [3/4] Setting up Node.js Dependencies...
cd /d "%~dp0frontend"
echo Installing frontend packages...
npm install

echo [4/4] Setup Complete!
echo ===================================================
echo VantEndpoint dependencies have been installed successfully.
echo You can now use Start_VantEndpoint.bat to run the application.
echo ===================================================
pause
