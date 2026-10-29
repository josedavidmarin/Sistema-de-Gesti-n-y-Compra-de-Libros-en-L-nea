from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.user import User, RoleEnum

# OAuth2 scheme configured for OpenAPI Swagger UI authorization
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login-swagger"
)

def get_db() -> Generator:
    """
    Database session dependency provider.
    Yields a SQLAlchemy session and ensures proper closure after request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Extracts and authenticates the user from the incoming Bearer JWT access token.
    Validates token signature, expiration, user existence, and active account status.
    
    Args:
        db (Session): SQLAlchemy database session.
        token (str): JWT Bearer token extracted from the Authorization header.
        
    Returns:
        User: Authenticated User database model.
        
    Raises:
        HTTPException: 401 Unauthorized if credentials or token are invalid/expired.
        HTTPException: 403 Forbidden if user account is deactivated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session has expired.",
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
            detail="User account is deactivated or suspended."
        )
    return user

def require_roles(allowed_roles: List[str]):
    """
    Role-Based Access Control (RBAC) authorization dependency factory.
    Verifies that the authenticated user possesses one of the authorized roles.
    
    Args:
        allowed_roles (List[str]): List of permitted role names (e.g. ['ROOT', 'ADMINISTRADOR']).
        
    Returns:
        Callable: Dependency function checking role membership.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role in {allowed_roles}. Current role: {current_user.rol}."
            )
        return current_user
    return role_checker

def verify_client_only(current_user: User = Depends(get_current_user)) -> User:
    """
    Enforces Business Rule RF-031 / HU-03:
    Strictly forbids operational staff ('ADMINISTRADOR' or 'ROOT') from purchasing or reserving books.
    
    Args:
        current_user (User): Authenticated user model.
        
    Returns:
        User: Authenticated user model if role is CLIENTE.
        
    Raises:
        HTTPException: 403 Forbidden if user is ROOT or ADMINISTRADOR.
    """
    if current_user.rol in [RoleEnum.ADMINISTRADOR.value, RoleEnum.ROOT.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Business Restriction (RF-031): Users with role '{current_user.rol}' are strictly prohibited from purchasing or reserving books."
        )
    return current_user
