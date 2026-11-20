"""
Database ORM Models for Catalog, Physical Copies (Ejemplares), Shopping Cart, and Purchase Orders.

Implements requirements:
- RF-001 to RF-007: Book catalog, unique physical copy code (Ejemplar), automatic 'Histórico Agotado' flag, and 'Novedades'.
- RF-008 to RF-015: Persistent shopping cart (without early copy locking), virtual wallet checkout with atomic stock deduction, and order cancellation with stock rollback.
"""

from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class CopyStatusEnum(str, enum.Enum):
    """Physical copy lifecycle states (RF-002, RF-004, RF-005, RF-012)."""
    DISPONIBLE = "DISPONIBLE"
    VENDIDO = "VENDIDO"
    DADO_DE_BAJA = "DADO_DE_BAJA"


class OrderStatusEnum(str, enum.Enum):
    """Order fulfillment and cancellation states (RF-014, RF-015, RF-022)."""
    EN_PREPARACION = "EN_PREPARACION"
    ENVIADO = "ENVIADO"
    ENTREGADO = "ENTREGADO"
    CANCELADA = "CANCELADA"


class Book(Base):
    """Master bibliographic record representing a book title in the catalog (RF-001)."""
    __tablename__ = "libros"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(40), unique=True, index=True, nullable=False)
    titulo = Column(String(200), index=True, nullable=False)
    autor = Column(String(150), index=True, nullable=False)
    editorial = Column(String(120), nullable=False)
    genero = Column(String(80), index=True, nullable=False)
    idioma = Column(String(50), nullable=False, default="Español")
    anio_publicacion = Column(Integer, nullable=False, default=2024)
    numero_paginas = Column(Integer, nullable=False, default=200)
    estado_libro = Column(String(20), nullable=False, default="NUEVO")  # NUEVO or USADO
    precio = Column(Float, nullable=False)
    descripcion = Column(String(1000), nullable=True)
    portada_url = Column(String(500), nullable=True)
    es_novedad = Column(Boolean, default=True)  # RF-007: Automatically added to news/novelties
    historico_agotado = Column(Boolean, default=False)  # RF-006: True when available physical copies == 0
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    ejemplares = relationship("BookCopy", back_populates="libro", cascade="all, delete-orphan")


class BookCopy(Base):
    """Individual physical copy (Ejemplar) with a unique identification code (RF-002)."""
    __tablename__ = "ejemplares"

    id = Column(Integer, primary_key=True, index=True)
    codigo_unico = Column(String(60), unique=True, index=True, nullable=False)
    libro_id = Column(Integer, ForeignKey("libros.id", ondelete="CASCADE"), nullable=False, index=True)
    sede = Column(String(100), nullable=False, default="Sede Principal Pereira")
    estado = Column(String(30), nullable=False, default=CopyStatusEnum.DISPONIBLE.value, index=True)
    fecha_ingreso = Column(DateTime, default=datetime.utcnow)

    libro = relationship("Book", back_populates="ejemplares")


class CartItem(Base):
    """
    Shopping cart item holding desired books and quantities for an authenticated customer (RF-009, RF-011, RF-012).
    Physical copies are NOT locked upon adding to cart; stock is deducted exclusively at checkout (atomic verification).
    """
    __tablename__ = "carrito_items"
    __table_args__ = (
        UniqueConstraint("cliente_id", "libro_id", name="uq_cliente_libro_carrito"),
    )

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    libro_id = Column(Integer, ForeignKey("libros.id", ondelete="CASCADE"), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False, default=1)
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    libro = relationship("Book")
    cliente = relationship("User")


class PurchaseOrder(Base):
    """Completed customer purchase order paid with the Virtual Wallet (RF-013, RF-014, RF-015, RF-037)."""
    __tablename__ = "ordenes_compra"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    total = Column(Float, nullable=False)
    direccion_envio = Column(String(250), nullable=False)
    estado = Column(String(30), nullable=False, default=OrderStatusEnum.EN_PREPARACION.value)
    fecha_compra = Column(DateTime, default=datetime.utcnow)
    fecha_cancelacion = Column(DateTime, nullable=True)

    detalles = relationship("PurchaseOrderItem", back_populates="orden", cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    """Line item within a PurchaseOrder linked to the specific physical copy sold (RF-002, RF-015)."""
    __tablename__ = "orden_detalles"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_compra.id", ondelete="CASCADE"), nullable=False, index=True)
    libro_id = Column(Integer, ForeignKey("libros.id"), nullable=False)
    ejemplar_id = Column(Integer, ForeignKey("ejemplares.id"), nullable=False)
    titulo_libro = Column(String(200), nullable=False)
    codigo_ejemplar = Column(String(60), nullable=False)
    precio_unitario = Column(Float, nullable=False)

    orden = relationship("PurchaseOrder", back_populates="detalles")
