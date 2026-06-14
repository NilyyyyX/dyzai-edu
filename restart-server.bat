@echo off
echo Stopping old server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Starting server...
cd /d "%~dp0packages\server"
call pnpm dev
