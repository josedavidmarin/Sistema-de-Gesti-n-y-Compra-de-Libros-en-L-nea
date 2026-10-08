import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

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
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Librería en Línea
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Sprint 1
              </span>
            </div>
            <p className="text-xs text-slate-500">IS873 - Laboratorio de Software (UTP)</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              currentPage === 'home'
                ? 'bg-slate-100 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Inicio
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  currentPage === 'profile'
                    ? 'bg-slate-100 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mi Perfil</span>
              </button>

              {role === 'ROOT' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    currentPage === 'admin'
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Root</span>
                </button>
              )}

              {/* Role badge */}
              <div
                className={`hidden md:inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-semibold ${badge.classes}`}
              >
                {badge.label}
              </div>

              {/* User email & logout */}
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">{user?.nombre}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
