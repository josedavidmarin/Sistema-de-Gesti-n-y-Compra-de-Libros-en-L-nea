@echo off
title Sistema de Gestion y Compra de Libros en Linea - Sprint 1
echo =========================================================================
echo   SISTEMA DE GESTION Y COMPRA DE LIBROS EN LINEA — SPRINT 1 LOCAL
echo   Universidad Tecnologica de Pereira - IS873 Laboratorio de Software
echo =========================================================================
echo.
echo [1/2] Iniciando Servidor Backend (FastAPI + Uvicorn en http://localhost:8000)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"

echo [2/2] Iniciando Servidor Frontend (React + Vite en http://localhost:5173)...
start "Frontend - React Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Abriendo interfaz web en su navegador...
start http://localhost:5173
echo.
echo =========================================================================
echo   Servicios en linea:
echo   - Frontend React:  http://localhost:5173
echo   - Backend Swagger: http://localhost:8000/docs
echo =========================================================================
pause
