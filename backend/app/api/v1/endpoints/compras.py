from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from app.api.deps import verify_client_only
from app.models.user import User
from app.schemas.user import GenericMessage

router = APIRouter()

class SolicitudCompraSimulada(BaseModel):
    libro_id: int = Field(..., example=1)
    cantidad: int = Field(1, ge=1, le=3)
    modalidad: str = Field("COMPRA", example="COMPRA") # COMPRA o RESERVA

@router.post(
    "/validar-permiso-compra-reserva",
    response_model=GenericMessage,
    status_code=status.HTTP_200_OK,
    summary="HU-03: Restricción Estricta de Compra para Administradores y Root (RF-031)"
)
def validar_permiso_compra(
    solicitud: SolicitudCompraSimulada,
    cliente_valido: User = Depends(verify_client_only)
):
    """
    Regla de Negocio RF-031 / HU-03:
    Verifica que el usuario solicitante posea estrictamente rol CLIENTE.
    Si un usuario con rol ADMINISTRADOR o ROOT intenta realizar esta petición,
    el middleware de seguridad aborta con HTTP 403 Forbidden.
    """
    return GenericMessage(
        mensaje="Permiso concedido: el usuario es Cliente legítimo y puede operar.",
        detalle=f"Cliente: {cliente_valido.nombre} {cliente_valido.apellido} ({cliente_valido.email}) | Modalidad: {solicitud.modalidad}"
    )
