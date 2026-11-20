# 🔄 Retrospectiva del Equipo de Desarrollo (Nota 4)
### Asignatura: IS873 — Laboratorio de Software (Semestre 2026-2)
**Universidad Tecnológica de Pereira (UTP) — Facultad de Ingenierías**  
**Programa:** Ingeniería de Sistemas y Computación  
**Evaluación:** Nota 4 de 4 (Entrega Final del Producto — 1 a 2 páginas)  
**Fecha:** 1 de diciembre de 2026

---

### 👥 Integrantes del Equipo:
* **Jose David Marín Giraldo** (`josedavid.marin@utp.edu.co`)
* **Edwin Osorio Cartagena**
* **Maicol Londoño Hernández**

---

## 1. 🌟 Qué Funcionó Bien Durante el Semestre

1. **Diseño Desacoplado y Arquitectura Limpia:**
   * La separación estricta entre capa de presentación (React + Tailwind CSS), capa de servicios API (FastAPI con Pydantic) y capa de persistencia (SQLAlchemy ORM) permitió que los integrantes trabajáramos simultáneamente en frontend, endpoints y pruebas sin colisionar en código.
2. **Cultura de Pruebas Automatizadas desde el Inicio:**
   * Desarrollar una suite de pruebas de integración con `TestClient` de FastAPI y `pytest` desde el Sprint 1 ahorró incontables horas de depuración. Cualquier cambio en las reglas de negocio (como el rediseño del carrito) se validó de inmediato con `python run_tests.py`, asegurando que no existieran regresiones.
3. **Control de Acceso Basado en Roles (RBAC) Robusto:**
   * La implementación del decorador de seguridad y las dependencias de FastAPI (`verify_client_only`, `require_roles`) garantizó el cumplimiento inviolable de la regla de negocio **RF-031**, impidiendo que cuentas administrativas compren inventario.
4. **Colaboración Ágil y Adaptabilidad:**
   * Cuando el Product Owner solicitó cambiar la estrategia de bloqueo de ejemplares en el carrito, el equipo fue capaz de ajustar los modelos, endpoints y vistas en menos de 48 horas sin comprometer las fechas de entrega.

---

## 2. ⚠️ Qué NO Funcionó Bien y Cuellos de Botella Enfrentados

1. **Gestión de Ramas y Sincronización en Git:**
   * Al inicio del semestre, cuando varios integrantes subieron cambios simultáneamente, se generaron bifurcaciones y desalineaciones de ramas en GitHub. Tuvimos que dedicar sesiones de emergencia para consolidar y estandarizar el flujo hacia una sola rama principal (`main`).
2. **Subestimación de la Complejidad de la Concurrencia en Checkout:**
   * Inicialmente concebimos el carrito con un bloqueo de 30 minutos por ejemplar físico. Al modelarlo en base de datos, nos dimos cuenta de que requería un worker asíncrono para liberar reservas expiradas y abría la puerta a ataques de agotamiento artificial de inventario. El rediseño hacia "Todo o Nada" en el checkout resolvió el problema pero requirió refactorizar schemas y pruebas.
3. **Curva de Aprendizaje con ReportLab y Generación de PDF:**
   * La creación programática de los documentos PDF para las entregas académicas mediante scripts de ReportLab consumió más tiempo del presupuestado debido al cálculo manual de saltos de página y anchos de tabla.

---

## 3. 🚀 Qué Haríamos Distinto si Empezáramos de Nuevo

1. **Definir Contratos de API (OpenAPI Specs) Antes de Codificar:**
   * Habríamos acordado los schemas JSON exactos entre frontend y backend desde el Día 1. En el Sprint 1 tuvimos que ajustar nombres de campos menores (como `/register` vs `/registro`) que habrían sido triviales con un enfoque *API-First*.
2. **Adoptar Docker y Contenedores desde el Sprint 1:**
   * Aunque construimos `start_project.bat` que funciona a la perfección en Windows, contar con `docker-compose` estandarizado para todo el equipo desde la primera semana habría eliminado discrepancias menores entre versiones de Python y librerías locales.
3. **Planificar el Manual de Usuario en Paralelo al Desarrollo de las Vistas:**
   * Dejar la redacción del manual bilingüe para la recta final generó una sobrecarga de trabajo. Capturar las pantallas conforme se aprueba cada vista en el sprint es una práctica mucho más eficiente.

---

## 4. 💳 Manejo de Deuda Técnica Reconocida

* **Deuda Técnica Reconocida:** 
  * En el backend actual, la consulta de concurrencia al momento del checkout se ejecuta dentro de la transacción de SQLAlchemy verificando el conteo de copias `DISPONIBLE`. Si bien es 100% segura para la carga actual y SQLite/PostgreSQL, bajo millones de transacciones por segundo se beneficiaría de un bloqueo pesimista explícito a nivel de fila (`SELECT ... FOR UPDATE`) o una cola de transacciones con Redis.
* **Cómo se Mitigó:**
  * Se implementó una verificación atómica con rollback integral: si un ejemplar no está disponible, ningún dato se escribe en la base de datos y ningún saldo se debita, garantizando consistencia ACID estricta.

---

## 5. 🧑‍💻 Aprendizaje Individual por Integrante

* **Jose David Marín Giraldo:**
  > *"Profundicé en el manejo de transacciones ACID, control de concurrencia en bases de datos relacionales, JWT claims tipados y la arquitectura de dependencias de FastAPI. Aprendí que la simplicidad en la lógica de negocio (como el patrón Todo o Nada) suele ser superior y más mantenible que mecanismos complejos con timers distribuidos."*
* **Edwin Osorio Cartagena:**
  > *"Consolidé mis habilidades en el desarrollo de SPAs con React 18, TypeScript estricto y Tailwind CSS, dominando el estado reactivo entre componentes desacoplados (como el saldo de la billetera en el Navbar y la actualización en vivo del carrito) y la experiencia de usuario orientada a retroalimentación inmediata."*
* **Maicol Londoño Hernández:**
  > *"Me especialicé en el diseño de suites automatizadas de pruebas con pytest, pruebas de estrés para casos borde de sobreventa de inventario, y la formulación de planes de prueba repetibles y trazables frente a criterios de aceptación formales."*

---

## 6. ⏱️ Si Tuviéramos una Semana Más...
Si contáramos con una semana adicional de desarrollo, la invertiríamos en:
1. **Notificaciones por Correo Electrónico:** Envío automático del comprobante de compra en PDF al correo del cliente al finalizar el checkout.
2. **Worker Asíncrono para Reservas de 24 Horas:** Integrar Redis y Celery para ofrecer la modalidad de reserva física en tienda con caducidad autónoma para usuarios que prefieren pagar en efectivo en el mostrador.
3. **Panel Gráfico de Métricas de Venta para Administradores:** Gráficas interactivas con Chart.js mostrando los libros más vendidos, géneros con mayor rotación y tasa de cancelaciones.
