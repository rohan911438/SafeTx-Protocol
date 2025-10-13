@echo off
echo.
echo ========================================
echo   SafeTx Development Environment
echo ========================================
echo.
echo This will start BOTH:
echo   1. Backend API (port 5000)
echo   2. Frontend Dev Server (port 5173)
echo.
echo Press Ctrl+C in each window to stop.
echo.
pause

start "SafeTx Backend" cmd /k "cd safetx-backend && node server.js"
timeout /t 3 /nobreak >nul
start "SafeTx Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both servers starting in new windows!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close this window when done.
pause
