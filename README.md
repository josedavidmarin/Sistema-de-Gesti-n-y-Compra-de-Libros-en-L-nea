# Sistema de Gestión y Compra de Libros en Línea

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLite / PostgreSQL](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Pytest](https://img.shields.io/badge/Testing-Pytest%20Suite%20100%25-brightgreen.svg)](https://pytest.org/)
[![UTP](https://img.shields.io/badge/UTP-IS873%20Laboratorio%20de%20Software-informational.svg)](https://www.utp.edu.co/)

> **Repositorio Oficial de Entrega Integrada:** Nota 3 (Sprint Review 2 — 20%) y Nota 4 (Entrega Final — 30%) = **50% de la Calificación Final**  
> **Asignatura:** IS873 – Laboratorio de Software (Semestre 2026-2)  
> **Universidad Tecnológica de Pereira (UTP)** — Facultad de Ingenierías  
> **Fecha de Entrega:** 1 de diciembre de 2026, 6:00 p. m.  
> **Fechas de Sustentación:** 1 y 3 de diciembre de 2026

---

## 👥 Integrantes del Equipo y Roles

* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`) — *Backend Architect, Transacciones ACID & Concurrencia*
* **Edwin Osorio Cartagena** — *Frontend Lead, Catálogo & Billetera Virtual*
* **Maicol Londoño Hernández** — *QA, Suite de Pruebas Automatizadas & Control de Inventario*

---

## 🌐 Enlaces del Proyecto y Despliegue en Vivo

* **🎨 Aplicación Web (Frontend en Vercel):**  
  👉 **[https://sistema-de-gestion-three.vercel.app/](https://sistema-de-gestion-three.vercel.app/)**
* **⚙️ API Backend y Documentación Swagger (FastAPI en Render):**  
  👉 **[https://libreria-backend-yhdj.onrender.com/docs](https://libreria-backend-yhdj.onrender.com/docs)**
* **🐘 Base de Datos Cloud:**  
  👉 **PostgreSQL en Supabase** (con fallback local autónomo en SQLite).

---

## 🚀 Cómo Ejecutar el Proyecto en Entorno Local (Go-Live)

El sistema funciona de punta a punta en local con un solo comando:

```cmd
start_project.bat
```

Este script automatizado:
1. Verifica o inicializa el entorno virtual de Python en `backend/venv`.
2. Ejecuta las migraciones y puebla los datos semilla de prueba (`init_db.py`).
3. Inicia el servidor backend FastAPI en `http://localhost:8000`.
4. Inicia el servidor frontend Vite en `http://localhost:5173`.
5. Abre automáticamente el navegador web en la aplicación.

### Cuentas Semilla Preconfiguradas:
* **Cliente Demo:** `cliente.demo@gmail.com` / Clave: `Cliente2026!` (Saldo inicial: $150.000 COP).
* **Administrador Demo:** `admin.bodega@libreria.com` / Clave: `Admin2026!`.
* **Superadministrador Root:** `root@libreria.com` / Clave: `RootSecure2026!`.

---

## 🧪 Cómo Ejecutar la Suite de Pruebas Automatizadas (Nota 3)

Para correr la suite completa de pruebas unitarias y de integración:

```cmd
python run_tests.py
```
*(O directamente con pytest: `backend\venv\Scripts\pytest tests -v`)*.

### 🎯 Demostración de Prueba Fallando y Pasando (Pregunta 10 de Sustentación):
El evaluador puede verificar en vivo el comportamiento de una prueba fallando intencionalmente y luego pasando:

1. **Modo Fallo Intencional Demostrado:**
   ```cmd
   python tests/test_intentional_failure_demo.py --fail
   ```
   *(Falla controladamente con `AssertionError`: Se esperaba HTTP 201 pero el backend protegió el negocio con HTTP 400 por saldo insuficiente).*

2. **Modo Prueba Real Pasando Exitosamente:**
   ```cmd
   python tests/test_intentional_failure_demo.py
   ```
   *(Pasa al 100% validando la regla de negocio RF-037).*

---

## 📚 Cuadernos Interactivos de Demostración (Jupyter Notebooks)

* **Cuaderno Sprint 1 (Nota 2):** [`notebooks/demo_sprint1.ipynb`](notebooks/demo_sprint1.ipynb)
* **Cuaderno Sprint 2 & Entrega Final (Notas 3 y 4):** [`notebooks/demo_sprint2.ipynb`](notebooks/demo_sprint2.ipynb)

---

## 📁 Estructura de Entregables Oficiales (Notas 3 y 4)

| Entregable | Nota | Ubicación / Archivo |
| :--- | :---: | :--- |
| **Documento de Sprint Planning 2** | **Nota 3** | [`docs/sprint-planning-2.md`](docs/sprint-planning-2.md) |
| **Suite de pruebas ejecutada con reporte** | **Nota 3** | Carpeta [`/tests`](tests/) y [`run_tests.py`](run_tests.py) |
| **Cuaderno reproducible de demo y pruebas** | **Nota 3 y 4** | [`notebooks/demo_sprint2.ipynb`](notebooks/demo_sprint2.ipynb) |
| **Producto integrado y funcionando en local** | **Nota 4** | [`start_project.bat`](start_project.bat) |
| **Documentación técnica final completa** | **Nota 4** | [`docs/documentacion_final.md`](docs/documentacion_final.md) |
| **Retrospectiva escrita del equipo (1-2 págs)** | **Nota 4** | [`docs/retrospectiva_equipo.md`](docs/retrospectiva_equipo.md) |
| **Manual de usuario bilingüe (ES/EN) con capturas** | **Nota 4** | [`docs/manual_usuario_es_en.md`](docs/manual_usuario_es_en.md) |
| **Guía de Sustentación (Preguntas 10 a 21)** | **Nota 3 y 4** | [`docs/sustentacion_notas_3_y_4.md`](docs/sustentacion_notas_3_y_4.md) |

---

## 📋 Resumen del Backlog Consolidado

* **Sprint 1 (21 Story Points — Completado):**
  * HU-01: Registro de nuevos clientes con DNI único y contraseña bcrypt (RF-027).
  * HU-02: Creación de Administradores por Superadmin Root con auditoría (RF-030).
  * HU-03: Restricción estricta de compra/reserva para personal operativo (RF-031).
  * HU-04: Autenticación con Token Bearer JWT y roles tipados (RF-026).
  * HU-05: Cierre de sesión y desvinculación de credenciales.
  * HU-06: Cambio seguro de contraseña validando clave anterior (RF-028).
  * HU-07: Consulta y actualización de perfil, teléfono y dirección (RF-021).
* **Sprint 2 (31 Story Points — Completado):**
  * HU-08: Catálogo bibliográfico interactivo y buscador en tiempo real (RF-001, RF-007, RF-008).
  * HU-09: Carrito de compras persistente sin reserva anticipada (RF-009, RF-011, RF-012).
  * HU-10: Checkout atómico con Billetera Virtual y control de concurrencia Todo o Nada (RF-013, RF-037).
  * HU-11: Historial de pedidos y cancelación con reembolso a billetera y retorno de ejemplares (RF-014, RF-015).
  * HU-12: Gestión administrativa de catálogo, adición y baja de ejemplares físicos únicos (RF-002, RF-004, RF-005, RF-006).
  * HU-13: Recarga y consulta de saldo de Billetera Virtual (RF-037).
