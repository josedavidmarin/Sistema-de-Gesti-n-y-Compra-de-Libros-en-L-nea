import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  Wallet,
  Phone,
  MapPin,
  Lock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Save,
  ShoppingBag
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile, role } = useAuth();
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Cambio de clave
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  // Simulación regla RF-031
  const [testCompraMsg, setTestCompraMsg] = useState<{
    status: number;
    title: string;
    detail: string;
    isError: boolean;
  } | null>(null);
  const [testingCompra, setTestingCompra] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 text-center text-slate-500">
        Inicie sesión para visualizar su perfil.
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await api.auth.updateProfile({ telefono, direccion });
      await refreshProfile();
      setProfileMsg({ type: 'success', text: 'Datos de contacto y dirección actualizados correctamente.' });
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Error al actualizar el perfil.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPwdMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    setSavingPwd(true);
    try {
      const res = await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdMsg({ type: 'success', text: res.mensaje });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Error al cambiar la contraseña.',
      });
    } finally {
      setSavingPwd(false);
    }
  };

  const handleTestCompraRestriction = async () => {
    setTestingCompra(true);
    setTestCompraMsg(null);
    try {
      const res = await api.compras.validarPermiso({
        libro_id: 1,
        cantidad: 1,
        modalidad: 'COMPRA',
      });
      setTestCompraMsg({
        status: 200,
        title: '✅ Operación Permitida (HTTP 200 OK)',
        detail: `${res.mensaje} — ${res.detalle || ''}`,
        isError: false,
      });
    } catch (err: any) {
      const status = err.response?.status || 500;
      const detail = err.response?.data?.detail || 'Error en la petición.';
      setTestCompraMsg({
        status,
        title: `🛑 Bloqueado por Regla RF-031 (HTTP ${status} Forbidden)`,
        detail,
        isError: true,
      });
    } finally {
      setTestingCompra(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6">
      {/* Header Perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow">
              {user.nombre.charAt(0)}
              {user.apellido.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.nombre} {user.apellido}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    role === 'ROOT'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : role === 'ADMINISTRADOR'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  {user.rol}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                <span>DNI: <strong className="text-slate-600">{user.dni}</strong></span>
                <span>•</span>
                <span>Miembro desde: {new Date(user.fecha_registro).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Saldo Disponible (RF-037) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center space-x-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Monedero Virtual</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                RF-037
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-400">
              ${user.saldo_disponible.toLocaleString('es-CO')} COP
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Saldo disponible para compras directas</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HU-07: Actualizar Datos de Perfil y Envíos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Datos de Correspondencia y Envío (RF-021)
            </h2>
          </div>

          {profileMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 3125554321"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dirección de Domicilio / Envío
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Carrera 27 # 4-10, Pereira"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Guardando cambios...' : 'Guardar Datos de Perfil'}</span>
            </button>
          </form>
        </div>

        {/* HU-06: Cambio de Contraseña */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Seguridad: Cambio de Contraseña (RF-028)
            </h2>
          </div>

          {pwdMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                pwdMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {pwdMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contraseña Actual *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={savingPwd}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{savingPwd ? 'Actualizando clave...' : 'Actualizar Contraseña'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* HU-03: Demostración Interactiva de Restricción RF-031 */}
      <div className="mt-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">
                Demostración de Regla RF-031 (Restricción de Compra para Administradores)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              De acuerdo con las reglas de negocio del proyecto (HU-03 / RF-031), el sistema prohíbe
              que cuentas con rol <strong className="text-emerald-400">ADMINISTRADOR</strong> o{' '}
              <strong className="text-rose-400">ROOT</strong> compren o reserven libros.
              Haz clic abajo para validar la respuesta del servidor en tiempo real con tu usuario actual:
            </p>
          </div>

          <button
            onClick={handleTestCompraRestriction}
            disabled={testingCompra}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{testingCompra ? 'Validando...' : 'Simular Compra'}</span>
          </button>
        </div>

        {testCompraMsg && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs border ${
              testCompraMsg.isError
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="font-bold text-sm mb-1">{testCompraMsg.title}</div>
            <div className="text-xs">{testCompraMsg.detail}</div>
          </div>
        )}
      </div>
    </div>
  );
};
