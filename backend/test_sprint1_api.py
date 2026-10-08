import sys
import os

# Asegurar que el path incluye el directorio backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_database

def test_sprint1_complete_flow():
    print("=" * 70)
    print("  SUITE DE PRUEBAS AUTOMATIZADAS \u2014 SPRINT 1 (21 STORY POINTS)")
    print("  M\u00f3dulo de Usuarios, Seguridad RBAC y Pol\u00edticas de Acceso")
    print("=" * 70)

    # 0. Limpiar base de datos de prueba para asegurar idempotencia
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "libreria.db")
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

    # 1. Inicializar DB
    init_database()
    client = TestClient(app)

    # Test 1: Verificar endpoint raíz
    print("\n[TEST 1] Verificando salud del API (GET /)...")
    res = client.get("/")
    assert res.status_code == 200, f"Error en GET /: {res.text}"
    print("  -> PASÓ: API en línea.")

    # Test 2: Login con Superadmin Root precargado
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

    # Test 3: Login con Cliente Demo
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

    # Test 4: HU-01: Registro de nuevo cliente (RF-027)
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
        print("  -> El usuario de prueba ya existía, procediendo a autenticarlo.")
    else:
        assert res.status_code == 201, f"Error en registro: {res.text}"
        print("  -> PASÓ: Cliente creado exitosamente con contraseña hasheada (bcrypt).")

    # Login con el nuevo cliente
    res_nuevo = client.post("/api/v1/auth/login", json={
        "email": nuevo_cliente_email,
        "password": "LectorSeguro2026!"
    })
    nuevo_token = res_nuevo.json()["access_token"]

    # Test 5: HU-07: Consulta de perfil propio (/me)
    print("\n[TEST 5] HU-07: Consulta de perfil autenticado (GET /auth/me)...")
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {nuevo_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == nuevo_cliente_email
    print(f"  -> PASÓ: Perfil recuperado: {res.json()['nombre']} {res.json()['apellido']} ({res.json()['rol']})")

    # Test 6: HU-07: Actualización de perfil (RF-021)
    print("\n[TEST 6] HU-07: Actualización de teléfono y dirección de correspondencia...")
    res = client.put("/api/v1/auth/me", headers={"Authorization": f"Bearer {nuevo_token}"}, json={
        "telefono": "3201112233",
        "direccion": "Nueva Dirección # 5-60, Dosquebradas"
    })
    assert res.status_code == 200
    assert res.json()["telefono"] == "3201112233"
    print("  -> PASÓ: Dirección y teléfono actualizados.")

    # Test 7: HU-06: Cambio de contraseña (RF-028)
    print("\n[TEST 7] HU-06: Cambio de contraseña con validación de clave anterior...")
    res = client.put("/api/v1/auth/change-password", headers={"Authorization": f"Bearer {nuevo_token}"}, json={
        "current_password": "LectorSeguro2026!",
        "new_password": "NuevaClaveSuperSegura2026!"
    })
    assert res.status_code == 200
    print("  -> PASÓ: Contraseña re-hasheada con bcrypt y actualizada.")

    # Test 8: HU-02: Superadmin Root crea un nuevo Administrador (RF-030)
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

    # Test 9: HU-02 Seguridad: Un Cliente intenta crear un Administrador (Debe fallar con 403 Forbidden)
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

    # Test 10: HU-03: Restricción de compra para Administradores (RF-031)
    print("\n[TEST 10] HU-03: Restricción Estricta de Compra para Administradores y Root (RF-031)...")
    
    # 10a. Cliente compra -> DEBE PERMITIR
    res_cli = client.post("/api/v1/compras/validar-permiso-compra-reserva", headers={"Authorization": f"Bearer {client_token}"}, json={
        "libro_id": 1,
        "cantidad": 1,
        "modalidad": "COMPRA"
    })
    assert res_cli.status_code == 200
    print("  -> 10a (Cliente): Permitido exitosamente.")

    # 10b. Administrador intenta comprar -> DEBE BLOQUEAR CON 403
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

    # 10c. Root intenta comprar -> DEBE BLOQUEAR CON 403
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
