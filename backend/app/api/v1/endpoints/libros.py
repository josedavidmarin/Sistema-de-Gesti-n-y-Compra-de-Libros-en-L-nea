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

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_optional_current_user, require_roles
from app.models.user import User, RoleEnum
from app.models.book import Book, BookCopy, CopyStatusEnum
from app.schemas.book import (
    BookCreate,
    BookUpdate,
    BookResponse,
    BookCopyResponse,
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
        portada_url=payload.portada_url.strip() if payload.portada_url else None,
        es_novedad=True,  # RF-007
        historico_agotado=False,
    )
    db.add(book)
    db.flush()

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
