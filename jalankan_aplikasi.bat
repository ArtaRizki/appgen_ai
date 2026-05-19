@echo off
title Adigicube Tools Launcher
color 0A

echo =======================================================
echo         LAUNCHER PORTAL TOOLS - ADIGICUBE
echo =======================================================
echo.

:: 1. Check Backend dependencies
if not exist "%~dp0backend\node_modules\" (
    echo [INFO] Folder 'node_modules' tidak ditemukan di backend.
    echo Menginstal dependensi backend (Mohon tunggu)...
    cd /d "%~dp0backend"
    call npm install
) else (
    echo [OK] Dependensi Backend sudah lengkap.
)

:: 2. Check Frontend dependencies
if not exist "%~dp0frontend\node_modules\" (
    echo [INFO] Folder 'node_modules' tidak ditemukan di frontend.
    echo Menginstal dependensi frontend (Mohon tunggu)...
    cd /d "%~dp0frontend"
    call npm install
) else (
    echo [OK] Dependensi Frontend sudah lengkap.
)

echo.
echo =======================================================
echo     MEMULAI BACKEND & FRONTEND SERVERS...
echo =======================================================
echo.

:: Start Backend in new CMD window
echo [->] Memulai Backend Server di Port 5000...
start "Adigicube Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Wait 3 seconds to let backend initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in new CMD window
echo [->] Memulai Frontend Server di Port 3000...
start "Adigicube Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
echo [->] Membuka Portal Tools di Browser...
start "" "http://localhost:3000"

echo.
echo =======================================================
echo   [OK] Aplikasi berhasil dijalankan!
echo   Silakan gunakan browser Anda di http://localhost:3000
echo   Jangan tutup window Command Prompt yang baru terbuka.
echo =======================================================
echo.
pause
