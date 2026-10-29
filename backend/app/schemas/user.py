from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    """Input schema for new customer self-registration (HU-01 / RF-027)."""
    dni: str = Field(..., min_length=5, max_length=20, example="1088123456", description="Unique national identification number")
    email: EmailStr = Field(..., example="lector@gmail.com", description="Unique customer email address")
    nombre: str = Field(..., min_length=2, max_length=50, example="Carlos", description="First name")
    apellido: str = Field(..., min_length=2, max_length=50, example="Gomez", description="Last name")
    telefono: Optional[str] = Field(None, example="3125554321", description="Contact phone number")
    direccion: Optional[str] = Field(None, example="Cra 27 # 4-10, Pereira", description="Physical mailing address")
    password: str = Field(..., min_length=6, max_length=100, example="ClaveSegura2026!", description="Raw password to be hashed with bcrypt")

class UserCreateAdmin(BaseModel):
    """Input schema for administrator creation by Root superuser (HU-02 / RF-030)."""
    dni: str = Field(..., min_length=5, max_length=20, example="98765432", description="Unique national ID for the administrator")
    email: EmailStr = Field(..., example="admin.bodega@libreria.com", description="Official corporate administrator email")
    nombre: str = Field(..., min_length=2, max_length=50, example="Laura", description="Administrator first name")
    apellido: str = Field(..., min_length=2, max_length=50, example="Restrepo", description="Administrator last name")
    telefono: Optional[str] = Field(None, example="3109876543", description="Contact phone number")
    password: str = Field(..., min_length=8, max_length=100, example="AdminPass2026*", description="Initial secure temporary password")

class UserLogin(BaseModel):
    """Input schema for user authentication / login (HU-04 / RF-026)."""
    email: EmailStr = Field(..., example="lector@gmail.com", description="Registered email address")
    password: str = Field(..., example="ClaveSegura2026!", description="User password")

class Token(BaseModel):
    """Bearer token response schema returned upon successful authentication (HU-04)."""
    access_token: str = Field(..., description="Cryptographically signed JWT Bearer token")
    token_type: str = Field("bearer", description="Token authorization type")
    rol: str = Field(..., description="Assigned RBAC role: CLIENTE, ADMINISTRADOR, ROOT")
    nombre: str = Field(..., description="User first name")
    apellido: str = Field(..., description="User last name")
    email: str = Field(..., description="User email address")
    user_id: int = Field(..., description="Unique database primary key")

class UserResponse(BaseModel):
    """Public user profile data schema returned by the API (HU-07 / RF-028)."""
    id: int = Field(..., description="User unique database ID")
    dni: str = Field(..., description="National identification number")
    email: str = Field(..., description="User email address")
    nombre: str = Field(..., description="First name")
    apellido: str = Field(..., description="Last name")
    telefono: Optional[str] = Field(None, description="Contact phone number")
    direccion: Optional[str] = Field(None, description="Shipping and delivery address")
    rol: str = Field(..., description="Assigned RBAC role")
    saldo_disponible: float = Field(..., description="Virtual wallet balance (COP) for purchases")
    is_active: bool = Field(..., description="Account status flag")
    fecha_registro: datetime = Field(..., description="Account creation timestamp")

    class Config:
        orm_mode = True

class UserUpdateProfile(BaseModel):
    """Input schema for customer profile contact update (HU-07 / RF-021 / RF-028)."""
    telefono: Optional[str] = Field(None, example="3001234567", description="Updated contact phone number")
    direccion: Optional[str] = Field(None, example="Av. Las Américas # 12-40, Pereira", description="Updated delivery address")

class PasswordChange(BaseModel):
    """Input schema for secure password change with verification (HU-06 / RF-028)."""
    current_password: str = Field(..., min_length=6, description="Current password for verification")
    new_password: str = Field(..., min_length=6, max_length=100, description="New secure password")

class GenericMessage(BaseModel):
    """Generic status and confirmation message response."""
    mensaje: str = Field(..., description="Primary status message")
    detalle: Optional[str] = Field(None, description="Optional detailed contextual information")
