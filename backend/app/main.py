from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_database
from app.api.v1.endpoints import auth, admin, compras

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
    compras.router,
    prefix=f"{settings.API_V1_STR}/compras",
    tags=["3. Políticas y Restricciones RBAC (HU-03 / RF-031)"]
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
