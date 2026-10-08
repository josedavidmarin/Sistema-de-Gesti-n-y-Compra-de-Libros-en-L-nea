import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Error al iniciar sesión. Verifique sus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
          <p className="text-sm text-slate-500 mt-1">
            Autenticación segura JWT para clientes y administración
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@libreria.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <span>Validando credenciales...</span>
            ) : (
              <>
                <span>Entrar a la Plataforma</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            ¿No tienes una cuenta aún?{' '}
            <button
              onClick={onGoToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Registrarse como Cliente
            </button>
          </p>
        </div>

        {/* Cuentas de prueba para el Demo Day */}
        <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Acceso Rápido para Sustentación / Demo Day</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickCredentials('root@libreria.com', 'RootSecure2026!')}
              className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-left hover:bg-rose-100 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold">🔑 Superadmin ROOT:</span> root@libreria.com
              </div>
              <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded font-mono">Autorellenar</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('admin.bodega@libreria.com', 'Admin2026!')}
              className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-left hover:bg-emerald-100 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold">🛠️ Administrador:</span> admin.bodega@libreria.com
              </div>
              <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-mono">Autorellenar</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('cliente.demo@gmail.com', 'Cliente2026!')}
              className="p-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-left hover:bg-blue-100 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold">👤 Cliente Demo:</span> cliente.demo@gmail.com
              </div>
              <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded font-mono">Autorellenar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
