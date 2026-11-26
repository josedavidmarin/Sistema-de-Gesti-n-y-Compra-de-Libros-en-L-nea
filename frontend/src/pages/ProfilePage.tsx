/**
 * @file ProfilePage.tsx
 * @description User profile management and security view.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Wallet,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

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
      <div className="max-w-4xl mx-auto my-16 px-6 text-center text-[#707072]">
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
      setProfileMsg({
        type: 'success',
        text: 'Datos de contacto y dirección actualizados correctamente.',
      });
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-12">
      {/* Member Identity Header */}
      <div className="pb-10 border-b border-[#cacacb] flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-[18px] bg-[#111111] text-white flex items-center justify-center font-medium text-2xl flex-shrink-0">
            {user.nombre.charAt(0)}
            {user.apellido.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.2]">
                {user.nombre} {user.apellido}
              </h1>
              <span className="nike-badge-promo">{user.rol}</span>
            </div>
            <p className="text-sm text-[#707072] mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#707072] mt-2">
              <span>DNI: {user.dni}</span>
              <span>·</span>
              <span>Miembro desde {new Date(user.fecha_registro).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Member Benefit / Virtual Wallet Tile (Ink #111111, Rounded None) */}
        <div className="bg-[#111111] text-white p-6 sm:min-w-[300px] space-y-4">
          <div className="flex items-center justify-between text-xs text-[#9e9ea0]">
            <span className="flex items-center space-x-1.5 font-medium text-white">
              <Wallet className="w-4 h-4 text-[#1eaa52]" />
              <span>Billetera Virtual</span>
            </span>
            <span className="text-[#1eaa52] font-medium">Activa</span>
          </div>
          <div>
            <div className="text-3xl font-medium tracking-tight text-white">
              ${user.saldo_disponible.toLocaleString('es-CO')}{' '}
              <span className="text-sm text-[#9e9ea0] font-normal">COP</span>
            </div>
            <p className="text-xs text-[#9e9ea0] mt-1">Saldo disponible para compras directas</p>
          </div>
          {role === 'CLIENTE' && (
            <button
              onClick={() => setShowTopupModal(true)}
              className="nike-btn-on-image w-full space-x-1.5 text-sm h-10"
            >
              <Plus className="w-4 h-4" />
              <span>Recargar Saldo</span>
            </button>
          )}
        </div>
      </div>

      {/* Top-up Success Banner */}
      {topupSuccess && (
        <div className="p-4 border border-[#007d48] bg-white text-[#007d48] text-sm font-medium flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{topupSuccess}</span>
        </div>
      )}

      {/* Topup Modal */}
      {showTopupModal && (
        <div
          onClick={() => setShowTopupModal(false)}
          className="fixed inset-0 bg-[#111111]/70 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#cacacb] max-w-md w-full p-8 space-y-6 relative"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5]">
              <h3 className="text-xl font-medium text-[#111111]">Recargar Billetera Virtual</h3>
              <button
                onClick={() => setShowTopupModal(false)}
                className="nike-btn-icon"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#707072]">
              Selecciona un monto rápido o ingresa el valor personalizado en pesos colombianos.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupMonto(amt)}
                  className={`h-10 rounded-full text-sm font-medium transition-colors ${
                    topupMonto === amt
                      ? 'bg-[#111111] text-white'
                      : 'bg-white text-[#111111] border border-[#cacacb] hover:border-[#111111]'
                  }`}
                >
                  ${(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Monto Personalizado (COP)
              </label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={topupMonto}
                onChange={(e) => setTopupMonto(parseFloat(e.target.value) || 0)}
                className="nike-input font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={topupLoading || topupMonto <= 0}
                onClick={async () => {
                  setTopupLoading(true);
                  try {
                    const res = await api.compras.topupWallet(topupMonto);
                    await refreshProfile();
                    setTopupSuccess(
                      `Recarga exitosa. Nuevo saldo disponible: $${res.saldo_disponible.toLocaleString('es-CO')} COP`
                    );
                    setTimeout(() => setTopupSuccess(null), 4000);
                    setShowTopupModal(false);
                  } catch (err: any) {
                    alert(err.response?.data?.detail || 'Error al recargar saldo.');
                  } finally {
                    setTopupLoading(false);
                  }
                }}
                className="nike-btn-primary flex-1"
              >
                {topupLoading ? 'Acreditando...' : 'Confirmar Recarga'}
              </button>
              <button
                type="button"
                onClick={() => setShowTopupModal(false)}
                className="nike-btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact & Shipping */}
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#cacacb]">
            <h2 className="text-xl font-medium text-[#111111]">Datos de Correspondencia y Envío</h2>
          </div>

          {profileMsg && (
            <div
              className={`p-4 border text-sm flex items-center space-x-2.5 ${
                profileMsg.type === 'success'
                  ? 'border-[#007d48] text-[#007d48]'
                  : 'border-[#d30005] text-[#d30005]'
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

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 3125554321"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Dirección de Domicilio / Envío
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Carrera 27 # 4-10, Pereira"
                className="nike-input"
              />
            </div>

            <button type="submit" disabled={savingProfile} className="nike-btn-primary">
              {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Security & Password */}
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#cacacb]">
            <h2 className="text-xl font-medium text-[#111111]">Seguridad y Contraseña</h2>
          </div>

          {pwdMsg && (
            <div
              className={`p-4 border text-sm flex items-center space-x-2.5 ${
                pwdMsg.type === 'success'
                  ? 'border-[#007d48] text-[#007d48]'
                  : 'border-[#d30005] text-[#d30005]'
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

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Contraseña Actual *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="nike-input"
              />
            </div>

            <button type="submit" disabled={savingPwd} className="nike-btn-secondary">
              {savingPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>

      {/* Institutional Policy Notice for Internal Staff */}
      {(role === 'ADMINISTRADOR' || role === 'ROOT') && (
        <div className="bg-[#f5f5f5] p-6 border-l-4 border-[#111111] flex items-start space-x-4">
          <ShieldAlert className="w-5 h-5 text-[#111111] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-[#111111]">
              Política de Transparencia y Control Interno
            </h3>
            <p className="text-sm text-[#707072] leading-relaxed">
              Las cuentas con credenciales de administración y control no están habilitadas para
              realizar compras de inventario o adquisiciones comerciales en el catálogo, en estricto
              apego a las políticas de auditoría corporativa y separación de funciones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
