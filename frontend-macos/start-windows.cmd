@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install it first and retry.
  pause
  exit /b 1
)
echo Starting Atlas BI frontend at http://127.0.0.1:5173
node server.mjs
