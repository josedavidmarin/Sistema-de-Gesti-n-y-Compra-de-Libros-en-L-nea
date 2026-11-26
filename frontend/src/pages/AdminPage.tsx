/**
 * @file AdminPage.tsx
 * @description Superadmin Root control panel.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User } from '../types';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Power,
  RefreshCw,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { role, user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditMsg, setAuditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
  });

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.admin.getUsers();
      setUsersList(data);
    } catch (err) {
      console.error('Error loading system users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (role === 'ROOT') {
      loadUsers();
    }
  }, [role]);

  if (role !== 'ROOT') {
    return (
      <div className="max-w-2xl mx-auto my-20 px-6 text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-[#111111] mx-auto" />
        <h2 className="text-2xl font-medium text-[#111111]">Acceso Exclusivo Superadmin Root</h2>
        <p className="text-sm text-[#707072]">
          Únicamente los usuarios con perfil de <strong className="text-[#111111]">SUPERADMINISTRADOR ROOT</strong> pueden
          dar de alta personal administrativo o auditar cuentas corporativas.
        </p>
      </div>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    if (formData.dni.trim().length < 5) {
      setFormMsg({ type: 'error', text: 'El DNI debe contener al menos 5 caracteres.' });
      return;
    }

    setCreatingAdmin(true);
    try {
      const created = await api.admin.createAdmin({
        ...formData,
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim() || undefined,
      });
      setFormMsg({
        type: 'success',
        text: `Administrador creado: ${created.nombre} ${created.apellido} (${created.email}).`,
      });
      setFormData({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
      });
      await loadUsers();
    } catch (err: any) {
      setFormMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Error al crear la cuenta de administrador.',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleStatus = async (targetId: number) => {
    setAuditMsg(null);
    try {
      const res = await api.admin.toggleStatus(targetId);
      setAuditMsg({ type: 'success', text: res.mensaje });
      await loadUsers();
    } catch (err: any) {
      setAuditMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Error al modificar el estado de la cuenta.',
      });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-12">
      {/* Ink Banner Header */}
      <div className="bg-[#111111] text-white p-8 sm:p-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-[#9e9ea0]">
          Control Corporativo · Nivel Root
        </p>
        <h1 className="text-2xl sm:text-[32px] font-medium leading-[1.2]">
          Panel de Seguridad y Personal
        </h1>
        <p className="text-sm text-[#cacacb] max-w-2xl">
          Provisión de cuentas administrativas, auditoría del padrón de usuarios y control de accesos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Administrator Provisioning Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="pb-4 border-b border-[#cacacb]">
            <h2 className="text-xl font-medium text-[#111111]">
              Nuevo Colaborador Administrativo
            </h2>
          </div>

          {formMsg && (
            <div
              className={`p-4 border text-sm flex items-start space-x-2.5 ${
                formMsg.type === 'success'
                  ? 'border-[#007d48] text-[#007d48]'
                  : 'border-[#d30005] text-[#d30005]'
              }`}
            >
              {formMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{formMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#111111]">DNI / Cédula *</label>
              <input
                type="text"
                required
                minLength={5}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej. 9876543210"
                className="nike-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#111111]">
                Correo Institucional *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin.sucursal@libreria.com"
                className="nike-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111111]">Nombres *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Laura Patricia"
                  className="nike-input"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111111]">Apellidos *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Montoya Gómez"
                  className="nike-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#111111]">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="3101234567"
                className="nike-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#111111]">
                Contraseña Temporal *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className="nike-input"
              />
            </div>

            <button type="submit" disabled={creatingAdmin} className="nike-btn-primary w-full mt-2">
              {creatingAdmin ? 'Registrando...' : 'Dar de Alta Administrador'}
            </button>
          </form>
        </div>

        {/* User Audit Directory (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#cacacb]">
            <h2 className="text-xl font-medium text-[#111111]">
              Padrón de Usuarios ({usersList.length})
            </h2>
            <button
              onClick={loadUsers}
              className="nike-btn-icon"
              title="Recargar lista"
              aria-label="Recargar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {auditMsg && (
            <div
              className={`p-4 border text-sm flex items-center space-x-2.5 ${
                auditMsg.type === 'success'
                  ? 'border-[#007d48] text-[#007d48]'
                  : 'border-[#d30005] text-[#d30005]'
              }`}
            >
              {auditMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{auditMsg.text}</span>
            </div>
          )}

          {loadingUsers ? (
            <div className="py-16 text-center text-sm text-[#707072]">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#cacacb] text-xs font-medium uppercase tracking-wider text-[#707072]">
                    <th className="pb-3 pr-4">Usuario</th>
                    <th className="pb-3 pr-4">DNI</th>
                    <th className="pb-3 pr-4">Rol</th>
                    <th className="pb-3 pr-4">Saldo</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f5f5f5] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-[#111111]">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-xs text-[#707072]">{u.email}</div>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-[#707072]">{u.dni}</td>
                      <td className="py-4 pr-4">
                        <span className="nike-badge-promo">{u.rol}</span>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-[#111111]">
                        ${u.saldo_disponible.toLocaleString('es-CO')}
                      </td>
                      <td className="py-4 pr-4 text-xs font-medium">
                        <span className={u.is_active ? 'text-[#007d48]' : 'text-[#d30005]'}>
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.is_active ? 'Suspender cuenta' : 'Reactivar cuenta'}
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                              u.is_active
                                ? 'border-[#d30005] text-[#d30005] hover:bg-[#d30005] hover:text-white'
                                : 'border-[#007d48] text-[#007d48] hover:bg-[#007d48] hover:text-white'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
