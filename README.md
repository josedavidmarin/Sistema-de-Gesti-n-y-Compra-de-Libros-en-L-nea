# Sistema de Gestión y Compra de Libros en Línea

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-336791.svg)](https://www.sqlite.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Jupyter](https://img.shields.io/badge/Demo-Jupyter%20Notebook-F37626.svg)](https://jupyter.org/)
[![UTP](https://img.shields.io/badge/UTP-IS873%20Laboratorio%20de%20Software-informational.svg)](https://www.utp.edu.co/)

> **Repositorio Oficial de Entrega:** Nota 2 — Sprint Review 1: Primer Incremento Funcional  
> **Asignatura:** IS873 – Laboratorio de Software (Semestre 2026-2)  
> **Universidad Tecnológica de Pereira (UTP)** — Facultad de Ingenierías  
> **Ponderación:** 20% de la calificación final  
> **Fechas de Sustentación:** 3 y 5 de noviembre de 2026  

---

## 👥 Integrantes del Equipo y Distribución del Sprint

* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`) — Autenticación JWT, Sesión y Perfil (HU-04, HU-05, HU-07) [7 SP]
* **Edwin Osorio Cartagena** — Autoservicio de Clientes y Validación de Contraseñas (HU-01, HU-06) [7 SP]
* **Maicol Londoño Hernández** — Control Administrativo Root y Regla de Negocio RF-031 (HU-02, HU-03) [7 SP]

---

## 🎯 Sprint 1 — Primer Incremento Funcional (21 Story Points)

El objetivo del Sprint 1 fue construir y desplegar el núcleo operativo de seguridad, autenticación y control de acceso basado en roles (**RBAC**), garantizando que las cuentas operativas no puedan realizar compras personales (**RF-031**) en un entorno cliente-servidor ejecutable de principio a fin.

### 📋 Historias de Usuario Comprometidas y Terminadas (100% Done)

| ID | Historia de Usuario | Prioridad (MoSCoW) | Estimación | Responsable | Estado | Criterio de Aceptación Cumplido |
| :---: | :--- | :---: | :---: | :--- | :---: | :--- |
| **HU-01** | Registro de nuevos clientes con DNI único y contraseña cifrada (RF-027) | **MUST HAVE** | **5 SP** | Edwin Osorio | **DONE** | DNI y correo únicos en BD, contraseña hasheada con `bcrypt`. |
| **HU-04** | Inicio de sesión con emisión de token Bearer JWT (RF-026, RF-028) | **MUST HAVE** | **3 SP** | Jose David Marín | **DONE** | JWT firmado criptográficamente, claims de rol y expiración de 24h. |
| **HU-05** | Cierre de sesión y desvinculación local de credenciales | **MUST HAVE** | **1 SP** | Jose David Marín | **DONE** | Invocación de endpoint de revocación y limpieza en cliente. |
| **HU-06** | Cambio seguro de contraseña con validación de clave anterior (RF-028) | **MUST HAVE** | **2 SP** | Edwin Osorio | **DONE** | Rechaza claves actuales erróneas e impide repetir la clave actual. |
| **HU-07** | Consulta y actualización de datos de perfil, teléfono y dirección (RF-021) | **MUST HAVE** | **3 SP** | Jose David Marín | **DONE** | Endpoint `/me` autenticado con saldo virtual (\$150.000 COP). |
| **HU-02** | Creación de Administradores por Superadmin Root con auditoría (RF-030) | **MUST HAVE** | **5 SP** | Maicol Londoño | **DONE** | Solo `ROOT` puede crear admins. Clientes bloqueados con HTTP 403. |
| **HU-03** | Restricción estricta de compra/reserva para personal operativo (RF-031) | **MUST HAVE** | **2 SP** | Maicol Londoño | **DONE** | Middleware RBAC bloquea con HTTP 403 a Admin y Root; permite a Cliente. |

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción A: Lanzador Automático en un Solo Clic (Recomendado para Windows)
En la raíz del repositorio, ejecute el script por lotes:
```cmd
start_project.bat
```
Este script:
1. Inicia el servidor backend FastAPI en `http://localhost:8000`
2. Inicia el servidor frontend Vite en `http://localhost:5173`
3. Abre automáticamente la aplicación en su navegador web por defecto.

---

### Opción B: Ejecución Manual Paso a Paso

#### 1. Iniciar el Backend (FastAPI + Uvicorn)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```
* **API Raíz:** [http://localhost:8000](http://localhost:8000)
* **Swagger UI Interactivo:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

#### 2. Iniciar el Frontend (React + TypeScript + Tailwind)
```powershell
cd frontend
npm run dev
```
* **Aplicación Web:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Pruebas y Demostración Reproducible

### 1. Notebook de Demostración Interactivo (Requisito Oficial de Sustentación)
El proyecto incluye un Jupyter Notebook autocontenido que ejecuta y valida las 7 historias comprometidas en orden:
```bash
# Abrir el notebook en Jupyter Lab o VS Code:
notebooks/demo_sprint1.ipynb
```
* Incluye celda inicial formal: **"Qué demuestra y qué NO demuestra todavía este incremento"**.
* Ejecución paso a paso de cada historia con aserciones automáticas.

### 2. Suite de Pruebas Automatizadas del API
```powershell
cd backend
python test_sprint1_api.py
```
Ejecuta 10 pruebas de integración de extremo a extremo cubriendo el 100% de los criterios de aceptación del Sprint 1.

---

## 🔑 Credenciales Semilla para Pruebas y Sustentación

Al inicializar el sistema se cargan automáticamente las siguientes cuentas con fines de prueba:

| Rol | Correo Electrónico | Contraseña | DNI | Privilegios y Políticas |
| :--- | :--- | :--- | :--- | :--- |
| **ROOT** | `root@libreria.com` | `RootSecure2026!` | `0000000000` | Superadministrador. Crea administradores y audita nómina. Compra restringida (RF-031). |
| **ADMINISTRADOR** | `admin.bodega@libreria.com` | `Admin2026!` | `9876543210` | Personal de almacén. Gestión operativa. Compra restringida (RF-031). |
| **CLIENTE** | `cliente.demo@gmail.com` | `Cliente2026!` | `1088123456` | Lector registrado. Cuenta con saldo (\$150.000 COP) y compras autorizadas. |

*(Nota: En la pantalla de Login del Frontend se disponen botones de autorelleno para alternar entre estos tres roles con un solo clic durante la sustentación en vivo).*

---

## 📂 Estructura del Repositorio

```text
Sistema-de-Gestion-y-Compra-de-Libros/
│
├── backend/                               # API RESTful con FastAPI y SQLAlchemy
│   ├── app/
│   │   ├── api/                           # Enrutadores y dependencias de seguridad (RBAC)
│   │   ├── core/                          # Configuración, JWT y hashing bcrypt
│   │   ├── db/                            # Inicialización y datos semilla
│   │   ├── models/                        # Modelos relacionales ORM (User, RoleEnum)
│   │   └── schemas/                       # Esquemas Pydantic tipados y documentados en inglés
│   ├── requirements.txt                   # Dependencias de Python
│   ├── run.py                             # Punto de entrada del servidor Uvicorn
│   └── test_sprint1_api.py                # Suite de pruebas automatizadas del Sprint 1
│
├── frontend/                              # SPA React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/                    # Barra de navegación responsiva (Navbar)
│   │   ├── context/                       # Contexto global de sesión y RBAC (AuthContext)
│   │   ├── pages/                         # Pantallas (Home, Login, Register, Profile, Admin)
│   │   └── services/                      # Cliente HTTP Axios modular
│   ├── package.json
│   └── vite.config.ts
│
├── notebooks/                             # Demostraciones interactivas reproducibles
│   └── demo_sprint1.ipynb                 # Notebook oficial de sustentación del Sprint 1
│
├── docs/                                  # Especificación formal, diagramas C4 y actas
│   └── IS873_Nota1_Definicion_del_Proyecto_Consolidado.pdf
│
├── poc/                                   # Validación del riesgo técnico crítico (Nota 1)
│   ├── poc_reserva_concurrencia.py        # Simulación multihilo y scheduler de 24h
│   └── README.md
│
├── start_project.bat                      # Lanzador automático integral
└── README.md                              # Documento de presentación principal
```

---

## 📑 Trazabilidad y Siguiente Incremento (Sprint 2 / Nota 3)

* **Tablero Kanban/Scrum:** Proyecto gestionado en GitHub Projects con trazabilidad de tarjetas a PRs y commits.
* **Historias transferidas al Sprint 2 (27 Story Points):** Módulo de Gestión de Inventario y Catálogo por copia física (`HU-10` Registro Libro, `HU-10b` Código Único Ejemplar, `HU-11` Baja, `HU-12` Edición, `HU-13` Control de Stock y `HU-14` Vista de Inventario).
