from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, RoleEnum
from app.schemas.user import (
    UserRegister, UserLogin, Token, UserResponse,
    UserUpdateProfile, PasswordChange, GenericMessage
)

router = APIRouter()

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="HU-01: Client Self-Registration (RF-027)"
)
def register_client(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Registers a new user with the CLIENTE role in the platform.
    Validates uniqueness of national ID (DNI) and Email, and salts/hashes password with bcrypt.
    """
    # 1. Verify if email is already registered
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )
    
    # 2. Verify if DNI is already registered
    if db.query(User).filter(User.dni == user_in.dni).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento de identidad (DNI) ya se encuentra registrado."
        )
    
    # 3. Create user entity with hashed password
    user = User(
        dni=user_in.dni,
        email=user_in.email,
        nombre=user_in.nombre,
        apellido=user_in.apellido,
        telefono=user_in.telefono,
        direccion=user_in.direccion,
        hashed_password=get_password_hash(user_in.password),
        rol=RoleEnum.CLIENTE.value,
        saldo_disponible=0.0,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post(
    "/login",
    response_model=Token,
    summary="HU-04: User Login and JWT Issuance (RF-026 / RF-028)"
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticates a user via email and password.
    Returns a cryptographically signed Bearer JWT token with typed claims (sub, rol, user_id, nombre).
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contacte a soporte."
        )
        
    access_token = create_access_token(
        subject=user.email,
        role=user.rol,
        user_id=user.id,
        nombre=f"{user.nombre} {user.apellido}"
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        rol=user.rol,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        user_id=user.id
    )

@router.post(
    "/login-swagger",
    response_model=Token,
    include_in_schema=False
)
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Endpoint compatible with Swagger UI 'Authorize' modal dialog."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(
        subject=user.email,
        role=user.rol,
        user_id=user.id,
        nombre=f"{user.nombre} {user.apellido}"
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        rol=user.rol,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        user_id=user.id
    )

@router.post(
    "/logout",
    response_model=GenericMessage,
    summary="HU-05: User Session Logout"
)
def logout(current_user: User = Depends(get_current_user)):
    """
    Terminates current user authenticated session.
    Confirms local client credential invalidation.
    """
    return GenericMessage(
        mensaje="Sesión finalizada exitosamente.",
        detalle=f"Usuario {current_user.email} desconectado."
    )

@router.get(
    "/me",
    response_model=UserResponse,
    summary="HU-07: Get Authenticated User Profile (RF-028)"
)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves current active user profile information decoded from JWT bearer identity.
    """
    return current_user

@router.put(
    "/me",
    response_model=UserResponse,
    summary="HU-07: Update Phone and Mailing Address (RF-021 / RF-028)"
)
def update_my_profile(
    profile_in: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows authenticated users to update their contact phone number and physical shipping address.
    """
    if profile_in.telefono is not None:
        current_user.telefono = profile_in.telefono
    if profile_in.direccion is not None:
        current_user.direccion = profile_in.direccion
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put(
    "/change-password",
    response_model=GenericMessage,
    summary="HU-06: Change Password (RF-028)"
)
def change_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifies current active password before permitting password updates.
    Applies one-way salted bcrypt hashing to the new credential.
    """
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual ingresada es incorrecta."
        )
        
    if pwd_in.current_password == pwd_in.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña no puede ser idéntica a la anterior."
        )
        
    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()
    return GenericMessage(
        mensaje="Contraseña actualizada exitosamente.",
        detalle="Debe usar su nueva contraseña en el próximo inicio de sesión."
    )
