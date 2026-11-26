import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

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
      console.error('Error en autenticación:', err);
      const serverDetail = err.response?.data?.detail;
      const networkMsg = err.message ? `(${err.message})` : '';
      setError(serverDetail || `Error al iniciar sesión. ${networkMsg}`);
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
    <div className="max-w-md mx-auto my-12 sm:my-16 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#707072]">
            Librería Central
          </p>
          <h1 className="text-[32px] font-medium text-[#111111] leading-[1.15]">
            Inicia sesión en tu cuenta
          </h1>
          <p className="text-sm text-[#707072]">
            Ingresa tus credenciales para comprar, revisar tus pedidos o gestionar el inventario.
          </p>
        </div>

        {error && (
          <div className="p-4 border border-[#d30005] bg-white text-[#d30005] text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111111]">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@libreria.com"
              className="nike-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111111]">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="nike-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nike-btn-primary w-full mt-2"
          >
            {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="pt-6 border-t border-[#cacacb] text-center">
          <p className="text-sm text-[#707072]">
            ¿Aún no eres miembro?{' '}
            <button
              onClick={onGoToRegister}
              className="text-[#111111] font-medium underline underline-offset-4 hover:text-[#707072] transition-colors"
            >
              Únete ahora
            </button>
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="pt-6 border-t border-[#e5e5e5] space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-[#707072]">
            Cuentas de Acceso Rápido
          </p>
          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickCredentials('root@libreria.com', 'RootSecure2026!')}
              className="w-full p-3.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#111111] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-medium">Superadmin ROOT</span>
                <span className="text-[#707072] ml-2">root@libreria.com</span>
              </div>
              <span className="underline underline-offset-2 text-[#111111] font-medium">Usar</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('admin.bodega@libreria.com', 'Admin2026!')}
              className="w-full p-3.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#111111] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-medium">Administrador</span>
                <span className="text-[#707072] ml-2">admin.bodega@libreria.com</span>
              </div>
              <span className="underline underline-offset-2 text-[#111111] font-medium">Usar</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('cliente.demo@gmail.com', 'Cliente2026!')}
              className="w-full p-3.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#111111] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-medium">Cliente Demo</span>
                <span className="text-[#707072] ml-2">cliente.demo@gmail.com</span>
              </div>
              <span className="underline underline-offset-2 text-[#111111] font-medium">Usar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
