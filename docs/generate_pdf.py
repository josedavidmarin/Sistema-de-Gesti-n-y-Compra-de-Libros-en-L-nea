import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
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
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, 'UNIVERSIDAD TECNOLÓGICA DE PEREIRA — IS873 LABORATORIO DE SOFTWARE')
            self.drawRightString(letter[0] - 54, letter[1] - 36, 'NOTA 2: SPRINT REVIEW 1')
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 40, letter[0] - 54, letter[1] - 40)
        # Footer
        footer_text = f'Página {self._pageNumber} de {page_count}'
        self.setFont('Helvetica', 8)
        self.drawRightString(letter[0] - 54, 30, footer_text)
        self.drawString(54, 30, 'Sistema de Gestión y Compra de Libros en Línea — Primer Incremento Funcional (2026-2)')
        self.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.setLineWidth(0.5)
        self.line(54, 42, letter[0] - 54, 42)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor('#1e3a8a')    # Navy blue
    secondary_color = colors.HexColor('#0369a1')  # Slate cyan
    dark_neutral = colors.HexColor('#1e293b')     # Slate 800
    light_bg = colors.HexColor('#f8fafc')         # Slate 50
    accent_green = colors.HexColor('#15803d')

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=14
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=dark_neutral
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=dark_neutral,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=dark_neutral,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=dark_neutral,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )

    quote_style = ParagraphStyle(
        'Quote_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=primary_color
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=dark_neutral
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=dark_neutral,
        alignment=1
    )

    story = []

    # ========================== PORTADA / ENCABEZADO ==========================
    story.append(Paragraph("UNIVERSIDAD TECNOLÓGICA DE PEREIRA", subtitle_style))
    story.append(Paragraph("Facultad de Ingenierías • Programa de Ingeniería de Sistemas y Computación<br/>IS873 — Laboratorio de Software (Semestre 2026-2)", meta_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceAfter=14))

    story.append(Paragraph("DOCUMENTO MAESTRO CONSOLIDADO DE ENTREGA", title_style))
    story.append(Paragraph("Nota 2 — Sprint Review 1: Primer Incremento Funcional (20%)", subtitle_style))

    info_data = [
        [
            Paragraph("<b>Proyecto:</b> Sistema de Gestión y Compra de Libros en Línea<br/>"
                      "<b>Modalidad:</b> Asíncrono (~3 sem.) + Sustentación Síncrona Real<br/>"
                      "<b>Fechas de Sustentación:</b> 3 y 5 de noviembre de 2026", meta_style),
            Paragraph("<b>Integrantes del Equipo:</b><br/>"
                      "• Jose David Marín Giraldo (josedavid.marin@utp.edu.co)<br/>"
                      "• Edwin Osorio Cartagena<br/>"
                      "• Maicol Londoño Hernández", meta_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[240, 264])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # ========================== PARTE I ==========================
    story.append(Paragraph("PARTE I: SPRINT PLANNING DOCUMENTADO", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=10))

    story.append(Paragraph("1.1 Sprint Goal (Objetivo del Incremento)", h2_style))
    goal_box = [
        [Paragraph("<b>Sprint Goal:</b> <i>\"Construir y desplegar el núcleo operativo de seguridad y control de acceso del sistema mediante autenticación JWT, autoservicio de clientes y control de acceso basado en roles (RBAC), garantizando de forma atómica la restricción de compras para cuentas administrativas (RF-031) en una arquitectura cliente-servidor funcional, probada y demostrable de principio a fin.\"</i>", quote_style)]
    ]
    t_goal = Table(goal_box, colWidths=[504])
    t_goal.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_goal)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.2 Historias Comprometidas (21 Story Points)", h2_style))
    story.append(Paragraph("El equipo comprometió 7 Historias de Usuario clasificadas como <b>MUST HAVE</b> en la Nota 1, estimadas mediante Fibonacci y distribuidas equitativamente (7 SP por integrante):", body_style))

    table_data = [
        [
            Paragraph("ID", table_header_style),
            Paragraph("Título de la Historia de Usuario", table_header_style),
            Paragraph("MoSCoW", table_header_style),
            Paragraph("SP", table_header_style),
            Paragraph("Responsable", table_header_style),
            Paragraph("Requisitos Asociados", table_header_style),
        ],
        [
            Paragraph("HU-01", table_cell_bold),
            Paragraph("Registro de nuevos clientes con DNI único y contraseña cifrada", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("5", table_cell_bold),
            Paragraph("Edwin Osorio", table_cell_style),
            Paragraph("RF-027, RF-029", table_cell_style),
        ],
        [
            Paragraph("HU-04", table_cell_bold),
            Paragraph("Inicio de sesión (Login) con emisión de Bearer Token JWT", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("3", table_cell_bold),
            Paragraph("Jose David Marín", table_cell_style),
            Paragraph("RF-026, RF-028", table_cell_style),
        ],
        [
            Paragraph("HU-05", table_cell_bold),
            Paragraph("Cierre de sesión (Logout) y desvinculación de credenciales", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("1", table_cell_bold),
            Paragraph("Jose David Marín", table_cell_style),
            Paragraph("RF-026", table_cell_style),
        ],
        [
            Paragraph("HU-06", table_cell_bold),
            Paragraph("Cambio seguro de contraseña con validación de clave previa", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("2", table_cell_bold),
            Paragraph("Edwin Osorio", table_cell_style),
            Paragraph("RF-028", table_cell_style),
        ],
        [
            Paragraph("HU-07", table_cell_bold),
            Paragraph("Consulta y actualización de perfil, teléfono y dirección", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("3", table_cell_bold),
            Paragraph("Jose David Marín", table_cell_style),
            Paragraph("RF-021, RF-028", table_cell_style),
        ],
        [
            Paragraph("HU-02", table_cell_bold),
            Paragraph("Creación de Administradores por Root con auditoría de nómina", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("5", table_cell_bold),
            Paragraph("Maicol Londoño", table_cell_style),
            Paragraph("RF-030", table_cell_style),
        ],
        [
            Paragraph("HU-03", table_cell_bold),
            Paragraph("Restricción estricta de compra/reserva para personal operativo", table_cell_style),
            Paragraph("Must Have", table_cell_style),
            Paragraph("2", table_cell_bold),
            Paragraph("Maicol Londoño", table_cell_style),
            Paragraph("RF-031", table_cell_style),
        ],
    ]
    t_hist = Table(table_data, colWidths=[40, 194, 60, 25, 95, 90])
    t_hist.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
    ]))
    story.append(t_hist)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.3 Justificación Técnica y Capacidad del Equipo", h2_style))
    story.append(Paragraph("• <b>Capacidad y Velocidad:</b> El equipo de 3 desarrolladores dispuso de ~3 semanas con una dedicación promedio de 10 a 12 horas hombre semanales por integrante (total: ~90-108 horas). La carga de 21 Story Points representa una velocidad ágil calibrada (7 SP por persona), evitando la sobrecarga y garantizando cobertura total de pruebas.", bullet_style))
    story.append(Paragraph("• <b>Dependencias Técnicas:</b> La HU-04 (Login JWT) constituye la compuerta de entrada de seguridad (`get_current_user`). Sin esta historia era inviable autenticar las peticiones de cambio de clave (HU-06), edición de perfil (HU-07), creación de personal (HU-02) o restricción de compras (HU-03).", bullet_style))
    story.append(Paragraph("• <b>Prioridad Arquitectónica:</b> Se priorizó el núcleo de seguridad y control de acceso. Implementar módulos de inventario o pasarela sin RBAC habría generado deuda técnica y vulnerabilidades graves de autorización.", bullet_style))

    story.append(Paragraph("1.4 Historias que Quedaron Fuera del Sprint 1 y Por Qué", h2_style))
    story.append(Paragraph("• <b>Módulo de Inventario y Libros (27 SP):</b> Las historias HU-10 (Registro), HU-10b (Código Único de Ejemplar), HU-11 (Baja), HU-12 (Edición), HU-13 (Stock) y HU-14 (Inventario) requieren que el rol `ADMINISTRADOR` esté creado y validado antes de manipular existencias físicas. Pasan al <b>Sprint 2 (Nota 3)</b>.", bullet_style))
    story.append(Paragraph("• <b>Módulo de Compras y Reservas Concurrentes (16 SP):</b> La política de reservas de 24h (HU-18/HU-19) depende del catálogo y stock físico. Pasa al <b>Sprint 3</b>.", bullet_style))
    story.append(Paragraph("• <b>Módulos Should Have y Could Have:</b> Devoluciones con QR, Google Maps y mensajería fueron diferidos a los Sprints 3 y 4 según la priorización MoSCoW.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("1.5 Criterios de Aceptación por Historia (Formato Gherkin)", h2_style))
    story.append(Paragraph("<b>HU-01 (Registro):</b> Dado un visitante con DNI y email únicos y clave segura, cuando envía el formulario a <code>POST /auth/register</code>, entonces recibe HTTP 201 Created con rol `CLIENTE` y clave cifrada con `bcrypt`. Si DNI o email existen, rechaza con HTTP 400 Bad Request.", bullet_style))
    story.append(Paragraph("<b>HU-04 (Login JWT):</b> Dado un usuario registrado con credenciales correctas, cuando se autentica en <code>POST /auth/login</code>, entonces el sistema responde con HTTP 200 OK y token Bearer JWT (exp 24h, claims: sub, rol, user_id, nombre).", bullet_style))
    story.append(Paragraph("<b>HU-05 (Logout):</b> Dado un usuario autenticado, cuando presiona 'Cerrar Sesión', entonces el cliente remueve el token de localStorage, notifica a <code>POST /auth/logout</code>, resetea a rol `VISITANTE` y bloquea rutas privadas.", bullet_style))
    story.append(Paragraph("<b>HU-06 (Cambio de Clave):</b> Dado un usuario autenticado, cuando intenta cambiar su contraseña enviando su clave actual errónea, rechaza con HTTP 400. Si la clave actual es correcta y la nueva es distinta, rehashea en bcrypt y retorna HTTP 200 OK.", bullet_style))
    story.append(Paragraph("<b>HU-07 (Perfil):</b> Dado un cliente con Bearer token, cuando consulta <code>GET /auth/me</code>, recibe sus datos y saldo ($150.000 COP). Cuando envía <code>PUT /auth/me</code>, actualiza teléfono y dirección, impidiendo alterar email, DNI o rol.", bullet_style))
    story.append(Paragraph("<b>HU-02 (Crear Admin por Root):</b> Dado un usuario con rol `ROOT`, cuando envía datos de empleado a <code>POST /admin/create-admin</code>, crea la cuenta con rol `ADMINISTRADOR` (HTTP 201). Si un cliente lo intenta, es bloqueado con HTTP 403 Forbidden.", bullet_style))
    story.append(Paragraph("<b>HU-03 (Restricción de Compra RF-031):</b> Dado un usuario con rol `ADMINISTRADOR` o `ROOT`, cuando intenta comprar o reservar en <code>POST /compras/validar-permiso-compra-reserva</code>, el backend rechaza con HTTP 403 Forbidden. Si el rol es `CLIENTE`, responde con HTTP 200 OK.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("1.6 Definition of Done (DoD) del Equipo", h2_style))
    dod_text = (
        "<b>Una historia está terminada ('DONE') cuando:</b><br/>"
        "1. Funcionalidad completa de principio a fin (FastAPI backend + React frontend).<br/>"
        "2. Documentación del código en inglés (docstrings PEP-257, tipado Pydantic y JSDoc).<br/>"
        "3. Pruebas automatizadas aprobadas al 100% (test_sprint1_api.py).<br/>"
        "4. Ejecutable en el Notebook de demostración (demo_sprint1.ipynb) con aserciones.<br/>"
        "5. Trazabilidad en Git mediante Pull Request y commits prefijados con `HU-XX: ...`.<br/>"
        "6. Demostrable en vivo ante el Product Owner sin depender de diapositivas."
    )
    t_dod = Table([[Paragraph(dod_text, meta_style)]], colWidths=[504])
    t_dod.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, accent_green),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_dod)

    story.append(PageBreak())

    # ========================== PARTE II ==========================
    story.append(Paragraph("PARTE II: RESULTADOS DEL SPRINT Y ARQUITECTURA TÉCNICA", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=10))

    story.append(Paragraph("2.1 Balance General de Ejecución", h2_style))
    story.append(Paragraph("• <b>Compromiso inicial:</b> 21 Story Points (7 Historias Must Have).<br/>"
                           "• <b>Completados y demostrables:</b> 21 Story Points (100% de cumplimiento).<br/>"
                           "• <b>Estado del Tablero Kanban/Scrum:</b> 7 tarjetas en estado <b>DONE</b> vinculadas a commits.", body_style))

    story.append(Paragraph("2.2 Arquitectura del Incremento Funcional", h2_style))
    story.append(Paragraph("La solución implementa una arquitectura desacoplada cliente-servidor:", body_style))
    arch_data = [
        [
            Paragraph("<b>CAPA FRONTEND (SPA)</b><br/>"
                      "• React 18 + Vite + TypeScript.<br/>"
                      "• Tailwind CSS (Mobile-First UI).<br/>"
                      "• AuthContext global para estado de sesión y RBAC.<br/>"
                      "• Interceptores Axios para inyección de JWT.<br/>"
                      "• Botones de autorelleno para sustentación rápida.<br/>"
                      "• Simulador reactivo de la regla RF-031.", meta_style),
            Paragraph("<b>CAPA BACKEND (RESTful API)</b><br/>"
                      "• Python + FastAPI (rendimiento asíncrono ASGI).<br/>"
                      "• SQLAlchemy ORM (persistencia desacoplada SQLite/Postgres).<br/>"
                      "• Cifrado criptográfico unidireccional bcrypt.<br/>"
                      "• Bearer Tokens JWT con claims tipados y expiración 24h.<br/>"
                      "• Middleware RBAC modular basado en Depends.<br/>"
                      "• Documentación OpenAPI/Swagger interactiva (/docs).", meta_style)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[240, 264])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    story.append(Paragraph("2.3 Suite de Pruebas Automatizadas y Calidad Técnica", h2_style))
    story.append(Paragraph("El archivo <code>backend/test_sprint1_api.py</code> implementa 10 pruebas automatizadas de extremo a extremo que validan el 100% de los criterios de aceptación del Sprint 1:", body_style))

    tests_data = [
        [Paragraph("Prueba Automatizada", table_header_style), Paragraph("Historia", table_header_style), Paragraph("Comportamiento Validado", table_header_style), Paragraph("Resultado", table_header_style)],
        [Paragraph("Test 1: Healthcheck API", table_cell_style), Paragraph("Sistema", table_cell_bold), Paragraph("GET / retorna 200 OK y metadatos del servicio", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 2: Login Root", table_cell_style), Paragraph("HU-04", table_cell_bold), Paragraph("Emisión de JWT para Superadmin con rol ROOT", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 3: Login Cliente", table_cell_style), Paragraph("HU-04", table_cell_bold), Paragraph("Emisión de JWT para Cliente con rol CLIENTE", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 4: Registro Cliente", table_cell_style), Paragraph("HU-01", table_cell_bold), Paragraph("Creación con DNI único y contraseña bcrypt (201 Created)", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 5: Consulta Perfil", table_cell_style), Paragraph("HU-07", table_cell_bold), Paragraph("GET /auth/me autenticado retorna datos y monedero", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 6: Edición Perfil", table_cell_style), Paragraph("HU-07", table_cell_bold), Paragraph("PUT /auth/me actualiza teléfono y dirección", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 7: Cambio de Clave", table_cell_style), Paragraph("HU-06", table_cell_bold), Paragraph("Validación de contraseña previa y rehasheo seguro", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 8: Alta Admin por Root", table_cell_style), Paragraph("HU-02", table_cell_bold), Paragraph("Root crea cuenta ADMINISTRADOR con auditoría", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 9: RBAC Seguridad Root", table_cell_style), Paragraph("HU-02", table_cell_bold), Paragraph("Cliente intentando crear Admin es bloqueado con 403", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
        [Paragraph("Test 10: Regla RF-031", table_cell_style), Paragraph("HU-03", table_cell_bold), Paragraph("Admin y Root bloqueados (403); Cliente permitido (200)", table_cell_style), Paragraph("PASÓ (100%)", table_cell_bold)],
    ]
    t_tests = Table(tests_data, colWidths=[120, 44, 260, 80])
    t_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
    ]))
    story.append(t_tests)
    story.append(Spacer(1, 10))

    story.append(Paragraph("2.4 Notebook de Demostración Reproducible (`notebooks/demo_sprint1.ipynb`)", h2_style))
    story.append(Paragraph("Diseñado para que el Product Owner evalúe el incremento sin depender de la memoria del equipo. Cuenta con 18 celdas organizadas secuencialmente, encabezadas por la declaración explícita de alcance exigida por el comité docente:", body_style))
    story.append(Paragraph("• <b>Qué demuestra:</b> Flujo completo de registro, login JWT, roles tipados, perfil, cambio de clave, creación de administradores y bloqueo HTTP 403 de la regla RF-031.", bullet_style))
    story.append(Paragraph("• <b>Qué NO demuestra todavía:</b> Catálogo bibliográfico ni control por copia física (Sprint 2), worker asíncrono de 24h (Sprint 3), pasarela real ni Google Maps (Sprints 3 y 4).", bullet_style))

    story.append(Spacer(1, 14))

    # ========================== PARTE III ==========================
    story.append(Paragraph("PARTE III: NOTAS DE SUSTENTACIÓN Y RESPUESTAS AL PRODUCT OWNER", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=10))

    story.append(Paragraph("Pregunta 1: ¿Qué se comprometió el equipo al inicio del sprint?", h3_style))
    story.append(Paragraph("El equipo comprometió 21 Story Points correspondientes a 7 Historias de Usuario Must Have enfocadas en la seguridad, autenticación, control de perfiles y la arquitectura RBAC con restricción estricta de compras operativas (RF-031).", body_style))

    story.append(Paragraph("Pregunta 2: ¿Cómo se demuestra cada historia comprometida en vivo? (Guión)", h3_style))
    story.append(Paragraph("• <b>[0:00 - 1:30] Sprint Planning y Tablero:</b> Jose David Marín presenta el Sprint Goal y el tablero con las 7 tarjetas en DONE.<br/>"
                           "• <b>[1:30 - 4:00] Autoservicio de Clientes:</b> Edwin Osorio registra un cliente en vivo (HU-01), inicia sesión (HU-04), actualiza su dirección (HU-07) y cambia su contraseña validando la anterior (HU-06). Cierra sesión (HU-05).<br/>"
                           "• <b>[4:00 - 6:30] Seguridad Administrativa:</b> Maicol Londoño entra como Root, accede a la consola y crea un nuevo Administrador (HU-02). Muestra el padrón de auditoría.<br/>"
                           "• <b>[6:30 - 8:30] Regla RF-031 en Vivo:</b> Maicol y Jose David inician sesión como Administrador y muestran el bloqueo HTTP 403 Forbidden al intentar comprar. Luego cambian a Cliente y demuestran la autorización HTTP 200.<br/>"
                           "• <b>[8:30 - 10:00] Calidad Técnica:</b> Ejecución de <code>test_sprint1_api.py</code> en consola (10/10 tests verdes) y visualización del Notebook reproducible.", body_style))

    story.append(Paragraph("Pregunta 3: ¿Qué historias comprometidas no se completaron y por qué?", h3_style))
    story.append(Paragraph("<b>El 100% de las 7 historias comprometidas fueron completadas y son demostrables en vivo.</b> Durante la planeación inicial se evaluó la posibilidad de incluir el CRUD preliminar de libros; sin embargo, decidimos conscientemente dejarlo en el backlog para el Sprint 2. La razón técnica fue priorizar la solidez del cifrado bcrypt, las sesiones JWT y el control RBAC, ya que sin un modelo de permisos blindado la gestión de inventario carecería de auditoría y seguridad.", body_style))

    story.append(Paragraph("Pregunta 4: ¿Qué decisiones técnicas no previstas se tomaron durante el sprint?", h3_style))
    story.append(Paragraph("1. <b>Botones de autorelleno en Login:</b> En `LoginPage.tsx` se agregaron atajos para cargar credenciales de Root, Administrador o Cliente con un solo clic durante la sustentación.<br/>"
                           "2. <b>Simulador reactivo de la Regla RF-031:</b> En `ProfilePage.tsx` se creó un componente visual que consulta el backend en tiempo real para hacer evidente el error 403 ante el docente.<br/>"
                           "3. <b>Persistencia dual desacoplada:</b> Configuración de SQLAlchemy para operar localmente con SQLite sin instalaciones pesadas, manteniendo compatibilidad total con PostgreSQL para despliegue.", body_style))

    story.append(Paragraph("Pregunta 5: ¿Cómo distribuyó el equipo el trabajo? ¿Hubo cuellos de botella?", h3_style))
    story.append(Paragraph("• <b>Distribución equitativa (7 SP cada uno):</b> Edwin Osorio (HU-01, HU-06), Jose David Marín (HU-04, HU-05, HU-07), Maicol Londoño (HU-02, HU-03).<br/>"
                           "• <b>Cuello de botella:</b> La sincronización temprana entre los modelos Pydantic del backend y los tipos TypeScript del frontend antes de finalizar los endpoints.<br/>"
                           "• <b>Solución:</b> Se utilizó Swagger UI (`/docs`) como contrato de interfaz mock temprano, permitiendo al frontend maquetar las vistas sin bloquearse por el backend.", body_style))

    story.append(Paragraph("Pregunta 6: ¿Qué llevan al backlog del siguiente sprint (Nota 3 — Sprint 2)?", h3_style))
    story.append(Paragraph("Se traslada el <b>Módulo de Gestión de Inventario y Catálogo por Copia Física (27 Story Points)</b>: HU-10 (Registro de Libros - 5 SP), HU-10b (Código Único por Ejemplar Físico - 5 SP), HU-12 (Edición Bibliográfica - 3 SP), HU-11 (Baja de Ejemplar - 2 SP), HU-13 (Control de Stock por Sucursal - 3 SP), HU-14 (Vista de Inventario y Agotados - 5 SP), HU-09 y HU-15 (Preferencias y Novedades - 4 SP).", body_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=8))
    story.append(Paragraph("<b>IS873 — Laboratorio de Software (Semestre 2026-2)</b> • Universidad Tecnológica de Pereira<br/>"
                           "Documento Maestro Consolidado generado como respaldo oficial de entrega para la Nota 2.", meta_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {filename}")

if __name__ == '__main__':
    output_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "IS873_Nota2_Sprint_Review_1_Consolidado.pdf"
    )
    build_pdf(output_path)
