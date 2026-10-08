# Backend — Sistema de Gestión y Compra de Libros en Línea

Servicio backend RESTful desarrollado con **FastAPI**, **SQLAlchemy**, **Pydantic** y **JWT (JSON Web Tokens)** con cifrado unidireccional **bcrypt**.

Implementa el **Sprint 1 (21 Story Points)** con el núcleo de seguridad, autenticación y control de acceso basado en roles (RBAC).

---

## 📋 Historias de Usuario Implementadas (Sprint 1)

* **HU-01 (5 SP / RF-027):** Registro de nuevos clientes con DNI, correo único y hashing seguro `bcrypt`.
* **HU-04 (3 SP / RF-026, RF-028):** Inicio de sesión con emisión de token Bearer JWT (`exp` a 24 horas y claims tipados).
* **HU-05 (1 SP):** Cierre de sesión y desvinculación de credenciales.
* **HU-06 (2 SP / RF-028):** Cambio de contraseña con validación obligatoria de contraseña previa.
* **HU-07 (3 SP / RF-021, RF-028):** Consulta (`GET /me`) y actualización (`PUT /me`) de datos de perfil, teléfono y dirección de correspondencia.
* **HU-02 (5 SP / RF-030):** Creación de cuentas con rol `ADMINISTRADOR` por parte del Superadministrador `ROOT` con auditoría.
* **HU-03 (2 SP / RF-031):** Restricción de compras/reservas: Middleware RBAC que bloquea con `HTTP 403 Forbidden` a usuarios con rol `ADMINISTRADOR` o `ROOT`.

---

## 🚀 Cómo Iniciar el Servidor Local

### 1. Activar el Entorno Virtual

En PowerShell:
```powershell
cd "C:\backup D\Desktop\U\LAB\Sistema-de-Gestion-y-Compra-de-Libros\backend"
.\venv\Scripts\Activate.ps1
```

O en CMD:
```cmd
cd "C:\backup D\Desktop\U\LAB\Sistema-de-Gestion-y-Compra-de-Libros\backend"
venv\Scripts\activate.bat
```

### 2. Iniciar el Servidor de Desarrollo

```bash
python run.py
```

El servidor estará en línea en:
* **API Raíz:** [http://localhost:8000](http://localhost:8000)
* **Documentación Interactiva Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Documentación ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔑 Credenciales Semilla Precargadas para Pruebas

Al iniciar el servidor por primera vez, el sistema genera automáticamente tres cuentas base para pruebas:

| Rol | Correo Electrónico | Contraseña | DNI | Privilegios |
| :--- | :--- | :--- | :--- | :--- |
| **ROOT** | `root@libreria.com` | `RootSecure2026!` | `0000000000` | Superadministrador. Puede crear Administradores y auditar el sistema. |
| **ADMINISTRADOR** | `admin.bodega@libreria.com` | `Admin2026!` | `9876543210` | Personal operativo. Gestiona inventario y soporte. Restricción estricta de compras. |
| **CLIENTE** | `cliente.demo@gmail.com` | `Cliente2026!` | `1088123456` | Lector registrado. Cuenta con saldo monedero (\$150.000 COP) para compras/reservas. |

---

## 🧪 Cómo Ejecutar las Pruebas Automatizadas

El proyecto incluye una suite de pruebas de extremo a extremo que valida las 7 historias de usuario del Sprint 1:

```bash
python test_sprint1_api.py
```
