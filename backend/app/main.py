from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_database
from app.api.v1.endpoints import auth, admin, libros, compras

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
API RESTful para el Sistema de Gestión y Compra de Libros en Línea.

### Sprint 1: Módulo de Usuarios, Seguridad y Control de Acceso (RBAC)
* **HU-01:** Registro de nuevos clientes con hashing bcrypt y correo único (RF-027).
* **HU-04:** Autenticación por Bearer Token JWT con roles tipados (RF-026 / RF-028).
* **HU-05:** Cierre de sesión y desvinculación de token.
* **HU-06:** Cambio seguro de contraseña con verificación de clave anterior (RF-028).
* **HU-07:** Consulta y actualización de perfil, teléfono y dirección de envío (RF-021 / RF-028).
* **HU-02:** Creación de Administradores por parte del Superadministrador Root (RF-030).
* **HU-03:** Restricción estricta de compra/reserva para Administrador y Root (RF-031).

### Sprint 2: Catálogo, Inventario Físico, Carrito, Billetera Virtual y Compras
* **HU-08:** Catálogo de libros con búsqueda, filtros por categoría, novedades y estado de stock (RF-001, RF-007, RF-008).
* **HU-09:** Carrito de compras persistente por usuario con control de cantidades (RF-009, RF-011, RF-012).
* **HU-10:** Checkout atómico con Billetera Virtual y verificación de stock concurrente (RF-013, RF-037).
* **HU-11:** Historial de compras con detalle de ejemplares y cancelación con reembolso (RF-014, RF-015).
* **HU-12:** Gestión de ejemplares físicos, altas y bajas de inventario (RF-002, RF-004, RF-005, RF-006).
* **HU-13:** Recarga y consulta de saldo de Billetera Virtual (RF-037).
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Inicializa la base de datos y los datos semilla al arrancar el servidor."""
    init_database()

# Inclusión de Rutas
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["1. Autenticación y Perfil (HU-01, 04, 05, 06, 07)"]
)

app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_STR}/admin",
    tags=["2. Administración y Control Root (HU-02 / RF-030)"]
)

app.include_router(
    libros.router,
    prefix=f"{settings.API_V1_STR}/libros",
    tags=["3. Catálogo e Inventario de Libros (HU-08, HU-12)"]
)

app.include_router(
    compras.router,
    prefix=f"{settings.API_V1_STR}/compras",
    tags=["4. Carrito, Checkout, Billetera y Compras (HU-03, 09, 10, 11, 13)"]
)

@app.get("/", tags=["Estado"])
def root():
    return {
        "sistema": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "estado": "En línea y operativo",
        "documentacion_swagger": "/docs",
        "documentacion_redoc": "/redoc"
    }
