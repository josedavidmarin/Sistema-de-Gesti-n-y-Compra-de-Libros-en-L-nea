"""
PDF Generator for Nota 3 and Nota 4 Deliverables (IS873 - UTP).
Generates publication-quality PDF documents with headers, footers, tables, and pagination.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        self.header_right = kwargs.pop('header_right', 'IS873: NOTAS 3 Y 4')
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#64748b'))
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, 'UNIVERSIDAD TECNOLÓGICA DE PEREIRA — IS873 LABORATORIO DE SOFTWARE')
            self.drawRightString(letter[0] - 54, letter[1] - 36, self.header_right)
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 40, letter[0] - 54, letter[1] - 40)
        footer_text = f'Página {self._pageNumber} de {page_count}'
        self.setFont('Helvetica', 8)
        self.drawRightString(letter[0] - 54, 30, footer_text)
        self.drawString(54, 30, 'Sistema de Gestión y Compra de Libros en Línea — Entrega Integrada: Notas 3 y 4 (2026-2)')
        self.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.setLineWidth(0.5)
        self.line(54, 42, letter[0] - 54, 42)
        self.restoreState()


def get_styles():
    styles = getSampleStyleSheet()
    primary = colors.HexColor('#1e3a8a')
    secondary = colors.HexColor('#0369a1')
    dark = colors.HexColor('#1e293b')

    return {
        'primary': primary,
        'secondary': secondary,
        'dark': dark,
        'light_bg': colors.HexColor('#f8fafc'),
        'title': ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=17, leading=21, textColor=primary, spaceAfter=4),
        'subtitle': ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=secondary, spaceAfter=8),
        'meta': ParagraphStyle('MetaStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=dark),
        'h1': ParagraphStyle('H1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=primary, spaceBefore=10, spaceAfter=5, keepWithNext=True),
        'h2': ParagraphStyle('H2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, leading=13, textColor=secondary, spaceBefore=6, spaceAfter=3, keepWithNext=True),
        'body': ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=dark, spaceAfter=4),
        'bullet': ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=dark, leftIndent=12, firstLineIndent=-8, spaceAfter=2.5),
        'th': ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.white, alignment=1),
        'td': ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=dark),
        'td_bold': ParagraphStyle('TDB', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=9.5, textColor=dark, alignment=1),
    }


def add_header(story, st, title, subtitle):
    story.append(Paragraph("UNIVERSIDAD TECNOLÓGICA DE PEREIRA — FACULTAD DE INGENIERÍAS", st['subtitle']))
    story.append(Paragraph("Programa de Ingeniería de Sistemas y Computación • IS873 Laboratorio de Software (Semestre 2026-2)", st['meta']))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=st['primary'], spaceAfter=8))
    story.append(Paragraph(title, st['title']))
    story.append(Paragraph(subtitle, st['subtitle']))

    info_table = Table([[
        Paragraph("<b>Proyecto:</b> Sistema de Gestión y Compra de Libros en Línea<br/><b>Frontend Vercel:</b> sistema-de-gestion-three.vercel.app<br/><b>Backend Swagger:</b> libreria-backend-yhdj.onrender.com/docs", st['meta']),
        Paragraph("<b>Equipo de Desarrollo:</b><br/>• Jose David Marín Giraldo (josedavid.marin@utp.edu.co)<br/>• Edwin Osorio Cartagena<br/>• Maicol Londoño Hernández", st['meta'])
    ]], colWidths=[270, 234])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 8))


def generate_pdf(filepath, story, header_right):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(story, canvasmaker=lambda *a, **kw: NumberedCanvas(*a, header_right=header_right, **kw))
    print(f"Generated PDF: {filepath}")


def build_sprint_planning_story(st):
    story = []
    add_header(story, st, "Sprint Planning 2 — Segundo Incremento Funcional", "Nota 3 de 4 (Sprint Review 2 — 20% de la Calificación)")

    story.append(Paragraph("1. Sprint Goal 2", st['h1']))
    story.append(Paragraph(
        "<i>\"Construir e integrar el flujo de valor comercial del sistema sobre el núcleo de seguridad de la Nota 2: catálogo con búsqueda y disponibilidad en tiempo real, carrito de compras persistente por usuario, checkout atómico con Billetera Virtual y control estricto de concurrencia ante stock agotado (Todo o Nada), trazabilidad por código físico único de ejemplar (LIB-XXX-EJYYY) y cancelación con reembolso inmediato, respaldado por una suite automatizada de pruebas y manual de usuario bilingüe.\"</i>",
        st['body']
    ))

    story.append(Paragraph("2. Capacidad del Equipo y Estimación", st['h1']))
    story.append(Paragraph("• <b>Duración:</b> ~3 semanas (10 de noviembre al 1 de diciembre de 2026).<br/>• <b>Horas disponibles:</b> 3 desarrolladores × 3 semanas × 15 horas/semana = 135 horas productivas.<br/>• <b>Capacidad Comprometida:</b> 31 Story Points distribuidos en 6 Historias de Usuario.", st['body']))

    story.append(Paragraph("3. Historias Comprometidas (Sprint 2 Backlog)", st['h1']))
    table_data = [
        [Paragraph("ID", st['th']), Paragraph("Historia de Usuario", st['th']), Paragraph("Prioridad", st['th']), Paragraph("SP", st['th']), Paragraph("Responsable", st['th'])],
        [Paragraph("HU-08", st['td_bold']), Paragraph("Catálogo de libros con filtros y stock en tiempo real (RF-008)", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Edwin Osorio", st['td'])],
        [Paragraph("HU-09", st['td_bold']), Paragraph("Carrito de compras persistente sin reserva previa (RF-009, 012)", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Jose David Marín", st['td'])],
        [Paragraph("HU-10", st['td_bold']), Paragraph("Checkout atómico con Billetera Virtual y concurrencia (RF-013, 037)", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("8 SP", st['td_bold']), Paragraph("Jose David Marín", st['td'])],
        [Paragraph("HU-11", st['td_bold']), Paragraph("Historial de órdenes y cancelación con reembolso total (RF-014, 015)", st['td']), Paragraph("Should Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Maicol Londoño", st['td'])],
        [Paragraph("HU-12", st['td_bold']), Paragraph("Gestión administrativa de inventario y copias físicas (RF-002, 004, 005)", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Maicol Londoño", st['td'])],
        [Paragraph("HU-13", st['td_bold']), Paragraph("Recarga y consulta de saldo de Billetera Virtual (RF-037)", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("3 SP", st['td_bold']), Paragraph("Edwin Osorio", st['td'])],
    ]
    t = Table(table_data, colWidths=[40, 244, 70, 40, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), st['primary']),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, st['light_bg']]),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    story.append(Paragraph("4. Justificación y Dependencias Técnicas", st['h1']))
    story.append(Paragraph("• <b>Dependencias:</b> HU-12 alimenta el inventario inicial -> HU-08 visualiza los ejemplares disponibles -> HU-09 permite armar el carrito -> HU-13 provee fondos -> HU-10 procesa la compra atómica -> HU-11 gestiona el post-pedido y reembolsos.", st['bullet']))
    story.append(Paragraph("• <b>Historias fuera del sprint:</b> Reservas de 24h con Celery worker (pospuesta para escalamiento posterior), pasarela bancaria externa PSE (sustituida por Billetera Virtual RF-037) y Google Maps API (no bloqueante para la venta de libros).", st['bullet']))

    story.append(Paragraph("5. Definition of Done (DoD)", st['h1']))
    story.append(Paragraph("Una historia está <b>TERMINADA</b> cuando: (1) Código integrado en rama main sin conflictos, (2) Modelos persistidos en SQLite y PostgreSQL, (3) Pruebas automatizadas en /tests ejecutándose al 100% de éxito, (4) Demostración de fallo intencional operativa, (5) Frontend compilando limpiamente con Vite, (6) Documentación técnica y cuaderno interactivo demo_sprint2.ipynb funcionales.", st['body']))

    return story


def build_retrospectiva_story(st):
    story = []
    add_header(story, st, "Retrospectiva del Equipo de Desarrollo (1-2 Páginas)", "Nota 4 de 4 (Entrega Final del Producto — 30% de la Calificación)")

    story.append(Paragraph("1. ¿Qué Funcionó Bien?", st['h1']))
    story.append(Paragraph("• <b>Arquitectura desacoplada:</b> La estricta separación entre React + Tailwind, FastAPI y SQLAlchemy ORM permitió que los tres integrantes trabajáramos simultáneamente en frontend, backend y pruebas sin bloqueos.", st['bullet']))
    story.append(Paragraph("• <b>Cultura de Pruebas Automatizadas:</b> Desarrollar pruebas de integración desde el Sprint 1 garantizó cero regresiones al modificar el modelo del carrito y refactorizar endpoints.", st['bullet']))
    story.append(Paragraph("• <b>Seguridad RBAC Inviolable:</b> La política RF-031 protegió de forma determinista la integridad del negocio bloqueando compras de administradores.", st['bullet']))

    story.append(Paragraph("2. ¿Qué NO Funcionó Bien y Cuellos de Botella?", st['h1']))
    story.append(Paragraph("• <b>Sincronización inicial en Git:</b> Ramas divergentes en los primeros commits requirieron unificar el flujo en 'main'.", st['bullet']))
    story.append(Paragraph("• <b>Complejidad de Concurrencia en Carrito:</b> El diseño inicial de bloqueo temporal de 30 minutos abría vulnerabilidades de denegación de inventario. Rediseñar a 'Todo o Nada' en checkout resolvió el problema elegantemente.", st['bullet']))

    story.append(Paragraph("3. ¿Qué Haríamos Distinto?", st['h1']))
    story.append(Paragraph("• Definir contratos de API (OpenAPI) antes de programar para evitar discrepancias menores de nomenclatura entre frontend y backend.", st['bullet']))
    story.append(Paragraph("• Estandarizar Docker para todo el equipo desde el día uno en lugar de scripts de arranque locales.", st['bullet']))

    story.append(Paragraph("4. Manejo de Deuda Técnica Reconocida", st['h1']))
    story.append(Paragraph("Reconocemos que para millones de transacciones por segundo convendría agregar bloqueo pesimista de fila (<code>SELECT ... FOR UPDATE</code>) en PostgreSQL. Para la carga actual, la transacción atómica con validación previa y rollback integral garantiza consistencia ACID absoluta.", st['body']))

    story.append(Paragraph("5. Aprendizaje Individual por Integrante", st['h1']))
    story.append(Paragraph("• <b>Jose David Marín:</b> Dominio de transacciones ACID concurrentes, seguridad JWT y arquitectura modular en FastAPI.", st['bullet']))
    story.append(Paragraph("• <b>Edwin Osorio:</b> Desarrollo avanzado de SPAs con React 18, TypeScript, Tailwind CSS y estado compartido entre componentes.", st['bullet']))
    story.append(Paragraph("• <b>Maicol Londoño:</b> Construcción de suites automatizadas con pytest, pruebas de estrés y planes de prueba trazables.", st['bullet']))

    story.append(Paragraph("6. Si Tuviéramos una Semana Más...", st['h1']))
    story.append(Paragraph("La invertiríamos en: (1) Envío automático de facturas en PDF por correo electrónico, (2) Worker Celery/Redis para reservas físicas de 24h en tienda, (3) Panel administrativo con gráficas interactivas de ventas.", st['body']))

    return story


def build_sustentacion_story(st):
    story = []
    add_header(story, st, "Guía de Sustentación Oficial — Preguntas 10 a 21", "Preparación para el Bloque 1 (Sprint Review 2) y Bloque 2 (Sustentación Final)")

    story.append(Paragraph("Bloque 1 — Sprint Review 2 (Nota 3)", st['h1']))

    story.append(Paragraph("<b>Pregunta 10: Prueba fallando intencionalmente y luego pasando.</b>", st['h2']))
    story.append(Paragraph("• <i>En vivo:</i> Se ejecuta <code>python tests/test_intentional_failure_demo.py --fail</code> demostrando que la prueba espera erróneamente HTTP 201 en una compra sin saldo y falla con <code>AssertionError</code>. Luego se ejecuta <code>python tests/test_intentional_failure_demo.py</code> y pasa al 100% validando la respuesta real HTTP 400 Bad Request.", st['body']))

    story.append(Paragraph("<b>Pregunta 11: Caso borde de concurrencia descubierto.</b>", st['h2']))
    story.append(Paragraph("• <i>Respuesta:</i> Dos clientes con el mismo libro en su carrito compitiendo por la última copia disponible. Lo resolvimos adoptando el patrón 'Todo o Nada': al hacer checkout se valida atómicamente el stock físico remanente. Si se agotó, se rechaza la compra con HTTP 409 Conflict sin debitar dinero.", st['body']))

    story.append(Paragraph("<b>Pregunta 12: Cobertura de pruebas (85%).</b>", st['h2']))
    story.append(Paragraph("• <i>Respuesta:</i> Se priorizó probar la seguridad RBAC (RF-031), el checkout atómico (RF-013, 037) y la cancelación con reembolso (RF-014), que representan el núcleo transaccional del negocio.", st['body']))

    story.append(Paragraph("<b>Pregunta 13: Deuda técnica y mitigación.</b>", st['h2']))
    story.append(Paragraph("• <i>Respuesta:</i> Cerrada mediante transacciones ACID con rollback integral en SQLAlchemy; a futuro se adicionará bloqueo pesimista en PostgreSQL.", st['body']))

    story.append(Paragraph("<b>Pregunta 14: Integración de punta a punta con el Sprint 1.</b>", st['h2']))
    story.append(Paragraph("• <i>En vivo:</i> Un cliente creado en el Sprint 1 inicia sesión con JWT, utiliza su saldo en la Billetera Virtual, adquiere libros del Sprint 2 y se demuestra que la restricción RF-031 sigue impidiendo que administradores compren.", st['body']))

    story.append(PageBreak())
    story.append(Paragraph("Bloque 2 — Sustentación Final (Nota 4)", st['h1']))

    story.append(Paragraph("<b>Pregunta 15: Demo completa de punta a punta sin cortes.</b>", st['h2']))
    story.append(Paragraph("• Catálogo público -> Búsqueda -> Login de Cliente -> Carrito -> Checkout con Billetera Virtual -> Asignación de código físico único (LIB-001-EJ001) -> Mis Compras -> Cancelación con reembolso total a la billetera.", st['body']))

    story.append(Paragraph("<b>Pregunta 16: Alcance cumplido vs recortado.</b>", st['h2']))
    story.append(Paragraph("• Cumplido el 100% del núcleo transaccional. Recortadas pasarelas externas bancarias y mapas de Google por priorizar la Billetera Virtual nativa (RF-037).", st['body']))

    story.append(Paragraph("<b>Pregunta 17: Tres cosas más difíciles y solución.</b>", st['h2']))
    story.append(Paragraph("• (1) Concurrencia en checkout -> Resuelta con transacción atómica Todo o Nada. (2) Persistencia híbrida local/cloud -> Resuelta con SQLAlchemy SQLite/PostgreSQL. (3) Cumplimiento inviolable de RF-031 -> Resuelto con dependencias de seguridad en FastAPI.", st['body']))

    story.append(Paragraph("<b>Pregunta 20: Qué sigue igual vs qué se rediseñó.</b>", st['h2']))
    story.append(Paragraph("• Igual: Motor JWT, modelo de usuarios y RBAC. Rediseñado: Carrito persistente sin bloqueo temprano de 30 min y deducción exclusiva en checkout.", st['body']))

    story.append(Paragraph("<b>Pregunta 21: ¿Un tercero puede seguir el manual de usuario?</b>", st['h2']))
    story.append(Paragraph("• Sí, el manual bilingüe (ES/EN) contiene 7 pasos detallados con figuras legibles, tabla de credenciales preconfiguradas y guía de solución de errores para usuarios no técnicos.", st['body']))

    return story


def build_documentacion_final_story(st):
    story = []
    add_header(story, st, "Documentación Técnica Final del Sistema", "Nota 4 de 4 (Entrega Final del Producto — 30% de la Calificación)")

    story.append(Paragraph("1. Resumen Ejecutivo y Alcance del Producto", st['h1']))
    story.append(Paragraph(
        "El Sistema de Gestión y Compra de Libros en Línea es una plataforma omnicanal construida para resolver la sobreventa de libros, la falta de trazabilidad física y las fallas de auditoría. Introduce control granular por copia física (LIB-XXX-EJYYY), carrito persistente sin reserva temprana, checkout atómico con Billetera Virtual (Todo o Nada) y seguridad RBAC estricta bajo la regla RF-031.",
        st['body']
    ))

    story.append(Paragraph("2. Arquitectura del Sistema (C4 y Componentes)", st['h1']))
    story.append(Paragraph("• <b>Nivel 1 (Contexto):</b> Clientes, Administradores y Root interactúan con la plataforma, la cual persiste el catálogo, ejemplares y órdenes en bases de datos relacionales.", st['bullet']))
    story.append(Paragraph("• <b>Nivel 2 (Contenedores):</b> SPA en React 18 + Vite consumiendo una API RESTful en FastAPI mediante tokens Bearer JWT, con persistencia ORM en SQLAlchemy 2.0.", st['bullet']))
    story.append(Paragraph("• <b>Nivel 3 (Datos / ERD):</b> 6 tablas normalizadas: <code>users</code>, <code>libros</code>, <code>ejemplares</code>, <code>carrito_items</code>, <code>ordenes_compra</code> y <code>orden_detalles</code>.", st['bullet']))

    story.append(Paragraph("3. Instrucciones de Instalación y Arranque Local", st['h1']))
    story.append(Paragraph("El go-live local se ejecuta en 1 solo paso mediante el archivo por lotes <code>start_project.bat</code> en la raíz del proyecto. El script inicializa el entorno virtual de Python, aplica las semillas de base de datos e inicia en simultáneo el backend en el puerto 8000 y el frontend en el puerto 5173 abriendo el navegador automáticamente.", st['body']))

    story.append(Paragraph("4. Backlog Consolidado y Estado Final (100% Done)", st['h1']))
    story.append(Paragraph("• <b>Sprint 1 (21 SP):</b> HU-01 (Registro), HU-02 (Crear Admins Root), HU-03 (Restricción RF-031), HU-04 (Login JWT), HU-05 (Logout), HU-06 (Cambio de Clave), HU-07 (Perfil).<br/>• <b>Sprint 2 (31 SP):</b> HU-08 (Catálogo y Filtros), HU-09 (Carrito Persistente), HU-10 (Checkout Atómico y Concurrencia), HU-11 (Órdenes y Cancelación), HU-12 (Inventario y Copias Físicas), HU-13 (Billetera Virtual).", st['body']))

    story.append(Paragraph("5. Decisiones de Diseño Relevantes", st['h1']))
    story.append(Paragraph("• <b>Concurrencia Todo o Nada:</b> Se eliminó el temporizador de 30 minutos del carrito para evitar denegación de inventario; el stock se verifica y descuenta de forma atómica en el checkout.<br/>• <b>Trazabilidad Física por Ejemplar (RF-002):</b> Cada libro físico cuenta con un código correlativo único LIB-XXX-EJYYY.<br/>• <b>Billetera Virtual Nativa (RF-037):</b> Medio de pago desacoplado de dependencias bancarias externas que permite reembolsos instantáneos.", st['body']))

    return story


def build_manual_usuario_story(st):
    story = []
    add_header(story, st, "Manual de Usuario Bilingüe / Bilingual User Manual", "Nota 4 de 4 — Manual Dirigido a Usuario Final Sin Conocimientos Técnicos")

    story.append(Paragraph("PARTE I: GUÍA EN ESPAÑOL", st['h1']))
    story.append(Paragraph("<b>1. Propósito:</b> Plataforma para compra de libros con ejemplares físicos únicos y monedero virtual recargable.", st['body']))
    story.append(Paragraph("<b>2. Arranque Rápido:</b> Ejecuta <code>start_project.bat</code> para abrir el sistema localmente en <code>http://localhost:5173</code>.", st['body']))
    story.append(Paragraph("<b>3. Cuentas de Acceso:</b> Cliente (<code>cliente.demo@gmail.com</code> / <code>Cliente2026!</code>) • Administrador (<code>admin.bodega@libreria.com</code> / <code>Admin2026!</code>).", st['body']))
    story.append(Paragraph("<b>4. Flujo de Compra:</b> (1) Explora el catálogo y añade libros al carrito (hasta 3 por título), (2) Revisa tu carrito y valida tu saldo de Billetera Virtual, (3) Pulsa 'Pagar con Billetera Virtual' -> el sistema asigna tus ejemplares físicos únicos (ej. LIB-001-EJ001), (4) En 'Mis Compras' puedes consultar tu pedido o cancelarlo con reembolso inmediato.", st['body']))
    story.append(Paragraph("<b>5. Mensajes de Error:</b> Si el saldo es insuficiente, ve a 'Mi Perfil' y pulsa 'Recargar Billetera'. Si un libro se agota antes de comprar, el sistema te avisa con 'Conflicto de Stock' sin debitar dinero.", st['body']))

    story.append(PageBreak())
    story.append(Paragraph("PART II: ENGLISH USER GUIDE", st['h1']))
    story.append(Paragraph("<b>1. Purpose:</b> Online book management and purchasing platform with unique physical barcodes and virtual wallet.", st['body']))
    story.append(Paragraph("<b>2. Quick Startup:</b> Double-click <code>start_project.bat</code> to launch backend and frontend at <code>http://localhost:5173</code>.", st['body']))
    story.append(Paragraph("<b>3. Demo Accounts:</b> Customer (<code>cliente.demo@gmail.com</code> / <code>Cliente2026!</code>) • Admin (<code>admin.bodega@libreria.com</code> / <code>Admin2026!</code>).", st['body']))
    story.append(Paragraph("<b>4. Purchasing Flow:</b> (1) Browse catalog and add books to cart (max 3 units per title), (2) Review cart and verify wallet balance, (3) Click 'Pay with Virtual Wallet' -> unique physical barcodes are issued (e.g. LIB-001-EJ001), (4) Visit 'My Orders' to track your order or cancel it for an instant wallet refund.", st['body']))
    story.append(Paragraph("<b>5. Troubleshooting:</b> If funds are insufficient, visit 'My Profile' and click 'Top-Up Wallet'. If an item sells out before checkout, an 'Out of Stock' alert appears without charging your wallet.", st['body']))

    return story


if __name__ == '__main__':
    out_dir = os.path.dirname(os.path.abspath(__file__))
    st = get_styles()

    generate_pdf(
        os.path.join(out_dir, "sprint-planning-2.pdf"),
        build_sprint_planning_story(st),
        "NOTA 3: SPRINT PLANNING 2"
    )

    generate_pdf(
        os.path.join(out_dir, "documentacion_final.pdf"),
        build_documentacion_final_story(st),
        "NOTA 4: DOCUMENTACIÓN FINAL COMPLETA"
    )

    generate_pdf(
        os.path.join(out_dir, "retrospectiva_equipo.pdf"),
        build_retrospectiva_story(st),
        "NOTA 4: RETROSPECTIVA DEL EQUIPO"
    )

    generate_pdf(
        os.path.join(out_dir, "manual_usuario_es_en.pdf"),
        build_manual_usuario_story(st),
        "NOTA 4: MANUAL DE USUARIO BILINGÜE"
    )

    generate_pdf(
        os.path.join(out_dir, "sustentacion_notas_3_y_4.pdf"),
        build_sustentacion_story(st),
        "NOTAS 3 Y 4: GUÍA DE SUSTENTACIÓN"
    )

    print("\n[+] Todos los PDFs oficiales de las Notas 3 y 4 generados exitosamente.")
