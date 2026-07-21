@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js nao foi encontrado. Instale Node.js 20 ou superior.
  pause
  exit /b 1
)
call npm install || exit /b 1
if not exist .env copy .env.example .env
call npm run certs || exit /b 1
call npm run trust:cert:windows || exit /b 1
echo.
echo Instalacao concluida. Edite .env e execute RUN_WINDOWS.bat.
pause
