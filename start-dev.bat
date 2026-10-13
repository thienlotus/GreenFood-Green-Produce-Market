@echo off
title GreenFood Launcher
echo ==================================================
echo   GreenFood - Khoi dong he thong
echo ==================================================

set PHP_BIN=E:\laragon\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe
if not exist "%PHP_BIN%" (
    set PHP_BIN=php
)

echo [1/2] Dang khoi dong Backend Laravel (port 8000)...
start "GreenFood Laravel API (Port 8000)" cmd /k "cd /d ""%~dp0greenfood-laravel"" && ""%PHP_BIN%"" artisan serve --host=127.0.0.1 --port=8000"

echo [2/2] Dang khoi dong Frontend Next.js (port 3000)...
start "GreenFood Next.js (Port 3000)" cmd /k "cd /d ""%~dp0greenfood"" && npm run dev"

echo ==================================================
echo   Da khoi chay ca 2 service thanh cong!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://127.0.0.1:8000/api
echo ==================================================
