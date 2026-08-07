@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  XLSForm AI Translator - Trusted Add-in Catalog Installer
echo ============================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-trusted-catalog-windows.ps1"
set "INSTALL_EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%INSTALL_EXIT_CODE%"=="0" (
  echo A instalacao nao foi concluida.
) else (
  echo Instalacao concluida.
)
echo.
pause
exit /b %INSTALL_EXIT_CODE%
