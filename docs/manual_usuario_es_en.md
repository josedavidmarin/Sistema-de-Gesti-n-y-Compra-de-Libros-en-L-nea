# 📖 Manual de Usuario Bilingüe / Bilingual User Manual (Nota 4)
### Sistema de Gestión y Compra de Libros en Línea / Online Book Management & Purchasing System
**Universidad Tecnológica de Pereira (UTP) — Facultad de Ingenierías**  
**Programa:** Ingeniería de Sistemas y Computación  
**Asignatura:** IS873 — Laboratorio de Software (2026-2)  
**Control de Versiones:** Versión 2.0.0 (Release Integrado — Notas 3 y 4)  
**Autores:** Jose David Marín Giraldo, Edwin Osorio Cartagena, Maicol Londoño Hernández

---

## 📑 Tabla de Contenido / Table of Contents
* [Parte I: Manual de Usuario en Español](#parte-i-manual-de-usuario-en-español)
  * [1. Introducción y Propósito del Producto](#1-introducción-y-propósito-del-producto)
  * [2. Requisitos Previos](#2-requisitos-previos)
  * [3. Instalación y Primer Arranque](#3-instalación-y-primer-arranque)
  * [4. Roles de Usuario y Permisos](#4-roles-de-usuario-y-permisos)
  * [5. Recorrido Paso a Paso por las Funcionalidades](#5-recorrido-paso-a-paso-por-las-funcionalidades)
  * [6. Mensajes de Error Comunes y Soluciones](#6-mensajes-de-error-comunes-y-soluciones)
  * [7. Preguntas Frecuentes (FAQ)](#7-preguntas-frecuentes-faq)
  * [8. Contacto y Soporte](#8-contacto-y-soporte)
* [Part II: English User Manual](#part-ii-english-user-manual)
  * [1. Introduction and Product Purpose](#1-introduction-and-product-purpose)
  * [2. Prerequisites](#2-prerequisites)
  * [3. Installation and First Startup](#3-installation-and-first-startup)
  * [4. User Roles and Permissions](#4-user-roles-and-permissions)
  * [5. Step-by-Step Feature Walkthrough](#5-step-by-step-feature-walkthrough)
  * [6. Common Error Messages and Troubleshooting](#6-common-error-messages-and-troubleshooting)
  * [7. Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)
  * [8. Support and Contact](#8-support-and-contact)

---

# Parte I: Manual de Usuario en Español

## 1. Introducción y Propósito del Producto


Bienvenido a la **Librería en Línea**, una plataforma web diseñada para facilitar la adquisición y gestión física de libros. Nuestro sistema se destaca por ofrecer:
* **Trazabilidad física real:** Cada copia física de un libro cuenta con un código único de barras (`LIB-XXX-EJYYY`).
* **Carrito de compras sin ataduras:** Puedes guardar libros en tu carrito todo el tiempo que desees; el inventario solo se descuenta cuando confirmas tu compra.
* **Billetera Virtual segura:** Paga de forma instantánea sin intermediarios bancarios y recibe reembolsos automáticos en caso de cancelar un pedido.
* **Transparencia en inventario:** Si un libro se agota mientras lo tienes en el carrito, el sistema te notificará de inmediato sin cobrarte un solo centavo.

---

## 2. Requisitos Previos
Para utilizar el sistema en tu computadora únicamente necesitas:
1. Un navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge o Safari).
2. Conexión a Internet (si usas la versión en la nube en Vercel/Render) o tener instalados Python 3.7+ y Node.js 18+ (si lo corres localmente).

---

## 3. Instalación y Primer Arranque

### Ejecución Local en 1 Paso (Windows):
1. Descarga o clona la carpeta del proyecto en tu equipo.
2. Haz doble clic sobre el archivo ejecutable **`start_project.bat`**.
3. El sistema configurará automáticamente la base de datos, levantará el servidor backend y el portal web, abriendo tu navegador en `http://localhost:5173`.

### Cuentas de Acceso Rápido para Pruebas:
* **Cliente Comprador:** `cliente.demo@gmail.com` / Contraseña: `Cliente2026!` (Saldo inicial: $150.000 COP).
* **Administrador de Bodega:** `admin.bodega@libreria.com` / Contraseña: `Admin2026!`.
* **Superadministrador Root:** `root@libreria.com` / Contraseña: `RootSecure2026!`.

---

## 4. Roles de Usuario y Permisos

| Rol | ¿Puede comprar libros? | ¿Puede administrar catálogo? | ¿Puede crear administradores? |
| :--- | :---: | :---: | :---: |
| **Visitante** | Solo lectura (debe registrarse) | No | No |
| **Cliente** | **Sí (mediante Billetera Virtual)** | No | No |
| **Administrador** | **No (Prohibido por regla RF-031)** | **Sí (Altas, bajas y ejemplares)** | No |
| **Root (Superadmin)** | **No (Prohibido por regla RF-031)** | **Sí (Auditoría total)** | **Sí (Exclusivo RF-030)** |

---

## 5. Recorrido Paso a Paso por las Funcionalidades

### Paso 1: Exploración y Búsqueda en el Catálogo
Al ingresar a la plataforma, verás el catálogo con las portadas de los libros, precios en pesos colombianos (COP), autores y la disponibilidad de ejemplares en tiempo real.
* Utiliza la barra de búsqueda para escribir palabras clave como *"Clean Architecture"* o *"García Márquez"*.
* Filtra por categorías haciendo clic en las etiquetas (*"Ingeniería de Software"*, *"Literatura Latinoamericana"*, etc.).
* Activa la casilla *"Con Stock Disponible"* para ocultar títulos agotados.

*(Figura 1: Vista principal del Catálogo de Libros con buscador y filtros en tiempo real).*
<p align ="center">
<img width="881" height="487" alt="pagina_inicial" src="https://github.com/user-attachments/assets/c60cabf6-5cca-4c11-a0f3-fb04aa43b696" />
</p>

### Paso 2: Agregar Libros al Carrito de Compras
1. En la tarjeta del libro deseado, haz clic en el botón azul **"Agregar"**.
2. Verás una notificación emergente confirmando que el libro ha sido añadido a tu carrito.
3. Puedes agregar hasta un máximo de **3 unidades por título**, respetando las políticas de compra justa de la librería.
4. Recuerda: tener libros en el carrito **no descuenta el inventario físico**. Puedes dejarlos allí el tiempo que desees.

*(Figura 2: Selector interactivo del carrito de compras con control de unidades).*
<p align="center">
<img width="772" height="661" alt="agregar" src="https://github.com/user-attachments/assets/e7d88c7e-0e84-451a-bb4b-015f211c578d" />
</p>


### Paso 3: Revisión del Carrito y Verificación de Billetera
1. Haz clic en el enlace **"Carrito"** en la barra superior.
2. Podrás aumentar o disminuir la cantidad con los botones `+` y `-`, o eliminar un libro con el icono de papelera.
3. En la columna derecha verás:
   * El total acumulado a pagar.
   * El saldo actual de tu **Billetera Virtual**. Si tu saldo es suficiente, verás un indicador verde; de lo contrario, una advertencia indicando cuánto dinero te falta.
   * Campo para ingresar o modificar tu **Dirección de Envío**.


*(Figura 3: Resumen del Carrito de Compras y balance de fondos del cliente).*

<p align="center">
  <img width="772" height="661" alt="resumen_carrito" src="https://github.com/user-attachments/assets/3b9ba7ed-298e-4304-b667-751b7fd1d26a" />
</p>

---

### Paso 4: Finalizar Compra (Checkout Atómico)
1. Con saldo suficiente y dirección confirmada, pulsa el botón verde **"Pagar con Billetera Virtual"**.
2. El sistema ejecutará una verificación atómica instantánea:
   * **Si hay ejemplares físicos disponibles:** Se debitará el dinero de tu saldo, los ejemplares pasarán a estado `VENDIDO`, y el sistema te mostrará la pantalla de confirmación con el número de orden y los códigos únicos asignados (ej. `LIB-001-EJ001`).
   * **Si otro cliente compró el último ejemplar disponible justo antes:** El sistema cancelará la operación de inmediato, **NO** te cobrará nada y te mostrará el mensaje: *"El ejemplar del libro [Título] se encuentra agotado o con stock insuficiente."*

*(Figura 4: Pantalla de confirmación de orden exitosa con códigos físicos únicos).*
<p align="center">
  <img width="542" height="461" alt="pagar2" src="https://github.com/user-attachments/assets/50f2b109-0349-4315-a50e-161b87aa2052" />
</p>

---

### Paso 5: Consulta de Historial y Cancelación de Pedidos
1. Ingresa a la sección **"Mis Compras"** en el menú de navegación.
2. Cada orden muestra su fecha, dirección de despacho, monto total y el desglose de códigos físicos únicos de los ejemplares adquiridos.
3. Si la orden se encuentra en estado **`EN_PREPARACION`**, tendrás habilitado el botón **"Cancelar Orden y Reembolsar Saldo"**.
4. Al hacer clic y confirmar:
   * El 100% del dinero se reintegra al instante a tu Billetera Virtual.
   * Los ejemplares físicos vuelven al estado `DISPONIBLE` para que otros clientes puedan comprarlos.
   * La orden queda marcada permanentemente como `CANCELADA`.

*(Figura 5: Vista de Mis Compras con detalle de ejemplar físico y botón de anulación).*
<p align="center">
  <img width="342" height="261" lt="paso 5" src="https://github.com/user-attachments/assets/4909538c-0cf4-4676-8e10-7f71146434ec" />
 <img width="342" height="261" alt="paso 5_1" src="https://github.com/user-attachments/assets/2d5c1f34-4f0b-4d82-a3f8-9dacb3ebb9bf" />
 <img width="442" height="361" alt="paso 5_2" src="https://github.com/user-attachments/assets/9449406d-7b55-45a5-9280-25ec6f214dcd" />
</p>

---

### Paso 6: Recarga de Saldo en Billetera Virtual (RF-037)
1. Ve a **"Mi Perfil"** en la barra superior.
2. En la tarjeta de **Monedero Virtual**, haz clic en el botón verde **"Recargar Billetera"**.
3. Selecciona un valor rápido ($50.000, $100.000, $200.000 COP) o escribe un monto personalizado.
4. Presiona **"Confirmar Recarga"** y tu saldo se actualizará al instante para seguir comprando.
<p align="center">
  <img width="342" height="261" alt="paso 6" src="https://github.com/user-attachments/assets/84df83b2-2ce5-45aa-97db-92c8e64e7eb5" />
 <img width="342" height="261" alt="paso 6_1" src="https://github.com/user-attachments/assets/b3083182-4b6d-44ba-9352-ba2a802fe29a" />
 <img width="442" height="361" alt="paso 6_2" src="https://github.com/user-attachments/assets/c3044179-00a2-4c9d-abf7-da41a95b2b4c" />
</p>

---
### Paso 7: Administración de Inventario Físico (Solo Administradores y Root)
1. Inicia sesión con credenciales de Administrador o Root.
2. En la barra superior aparecerá la pestaña **"Inventario Físico"**.
3. En esta pantalla podrás:
   * **Registrar un nuevo libro:** Pulsa *"Nuevo Libro"*, completa ISBN, título, autor, precio y cantidad inicial de ejemplares.
   * **Añadir nuevos ejemplares a un título existente:** Selecciona el libro y presiona *"Añadir Copias"*. El sistema generará correlativamente los nuevos códigos `LIB-XXX-EJYYY`.
   * **Dar de baja un ejemplar físico (RF-004):** Si una copia física se deteriora o extravía, pulsa *"Dar de Baja"* e ingresa el motivo. Si era la última copia disponible, el libro se marcará automáticamente como *"Agotado"*.

*(Figura 6: Panel de gestión de inventario y ejemplares físicos para administradores).*
<p align="center">
  <img width="342" height="261" alt="paso 7" src="https://github.com/user-attachments/assets/19551058-c998-4c90-8de4-31f27eaf058d"  />
 <img width="342" height="261" alt="paso 7_1" src="https://github.com/user-attachments/assets/90c64ffe-a350-4d4e-a8e4-e066ab549b50" />
 <img width="442" height="361" alt="paso 7_3" src="https://github.com/user-attachments/assets/53db6af9-c8b9-4f2e-9fe2-90c56a3dadca" />
</p>
---

## 6. Mensajes de Error Comunes y Soluciones

| Mensaje de Error | Causa | Solución Paso a Paso |
| :--- | :--- | :--- |
| **"Saldo insuficiente en la Billetera Virtual"** | El total de tu carrito supera el saldo disponible. | Ve a *"Mi Perfil"*, pulsa *"Recargar Billetera"*, añade fondos y reintenta el checkout. |
| **"⚠️ Conflicto de Stock: El libro se encuentra agotado"** | Otro cliente compró el último ejemplar mientras tenías el libro en el carrito. | Revisa el carrito, ajusta la cantidad o elimina el libro agotado para continuar con el resto. |
| **"Business Restriction (RF-031): Users with role 'ADMINISTRADOR' are strictly prohibited..."** | Intentaste agregar al carrito o comprar estando conectado como Administrador o Root. | Cierra sesión e inicia con tu cuenta personal de Cliente (`cliente.demo@gmail.com`). |
| **"No se puede cancelar una orden con estado ENVIADO"** | El pedido ya salió de la bodega y no admite anulación automática. | Comunícate con soporte al cliente para gestionar una devolución física tras la entrega. |
| **"El documento de identidad o correo ya se encuentra registrado"** | Intentaste crear una cuenta con un DNI o correo ya existente. | Usa tus credenciales existentes en *"Iniciar Sesión"* o regístrate con datos distintos. |

---

## 7. Preguntas Frecuentes (FAQ)

* **¿Cuánto tiempo duran los libros guardados en mi carrito?**
  * Permanecen indefinidamente mientras no los elimines o limpies tu sesión. Sin embargo, no apartan stock; te recomendamos comprar pronto para que otro usuario no agote los ejemplares disponibles.
* **¿Qué pasa si compro varios libros y uno solo se agota?**
  * El sistema opera bajo el principio *Todo o Nada*: la compra no se procesa, ningún dinero se cobra y se te notifica cuál es el libro agotado para que decidas si ajustas el pedido.
* **¿Cómo sé qué copia física exacta recibí?**
  * Cada libro físico que te entregamos lleva una etiqueta con un código único (por ejemplo, `LIB-002-EJ001`). Ese mismo código aparece en tu historial de *"Mis Compras"*.
* **¿El reembolso es inmediato si cancelo?**
  * Sí. Al pulsar *"Cancelar Orden"*, los fondos se acreditan inmediatamente en tu Monedero Virtual.

---

## 8. Contacto y Soporte
* **Mesa de Ayuda:** `soporte.libreria@utp.edu.co`
* **Facultad de Ingenierías:** Edificio de Sistemas, Universidad Tecnológica de Pereira (Pereira, Risaralda, Colombia).
* **Línea de Atención:** +57 (6) 313-7300.

---
---

# Part II: English User Manual

## 1. Introduction and Product Purpose
Welcome to the **Online Book Management & Purchasing System**, an omnichannel web solution engineered to streamline book catalog exploration, order fulfillment, and physical inventory control. Key system highlights:
* **Unique Physical Copy Traceability:** Every physical book copy carries a distinctive barcode identifier (`LIB-XXX-EJYYY`).
* **Unrestricted Shopping Cart:** Books can remain in your shopping cart indefinitely without early stock lock; physical inventory is deducted only upon checkout confirmation.
* **Integrated Virtual Wallet:** Instant checkout with zero third-party payment delays and immediate balance refunds upon cancellation.
* **Concurrency Protection (All or Nothing):** If a title runs out of stock while in your cart, checkout is cleanly aborted with an informative alert without deducting any funds.

---

## 2. Prerequisites
To use the application, you only need:
1. A modern web browser (Google Chrome, Firefox, Edge, or Safari).
2. Internet access (for the cloud deployment) or Python 3.7+ and Node.js 18+ (for local self-hosted execution).

---

## 3. Installation and First Startup

### 1-Click Local Execution (Windows):
1. Clone or download the repository to your local drive.
2. Double-click the **`start_project.bat`** script.
3. The automated runner will set up virtual environments, database seeds, FastAPI backend on port 8000, Vite React frontend on port 5173, and open your browser automatically.

### Pre-Seeded Demo Credentials:
* **Customer Account:** `cliente.demo@gmail.com` / Password: `Cliente2026!` (Initial Balance: $150,000 COP).
* **Warehouse Administrator:** `admin.bodega@libreria.com` / Password: `Admin2026!`.
* **Root Superadministrator:** `root@libreria.com` / Password: `RootSecure2026!`.

---

## 4. User Roles and Permissions

| Role | Allowed to Purchase? | Allowed to Manage Catalog? | Allowed to Create Admins? |
| :--- | :---: | :---: | :---: |
| **Visitor** | Read-only (Must register) | No | No |
| **Customer** | **Yes (via Virtual Wallet)** | No | No |
| **Administrator** | **No (Forbidden by Rule RF-031)** | **Yes (Catalog, copies, decommission)** | No |
| **Root Superadmin** | **No (Forbidden by Rule RF-031)** | **Yes (Complete audit access)** | **Yes (Exclusive RF-030)** |

---

## 5. Step-by-Step Feature Walkthrough

### Step 1: Browsing and Searching the Catalog
Upon loading the homepage, the real-time catalog presents titles, cover artwork, authors, prices in Colombian Pesos (COP), and available physical copy counters.
* Use the search bar to enter keywords such as *"Clean Architecture"* or *"García Márquez"*.
* Filter by categories clicking the pill buttons (*"Software Engineering"*, *"Latin American Literature"*, etc.).
* Toggle *"In Stock Only"* to hide titles with zero available copies.

*(Figure 1: Main Catalog view with live search and category filters).*

---

### Step 2: Adding Titles to the Shopping Cart
1. Click the blue **"Add"** button on the target book card.
2. A confirmation banner will notify that the book is now in your cart.
3. You may add up to a maximum of **3 units per title** according to store policy.
4. Note: Adding to cart **does not lock physical inventory**. Titles can remain in your cart as long as you wish.

*(Figure 2: Interactive cart quantity selector with 3-unit business cap).*

---

### Step 3: Reviewing the Cart and Checking Wallet Balance
1. Navigate to the **"Cart"** section via the top navigation bar.
2. Adjust item quantities using `+` and `-`, or discard items via the trash icon.
3. The right-hand column presents:
   * Order subtotal and quantity breakdown.
   * Your current **Virtual Wallet Balance**. A green indicator confirms sufficient funds; otherwise, a red warning specifies the required difference.
   * Delivery address input (pre-filled from your profile).

*(Figure 3: Shopping Cart summary and customer wallet balance check).*

---

### Step 4: Completing Checkout (Atomic Concurrency)
1. When your wallet balance is sufficient, click the green **"Pay with Virtual Wallet"** button.
2. An atomic ACID transaction executes:
   * **If physical copies remain available:** Funds are deducted from your wallet, physical copies transition to `VENDIDO` (Sold), and a confirmation screen displays your Order ID and assigned unique copy barcodes (e.g., `LIB-001-EJ001`).
   * **If another customer purchased the final copy beforehand:** The transaction aborts immediately with HTTP 409 Conflict, **NO funds are deducted**, and an informative notification guides you to adjust your cart.

*(Figure 4: Order confirmation receipt with physical barcode allocations).*

---

### Step 5: Order History and Cancellation with Immediate Refund
1. Access **"My Orders"** from the navigation bar.
2. Every order provides complete timestamps, shipping destination, total amount, and assigned physical barcode tags.
3. While an order remains in **`EN_PREPARACION`** status, the **"Cancel Order & Refund Wallet"** button is active.
4. Upon cancellation:
   * 100% of the purchase amount is credited back to your Virtual Wallet instantly.
   * Sold physical copies return to `DISPONIBLE` status.
   * Order status updates permanently to `CANCELADA`.

*(Figure 5: Order history with physical barcodes and cancellation trigger).*

---

### Step 6: Virtual Wallet Top-Up (RF-037)
1. Go to **"My Profile"** in the top navigation bar.
2. Under the **Virtual Wallet** card, click the green **"Top-Up Wallet"** button.
3. Select a preset amount ($50,000, $100,000, $200,000 COP) or type a custom amount.
4. Click **"Confirm Top-Up"** to update your spending balance immediately.

---

### Step 7: Physical Inventory Administration (Admins & Root Only)
1. Log in with an Administrator or Root account.
2. Click the **"Physical Inventory"** tab in the navigation bar.
3. This view enables:
   * **Registering new books:** Click *"New Book"* and supply bibliographic info, price, and initial copy count.
   * **Adding physical copies:** Select an existing title and click *"Add Copies"*. The system sequentially issues `LIB-XXX-EJYYY` codes.
   * **Decommissioning damaged copies (RF-004):** Discontinue damaged or lost physical copies specifying a justification reason.

*(Figure 6: Administrative inventory management and physical copy tracking).*

---

## 6. Common Error Messages and Troubleshooting

| Error Message | Cause | Resolution |
| :--- | :--- | :--- |
| **"Insufficient balance in Virtual Wallet"** | Order total exceeds available wallet funds. | Go to *"My Profile"*, click *"Top-Up Wallet"*, add funds, and resume checkout. |
| **"⚠️ Stock Conflict: Book is currently out of stock"** | Another user completed checkout for the last copy while it was in your cart. | Check your cart, adjust quantity or remove the exhausted item to proceed. |
| **"Business Restriction (RF-031): Users with role 'ADMINISTRADOR' are strictly prohibited..."** | Attempted to buy books using an administrative or root staff account. | Sign out and sign in using a legitimate Customer account (`cliente.demo@gmail.com`). |
| **"Cannot cancel an order with status ENVIADO"** | The order has already been dispatched from warehouse. | Contact customer support to arrange a physical return upon delivery. |

---

## 7. Frequently Asked Questions (FAQ)

* **How long can books remain in my shopping cart?**
  * Indefinitely. However, stock is not reserved until checkout. We recommend purchasing promptly to prevent copies from running out.
* **What happens if one book out of three in my cart sells out?**
  * The system enforces an *All-or-Nothing* policy: the transaction aborts cleanly, no money is charged, and you are notified which item is missing.
* **How do I verify which exact copy I received?**
  * Each physical book delivered features an adhesive barcode (e.g., `LIB-002-EJ001`), which matches the barcode registered in your *"My Orders"* receipt.
* **Is the refund immediate when canceling an order?**
  * Yes. The full purchase total is refunded back to your Virtual Wallet instantly upon cancellation.

---

## 8. Support and Contact
* **Helpdesk:** `soporte.libreria@utp.edu.co`
* **Faculty of Engineering:** Systems Engineering Building, Universidad Tecnológica de Pereira (Pereira, Colombia).
* **Phone Support:** +57 (6) 313-7300.
