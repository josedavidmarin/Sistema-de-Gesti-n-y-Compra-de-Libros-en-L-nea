import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Wallet,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleLabel = () => {
    switch (role) {
      case 'ROOT':
        return 'Superadmin Root';
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'CLIENTE':
        return 'Miembro';
      default:
        return 'Visitante';
    }
  };

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Utility Bar (36px, Soft Cloud #f5f5f5) */}
      <div className="bg-[#f5f5f5] text-[#111111] h-9 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-3 text-[#707072]">
            <span>Librería Central</span>
            <span className="text-[#cacacb]">|</span>
            <span>Envíos garantizados a toda Colombia</span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-[#707072]">{getRoleLabel()}</span>
                {role === 'CLIENTE' && (
                  <>
                    <span className="text-[#cacacb]">|</span>
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="inline-flex items-center space-x-1.5 text-[#111111] hover:text-[#707072] transition-colors"
                      title="Saldo en Billetera Virtual"
                    >
                      <Wallet className="w-3.5 h-3.5 text-[#007d48]" />
                      <span>${user.saldo_disponible.toLocaleString('es-CO')} COP</span>
                    </button>
                  </>
                )}
                <span className="text-[#cacacb]">|</span>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="hover:text-[#707072] transition-colors"
                >
                  Hola, {user.nombre}
                </button>
                <span className="text-[#cacacb]">|</span>
                <button
                  onClick={handleLogout}
                  className="hover:text-[#707072] transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className="hover:text-[#707072] transition-colors"
                >
                  Catálogo
                </button>
                <span className="text-[#cacacb]">|</span>
                <button
                  onClick={() => handleNavClick('register')}
                  className="hover:text-[#707072] transition-colors"
                >
                  Únete
                </button>
                <span className="text-[#cacacb]">|</span>
                <button
                  onClick={() => handleNavClick('login')}
                  className="hover:text-[#707072] transition-colors"
                >
                  Iniciar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Navigation (60px, Canvas #ffffff, Inset 1px Hairline Soft) */}
      <div className="bg-white shadow-inset-hairline h-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between">
          {/* Left: Mobile Hamburger + Brand Mark */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f5f5f5] text-[#111111] transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2.5 group focus:outline-none"
            >
              {/* Minimalist Geometric Brand Mark */}
              <svg
                viewBox="0 0 32 32"
                className="w-8 h-8 text-[#111111] flex-shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 6h10c2.2 0 4 1.8 4 4v16c-1.5-1.2-3.5-2-6-2H4V6zm24 0H18c-2.2 0-4 1.8-4 4v16c1.5-1.2 3.5-2 6-2h8V6z" />
              </svg>
              <span className="font-display text-2xl tracking-tight text-[#111111] leading-none pt-0.5">
                LIBRERÍA CENTRAL
              </span>
            </button>
          </div>

          {/* Center: Desktop Primary Links (2px bottom underline on active) */}
          <nav className="hidden md:flex items-center space-x-7 h-full">
            <button
              onClick={() => handleNavClick('home')}
              className={`h-full inline-flex items-center text-base font-medium transition-colors border-b-2 ${
                currentPage === 'home'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#111111] hover:border-[#cacacb]'
              }`}
            >
              Catálogo
            </button>

            {isAuthenticated && role === 'CLIENTE' && (
              <button
                onClick={() => handleNavClick('orders')}
                className={`h-full inline-flex items-center text-base font-medium transition-colors border-b-2 ${
                  currentPage === 'orders'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111] hover:border-[#cacacb]'
                }`}
              >
                Mis Compras
              </button>
            )}

            {isAuthenticated && (role === 'ROOT' || role === 'ADMINISTRADOR') && (
              <button
                onClick={() => handleNavClick('inventory')}
                className={`h-full inline-flex items-center text-base font-medium transition-colors border-b-2 ${
                  currentPage === 'inventory'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111] hover:border-[#cacacb]'
                }`}
              >
                Inventario Físico
              </button>
            )}

            {isAuthenticated && role === 'ROOT' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`h-full inline-flex items-center text-base font-medium transition-colors border-b-2 ${
                  currentPage === 'admin'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111] hover:border-[#cacacb]'
                }`}
              >
                Panel Root
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => handleNavClick('profile')}
                className={`h-full inline-flex items-center text-base font-medium transition-colors border-b-2 ${
                  currentPage === 'profile'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111] hover:border-[#cacacb]'
                }`}
              >
                Perfil
              </button>
            )}
          </nav>

          {/* Right: Circular Icon Cluster */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {role === 'CLIENTE' && (
                  <button
                    onClick={() => handleNavClick('cart')}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      currentPage === 'cart'
                        ? 'bg-[#111111] text-white'
                        : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#e5e5e5]'
                    }`}
                    title="Carrito de compras"
                    aria-label="Carrito de compras"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('profile')}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#e5e5e5]'
                  }`}
                  title="Mi Perfil"
                  aria-label="Mi Perfil"
                >
                  <User className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#111111] text-sm font-medium px-5 h-10 transition-colors"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="inline-flex items-center justify-center rounded-full bg-[#111111] hover:bg-[#39393b] text-white text-sm font-medium px-5 h-10 transition-colors"
                >
                  Únete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Full-Width Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white z-50 overflow-y-auto border-t border-[#e5e5e5]">
          <div className="px-6 py-6 space-y-6">
            {isAuthenticated && user && (
              <div className="pb-6 border-b border-[#cacacb] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-[#111111]">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-xs text-[#707072]">{user.email}</div>
                  </div>
                  <span className="nike-badge-promo">{getRoleLabel()}</span>
                </div>

                {role === 'CLIENTE' && (
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full flex items-center justify-between p-4 bg-[#f5f5f5] text-sm"
                  >
                    <span className="flex items-center space-x-2 text-[#111111] font-medium">
                      <Wallet className="w-4 h-4 text-[#007d48]" />
                      <span>Billetera Virtual</span>
                    </span>
                    <span className="font-medium text-[#007d48]">
                      ${user.saldo_disponible.toLocaleString('es-CO')} COP
                    </span>
                  </button>
                )}
              </div>
            )}

            <nav className="divide-y divide-[#e5e5e5]">
              <button
                onClick={() => handleNavClick('home')}
                className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
              >
                <span>Catálogo</span>
                <ChevronRight className="w-5 h-5 text-[#707072]" />
              </button>

              {isAuthenticated && role === 'CLIENTE' && (
                <>
                  <button
                    onClick={() => handleNavClick('cart')}
                    className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
                  >
                    <span>Carrito</span>
                    <ChevronRight className="w-5 h-5 text-[#707072]" />
                  </button>
                  <button
                    onClick={() => handleNavClick('orders')}
                    className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
                  >
                    <span>Mis Compras</span>
                    <ChevronRight className="w-5 h-5 text-[#707072]" />
                  </button>
                </>
              )}

              {isAuthenticated && (role === 'ROOT' || role === 'ADMINISTRADOR') && (
                <button
                  onClick={() => handleNavClick('inventory')}
                  className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
                >
                  <span>Inventario Físico</span>
                  <ChevronRight className="w-5 h-5 text-[#707072]" />
                </button>
              )}

              {isAuthenticated && role === 'ROOT' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
                >
                  <span>Panel Root</span>
                  <ChevronRight className="w-5 h-5 text-[#707072]" />
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full py-5 flex items-center justify-between text-xl font-medium text-[#111111]"
                >
                  <span>Mi Perfil</span>
                  <ChevronRight className="w-5 h-5 text-[#707072]" />
                </button>
              )}
            </nav>

            <div className="pt-4 space-y-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="nike-btn-secondary w-full space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="nike-btn-primary w-full"
                  >
                    Únete a Librería Central
                  </button>
                  <button
                    onClick={() => handleNavClick('login')}
                    className="nike-btn-secondary w-full"
                  >
                    Iniciar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
