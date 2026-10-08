# Sistema de Gestión y Compra de Libros en Línea

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Google Maps](https://img.shields.io/badge/API-Google%20Maps%20Platform-4285F4.svg)](https://developers.google.com/maps)
[![UTP](https://img.shields.io/badge/UTP-IS873%20Laboratorio%20de%20Software-informational.svg)](https://www.utp.edu.co/)

> **Repositorio Oficial de Entrega:** Nota 1 — Definición del Proyecto y Prueba de Concepto (PoC)  
> **Asignatura:** IS873 – Laboratorio de Software (Semestre 2026-2)  
> **Universidad Tecnológica de Pereira (UTP)** — Facultad de Ingenierías  
> **Ponderación:** 30% de la calificación final  
> **Fechas de Sustentación (Demo Day):** 13 y 15 de octubre de 2026  

---

## 👥 Integrantes del Equipo

* **Jose David Marin Giraldo**
* **Edwin Osorio Cartagena**
* **Maicol Londono Hernandez**

---

## 📖 Resumen Ejecutivo del Proyecto

El **Sistema de Gestión y Compra de Libros en Línea** es una plataforma de comercio electrónico diseñada para resolver los cuellos de botella operativos que sufren las librerías omnicanal:
1. **Control Granular por Copia Física:** Diferenciación entre el registro bibliográfico (`LIBRO`) y cada copia física tangible (`EJEMPLAR`), evitando inventarios fantasma y pérdidas por desincronización de bodegas y sucursales.
2. **Expiración Automatizada de Reservas:** Eliminación del acaparamiento de stock mediante un worker en segundo plano que caduca automáticamente las reservas a las 24 horas y reincorpora los ejemplares al inventario comercial.
3. **Logística Multisede con Google Maps:** Selección de retiro en tienda física con geolocalización de sucursales en Pereira y Bogotá, validación de existencias locales y cálculo geoespacial.
4. **Módulo de Devoluciones con Código QR:** Tramitación ágil dentro del plazo legal de 8 días calendario, emitiendo salvoconductos digitales con QR firmado criptográficamente para su verificación presencial o recolección.
5. **Seguridad y Control de Acceso (RBAC):** Separación estricta de privilegios entre Root (superadministrador), Administrador (inventario y soporte con restricción de compras personales), Cliente y Visitante.

---

## 📂 Estructura del Repositorio

```text
├── docs/                                  # Documentación formal del proyecto
│   ├── IS873_Nota1_Definicion_del_Proyecto_Consolidado.pdf  # Documento maestro consolidado formal
│   ├── IS873_Nota1_Definicion_del_Proyecto_Consolidado.docx # Versión editable Word
│   ├── diagramas/                         # Diagramas C4 y Casos de Uso en alta definición
│   │   ├── diagrama_01_casos_de_uso.png   # Trazabilidad cromática por actor
│   │   ├── diagrama_02_c4_contexto.png    # C4 Nivel 1 (Contexto de Sistema - Alto Contraste)
│   │   └── diagrama_03_c4_contenedores.png# C4 Nivel 2 (Contenedores de Solución - Alto Contraste)
│   └── mockups/                           # Wireframes y pantallas del alcance Must Have
│       ├── mockup_01_registro_usuario.png
│       ├── mockup_02_registro_admin.png
│       ├── mockup_03_restriccion_admin.png
│       ├── mockup_04_login.png
│       ├── mockup_05_registro_libro.png
│       ├── mockup_06_eliminar_libro.png
│       ├── mockup_07_editar_libro.png
│       ├── mockup_08_inventario_stock.png
│       ├── mockup_09_busqueda_catalogo.png
│       ├── mockup_10_carrito_compras.png
│       ├── mockup_11_cancelar_compra.png
│       └── mockup_12_saldo_disponible.png
│
├── poc/                                   # Prueba de Concepto (Validación del Riesgo Más Crítico)
│   ├── README.md                          # Documentación completa de la PoC, hipótesis y resultados
│   └── poc_reserva_concurrencia.py        # Script ejecutable multihilo y scheduler de 24h
│
├── .gitignore                             # Filtro de artefactos temporales y base de datos local
└── README.md                              # Presentación principal del repositorio
```

---

## 🧪 Prueba de Concepto (PoC) — Validación del Riesgo Técnico Más Crítico

### Formulación de la Hipótesis de Riesgo
> *¿Es viable garantizar transacciones estrictamente atómicas (evitando sobreventas) cuando múltiples clientes intentan reservar o comprar concurrentemente el último ejemplar disponible de un libro, mientras un scheduler asíncrono libera automáticamente copias reservadas que hayan superado las 24 horas?*

### Cómo Ejecutar la PoC

La PoC ha sido diseñada como un artefacto mínimo autocontenido utilizando la biblioteca estándar de Python (`sqlite3`, `threading`, `time`, `datetime`), sin requerir instalación de paquetes pesados.

```bash
# 1. Clonar el repositorio
git clone https://github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea.git
cd Sistema-de-Gestion-y-Compra-de-Libros/poc

# 2. Ejecutar la prueba
python poc_reserva_concurrencia.py
```

### Resultados Experimentales Obtenidos
* **Concurrencia Extrema:** 10 hilos simultáneos compitiendo por 2 ejemplares físicos disponibles.
* **Aprobadas:** Exactamente 2 reservas exitosas asignadas a identificadores de ejemplar únicos (`EJE-001`, `EJE-002`).
* **Rechazadas con Notificación Limpia:** 8 reservas denegadas ordenadamente por stock agotado en **27 milisegundos**.
* **Integridad Garantizada:** 0 sobreventas, 0 inconsistencias de base de datos.
* **Worker en Segundo Plano (Scheduler 24h):** Detección automática de reservas simuladas vencidas, cambio de estado a `DISPONIBLE` y restauración del stock a 2 unidades sin intervención manual.

Para mayores detalles técnicos, consulte el documento dedicado en [`poc/README.md`](file:///C:/backup%20D/Desktop/U/LAB/Sistema-de-Gestion-y-Compra-de-Libros/poc/README.md).

---

## 📋 Priorización MoSCoW del Backlog (39 Requerimientos)

| Clasificación | Cantidad | % del Total | Justificación y Cobertura de Requerimientos |
|---|:---:|:---:|---|
| **MUST HAVE** | **17** | **43.6%** | **Innegociables para el MVP:** CRUD de inventario por copia física (`RF-001` a `005`), compras transaccionales atómicas (`RF-008`, `012`, `013`), política de reservas de 24h (`RF-009`, `010`, `011`), y seguridad RBAC (`RF-026`, `027`, `028`, `030`, `031`). Sin estos elementos no existe producto funcional. |
| **SHOULD HAVE** | **12** | **30.8%** | **Alto valor operativo:** Historial de compras (`RF-015`), devoluciones con QR y límite de 8 días (`RF-016` a `020`), recogida en tienda física (`RF-023`, `024`), búsqueda avanzada (`RF-035`) y tokenización (`RF-036`). |
| **COULD HAVE** | **7** | **17.9%** | **Deseables si el cronograma lo permite:** Mapa interactivo con Google Maps Platform (`RF-025`), bonos de cumpleaños (`RF-032`), catálogo para suscriptores (`RF-033`), chat con administrador (`RF-034`) y bot recomendador (`RF-038`). |
| **WON'T HAVE** | **3** | **7.7%** | **Explícitamente fuera de alcance del semestre:** Realidad Aumentada (`RF-039`), pasarela bancaria con dinero real (se usará pasarela simulada sandbox) y telemática vehicular en vivo. |

---

## 🛠️ Stack Tecnológico Justificado

* **Backend — Python con FastAPI:** Provee alto rendimiento asíncrono (ASGI), tipado estricto mediante Pydantic y documentación viva Swagger OpenAPI lista para pruebas de integración.
* **Base de Datos — PostgreSQL:** Motor relacional robusto con transacciones ACID completas y soporte nativo de bloqueo de registros a nivel de fila (`SELECT ... FOR UPDATE`), esencial para el control de inventarios concurrentes. Normalizado en 34 entidades.
* **Frontend — React con Vite, TypeScript y Tailwind CSS:** Arquitectura modular basada en componentes, reactividad fluida para el carrito de compras y diseño Mobile-First adaptable.
* **Worker en Segundo Plano — APScheduler:** Tareas programadas de expiración de reservas (cada 15 min) dentro del ecosistema liviano de Python, eliminando la sobrecarga operativa de Redis/Celery para el alcance del curso.
* **Geolocalización — Google Maps Platform API:** Integración de Mapas y Rutas aprovechando la clave de demostración académica (*Maps Demo Key*) para visualización de sucursales y cálculo de tienda más cercana.

---

## 📑 Documento Maestro Consolidado

La especificación completa de la entrega se encuentra consolidada en el archivo formal:
👉 **[`docs/IS873_Nota1_Definicion_del_Proyecto_Consolidado.pdf`](file:///C:/backup%20D/Desktop/U/LAB/Sistema-de-Gestion-y-Compra-de-Libros/docs/IS873_Nota1_Definicion_del_Proyecto_Consolidado.pdf)**

Contenido estructurado en 8 secciones:
1. Planteamiento del Proyecto (Problema, Usuarios, Alcance, Restricciones).
2. Levantamiento Completo de Requerimientos (39 RFs y 11 RNFs).
3. Casos de Uso Críticos a 3 Niveles de Cockburn y Diagrama General con diferenciación cromática.
4. Priorización MoSCoW y Defensa Individual de los 17 Must Have.
5. Diseño Preliminar de la Solución (C4 Nivel 1 y 2, Modelo Relacional de 34 Tablas, Mockups Visuales y Stack).
6. Product Backlog Inicial Priorizado (Sprints 1 y 2 con estimación en Story Points).
7. Prueba de Concepto Funcional (PoC) sobre el supuesto técnico más riesgoso.
8. Guía de Respuestas para el Comité Evaluador (Demo Day).
