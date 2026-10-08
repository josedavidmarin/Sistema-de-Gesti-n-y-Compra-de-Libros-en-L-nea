from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.user import User, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login-swagger"
)

def get_db() -> Generator:
    """Inyección de dependencias de sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Extrae el usuario autenticado a partir del Bearer token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales de autenticación inválidas o sesión expirada.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if not email:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta de usuario inactiva o suspendida."
        )
    return user

def require_roles(allowed_roles: List[str]):
    """Dependencia de control de acceso basada en roles (RBAC)."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: se requiere uno de los siguientes roles: {', '.join(allowed_roles)}. Su rol actual es {current_user.rol}."
            )
        return current_user
    return role_checker

def verify_client_only(current_user: User = Depends(get_current_user)) -> User:
    """
    Regla de Negocio RF-031 / HU-03:
    Impide estrictamente que Administradores o Root realicen compras o reservas.
    """
    if current_user.rol in [RoleEnum.ADMINISTRADOR.value, RoleEnum.ROOT.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Restricción de Negocio (RF-031): Los usuarios con rol '{current_user.rol}' tienen terminantemente prohibido comprar o reservar libros en la plataforma."
        )
    return current_user
