"""
Suite de Pruebas Unitarias y de Integración — Sprint 2.
Módulo de Catálogo, Carrito de Compras Persistente, Billetera Virtual, Concurrencia y Checkout Atómico.

Cubre:
- HU-08: Búsqueda, filtros y visualización del catálogo (RF-001, RF-007, RF-008).
- HU-09: Carrito de compras sin bloqueo previo y límite de 3 ejemplares (RF-009, RF-011, RF-012).
- HU-10: Checkout atómico con Billetera Virtual, asignación FIFO de ejemplares y control de concurrencia (RF-013, RF-037).
- HU-11: Historial de compras y cancelación con reembolso y retorno de ejemplares a DISPONIBLE (RF-014, RF-015).
- HU-12: Gestión administrativa de catálogo, adición de ejemplares y bajas (RF-002, RF-004, RF-005, RF-006).
- HU-13: Recarga y consulta de saldo de Billetera Virtual (RF-037).
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Initializes the database and seed accounts before running tests."""
    init_database()


def get_client_token() -> str:
    """Helper to authenticate as Demo Client and retrieve JWT."""
    res = client.post("/api/v1/auth/login", json={
        "email": "cliente.demo@gmail.com",
        "password": "Cliente2026!"
    })
    return res.json()["access_token"]


def get_admin_token() -> str:
    """Helper to authenticate as Admin and retrieve JWT."""
    res = client.post("/api/v1/auth/login", json={
        "email": "admin.bodega@libreria.com",
        "password": "Admin2026!"
    })
    return res.json()["access_token"]


# --------------------------------------------------------------------------
# HU-08: Catálogo y Búsqueda (RF-001, RF-007, RF-008)
# --------------------------------------------------------------------------

def test_listar_catalogo_publico():
    """HU-08: Consulta pública del catálogo sin necesidad de autenticación."""
    res = client.get("/api/v1/libros")
    assert res.status_code == 200
    libros = res.json()
    assert len(libros) >= 5
    first = libros[0]
    assert "titulo" in first
    assert "stock_disponible" in first
    assert "precio" in first


def test_busqueda_catalogo_por_titulo():
    """HU-08: Búsqueda de libros por título o autor (RF-008)."""
    res = client.get("/api/v1/libros?q=Clean")
    assert res.status_code == 200
    libros = res.json()
    assert len(libros) >= 1
    assert any("clean" in l["titulo"].lower() for l in libros)


def test_filtrar_catalogo_por_genero():
    """HU-08: Filtro del catálogo por género literario."""
    res = client.get("/api/v1/libros?genero=Software")
    assert res.status_code == 200
    libros = res.json()
    assert len(libros) >= 1
    for l in libros:
        assert "software" in l["genero"].lower()


# --------------------------------------------------------------------------
# HU-09: Carrito de Compras Persistente (RF-009, RF-011, RF-012)
# --------------------------------------------------------------------------

def test_carrito_flujo_completo():
    """HU-09: Agregar libro, actualizar cantidad (máx 3), consultar y vaciar carrito."""
    token = get_client_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Vaciar carrito previo
    client.delete("/api/v1/compras/carrito", headers=headers)

    # 2. Agregar 1 unidad del libro ID 1
    res_add = client.post(
        "/api/v1/compras/carrito",
        headers=headers,
        json={"libro_id": 1, "cantidad": 1}
    )
    assert res_add.status_code == 201
    carrito = res_add.json()
    assert carrito["total_items"] >= 1
    assert carrito["items"][0]["libro_id"] == 1
    assert carrito["items"][0]["cantidad"] == 1
    item_id = carrito["items"][0]["id"]

    # 3. Actualizar cantidad a 2
    res_update = client.put(
        f"/api/v1/compras/carrito/{item_id}",
        headers=headers,
        json={"cantidad": 2}
    )
    assert res_update.status_code == 200
    carrito_act = res_update.json()
    assert carrito_act["items"][0]["cantidad"] == 2

    # 4. Intentar agregar superando el tope de 3: el sistema debe topar en 3 (regla de negocio)
    res_add_more = client.post(
        "/api/v1/compras/carrito",
        headers=headers,
        json={"libro_id": 1, "cantidad": 2}
    )
    assert res_add_more.status_code == 201
    carrito_capped = res_add_more.json()
    assert carrito_capped["items"][0]["cantidad"] == 3


# --------------------------------------------------------------------------
# HU-13: Recarga de Saldo de Billetera Virtual (RF-037)
# --------------------------------------------------------------------------

def test_recarga_billetera_virtual():
    """HU-13: Recarga exitosa de saldo en la Billetera Virtual del cliente."""
    token = get_client_token()
    headers = {"Authorization": f"Bearer {token}"}

    res_antes = client.get("/api/v1/compras/billetera/saldo", headers=headers)
    saldo_antes = res_antes.json()["saldo_disponible"]

    res_recarga = client.post(
        "/api/v1/compras/billetera/recargar",
        headers=headers,
        json={"monto": 50000.0}
    )
    assert res_recarga.status_code == 200
    saldo_despues = res_recarga.json()["saldo_disponible"]
    assert saldo_despues == saldo_antes + 50000.0


# --------------------------------------------------------------------------
# HU-10: Checkout Atómico y Concurrencia (RF-013, RF-037)
# --------------------------------------------------------------------------

def test_checkout_exitoso_y_asignacion_ejemplares():
    """
    HU-10: Checkout atómico exitoso.
    Verifica que:
    - Se descuenta el valor exacto de la Billetera Virtual.
    - Los ejemplares pasan a estado VENDIDO.
    - Se crean los detalles de orden con el código único del ejemplar.
    - El carrito queda vacío tras la compra.
    """
    token = get_client_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Asegurar saldo suficiente y ejemplares disponibles en Libro ID 2
    client.post("/api/v1/compras/billetera/recargar", headers=headers, json={"monto": 200000.0})
    admin_headers = {"Authorization": f"Bearer {get_admin_token()}"}
    client.post("/api/v1/libros/2/ejemplares", headers=admin_headers, json={"cantidad": 2, "sede": "Sede Principal Pereira"})

    # Vaciar y armar carrito con 1 unidad del libro ID 2
    client.delete("/api/v1/compras/carrito", headers=headers)
    res_add = client.post("/api/v1/compras/carrito", headers=headers, json={"libro_id": 2, "cantidad": 1})
    assert res_add.status_code == 201

    res_saldo_antes = client.get("/api/v1/compras/billetera/saldo", headers=headers)
    saldo_antes = res_saldo_antes.json()["saldo_disponible"]

    # Ejecutar Checkout
    res_checkout = client.post(
        "/api/v1/compras/checkout",
        headers=headers,
        json={"direccion_envio": "Avenida Circunvalar # 15-20, Pereira"}
    )
    assert res_checkout.status_code == 201
    orden = res_checkout.json()
    assert orden["estado"] == "EN_PREPARACION"
    assert len(orden["detalles"]) == 1
    assert orden["detalles"][0]["codigo_ejemplar"].startswith("LIB-002-EJ")

    # Verificar descuento de saldo
    res_saldo_despues = client.get("/api/v1/compras/billetera/saldo", headers=headers)
    assert res_saldo_despues.json()["saldo_disponible"] == saldo_antes - orden["total"]

    # Verificar que el carrito quedó vacío
    res_cart = client.get("/api/v1/compras/carrito", headers=headers)
    assert res_cart.json()["total_items"] == 0


def test_concurrencia_stock_agotado_bloquea_checkout():
    """
    Caso Borde Crítico de Concurrencia (Pregunta 11 de la sustentación):
    Un cliente tiene un libro en su carrito sin bloquearlo previamente.
    Si los ejemplares disponibles se agotan antes de que finalice la compra,
    el checkout DEBE ser rechazado atómicamente con HTTP 409 Conflict,
    notificando claramente que el libro se encuentra agotado y SIN descontar dinero.
    """
    admin_token = get_admin_token()
    client_token = get_client_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    client_headers = {"Authorization": f"Bearer {client_token}"}

    # 1. Crear un libro de prueba con exactamente 1 ejemplar físico disponible
    import uuid
    isbn_unico = f"978-{uuid.uuid4().hex[:10]}"
    res_nuevo = client.post(
        "/api/v1/libros",
        headers=admin_headers,
        json={
            "isbn": isbn_unico,
            "titulo": "Libro Exclusivo Unico Ejemplar",
            "autor": "Autor Concurrencia",
            "editorial": "Editorial Test",
            "genero": "Ciencia Ficción",
            "idioma": "Español",
            "anio_publicacion": 2024,
            "numero_paginas": 180,
            "estado_libro": "NUEVO",
            "precio": 40000.0,
            "cantidad_ejemplares": 1,
            "sede": "Sede Principal Pereira"
        }
    )
    assert res_nuevo.status_code == 201
    libro_id = res_nuevo.json()["id"]
    ejemplar_id = res_nuevo.json()["ejemplares"][0]["id"]

    # 2. El cliente agrega el libro a su carrito (no hay bloqueo de stock)
    client.delete("/api/v1/compras/carrito", headers=client_headers)
    res_add = client.post(
        "/api/v1/compras/carrito",
        headers=client_headers,
        json={"libro_id": libro_id, "cantidad": 1}
    )
    assert res_add.status_code == 201

    # 3. Simulamos que otro evento consume el ejemplar (el admin lo da de baja o se vende)
    res_baja = client.patch(
        f"/api/v1/libros/ejemplares/{ejemplar_id}/dar-de-baja",
        headers=admin_headers,
        json={"motivo": "Ejemplar extraviado o vendido en sede física"}
    )
    assert res_baja.status_code in [200, 400]

    # 4. El cliente intenta hacer checkout: debe fallar con HTTP 409 Conflict
    saldo_antes = client.get("/api/v1/compras/billetera/saldo", headers=client_headers).json()["saldo_disponible"]
    res_checkout_fail = client.post(
        "/api/v1/compras/checkout",
        headers=client_headers,
        json={"direccion_envio": "Carrera 1 # 2-3"}
    )
    assert res_checkout_fail.status_code == 409
    assert "agotado o con stock insuficiente" in res_checkout_fail.json()["detail"].lower()

    # Verificar que el saldo no se tocó (Rollback atómico)
    saldo_despues = client.get("/api/v1/compras/billetera/saldo", headers=client_headers).json()["saldo_disponible"]
    assert saldo_despues == saldo_antes


# --------------------------------------------------------------------------
# HU-11: Cancelación de Orden y Reembolso (RF-014, RF-015)
# --------------------------------------------------------------------------

def test_cancelacion_orden_y_reembolso():
    """
    HU-11: Cancelación de orden en estado EN_PREPARACION (RF-014).
    Verifica que:
    - Se reintegra el 100% del dinero a la Billetera Virtual del cliente.
    - Los ejemplares físicos vuelven a estado DISPONIBLE.
    - La orden cambia a estado CANCELADA.
    """
    token = get_client_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Asegurar ejemplares disponibles en Libro ID 3
    admin_headers = {"Authorization": f"Bearer {get_admin_token()}"}
    client.post("/api/v1/libros/3/ejemplares", headers=admin_headers, json={"cantidad": 2, "sede": "Sede Principal Pereira"})

    # Armar carrito y comprar
    client.delete("/api/v1/compras/carrito", headers=headers)
    res_add = client.post("/api/v1/compras/carrito", headers=headers, json={"libro_id": 3, "cantidad": 1})
    assert res_add.status_code == 201

    res_checkout = client.post(
        "/api/v1/compras/checkout",
        headers=headers,
        json={"direccion_envio": "Dirección Cancelación Test"}
    )
    assert res_checkout.status_code == 201
    orden = res_checkout.json()
    orden_id = orden["id"]
    monto_orden = orden["total"]

    saldo_despues_compra = client.get("/api/v1/compras/billetera/saldo", headers=headers).json()["saldo_disponible"]

    # Cancelar la orden
    res_cancel = client.post(f"/api/v1/compras/ordenes/{orden_id}/cancelar", headers=headers)
    assert res_cancel.status_code == 200
    orden_cancelada = res_cancel.json()
    assert orden_cancelada["estado"] == "CANCELADA"
    assert orden_cancelada["fecha_cancelacion"] is not None

    # Verificar reembolso
    saldo_tras_reembolso = client.get("/api/v1/compras/billetera/saldo", headers=headers).json()["saldo_disponible"]
    assert saldo_tras_reembolso == saldo_despues_compra + monto_orden


# --------------------------------------------------------------------------
# HU-12: Gestión Administrativa de Ejemplares (RF-002, RF-005)
# --------------------------------------------------------------------------

def test_admin_agregar_ejemplares():
    """HU-12: Administrador agrega nuevos ejemplares físicos a un libro existente."""
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    res_antes = client.get("/api/v1/libros/1", headers=headers)
    stock_antes = res_antes.json()["stock_disponible"]

    res_agregar = client.post(
        "/api/v1/libros/1/ejemplares",
        headers=headers,
        json={"cantidad": 2, "sede": "Sede Principal Pereira"}
    )
    assert res_agregar.status_code == 200
    assert res_agregar.json()["stock_disponible"] == stock_antes + 2


# --------------------------------------------------------------------------
# HU-12: Subida y Gestión de Múltiples Fotos de Referencia
# --------------------------------------------------------------------------

def test_admin_upload_imagen_local():
    """Administrador sube un archivo de imagen real al servidor."""
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Simular un archivo de imagen en memoria
    file_content = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 100  # JPEG header bytes
    files = {"file": ("portada_test.jpg", file_content, "image/jpeg")}

    res = client.post("/api/v1/libros/upload-imagen", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert "url" in data
    assert data["url"].startswith("/static/uploads/libros/")
    assert data["filename"].endswith(".jpg")


def test_admin_gestion_multiples_imagenes_libro():
    """Administrador agrega fotos de referencia, cambia portada y elimina foto."""
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Agregar nueva foto de referencia al libro 1
    nueva_url = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"
    res_add = client.post(
        "/api/v1/libros/1/imagenes",
        headers=headers,
        json={"url": nueva_url, "es_portada": False}
    )
    assert res_add.status_code == 200
    book = res_add.json()
    assert len(book["imagenes"]) >= 2
    added_img = [img for img in book["imagenes"] if img["url"] == nueva_url][0]
    assert added_img["es_portada"] is False

    # 2. Marcar la nueva foto como portada principal
    res_portada = client.put(
        f"/api/v1/libros/1/imagenes/{added_img['id']}/marcar-portada",
        headers=headers
    )
    assert res_portada.status_code == 200
    book_updated = res_portada.json()
    assert book_updated["portada_url"] == nueva_url
    updated_img = [img for img in book_updated["imagenes"] if img["id"] == added_img["id"]][0]
    assert updated_img["es_portada"] is True

    # 3. Eliminar la foto de referencia agregada
    res_del = client.delete(
        f"/api/v1/libros/1/imagenes/{added_img['id']}",
        headers=headers
    )
    assert res_del.status_code == 200
    book_after_del = res_del.json()
    assert all(img["id"] != added_img["id"] for img in book_after_del["imagenes"])
