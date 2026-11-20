"""
API Endpoints for Shopping Cart, Virtual Wallet Checkout, Concurrency, and Order Lifecycle.

Implements requirements:
- HU-03 / RF-031: Strict purchase restriction forbidding Administrator and Root roles from buying.
- RF-009, RF-011, RF-012: Persistent shopping cart with max 3 units per title and real-time stock inspection.
- RF-013, RF-037: Checkout with virtual wallet, atomic stock deduction, and immediate rejection if copies are exhausted.
- RF-014, RF-015, RF-022: Order tracking and cancellation with automatic wallet refund and physical copy restoration.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, verify_client_only, require_roles
from app.models.user import User, RoleEnum
from app.models.book import (
    Book,
    BookCopy,
    CartItem,
    PurchaseOrder,
    PurchaseOrderItem,
    CopyStatusEnum,
    OrderStatusEnum,
)
from app.schemas.user import GenericMessage
from app.schemas.book import (
    CartAddRequest,
    CartItemUpdate,
    CartItemDetail,
    CartSummaryResponse,
    CheckoutRequest,
    OrderResponse,
    WalletTopupRequest,
    WalletBalanceResponse,
)

router = APIRouter()


# --------------------------------------------------------------------------
# HU-03: RBAC Purchase/Reservation Permission Check (RF-031)
# --------------------------------------------------------------------------

class SolicitudCompraSimulada(BaseModel):
    """Input schema for purchase/reservation authorization check (HU-03 / RF-031)."""
    libro_id: int = Field(..., example=1, description="Target book identifier")
    cantidad: int = Field(1, ge=1, le=3, description="Requested copy quantity (max 3)")
    modalidad: str = Field("COMPRA", example="COMPRA", description="Transaction mode: COMPRA or RESERVA")


@router.post(
    "/validar-permiso-compra-reserva",
    response_model=GenericMessage,
    status_code=status.HTTP_200_OK,
    summary="HU-03: Strict Purchase Restriction for Administrators and Root (RF-031)",
)
def validar_permiso_compra(
    solicitud: SolicitudCompraSimulada,
    cliente_valido: User = Depends(verify_client_only),
):
    """
    Enforces Business Rule RF-031 / HU-03:
    Verifies that the requesting user strictly holds the CLIENTE role.
    If an ADMINISTRADOR or ROOT user attempts this operation, HTTP 403 is returned.
    """
    return GenericMessage(
        mensaje="Permiso concedido: el usuario es Cliente legítimo y puede operar.",
        detalle=f"Cliente: {cliente_valido.nombre} {cliente_valido.apellido} ({cliente_valido.email}) | Modalidad: {solicitud.modalidad}",
    )


# --------------------------------------------------------------------------
# Helper: Build Cart Summary
# --------------------------------------------------------------------------

def _build_cart_summary(db: Session, cliente: User) -> CartSummaryResponse:
    """Helper to assemble cart items, compute real-time available stock, and check balances."""
    cart_items = db.query(CartItem).filter(CartItem.cliente_id == cliente.id).all()

    details: List[CartItemDetail] = []
    total_subtotal = 0.0
    total_copies = 0
    all_available = True

    for item in cart_items:
        book = item.libro
        available_count = (
            db.query(BookCopy)
            .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
            .count()
        )
        subtotal = round(item.cantidad * book.precio, 2)
        total_subtotal += subtotal
        total_copies += item.cantidad

        if available_count < item.cantidad:
            all_available = False

        details.append(
            CartItemDetail(
                id=item.id,
                libro_id=book.id,
                titulo=book.titulo,
                autor=book.autor,
                portada_url=book.portada_url,
                precio_unitario=book.precio,
                cantidad=item.cantidad,
                subtotal=subtotal,
                stock_disponible=available_count,
            )
        )

    return CartSummaryResponse(
        items=details,
        total_items=total_copies,
        titulos_distintos=len(details),
        subtotal=round(total_subtotal, 2),
        saldo_cliente=round(cliente.saldo_disponible, 2),
        alcance_saldo=(cliente.saldo_disponible >= total_subtotal),
        todos_disponibles=all_available,
    )


# --------------------------------------------------------------------------
# Shopping Cart Endpoints (Client Only)
# --------------------------------------------------------------------------

@router.get("/carrito", response_model=CartSummaryResponse, summary="Get customer's shopping cart")
def obtener_carrito(
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Retrieves full shopping cart details with real-time stock and balance validation."""
    return _build_cart_summary(db, cliente)


@router.post("/carrito", response_model=CartSummaryResponse, status_code=status.HTTP_201_CREATED, summary="Add book to cart (RF-009, RF-012)")
def agregar_al_carrito(
    payload: CartAddRequest,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """
    Adds a book to the customer's cart or increments quantity (max 3 units per title).
    Does NOT reserve physical copies yet; reservation and stock deduction occur at checkout.
    """
    book = db.query(Book).filter(Book.id == payload.libro_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Libro no encontrado.")

    # Check if any copies are currently available
    available_count = (
        db.query(BookCopy)
        .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
        .count()
    )
    if available_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El libro '{book.titulo}' se encuentra temporalmente agotado."
        )

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cliente_id == cliente.id, CartItem.libro_id == payload.libro_id)
        .first()
    )

    if existing_item:
        nueva_cantidad = existing_item.cantidad + payload.cantidad
        if nueva_cantidad > 3:
            nueva_cantidad = 3  # Business rule: max 3 per title
        existing_item.cantidad = nueva_cantidad
        existing_item.actualizado_en = datetime.utcnow()
    else:
        cant = min(3, payload.cantidad)
        new_item = CartItem(
            cliente_id=cliente.id,
            libro_id=payload.libro_id,
            cantidad=cant,
        )
        db.add(new_item)

    db.commit()
    return _build_cart_summary(db, cliente)


@router.put("/carrito/{cart_item_id}", response_model=CartSummaryResponse, summary="Update cart item quantity")
def actualizar_item_carrito(
    cart_item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Updates the quantity of an item in the cart (1 to 3 units)."""
    item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cliente_id == cliente.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento no encontrado en tu carrito.")

    item.cantidad = payload.cantidad
    item.actualizado_en = datetime.utcnow()
    db.commit()
    return _build_cart_summary(db, cliente)


@router.delete("/carrito/{cart_item_id}", response_model=CartSummaryResponse, summary="Remove item from cart")
def eliminar_item_carrito(
    cart_item_id: int,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Removes a specific book title from the customer's cart."""
    item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cliente_id == cliente.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento no encontrado en tu carrito.")

    db.delete(item)
    db.commit()
    return _build_cart_summary(db, cliente)


@router.delete("/carrito", response_model=GenericMessage, summary="Clear entire cart")
def vaciar_carrito(
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Empties all items from the customer's shopping cart."""
    db.query(CartItem).filter(CartItem.cliente_id == cliente.id).delete()
    db.commit()
    return GenericMessage(
        mensaje="El carrito de compras ha sido vaciado exitosamente.",
        detalle=f"Cliente ID: {cliente.id}"
    )


# --------------------------------------------------------------------------
# Checkout Endpoint: Atomic Concurrency & Stock Verification (RF-013, RF-037)
# --------------------------------------------------------------------------

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Finalize purchase with Virtual Wallet (RF-013)")
def realizar_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """
    Executes atomic checkout transaction:
    1. Validates that the cart is not empty.
    2. Concurrency check (All or Nothing): Verifies if sufficient physical copies are DISPONIBLE for every title.
       If any title lacks enough copies, aborts transaction immediately with HTTP 409 Conflict without altering balances.
    3. Verifies that the customer's virtual wallet has sufficient funds.
    4. Deducts total from wallet balance.
    5. Creates PurchaseOrder and associates unique physical copies (FIFO: id ASC) marked as VENDIDO.
    6. Updates 'historico_agotado = True' if remaining available copies reach 0.
    7. Clears customer's shopping cart.
    """
    cart_items = db.query(CartItem).filter(CartItem.cliente_id == cliente.id).all()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu carrito de compras está vacío. Agrega libros antes de finalizar la compra."
        )

    # 1. Concurrency and Stock Verification (Opción A: Todo o Nada)
    for item in cart_items:
        book = item.libro
        disponibles_count = (
            db.query(BookCopy)
            .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
            .count()
        )
        if disponibles_count < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"No se pudo completar la compra: El ejemplar del libro '{book.titulo}' se encuentra agotado "
                    f"o con stock insuficiente (disponibles: {disponibles_count}, solicitaste: {item.cantidad}). "
                    f"Por favor ajusta tu carrito."
                ),
            )

    # 2. Total calculation and Wallet Balance Check
    total = sum(item.cantidad * item.libro.precio for item in cart_items)
    total = round(total, 2)

    # Re-fetch user with fresh state
    db.refresh(cliente)
    if cliente.saldo_disponible < total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Saldo insuficiente en la Billetera Virtual. Total de la compra: ${total:,.2f} COP, "
                f"tu saldo actual es: ${cliente.saldo_disponible:,.2f} COP. Por favor recarga saldo antes de continuar."
            ),
        )

    # Determine delivery address
    direccion = (
        payload.direccion_envio.strip()
        if payload.direccion_envio and payload.direccion_envio.strip()
        else (cliente.direccion or "Entrega en Sede Principal Pereira")
    )

    try:
        # 3. Deduct balance from customer wallet
        cliente.saldo_disponible = round(cliente.saldo_disponible - total, 2)

        # 4. Create Purchase Order
        order = PurchaseOrder(
            cliente_id=cliente.id,
            total=total,
            direccion_envio=direccion,
            estado=OrderStatusEnum.EN_PREPARACION.value,
            fecha_compra=datetime.utcnow(),
        )
        db.add(order)
        db.flush()  # Obtain order.id

        # 5. Assign physical copies (FIFO) and create line items
        for item in cart_items:
            book = item.libro
            # Fetch first N available copies ordered by id ASC
            copies_to_sell = (
                db.query(BookCopy)
                .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
                .order_by(BookCopy.id.asc())
                .limit(item.cantidad)
                .all()
            )

            for copy in copies_to_sell:
                copy.estado = CopyStatusEnum.VENDIDO.value
                order_item = PurchaseOrderItem(
                    orden_id=order.id,
                    libro_id=book.id,
                    ejemplar_id=copy.id,
                    titulo_libro=book.titulo,
                    codigo_ejemplar=copy.codigo_unico,
                    precio_unitario=book.precio,
                )
                db.add(order_item)

            # Check if book has run out of available copies (RF-006)
            remaining_after = (
                db.query(BookCopy)
                .filter(BookCopy.libro_id == book.id, BookCopy.estado == CopyStatusEnum.DISPONIBLE.value)
                .count()
            )
            if remaining_after == 0:
                book.historico_agotado = True

        # 6. Clear shopping cart
        db.query(CartItem).filter(CartItem.cliente_id == cliente.id).delete()

        db.commit()
        db.refresh(order)
        return order

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al procesar el checkout: {str(exc)}"
        )


# --------------------------------------------------------------------------
# Orders Management Endpoints (RF-014, RF-015)
# --------------------------------------------------------------------------

@router.get("/ordenes", response_model=List[OrderResponse], summary="Get customer's purchase order history (RF-015)")
def listar_mis_ordenes(
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Retrieves all past orders placed by the authenticated customer."""
    orders = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.cliente_id == cliente.id)
        .order_by(PurchaseOrder.id.desc())
        .all()
    )
    return orders


@router.get("/ordenes/{orden_id}", response_model=OrderResponse, summary="Get single order details")
def obtener_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves order details. Clients can only see their own orders; Admins can see any."""
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == orden_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de compra no encontrada.")

    if current_user.rol == RoleEnum.CLIENTE.value and order.cliente_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver esta orden.")

    return order


@router.post("/ordenes/{orden_id}/cancelar", response_model=OrderResponse, summary="Cancel order and refund wallet (RF-014)")
def cancelar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """
    Cancels an order if in 'EN_PREPARACION' status (RF-014):
    - Full refund credited back to client's virtual wallet (RF-037).
    - Sold physical copies reverted to 'DISPONIBLE'.
    - If book was marked 'historico_agotado', resets it to False.
    - Sets order state to CANCELADA.
    """
    order = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.id == orden_id, PurchaseOrder.cliente_id == cliente.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada.")

    if order.estado != OrderStatusEnum.EN_PREPARACION.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar una orden con estado '{order.estado}'. Solo se permite en 'EN_PREPARACION'."
        )

    try:
        # 1. Refund wallet balance
        cliente.saldo_disponible = round(cliente.saldo_disponible + order.total, 2)

        # 2. Release physical copies back to DISPONIBLE
        for detalle in order.detalles:
            copy = db.query(BookCopy).filter(BookCopy.id == detalle.ejemplar_id).first()
            if copy and copy.estado == CopyStatusEnum.VENDIDO.value:
                copy.estado = CopyStatusEnum.DISPONIBLE.value
                # If book was marked exhausted, it's available again
                if copy.libro.historico_agotado:
                    copy.libro.historico_agotado = False

        # 3. Update order status
        order.estado = OrderStatusEnum.CANCELADA.value
        order.fecha_cancelacion = datetime.utcnow()

        db.commit()
        db.refresh(order)
        return order

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cancelar la orden: {str(exc)}"
        )


# --------------------------------------------------------------------------
# Virtual Wallet Management Endpoints (RF-037)
# --------------------------------------------------------------------------

@router.get("/billetera/saldo", response_model=WalletBalanceResponse, summary="Get customer's wallet balance (RF-037)")
def consultar_saldo_billetera(
    cliente: User = Depends(verify_client_only),
):
    """Returns the current available balance in the customer's virtual wallet."""
    return WalletBalanceResponse(
        email=cliente.email,
        nombre_completo=f"{cliente.nombre} {cliente.apellido}",
        saldo_disponible=cliente.saldo_disponible,
    )


@router.post("/billetera/recargar", response_model=WalletBalanceResponse, summary="Top-up virtual wallet balance (RF-037)")
def recargar_billetera(
    payload: WalletTopupRequest,
    db: Session = Depends(get_db),
    cliente: User = Depends(verify_client_only),
):
    """Adds balance to the customer's virtual wallet for purchasing books."""
    cliente.saldo_disponible = round(cliente.saldo_disponible + payload.monto, 2)
    db.commit()
    db.refresh(cliente)
    return WalletBalanceResponse(
        email=cliente.email,
        nombre_completo=f"{cliente.nombre} {cliente.apellido}",
        saldo_disponible=cliente.saldo_disponible,
    )
