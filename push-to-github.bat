@echo off
title ZentroMart — Push to GitHub
echo ================================================================
echo                     ZentroMart GitHub Publisher
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Staging all files...
git add -A
echo [OK] Files staged.
echo.

echo [2/3] Creating commit...
git commit -m "Fix category filtering, product selection persistence, remove prices and configure serve.json"
echo.

echo [3/3] Pushing to GitHub (origin main)...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ================================================================
    echo [SUCCESS] Changes successfully pushed to GitHub!
    echo Remote: https://github.com/ZentroMart/ZentroMart.git
    echo Branch: main
    echo ================================================================
) else (
    echo ================================================================
    echo [ERROR] Push failed. Please check your internet connection.
    echo ================================================================
)

echo.
pause
