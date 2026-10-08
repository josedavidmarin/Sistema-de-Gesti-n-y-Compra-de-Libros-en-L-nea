from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    """Esquema de entrada para registro de nuevos clientes (HU-01 / RF-027)."""
    dni: str = Field(..., min_length=5, max_length=20, example="1088123456")
    email: EmailStr = Field(..., example="lector@gmail.com")
    nombre: str = Field(..., min_length=2, max_length=50, example="Carlos")
    apellido: str = Field(..., min_length=2, max_length=50, example="Gomez")
    telefono: Optional[str] = Field(None, example="3125554321")
    direccion: Optional[str] = Field(None, example="Cra 27 # 4-10, Pereira")
    password: str = Field(..., min_length=6, max_length=100, example="ClaveSegura2026!")

class UserCreateAdmin(BaseModel):
    """Esquema para creación de administradores por parte del Superadmin Root (HU-02 / RF-030)."""
    dni: str = Field(..., min_length=5, max_length=20, example="98765432")
    email: EmailStr = Field(..., example="admin.bodega@libreria.com")
    nombre: str = Field(..., min_length=2, max_length=50, example="Laura")
    apellido: str = Field(..., min_length=2, max_length=50, example="Restrepo")
    telefono: Optional[str] = Field(None, example="3109876543")
    password: str = Field(..., min_length=8, max_length=100, example="AdminPass2026*")

class UserLogin(BaseModel):
    """Esquema de inicio de sesión (HU-04 / RF-026)."""
    email: EmailStr = Field(..., example="lector@gmail.com")
    password: str = Field(..., example="ClaveSegura2026!")

class Token(BaseModel):
    """Token Bearer retornado tras login exitoso."""
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str
    apellido: str
    email: str
    user_id: int

class UserResponse(BaseModel):
    """Datos públicos de usuario retornado por el API."""
    id: int
    dni: str
    email: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    rol: str
    saldo_disponible: float
    is_active: bool
    fecha_registro: datetime

    class Config:
        orm_mode = True

class UserUpdateProfile(BaseModel):
    """Edición de información de perfil del cliente (HU-07 / RF-028)."""
    telefono: Optional[str] = Field(None, example="3001234567")
    direccion: Optional[str] = Field(None, example="Av. Las Américas # 12-40, Pereira")

class PasswordChange(BaseModel):
    """Cambio de contraseña para usuario autenticado (HU-06 / RF-028)."""
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)

class GenericMessage(BaseModel):
    """Mensaje genérico de éxito."""
    mensaje: str
    detalle: Optional[str] = None
