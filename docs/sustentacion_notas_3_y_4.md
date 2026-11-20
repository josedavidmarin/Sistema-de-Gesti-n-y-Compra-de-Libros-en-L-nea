# 🎤 Guía de Sustentación Oficial — Notas 3 y 4 (IS873)
### Preguntas Obligatorias del Docente con Respuestas Técnicas y Evidencias en Vivo
**Universidad Tecnológica de Pereira (UTP) — Facultad de Ingenierías**  
**Asignatura:** IS873 — Laboratorio de Software (Semestre 2026-2)  
**Evaluación Integrada:** Nota 3 (Sprint Review 2 — 20%) + Nota 4 (Sustentación Final — 30%)  
**Equipo:** Jose David Marín Giraldo, Edwin Osorio Cartagena, Maicol Londoño Hernández

---

## 🏛️ Bloque 1 — Sprint Review 2 (Nota 3)

### ❓ Pregunta 10: "Muestre en vivo al menos una prueba fallando intencionalmente (para demostrar que las pruebas realmente prueban algo) y luego pasando."
* **Cómo Demostrarlo en Vivo ante el Profesor:**
  1. Abre la terminal de PowerShell en la raíz del proyecto.
  2. **Paso A (Fallo Intencional Demostrado):** Ejecuta:
     ```cmd
     python tests/test_intentional_failure_demo.py --fail
     ```
     * *Resultado en Pantalla:* La prueba falla con un `AssertionError` explícito:
       > `[FALLO ESPERADO]: Se esperaba HTTP 201 pero el backend protegió el negocio con HTTP 400: Saldo insuficiente en la Billetera Virtual.`
  3. **Paso B (Prueba Real Pasando Exitosamente):** Ejecuta:
     ```cmd
     python tests/test_intentional_failure_demo.py
     ```
     * *Resultado en Pantalla:* La prueba valida correctamente que el sistema rechaza la compra sin fondos y arroja:
       > `-> PASÓ EXITOSAMENTE: El sistema bloqueó la compra sin saldo y protegió la transacción.`
       > `Resultado: TEST PASSED`
* **Explicación Técnica para el Docente:**
  > *"Diseñamos este test para evaluar la regla de negocio RF-037 / HU-10. En modo de fallo intencional demostramos que el test no es un mock complaciente: asume erróneamente que una compra sin fondos retorna 201 Created y falla de inmediato. Al ejecutarlo normalmente, valida la respuesta real HTTP 400 Bad Request, demostrando que la prueba ejerce una aserción real sobre el ciclo de vida del checkout."*

---

### ❓ Pregunta 11: "¿Qué caso borde encontraron ustedes mismos al escribir las pruebas que no habían considerado antes?"
* **Respuesta Técnica:**
  > *"El caso borde más crítico que encontramos fue la **competencia concurrente por el último ejemplar disponible entre carritos no bloqueados**.  
  Originalmente pensamos que bastaba con validar el stock al momento de agregar un libro al carrito. Sin embargo, al escribir la prueba `test_concurrencia_stock_agotado_bloquea_checkout`, descubrimos que si el Cliente A y el Cliente B tienen en su carrito el libro 'Clean Architecture' (del cual solo queda 1 copia física), y el Cliente B confirma su compra un segundo antes, el Cliente A se quedaba con un item en el carrito apuntando a un stock inexistente.  
  Para resolver este caso borde, implementamos en el backend una **transacción atómica con rollback integral (Todo o Nada)**: justo antes de debitar el dinero, el checkout revalida si el conteo de ejemplares `DISPONIBLE` sigue siendo suficiente. Si no lo es, aborta la transacción con **HTTP 409 Conflict**, no debita ni un centavo de la billetera y notifica al cliente para que ajuste su carrito."*

---

### ❓ Pregunta 12: "¿Qué porcentaje del producto actual tiene algún tipo de prueba? ¿Por qué priorizaron probar esas partes y no otras?"
* **Respuesta Técnica:**
  > *"Aproximadamente el **85% de la lógica de negocio y endpoints críticos del sistema** cuenta con pruebas automatizadas (17 pruebas de integración ejecutadas al 100% de éxito en `run_tests.py`).  
  **Priorizamos:**
  1. **Control de Acceso y Políticas de Seguridad (RBAC / RF-031):** Blindar que los Administradores y Root tengan prohibido comprar o reservar inventario.
  2. **Transacciones Financieras y Checkout (RF-013, RF-037):** Garantizar que nunca ocurra sobreventa de ejemplares ni saldos negativos en la Billetera Virtual.
  3. **Trazabilidad de Cancelaciones y Reembolsos (RF-014):** Verificar que cada ejemplar vendido retorne exactamente al estado `DISPONIBLE` y que el saldo vuelva íntegro al cliente.  
  *No priorizamos con pruebas unitarias exhaustivas las consultas puramente cosméticas de lectura (como paginación de imágenes o textos de sinopsis), pues el riesgo de fallo en el valor transaccional del negocio radicaba en la consistencia de inventario y fondos."*

---

### ❓ Pregunta 13: "¿Qué deuda técnica reconocen que están acumulando y cómo la cerraron (o planean cerrar) antes de la entrega final?"
* **Respuesta Técnica:**
  > *"Reconocemos dos deudas técnicas principales:
  1. **Bloqueo a Nivel de Base de Datos para Altísima Concurrencia:** Actualmente la verificación de concurrencia se realiza mediante validación transaccional con rollback en SQLAlchemy. Para millones de peticiones concurrentes, planeamos cerrar esta deuda agregando bloqueo pesimista `SELECT ... FOR UPDATE` en PostgreSQL.
  2. **Desacoplamiento del Servicio de Billetera:** Las operaciones de billetera virtual residen en el mismo enrutador de compras. Para la arquitectura final de microservicios, planeamos desacoplarla en un servicio de pagos independiente."*

---

### ❓ Pregunta 14: "¿Cómo se integra lo construido en este sprint con lo del sprint anterior? Demuéstrelo de punta a punta."
* **Cómo Demostrarlo en Vivo ante el Profesor:**
  1. Inicia sesión con el **Cliente Demo** (`cliente.demo@gmail.com`) creado en el **Sprint 1 (Nota 2)**.
  2. Muestra que conserva su autenticación JWT y su Billetera Virtual con saldo.
  3. Navega al catálogo del **Sprint 2 (Nota 3)**, busca un libro y agrégalo al carrito.
  4. Realiza el checkout: el sistema debita el saldo del usuario del Sprint 1, genera la orden del Sprint 2 y asigna los ejemplares físicos.
  5. Cierra sesión e ingresa como **Administrador** (`admin.bodega@libreria.com`): intenta comprar y demuestra que la política de seguridad del Sprint 1 (**RF-031**) sigue activa e inviolable impidiendo la compra.

---

## 🏛️ Bloque 2 — Sustentación Final (Nota 4)

### ❓ Pregunta 15: "Demo completa de punta a punta: desde la entrada del usuario hasta el resultado final, sin cortes."
* **Guion de la Demo en Vivo (Seguir en orden):**
  1. Ejecuta `start_project.bat` -> se abren backend y frontend automáticamente.
  2. Entra como Visitante anónimo -> explora el catálogo, busca por autor y filtra por género.
  3. Inicia sesión como `cliente.demo@gmail.com`.
  4. Ve a *"Mi Perfil"* y muestra la Billetera Virtual con opción de recarga de saldo.
  5. Añade 2 libros al Carrito de compras.
  6. Ve a *"Carrito"* -> muestra las cantidades, el subtotal y el botón verde *"Pagar con Billetera Virtual"*.
  7. Finaliza la compra -> muestra la pantalla de éxito con el número de orden y los códigos físicos únicos asignados (`LIB-001-EJ001`).
  8. Ve a *"Mis Compras"* -> muestra la orden en estado `EN_PREPARACION` y presiona *"Cancelar Orden y Reembolsar Saldo"*.
  9. Muestra cómo el dinero regresa instantáneamente al saldo de la billetera y el ejemplar vuelve a estar disponible en el catálogo.

---

### ❓ Pregunta 16: "¿Qué parte del alcance original de la Nota 1 se cumplió, qué se recortó, y por qué?"
* **Respuesta Técnica:**
  > *"**Se cumplió el 100% del núcleo transaccional y comercial:** autenticación JWT, RBAC con 4 roles, regla RF-031, catálogo con filtros, carrito persistente, checkout atómico con Billetera Virtual, asignación FIFO de ejemplares físicos únicos y módulo administrativo de inventario.  
  **Qué se recortó:**
  * La integración visual con Google Maps API y pasarelas bancarias externas (PSE/Stripe).  
  * *Motivo:* El Product Owner y los lineamientos del curso priorizaron la Billetera Virtual nativa (RF-037) y el control estricto de concurrencia física por copia única. La pasarela bancaria y el mapa eran componentes satélite que no aportaban valor al cierre contable ni a la prueba de concurrencia."*

---

### ❓ Pregunta 17: "De las tres cosas más difíciles del proyecto, ¿cómo las resolvieron?"
* **Respuesta Técnica:**
  > *"1. **El Control de Concurrencia en Checkout:** Resolver la sobreventa de ejemplares cuando múltiples usuarios compran a la vez. Lo resolvimos adoptando el patrón transaccional 'Todo o Nada' con validación atómica y código de error HTTP 409 Conflict.
  2. **La Arquitectura Híbrida de Persistencia:** Lograr que el sistema corra con un solo comando en local con SQLite sin ninguna instalación externa (`start_project.bat`) y a la vez soporte PostgreSQL en la nube (Supabase). Lo resolvimos desacoplando la capa de base de datos en SQLAlchemy mediante `app/db/session.py`.
  3. **El Cumplimiento Inviolable de la Regla RF-031:** Garantizar que los administradores no puedan comprar ni por interfaz web ni consumiendo la API directamente con curl o Postman. Lo resolvimos implementando la dependencia de seguridad `verify_client_only` en el middleware de FastAPI."*

---

### ❓ Pregunta 18: "Si tuvieran una semana más, ¿en qué la invertirían?"
* **Respuesta Técnica:**
  > *"La invertiríamos en:
  1. Generación y envío automático de la factura / recibo de compra en formato PDF al correo del usuario mediante un servicio SMTP asíncrono.
  2. La reactivación del worker asíncrono en Redis/Celery para reservas en tienda física con expiración a las 24 horas.
  3. Un dashboard administrativo con gráficos en tiempo real sobre ventas por sede y libros con mayor rotación."*

---

### ❓ Pregunta 19: "¿Qué aprendió cada integrante específicamente (no como equipo, sino individualmente)?"
* **Jose David Marín Giraldo:**
  > *"Aprendí a diseñar transacciones concurrentes robustas en SQLAlchemy, implementar seguridad declarativa con JWT en FastAPI y modelar esquemas relacionales que garanticen consistencia física por copia única."*
* **Edwin Osorio Cartagena:**
  > *"Aprendí a estructurar aplicaciones SPA escalables en React con TypeScript estricto, gestionando estados compartidos (como el saldo de la billetera y el carrito) y diseñando interfaces con retroalimentación instantánea."*
* **Maicol Londoño Hernández:**
  > *"Aprendí a diseñar planes de pruebas automatizadas con pytest, identificar casos de borde en concurrencia y formular aserciones que protejan las reglas del negocio ante datos inesperados."*

---

### ❓ Pregunta 20: "¿Qué de lo construido en el Sprint Review 1 y 2 sigue exactamente igual, y qué tuvo que rediseñarse para llegar a esta entrega final?"
* **Respuesta Técnica:**
  > *"**Sigue exactamente igual:** La arquitectura de autenticación JWT, el hashing bcrypt, el modelo de usuarios, los roles RBAC tipados y la dependencia de restricción de compras para administradores (`verify_client_only`).  
  **Tuvo que rediseñarse:** La lógica del carrito de compras y la reserva de stock. En la Nota 1 y 2 habíamos propuesto apartar ejemplares físicos durante 30 minutos desde el carrito. El Product Owner solicitó eliminar dicho bloqueo para permitir carritos persistentes y descontar el inventario de forma exclusiva y atómica en el checkout, lo que requirió rediseñar `CartItem`, los schemas de Pydantic y la transacción en `compras.py`."*

---

### ❓ Pregunta 21: "Siguiendo únicamente el manual de usuario, ¿puede un tercero completar el flujo principal del producto?"
* **Respuesta y Demostración en Vivo:**
  > *"Sí, rotundamente. El manual de usuario bilingüe (`docs/manual_usuario_es_en.md`) fue redactado para un usuario final sin conocimientos técnicos. Cuenta con 7 pasos detallados con figuras legibles, credenciales de prueba preconfiguradas, guía de resolución de errores comunes y tabla de roles. El docente puede elegir al azar cualquier sección (por ejemplo, cómo recargar saldo en la billetera o cómo cancelar un pedido y recibir el reembolso) y comprobar que las instrucciones coinciden al 100% con la interfaz del sistema."*
