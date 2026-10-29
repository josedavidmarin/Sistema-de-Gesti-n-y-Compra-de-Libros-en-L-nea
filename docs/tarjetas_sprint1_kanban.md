# 📋 Tarjetas del Tablero Scrum / Kanban — Sprint 1 (21 Story Points)
**Sistema de Gestión y Compra de Libros en Línea**  
**Asignatura:** IS873 — Laboratorio de Software (UTP 2026-2)  
**Corte Oficial de Entrega:** Nota 2 — Sprint Review 1 (Primer Incremento Funcional)  
**Estado General:** 100% DONE  

---

## 📌 Configuración de Columnas del Tablero

1. **`Product Backlog`** (Historias futuras para Sprints 2, 3 y 4)
2. **`Sprint Backlog (To Do)`** (Historias seleccionadas al inicio del Sprint 1)
3. **`In Progress`** (En desarrollo durante la iteración)
4. **`Done`** (Completadas, probadas con assertions y demostrables en vivo)

---

## 🃏 Tarjeta 1: HU-01 — Registro de nuevos clientes (RF-027)

* **ID:** `HU-01`
* **Título:** `[HU-01] Registro de nuevos clientes con DNI único y contraseña cifrada`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `5 Story Points`
* **Responsable:** Edwin Osorio Cartagena
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-027`, `RF-029`

### Descripción
> **Como** visitante de la tienda en línea,  
> **quiero** registrarme proporcionando mis datos personales (DNI, nombre, apellido, correo, teléfono, dirección y contraseña),  
> **para** obtener una cuenta con rol `CLIENTE` y acceder a las funciones del sistema.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Registro Exitoso):** Dado que un visitante ingresa un DNI y correo no registrados previamente y una contraseña válida (mínimo 6 caracteres), cuando envía el formulario, entonces el sistema responde con HTTP 201 Created, asigna el rol `CLIENTE`, saltea y cifra la contraseña con `bcrypt`, e inicia sesión automáticamente.
* **CA-02 (Validación de Unicidad):** Dado que un visitante intenta registrarse con un DNI o correo ya existentes en la base de datos, cuando envía la solicitud, entonces el sistema rechaza la petición con HTTP 400 Bad Request y un mensaje descriptivo indicando el conflicto.
* **CA-03 (Campos Obligatorios):** Dado que falta alguno de los campos requeridos, el sistema valida la entrada y previene el envío tanto en frontend (React) como en backend (Pydantic).

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/auth.py` (`POST /api/v1/auth/register`)
* **Frontend:** `frontend/src/pages/RegisterPage.tsx`
* **Pruebas:** `backend/test_sprint1_api.py` (Test 4), `notebooks/demo_sprint1.ipynb` (Sección HU-01)

---

## 🃏 Tarjeta 2: HU-04 — Inicio de sesión con Bearer Token JWT (RF-026 / RF-028)

* **ID:** `HU-04`
* **Título:** `[HU-04] Inicio de sesión y emisión de Bearer Token JWT con roles tipados`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `3 Story Points`
* **Responsable:** Jose David Marín Giraldo
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-026`, `RF-028`

### Descripción
> **Como** usuario registrado (Cliente, Administrador o Root),  
> **quiero** autenticarme mediante mi correo electrónico y contraseña,  
> **para** obtener un token Bearer JWT que valide mi identidad y permisos en cada petición.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Autenticación Válida):** Dado que el usuario ingresa su correo y contraseña correctos, cuando se envía el formulario a `POST /auth/login`, entonces el sistema valida el hash `bcrypt` y retorna HTTP 200 OK con un token JWT firmado criptográficamente (HS256) con vigencia de 24 horas y los claims: `sub` (correo), `rol`, `user_id` y `nombre`.
* **CA-02 (Rechazo por Credenciales Inválidas):** Dado que las credenciales son incorrectas o la cuenta está inactiva, el backend responde con HTTP 401 Unauthorized o HTTP 403 Forbidden.
* **CA-03 (Redirección por Rol):** En el frontend, al autenticarse como `ROOT` se redirige a la vista administrativa `/admin`; para `CLIENTE` o `ADMINISTRADOR` se redirige a `/profile`.
* **CA-04 (Autorelleno para Sustentación):** La pantalla de login incluye botones de acceso rápido para Root, Administrador y Cliente para facilitar la demo ante el docente.

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/auth.py` (`POST /api/v1/auth/login`), `backend/app/core/security.py`
* **Frontend:** `frontend/src/pages/LoginPage.tsx`, `frontend/src/context/AuthContext.tsx`
* **Pruebas:** `backend/test_sprint1_api.py` (Tests 2 y 3), `notebooks/demo_sprint1.ipynb` (Sección HU-04)

---

## 🃏 Tarjeta 3: HU-05 — Cierre de sesión (Logout) y revocación

* **ID:** `HU-05`
* **Título:** `[HU-05] Cierre de sesión e invalidación de credenciales en cliente y servidor`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `1 Story Point`
* **Responsable:** Jose David Marín Giraldo
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-026`

### Descripción
> **Como** usuario autenticado,  
> **quiero** cerrar mi sesión de forma explícita desde la barra de navegación,  
> **para** proteger mi cuenta e impedir accesos no autorizados en terminales compartidas.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Limpieza de Estado):** Dado que el usuario hace clic en el botón "Cerrar Sesión", cuando se invoca la acción, entonces el sistema elimina el token JWT de `localStorage`, resetea el rol activo a `VISITANTE` y redirige a la vista de inicio.
* **CA-02 (Notificación de Revocación):** El cliente invoca `POST /auth/logout` confirmando la desvinculación con HTTP 200 OK.
* **CA-03 (Protección de Rutas):** Una vez cerrada la sesión, el usuario no puede acceder a las rutas protegidas (`/profile`, `/admin`).

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/auth.py` (`POST /api/v1/auth/logout`)
* **Frontend:** `frontend/src/components/Navbar.tsx`, `frontend/src/context/AuthContext.tsx`
* **Pruebas:** `notebooks/demo_sprint1.ipynb` (Sección HU-05)

---

## 🃏 Tarjeta 4: HU-06 — Cambio seguro de contraseña (RF-028)

* **ID:** `HU-06`
* **Título:** `[HU-06] Cambio seguro de contraseña con validación de clave previa`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `2 Story Points`
* **Responsable:** Edwin Osorio Cartagena
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-028`

### Descripción
> **Como** usuario autenticado,  
> **quiero** actualizar mi contraseña ingresando obligatoriamente mi clave actual y la nueva clave,  
> **para** mantener la seguridad de mi cuenta.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Verificación Previa):** Dado que un usuario intenta cambiar su contraseña, cuando la clave actual enviada no coincide con el hash almacenado, entonces el sistema responde con HTTP 400 Bad Request y no altera las credenciales.
* **CA-02 (Nueva Clave Distinta):** Dado que la nueva contraseña es idéntica a la actual, el sistema la rechaza exigiendo una diferente.
* **CA-03 (Actualización Exitosa):** Dado que la clave anterior es válida y la nueva cumple con los requisitos, el sistema genera un nuevo hash `bcrypt` con sal única, actualiza la base de datos y responde con HTTP 200 OK.

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/auth.py` (`PUT /api/v1/auth/change-password`)
* **Frontend:** `frontend/src/pages/ProfilePage.tsx`
* **Pruebas:** `backend/test_sprint1_api.py` (Test 7), `notebooks/demo_sprint1.ipynb` (Sección HU-06)

---

## 🃏 Tarjeta 5: HU-07 — Consulta y actualización de perfil (RF-021 / RF-028)

* **ID:** `HU-07`
* **Título:** `[HU-07] Consulta y actualización de datos de contacto, dirección y monedero virtual`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `3 Story Points`
* **Responsable:** Jose David Marín Giraldo
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-021`, `RF-028`, `RF-037`

### Descripción
> **Como** cliente registrado,  
> **quiero** visualizar mis datos de perfil, saldo de monedero virtual y modificar mi teléfono y dirección,  
> **para** tener actualizada mi información de correspondencia y envíos.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Consulta Segura):** Dado que un usuario autenticado consulta `GET /auth/me` con su Bearer token, el backend retorna su información completa (DNI, nombres, correo, teléfono, dirección, rol y saldo disponible en COP).
* **CA-02 (Actualización de Contacto):** Dado que el usuario actualiza su teléfono o dirección mediante `PUT /auth/me`, el backend persiste los cambios y retorna los datos actualizados.
* **CA-03 (Inmutabilidad de Campos Críticos):** El usuario no puede modificar su `dni`, `email` ni su `rol` a través de este endpoint.

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/auth.py` (`GET` y `PUT /api/v1/auth/me`)
* **Frontend:** `frontend/src/pages/ProfilePage.tsx`
* **Pruebas:** `backend/test_sprint1_api.py` (Tests 5 y 6), `notebooks/demo_sprint1.ipynb` (Sección HU-07)

---

## 🃏 Tarjeta 6: HU-02 — Creación de Administradores por Root (RF-030)

* **ID:** `HU-02`
* **Título:** `[HU-02] Creación exclusiva de Administradores por Superadmin Root con auditoría`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `5 Story Points`
* **Responsable:** Maicol Londoño Hernández
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-030`

### Descripción
> **Como** Superadministrador Root,  
> **quiero** dar de alta nuevas cuentas con rol `ADMINISTRADOR` y consultar el padrón de usuarios,  
> **para** habilitar al personal operativo de almacén y soporte manteniendo la trazabilidad.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Creación por Root):** Dado que un usuario autenticado con rol `ROOT` envía los datos de un empleado a `POST /admin/create-admin`, el backend crea la cuenta con rol `ADMINISTRADOR`, contraseña cifrada y responde con HTTP 201 Created.
* **CA-02 (Bloqueo a Clientes):** Dado que un usuario con rol `CLIENTE` o `ADMINISTRADOR` intenta crear una cuenta administrativa, el interceptor RBAC rechaza la solicitud con HTTP 403 Forbidden.
* **CA-03 (Padrón y Auditoría):** El panel de administración permite listar todos los usuarios del sistema (`GET /admin/users`) y activar/suspender cuentas (`PUT /admin/users/{id}/toggle-status`).

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/admin.py`, `backend/app/api/deps.py` (`require_roles(["ROOT"])`)
* **Frontend:** `frontend/src/pages/AdminPage.tsx`
* **Pruebas:** `backend/test_sprint1_api.py` (Tests 8 y 9), `notebooks/demo_sprint1.ipynb` (Sección HU-02)

---

## 🃏 Tarjeta 7: HU-03 — Restricción de Compra para Administradores y Root (RF-031)

* **ID:** `HU-03`
* **Título:** `[HU-03] Cumplimiento estricto de la regla RF-031: Prohibición de compras a personal operativo`
* **Prioridad (MoSCoW):** `Must Have`
* **Estimación:** `2 Story Points`
* **Responsable:** Maicol Londoño Hernández
* **Estado Actual:** `DONE`
* **Requisitos Funcionales Asociados:** `RF-031`

### Descripción
> **Como** comité del sistema y Product Owner,  
> **quiero** que la plataforma bloquee categóricamente cualquier intento de compra o reserva realizado por personal operativo (`ADMINISTRADOR` o `ROOT`),  
> **para** evitar conflictos de interés, autopagos indebidos y manipulación de inventario.

### Criterios de Aceptación (Gherkin)
* **CA-01 (Bloqueo a Administrador):** Dado que un usuario con rol `ADMINISTRADOR` intenta realizar o validar una compra/reserva en `POST /compras/validar-permiso-compra-reserva`, el backend rechaza la transacción con HTTP 403 Forbidden y el mensaje formal de la política RF-031.
* **CA-02 (Bloqueo a Root):** Dado que un usuario con rol `ROOT` intenta comprar o reservar, el middleware responde con HTTP 403 Forbidden.
* **CA-03 (Autorización a Cliente):** Dado que un usuario con rol `CLIENTE` ejecuta la misma operación, el sistema responde con HTTP 200 OK y confirma que la compra está permitida.
* **CA-04 (Simulador Didáctico en UI):** En `ProfilePage.tsx` se dispone de un simulador visual que permite probar en vivo la respuesta del backend para cualquier usuario conectado.

### Trazabilidad Técnica
* **Backend:** `backend/app/api/v1/endpoints/compras.py`, `backend/app/api/deps.py` (`verify_client_only`)
* **Frontend:** `frontend/src/pages/ProfilePage.tsx` (Simulador de regla RF-031)
* **Pruebas:** `backend/test_sprint1_api.py` (Test 10), `notebooks/demo_sprint1.ipynb` (Sección HU-03)
