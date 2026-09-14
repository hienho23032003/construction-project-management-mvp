@echo off
chcp 65001 > nul
echo ============================================================
echo   FCBVN - Build & Publish Production (Nhan Hoa Hosting)
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish-prod.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Qua trinh build/publish that bai! Vui long kiem tra lai log tren.
    pause
    exit /b %ERRORLEVEL%
)

echo.
pause
