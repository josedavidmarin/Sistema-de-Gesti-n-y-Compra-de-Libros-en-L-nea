/**
 * @file ProfilePage.tsx
 * @description User profile management and security view:
 * - Secure password update with previous password verification.
 * - Contact/shipping details update and virtual wallet balance display.
 * - Institutional policy review for administrative users.
 */

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
  Plus
} from 'lucide-react';

/**
 * Profile management component for authenticated users.
 */
export const ProfilePage: React.FC = () => {
  const { user, refreshProfile, role } = useAuth();
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Top-up virtual wallet state
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupMonto, setTopupMonto] = useState(50000);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 text-center text-slate-500">
        Inicie sesión para visualizar su perfil.
      </div>
    );
  }

  /**
   * Submits updated contact phone and shipping address to PUT /api/v1/auth/me.
   */
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

  /**
   * Validates current and new password constraints and invokes PUT /api/v1/auth/change-password.
   * Ensures the new password matches confirmation and differs from the current password.
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    if (currentPassword === newPassword) {
      setPwdMsg({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual.' });
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

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6">
      {/* Profile Header */}
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

          {/* Virtual Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md min-w-[260px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="flex items-center space-x-1.5 font-semibold">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Monedero Virtual</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Activo
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight text-emerald-400">
                ${user.saldo_disponible.toLocaleString('es-CO')} COP
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Saldo disponible para compras directas</div>
            </div>

            {role === 'CLIENTE' && (
              <button
                onClick={() => setShowTopupModal(true)}
                className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Recargar Billetera</span>
              </button>
            )}
          </div>
        </div>

        {/* Top-up Success Banner */}
        {topupSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{topupSuccess}</span>
          </div>
        )}
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Recargar Billetera Virtual</h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Selecciona o ingresa el monto que deseas abonar a tu saldo para adquirir libros de nuestro catálogo.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupMonto(amt)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                    topupMonto === amt
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ${(amt / 1000).toFixed(0)}k COP
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monto Personalizado (COP)</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={topupMonto}
                onChange={(e) => setTopupMonto(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTopupModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={topupLoading || topupMonto <= 0}
                onClick={async () => {
                  setTopupLoading(true);
                  try {
                    const res = await api.compras.topupWallet(topupMonto);
                    await refreshProfile();
                    setTopupSuccess(`¡Recarga exitosa! Nuevo saldo disponible: $${res.saldo_disponible.toLocaleString('es-CO')} COP`);
                    setTimeout(() => setTopupSuccess(null), 4000);
                    setShowTopupModal(false);
                  } catch (err: any) {
                    alert(err.response?.data?.detail || 'Error al recargar saldo.');
                  } finally {
                    setTopupLoading(false);
                  }
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold shadow"
              >
                {topupLoading ? 'Acreditando...' : 'Confirmar Recarga'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Contact & Shipping Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Datos de Correspondencia y Envío
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

        {/* Secure Password Update */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Seguridad: Cambio de Contraseña
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

      {/* Institutional Policy Notice for Internal Staff */}
      {(role === 'ADMINISTRADOR' || role === 'ROOT') && (
        <div className="mt-6 bg-slate-900 text-slate-300 rounded-2xl p-6 border border-slate-800 flex items-start space-x-4 shadow-sm">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Política de Transparencia y Control Interno
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Las cuentas con credenciales de administración y control no están habilitadas para realizar
              compras de inventario o adquisiciones comerciales en el catálogo, en estricto apego a las políticas de
              auditoría corporativa y separación de funciones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
