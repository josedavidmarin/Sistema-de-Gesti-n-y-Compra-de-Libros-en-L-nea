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
    summary="HU-02: Create Administrator Account (RF-030 - Root Exclusive)",
)
def create_admin_account(
    admin_in: UserCreateAdmin,
    current_root: User = Depends(require_roles([RoleEnum.ROOT.value])),
    db: Session = Depends(get_db),
):
    """
    Enforces Business Rule RF-030 / HU-02:
    Exclusively allows the ROOT superadministrator to provision new ADMINISTRADOR accounts.
    Any other role attempting to access this endpoint receives HTTP 403 Forbidden.

    Args:
        admin_in (UserCreateAdmin): New administrator registration payload.
        current_root (User): Authenticated user strictly verified with ROOT role.
        db (Session): SQLAlchemy database session.

    Returns:
        UserResponse: Newly provisioned administrator account.

    Raises:
        HTTPException: 400 Bad Request if email or DNI already exists.
    """
    # 1. Validate email uniqueness
    if db.query(User).filter(User.email == admin_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado.",
        )

    # 2. Validate national ID (DNI) uniqueness
    if db.query(User).filter(User.dni == admin_in.dni).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento de identidad (DNI) ya está registrado.",
        )

    # 3. Create administrator linked to the Root creator ID for audit trail
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
        creado_por_id=current_root.id,
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


@router.get(
    "/users",
    response_model=List[UserResponse],
    summary="HU-02: List Registered Users for Audit (Admin / Root Exclusive)",
)
def list_users(
    rol: Optional[str] = None,
    current_user: User = Depends(
        require_roles([RoleEnum.ADMINISTRADOR.value, RoleEnum.ROOT.value])
    ),
    db: Session = Depends(get_db),
):
    """
    Retrieves the complete directory of registered users and assigned roles for auditing.
    Supports optional filtering by role and orders deterministically by user ID.

    Args:
        rol (Optional[str]): Optional role filter (e.g., CLIENTE, ADMINISTRADOR, ROOT).
        current_user (User): Authenticated ADMINISTRADOR or ROOT user.
        db (Session): SQLAlchemy database session.

    Returns:
        List[UserResponse]: Matching user records ordered by ascending ID.
    """
    query = db.query(User)
    if rol:
        query = query.filter(User.rol == rol.upper())
    return query.order_by(User.id.asc()).all()


@router.put(
    "/users/{user_id}/toggle-status",
    response_model=GenericMessage,
    summary="HU-02: Activate or Suspend User Account (Root Exclusive)",
)
def toggle_user_status(
    user_id: int,
    current_root: User = Depends(require_roles([RoleEnum.ROOT.value])),
    db: Session = Depends(get_db),
):
    """
    Allows the Root superadministrator to suspend or reactivate user accounts.
    Prevents self-deactivation of the active Root account.

    Args:
        user_id (int): Target user identifier.
        current_root (User): Authenticated user strictly verified with ROOT role.
        db (Session): SQLAlchemy database session.

    Returns:
        GenericMessage: Confirmation message with updated active flag.

    Raises:
        HTTPException: 400 Bad Request if attempting self-deactivation; 404 if user not found.
    """
    if user_id == current_root.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario Superadmin Root no puede desactivarse a sí mismo.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    user.is_active = not user.is_active
    db.commit()
    estado = "activada" if user.is_active else "desactivada"
    return GenericMessage(
        mensaje=f"La cuenta del usuario {user.email} ha sido {estado}.",
        detalle=f"Estado activo: {user.is_active}",
    )
