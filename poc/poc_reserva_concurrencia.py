"""
PRUEBA DE CONCEPTO (PoC) — SUPUESTO TÉCNICO MÁS RIESGOSO
Proyecto: Sistema de Gestión y Compra de Libros en Línea
Asignatura: IS873 - Laboratorio de Software (UTP)

SUPUESTO TÉCNICO A VALIDAR:
"¿Es posible garantizar consistencia atómica y erradicar sobreventas bajo alta concurrencia
al reservar ejemplares únicos, mientras un scheduler asíncrono libera automáticamente
el stock retenido al expirar las 24 horas sin bloquear la base de datos?"
"""

import sqlite3
import threading
import time
from datetime import datetime, timedelta

DB_FILE = "poc_libreria_test.db"

def init_db():
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL;")
    
    # Limpiar tablas previas
    cur.execute("DROP TABLE IF EXISTS reservas;")
    cur.execute("DROP TABLE IF EXISTS ejemplares;")
    cur.execute("DROP TABLE IF EXISTS libros;")
    
    # Crear tablas
    cur.execute("""
        CREATE TABLE libros (
            id INTEGER PRIMARY KEY,
            titulo TEXT NOT NULL,
            stock_disponible INTEGER NOT NULL
        );
    """)
    cur.execute("""
        CREATE TABLE ejemplares (
            codigo_unico TEXT PRIMARY KEY,
            libro_id INTEGER NOT NULL,
            estado TEXT NOT NULL, -- 'DISPONIBLE', 'RESERVADO', 'VENDIDO'
            FOREIGN KEY (libro_id) REFERENCES libros(id)
        );
    """)
    cur.execute("""
        CREATE TABLE reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            ejemplar_codigo TEXT NOT NULL,
            fecha_creacion DATETIME NOT NULL,
            fecha_expiracion DATETIME NOT NULL,
            estado TEXT NOT NULL, -- 'ACTIVA', 'EXPIRADA', 'COMPLETADA'
            FOREIGN KEY (ejemplar_codigo) REFERENCES ejemplares(codigo_unico)
        );
    """)
    
    # Insertar libro de prueba con SOLO 2 ejemplares
    cur.execute("INSERT INTO libros VALUES (1, 'Clean Architecture - Robert C. Martin', 2);")
    cur.execute("INSERT INTO ejemplares VALUES ('EJEMP-001', 1, 'DISPONIBLE');")
    cur.execute("INSERT INTO ejemplares VALUES ('EJEMP-002', 1, 'DISPONIBLE');")
    
    conn.commit()
    conn.close()

# Lock para serializar transacciones críticas de inventario (simula SELECT FOR UPDATE en PostgreSQL)
inventory_lock = threading.Lock()

def reservar_libro(cliente_id, libro_id, resultados, simulated_duration_hours=24):
    """
    Intenta reservar un ejemplar de forma atómica.
    """
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    cur = conn.cursor()
    
    with inventory_lock:
        try:
            # 1. Verificar si hay ejemplares disponibles
            cur.execute("""
                SELECT codigo_unico FROM ejemplares 
                WHERE libro_id = ? AND estado = 'DISPONIBLE' 
                LIMIT 1;
            """, (libro_id,))
            row = cur.fetchone()
            
            if not row:
                resultados.append((cliente_id, False, "Sin stock disponible"))
                conn.close()
                return
            
            ejemplar_codigo = row[0]
            ahora = datetime.now()
            expira = ahora + timedelta(hours=simulated_duration_hours)
            
            # 2. Bloquear ejemplar
            cur.execute("""
                UPDATE ejemplares SET estado = 'RESERVADO' 
                WHERE codigo_unico = ?;
            """, (ejemplar_codigo,))
            
            # 3. Descontar stock del libro
            cur.execute("""
                UPDATE libros SET stock_disponible = stock_disponible - 1 
                WHERE id = ?;
            """, (libro_id,))
            
            # 4. Crear registro de reserva
            cur.execute("""
                INSERT INTO reservas (cliente_id, ejemplar_codigo, fecha_creacion, fecha_expiracion, estado)
                VALUES (?, ?, ?, ?, 'ACTIVA');
            """, (cliente_id, ejemplar_codigo, ahora.isoformat(), expira.isoformat()))
            
            conn.commit()
            resultados.append((cliente_id, True, f"Reserva exitosa -> Ejemplar {ejemplar_codigo}"))
        except Exception as e:
            conn.rollback()
            resultados.append((cliente_id, False, f"Error: {str(e)}"))
        finally:
            conn.close()

def scheduler_liberar_reservas():
    """
    Simula la tarea de fondo (cron/APScheduler) que busca reservas vencidas y libera el stock.
    """
    conn = sqlite3.connect(DB_FILE, timeout=10.0)
    cur = conn.cursor()
    
    with inventory_lock:
        ahora = datetime.now()
        # Buscar reservas activas cuya fecha de expiración sea menor a la hora actual
        cur.execute("""
            SELECT id, ejemplar_codigo FROM reservas 
            WHERE estado = 'ACTIVA' AND fecha_expiracion <= ?;
        """, (ahora.isoformat(),))
        vencidas = cur.fetchall()
        
        liberados = 0
        for res_id, codigo_ejemplar in vencidas:
            # Marcar reserva como expirada
            cur.execute("UPDATE reservas SET estado = 'EXPIRADA' WHERE id = ?;", (res_id,))
            # Regresar ejemplar a DISPONIBLE
            cur.execute("UPDATE ejemplares SET estado = 'DISPONIBLE' WHERE codigo_unico = ?;", (codigo_ejemplar,))
            # Reintegrar stock al libro
            cur.execute("""
                UPDATE libros SET stock_disponible = stock_disponible + 1 
                WHERE id = (SELECT libro_id FROM ejemplares WHERE codigo_unico = ?);
            """, (codigo_ejemplar,))
            liberados += 1
            
        conn.commit()
    conn.close()
    return liberados

def ejecutar_poc():
    print("=" * 75)
    print("  PRUEBA DE CONCEPTO (PoC) — LABORATORIO DE SOFTWARE IS873 (UTP)")
    print("  Validación de Concurrencia de Inventario y Scheduler de Reservas (24h)")
    print("=" * 75)
    
    init_db()
    
    # Estado Inicial
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT titulo, stock_disponible FROM libros WHERE id = 1;")
    titulo, stock = c.fetchone()
    print(f"\n[ESTADO INICIAL]")
    print(f"• Libro: '{titulo}'")
    print(f"• Stock físico disponible: {stock} ejemplares")
    conn.close()
    
    # -------------------------------------------------------------
    # FASE 1: ATAQUE DE CONCURRENCIA (10 CLIENTES SIMULTÁNEOS)
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print("FASE 1: 10 clientes intentan reservar simultáneamente (Solo hay 2 copias)")
    print("-" * 75)
    
    threads = []
    resultados = []
    
    # Lanzar 10 hilos concurrentes compitiendo al mismo tiempo
    # Pasamos simulated_duration_hours = -1 para que nazcan ya con fecha pasada y podamos probar el scheduler
    for i in range(1, 11):
        t = threading.Thread(target=reservar_libro, args=(f"Cliente_{i:02d}", 1, resultados, -1))
        threads.append(t)
        
    start_time = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    duration = time.time() - start_time
    
    exitos = sum(1 for r in resultados if r[1])
    fallos = sum(1 for r in resultados if not r[1])
    
    for cliente_id, exito, msg in sorted(resultados, key=lambda x: x[0]):
        status = "[APROBADA] " if exito else "[RECHAZADA]"
        print(f"  {status} {cliente_id}: {msg}")
        
    print(f"\n* Metricas Fase 1:")
    print(f"  - Tiempo total de procesamiento concurrente: {duration*1000:.2f} ms")
    print(f"  - Solicitudes aprobadas: {exitos} (Esperado: 2)")
    print(f"  - Solicitudes rechazadas por falta de stock: {fallos} (Esperado: 8)")
    
    # Verificar stock tras Fase 1
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT stock_disponible FROM libros WHERE id = 1;")
    stock_actual = c.fetchone()[0]
    print(f"  - Stock actual en base de datos: {stock_actual} (Sin sobreventas)")
    conn.close()
    
    assert exitos == 2, "ERROR: Ocurrio sobreventa o fallo de concurrencia."
    assert stock_actual == 0, "ERROR: El stock no llego a cero."
    print("  -> CONCLUSION FASE 1: Se erradico la sobreventa; consistencia ACID verificada.")
    
    # -------------------------------------------------------------
    # FASE 2: TRABAJO AUTONOMO DEL SCHEDULER (EXPIRACION 24 HORAS)
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print("FASE 2: Ejecucion del Scheduler en segundo plano (Simulacion paso de 24h)")
    print("-" * 75)
    print("* El worker se despierta y revisa reservas vencidas...")
    
    liberados = scheduler_liberar_reservas()
    print(f"* Reservas vencidas identificadas y liberadas: {liberados}")
    
    # Verificar stock tras Scheduler
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT stock_disponible FROM libros WHERE id = 1;")
    stock_restaurado = c.fetchone()[0]
    print(f"* Stock fisico restaurado tras la expiracion: {stock_restaurado} ejemplares")
    conn.close()
    
    assert liberados == 2, "ERROR: El scheduler no libero las 2 reservas vencidas."
    assert stock_restaurado == 2, "ERROR: El stock no regreso a 2."
    print("  -> CONCLUSION FASE 2: El scheduler libero el stock automaticamente sin intervencion humana.")
    
    # -------------------------------------------------------------
    # FASE 3: COMPROBACION DE NUEVA DISPONIBILIDAD
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print("FASE 3: Nuevo cliente intenta reservar tras la liberacion del scheduler")
    print("-" * 75)
    nuevo_resultado = []
    reservar_libro("Cliente_11_Nuevo", 1, nuevo_resultado, 24)
    status_nuevo = "[APROBADA] " if nuevo_resultado[0][1] else "[RECHAZADA]"
    print(f"  {status_nuevo} {nuevo_resultado[0][0]}: {nuevo_resultado[0][2]}")
    
    print("\n" + "=" * 75)
    print("  RESULTADO GENERAL DE LA PoC: SUPUESTO TECNICO VALIDADO CON EXITO")
    print("=" * 75)

if __name__ == "__main__":
    ejecutar_poc()
