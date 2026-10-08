# Frontend — Sistema de Gestión y Compra de Libros en Línea

Aplicación web desarrollada con **React**, **TypeScript**, **Vite** y **Tailwind CSS**.

Implementa la interfaz de usuario para el **Sprint 1 (21 Story Points)**, alineada con los wireframes y mockups formales aprobados para el proyecto.

---

## 🎨 Pantallas y Funcionalidades Desarrolladas (Sprint 1)

1. **Página de Inicio (Home):**
   * Resumen del alcance del Sprint 1 y estado de conexión en tiempo real con el backend FastAPI.
2. **Inicio de Sesión (Login - Mockup 5.6 / HU-04):**
   * Autenticación con token Bearer JWT.
   * **Botones de Autorelleno Rápido:** Permiten cargar con un solo clic las credenciales de *Superadmin Root*, *Administrador* o *Cliente* durante la sustentación.
3. **Registro de Clientes (Mockup 5.3 / HU-01 / RF-027):**
   * Formulario completo con DNI, nombres, correo, teléfono, dirección y cláusula de Habeas Data (Ley 1581).
4. **Mi Perfil de Usuario (HU-07 / RF-028):**
   * Visualización del rol activo con distintivo cromático.
   * Monedero virtual con saldo disponible (\$150.000 COP) (RF-037).
   * Formulario para actualizar teléfono y dirección de entrega (RF-021).
   * Cambio de contraseña con validación de contraseña anterior (HU-06).
   * **Simulador Interactivo de la Regla RF-031:** Botón para probar en vivo la prohibición de compras a Administradores y Root con respuesta directa del backend.
5. **Panel Superadmin Root (Mockup 5.4 / HU-02 / RF-030):**
   * Interfaz de alta de personal con rol `ADMINISTRADOR`.
   * Padrón de usuarios del sistema con auditoría y control de activación/suspensión de cuentas.

---

## 🚀 Cómo Iniciar el Frontend Localmente

1. Abre una terminal y navega al directorio del frontend:
   ```powershell
   cd "C:\backup D\Desktop\U\LAB\Sistema-de-Gestion-y-Compra-de-Libros\frontend"
   ```

2. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```

3. Abre tu navegador web en:
   👉 **[http://localhost:5173](http://localhost:5173)**

*(Asegúrate de tener corriendo simultáneamente el backend en `http://localhost:8000` con `python run.py`).*
