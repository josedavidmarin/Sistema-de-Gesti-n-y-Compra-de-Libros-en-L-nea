import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Gestión y Compra de Libros en Línea"
    VERSION: str = "1.0.0 (Sprint 1)"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad y JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-libreria-is873-utp-2026-very-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 horas de vigencia de sesión
    
    # Base de Datos
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./libreria.db")
    
    # Orígenes permitidos para Frontend React (Local + Vercel Cloud)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "*"
    ]
    
    # Superadmin Root por Defecto
    ROOT_EMAIL: str = "root@libreria.com"
    ROOT_PASSWORD: str = "RootSecure2026!"
    ROOT_DNI: str = "0000000000"
    ROOT_NOMBRE: str = "Superadmin"
    ROOT_APELLIDO: str = "Root"

    class Config:
        case_sensitive = True

settings = Settings()
