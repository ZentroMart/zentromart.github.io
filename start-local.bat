@echo off
title ZentroMart Local Server
echo ================================================================
echo                    ZentroMart E-Commerce Store
echo                     Starting Local Web Server
echo ================================================================
echo.

cd /d "%~dp0"

:: Check for Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected on your system.
    echo [*] Starting server at http://localhost:8000 ...
    echo [*] Opening your browser...
    start "" "http://localhost:8000"
    echo.
    echo Press Ctrl+C in this window anytime to stop the server.
    echo.
    python -m http.server 8000
    goto end
)

:: Check for py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python (py launcher) detected.
    echo [*] Starting server at http://localhost:8000 ...
    echo [*] Opening your browser...
    start "" "http://localhost:8000"
    echo.
    echo Press Ctrl+C in this window anytime to stop the server.
    echo.
    py -m http.server 8000
    goto end
)

:: Check for Node.js / npx
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js / npx detected.
    echo [*] Starting server at http://localhost:3000 ...
    echo [*] Opening your browser...
    start "" "http://localhost:3000"
    echo.
    echo Press Ctrl+C in this window anytime to stop the server.
    echo.
    npx -y serve . -l 3000
    goto end
)

:: Fallback if no server runtime is found
echo [!] Neither Python nor Node.js was detected in your PATH.
echo [*] Opening index.html directly in your default browser...
start "" "index.html"
echo.
echo For best performance with live JSON loading, we recommend:
echo   1. VS Code Live Server extension (Right-click index.html -> Open with Live Server)
echo   2. Or install Python / Node.js
echo.

:end
pause
