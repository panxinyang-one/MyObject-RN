@echo off
REM Clean caches + start Metro. Uses Node already active in THIS cmd window.
REM Do NOT run "nvm use" here - on this PC it breaks C:\nvm4w\nodejs symlink.
cd /d "%~dp0.."

echo === Kill port 8081 ===
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo === Clean caches ===
call "%~dp0clean-metro.cmd"

echo === Start Metro ===
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Open cmd, run: nvm use 24.13.0
  exit /b 1
)

call npm run start:reset
