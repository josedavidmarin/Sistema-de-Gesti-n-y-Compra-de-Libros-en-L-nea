import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        self.header_right = kwargs.pop('header_right', 'NOTA 2: SPRINT REVIEW 1')
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
        self.drawString(54, 30, 'Sistema de Gestión y Compra de Libros en Línea — Nota 2: Sprint Review 1 (2026-2)')
        self.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.setLineWidth(0.5)
        self.line(54, 42, letter[0] - 54, 42)
        self.restoreState()


def get_custom_styles():
    styles = getSampleStyleSheet()
    primary_color = colors.HexColor('#1e3a8a')
    secondary_color = colors.HexColor('#0369a1')
    dark_neutral = colors.HexColor('#1e293b')

    return {
        'primary': primary_color,
        'secondary': secondary_color,
        'dark': dark_neutral,
        'light_bg': colors.HexColor('#f8fafc'),
        'accent_green': colors.HexColor('#15803d'),
        'title': ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=primary_color, spaceAfter=4),
        'subtitle': ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=secondary_color, spaceAfter=10),
        'meta': ParagraphStyle('MetaStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=dark_neutral),
        'h1': ParagraphStyle('H1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=primary_color, spaceBefore=12, spaceAfter=6, keepWithNext=True),
        'h2': ParagraphStyle('H2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=secondary_color, spaceBefore=8, spaceAfter=4, keepWithNext=True),
        'h3': ParagraphStyle('H3', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=dark_neutral, spaceBefore=6, spaceAfter=2, keepWithNext=True),
        'body': ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=dark_neutral, spaceAfter=5),
        'bullet': ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=dark_neutral, leftIndent=14, firstLineIndent=-10, spaceAfter=3),
        'quote': ParagraphStyle('Quote', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=9, leading=13, textColor=primary_color),
        'th': ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.white, alignment=1),
        'td': ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=dark_neutral),
        'td_bold': ParagraphStyle('TDB', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=dark_neutral, alignment=1),
    }


def add_header_block(story, st, doc_title, doc_subtitle):
    story.append(Paragraph("UNIVERSIDAD TECNOLÓGICA DE PEREIRA", st['subtitle']))
    story.append(Paragraph("Facultad de Ingenierías • Programa de Ingeniería de Sistemas y Computación • IS873 Laboratorio de Software (2026-2)", st['meta']))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=st['primary'], spaceAfter=10))
    story.append(Paragraph(doc_title, st['title']))
    story.append(Paragraph(doc_subtitle, st['subtitle']))

    info_data = [[
        Paragraph(
            "<b>Proyecto:</b> Sistema de Gestión y Compra de Libros en Línea<br/>"
            "<b>Frontend (Vercel):</b> https://sistema-de-gestion-three.vercel.app/<br/>"
            "<b>Backend Swagger (Render):</b> https://libreria-backend-yhdj.onrender.com/docs<br/>"
            "<b>Repositorio GitHub:</b> github.com/josedavidmarin/Sistema-de-Gesti-n-y-Compra-de-Libros-en-L-nea",
            st['meta']
        ),
        Paragraph(
            "<b>Equipo de Desarrollo:</b><br/>"
            "• Jose David Marín Giraldo (josedavid.marin@utp.edu.co)<br/>"
            "• Edwin Osorio Cartagena<br/>"
            "• Maicol Londoño Hernández<br/>"
            "<b>Base de Datos Cloud:</b> PostgreSQL (Supabase) + SQLite local",
            st['meta']
        )
    ]]
    info_table = Table(info_data, colWidths=[260, 244])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), st['light_bg']),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 10))


def build_sprint_planning_story(st):
    story = []
    add_header_block(
        story, st,
        "1. SPRINT PLANNING DOCUMENTADO — SPRINT 1",
        "Nota 2 — Sprint Review 1: Primer Incremento Funcional (20%)"
    )

    story.append(Paragraph("1. Sprint Goal (Objetivo del Sprint)", st['h1']))
    goal_box = [[Paragraph(
        "<b>Sprint Goal:</b> <i>\"Construir y desplegar en producción el núcleo operativo de seguridad, gestión de identidad y control de acceso basado en roles (RBAC) del sistema mediante autenticación JWT y cifrado bcrypt, garantizando el autoservicio de clientes, la administración auditada por el usuario Root y el bloqueo atómico de compras o reservas para cuentas administrativas (RF-031) en una arquitectura cliente-servidor funcional, probada y demostrable de extremo a extremo.\"</i>",
        st['quote']
    )]]
    t_goal = Table(goal_box, colWidths=[504])
    t_goal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#bfdbfe')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_goal)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. Historias Comprometidas en el Sprint 1 (21 Story Points)", st['h1']))
    story.append(Paragraph("De acuerdo con la priorización MoSCoW de la Nota 1 y estimación Fibonacci (Planning Poker), el equipo comprometió 7 Historias de Usuario <b>Must Have</b> (7 SP por integrante):", st['body']))

    table_data = [
        [Paragraph("ID", st['th']), Paragraph("Título de la Historia de Usuario", st['th']), Paragraph("Prioridad (MoSCoW)", st['th']), Paragraph("Estimación", st['th']), Paragraph("Responsable", st['th']), Paragraph("Requisitos", st['th'])],
        [Paragraph("HU-01", st['td_bold']), Paragraph("Registro de nuevos clientes con DNI único y contraseña cifrada", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Edwin Osorio", st['td']), Paragraph("RF-027, RF-029", st['td'])],
        [Paragraph("HU-04", st['td_bold']), Paragraph("Inicio de sesión (Login) y emisión de Bearer Token JWT con roles tipados", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("3 SP", st['td_bold']), Paragraph("Jose David Marín", st['td']), Paragraph("RF-026, RF-028", st['td'])],
        [Paragraph("HU-05", st['td_bold']), Paragraph("Cierre de sesión (Logout) e invalidación de credenciales en cliente y servidor", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("1 SP", st['td_bold']), Paragraph("Jose David Marín", st['td']), Paragraph("RF-026", st['td'])],
        [Paragraph("HU-06", st['td_bold']), Paragraph("Cambio seguro de contraseña con validación obligatoria de clave previa", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("2 SP", st['td_bold']), Paragraph("Edwin Osorio", st['td']), Paragraph("RF-028", st['td'])],
        [Paragraph("HU-07", st['td_bold']), Paragraph("Consulta y actualización de perfil, correspondencia y monedero virtual", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("3 SP", st['td_bold']), Paragraph("Jose David Marín", st['td']), Paragraph("RF-021, RF-028, RF-037", st['td'])],
        [Paragraph("HU-02", st['td_bold']), Paragraph("Creación exclusiva de Administradores por Superadmin Root con auditoría", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("5 SP", st['td_bold']), Paragraph("Maicol Londoño", st['td']), Paragraph("RF-030", st['td'])],
        [Paragraph("HU-03", st['td_bold']), Paragraph("Restricción estricta de compras y reservas para Administradores y Root", st['td']), Paragraph("Must Have", st['td_bold']), Paragraph("2 SP", st['td_bold']), Paragraph("Maicol Londoño", st['td']), Paragraph("RF-031", st['td'])],
    ]
    t_hist = Table(table_data, colWidths=[38, 182, 58, 52, 84, 90])
    t_hist.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), st['primary']),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, st['light_bg']]),
    ]))
    story.append(t_hist)
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. Justificación de Cada Historia Comprometida", st['h1']))
    story.append(Paragraph("3.1 Capacidad del Equipo (~3 Semanas)", st['h2']))
    story.append(Paragraph("El equipo de 3 integrantes dispuso de 3 semanas (~10 a 12 horas/semana por persona = <b>90 a 108 horas-hombre totales</b>). Considerando ~4.5 horas por Story Point (desarrollo fullstack, documentación en inglés, pruebas automatizadas, notebook y despliegue en la nube), comprometer <b>21 SP (7 SP por integrante)</b> garantizó una carga sostenible sin deuda técnica.", st['body']))

    story.append(Paragraph("3.2 Dependencias Técnicas y Justificación Individual por Historia", st['h2']))
    story.append(Paragraph("• <b>HU-04 (Login JWT — 3 SP):</b> Cimiento técnico del sprint. Provee la firma HS256 y el inyector <code>get_current_user</code> del cual dependen directamente HU-02, HU-03, HU-05, HU-06 y HU-07.", st['bullet']))
    story.append(Paragraph("• <b>HU-01 (Registro de Clientes — 5 SP):</b> Punto de entrada para compradores (rol <code>CLIENTE</code>). Implementa el modelo relacional, unicidad de DNI/email y cifrado <code>bcrypt</code>, habilitando cuentas reales para probar login y perfil.", st['bullet']))
    story.append(Paragraph("• <b>HU-05 (Logout — 1 SP):</b> Cierra el ciclo de vida de la sesión iniciada en HU-04 limpiando credenciales en cliente (<code>AuthContext</code>) y confirmando en <code>POST /auth/logout</code>.", st['bullet']))
    story.append(Paragraph("• <b>HU-07 (Perfil y Monedero — 3 SP):</b> Depende de HU-04 (<code>GET/PUT /auth/me</code>). Permite gestionar teléfono y dirección de envío (RF-021) y consultar el saldo del monedero virtual (RF-037), requisito previo para futuras compras.", st['bullet']))
    story.append(Paragraph("• <b>HU-06 (Cambio de Contraseña — 2 SP):</b> Depende de HU-04 y HU-07. Cumple RF-028 verificando criptográficamente la contraseña actual e impidiendo reutilizar la misma clave antes de re-hashear con <code>bcrypt</code>.", st['bullet']))
    story.append(Paragraph("• <b>HU-02 (Creación de Administradores por Root — 5 SP):</b> Depende de HU-04 y del guardián <code>require_roles(['ROOT'])</code>. Cumple RF-030 (prohibido el autorregistro de administradores; solo Root los crea y audita). Es prerrequisito para que en el Sprint 2 los administradores gestionen libros.", st['bullet']))
    story.append(Paragraph("• <b>HU-03 (Restricción de Compras RF-031 — 2 SP):</b> Depende de HU-01, HU-02 y HU-04. Implementa el middleware <code>verify_client_only</code> que bloquea con <code>HTTP 403 Forbidden</code> cualquier compra o reserva intentada por <code>ADMINISTRADOR</code> o <code>ROOT</code>.", st['bullet']))

    story.append(Paragraph("3.3 Prioridad Frente al Resto del Backlog", st['h2']))
    story.append(Paragraph("Construir catálogo, inventario o carrito sin tener autenticados los 3 roles (<code>ROOT</code>, <code>ADMINISTRADOR</code>, <code>CLIENTE</code>) y sus permisos RBAC habría obligado a exponer endpoints sin seguridad o con usuarios ficticios. Por ello, el módulo de Identidad y Seguridad tuvo prioridad máxima.", st['body']))

    story.append(Paragraph("4. Historias que Quedaron Fuera del Sprint 1 y Por Qué", st['h1']))
    story.append(Paragraph("• <b>Catálogo e Inventario por Ejemplar Físico (HU-08, HU-09, HU-10, HU-10b, HU-14 — 27 SP):</b> Requieren que el rol <code>ADMINISTRADOR</code> (HU-02) esté creado y auditado. Además, sumar 27 SP habría duplicado la capacidad del equipo. Pasan al <b>Sprint 2 (Nota 3)</b>.", st['bullet']))
    story.append(Paragraph("• <b>Reservas 24h, Carrito y Pagos (HU-11, HU-12, HU-13 — 16 SP):</b> Dependen de que existan libros y ejemplares físicos en base de datos (Sprint 2). Pasan al <b>Sprint 3</b>.", st['bullet']))
    story.append(Paragraph("• <b>Logística, Envíos y Devoluciones QR (HU-14, HU-15, HU-20, HU-21 — 14 SP):</b> Historias <i>Should Have / Could Have</i> que requieren compras previas. Pasan al <b>Sprint 4</b>.", st['bullet']))

    story.append(Paragraph("5. Criterios de Aceptación por Historia Comprometida", st['h1']))
    story.append(Paragraph("• <b>HU-01 (Registro):</b> CA-01: DNI y email únicos + clave >= 6 caracteres en <code>POST /auth/register</code> retorna <code>201 Created</code> con rol <code>CLIENTE</code> y hash <code>bcrypt</code>. CA-02: DNI o email repetido retorna <code>400 Bad Request</code>. CA-03: Validación de confirmación de clave y Ley 1581.", st['bullet']))
    story.append(Paragraph("• <b>HU-04 (Login JWT):</b> CA-01: Credenciales válidas en <code>POST /auth/login</code> retornan <code>200 OK</code> y JWT (HS256, 24h, claims: <code>sub</code>, <code>rol</code>, <code>user_id</code>, <code>nombre</code>). CA-02: Clave o email erróneo retorna <code>401 Unauthorized</code>. CA-03: Redirección automática según rol.", st['bullet']))
    story.append(Paragraph("• <b>HU-05 (Logout):</b> CA-01: Al cerrar sesión, invoca <code>POST /auth/logout</code> (<code>200 OK</code>), limpia <code>localStorage</code>, pasa a <code>VISITANTE</code> y bloquea rutas privadas.", st['bullet']))
    story.append(Paragraph("• <b>HU-06 (Cambio de Clave):</b> CA-01: Clave actual incorrecta en <code>PUT /auth/change-password</code> retorna <code>400 Bad Request</code>. CA-02: Nueva clave igual a la actual retorna <code>400 Bad Request</code>. CA-03: Clave válida re-hashea con <code>bcrypt</code> y retorna <code>200 OK</code>.", st['bullet']))
    story.append(Paragraph("• <b>HU-07 (Perfil y Monedero):</b> CA-01: <code>GET /auth/me</code> retorna perfil y saldo (<code>$150.000 COP</code>). CA-02: <code>PUT /auth/me</code> actualiza teléfono y dirección (<code>200 OK</code>). CA-03: Impide modificar DNI, email, rol o saldo.", st['bullet']))
    story.append(Paragraph("• <b>HU-02 (Crear Admin por Root):</b> CA-01: Rol <code>ROOT</code> en <code>POST /admin/create-admin</code> crea <code>ADMINISTRADOR</code> auditado (<code>201 Created</code>). CA-02: <code>CLIENTE</code> o <code>ADMINISTRADOR</code> intentando acceder recibe <code>403 Forbidden</code>. CA-03: Root puede activar/suspender cuentas.", st['bullet']))
    story.append(Paragraph("• <b>HU-03 (Restricción RF-031):</b> CA-01/CA-02: <code>ADMINISTRADOR</code> o <code>ROOT</code> en <code>POST /compras/validar-permiso-compra-reserva</code> recibe <code>403 Forbidden</code>. CA-03: <code>CLIENTE</code> recibe <code>200 OK</code>.", st['bullet']))

    story.append(Paragraph("6. Definition of Done (DoD) del Equipo", st['h1']))
    dod_text = (
        "<b>Una historia se considera 'DONE' (Terminada) únicamente cuando cumple estos 6 criterios:</b><br/>"
        "1. <b>Integrada:</b> Backend (FastAPI + SQLAlchemy) + Base de Datos (PostgreSQL/SQLite) + Frontend (React/TS) comunicándose extremo a extremo.<br/>"
        "2. <b>Documentada en inglés:</b> Docstrings PEP-257, esquemas Pydantic y comentarios JSDoc en inglés técnico.<br/>"
        "3. <b>Probada automáticamente:</b> Casos de éxito y error (400, 401, 403) aprobados al 100% en <code>backend/test_sprint1_api.py</code>.<br/>"
        "4. <b>Reproducible en Notebook:</b> Verificada con <code>assert</code> en <code>notebooks/demo_sprint1.ipynb</code>.<br/>"
        "5. <b>Trazable en Git y Tablero:</b> Commits con prefijo <code>HU-XX:</code>, vinculada a su Issue en GitHub Projects y desplegada en Vercel + Render.<br/>"
        "6. <b>Demostrable en vivo:</b> Operativa en tiempo real para la sustentación ante el Product Owner."
    )
    t_dod = Table([[Paragraph(dod_text, st['meta'])]], colWidths=[504])
    t_dod.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), st['light_bg']),
        ('BOX', (0, 0), (-1, -1), 1, st['accent_green']),
        ('PADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(t_dod)
    return story


def build_notas_sustentacion_story(st):
    story = []
    add_header_block(
        story, st,
        "5. NOTAS DE SUSTENTACIÓN (DOCUMENTO BREVE)",
        "Nota 2 — Sprint Review 1: Primer Incremento Funcional (20%)"
    )

    story.append(Paragraph("1. ¿Qué se comprometió al inicio del Sprint 1?", st['h1']))
    story.append(Paragraph(
        "Al inicio del Sprint 1, el equipo comprometió <b>21 Story Points</b> distribuidos en <b>7 Historias de Usuario Must Have</b> (7 SP por integrante), con el objetivo de entregar el módulo de identidad, autenticación JWT y control de acceso basado en roles (RBAC) 100% funcional y desplegado:",
        st['body']
    ))
    story.append(Paragraph("• <b>HU-01 (5 SP — Edwin Osorio):</b> Registro de nuevos clientes con validación de DNI/email únicos y hashing <code>bcrypt</code> (RF-027, RF-029).", st['bullet']))
    story.append(Paragraph("• <b>HU-04 (3 SP — Jose David Marín):</b> Inicio de sesión con emisión de Bearer Token JWT firmado (HS256, 24h) y claims de rol (RF-026, RF-028).", st['bullet']))
    story.append(Paragraph("• <b>HU-05 (1 SP — Jose David Marín):</b> Cierre de sesión (Logout) e invalidación del estado de sesión en cliente y servidor (RF-026).", st['bullet']))
    story.append(Paragraph("• <b>HU-06 (2 SP — Edwin Osorio):</b> Cambio seguro de contraseña validando clave actual e impidiendo reutilización (RF-028).", st['bullet']))
    story.append(Paragraph("• <b>HU-07 (3 SP — Jose David Marín):</b> Consulta y actualización de perfil, dirección de envío y monedero virtual (RF-021, RF-028, RF-037).", st['bullet']))
    story.append(Paragraph("• <b>HU-02 (5 SP — Maicol Londoño):</b> Creación exclusiva de Administradores por el Superadmin Root con auditoría (RF-030).", st['bullet']))
    story.append(Paragraph("• <b>HU-03 (2 SP — Maicol Londoño):</b> Restricción estricta (<code>HTTP 403 Forbidden</code>) que prohíbe a Administradores y Root realizar compras o reservas (RF-031).", st['bullet']))

    story.append(Paragraph("2. Historias no completadas y por qué (Respuesta Honesta)", st['h1']))
    story.append(Paragraph(
        "• <b>Historias comprometidas pendientes:</b> <b>0 historias sin completar (7 de 7 historias comprometidas fueron terminadas = 21 de 21 Story Points al 100%).</b>",
        st['bullet']
    ))
    story.append(Paragraph(
        "• <b>Reflexión honesta sobre el alcance:</b> En la primera semana consideramos incluir también un CRUD preliminar de libros dentro de este mismo sprint para que la prueba de compra mostrara títulos desde la base de datos. Sin embargo, al enfrentar el trabajo real de desplegar en la nube (Vercel + Render + Supabase PostgreSQL), escribir la suite de pruebas automatizadas con casos borde y contenedorizar con Docker, reconocimos honestamente que abarcar el CRUD de libros habría dejado ambos módulos incompletos. Decidimos enfocar toda la capacidad en cerrar al 100% las 7 historias comprometidas de seguridad y RBAC sin deuda técnica.",
        st['bullet']
    ))

    story.append(Paragraph("3. Decisiones Técnicas no Previstas en el Plan Original", st['h1']))
    story.append(Paragraph(
        "Durante la ejecución del Sprint 1 tomamos <b>5 decisiones técnicas emergentes</b> que no estaban en el documento original de la Nota 1:",
        st['body']
    ))
    story.append(Paragraph("1. <b>Migración a Base de Datos Cloud en PostgreSQL (Supabase) con Fallback SQLite:</b> Inicialmente usamos solo SQLite local. Al desplegar en Render detectamos que el disco local del contenedor es efímero (se reinicia en cada deploy). Configuramos PostgreSQL en Supabase mediante Session Pooler IPv4 (<code>DATABASE_URL</code>) para producción y mantuvimos SQLite automático para pruebas locales y el Notebook.", st['bullet']))
    story.append(Paragraph("2. <b>Estandarización de Python 3.10.14 y UTF-8 en Render:</b> Render intentó ejecutar por defecto Python 3.14, rompiendo la compilación de <code>greenlet/SQLAlchemy</code>, sumado a un archivo <code>requirements.txt</code> en UTF-16LE. Se recodificó a UTF-8 agregando <code>psycopg2-binary</code> y se fijó <code>.python-version</code> en <code>3.10.14</code>.", st['bullet']))
    story.append(Paragraph("3. <b>Tipado Estático de Entorno en Vite (<code>vite-env.d.ts</code>) y <code>vercel.json</code>:</b> En Vercel, el acceso dinámico a <code>import.meta.env</code> impedía que Vite reemplazara estáticamente la URL del backend en el build de producción. Se creó <code>vite-env.d.ts</code> y las reglas SPA en <code>vercel.json</code>.", st['bullet']))
    story.append(Paragraph("4. <b>Simulador Interactivo en Vivo para la Regla RF-031 (HU-03):</b> Como el carrito completo es del Sprint 3, creamos un módulo interactivo en <code>ProfilePage.tsx</code> conectado a <code>POST /api/v1/compras/validar-permiso-compra-reserva</code> para demostrar en vivo el bloqueo <code>403 Forbidden</code> a Administradores/Root frente al <code>200 OK</code> de Clientes.", st['bullet']))
    story.append(Paragraph("5. <b>Semilla Idempotente (<code>init_db.py</code>) y Botones de Autorelleno en Login:</b> Se agregaron botones de carga rápida en <code>LoginPage.tsx</code> para alternar en un clic entre Root, Administrador y Cliente durante los minutos de la sustentación en vivo.", st['bullet']))

    story.append(Paragraph("4. Distribución del Trabajo por Integrante y Cuellos de Botella", st['h1']))
    dist_data = [
        [Paragraph("Integrante", st['th']), Paragraph("Historias", st['th']), Paragraph("SP", st['th']), Paragraph("Responsabilidades y Entregables Técnicos Ejecutados", st['th'])],
        [Paragraph("Jose David Marín Giraldo", st['td']), Paragraph("HU-04, HU-05, HU-07", st['td_bold']), Paragraph("7 SP", st['td_bold']), Paragraph("Motor JWT (security.py), dependencias RBAC (deps.py), endpoints /login, /logout y /me, AuthContext.tsx, despliegue Vercel/Render/Supabase y demo_sprint1.ipynb.", st['td'])],
        [Paragraph("Edwin Osorio Cartagena", st['td']), Paragraph("HU-01, HU-06", st['td_bold']), Paragraph("7 SP", st['td_bold']), Paragraph("Registro de clientes con DNI/email único (RegisterPage.tsx), cambio seguro de contraseña (ProfilePage.tsx) y suite de pruebas automatizadas (test_sprint1_api.py).", st['td'])],
        [Paragraph("Maicol Londoño Hernández", st['td']), Paragraph("HU-02, HU-03", st['td_bold']), Paragraph("7 SP", st['td_bold']), Paragraph("Gestión exclusiva de Administradores por Root (admin.py, AdminPage.tsx), restricción de compras RF-031 (compras.py) y Dockerización (Dockerfile, docker-compose.yml).", st['td'])],
    ]
    t_dist = Table(dist_data, colWidths=[115, 75, 34, 280])
    t_dist.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), st['secondary']),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, st['light_bg']]),
    ]))
    story.append(t_dist)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Cuellos de Botella y Solución Aplicada:</b>", st['h2']))
    story.append(Paragraph("• <b>Dependencia bloqueante en HU-04 (Middleware JWT):</b> Al inicio del sprint, las historias HU-02, HU-03 y HU-06 dependían de que el token JWT y <code>get_current_user</code> estuvieran listos. <i>Solución:</i> Priorizamos construir primero <code>security.py</code> y publicar los esquemas en Swagger (<code>/docs</code>) para destrabar el trabajo en paralelo.", st['bullet']))
    story.append(Paragraph("• <b>Integración Cloud y CORS entre Vercel, Render y Supabase:</b> Surgieron bloqueos iniciales de CORS y formato de cadena de conexión (<code>postgres://</code> vs <code>postgresql://</code>). <i>Solución:</i> Normalización automática de la URL en <code>session.py</code> y configuración explícita de orígenes permitidos.", st['bullet']))

    story.append(Paragraph("5. ¿Qué pasa al Backlog del Siguiente Sprint (Nota 3 — Sprint 2)?", st['h1']))
    story.append(Paragraph(
        "Con la seguridad y los roles terminados, pasan al <b>Sprint 2 (Nota 3)</b> las historias del <b>Módulo de Catálogo, Gestión de Libros e Inventario por Ejemplar Físico (~25 Story Points)</b>:",
        st['body']
    ))
    story.append(Paragraph("• <b>[HU-08] Consulta y búsqueda avanzada de libros en el catálogo (5 SP — Must Have):</b> Búsqueda y filtrado público por título, autor, ISBN, categoría y precio (RF-001, RF-005).", st['bullet']))
    story.append(Paragraph("• <b>[HU-09 / HU-10] Gestión CRUD de libros por Administrador (5 SP — Must Have):</b> Alta, edición bibliográfica/precio y baja de libros protegida con el rol <code>ADMINISTRADOR</code> (RF-001, RF-003, RF-004).", st['bullet']))
    story.append(Paragraph("• <b>[HU-10b] Control de inventario por ejemplar físico (5 SP — Must Have):</b> Gestión de copias individuales (código único, estado nuevo/usado y stock disponible) (RF-002, RF-005).", st['bullet']))
    story.append(Paragraph("• <b>[HU-14] Vista administrativa de existencias y alertas de agotados (5 SP — Must Have):</b> Panel de control de stock para personal de tienda (RF-006).", st['bullet']))
    story.append(Paragraph("• <b>[HU-11] Reserva temporal de ejemplares por 24 horas (5 SP — Must Have):</b> Bloqueo temporal de inventario para clientes autenticados aplicando la restricción RF-031 (RF-010).", st['bullet']))

    return story


def generate_pdf_file(filepath, story, header_right):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(story, canvasmaker=lambda *a, **kw: NumberedCanvas(*a, header_right=header_right, **kw))
    print(f"Generated: {filepath}")


if __name__ == '__main__':
    out_dir = os.path.dirname(os.path.abspath(__file__))
    st = get_custom_styles()

    generate_pdf_file(
        os.path.join(out_dir, "1_Sprint_Planning_Documentado.pdf"),
        build_sprint_planning_story(st),
        "ENTREGABLE 1: SPRINT PLANNING"
    )

    generate_pdf_file(
        os.path.join(out_dir, "5_Notas_de_Sustentacion.pdf"),
        build_notas_sustentacion_story(st),
        "ENTREGABLE 5: NOTAS DE SUSTENTACIÓN"
    )

    combined_story = build_sprint_planning_story(st) + [PageBreak()] + build_notas_sustentacion_story(st)
    generate_pdf_file(
        os.path.join(out_dir, "IS873_Nota2_Sprint_Review_1_Consolidado.pdf"),
        combined_story,
        "NOTA 2: SPRINT PLANNING + SUSTENTACIÓN"
    )
