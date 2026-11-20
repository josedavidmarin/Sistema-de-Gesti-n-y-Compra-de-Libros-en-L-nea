import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart,
  Package,
  Boxes,
  Wallet,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'ROOT':
        return {
          label: 'Root (Superadmin)',
          classes: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'ADMINISTRADOR':
        return {
          label: 'Administrador',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'CLIENTE':
        return {
          label: 'Cliente',
          classes: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      default:
        return {
          label: 'Visitante',
          classes: 'bg-purple-100 text-purple-800 border-purple-300',
        };
    }
  };

  const badge = getRoleBadge();

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow group-hover:bg-blue-700 transition flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
              Librería Central
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
              Lectura, Cultura & Saber
            </p>
          </div>
        </div>

        {/* Desktop Navigation Items (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentPage === 'home'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Catálogo
          </button>

          {isAuthenticated ? (
            <>
              {/* Client specific navigation: Cart & Orders */}
              {role === 'CLIENTE' && (
                <>
                  <button
                    onClick={() => handleNavClick('cart')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currentPage === 'cart'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Carrito</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('orders')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currentPage === 'orders'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Mis Compras</span>
                  </button>
                </>
              )}

              {/* Admin & Root: Inventory management */}
              {(role === 'ROOT' || role === 'ADMINISTRADOR') && (
                <button
                  onClick={() => handleNavClick('inventory')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentPage === 'inventory'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Inventario Físico</span>
                </button>
              )}

              {role === 'ROOT' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentPage === 'admin'
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel Root</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('profile')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentPage === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Perfil</span>
              </button>

              {/* Client wallet pill */}
              {role === 'CLIENTE' && user && (
                <div
                  onClick={() => handleNavClick('profile')}
                  className="hidden lg:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer border border-slate-200 transition"
                  title="Saldo en Billetera Virtual (Clic para recargar)"
                >
                  <Wallet className="w-3 h-3 text-emerald-600" />
                  <span className="font-bold">${user.saldo_disponible.toLocaleString('es-CO')}</span>
                </div>
              )}

              {/* Role badge */}
              <div
                className={`hidden lg:inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badge.classes}`}
              >
                {badge.label}
              </div>

              {/* User email & logout */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-semibold text-slate-800">{user?.nombre}</div>
                  <div className="text-[10px] text-slate-400">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNavClick('login')}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarse</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Controls (Visible on Screens < md) */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && role === 'CLIENTE' && (
            <button
              onClick={() => handleNavClick('cart')}
              className={`p-2 rounded-xl transition relative ${
                currentPage === 'cart'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-150">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                    {user.nombre.charAt(0)}
                    {user.apellido.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.classes}`}>
                  {user.rol}
                </span>
              </div>

              {role === 'CLIENTE' && (
                <div
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Billetera Virtual:</span>
                  </div>
                  <div className="font-extrabold text-emerald-700 text-sm">
                    ${user.saldo_disponible.toLocaleString('es-CO')} COP
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links list */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentPage === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Catálogo Principal</span>
            </button>

            {isAuthenticated ? (
              <>
                {role === 'CLIENTE' && (
                  <>
                    <button
                      onClick={() => handleNavClick('cart')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        currentPage === 'cart'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Mi Carrito</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('orders')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        currentPage === 'orders'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Mis Compras y Órdenes</span>
                    </button>
                  </>
                )}

                {(role === 'ROOT' || role === 'ADMINISTRADOR') && (
                  <button
                    onClick={() => handleNavClick('inventory')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      currentPage === 'inventory'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>Control de Inventario Físico</span>
                  </button>
                )}

                {role === 'ROOT' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      currentPage === 'admin'
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Panel Superadmin Root</span>
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    currentPage === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil y Seguridad</span>
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Cuenta Nueva</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
