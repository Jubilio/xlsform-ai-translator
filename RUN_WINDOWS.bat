@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Execute primeiro INSTALL_WINDOWS.bat.
  pause
  exit /b 1
)
call npm run dev
