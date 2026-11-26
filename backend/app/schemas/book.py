"""
Pydantic Schemas for Book Catalog, Physical Copies (Ejemplares), Shopping Cart, and Orders.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class BookCopyResponse(BaseModel):
    """Schema representing an individual physical book copy (RF-002)."""
    id: int = Field(..., description="Unique database ID of the copy")
    codigo_unico: str = Field(..., description="Unique physical barcode/code (e.g., LIB-001-EJ001)")
    libro_id: int = Field(..., description="Parent book ID")
    sede: str = Field(..., description="Physical store branch or warehouse")
    estado: str = Field(..., description="Lifecycle state: DISPONIBLE, VENDIDO, DADO_DE_BAJA")
    fecha_ingreso: datetime = Field(..., description="Registration timestamp")

    class Config:
        orm_mode = True


class BookImageResponse(BaseModel):
    """Schema representing an uploaded or linked book reference photo."""
    id: int = Field(..., description="Image unique ID")
    libro_id: int = Field(..., description="Book ID")
    url: str = Field(..., description="Public image URL or relative static path")
    es_portada: bool = Field(False, description="Whether this is the primary cover photo")
    orden: int = Field(0, description="Display order index")
    fecha_subida: datetime = Field(..., description="Upload timestamp")

    class Config:
        orm_mode = True


class BookImageAddRequest(BaseModel):
    """Input payload to register a reference photo for a book."""
    url: str = Field(..., min_length=1, max_length=600, description="Public URL or uploaded file path")
    es_portada: bool = Field(False, description="Set as the primary cover image")


class BookCreate(BaseModel):
    """Input schema for registering a new book and its initial N physical copies (RF-001, RF-002)."""
    isbn: str = Field(..., min_length=5, max_length=40, example="978-0134494166", description="Unique ISBN or ISSN code")
    titulo: str = Field(..., min_length=2, max_length=200, example="Clean Architecture", description="Book title")
    autor: str = Field(..., min_length=2, max_length=150, example="Robert C. Martin", description="Book author")
    editorial: str = Field(..., min_length=2, max_length=120, example="Prentice Hall", description="Publisher name")
    genero: str = Field(..., min_length=2, max_length=80, example="Ingeniería de Software", description="Literary genre or category")
    idioma: str = Field("Español", max_length=50, example="Español", description="Publication language")
    anio_publicacion: int = Field(2024, ge=1450, le=2030, example=2018, description="Publication year")
    numero_paginas: int = Field(250, ge=1, le=10000, example=432, description="Total number of pages")
    estado_libro: str = Field("NUEVO", example="NUEVO", description="Book condition: NUEVO or USADO")
    precio: float = Field(..., gt=0, example=65000.0, description="Sale price in COP")
    descripcion: Optional[str] = Field(None, max_length=1000, description="Book synopsis")
    portada_url: Optional[str] = Field(None, max_length=500, description="Cover image URL or uploaded path")
    imagenes_urls: Optional[List[str]] = Field(None, description="Optional additional reference image URLs or uploaded paths")
    cantidad_ejemplares: int = Field(3, ge=1, le=50, description="Initial number of physical copies to generate automatically")
    sede: str = Field("Sede Principal Pereira", max_length=100, description="Initial warehouse/branch")


class BookUpdate(BaseModel):
    """Input schema for updating bibliographic details of an existing book (RF-003)."""
    titulo: Optional[str] = Field(None, min_length=2, max_length=200)
    autor: Optional[str] = Field(None, min_length=2, max_length=150)
    editorial: Optional[str] = Field(None, min_length=2, max_length=120)
    genero: Optional[str] = Field(None, min_length=2, max_length=80)
    idioma: Optional[str] = Field(None, max_length=50)
    anio_publicacion: Optional[int] = Field(None, ge=1450, le=2030)
    numero_paginas: Optional[int] = Field(None, ge=1, le=10000)
    estado_libro: Optional[str] = Field(None)
    precio: Optional[float] = Field(None, gt=0)
    descripcion: Optional[str] = Field(None, max_length=1000)
    portada_url: Optional[str] = Field(None, max_length=500)
    es_novedad: Optional[bool] = Field(None)


class AddCopiesRequest(BaseModel):
    """Input schema for adding new physical copies to an existing book (RF-002, RF-005)."""
    cantidad: int = Field(..., ge=1, le=50, example=2, description="Number of new physical copies to generate")
    sede: str = Field("Sede Principal Pereira", max_length=100, description="Target branch/warehouse")


class DecommissionCopyRequest(BaseModel):
    """Input schema for taking a physical copy out of circulation (RF-004)."""
    motivo: str = Field("Deterioro físico", max_length=200, description="Reason for decommissioning the copy")


class BookResponse(BaseModel):
    """Public and administrative book response enriched with real-time physical copy counts."""
    id: int
    isbn: str
    titulo: str
    autor: str
    editorial: str
    genero: str
    idioma: str
    anio_publicacion: int
    numero_paginas: int
    estado_libro: str
    precio: float
    descripcion: Optional[str] = None
    portada_url: Optional[str] = None
    es_novedad: bool
    historico_agotado: bool
    fecha_registro: datetime
    stock_disponible: int = Field(..., description="Count of copies currently in DISPONIBLE state")
    stock_vendido: int = Field(0, description="Count of copies in VENDIDO state")
    stock_total_activo: int = Field(0, description="Total active copies (excluding DADO_DE_BAJA)")
    ejemplares: Optional[List[BookCopyResponse]] = None
    imagenes: List[BookImageResponse] = []

    class Config:
        orm_mode = True


class CartAddRequest(BaseModel):
    """Input schema to add a book with quantity into the shopping cart (RF-009, RF-011, RF-012)."""
    libro_id: int = Field(..., description="Target book ID")
    cantidad: int = Field(1, ge=1, le=3, description="Quantity of copies (max 3 per title)")


class CartItemUpdate(BaseModel):
    """Input schema to update the quantity of a book already in the shopping cart (RF-012)."""
    cantidad: int = Field(..., ge=1, le=3, description="New quantity (1 to 3)")


class CartItemDetail(BaseModel):
    """Individual item inside the customer's active shopping cart."""
    id: int
    libro_id: int
    titulo: str
    autor: str
    portada_url: Optional[str] = None
    precio_unitario: float
    cantidad: int
    subtotal: float
    stock_disponible: int = Field(..., description="Current count of available physical copies in real-time")

    class Config:
        orm_mode = True


class CartSummaryResponse(BaseModel):
    """Full shopping cart state for the authenticated customer."""
    items: List[CartItemDetail]
    total_items: int
    titulos_distintos: int
    subtotal: float
    saldo_cliente: float
    alcance_saldo: bool
    todos_disponibles: bool


class WalletTopupRequest(BaseModel):
    """Input schema for recharging the customer's virtual wallet balance (RF-037)."""
    monto: float = Field(..., gt=0, le=10000000, example=100000.0, description="Amount in COP to add to wallet balance")


class WalletBalanceResponse(BaseModel):
    """Response containing customer's wallet balance."""
    email: str
    nombre_completo: str
    saldo_disponible: float


class CheckoutRequest(BaseModel):
    """Optional shipping address override when confirming purchase with virtual wallet (RF-013, RF-021)."""
    direccion_envio: Optional[str] = Field(None, max_length=250, description="Delivery address (uses profile address if omitted)")


class OrderItemResponse(BaseModel):
    """Individual physical book copy purchased within an order."""
    id: int
    libro_id: int
    ejemplar_id: int
    titulo_libro: str
    codigo_ejemplar: str
    precio_unitario: float

    class Config:
        orm_mode = True


class OrderResponse(BaseModel):
    """Completed or cancelled purchase order response (RF-014, RF-015, RF-022)."""
    id: int
    cliente_id: int
    total: float
    direccion_envio: str
    estado: str
    fecha_compra: datetime
    fecha_cancelacion: Optional[datetime] = None
    detalles: List[OrderItemResponse] = []

    class Config:
        orm_mode = True
