"""
Demostración de Prueba Fallando Intencionalmente y Luego Pasando.

Diseñado específicamente para responder la Pregunta 10 de la Sustentación (Bloque 1 - Nota 3):
"Muestre en vivo al menos una prueba fallando intencionalmente (para demostrar
que las pruebas realmente prueban algo) y luego pasando."

Regla de negocio evaluada:
RF-037 / HU-10: Rechazo estricto de compra cuando el cliente no posee saldo suficiente en su Billetera Virtual.

Instrucciones para la Sustentación:
1. Para mostrar la prueba FALLANDO en vivo:
   Ejecuta: python tests/test_intentional_failure_demo.py --fail
   (O define la variable de entorno: DEMO_FAIL=1)
   -> La prueba intentará asumir erróneamente que una compra sin saldo retorna 201 Created y fallará con AssertionError.

2. Para mostrar la prueba PASANDO en vivo:
   Ejecuta: python tests/test_intentional_failure_demo.py
   -> La prueba validará correctamente que el sistema rechaza la compra con HTTP 400 Bad Request y pasará exitosamente.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import init_database
from app.models.user import User
from app.db.session import SessionLocal

client = TestClient(app)

# Flag para alternar en vivo entre fallo intencional y prueba exitosa
# Puede ser activado por parámetro de consola '--fail' o variable de entorno 'DEMO_FAIL=1'
FAIL_MODE = ("--fail" in sys.argv) or (os.environ.get("DEMO_FAIL") == "1")


def test_rechazo_compra_saldo_insuficiente():
    """
    Verifica que el sistema impida el checkout si el saldo de la Billetera Virtual
    es menor al total del carrito.
    """
    init_database()

    # 1. Crear un usuario temporal con saldo EXACTO de $0.0 COP
    email_test = "cliente.sin.saldo@test.com"
    client.post("/api/v1/auth/register", json={
        "dni": "7711223344",
        "email": email_test,
        "password": "Password123!",
        "nombre": "Sin",
        "apellido": "Saldo",
        "telefono": "3001234567",
        "direccion": "Calle de Prueba 123"
    })

    # Asegurar en base de datos que su saldo sea 0
    db = SessionLocal()
    user = db.query(User).filter(User.email == email_test).first()
    if user:
        user.saldo_disponible = 0.0
        db.commit()
    db.close()

    # 2. Login para obtener el token
    token = client.post("/api/v1/auth/login", json={
        "email": email_test,
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Agregar libro al carrito (Libro ID 1 cuesta $65,000 COP)
    client.delete("/api/v1/compras/carrito", headers=headers)
    client.post("/api/v1/compras/carrito", headers=headers, json={"libro_id": 1, "cantidad": 1})

    # 4. Intentar realizar el checkout
    res = client.post(
        "/api/v1/compras/checkout",
        headers=headers,
        json={"direccion_envio": "Calle de Prueba 123"}
    )

    # -------------------------------------------------------------
    # DEMOSTRACIÓN EN VIVO (Pregunta 10 de Sustentación):
    # -------------------------------------------------------------
    if FAIL_MODE:
        print("\n" + "!" * 70)
        print("  [DEMO EN VIVO - MODO FALLO INTENCIONAL ACTIVADO]")
        print("  La prueba espera incorrectamente un código 201 Created para una compra sin saldo...")
        print("!" * 70)
        # Esto FALLARÁ intencionalmente porque el backend retorna 400 Bad Request
        assert res.status_code == 201, (
            f"\n[FALLO ESPERADO]: Se esperaba HTTP 201 pero el backend protegió el negocio con "
            f"HTTP {res.status_code}: {res.json().get('detail')}"
        )
    else:
        print("\n" + "=" * 70)
        print("  [DEMO EN VIVO - MODO PRUEBA REAL EXITOSA]")
        print("  Validando que el backend rechace la compra con HTTP 400 Bad Request...")
        print("=" * 70)
        assert res.status_code == 400, f"Error inesperado: {res.text}"
        detail = res.json()["detail"].lower()
        assert "saldo insuficiente" in detail, f"Mensaje incorrecto: {detail}"
        print("  -> PASÓ EXITOSAMENTE: El sistema bloqueó la compra sin saldo y protegió la transacción.")


if __name__ == "__main__":
    try:
        test_rechazo_compra_saldo_insuficiente()
        print("\nResultado: TEST PASSED\n")
    except AssertionError as e:
        print(f"\nResultado: TEST FAILED (Fallo Intencional Demostrado con Éxito)\n{e}\n")
