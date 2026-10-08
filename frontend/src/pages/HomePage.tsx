import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isAuthenticated, user, role } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Sprint 1 en Producción Local — Módulo de Usuarios y Seguridad</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Sistema de Gestión y Compra de Libros en Línea
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Plataforma omnicanal con control granular por copia física, expiración autónoma de reservas a
          las 24 horas y arquitectura segura basada en roles (RBAC).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('profile')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <span>Ir a Mi Perfil ({user?.nombre})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition"
              >
                Registrarse como Cliente
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid Sprint 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Autenticación JWT & Bcrypt</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tokens Bearer seguros con vencimiento a 24h y encriptación unidireccional de contraseñas
            bajo el estándar RF-026 y RNF-04.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Roles RBAC Diferenciados</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Control de acceso estricto entre Visitante, Cliente, Administrador y Root. Únicamente el
            Superadmin Root puede dar de alta administradores (RF-030).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Restricción RF-031</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Regla de negocio validada: los Administradores y Root tienen prohibido comprar o reservar
            libros en la tienda, blindando la auditoría del inventario.
          </p>
        </div>
      </div>

      {/* Estado del usuario actual */}
      <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Sesión Actual en el Cliente
          </div>
          <div className="text-sm text-slate-800 mt-1">
            {isAuthenticated ? (
              <span>
                Conectado como <strong className="text-slate-900">{user?.nombre} {user?.apellido}</strong> ({user?.email}) con rol{' '}
                <span className="font-bold text-blue-600">{role}</span>.
              </span>
            ) : (
              <span>Navegando como <strong>Visitante anónimo</strong>. Inicie sesión para interactuar con el sistema.</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600">Servidor FastAPI en Línea</span>
        </div>
      </div>
    </div>
  );
};
