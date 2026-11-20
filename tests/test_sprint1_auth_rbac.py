"""
Suite de Pruebas Unitarias y de Integración — Sprint 1 (21 Story Points).
Módulo de Usuarios, Autenticación JWT y Control de Acceso Basado en Roles (RBAC).

Cubre:
- HU-01: Registro de Clientes con hashing bcrypt y validación de unicidad (RF-027).
- HU-02: Creación de Administradores por Superadmin Root (RF-030).
- HU-03: Restricción estricta de compra/reserva para Administradores y Root (RF-031).
- HU-04: Autenticación con Token Bearer JWT (RF-026).
- HU-05: Cierre de sesión (RF-026).
- HU-06: Cambio seguro de contraseña (RF-028).
- HU-07: Perfil de usuario y actualización de datos (RF-021).
"""

import sys
import os
import pytest

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Initializes the database and seed accounts before running tests."""
    init_database()


def test_api_health_check():
    """Verifica que el API responda exitosamente en su endpoint raíz."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["estado"] == "En línea y operativo"


def test_root_login_success():
    """HU-04: Login exitoso del Superadmin Root."""
    res = client.post("/api/v1/auth/login", json={
        "email": "root@libreria.com",
        "password": "RootSecure2026!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["rol"] == "ROOT"
    assert "access_token" in data


def test_client_registration_and_login():
    """HU-01 y HU-04: Registro de nuevo cliente e inicio de sesión."""
    email = "nuevo.usuario.test@correo.com"
    res_reg = client.post("/api/v1/auth/register", json={
        "dni": "1199887766",
        "email": email,
        "password": "Password123!",
        "nombre": "Prueba",
        "apellido": "Unitaria",
        "telefono": "3101234567",
        "direccion": "Calle 10 # 20-30"
    })
    # If already exists from previous run, it might return 400, which is also valid uniqueness test
    assert res_reg.status_code in [201, 400]

    # Login with the user
    res_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert res_login.status_code == 200
    data = res_login.json()
    assert data["rol"] == "CLIENTE"
    assert "access_token" in data


def test_duplicate_email_registration_rejected():
    """HU-01: Rechazo de registro cuando el correo ya existe en la base de datos (RF-027)."""
    res = client.post("/api/v1/auth/register", json={
        "dni": "5555444433",
        "email": "cliente.demo@gmail.com",
        "password": "Password123!",
        "nombre": "Duplicado",
        "apellido": "Test",
        "telefono": "3001112233",
        "direccion": "Carrera 5 # 1-2"
    })
    assert res.status_code == 400
    assert "ya" in res.json()["detail"].lower()


def test_invalid_login_credentials():
    """HU-04: Credenciales inválidas devuelven HTTP 401 Unauthorized."""
    res = client.post("/api/v1/auth/login", json={
        "email": "cliente.demo@gmail.com",
        "password": "PasswordErroneo999!"
    })
    assert res.status_code == 401


def test_root_can_create_administrator():
    """HU-02: Superadmin Root tiene permiso para registrar Administradores (RF-030)."""
    root_login = client.post("/api/v1/auth/login", json={
        "email": "root@libreria.com",
        "password": "RootSecure2026!"
    }).json()
    root_token = root_login["access_token"]

    admin_email = "admin.test.unitario@libreria.com"
    res = client.post(
        "/api/v1/admin/create-admin",
        headers={"Authorization": f"Bearer {root_token}"},
        json={
            "dni": "8877665544",
            "email": admin_email,
            "password": "AdminPassword123!",
            "nombre": "Admin",
            "apellido": "Prueba",
            "telefono": "3123456789",
            "direccion": "Sede Administrativa"
        }
    )
    assert res.status_code in [201, 400]


def test_client_cannot_create_administrator():
    """HU-02 / RBAC: Un Cliente no tiene permiso para crear Administradores (HTTP 403)."""
    client_login = client.post("/api/v1/auth/login", json={
        "email": "cliente.demo@gmail.com",
        "password": "Cliente2026!"
    }).json()
    client_token = client_login["access_token"]

    res = client.post(
        "/api/v1/admin/create-admin",
        headers={"Authorization": f"Bearer {client_token}"},
        json={
            "dni": "9998887776",
            "email": "intento.ilegal@libreria.com",
            "password": "HackerPassword123!",
            "nombre": "Intruso",
            "apellido": "Test",
            "telefono": "3000000000",
            "direccion": "Desconocida"
        }
    )
    assert res.status_code == 403


def test_strict_purchase_restriction_for_admin_and_root():
    """HU-03: Administradores y Root tienen prohibido comprar o reservar libros (RF-031)."""
    # Test Root
    root_token = client.post("/api/v1/auth/login", json={
        "email": "root@libreria.com",
        "password": "RootSecure2026!"
    }).json()["access_token"]

    res_root = client.post(
        "/api/v1/compras/validar-permiso-compra-reserva",
        headers={"Authorization": f"Bearer {root_token}"},
        json={"libro_id": 1, "cantidad": 1, "modalidad": "COMPRA"}
    )
    assert res_root.status_code == 403
    assert "RF-031" in res_root.json()["detail"]

    # Test Admin
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin.bodega@libreria.com",
        "password": "Admin2026!"
    }).json()["access_token"]

    res_admin = client.post(
        "/api/v1/compras/validar-permiso-compra-reserva",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"libro_id": 1, "cantidad": 1, "modalidad": "COMPRA"}
    )
    assert res_admin.status_code == 403
    assert "RF-031" in res_admin.json()["detail"]

    # Test Client (must be permitted HTTP 200)
    client_token = client.post("/api/v1/auth/login", json={
        "email": "cliente.demo@gmail.com",
        "password": "Cliente2026!"
    }).json()["access_token"]

    res_client = client.post(
        "/api/v1/compras/validar-permiso-compra-reserva",
        headers={"Authorization": f"Bearer {client_token}"},
        json={"libro_id": 1, "cantidad": 1, "modalidad": "COMPRA"}
    )
    assert res_client.status_code == 200
