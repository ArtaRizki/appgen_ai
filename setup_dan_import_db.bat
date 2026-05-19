@echo off
title Adigicube Tools - Database Setup & Import
color 0B

echo =======================================================
echo     AUTOMATED DATABASE IMPORT - ADIGICUBE TOOLS
echo =======================================================
echo.

:: 1. Ask for PostgreSQL Details
set /p PG_USER="Masukkan Username PostgreSQL (Default: postgres): "
if "%PG_USER%"=="" set PG_USER=postgres

set /p PG_PASS="Masukkan Password PostgreSQL (Default: postgres): "
if "%PG_PASS%"=="" set PG_PASS=postgres

set /p PG_HOST="Masukkan Host (Default: localhost): "
if "%PG_HOST%"=="" set PG_HOST=localhost

set PGPASSWORD=%PG_PASS%

:: 2. Check if psql is available in PATH, if not, try to find it in default installation directories
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Command 'psql' tidak ditemukan di system PATH. Mencoba mencari di folder instalasi default...
    
    :: Search in C:\Program Files\PostgreSQL\
    for /d %%i in ("C:\Program Files\PostgreSQL\*") do (
        if exist "%%i\bin\psql.exe" (
            set "PATH=%%i\bin;%PATH%"
            goto found_psql
        )
    )
    
    echo [ERROR] PostgreSQL 'psql' tidak ditemukan di komputer Anda.
    echo Harap instal PostgreSQL terlebih dahulu atau jalankan manual lewat pgAdmin.
    pause
    exit /b
)

:found_psql
echo.
echo [1/2] Membuat database kosong 'tools_adigicube' jika belum ada...
psql -U %PG_USER% -h %PG_HOST% -c "CREATE DATABASE tools_adigicube;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database berhasil dibuat / sudah ada.
) else (
    echo [WARNING] Ada sedikit masalah saat membuat database (Mungkin sudah ada, melanjutkan...).
)

echo.
echo [2/2] Mengimpor struktur dan data dari 'tools_adigicube_dump.sql'...
psql -U %PG_USER% -h %PG_HOST% -d tools_adigicube -f "%~dp0tools_adigicube_dump.sql"

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   [SUCCESS] DATABASE SETUP BERHASIL LENGKAP!
    echo =======================================================
    echo Akun Login Default:
    echo   - Email: admin@adigicube.com
    echo   - Password: admin123!
    echo =======================================================
) else (
    echo.
    echo [ERROR] Gagal mengimpor database. Periksa username/password Anda.
)

echo.
pause
