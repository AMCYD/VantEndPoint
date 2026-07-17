@echo off
echo ===================================================
echo    VantEndpoint - Installing Frontend Dependencies
echo ===================================================

cd /d "%~dp0frontend"
echo Installing packages...
npm install

echo.
echo Done! You can now run Start_VantEndpoint.bat
pause
