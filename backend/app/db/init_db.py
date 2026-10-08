from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, RoleEnum

def init_database():
    """Inicializa las tablas de la base de datos y los datos semilla."""
    # 1. Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 2. Verificar o crear Superadmin Root
        root_user = db.query(User).filter(User.email == settings.ROOT_EMAIL).first()
        if not root_user:
            root_user = User(
                dni=settings.ROOT_DNI,
                email=settings.ROOT_EMAIL,
                nombre=settings.ROOT_NOMBRE,
                apellido=settings.ROOT_APELLIDO,
                telefono="3000000000",
                direccion="Oficina Central / Rectoría del Sistema",
                hashed_password=get_password_hash(settings.ROOT_PASSWORD),
                rol=RoleEnum.ROOT.value,
                saldo_disponible=0.0,
                is_active=True
            )
            db.add(root_user)
            db.commit()
            db.refresh(root_user)
            print(f"[*] Superadmin Root inicial creado: {settings.ROOT_EMAIL} (Pass: {settings.ROOT_PASSWORD})")
        
        # 3. Verificar o crear Cliente Demo
        cliente_demo = db.query(User).filter(User.email == "cliente.demo@gmail.com").first()
        if not cliente_demo:
            cliente_demo = User(
                dni="1088123456",
                email="cliente.demo@gmail.com",
                nombre="Carlos",
                apellido="Lector",
                telefono="3125554321",
                direccion="Carrera 27 # 4-10, Pereira",
                hashed_password=get_password_hash("Cliente2026!"),
                rol=RoleEnum.CLIENTE.value,
                saldo_disponible=150000.0, # Saldo inicial para pruebas
                is_active=True
            )
            db.add(cliente_demo)
            db.commit()
            print("[*] Cliente demo creado: cliente.demo@gmail.com (Pass: Cliente2026!)")

        # 4. Verificar o crear Administrador Demo
        admin_demo = db.query(User).filter(User.email == "admin.bodega@libreria.com").first()
        if not admin_demo:
            admin_demo = User(
                dni="9876543210",
                email="admin.bodega@libreria.com",
                nombre="Laura",
                apellido="Inventarios",
                telefono="3109876543",
                direccion="Sede Centro, Pereira",
                hashed_password=get_password_hash("Admin2026!"),
                rol=RoleEnum.ADMINISTRADOR.value,
                saldo_disponible=0.0,
                is_active=True,
                creado_por_id=root_user.id
            )
            db.add(admin_demo)
            db.commit()
            print("[*] Administrador demo creado: admin.bodega@libreria.com (Pass: Admin2026!)")

    finally:
        db.close()

if __name__ == "__main__":
    init_database()
