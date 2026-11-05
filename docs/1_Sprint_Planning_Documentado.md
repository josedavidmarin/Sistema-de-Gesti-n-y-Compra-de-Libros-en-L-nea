# UNIVERSIDAD TECNOLÓGICA DE PEREIRA
## Facultad de Ingenierías • Ingeniería de Sistemas y Computación
### IS873 — Laboratorio de Software (2026-2)
**Entregable 1:** Sprint Planning Documentado — Sprint 1 (Nota 2: Primer Incremento Funcional)  
**Proyecto:** Sistema de Gestión y Compra de Libros en Línea  
**Equipo de Desarrollo:**
* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`)
* **Edwin Osorio Cartagena**
* **Maicol Londoño Hernández**

**Enlaces del Incremento en Producción:**
* **Frontend (Vercel):** https://sistema-de-gestion-three.vercel.app/
* **Backend API & Swagger (Render):** https://libreria-backend-yhdj.onrender.com/docs
* **Repositorio GitHub:** https://github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea

---

## 1. Sprint Goal (Objetivo del Sprint)

> *"Construir y desplegar en producción el núcleo operativo de seguridad, gestión de identidad y control de acceso basado en roles (RBAC) del sistema mediante autenticación JWT y cifrado bcrypt, garantizando el autoservicio de clientes, la administración auditada por el usuario Root y el bloqueo atómico de compras o reservas para cuentas administrativas (RF-031) en una arquitectura cliente-servidor funcional, probada y demostrable de extremo a extremo."*

---

## 2. Historias Comprometidas en el Sprint 1

De acuerdo con el Product Backlog priorizado con el método **MoSCoW** en la Nota 1 y estimado mediante Planning Poker (serie de Fibonacci), el equipo comprometió **7 Historias de Usuario (21 Story Points totales)**, todas de prioridad **Must Have**:

| ID | Título de la Historia de Usuario | Prioridad (MoSCoW) | Estimación | Responsable | Requisitos (Nota 1) |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **HU-01** | Registro de nuevos clientes con DNI único y contraseña cifrada | **Must Have** | **5 SP** | Edwin Osorio Cartagena | RF-027, RF-029 |
| **HU-04** | Inicio de sesión (Login) y emisión de Bearer Token JWT con roles tipados | **Must Have** | **3 SP** | Jose David Marín Giraldo | RF-026, RF-028 |
| **HU-05** | Cierre de sesión (Logout) e invalidación de credenciales en cliente y servidor | **Must Have** | **1 SP** | Jose David Marín Giraldo | RF-026 |
| **HU-06** | Cambio seguro de contraseña con validación obligatoria de clave previa | **Must Have** | **2 SP** | Edwin Osorio Cartagena | RF-028 |
| **HU-07** | Consulta y actualización de perfil, datos de correspondencia y monedero virtual | **Must Have** | **3 SP** | Jose David Marín Giraldo | RF-021, RF-028, RF-037 |
| **HU-02** | Creación exclusiva de Administradores por Superadmin Root con auditoría | **Must Have** | **5 SP** | Maicol Londoño Hernández | RF-030 |
| **HU-03** | Restricción estricta de compras y reservas para Administradores y Root | **Must Have** | **2 SP** | Maicol Londoño Hernández | RF-031 |

**Total Comprometido:** **21 Story Points** (distribuidos equitativamente en **7 SP por cada integrante**).

---

## 3. Justificación de las Historias Comprometidas

### 3.1 Capacidad del Equipo (~3 Semanas)
* **Integrantes:** 3 desarrolladores.
* **Duración del Sprint 1:** 3 semanas calendario (~21 días).
* **Disponibilidad horaria:** Cada integrante dispuso de **10 a 12 horas semanales** efectivas para la asignatura, equivalente a **30–36 horas por integrante en el sprint** (**90 a 108 horas-hombre totales** en el equipo).
* **Relación Horas / Story Points:** Se calibró una equivalencia promedio de ~4.5 horas de ingeniería por cada Story Point (incluyendo codificación backend/frontend, documentación en inglés, pruebas automatizadas, despliegue cloud y notebook reproducible). Por tanto, **21 Story Points (7 SP por persona)** se ajustan de forma realista a la capacidad instalada sin comprometer la calidad técnica.

### 3.2 Dependencias Técnicas y Justificación Individual por Historia

1. **`HU-04` — Inicio de sesión con Bearer Token JWT (3 SP | Jose David Marín):**
   * **Justificación y dependencia:** Es el cimiento arquitectónico de todo el sistema. Provee el generador criptográfico de tokens (`create_access_token`) y el inyector de dependencias `get_current_user`. Sin `HU-04` es técnicamente imposible autenticar las peticiones de `HU-02`, `HU-03`, `HU-05`, `HU-06` y `HU-07`.
2. **`HU-01` — Registro de nuevos clientes (5 SP | Edwin Osorio):**
   * **Justificación y dependencia:** Es el punto de entrada de negocio para los compradores (`CLIENTE`). Implementa el modelo relacional `Usuario`, el hashing `bcrypt` y las restricciones `UNIQUE` de DNI y correo en PostgreSQL/SQLite. Depende del esquema de seguridad base y habilita que existan clientes reales para probar `HU-04`, `HU-06` y `HU-07`.
3. **`HU-05` — Cierre de sesión / Logout (1 SP | Jose David Marín):**
   * **Justificación y dependencia:** Complementa directamente a `HU-04` cerrando el ciclo de vida del token en el cliente (`AuthContext` y `localStorage`) y notificando al backend (`POST /auth/logout`), garantizando la protección de sesiones en equipos compartidos.
4. **`HU-07` — Consulta y actualización de perfil y monedero (3 SP | Jose David Marín):**
   * **Justificación y dependencia:** Depende directamente de `HU-04` (`GET` y `PUT /api/v1/auth/me`). Permite que el usuario autenticado consulte su identidad, verifique el saldo de su monedero virtual (`RF-037`) y actualice su dirección de correspondencia (`RF-021`), requisito previo indispensable antes de despachar pedidos físicos en sprints posteriores.
5. **`HU-06` — Cambio seguro de contraseña (2 SP | Edwin Osorio):**
   * **Justificación y dependencia:** Depende de `HU-04` y de la vista de perfil (`HU-07`). Garantiza el requisito de seguridad `RF-028` exigiendo verificar criptográficamente la contraseña actual antes de permitir el re-hasheo `bcrypt` de una nueva clave distinta.
6. **`HU-02` — Creación de Administradores por Superadmin Root (5 SP | Maicol Londoño):**
   * **Justificación y dependencia:** Depende del motor de autenticación (`HU-04`) y del guardián de roles `require_roles(["ROOT"])`. Según la regla de negocio `RF-030`, ningún administrador puede autorregistrarse; solo el usuario semilla `ROOT` puede dar de alta personal operativo y auditar quién lo creó (`creado_por_id`). Es prerrequisito obligatorio para que en el Sprint 2 los administradores puedan gestionar el catálogo de libros.
7. **`HU-03` — Restricción de compras y reservas para Administradores y Root (2 SP | Maicol Londoño):**
   * **Justificación y dependencia:** Depende de `HU-01`, `HU-02` y `HU-04` (existencia de los 3 roles autenticados). Materializa desde el primer incremento la regla crítica de negocio `RF-031` mediante el middleware `verify_client_only`, asegurando que ninguna cuenta administrativa (`ADMINISTRADOR` o `ROOT`) pueda ejecutar transacciones de compra o reserva (`HTTP 403 Forbidden`).

### 3.3 Prioridad frente al resto del Product Backlog
Construir primero el catálogo de libros, carrito o reservas sin contar con autenticación JWT, cifrado de contraseñas y control de acceso basado en roles (RBAC) habría obligado a exponer endpoints públicos inseguros o con usuarios simulados (*hardcoded*), introduciendo deuda técnica y vulnerabilidades de escalamiento de privilegios. Por ello, el bloque de Identidad, Seguridad y RBAC tuvo prioridad absoluta en el Sprint 1.

---

## 4. Historias que Quedaron Fuera del Sprint 1 y Por Qué

| Épica / Módulo | Historias Excluidas del Sprint 1 | Estimación | Razón Técnica y de Negocio para su Exclusión |
| :--- | :--- | :---: | :--- |
| **Catálogo e Inventario de Libros** | `HU-08` (Búsqueda/Catálogo), `HU-09` / `HU-10` (CRUD de libros e inventario por copia física por Administrador), `HU-10b` (Detalle y stock). | **27 SP** | Requieren que el rol `ADMINISTRADOR` (`HU-02`) y los interceptores RBAC estén 100% operativos y auditados antes de permitir altas, bajas o modificaciones de inventario. Además, sumar 27 SP habría duplicado la capacidad máxima del equipo (21 SP). Pasan al **Sprint 2 (Nota 3)**. |
| **Reservas 24h, Carrito y Pagos** | `HU-11` / `HU-18` (Reserva temporal por 24h), `HU-12` / `HU-19` (Compra con monedero virtual), `HU-13` (Recarga de saldo). | **16 SP** | Tienen dependencia funcional estricta del catálogo de libros y del control de stock físico que se construirán en el Sprint 2. Pasan al **Sprint 3**. |
| **Logística, Envíos y Devoluciones** | `HU-14` (Seguimiento de estados de envío), `HU-15` / `HU-20` (Devoluciones con QR y reembolso), `HU-21` (Puntos de recogida). | **14 SP** | Clasificadas como *Should Have* / *Could Have* en la Nota 1; requieren órdenes de compra completadas previamente. Pasan al **Sprint 4**. |
| **Funcionalidades Descartadas / Postergadas** | Bonos de cumpleaños (`RF-032`), Chat en tiempo real (`RF-034`), Realidad Aumentada (`RF-039`). | **12 SP** | Clasificadas como *Could Have* / *Won't Have* en el backlog de la Nota 1 para proteger la entrega del MVP transaccional. |

---

## 5. Criterios de Aceptación por Historia Comprometida

### `HU-01`: Registro de nuevos clientes (`RF-027`, `RF-029`)
* **CA-01 (Registro Exitoso):** Dado que un visitante ingresa un DNI y correo electrónico no registrados previamente, nombres, apellidos y una contraseña válida (mínimo 6 caracteres), cuando envía el formulario a `POST /api/v1/auth/register`, entonces el sistema responde con `HTTP 201 Created`, asigna automáticamente el rol `CLIENTE`, almacena la contraseña cifrada con `bcrypt` e inicia sesión automáticamente.
* **CA-02 (Rechazo de Duplicados):** Dado que un visitante intenta registrarse con un DNI o un correo electrónico que ya existe en la base de datos, cuando envía la solicitud, entonces el backend rechaza el registro con `HTTP 400 Bad Request` y un mensaje descriptivo indicando el campo en conflicto.
* **CA-03 (Validación de Formulario):** Dado que falta algún campo obligatorio, las contraseñas no coinciden o no se acepta la cláusula de Habeas Data (Ley 1581), el formulario previene el envío y muestra retroalimentación visual.

### `HU-04`: Inicio de sesión con Bearer Token JWT (`RF-026`, `RF-028`)
* **CA-01 (Emisión de JWT):** Dado que un usuario activo ingresa su correo y contraseña correctos en `POST /api/v1/auth/login`, cuando el backend verifica el hash `bcrypt`, entonces retorna `HTTP 200 OK` con un token JWT firmado con `HS256` (vigencia de 24 horas) que incluye los claims `sub` (email), `rol`, `user_id` y `nombre`.
* **CA-02 (Credenciales Inválidas):** Dado que el correo no existe o la contraseña no coincide con el hash almacenado, cuando se solicita el login, entonces el sistema responde con `HTTP 401 Unauthorized` sin revelar cuál de los dos campos falló.
* **CA-03 (Redirección por Rol):** Al autenticarse en el frontend, si el rol es `ROOT` redirige al panel `/admin`; si es `CLIENTE` o `ADMINISTRADOR` redirige a `/profile`.

### `HU-05`: Cierre de sesión (`RF-026`)
* **CA-01 (Revocación de Sesión):** Dado que un usuario autenticado hace clic en "Cerrar Sesión", cuando se ejecuta la acción, entonces el frontend invoca `POST /api/v1/auth/logout` (`HTTP 200 OK`), elimina el token JWT de `localStorage`, restablece el estado global al rol `VISITANTE` y bloquea el acceso a las vistas protegidas (`/profile` y `/admin`).

### `HU-06`: Cambio seguro de contraseña (`RF-028`)
* **CA-01 (Validación de Clave Actual):** Dado que un usuario autenticado solicita cambiar su contraseña en `PUT /api/v1/auth/change-password`, cuando la contraseña actual enviada no coincide con su hash `bcrypt` en base de datos, entonces el sistema rechaza la petición con `HTTP 400 Bad Request`.
* **CA-02 (Prevención de Reutilización):** Dado que la nueva contraseña ingresada es idéntica a la contraseña actual o menor a 6 caracteres, el sistema rechaza la operación con `HTTP 400 Bad Request`.
* **CA-03 (Actualización Exitosa):** Dado que la clave actual es válida y la nueva clave cumple las políticas, el sistema genera un nuevo hash `bcrypt` con sal aleatoria, actualiza el registro y retorna `HTTP 200 OK`.

### `HU-07`: Consulta y actualización de perfil (`RF-021`, `RF-028`, `RF-037`)
* **CA-01 (Consulta de Perfil y Monedero):** Dado que un usuario autenticado envía su Bearer Token a `GET /api/v1/auth/me`, el backend responde con `HTTP 200 OK` devolviendo su información personal completa y el saldo disponible en su monedero virtual (`$150.000 COP` inicial para clientes).
* **CA-02 (Actualización de Datos de Envío):** Dado que el usuario modifica su teléfono o dirección de correspondencia mediante `PUT /api/v1/auth/me`, el sistema persiste los cambios y retorna el perfil actualizado (`HTTP 200 OK`).
* **CA-03 (Inmutabilidad de Identidad y Rol):** El endpoint `PUT /api/v1/auth/me` ignora o bloquea cualquier intento de alterar campos críticos (`dni`, `email`, `rol` o `saldo_disponible`).

### `HU-02`: Creación de Administradores por Superadmin Root (`RF-030`)
* **CA-01 (Creación Exclusiva por Root):** Dado que el usuario autenticado posee el rol `ROOT`, cuando envía los datos de un nuevo empleado a `POST /api/v1/admin/create-admin`, entonces el sistema crea la cuenta con rol `ADMINISTRADOR`, registra el `creado_por_id` para auditoría y responde con `HTTP 201 Created`.
* **CA-02 (Bloqueo RBAC a otros roles):** Dado que un usuario con rol `CLIENTE` o `ADMINISTRADOR` intenta invocar `POST /api/v1/admin/create-admin` o `GET /api/v1/admin/users`, el interceptor RBAC rechaza la petición con `HTTP 403 Forbidden`.
* **CA-03 (Gestión de Estado Activo/Suspendido):** El usuario `ROOT` puede activar o suspender cuentas de administradores desde el panel administrativo (`PUT /api/v1/admin/users/{id}/toggle-status`), impidiendo su propia auto-desactivación.

### `HU-03`: Restricción de compra y reserva para Administradores y Root (`RF-031`)
* **CA-01 (Bloqueo a Administrador):** Dado que un usuario autenticado con rol `ADMINISTRADOR` intenta validar o ejecutar una compra o reserva en `POST /api/v1/compras/validar-permiso-compra-reserva`, el middleware `verify_client_only` rechaza la operación con `HTTP 403 Forbidden` y el mensaje explícito de la regla `RF-031`.
* **CA-02 (Bloqueo a Root):** Dado que un usuario con rol `ROOT` intenta ejecutar una compra o reserva en el mismo endpoint, el sistema rechaza la operación con `HTTP 403 Forbidden`.
* **CA-03 (Autorización Exclusiva a Cliente):** Dado que un usuario autenticado con rol `CLIENTE` ejecuta la solicitud, el sistema autoriza la operación con `HTTP 200 OK`.

---

## 6. Definition of Done (DoD) del Equipo

El equipo acordó que una Historia de Usuario solo puede moverse a la columna **`Done`** del tablero cuando cumple **todos** los siguientes criterios:

1. **Integración End-to-End (Backend + Frontend + Base de Datos):** El endpoint en FastAPI, la persistencia en SQLAlchemy (PostgreSQL en Supabase / SQLite local) y la interfaz de usuario en React + TypeScript están integrados y comunicándose sin datos simulados (*mocked*).
2. **Estándar de Código y Documentación en Inglés:** Todo el código nuevo cuenta con tipado explícito (Pydantic / TypeScript) y comentarios/docstrings en inglés conforme a los lineamientos de la asignatura.
3. **Pruebas Automatizadas en Verde:** La historia cuenta con pruebas automatizadas de camino feliz y casos borde (`400`, `401`, `403`) ejecutándose sin errores en `backend/test_sprint1_api.py`.
4. **Reproducibilidad en Notebook:** El flujo completo de la historia está incluido y verificado con `assert` en el Jupyter Notebook de entrega (`notebooks/demo_sprint1.ipynb`).
5. **Trazabilidad en Git y Tablero Kanban:** El código fue subido al repositorio con commits descriptivos prefijados con el identificador de la historia (`HU-XX: ...`), vinculado a su Issue en GitHub Projects y desplegado en producción (Vercel + Render).
6. **Demostrable en Vivo:** Cualquier miembro del equipo puede demostrar la funcionalidad en tiempo real desde la URL de producción o en local durante el Sprint Review.
