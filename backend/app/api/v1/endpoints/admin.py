from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_roles
from app.core.security import get_password_hash
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreateAdmin, UserResponse, GenericMessage

router = APIRouter()

@router.post(
    "/create-admin",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="HU-02: Creación de Cuentas de Administrador (RF-030 - Exclusivo Root)"
)
def create_admin_account(
    admin_in: UserCreateAdmin,
    current_root: User = Depends(require_roles([RoleEnum.ROOT.value])),
    db: Session = Depends(get_db)
):
    """
    Regla de Negocio RF-030 / HU-02:
    Permite ÚNICAMENTE al Superadministrador ROOT dar de alta personal con rol ADMINISTRADOR.
    Cualquier otro rol que intente acceder recibirá HTTP 403 Forbidden.
    """
    # 1. Validar unicidad de correo
    if db.query(User).filter(User.email == admin_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
        
    # 2. Validar unicidad de DNI
    if db.query(User).filter(User.dni == admin_in.dni).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento de identidad (DNI) ya está registrado."
        )
        
    # 3. Crear el administrador vinculado al creador (Root) para auditoría
    new_admin = User(
        dni=admin_in.dni,
        email=admin_in.email,
        nombre=admin_in.nombre,
        apellido=admin_in.apellido,
        telefono=admin_in.telefono,
        direccion="Sede Principal / Librería Central",
        hashed_password=get_password_hash(admin_in.password),
        rol=RoleEnum.ADMINISTRADOR.value,
        saldo_disponible=0.0,
        is_active=True,
        creado_por_id=current_root.id
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.get(
    "/users",
    response_model=List[UserResponse],
    summary="Listado de Usuarios Registrados (Exclusivo Admin / Root)"
)
def list_users(
    rol: Optional[str] = None,
    current_user: User = Depends(require_roles([RoleEnum.ADMINISTRADOR.value, RoleEnum.ROOT.value])),
    db: Session = Depends(get_db)
):
    """Permite auditar el padrón de usuarios y roles del sistema."""
    query = db.query(User)
    if rol:
        query = query.filter(User.rol == rol.upper())
    return query.all()

@router.put(
    "/users/{user_id}/toggle-status",
    response_model=GenericMessage,
    summary="Activar/Desactivar Cuenta de Usuario (Exclusivo Root)"
)
def toggle_user_status(
    user_id: int,
    current_root: User = Depends(require_roles([RoleEnum.ROOT.value])),
    db: Session = Depends(get_db)
):
    """Permite al Superadmin suspender o reactivar cuentas."""
    if user_id == current_root.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario Superadmin Root no puede desactivarse a sí mismo."
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
        
    user.is_active = not user.is_active
    db.commit()
    estado = "activada" if user.is_active else "desactivada"
    return GenericMessage(
        mensaje=f"La cuenta del usuario {user.email} ha sido {estado}.",
        detalle=f"Estado activo: {user.is_active}"
    )
