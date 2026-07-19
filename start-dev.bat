@echo off
title Financial Companion — Dev Launcher

echo.
echo  =============================================
echo   Financial Companion — Starting Dev Servers
echo  =============================================
echo.

REM --- Start FastAPI backend in a new window ---
echo  [1/2] Starting FastAPI backend on http://localhost:8000 ...
start "FC API (FastAPI)" cmd /k "cd /d "c:\Dev_Projects\Financial Companion\apps\api" && .venv\Scripts\uvicorn.exe main:app --reload --port 8000"

REM Small delay so API window opens first
timeout /t 2 /nobreak >nul

REM --- Start Next.js frontend in a new window ---
echo  [2/2] Starting Next.js frontend on http://localhost:3000 ...
start "FC Web (Next.js)" cmd /k "cd /d "c:\Dev_Projects\Financial Companion" && pnpm dev:web"

echo.
echo  Both servers are starting in separate windows.
echo  Open http://localhost:3000 in your browser.
echo.
pause
