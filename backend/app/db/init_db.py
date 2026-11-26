from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, RoleEnum
from app.models.book import Book, BookCopy, BookImage, CopyStatusEnum


SEED_BOOKS = [
    {
        "isbn": "978-0134494166",
        "titulo": "Clean Architecture: A Craftsman's Guide to Software Structure",
        "autor": "Robert C. Martin",
        "editorial": "Prentice Hall",
        "genero": "Ingeniería de Software",
        "idioma": "Español",
        "anio_publicacion": 2018,
        "numero_paginas": 432,
        "estado_libro": "NUEVO",
        "precio": 65000.0,
        "descripcion": "Principios universales de arquitectura de software para construir sistemas mantenibles, desacoplados y fáciles de probar.",
        "portada_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "es_novedad": True,
        "copias": 4,
    },
    {
        "isbn": "978-0201616224",
        "titulo": "The Pragmatic Programmer: Your Journey to Mastery",
        "autor": "Andrew Hunt & David Thomas",
        "editorial": "Addison-Wesley",
        "genero": "Ingeniería de Software",
        "idioma": "Español",
        "anio_publicacion": 2020,
        "numero_paginas": 352,
        "estado_libro": "NUEVO",
        "precio": 58000.0,
        "descripcion": "Edición del 20 aniversario con prácticas modernas de desarrollo ágil, automatización, diseño flexible y responsabilidad técnica.",
        "portada_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
        "es_novedad": True,
        "copias": 3,
    },
    {
        "isbn": "978-9584276957",
        "titulo": "Cien Años de Soledad (Edición Conmemorativa)",
        "autor": "Gabriel García Márquez",
        "editorial": "Editorial Sudamericana / RAE",
        "genero": "Literatura Latinoamericana",
        "idioma": "Español",
        "anio_publicacion": 2019,
        "numero_paginas": 496,
        "estado_libro": "NUEVO",
        "precio": 45000.0,
        "descripcion": "Obra cumbre del realismo mágico que narra la historia de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo.",
        "portada_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
        "es_novedad": True,
        "copias": 5,
    },
    {
        "isbn": "978-1492052203",
        "titulo": "Designing Data-Intensive Applications",
        "autor": "Martin Kleppmann",
        "editorial": "O'Reilly Media",
        "genero": "Bases de Datos y Sistemas Distribuidos",
        "idioma": "Inglés",
        "anio_publicacion": 2021,
        "numero_paginas": 616,
        "estado_libro": "NUEVO",
        "precio": 78000.0,
        "descripcion": "Guía fundamental sobre transacciones ACID, concurrencia, replicación, particionamiento y consistencia en sistemas de datos modernos.",
        "portada_url": "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80",
        "es_novedad": True,
        "copias": 2,
    },
    {
        "isbn": "978-9588870755",
        "titulo": "La Vorágine (Edición Crítica)",
        "autor": "José Eustasio Rivera",
        "editorial": "Editorial Minerva / Letras Colombianas",
        "genero": "Literatura Colombiana",
        "idioma": "Español",
        "anio_publicacion": 2024,
        "numero_paginas": 380,
        "estado_libro": "USADO",
        "precio": 32000.0,
        "descripcion": "Clásico de la literatura colombiana que retrata la travesía de Arturo Cova por los llanos y la selva amazónica durante la fiebre del caucho.",
        "portada_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
        "es_novedad": False,
        "copias": 1,  # Only 1 copy so it moves to 'Histórico Agotado' as soon as 1 client adds it to cart!
    },
    {
        "isbn": "978-0132350884",
        "titulo": "Clean Code: Manual de Estilo para el Desarrollo Ágil",
        "autor": "Robert C. Martin",
        "editorial": "Anaya Multimedia",
        "genero": "Ingeniería de Software",
        "idioma": "Español",
        "anio_publicacion": 2016,
        "numero_paginas": 464,
        "estado_libro": "NUEVO",
        "precio": 60000.0,
        "descripcion": "Técnicas prácticas de refactorización, nomenclatura clara, funciones pequeñas y pruebas unitarias limpias.",
        "portada_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
        "es_novedad": True,
        "copias": 3,
    },
]


def init_database():
    """Initializes all database tables and seeds initial users and book catalog idempotently."""
    # 1. Create all ORM tables (users, libros, ejemplares, carrito_items, ordenes_compra, orden_detalles)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 2. Verify or create Superadmin Root
        root_user = db.query(User).filter(User.email == settings.ROOT_EMAIL).first()
        if not root_user:
            root_user = User(
                dni=settings.ROOT_DNI,
                email=settings.ROOT_EMAIL,
                nombre=settings.ROOT_NOMBRE,
                apellido=settings.ROOT_APELLIDO,
                telefono="3000000000",
                direccion="Oficina Central / Rectoría del Sistema",
                hashed_password=get_password_hash(settings.ROOT_PASSWORD),
                rol=RoleEnum.ROOT.value,
                saldo_disponible=0.0,
                is_active=True,
            )
            db.add(root_user)
            db.commit()
            db.refresh(root_user)
            print(f"[*] Superadmin Root inicial creado: {settings.ROOT_EMAIL} (Pass: {settings.ROOT_PASSWORD})")

        # 3. Verify or create Demo Client
        cliente_demo = db.query(User).filter(User.email == "cliente.demo@gmail.com").first()
        if not cliente_demo:
            cliente_demo = User(
                dni="1088123456",
                email="cliente.demo@gmail.com",
                nombre="Carlos",
                apellido="Lector",
                telefono="3125554321",
                direccion="Carrera 27 # 4-10, Pereira",
                hashed_password=get_password_hash("Cliente2026!"),
                rol=RoleEnum.CLIENTE.value,
                saldo_disponible=150000.0,
                is_active=True,
            )
            db.add(cliente_demo)
            db.commit()
            print("[*] Cliente demo creado: cliente.demo@gmail.com (Pass: Cliente2026!)")

        # 4. Verify or create Demo Administrator
        admin_demo = db.query(User).filter(User.email == "admin.bodega@libreria.com").first()
        if not admin_demo:
            admin_demo = User(
                dni="9876543210",
                email="admin.bodega@libreria.com",
                nombre="Laura",
                apellido="Inventarios",
                telefono="3109876543",
                direccion="Sede Centro, Pereira",
                hashed_password=get_password_hash("Admin2026!"),
                rol=RoleEnum.ADMINISTRADOR.value,
                saldo_disponible=0.0,
                is_active=True,
                creado_por_id=root_user.id,
            )
            db.add(admin_demo)
            db.commit()
            print("[*] Administrador demo creado: admin.bodega@libreria.com (Pass: Admin2026!)")

        # 5. Seed initial catalog of books and physical copies (Ejemplares) if empty
        if db.query(Book).count() == 0:
            for item in SEED_BOOKS:
                copias_count = item["copias"]
                book = Book(
                    isbn=item["isbn"],
                    titulo=item["titulo"],
                    autor=item["autor"],
                    editorial=item["editorial"],
                    genero=item["genero"],
                    idioma=item["idioma"],
                    anio_publicacion=item["anio_publicacion"],
                    numero_paginas=item["numero_paginas"],
                    estado_libro=item["estado_libro"],
                    precio=item["precio"],
                    descripcion=item["descripcion"],
                    portada_url=item["portada_url"],
                    es_novedad=item["es_novedad"],
                    historico_agotado=(copias_count == 0),
                )
                db.add(book)
                db.flush()  # Obtain book.id

                for idx in range(1, copias_count + 1):
                    codigo = f"LIB-{book.id:03d}-EJ{idx:03d}"
                    copy = BookCopy(
                        codigo_unico=codigo,
                        libro_id=book.id,
                        sede="Sede Principal Pereira",
                        estado=CopyStatusEnum.DISPONIBLE.value,
                    )
                    db.add(copy)

                # Add initial cover image to BookImage table
                if item.get("portada_url"):
                    main_img = BookImage(
                        libro_id=book.id,
                        url=item["portada_url"],
                        es_portada=True,
                        orden=0,
                    )
                    db.add(main_img)

            db.commit()
            print(f"[*] Catálogo semilla inicializado con {len(SEED_BOOKS)} libros y sus ejemplares físicos únicos.")

        # 6. Ensure BookImage records exist for any existing books
        if db.query(BookImage).count() == 0:
            existing_books = db.query(Book).all()
            for b in existing_books:
                if b.portada_url:
                    img_cov = BookImage(
                        libro_id=b.id,
                        url=b.portada_url,
                        es_portada=True,
                        orden=0,
                    )
                    db.add(img_cov)
            db.commit()
            print(f"[*] Tabla de imágenes de referencia sincronizada con los libros existentes.")

    finally:
        db.close()


if __name__ == "__main__":
    init_database()
