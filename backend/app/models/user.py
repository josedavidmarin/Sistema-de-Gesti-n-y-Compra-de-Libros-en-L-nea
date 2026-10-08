from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RoleEnum(str, enum.Enum):
    VISITANTE = "VISITANTE"
    CLIENTE = "CLIENTE"
    ADMINISTRADOR = "ADMINISTRADOR"
    ROOT = "ROOT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(30), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    nombre = Column(String(80), nullable=False)
    apellido = Column(String(80), nullable=False)
    telefono = Column(String(30), nullable=True)
    direccion = Column(String(200), nullable=True) # Dirección de correspondencia para envíos (RF-021)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default=RoleEnum.CLIENTE.value) # RBAC (RF-026)
    saldo_disponible = Column(Float, default=0.0) # Saldo monedero del cliente (RF-037)
    is_active = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    # Auditoría: ¿Quién creó este usuario? (Para administradores creados por Root - RF-030)
    creado_por_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    creador = relationship("User", remote_side=[id], backref="usuarios_creados")

    def __repr__(self):
        return f"<User id={self.id} email='{self.email}' rol='{self.rol}'>"
