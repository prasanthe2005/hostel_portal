@echo off
echo Checking for existing server on port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found server running on PID: %%a
    echo Stopping existing server...
    taskkill /PID %%a /F
    timeout /t 2 /nobreak >nul
)

echo Starting server...
cd /d "%~dp0"
start "Hostel Server" cmd /k "npm start"
echo Server started!
