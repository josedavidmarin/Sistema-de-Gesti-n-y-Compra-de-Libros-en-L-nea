"""
API Endpoints for Book Catalog, Physical Copies, Inventory, and Administrative Management.

Implements requirements:
- RF-001: Register book bibliographic details.
- RF-002: Unique physical copy code generation (LIB-XXX-EJYYY).
- RF-003: Update book metadata.
- RF-004: Decommission physical copy with reason.
- RF-005: Add new physical copies to existing titles.
- RF-006: Automatic 'Histórico Agotado' state flag.
- RF-007: Automatic 'Novedades' designation.
- RF-008: Search and filtering catalog by title, author, genre, price, novelty, and availability.
"""

import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_optional_current_user, require_roles
from app.models.user import User, RoleEnum
from app.models.book import Book, BookCopy, BookImage, CopyStatusEnum
from app.schemas.book import (
    BookCreate,
    BookUpdate,
    BookResponse,
    BookCopyResponse,
    BookImageResponse,
    BookImageAddRequest,
    AddCopiesRequest,
    DecommissionCopyRequest,
)

router = APIRouter()


def _enrich_book(book: Book, include_copies: bool = False) -> BookResponse:
    """Helper to compute real-time copy counters and convert ORM Book to BookResponse."""
    disponibles = [c for c in book.ejemplares if c.estado == CopyStatusEnum.DISPONIBLE.value]
    vendidos = [c for c in book.ejemplares if c.estado == CopyStatusEnum.VENDIDO.value]
    activos = [c for c in book.ejemplares if c.estado != CopyStatusEnum.DADO_DE_BAJA.value]

    copias_list = None
    if include_copies:
        copias_list = [
            BookCopyResponse(
                id=c.id,
                codigo_unico=c.codigo_unico,
                libro_id=c.libro_id,
                sede=c.sede,
                estado=c.estado,
                fecha_ingreso=c.fecha_ingreso,
            )
            for c in book.ejemplares
        ]

    imagenes_list = [
        BookImageResponse(
            id=img.id,
            libro_id=img.libro_id,
            url=img.url,
            es_portada=img.es_portada,
            orden=img.orden,
            fecha_subida=img.fecha_subida,
        )
        for img in (book.imagenes or [])
    ]

    return BookResponse(
        id=book.id,
        isbn=book.isbn,
        titulo=book.titulo,
        autor=book.autor,
        editorial=book.editorial,
        genero=book.genero,
        idioma=book.idioma,
        anio_publicacion=book.anio_publicacion,
        numero_paginas=book.numero_paginas,
        estado_libro=book.estado_libro,
        precio=book.precio,
        descripcion=book.descripcion,
        portada_url=book.portada_url,
        es_novedad=book.es_novedad,
        historico_agotado=book.historico_agotado,
        fecha_registro=book.fecha_registro,
        stock_disponible=len(disponibles),
        stock_vendido=len(vendidos),
        stock_total_activo=len(activos),
        ejemplares=copias_list,
        imagenes=imagenes_list,
    )


@router.get("", response_model=List[BookResponse], summary="List and search books catalog (RF-007, RF-008)")
def listar_libros(
    q: Optional[str] = Query(None, description="Search term for title, author, or ISBN"),
    genero: Optional[str] = Query(None, description="Filter by literary genre"),
    es_novedad: Optional[bool] = Query(None, description="Filter by novedades"),
    solo_disponibles: bool = Query(False, description="Filter only books with stock_disponible > 0"),
    historico_agotado: Optional[bool] = Query(None, description="Filter by historico_agotado"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Public catalog listing with multi-parameter search and filtering (RF-008).
    Administrators and Root receive physical copy inventory breakdown.
    """
    query = db.query(Book)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Book.titulo.ilike(term),
                Book.autor.ilike(term),
                Book.isbn.ilike(term),
            )
        )

    if genero:
        query = query.filter(Book.genero.ilike(f"%{genero.strip()}%"))

    if es_novedad is not None:
        query = query.filter(Book.es_novedad == es_novedad)

    if historico_agotado is not None:
        query = query.filter(Book.historico_agotado == historico_agotado)

    books = query.order_by(Book.id.desc()).all()

    is_admin = current_user and current_user.rol in [RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value]

    results = []
    for b in books:
        enriched = _enrich_book(b, include_copies=is_admin)
        if solo_disponibles and enriched.stock_disponible <= 0:
            continue
        results.append(enriched)

    return results


@router.get("/{libro_id}", response_model=BookResponse, summary="Get single book details")
def obtener_libro(
    libro_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Retrieves full details of a book by its database ID."""
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    is_admin = current_user and current_user.rol in [RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value]
    return _enrich_book(book, include_copies=is_admin)


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED, summary="Create new book with initial copies (RF-001, RF-002)")
def crear_libro(
    payload: BookCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Creates a new book title in the catalog and generates its initial physical copies (RF-001, RF-002).
    Requires ROOT or ADMINISTRADOR role.
    """
    existing_isbn = db.query(Book).filter(Book.isbn == payload.isbn.strip()).first()
    if existing_isbn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un libro registrado con el ISBN {payload.isbn}."
        )

    main_cover = payload.portada_url.strip() if payload.portada_url else None
    if not main_cover and payload.imagenes_urls and len(payload.imagenes_urls) > 0:
        main_cover = payload.imagenes_urls[0].strip()

    book = Book(
        isbn=payload.isbn.strip(),
        titulo=payload.titulo.strip(),
        autor=payload.autor.strip(),
        editorial=payload.editorial.strip(),
        genero=payload.genero.strip(),
        idioma=payload.idioma.strip(),
        anio_publicacion=payload.anio_publicacion,
        numero_paginas=payload.numero_paginas,
        estado_libro=payload.estado_libro.strip(),
        precio=payload.precio,
        descripcion=payload.descripcion.strip() if payload.descripcion else None,
        portada_url=main_cover,
        es_novedad=True,  # RF-007
        historico_agotado=False,
    )
    db.add(book)
    db.flush()

    # Register initial images in imagenes_libro
    added_urls = set()
    img_order = 0
    if main_cover:
        img_portada = BookImage(
            libro_id=book.id,
            url=main_cover,
            es_portada=True,
            orden=img_order,
        )
        db.add(img_portada)
        added_urls.add(main_cover)
        img_order += 1

    if payload.imagenes_urls:
        for extra_url in payload.imagenes_urls:
            cleaned = extra_url.strip()
            if cleaned and cleaned not in added_urls:
                is_first_cover = (main_cover is None and img_order == 0)
                img_extra = BookImage(
                    libro_id=book.id,
                    url=cleaned,
                    es_portada=is_first_cover,
                    orden=img_order,
                )
                db.add(img_extra)
                added_urls.add(cleaned)
                img_order += 1

    # Generate initial physical copies (RF-002)
    for idx in range(1, payload.cantidad_ejemplares + 1):
        codigo = f"LIB-{book.id:03d}-EJ{idx:03d}"
        copy = BookCopy(
            codigo_unico=codigo,
            libro_id=book.id,
            sede=payload.sede,
            estado=CopyStatusEnum.DISPONIBLE.value,
        )
        db.add(copy)

    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)


@router.put("/{libro_id}", response_model=BookResponse, summary="Update book metadata (RF-003)")
def actualizar_libro(
    libro_id: int,
    payload: BookUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """Updates bibliographic details of an existing book. Requires ROOT or ADMINISTRADOR."""
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)

    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)


@router.post("/{libro_id}/ejemplares", response_model=BookResponse, summary="Add physical copies to existing book (RF-002, RF-005)")
def agregar_ejemplares(
    libro_id: int,
    payload: AddCopiesRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Generates and associates new physical copies with unique codes to an existing book title (RF-002, RF-005).
    If the book was marked as historico_agotado, resets it to False.
    """
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    # Calculate next index
    existing_count = db.query(BookCopy).filter(BookCopy.libro_id == libro_id).count()

    for idx in range(1, payload.cantidad + 1):
        copy_idx = existing_count + idx
        codigo = f"LIB-{book.id:03d}-EJ{copy_idx:03d}"
        copy = BookCopy(
            codigo_unico=codigo,
            libro_id=book.id,
            sede=payload.sede,
            estado=CopyStatusEnum.DISPONIBLE.value,
        )
        db.add(copy)

    # If it was marked exhausted, it now has active stock
    if book.historico_agotado:
        book.historico_agotado = False

    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)


@router.patch("/ejemplares/{ejemplar_id}/dar-de-baja", response_model=BookCopyResponse, summary="Decommission physical copy (RF-004)")
def dar_de_baja_ejemplar(
    ejemplar_id: int,
    payload: DecommissionCopyRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Changes copy status to DADO_DE_BAJA (RF-004).
    If no available copies remain for the book, automatically marks it as historico_agotado = True (RF-006).
    """
    copy = db.query(BookCopy).filter(BookCopy.id == ejemplar_id).first()
    if not copy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejemplar no encontrado.")

    if copy.estado == CopyStatusEnum.VENDIDO.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede dar de baja un ejemplar que ya ha sido vendido."
        )

    copy.estado = CopyStatusEnum.DADO_DE_BAJA.value

    # Check remaining available copies for the parent book
    book = copy.libro
    remaining_disponibles = (
        db.query(BookCopy)
        .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
        .count()
    )
    if remaining_disponibles == 0:
        book.historico_agotado = True

    db.commit()
    db.refresh(copy)
    return copy


# --------------------------------------------------------------------------
# Endpoints de Gestión de Imágenes y Fotos de Referencia
# --------------------------------------------------------------------------

@router.post("/upload-imagen", summary="Upload an image file for book cover or reference photo")
def subir_imagen_libro(
    file: UploadFile = File(...),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Uploads an image file (.jpg, .jpeg, .png, .webp, .gif) to the local server
    and returns its accessible static URL.
    Requires ROOT or ADMINISTRADOR role.
    """
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    filename_orig = file.filename or "upload.jpg"
    ext = os.path.splitext(filename_orig)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no permitido ({ext}). Extensiones válidas: {', '.join(allowed_extensions)}"
        )

    static_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "static", "uploads", "libros")
    )
    os.makedirs(static_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(static_dir, unique_name)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    relative_url = f"/static/uploads/libros/{unique_name}"
    return {
        "url": relative_url,
        "filename": unique_name,
        "mensaje": "Imagen subida exitosamente al servidor."
    }


@router.post("/{libro_id}/imagenes", response_model=BookResponse, summary="Add reference photo to book")
def agregar_imagen_libro(
    libro_id: int,
    payload: BookImageAddRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Adds a new reference photo or cover URL to an existing book title.
    Requires ROOT or ADMINISTRADOR role.
    """
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La URL de imagen no puede estar vacía.")

    is_portada = payload.es_portada
    if is_portada:
        for img in book.imagenes:
            img.es_portada = False
        book.portada_url = url
    elif not book.imagenes:
        is_portada = True
        book.portada_url = url

    next_order = len(book.imagenes)
    new_img = BookImage(
        libro_id=book.id,
        url=url,
        es_portada=is_portada,
        orden=next_order,
    )
    db.add(new_img)
    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)


@router.put("/{libro_id}/imagenes/{imagen_id}/marcar-portada", response_model=BookResponse, summary="Set image as primary cover")
def marcar_portada(
    libro_id: int,
    imagen_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Sets the specified reference image as the primary book cover.
    Requires ROOT or ADMINISTRADOR role.
    """
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    target_img = None
    for img in book.imagenes:
        if img.id == imagen_id:
            img.es_portada = True
            target_img = img
        else:
            img.es_portada = False

    if not target_img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada en este libro.")

    book.portada_url = target_img.url
    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)


@router.delete("/{libro_id}/imagenes/{imagen_id}", response_model=BookResponse, summary="Delete a reference image")
def eliminar_imagen_libro(
    libro_id: int,
    imagen_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([RoleEnum.ROOT.value, RoleEnum.ADMINISTRADOR.value])),
):
    """
    Removes a reference image from a book title.
    If the deleted image was the primary cover, the next remaining image is promoted to cover.
    Requires ROOT or ADMINISTRADOR role.
    """
    book = db.query(Book).filter(Book.id == libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    target_img = db.query(BookImage).filter(BookImage.id == imagen_id, BookImage.libro_id == libro_id).first()
    if not target_img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada en este libro.")

    was_portada = target_img.es_portada
    db.delete(target_img)
    db.flush()

    remaining = [img for img in book.imagenes if img.id != imagen_id]
    if was_portada:
        if remaining:
            remaining[0].es_portada = True
            book.portada_url = remaining[0].url
        else:
            book.portada_url = None

    db.commit()
    db.refresh(book)
    return _enrich_book(book, include_copies=True)
