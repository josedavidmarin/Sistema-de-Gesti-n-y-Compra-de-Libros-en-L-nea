import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  CreditCard,
  Phone,
  Power
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { role, user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      console.error('Error cargando usuarios:', err);
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
      <div className="max-w-2xl mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-rose-800">Acceso Exclusivo Superadmin Root</h2>
        <p className="text-sm text-rose-600 mt-2">
          De conformidad con el requerimiento RF-030 (HU-02), únicamente el rol <strong>ROOT</strong> tiene
          privilegios para dar de alta nuevo personal administrativo o auditar la nómina de usuarios.
        </p>
      </div>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    setCreatingAdmin(true);

    try {
      const created = await api.admin.createAdmin(formData);
      setFormMsg({
        type: 'success',
        text: `Administrador creado exitosamente: ${created.nombre} ${created.apellido} (${created.email}) con rol ADMINISTRADOR.`,
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
    try {
      await api.admin.toggleStatus(targetId);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al modificar el estado de la cuenta.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      {/* Banner Root */}
      <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-rose-500/20 border border-rose-400/30 rounded-xl">
            <ShieldCheck className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Control Root — Seguridad y Personal</h1>
            <p className="text-xs text-rose-200">
              HU-02 / RF-030: Creación y Auditoría de Cuentas Administrativas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Creación de Administrador (Mockup 5.4) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-800">
              Crear Nuevo Administrador (RF-030)
            </h2>
          </div>

          {formMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-start space-x-2 ${
                formMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
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

          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                DNI / Cédula *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="Ej. 9876543210"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Correo Institucional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin.sucursal@libreria.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Laura Patricia"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Montoya Gómez"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="3101234567"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contraseña Temporal *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingAdmin}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-2 mt-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>{creatingAdmin ? 'Registrando...' : 'Dar de Alta Administrador'}</span>
            </button>
          </form>
        </div>

        {/* Listado de Usuarios y Auditoría */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-800">
                Padrón de Usuarios del Sistema ({usersList.length})
              </h2>
            </div>
            <button
              onClick={loadUsers}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Recargar lista
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Usuario</th>
                    <th className="pb-3 font-semibold">DNI</th>
                    <th className="pb-3 font-semibold">Rol</th>
                    <th className="pb-3 font-semibold">Saldo</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-600">{u.dni}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.rol === 'ROOT'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : u.rol === 'ADMINISTRADOR'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-700">
                        ${u.saldo_disponible.toLocaleString('es-CO')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.is_active ? 'Suspender cuenta' : 'Reactivar cuenta'}
                            className={`p-1.5 rounded-lg border transition ${
                              u.is_active
                                ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
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
