@echo off
cd /d "%~dp0.."
echo Cleaning Metro / Haste caches...

if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist "%LOCALAPPDATA%\Temp\metro-cache" rmdir /s /q "%LOCALAPPDATA%\Temp\metro-cache"

for /d %%i in ("%LOCALAPPDATA%\Temp\metro-*") do rmdir /s /q "%%i" 2>nul
for /d %%i in ("%LOCALAPPDATA%\Temp\haste-map-*") do rmdir /s /q "%%i" 2>nul
for /d %%i in ("%LOCALAPPDATA%\Temp\react-*") do rmdir /s /q "%%i" 2>nul

echo Done.
