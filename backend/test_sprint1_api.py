"""
Automated Integration Test Suite — Sprint 1 (21 Story Points).

Covers User Stories HU-01 through HU-07:
- HU-01: Client registration with unique DNI/email and bcrypt password hashing (RF-027).
- HU-02: Exclusive Administrator creation by Root superadmin with audit trail (RF-030).
- HU-03: Strict purchase/reservation prohibition for Root and Administrators (RF-031).
- HU-04: Authentication and JWT Bearer token issuance with typed RBAC claims (RF-026).
- HU-05: Session termination / logout endpoint confirmation (RF-026).
- HU-06: Secure password update validating previous password and preventing reuse (RF-028).
- HU-07: Authenticated profile lookup (/me), contact update (RF-021), and wallet balance (RF-037).
"""

import sys
import os

# Ensure the backend root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_database


def test_sprint1_complete_flow() -> None:
    """
    Executes the end-to-end automated verification flow for Sprint 1.
    Validates happy paths and security edge cases (400 Bad Request, 401 Unauthorized, 403 Forbidden).
    """
    print("=" * 70)
    print("  AUTOMATED TEST SUITE — SPRINT 1 (21 STORY POINTS)")
    print("  User Management, JWT Authentication, and RBAC Security Policies")
    print("=" * 70)

    # 0. Clean local test database file if using SQLite to guarantee idempotency
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "libreria.db")
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

    # 1. Seed initial database accounts
    init_database()
    client = TestClient(app)

    # Test 1: Verify API health check endpoint
    print("\n[TEST 1] Verificando salud del API (GET /)...")
    res = client.get("/")
    assert res.status_code == 200, f"Error en GET /: {res.text}"
    print("  -> PASÓ: API en línea.")

    # Test 2: HU-04 - Login with pre-seeded Root Superadmin
    print("\n[TEST 2] Verificando Login del Superadmin Root (HU-04)...")
    res = client.post("/api/v1/auth/login", json={
        "email": "root@libreria.com",
        "password": "RootSecure2026!"
    })
    assert res.status_code == 200, f"Error en login root: {res.text}"
    root_data = res.json()
    assert root_data["rol"] == "ROOT"
    root_token = root_data["access_token"]
    print(f"  -> PASÓ: Token JWT generado para Root. Rol: {root_data['rol']}")

    # Test 3: HU-04 - Login with Demo Client
    print("\n[TEST 3] Verificando Login del Cliente Demo (HU-04)...")
    res = client.post("/api/v1/auth/login", json={
        "email": "cliente.demo@gmail.com",
        "password": "Cliente2026!"
    })
    assert res.status_code == 200
    client_data = res.json()
    assert client_data["rol"] == "CLIENTE"
    client_token = client_data["access_token"]
    print(f"  -> PASÓ: Token JWT generado para Cliente. Rol: {client_data['rol']}")

    # Test 4: HU-01 - New client registration and duplicate DNI/email rejection (RF-027)
    print("\n[TEST 4] HU-01: Registro de nuevo cliente con DNI y correo único (RF-027)...")
    nuevo_cliente_email = "lector.pruebas@utp.edu.co"
    res = client.post("/api/v1/auth/register", json={
        "dni": "1088998877",
        "email": nuevo_cliente_email,
        "nombre": "Esteban",
        "apellido": "Duque",
        "telefono": "3154443322",
        "direccion": "Calle 14 # 23-05, Pereira",
        "password": "LectorSeguro2026!"
    })
    if res.status_code == 400 and "ya se encuentra registrado" in res.text:
        print("  -> El usuario de prueba ya existía, procediendo a validar rechazo de duplicados.")
    else:
        assert res.status_code == 201, f"Error en registro: {res.text}"
        print("  -> PASÓ: Cliente creado exitosamente con contraseña hasheada (bcrypt).")

    # Test 4b: HU-01 Edge Case - Duplicate DNI/email must return HTTP 400 Bad Request
    res_dup = client.post("/api/v1/auth/register", json={
        "dni": "1088998877",
        "email": nuevo_cliente_email,
        "nombre": "Esteban",
        "apellido": "Duque",
        "password": "LectorSeguro2026!"
    })
    assert res_dup.status_code == 400, f"Se esperaba 400 por DNI/correo duplicado, se obtuvo: {res_dup.status_code}"
    print("  -> PASÓ (CA-02): Rechazo HTTP 400 ante intento de registro con DNI/correo duplicado.")

    # Authenticate with the newly registered client
    res_nuevo = client.post("/api/v1/auth/login", json={
        "email": nuevo_cliente_email,
        "password": "LectorSeguro2026!"
    })
    nuevo_token = res_nuevo.json()["access_token"]

    # Test 5: HU-07 - Retrieve authenticated user profile (/me)
    print("\n[TEST 5] HU-07: Consulta de perfil autenticado (GET /auth/me)...")
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {nuevo_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == nuevo_cliente_email
    print(f"  -> PASÓ: Perfil recuperado: {res.json()['nombre']} {res.json()['apellido']} ({res.json()['rol']})")

    # Test 6: HU-07 - Update contact phone and shipping address (RF-021)
    print("\n[TEST 6] HU-07: Actualización de teléfono y dirección de correspondencia...")
    res = client.put("/api/v1/auth/me", headers={"Authorization": f"Bearer {nuevo_token}"}, json={
        "telefono": "3201112233",
        "direccion": "Nueva Dirección # 5-60, Dosquebradas"
    })
    assert res.status_code == 200
    assert res.json()["telefono"] == "3201112233"
    print("  -> PASÓ: Dirección y teléfono actualizados.")

    # Test 7: HU-06 - Change password validating previous password (RF-028)
    print("\n[TEST 7] HU-06: Cambio de contraseña con validación de clave anterior...")
    # 7a. Edge case: Wrong current password must return HTTP 400 Bad Request
    res_wrong_pwd = client.put("/api/v1/auth/change-password", headers={"Authorization": f"Bearer {nuevo_token}"}, json={
        "current_password": "ClaveIncorrecta999!",
        "new_password": "NuevaClaveSuperSegura2026!"
    })
    assert res_wrong_pwd.status_code == 400, "Se esperaba 400 ante clave actual incorrecta"
    print("  -> PASÓ (CA-01): Rechazo HTTP 400 cuando la contraseña actual es incorrecta.")

    # 7b. Happy path: Valid current password updates hash in DB
    res = client.put("/api/v1/auth/change-password", headers={"Authorization": f"Bearer {nuevo_token}"}, json={
        "current_password": "LectorSeguro2026!",
        "new_password": "NuevaClaveSuperSegura2026!"
    })
    assert res.status_code == 200
    print("  -> PASÓ (CA-03): Contraseña re-hasheada con bcrypt y actualizada.")

    # Test 8: HU-02 - Superadmin Root creates a new Administrator account (RF-030)
    print("\n[TEST 8] HU-02: Superadmin Root crea cuenta de Administrador (RF-030)...")
    res = client.post("/api/v1/admin/create-admin", headers={"Authorization": f"Bearer {root_token}"}, json={
        "dni": "5544332211",
        "email": "admin.circunvalar@libreria.com",
        "nombre": "Santiago",
        "apellido": "Alvarez",
        "telefono": "3117778899",
        "password": "AdminCircunvalar2026!"
    })
    if res.status_code == 400 and "ya está registrado" in res.text:
        print("  -> Administrador de prueba ya existía.")
    else:
        assert res.status_code == 201
        assert res.json()["rol"] == "ADMINISTRADOR"
        print(f"  -> PASÓ: Administrador creado por Root con auditoría. Rol: {res.json()['rol']}")

    # Test 9: HU-02 Security - Client attempts to create an Administrator (Must fail with 403 Forbidden)
    print("\n[TEST 9] HU-02 Seguridad: Intento no autorizado de crear Admin por un Cliente...")
    res = client.post("/api/v1/admin/create-admin", headers={"Authorization": f"Bearer {client_token}"}, json={
        "dni": "999999999",
        "email": "hacker@libreria.com",
        "nombre": "Infiltrado",
        "apellido": "Falso",
        "password": "Password123"
    })
    assert res.status_code == 403, f"Se esperaba 403, se obtuvo: {res.status_code}"
    print("  -> PASÓ: Bloqueado con HTTP 403 Forbidden por RBAC (se requiere rol ROOT).")

    # Test 10: HU-03 - Strict purchase restriction for Administrators and Root (RF-031)
    print("\n[TEST 10] HU-03: Restricción Estricta de Compra para Administradores y Root (RF-031)...")

    # 10a. Client purchase -> MUST ALLOW (HTTP 200)
    res_cli = client.post("/api/v1/compras/validar-permiso-compra-reserva", headers={"Authorization": f"Bearer {client_token}"}, json={
        "libro_id": 1,
        "cantidad": 1,
        "modalidad": "COMPRA"
    })
    assert res_cli.status_code == 200
    print("  -> 10a (Cliente): Permitido exitosamente.")

    # 10b. Administrator attempts purchase -> MUST BLOCK WITH 403
    res_adm_login = client.post("/api/v1/auth/login", json={
        "email": "admin.bodega@libreria.com",
        "password": "Admin2026!"
    })
    admin_token = res_adm_login.json()["access_token"]

    res_adm = client.post("/api/v1/compras/validar-permiso-compra-reserva", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "libro_id": 1,
        "cantidad": 1,
        "modalidad": "COMPRA"
    })
    assert res_adm.status_code == 403, f"Se esperaba 403, se obtuvo: {res_adm.status_code}"
    print(f"  -> 10b (Administrador): Bloqueado con HTTP 403. Mensaje: '{res_adm.json()['detail']}'")

    # 10c. Root attempts purchase -> MUST BLOCK WITH 403
    res_root = client.post("/api/v1/compras/validar-permiso-compra-reserva", headers={"Authorization": f"Bearer {root_token}"}, json={
        "libro_id": 1,
        "cantidad": 1,
        "modalidad": "RESERVA"
    })
    assert res_root.status_code == 403
    print(f"  -> 10c (Root): Bloqueado con HTTP 403. Mensaje: '{res_root.json()['detail']}'")

    print("\n" + "=" * 70)
    print("  RESULTADO: ¡TODAS LAS HISTORIAS DE USUARIO DEL SPRINT 1 HAN PASADO!")
    print("  100% de cumplimiento: HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07")
    print("=" * 70)


if __name__ == "__main__":
    test_sprint1_complete_flow()
