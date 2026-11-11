from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from app.api.deps import verify_client_only
from app.models.user import User
from app.schemas.user import GenericMessage

router = APIRouter()


class SolicitudCompraSimulada(BaseModel):
    """Input schema for purchase/reservation authorization check (HU-03 / RF-031)."""

    libro_id: int = Field(..., example=1, description="Target book identifier")
    cantidad: int = Field(1, ge=1, le=3, description="Requested copy quantity (max 3)")
    modalidad: str = Field(
        "COMPRA", example="COMPRA", description="Transaction mode: COMPRA or RESERVA"
    )


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
    If an ADMINISTRADOR or ROOT user attempts this operation, the security
    dependency aborts the transaction with HTTP 403 Forbidden.

    Args:
        solicitud (SolicitudCompraSimulada): Simulated purchase or reservation payload.
        cliente_valido (User): Authenticated user verified not to hold operational roles.

    Returns:
        GenericMessage: Authorization confirmation with client identity and mode.
    """
    return GenericMessage(
        mensaje="Permiso concedido: el usuario es Cliente legítimo y puede operar.",
        detalle=f"Cliente: {cliente_valido.nombre} {cliente_valido.apellido} ({cliente_valido.email}) | Modalidad: {solicitud.modalidad}",
    )
