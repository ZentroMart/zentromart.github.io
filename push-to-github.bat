@echo off
title ZentroMart — Push to GitHub
echo ================================================================
echo                     ZentroMart GitHub Publisher
echo ================================================================
echo.

cd /d "%~dp0"

:: Check for Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git for Windows from https://git-scm.com/
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Git repository status...
git status --short
echo.

echo [2/4] Staging all files...
git add -A
echo [OK] Files staged.
echo.

echo [3/4] Creating commit...
git commit -m "Fix category filtering, product selection persistence, remove prices and configure serve.json"
echo.

echo [4/4] Pushing to GitHub (origin main)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo [SUCCESS] Changes successfully pushed to GitHub!
    echo Remote: https://github.com/ZentroMart/ZentroMart.git
    echo Branch: main
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo [NOTICE] If you were prompted for GitHub credentials:
    echo   1. Personal Access Token (PAT): Use your GitHub token as password
    echo   2. Or run: git push -u origin main
    echo ================================================================
)

echo.
pause
