from datetime import datetime, timedelta
from typing import Any, Union, Optional
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Cryptographic password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies if a plain text password matches the hashed bcrypt password.
    
    Args:
        plain_password (str): The raw password provided by the user.
        hashed_password (str): The one-way bcrypt hash stored in the database.
        
    Returns:
        bool: True if password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generates a secure one-way salted hash using the bcrypt algorithm.
    
    Args:
        password (str): Plain text password to hash.
        
    Returns:
        str: Bcrypt hashed representation.
    """
    return pwd_context.hash(password)

def create_access_token(
    subject: Union[str, Any],
    role: str,
    user_id: int,
    nombre: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a signed JWT (JSON Web Token) access token with typed claims.
    
    Args:
        subject (Union[str, Any]): Unique subject identifier (user email).
        role (str): Assigned RBAC role ('CLIENTE', 'ADMINISTRADOR', 'ROOT').
        user_id (int): Database primary key of the authenticated user.
        nombre (str): Full display name of the user.
        expires_delta (Optional[timedelta]): Custom token expiration window.
        
    Returns:
        str: Encoded cryptographic JWT Bearer token.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),      # User email identifier
        "user_id": user_id,       # Database user ID
        "rol": role,              # RBAC role: CLIENTE, ADMINISTRADOR, ROOT
        "nombre": nombre          # Full display name
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates the cryptographic signature and expiration of a JWT token.
    
    Args:
        token (str): Encoded JWT Bearer string.
        
    Returns:
        Optional[dict]: Decoded payload dictionary if valid, None if expired or invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
