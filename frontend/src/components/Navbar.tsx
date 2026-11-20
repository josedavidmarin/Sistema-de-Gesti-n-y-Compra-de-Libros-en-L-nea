import React from 'react';
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
  Wallet
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, role, logout } = useAuth();

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow group-hover:bg-blue-700 transition">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Librería Central
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Lectura, Cultura & Saber</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={() => onNavigate('home')}
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
                    onClick={() => onNavigate('cart')}
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
                    onClick={() => onNavigate('orders')}
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
                  onClick={() => onNavigate('inventory')}
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
                  onClick={() => onNavigate('admin')}
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
                onClick={() => onNavigate('profile')}
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
                  onClick={() => onNavigate('profile')}
                  className="hidden lg:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer border border-slate-200 transition"
                  title="Saldo en Billetera Virtual (Clic para recargar)"
                >
                  <Wallet className="w-3 h-3 text-emerald-600" />
                  <span className="font-bold">${user.saldo_disponible.toLocaleString('es-CO')}</span>
                </div>
              )}

              {/* Role badge */}
              <div
                className={`hidden md:inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badge.classes}`}
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
                  onClick={logout}
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
                onClick={() => onNavigate('login')}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarse</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
