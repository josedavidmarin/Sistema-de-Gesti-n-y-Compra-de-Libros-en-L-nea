# Prueba de Concepto (PoC) — Validación de Concurrencia y Scheduler de Reservas

**Asignatura:** IS873 – Laboratorio de Software (UTP)  
**Semestre:** 2026-2  
**Proyecto:** Sistema de Gestión y Compra de Libros en Línea  
**Equipo:** Jose David Marin Giraldo, Edwin Osorio Cartagena, Maicol Londono Hernandez 

---

## 1. Identificación del Supuesto Técnico más Riesgoso

###  Formulación de la Hipótesis de Riesgo
> *«¿Es posible garantizar la consistencia atómica y erradicar condiciones de carrera (sobreventas) bajo alta concurrencia de clientes reservando ejemplares físicos únicos, mientras un proceso asíncrono (Scheduler) en segundo plano libera automáticamente el stock retenido al expirar las 24 horas sin provocar bloqueos mutuos ni inconsistencias en la base de datos?»*

###  ¿Por qué es el mayor riesgo técnico del proyecto?
1. **Doble reserva simultánea:** Si dos o más clientes intentan apartar la última copia física en el mismo milisegundo, un sistema sin aislamiento transaccional estricto generará reservas duplicadas sobre un ejemplar físico inexistente.
2. **Desincronización de inventario:** La separación arquitectónica entre el título bibliográfico (`Libro`) y la copia física individual (`Ejemplar`) exige que cada cambio de estado (`DISPONIBLE`, `RESERVADO`, `VENDIDO`) actualice de forma síncrona y atómica el contador visible de stock.
3. **Liberación autónoma sin operador humano:** La regla de negocio central exige que el stock no quede secuestrado; un scheduler debe consultar periódicamente la base de datos, expirar reservas y restaurar inventario sin interferir con compras activas.

---

## 2. Descripción del Artefacto Mínimo

El script `poc_reserva_concurrencia.py` constituye un **artefacto mínimo reproducible** desarrollado en Python 3 que simula:
* **Modelo Relacional Transaccional:** Esquema SQLite en modo WAL con claves foráneas simulando el comportamiento ACID de PostgreSQL (`libros`, `ejemplares`, `reservas`).
* **Prueba de Estrés Concurrente (Fase 1):** Un pool de 10 hilos simultáneos compitiendo al mismo milisegundo por un libro con **únicamente 2 copias disponibles**.
* **Worker Asíncrono de Liberación (Fase 2):** Rutina en segundo plano que detecta reservas con `fecha_expiracion <= NOW()`, actualiza su estado a `EXPIRADA` y reintegra las existencias.
* **Comprobación de Disponibilidad (Fase 3):** Admisión inmediata de un nuevo cliente que reserva el ejemplar liberado.

---

## 3. Alcance de la Prueba: Qué Valida y Qué NO Valida

###  Lo que SÍ Valida este Artefacto:
* **Erradicación de sobreventas:** De 10 peticiones concurrentes, exactamente 2 son aprobadas y 8 son rechazadas limpiamente por agotamiento de existencias.
* **Consistencia transaccional ACID:** El stock pasa de 2 a 0 sin inconsistencias y cada ejemplar queda asociado a un único cliente.
* **Autonomía del Scheduler:** La tarea programada identifica las reservas vencidas y restaura el stock a 2 ejemplares de forma transparente.
* **Tiempo de respuesta:** La resolución de 10 transacciones concurrentes toma menos de 35 milisegundos.

###  Lo que NO Valida Todavía (Deuda para Notas posteriores):
* **No incluye interfaz gráfica de usuario:** No contiene el frontend en React ni los componentes visuales de Tailwind CSS.
* **No implementa la pasarela de pagos:** No realiza la llamada HTTPS al servicio de tokenización de tarjetas.
* **No utiliza PostgreSQL en la nube:** Emplea SQLite local como emulador de base de datos relacional para garantizar portabilidad inmediata durante la sustentación.
* **No envía correos reales:** No despacha el correo electrónico con el código QR ni notificaciones SMTP.

---

## 4. Instrucciones de Ejecución

Para ejecutar la prueba en cualquier terminal con Python 3 instalado:

```bash
cd "C:\backup D\Desktop\U\LAB\PoC_Riesgo_Tecnico"
python poc_reserva_concurrencia.py
```

### Salida Esperada en Consola:
```text
===========================================================================
  PRUEBA DE CONCEPTO (PoC) — LABORATORIO DE SOFTWARE IS873 (UTP)
  Validación de Concurrencia de Inventario y Scheduler de Reservas (24h)
===========================================================================

[ESTADO INICIAL]
• Libro: 'Clean Architecture - Robert C. Martin'
• Stock físico disponible: 2 ejemplares

---------------------------------------------------------------------------
FASE 1: 10 clientes intentan reservar simultáneamente (Solo hay 2 copias)
---------------------------------------------------------------------------
  [APROBADA]  Cliente_01: Reserva exitosa -> Ejemplar EJEMP-001
  [APROBADA]  Cliente_02: Reserva exitosa -> Ejemplar EJEMP-002
  [RECHAZADA] Cliente_03: Sin stock disponible
  [RECHAZADA] Cliente_04: Sin stock disponible
  ... (8 clientes rechazados)

* Metricas Fase 1:
  - Tiempo total de procesamiento concurrente: ~27 ms
  - Solicitudes aprobadas: 2 (Esperado: 2)
  - Solicitudes rechazadas por falta de stock: 8 (Esperado: 8)
  - Stock actual en base de datos: 0 (Sin sobreventas)
  -> CONCLUSION FASE 1: Se erradico la sobreventa; consistencia ACID verificada.

---------------------------------------------------------------------------
FASE 2: Ejecucion del Scheduler en segundo plano (Simulacion paso de 24h)
---------------------------------------------------------------------------
* El worker se despierta y revisa reservas vencidas...
* Reservas vencidas identificadas y liberadas: 2
* Stock fisico restaurado tras la expiracion: 2 ejemplares
  -> CONCLUSION FASE 2: El scheduler libero el stock automaticamente sin intervencion humana.

---------------------------------------------------------------------------
FASE 3: Nuevo cliente intenta reservar tras la liberacion del scheduler
---------------------------------------------------------------------------
  [APROBADA]  Cliente_11_Nuevo: Reserva exitosa -> Ejemplar EJEMP-001

===========================================================================
  RESULTADO GENERAL DE LA PoC: SUPUESTO TECNICO VALIDADO CON EXITO
===========================================================================
```
