# UNIVERSIDAD TECNOLÓGICA DE PEREIRA
## Facultad de Ingenierías • Ingeniería de Sistemas y Computación
### IS873 — Laboratorio de Software (2026-2)
**Entregable 5:** Notas de Sustentación (Documento Breve de Sprint Review 1 — Nota 2)  
**Proyecto:** Sistema de Gestión y Compra de Libros en Línea  
**Equipo de Desarrollo:**
* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`)
* **Edwin Osorio Cartagena**
* **Maicol Londoño Hernández**

**Enlaces Oficiales en Producción:**
* **Frontend en Vivo (Vercel):** https://sistema-de-gestion-three.vercel.app/
* **Backend API & Swagger (Render):** https://libreria-backend-yhdj.onrender.com/docs
* **Repositorio GitHub:** https://github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea

---

## 1. ¿Qué se comprometió al inicio del Sprint 1?

Al inicio del Sprint 1, el equipo se comprometió a entregar **21 Story Points** distribuidos en **7 Historias de Usuario de prioridad Must Have** (7 SP por integrante), cuyo objetivo fue dejar 100% operativo, seguro y desplegado el módulo de identidad, autenticación JWT y control de acceso basado en roles (RBAC):

1. **`HU-01` (5 SP — Edwin Osorio):** Registro de nuevos clientes con validación de DNI/correo únicos y cifrado `bcrypt` (`RF-027`, `RF-029`).
2. **`HU-04` (3 SP — Jose David Marín):** Inicio de sesión con emisión de Bearer Token JWT firmado (`HS256`) y claims tipados de rol (`RF-026`, `RF-028`).
3. **`HU-05` (1 SP — Jose David Marín):** Cierre de sesión (Logout) e invalidación del estado de sesión en cliente y servidor (`RF-026`).
4. **`HU-06` (2 SP — Edwin Osorio):** Cambio seguro de contraseña exigiendo validar la contraseña actual y bloqueando reutilización (`RF-028`).
5. **`HU-07` (3 SP — Jose David Marín):** Consulta y actualización de datos de perfil, dirección de correspondencia y visualización del monedero virtual (`RF-021`, `RF-028`, `RF-037`).
6. **`HU-02` (5 SP — Maicol Londoño):** Creación exclusiva de cuentas con rol `ADMINISTRADOR` por parte del Superadmin `ROOT` con trazabilidad de auditoría (`RF-030`).
7. **`HU-03` (2 SP — Maicol Londoño):** Restricción estricta en backend (`HTTP 403 Forbidden`) que prohíbe a usuarios `ADMINISTRADOR` y `ROOT` realizar compras o reservas (`RF-031`).

---

## 2. Historias no completadas y por qué (Respuesta Honesta)

* **Historias comprometidas no completadas:** **0 historias pendientes (se completaron las 7 de 7 historias comprometidas = 21 de 21 Story Points terminados, probados y desplegados en producción).**
* **Reflexión honesta sobre el alcance:**
  Durante la primera semana del sprint tuvimos la intención inicial de adelantar también el CRUD básico de libros (`HU-08`/`HU-09`) dentro de esta misma entrega para que el simulador de compras mostrara fichas de libros reales desde base de datos. Sin embargo, al implementar el despliegue real en la nube (Vercel + Render + Supabase PostgreSQL), las pruebas automatizadas de casos borde (`400`, `401`, `403`) y la contenedorización con Docker, reconocimos que intentar meter el CRUD de inventario en este sprint habría dejado las historias a medias (sin validaciones de stock por ejemplar físico ni pruebas completas). Por ello, tomamos la decisión honesta de concentrar el 100% del esfuerzo en cerrar impecablemente las 7 historias comprometidas de seguridad y RBAC, dejando el módulo de catálogo e inventario completo para el Sprint 2.

---

## 3. Decisiones Técnicas no Previstas en el Plan Original

Durante el desarrollo del Sprint 1 surgieron retos reales de ingeniería que nos llevaron a tomar **5 decisiones técnicas que no estaban contempladas en el documento inicial de la Nota 1**:

1. **Migración a Arquitectura Cloud con Persistencia Dual (PostgreSQL en Supabase + Fallback SQLite):**
   * *Por qué se tomó:* Inicialmente trabajamos solo con SQLite local (`libreria.db`). Al desplegar el backend en **Render**, notamos que su sistema de archivos es efímero (se borra al reiniciarse el contenedor). Por ello, aprovisionamos una base de datos **PostgreSQL real en la nube con Supabase** conectada mediante *Session Pooler* IPv4 (`DATABASE_URL`), manteniendo SQLite como fallback automático para que los tests locales y el Jupyter Notebook corran sin requerir configuración adicional.
2. **Fijación de Versión de Python (`3.10.14`) y Codificación UTF-8 en Despliegue:**
   * *Por qué se tomó:* En el primer despliegue a Render, el servidor intentó compilar `greenlet` y `SQLAlchemy` sobre Python `3.14`, fallando en la compilación en C++, además de un conflicto por codificación `UTF-16LE` en `requirements.txt`. Se estandarizó `requirements.txt` en `UTF-8` con `psycopg2-binary` y se fijó `.python-version` en `3.10.14`.
3. **Configuración de Reescrituras SPA (`vercel.json`) y Variables Estáticas en Vite (`vite-env.d.ts`):**
   * *Por qué se tomó:* Al desplegar el frontend en **Vercel**, detectamos que el acceso a variables de entorno mediante casteo dinámico impedía que el compilador de Vite inyectara la URL de Render en producción. Se definió formalmente la interfaz `ImportMetaEnv` en `vite-env.d.ts` y las reglas de enrutamiento en `vercel.json`.
4. **Simulador Interactivo de la Regla `RF-031` (`HU-03`) en el Perfil de Usuario:**
   * *Por qué se tomó:* Dado que el carrito de compras completo pertenece al Sprint 3, necesitábamos que la restricción `RF-031` (`HU-03`) no fuera solo un código oculto, sino 100% demostrable en vivo desde la interfaz gráfica. Construimos un componente interactivo en `ProfilePage.tsx` que dispara peticiones reales a `POST /api/v1/compras/validar-permiso-compra-reserva` y muestra en pantalla la respuesta `HTTP 403 Forbidden` (para Admin/Root) o `HTTP 200 OK` (para Cliente).
5. **Botones de Autorelleno de Credenciales Semilla en `LoginPage.tsx`:**
   * *Por qué se tomó:* Para agilizar la sustentación síncrona (evitando perder minutos digitando correos y contraseñas al cambiar entre `ROOT`, `ADMINISTRADOR` y `CLIENTE`), agregamos botones de carga rápida de credenciales de demostración y un script `init_db.py` idempotente que garantiza que las 3 cuentas base siempre existan al arrancar el servidor.

---

## 4. Distribución del Trabajo por Integrante y Cuellos de Botella

### 4.1 Distribución Real del Trabajo (21 SP — 7 SP por Integrante)

| Integrante | Historias Asignadas | Puntos | Aportes Técnicos Principales en el Sprint 1 |
| :--- | :---: | :---: | :--- |
| **Jose David Marín Giraldo** | `HU-04`, `HU-05`, `HU-07` | **7 SP** | Motor criptográfico JWT (`security.py`), inyección de dependencias RBAC (`deps.py`), endpoints `/login`, `/logout` y `/me` (`auth.py`), contexto global `AuthContext.tsx`, despliegue en Vercel/Render/Supabase y `demo_sprint1.ipynb`. |
| **Edwin Osorio Cartagena** | `HU-01`, `HU-06` | **7 SP** | Registro de clientes con validación de DNI/email únicos (`RegisterPage.tsx`), cambio seguro de contraseña con validación de clave actual (`ProfilePage.tsx`) y suite de pruebas automatizadas (`test_sprint1_api.py`). |
| **Maicol Londoño Hernández** | `HU-02`, `HU-03` | **7 SP** | Consola y endpoints exclusivos del Superadmin Root (`admin.py`, `AdminPage.tsx`), guardián de restricción de compras para personal administrativo (`compras.py` / `RF-031`) y contenedorización (`Dockerfile`, `docker-compose.yml`). |

### 4.2 Cuellos de Botella Identificados y Cómo se Resolvieron

1. **Dependencia Secuencial en `HU-04` (Login y Middleware JWT):**
   * *Problema:* Durante los primeros días, Edwin (`HU-06`) y Maicol (`HU-02`, `HU-03`) no podían probar sus endpoints protegidos hasta que el middleware `get_current_user` y la firma JWT (`HU-04`) estuvieran listos.
   * *Solución:* Priorizamos terminar primero el núcleo `security.py` + `deps.py` y publicamos el contrato interactivo en Swagger (`/docs`), lo que destrabó el trabajo en paralelo del resto del equipo.
2. **Sincronización de Variables de Entorno y Ramas en GitHub / Cloud:**
   * *Problema:* Al integrar los cambios de los tres integrantes y conectar Vercel con Render y Supabase, tuvimos errores iniciales de CORS, diferencias en las URLs de base de datos (`postgres://` vs `postgresql://`) y ramas creadas desde GitHub Issues.
   * *Solución:* Normalizamos automáticamente el prefijo `postgresql://` en `session.py`, habilitamos CORS para el dominio de Vercel y acordamos una convención estricta de commits sobre `main` prefijados con `HU-XX:`.

---

## 5. ¿Qué pasa al Backlog del Siguiente Sprint (Nota 3 — Sprint 2)?

Para el **Sprint 2 (Nota 3)**, una vez consolidada y desplegada la capa de usuarios, roles y permisos, pasan al *Sprint Backlog* las historias del **Módulo de Catálogo, Gestión de Libros e Inventario por Ejemplar Físico (~23 a 27 Story Points)**:

1. **`[HU-08]` Consulta y búsqueda avanzada de libros en el catálogo (`RF-001`, `RF-005` — 5 SP):** Búsqueda pública y filtrada por título, autor, ISBN, categoría y precio.
2. **`[HU-09]` / `[HU-10]` Gestión CRUD de libros por Administrador (`RF-001`, `RF-003`, `RF-004` — 5 SP):** Creación, actualización de metadatos/precios y baja lógica de títulos protegida exclusivamente para el rol `ADMINISTRADOR`.
3. **`[HU-10b]` Control de inventario por copia física / ejemplar (`RF-002`, `RF-005` — 5 SP):** Manejo individual de ejemplares (código único, estado nuevo/usado y disponibilidad real en stock).
4. **`[HU-14]` Panel administrativo de existencias y alertas de agotados (`RF-006` — 5 SP):** Vista de control de inventario para el personal de tienda.
5. **`[HU-11]` Base de reserva temporal de ejemplares por 24 horas (`RF-010` — 5 SP):** Inicio de la lógica de bloqueo temporal de stock para clientes autenticados (validada por el middleware `RF-031` construido en este Sprint 1).
