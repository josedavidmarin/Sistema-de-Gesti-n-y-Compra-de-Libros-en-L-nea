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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 w-full overflow-x-hidden">
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

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-white font-extrabold text-base tracking-tight">
                Librería Central S.A.S.
              </span>
              <p className="text-xs text-slate-400">
                Tu portal de literatura, ciencia y cultura con despacho garantizado a nivel nacional.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button onClick={() => handleNavigate('home')} className="hover:text-white transition">Catálogo de Libros</button>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">Términos y Condiciones</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">Política de Privacidad</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">Envíos y Devoluciones</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Librería Central S.A.S. Todos los derechos reservados. Pagos seguros con Billetera Virtual y trazabilidad garantizada.
            </div>
            <div>
              Atención al Cliente: contacto@libreriacentral.com • Horario: Lun - Sáb 8:00 a 18:00
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
