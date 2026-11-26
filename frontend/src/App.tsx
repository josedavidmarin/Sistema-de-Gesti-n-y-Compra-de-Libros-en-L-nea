import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryAdminPage } from './pages/InventoryAdminPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { role } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    if (role === 'ROOT') {
      setCurrentPage('admin');
    } else if (role === 'ADMINISTRADOR') {
      setCurrentPage('inventory');
    } else {
      setCurrentPage('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] w-full overflow-x-hidden">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 w-full overflow-x-hidden">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'cart' && <CartPage onNavigate={handleNavigate} />}
        {currentPage === 'orders' && <OrdersPage onNavigate={handleNavigate} />}
        {currentPage === 'inventory' && <InventoryAdminPage />}
        {currentPage === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onGoToRegister={() => handleNavigate('register')}
          />
        )}
        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onGoToLogin={() => handleNavigate('login')}
          />
        )}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'admin' && <AdminPage />}
      </main>

      {/* Nike-style 4-column flat white footer with 1px hairline top divider */}
      <footer className="bg-white border-t border-[#cacacb] mt-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#e5e5e5]">
            {/* Column 1: Recursos */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#111111]">Recursos</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#707072]">
                <li>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="hover:text-[#111111] transition-colors"
                  >
                    Catálogo Completo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="hover:text-[#111111] transition-colors"
                  >
                    Hazte Miembro
                  </button>
                </li>
                <li>
                  <span className="cursor-default">Sedes y Puntos de Retiro</span>
                </li>
                <li>
                  <span className="cursor-default">Novedades Editoriales</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Ayuda */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#111111]">Ayuda</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#707072]">
                <li>
                  <button
                    onClick={() => handleNavigate('orders')}
                    className="hover:text-[#111111] transition-colors"
                  >
                    Estado de mi Pedido
                  </button>
                </li>
                <li>
                  <span className="cursor-default">Envíos y Despachos</span>
                </li>
                <li>
                  <span className="cursor-default">Cancelaciones y Reembolsos</span>
                </li>
                <li>
                  <span className="cursor-default">contacto@libreriacentral.com</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Empresa */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#111111]">Empresa</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#707072]">
                <li>
                  <span className="cursor-default">Acerca de Librería Central</span>
                </li>
                <li>
                  <span className="cursor-default">Control de Ejemplares Físicos</span>
                </li>
                <li>
                  <span className="cursor-default">Sostenibilidad Editorial</span>
                </li>
                <li>
                  <span className="cursor-default">Alianzas y Editoriales</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Membresía & Pagos */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#111111]">Pagos y Seguridad</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#707072]">
                <li>
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="hover:text-[#111111] transition-colors"
                  >
                    Billetera Virtual
                  </button>
                </li>
                <li>
                  <span className="cursor-default">Trazabilidad por Código de Barras</span>
                </li>
                <li>
                  <span className="cursor-default">Protección de Datos (Ley 1581)</span>
                </li>
                <li>
                  <span className="cursor-default">Lun - Sáb · 8:00 a 18:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Fine-print Utility Row */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-[#707072]">
            <div>© 2026 Librería Central S.A.S. Todos los derechos reservados.</div>
            <div className="flex flex-wrap items-center gap-5">
              <span>Colombia</span>
              <span>Términos de Uso</span>
              <span>Política de Privacidad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
