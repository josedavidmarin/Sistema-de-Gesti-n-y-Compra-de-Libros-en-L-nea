# UNIVERSIDAD TECNOLÓGICA DE PEREIRA
## Facultad de Ingenierías • Programa de Ingeniería de Sistemas y Computación
### IS873 — Laboratorio de Software (Semestre 2026-2)

---

# 📑 DOCUMENTO MAESTRO CONSOLIDADO DE ENTREGA
## NOTA 2 — SPRINT REVIEW 1: PRIMER INCREMENTO FUNCIONAL
**Ponderación:** 20% de la calificación final  
**Modalidad:** Asíncrono (~3 semanas de desarrollo) + Sustentación Síncrona Obligatoria (Sprint Review Real)  
**Fechas de Sustentación:** 3 y 5 de noviembre de 2026  

---

### 👥 Integrantes del Equipo y Roles Scrum
* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`) — *Scrum Master / Fullstack Developer*
* **Edwin Osorio Cartagena** — *Backend Developer / QA & Testing Lead*
* **Maicol Londoño Hernández** — *Security Specialist / DevOps & Fullstack Developer*

### 🔗 Enlaces Oficiales de Entrega
* **Repositorio en GitHub:** [https://github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea.git](https://github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea.git)
* **Tablero Kanban/Scrum (GitHub Projects):** Proyecto activo vinculado a PRs e Issues
* **Notebook Interactivo de Demostración:** `notebooks/demo_sprint1.ipynb`
* **Lanzador Rápido del Sistema:** `start_project.bat`

---

# PARTE I: SPRINT PLANNING DOCUMENTADO

## 1.1 Sprint Goal (Objetivo del Sprint)
> *"Construir y desplegar el núcleo operativo de seguridad y control de acceso del sistema mediante autenticación JWT, autoservicio de clientes y control de acceso basado en roles (RBAC), garantizando de forma atómica la restricción de compras para cuentas administrativas (RF-031) en una arquitectura cliente-servidor funcional, probada y demostrable de principio a fin."*

---

## 1.2 Historias Comprometidas en el Sprint 1 (21 Story Points)
De acuerdo con la priorización MoSCoW formulada en la Nota 1 y estimada mediante la serie de Fibonacci, se comprometieron las siguientes 7 historias de usuario del bloque **MUST HAVE**, distribuidas de manera equitativa entre los tres integrantes (7 Story Points cada uno):

| ID Historia | Título de la Historia de Usuario | Prioridad (MoSCoW) | Estimación (SP) | Responsable Asignado | Requisitos Funcionales (RF) |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **HU-01** | Registro de nuevos clientes con DNI único y contraseña cifrada | **MUST HAVE** | **5 SP** | Edwin Osorio | RF-027, RF-029 |
| **HU-04** | Inicio de sesión (Login) con emisión de Bearer Token JWT | **MUST HAVE** | **3 SP** | Jose David Marín | RF-026, RF-028 |
| **HU-05** | Cierre de sesión (Logout) y desvinculación local de credenciales | **MUST HAVE** | **1 SP** | Jose David Marín | RF-026 |
| **HU-06** | Cambio seguro de contraseña con validación de clave previa | **MUST HAVE** | **2 SP** | Edwin Osorio | RF-028 |
| **HU-07** | Consulta y actualización de datos de perfil, teléfono y dirección | **MUST HAVE** | **3 SP** | Jose David Marín | RF-021, RF-028 |
| **HU-02** | Creación de Administradores por Superadmin Root con auditoría | **MUST HAVE** | **5 SP** | Maicol Londoño | RF-030 |
| **HU-03** | Restricción estricta de compras/reservas para personal operativo (RF-031) | **MUST HAVE** | **2 SP** | Maicol Londoño | RF-031 |

**Total Comprometido:** **21 Story Points (100% Must Have)**.

---

## 1.3 Justificación Técnica y Capacidad del Equipo

### 1.3.1 Capacidad Disponible
* **Composición del equipo:** 3 ingenieros en formación.
* **Ventana de tiempo:** 3 semanas calendario (~21 días hábiles de iteración).
* **Dedicación estimada:** ~10 a 12 horas por integrante a la semana = **90 a 108 horas hombre totales**.
* **Velocidad de iteración:** Para un primer sprint en un stack tecnológico nuevo (FastAPI + React TypeScript), la literatura ágil recomienda comprometer entre 18 y 24 Story Points. Un total de **21 SP** representó una carga sostenible de **7 SP por integrante**, minimizando la sobrecarga cognitiva y blindando la calidad del código.

### 1.3.2 Dependencias Técnicas Críticas
1. **Punto de Entrada Arquitectónico (`HU-04: Login JWT`):** La autenticación es el pilar de toda la seguridad del sistema. Sin el middleware de inyección de dependencias `Depends(get_current_user)` era técnicamente inviable construir el cambio de clave (`HU-06`), la consulta/edición de perfil (`HU-07`), la creación de personal (`HU-02`) o la restricción de compras (`HU-03`).
2. **Jerarquía RBAC y Esquema Relacional:** La tabla de usuarios debía quedar normalizada con su enumeración estricta de roles (`CLIENTE`, `ADMINISTRADOR`, `ROOT`) antes de implementar los interceptores de acceso.
3. **Prioridad frente al resto del Backlog:** Construir funcionalidades de inventario, catálogo o pasarela de pagos antes de consolidar la seguridad y el control de accesos habría generado deuda técnica crítica y riesgos de autorización vertical/horizontal.

---

## 1.4 Historias que Quedaron Fuera del Sprint y Justificación

| Módulo / Épica | Historias Fuera del Sprint 1 | Estimación Total | Motivo Técnico de Exclusión para este Corte |
| :--- | :--- | :---: | :--- |
| **Gestión de Inventario y Libros** | `HU-10` (Registro Libro), `HU-10b` (Copia Física/Ejemplar), `HU-11` (Baja), `HU-12` (Edición), `HU-13` (Control Stock), `HU-14` (Vista Inventario). | **27 SP** | Requieren que el rol `ADMINISTRADOR` esté plenamente funcional y auditado antes de manipular ejemplares físicos. Pasan completas al **Sprint 2 (Nota 3)**. |
| **Compra y Reserva Concurrente** | `HU-18` (Reserva con expiración 24h), `HU-19` (Confirmación de compra transaccional). | **16 SP** | Dependen de la existencia física de ejemplares y títulos en el catálogo. Pasan al **Sprint 3**. |
| **Devoluciones y Envíos** | `HU-20` (Solicitud Devolución QR), `HU-21` (Recogida en tienda Google Maps). | **14 SP** | Módulos Should Have que requieren historial de compras previas. Pasan al **Sprint 4**. |
| **Could Have / Won't Have** | Bonos de cumpleaños (`RF-032`), Chat en vivo (`RF-034`), Realidad Aumentada (`RF-039`). | **12 SP** | Descartados tempranamente del MVP para no comprometer los 17 requerimientos Must Have. |

---

## 1.5 Criterios de Aceptación por Historia Comprometida (Formato Gherkin)

### HU-01: Registro de nuevos clientes (RF-027, RF-029)
* **Escenario 1 (Registro Exitoso):**  
  * *Dado que* un visitante ingresa DNI, nombre, apellido, correo no registrado, teléfono, dirección y contraseña de al menos 6 caracteres,  
  * *Cuando* envía la solicitud a `POST /api/v1/auth/register`,  
  * *Entonces* el sistema responde con `HTTP 201 Created`, asigna automáticamente el rol `CLIENTE`, saltea y hashea la clave con `bcrypt`, e inicia sesión automáticamente.
* **Escenario 2 (Conflicto por Duplicidad):**  
  * *Dado que* el DNI o el correo electrónico ya existen en la base de datos,  
  * *Cuando* se procesa el formulario,  
  * *Entonces* el sistema rechaza la transacción con `HTTP 400 Bad Request` informando detalladamente el campo duplicado.

### HU-04: Inicio de sesión con Bearer Token JWT (RF-026, RF-028)
* **Escenario 1 (Autenticación Exitosa):**  
  * *Dado que* un usuario registrado ingresa su correo y contraseña válidos,  
  * *Cuando* envía sus credenciales a `POST /api/v1/auth/login`,  
  * *Entonces* el sistema responde con `HTTP 200 OK` y un Bearer Token JWT con firma HMAC-SHA256, vigencia de 24 horas y claims tipados (`sub`, `rol`, `user_id`, `nombre`).
* **Escenario 2 (Credenciales Inválidas):**  
  * *Dado que* la contraseña no coincide con el hash o el correo no existe,  
  * *Cuando* se evalúa el login,  
  * *Entonces* el backend responde con `HTTP 401 Unauthorized` protegiendo contra enumeración de cuentas.

### HU-05: Cierre de sesión (Logout)
* **Escenario 1 (Cierre de Sesión Completo):**  
  * *Dado que* un usuario autenticado hace clic en el botón "Cerrar Sesión",  
  * *Cuando* se activa el trigger de cierre,  
  * *Entonces* el cliente elimina el token de `localStorage`, resetea el rol activo a `VISITANTE`, notifica al endpoint `POST /api/v1/auth/logout` y bloquea el acceso a rutas protegidas.

### HU-06: Cambio seguro de contraseña (RF-028)
* **Escenario 1 (Validación de Clave Anterior):**  
  * *Dado que* el usuario autenticado ingresa una contraseña actual incorrecta,  
  * *Cuando* invoca `PUT /api/v1/auth/change-password`,  
  * *Entonces* el sistema rechaza la solicitud con `HTTP 400 Bad Request` y no altera la base de datos.
* **Escenario 2 (Actualización Exitosa):**  
  * *Dado que* la clave actual es correcta y la nueva es distinta a la anterior,  
  * *Cuando* se procesa el cambio,  
  * *Entonces* se genera un nuevo hash con sal única en `bcrypt`, se persiste en base de datos y responde con `HTTP 200 OK`.

### HU-07: Consulta y actualización de perfil (RF-021, RF-028)
* **Escenario 1 (Consulta de Perfil):**  
  * *Dado que* un cliente envía su token en la cabecera `Authorization: Bearer <token>`,  
  * *Cuando* consulta `GET /api/v1/auth/me`,  
  * *Entonces* el sistema responde con `HTTP 200 OK` retornando sus datos personales y saldo disponible ($150.000 COP).
* **Escenario 2 (Actualización de Contacto y Envío):**  
  * *Dado que* el cliente actualiza teléfono o dirección en `PUT /api/v1/auth/me`,  
  * *Cuando* se persisten los cambios,  
  * *Entonces* el sistema actualiza únicamente los campos permitidos, bloqueando la alteración de `dni`, `email` o `rol`.

### HU-02: Creación de Administradores por Superadmin Root (RF-030)
* **Escenario 1 (Alta de Administrador por Root):**  
  * *Dado que* el usuario autenticado posee el rol `ROOT`,  
  * *Cuando* envía los datos de un empleado a `POST /api/v1/admin/create-admin`,  
  * *Entonces* el backend genera la cuenta con rol `ADMINISTRADOR` y responde con `HTTP 201 Created`.
* **Escenario 2 (Intento no Autorizado por Cliente):**  
  * *Dado que* un usuario con rol `CLIENTE` o `ADMINISTRADOR` intenta crear una cuenta administrativa,  
  * *Cuando* el middleware RBAC intercepta la petición,  
  * *Entonces* bloquea el acceso con `HTTP 403 Forbidden`.

### HU-03: Restricción de Compra para Administradores y Root (RF-031)
* **Escenario 1 (Bloqueo a Administrador y Root):**  
  * *Dado que* un usuario autenticado con rol `ADMINISTRADOR` o `ROOT` intenta crear o validar una compra/reserva en `POST /api/v1/compras/validar-permiso-compra-reserva`,  
  * *Cuando* el interceptor `verify_client_only` inspecciona el token,  
  * *Entonces* cancela la transacción con `HTTP 403 Forbidden` y el mensaje oficial de la política RF-031.
* **Escenario 2 (Autorización a Cliente):**  
  * *Dado que* un usuario con rol `CLIENTE` envía la misma solicitud,  
  * *Cuando* se evalúa el permiso,  
  * *Entonces* el sistema autoriza la operación respondiendo con `HTTP 200 OK`.

---

## 1.6 Definition of Done (DoD) del Equipo
Una historia de usuario se declara formalmente **"DONE" (Terminada)** únicamente cuando cumple los siguientes 6 pilares de calidad:
1. **Desarrollo Integral:** Lógica de negocio implementada en backend (FastAPI) y maquetación responsiva en frontend (React/TypeScript).
2. **Documentación del Código en Inglés:** Docstrings (PEP-257), tipado estricto Pydantic y comentarios de funciones redactados en inglés técnico.
3. **Pruebas Automatizadas:** 100% de aserciones pasando exitosamente en la suite automatizada (`test_sprint1_api.py` / pytest).
4. **Verificación en Notebook de Demostración:** Verificada en el Jupyter Notebook reproducible (`notebooks/demo_sprint1.ipynb`).
5. **Control de Versiones y Trazabilidad:** Revisión y fusión mediante Pull Request en GitHub, con mensajes de commit prefijados con el ID de la historia (`HU-XX: ...`).
6. **Demostrabilidad en Vivo:** Operativa de extremo a extremo sin fragmentos sueltos ni dependencias de memoria del equipo.

---

# PARTE II: RESULTADOS DEL SPRINT Y ARQUITECTURA TÉCNICA

## 2.1 Balance General de Ejecución
* **Story Points Comprometidos:** 21 SP.
* **Story Points Completados:** **21 SP (100% de cumplimiento)**.
* **Historias Completadas:** 7 de 7 (`HU-01`, `HU-02`, `HU-03`, `HU-04`, `HU-05`, `HU-06`, `HU-07`).
* **Estado del Tablero Scrum/Kanban:** 7 tarjetas en estado **DONE**.

---

## 2.2 Stack Tecnológico y Arquitectura del Incremento

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA CLIENTE-SERVIDOR                         │
├─────────────────────────────────────┬───────────────────────────────────────┤
│ FRONTEND (React 18 + Vite)          │ BACKEND (FastAPI ASGI + Python)       │
│ • TypeScript con tipado estricto    │ • Documentación viva OpenAPI/Swagger  │
│ • Tailwind CSS (Mobile-First)       │ • SQLAlchemy ORM + SQLite/PostgreSQL  │
│ • Context API global para sesión    │ • Criptografía bcrypt (passlib)       │
│ • Interceptor Axios para Bearer JWT │ • Token JWT con claims y expiración   │
│ • Autorelleno de credenciales demo  │ • Middleware modular RBAC (Depends)   │
└─────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2.3 Matriz de Trazabilidad Código - Historias de Usuario

| ID | Archivos Backend Involucrados | Archivos Frontend Involucrados | Commits / Trazabilidad |
| :---: | :--- | :--- | :--- |
| **HU-01** | `api/v1/endpoints/auth.py`, `schemas/user.py` | `pages/RegisterPage.tsx` | `HU-01: ...` |
| **HU-04** | `core/security.py`, `auth.py`, `deps.py` | `pages/LoginPage.tsx`, `AuthContext.tsx` | `HU-04: Translate JWT...` |
| **HU-05** | `endpoints/auth.py` (`POST /logout`) | `context/AuthContext.tsx`, `Navbar.tsx` | `HU-05: Enhance frontend...` |
| **HU-06** | `endpoints/auth.py` (`PUT /change-password`) | `pages/ProfilePage.tsx` | `HU-06: ...` |
| **HU-07** | `endpoints/auth.py` (`GET`/`PUT /me`) | `pages/ProfilePage.tsx` | `HU-07: Add English schemas...` |
| **HU-02** | `endpoints/admin.py`, `deps.py` | `pages/AdminPage.tsx` | `HU-02: ...` |
| **HU-03** | `endpoints/compras.py`, `deps.py` | `pages/ProfilePage.tsx` (Simulador) | `HU-03: ...` |

---

## 2.4 Suite de Pruebas Automatizadas y Calidad Técnica
La suite de pruebas de extremo a extremo alojada en `backend/test_sprint1_api.py` valida automáticamente el flujo completo:
* **Test 1:** Salud y disponibilidad del API (`GET /`) ➔ **PASÓ**.
* **Test 2:** Login del Superadmin Root y validación de token JWT ➔ **PASÓ**.
* **Test 3:** Login de Cliente Demo y verificación de claims ➔ **PASÓ**.
* **Test 4:** Registro de nuevo cliente con DNI y correo únicos (HU-01) ➔ **PASÓ**.
* **Test 5:** Consulta de perfil autenticado propio `/me` (HU-07) ➔ **PASÓ**.
* **Test 6:** Actualización de teléfono y dirección (HU-07) ➔ **PASÓ**.
* **Test 7:** Cambio de contraseña con validación de contraseña anterior (HU-06) ➔ **PASÓ**.
* **Test 8:** Root crea cuenta de Administrador con auditoría (HU-02) ➔ **PASÓ**.
* **Test 9:** Intento de creación de Administrador por un Cliente bloqueado con HTTP 403 ➔ **PASÓ**.
* **Test 10:** Evaluación de la regla de restricción de compras RF-031 (HU-03) (Cliente permitido 200, Administrador y Root bloqueados con 403) ➔ **PASÓ**.

---

## 2.5 Notebook de Demostración Reproducible (`notebooks/demo_sprint1.ipynb`)
El notebook cumple estrictamente con el mandato pedagógico del Product Owner:
* **Celda inicial obligatoria:** Establece con precisión qué demuestra y qué NO demuestra todavía este corte.
* **Autonomía:** Incluye datos semilla y llamadas automáticas HTTP para ejecutarse con la opción *Restart & Run All* sin intervención humana.

---

# PARTE III: NOTAS DE SUSTENTACIÓN Y RESPUESTAS PARA EL PRODUCT OWNER

### 1. ¿Qué se comprometió el equipo al inicio del sprint?
> *"Al inicio del Sprint 1, el equipo comprometió **21 Story Points** representados en 7 Historias de Usuario clasificadas como **Must Have** en la priorización MoSCoW. El objetivo central fue implementar el núcleo de seguridad, la gestión de usuarios con cifrado bcrypt, la emisión de tokens JWT con caducidad a 24 horas y el control de acceso basado en roles (RBAC), incluyendo la aplicación estricta de la regla de negocio RF-031 que prohíbe las compras y reservas a cuentas administrativas."*

### 2. ¿Cómo se demuestra cada historia comprometida en vivo? (Guión de Sustentación)
La sustentación se realizará en tiempo real, sin diapositivas ni capturas de pantalla, ejecutando el sistema en vivo:
1. **HU-01 (Registro):** Edwin Osorio registra un cliente nuevo en pantalla. Muestra el control de unicidad de DNI/correo y la confirmación de cuenta creada.
2. **HU-04 (Login JWT):** Jose David Marín inicia sesión con el cliente recién creado. Muestra la emisión del token Bearer y la persistencia de sesión.
3. **HU-07 (Perfil):** Jose David Marín consulta `Mi Perfil`, visualiza el saldo (\$150.000 COP) y actualiza en vivo el teléfono y la dirección de envío.
4. **HU-06 (Cambio de Clave):** Edwin Osorio demuestra el intento fallido al ingresar una clave actual incorrecta y posteriormente ejecuta el cambio exitoso.
5. **HU-05 (Logout):** Jose David Marín cierra la sesión, demostrando que las rutas privadas quedan bloqueadas inmediatamente.
6. **HU-02 (Root y Administradores):** Maicol Londoño inicia sesión como `root@libreria.com`, accede a la consola administrativa y da de alta a un nuevo Administrador, mostrando el padrón de usuarios y la auditoría.
7. **HU-03 (Regla RF-031 en Vivo):** Maicol Londoño y Jose David Marín demuestran la prueba reina:
   * Inician sesión como Administrador o Root, van al simulador de compra y demuestran el rechazo inmediato del backend con **HTTP 403 Forbidden**.
   * Inician sesión como Cliente y demuestran que la compra es autorizada con **HTTP 200 OK**.
8. **Evidencia Técnica:** Se ejecuta en terminal `python test_sprint1_api.py` (10/10 tests en verde) y se exhibe el notebook `demo_sprint1.ipynb`.

### 3. ¿Qué historias comprometidas no se completaron y por qué?
> *"**El 100% de las 7 historias comprometidas (21 Story Points) fueron completadas y son demostrables en vivo.** Durante el refinamiento inicial se debatió si incluir el CRUD básico de libros en este corte; sin embargo, decidimos conscientemente dejarlo para el Sprint 2. La razón técnica fundamental fue garantizar que la capa de autenticación, el hashing criptográfico y la jerarquía de roles RBAC quedaran blindadas y probadas al 100%, ya que construir inventario sin control de accesos habría generado inconsistencias de seguridad."*

### 4. ¿Qué decisiones técnicas tomaron durante el sprint que no estaban en el plan original?
1. **Botones de Autorelleno Rápido en Frontend:** Se implementaron botones de acceso en `LoginPage.tsx` para cargar con un clic las credenciales de Root, Administrador o Cliente, facilitando una sustentación ágil ante el docente.
2. **Simulador Didáctico de la Regla RF-031:** Se incorporó un componente reactivo en `ProfilePage.tsx` que consulta directamente el endpoint de validación de compras para evidenciar el bloqueo 403 en tiempo real.
3. **Persistencia Dual (SQLite local / PostgreSQL listo):** Se configuró SQLAlchemy para operar localmente con SQLite sin requerir configuración de bases de datos pesadas en máquinas de demostración, manteniendo la compatibilidad estricta con PostgreSQL mediante variables de entorno.

### 5. ¿Cómo distribuyó el equipo el trabajo? ¿Hubo cuellos de botella?
* **Distribución Equitativa (7 SP cada uno):**
  * **Edwin Osorio (7 SP):** HU-01 (Registro - 5 SP) y HU-06 (Cambio de contraseña - 2 SP).
  * **Jose David Marín (7 SP):** HU-04 (Login - 3 SP), HU-05 (Logout - 1 SP) y HU-07 (Perfil - 3 SP).
  * **Maicol Londoño (7 SP):** HU-02 (Crear Admin por Root - 5 SP) y HU-03 (Restricción de compra RF-031 - 2 SP).
* **Cuellos de Botella y Mitigación:**
  * *Cuello de botella:* La sincronización de interfaces y contratos de datos entre los esquemas Pydantic del backend y los tipos TypeScript del frontend antes de que los endpoints estuvieran terminados.
  * *Solución ágil:* Se acordó la especificación temprana mediante la documentación interactiva Swagger (`/docs`), permitiendo que el desarrollo del frontend avanzara en paralelo sin bloquearse.

### 6. ¿Qué llevan al backlog del siguiente sprint (Nota 3 — Sprint 2)?
Al siguiente sprint se traslada el **Módulo de Gestión de Inventario y Catálogo por Copia Física (27 Story Points)**:
* `HU-10` (5 SP): Registro de nuevos libros en catálogo con metadatos editoriales (RF-001).
* `HU-10b` (5 SP): Control granular y asignación de código de barras/código único por copia física (`EJEMPLAR`) (RF-002).
* `HU-12` (3 SP): Edición de información bibliográfica y precios (RF-003).
* `HU-11` (2 SP): Baja y desincorporación de ejemplares dañados o extraviados (RF-004).
* `HU-13` (3 SP): Control de existencias físicas y disponibilidad en bodegas (RF-005).
* `HU-14` (5 SP): Vista de inventario para personal administrativo y alertas de stock agotado (RF-006).
* `HU-09` y `HU-15` (4 SP): Preferencias de categorías y suscripción a novedades (RF-033).
