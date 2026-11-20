"""
Script to generate notebooks/demo_sprint2.ipynb for Nota 3 & Nota 4.
"""

import json
import os

notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# 📚 Demo Sprint 2 — Segundo Incremento Funcional & Entrega Final Integrada\n",
                "## Sistema de Gestión y Compra de Libros en Línea\n",
                "\n",
                "**Asignatura:** IS873 — Laboratorio de Software (Semestre 2026-2)  \n",
                "**Universidad Tecnológica de Pereira (UTP)** — Facultad de Ingenierías  \n",
                "**Evaluación:** Nota 3 (Sprint Review 2 — 20%) y Nota 4 (Entrega Final — 30%)  \n",
                "\n",
                "### 👥 Equipo de Desarrollo:\n",
                "* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`)\n",
                "* **Edwin Osorio Cartagena**\n",
                "* **Maicol Londoño Hernández**\n",
                "\n",
                "---\n",
                "### 🎯 Sprint Goal 2\n",
                "> *\"Construir e integrar el flujo de valor comercial del sistema sobre el incremento de seguridad de la Nota 2: catálogo con búsqueda y disponibilidad en tiempo real, carrito de compras persistente por usuario, checkout atómico con Billetera Virtual y control estricto de concurrencia ante stock agotado (Todo o Nada), trazabilidad por código físico único de ejemplar (LIB-XXX-EJYYY) y cancelación con reembolso inmediato, respaldado por una suite automatizada de pruebas y manual de usuario bilingüe.\"*\n",
                "\n",
                "---\n",
                "### 📋 Historias de Usuario Demostradas en este Cuaderno:\n",
                "1. **HU-08 (RF-001, RF-007, RF-008):** Catálogo público con búsqueda, filtros por categoría, novedades y stock en tiempo real.\n",
                "2. **HU-09 (RF-009, RF-011, RF-012):** Carrito de compras persistente (sin bloqueo anticipado de copias, hasta 3 unidades por título).\n",
                "3. **HU-10 (RF-013, RF-037):** Checkout atómico con Billetera Virtual, asignación FIFO de ejemplares y control de concurrencia (HTTP 409 ante stock agotado).\n",
                "4. **HU-11 (RF-014, RF-015):** Historial de órdenes de compra con detalle de ejemplares y cancelación con reembolso íntegro.\n",
                "5. **HU-12 (RF-002, RF-004, RF-005, RF-006):** Módulo administrativo de inventario físico (altas, adición de copias y bajas).\n",
                "6. **HU-13 (RF-037):** Recarga y consulta de saldo de Billetera Virtual.\n",
                "7. **Suite de Pruebas & Demostración de Fallo Intencional:** Respuesta a las preguntas 10 y 11 de sustentación."
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## ⚙️ 0. Configuración del Entorno de Demostración y Verificación del API"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import requests\n",
                "import json\n",
                "\n",
                "BASE_URL = \"http://localhost:8000/api/v1\"\n",
                "\n",
                "# Verificar estado general del servicio\n",
                "try:\n",
                "    res = requests.get(\"http://localhost:8000/\")\n",
                "    print(\"Estado del Backend:\", res.json())\n",
                "except Exception as e:\n",
                "    print(\"Backend local no detectado en puerto 8000. Probando endpoints simulados o servidor de pruebas:\", e)"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 📖 1. Demostración HU-08: Catálogo Público y Filtros en Tiempo Real (RF-008)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 1. Listar catálogo completo\n",
                "res = requests.get(f\"{BASE_URL}/libros\")\n",
                "libros = res.json()\n",
                "print(f\"Total de títulos en catálogo: {len(libros)}\\n\")\n",
                "for l in libros[:3]:\n",
                "    print(f\"ID: {l['id']} | Título: {l['titulo']} | Precio: ${l['precio']:,.0f} COP | Stock Disponible: {l['stock_disponible']}\")\n",
                "\n",
                "# 2. Búsqueda por término\n",
                "res_busqueda = requests.get(f\"{BASE_URL}/libros?q=Clean\")\n",
                "print(f\"\\nResultados de búsqueda para 'Clean': {len(res_busqueda.json())} títulos encontrados.\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 🔐 2. Autenticación y Saldo de Billetera Virtual (HU-04, HU-13)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Login como Cliente Demo\n",
                "login_res = requests.post(f\"{BASE_URL}/auth/login\", json={\n",
                "    \"email\": \"cliente.demo@gmail.com\",\n",
                "    \"password\": \"Cliente2026!\"\n",
                "})\n",
                "token_cliente = login_res.json()[\"access_token\"]\n",
                "headers_cliente = {\"Authorization\": f\"Bearer {token_cliente}\"}\n",
                "\n",
                "# Consultar saldo de billetera virtual\n",
                "saldo_res = requests.get(f\"{BASE_URL}/compras/billetera/saldo\", headers=headers_cliente)\n",
                "print(\"Billetera Virtual del Cliente:\", json.dumps(saldo_res.json(), indent=2))\n",
                "\n",
                "# Recargar saldo (HU-13)\n",
                "recarga_res = requests.post(f\"{BASE_URL}/compras/billetera/recargar\", headers=headers_cliente, json={\"monto\": 100000.0})\n",
                "print(\"Nuevo saldo tras recarga:\", recarga_res.json()[\"saldo_disponible\"], \"COP\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 🛒 3. Demostración HU-09: Carrito de Compras Persistente sin Bloqueo Anticipado"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 1. Vaciar carrito previo\n",
                "requests.delete(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente)\n",
                "\n",
                "# 2. Agregar libro ID 1 con 2 unidades\n",
                "add_res = requests.post(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente, json={\"libro_id\": 1, \"cantidad\": 2})\n",
                "print(\"Carrito actualizado:\", json.dumps(add_res.json(), indent=2))\n",
                "\n",
                "# 3. Verificar que los ejemplares físicos del libro ID 1 SIGUEN DISPONIBLES en el catálogo\n",
                "libro_res = requests.get(f\"{BASE_URL}/libros/1\")\n",
                "print(f\"Stock disponible en catálogo (NO bloqueado por el carrito): {libro_res.json()['stock_disponible']} ejemplares\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## ⚡ 4. Demostración Caso Borde de Concurrencia: Stock Agotado Bloquea Checkout (Pregunta 11)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Login como Administrador para simular agotamiento de stock\n",
                "admin_login = requests.post(f\"{BASE_URL}/auth/login\", json={\n",
                "    \"email\": \"admin.bodega@libreria.com\",\n",
                "    \"password\": \"Admin2026!\"\n",
                "})\n",
                "headers_admin = {\"Authorization\": f\"Bearer {admin_login.json()['access_token']}\"}\n",
                "\n",
                "# Creamos un libro temporal de 1 solo ejemplar\n",
                "import uuid\n",
                "isbn_demo = f\"978-{uuid.uuid4().hex[:8]}\"\n",
                "nuevo_libro = requests.post(f\"{BASE_URL}/libros\", headers=headers_admin, json={\n",
                "    \"isbn\": isbn_demo,\n",
                "    \"titulo\": \"Libro Demo Concurrencia Final\",\n",
                "    \"autor\": \"Autor Concurrente\",\n",
                "    \"editorial\": \"Editorial UTP\",\n",
                "    \"genero\": \"Ingeniería de Software\",\n",
                "    \"precio\": 50000.0,\n",
                "    \"cantidad_ejemplares\": 1,\n",
                "    \"sede\": \"Sede Principal\"\n",
                "}).json()\n",
                "\n",
                "# El cliente lo agrega a su carrito\n",
                "requests.delete(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente)\n",
                "requests.post(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente, json={\"libro_id\": nuevo_libro[\"id\"], \"cantidad\": 1})\n",
                "\n",
                "# Simulamos que el único ejemplar es consumido o dado de baja antes del checkout del cliente\n",
                "copy_id = nuevo_libro[\"ejemplares\"][0][\"id\"]\n",
                "requests.patch(f\"{BASE_URL}/libros/ejemplares/{copy_id}/dar-de-baja\", headers=headers_admin, json={\"motivo\": \"Agotado en sede física\"})\n",
                "\n",
                "# El cliente intenta pagar con su billetera: DEBE SER RECHAZADO con HTTP 409 Conflict\n",
                "checkout_colision = requests.post(f\"{BASE_URL}/compras/checkout\", headers=headers_cliente, json={\"direccion_envio\": \"Pereira\"})\n",
                "print(f\"Código de Respuesta HTTP: {checkout_colision.status_code} (Esperado: 409 Conflict)\")\n",
                "print(\"Mensaje de protección transaccional:\", checkout_colision.json()[\"detail\"])"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 💳 5. Demostración HU-10: Checkout Atómico Exitoso y Asignación FIFO de Ejemplares"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Armar carrito con 1 libro con stock disponible\n",
                "requests.delete(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente)\n",
                "requests.post(f\"{BASE_URL}/compras/carrito\", headers=headers_cliente, json={\"libro_id\": 2, \"cantidad\": 1})\n",
                "\n",
                "# Realizar checkout\n",
                "checkout_ok = requests.post(f\"{BASE_URL}/compras/checkout\", headers=headers_cliente, json={\n",
                "    \"direccion_envio\": \"Campus La Julita, Edificio de Sistemas UTP\"\n",
                "})\n",
                "orden = checkout_ok.json()\n",
                "print(f\"¡Orden #{orden['id']} Creada Exitosamente!\")\n",
                "print(f\"Total Pagado: ${orden['total']:,.0f} COP | Estado: {orden['estado']}\")\n",
                "print(\"Ejemplar Físico Asignado:\", orden[\"detalles\"][0][\"codigo_ejemplar\"])"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## ↩️ 6. Demostración HU-11: Cancelación de Orden, Reembolso y Liberación de Stock (RF-014)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Cancelar la orden creada en el paso anterior\n",
                "cancel_res = requests.post(f\"{BASE_URL}/compras/ordenes/{orden['id']}/cancelar\", headers=headers_cliente)\n",
                "orden_cancelada = cancel_res.json()\n",
                "print(f\"Orden #{orden_cancelada['id']} Estado Actual: {orden_cancelada['estado']}\")\n",
                "print(f\"Fecha Cancelación: {orden_cancelada['fecha_cancelacion']}\")\n",
                "\n",
                "# Verificar reintegro a la Billetera Virtual\n",
                "saldo_final = requests.get(f\"{BASE_URL}/compras/billetera/saldo\", headers=headers_cliente).json()\n",
                "print(f\"Saldo en Billetera tras reembolso automático: ${saldo_final['saldo_disponible']:,.0f} COP\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 🧪 7. Ejecución de la Suite Completa de Pruebas Automatizadas y Fallo Intencional (Pregunta 10)\n",
                "\n",
                "A continuación se ejecuta el comando automatizado de pruebas (`run_tests.py` / `pytest`) directamente desde el entorno."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import subprocess\n",
                "\n",
                "# 1. Demostración en vivo de la prueba fallando intencionalmente\n",
                "print(\"--> EJECUTANDO PRUEBA CON FALLO INTENCIONAL ACTIVADO (--fail):\\n\")\n",
                "res_fail = subprocess.run(\n",
                "    [\"python\", \"tests/test_intentional_failure_demo.py\", \"--fail\"],\n",
                "    capture_output=True,\n",
                "    text=True\n",
                ")\n",
                "print(res_fail.stdout)\n",
                "\n",
                "# 2. Demostración en vivo de la prueba pasando exitosamente\n",
                "print(\"\\n--> EJECUTANDO LA MISMA PRUEBA VALIDANDO LA CONDICIÓN DE NEGOCIO REAL (PASANDO):\\n\")\n",
                "res_pass = subprocess.run(\n",
                "    [\"python\", \"tests/test_intentional_failure_demo.py\"],\n",
                "    capture_output=True,\n",
                "    text=True\n",
                ")\n",
                "print(res_pass.stdout)"
            ]
        }
    ],
    "metadata": {
        "language_info": {
            "name": "python"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 2
}

output_path = r"C:\backup D\Desktop\U\LAB\Sistema-de-Gestion-y-Compra-de-Libros\notebooks\demo_sprint2.ipynb"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=2, ensure_ascii=False)

print(f"Jupyter Notebook generated successfully at: {output_path}")
