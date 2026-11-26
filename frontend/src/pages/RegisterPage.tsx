/**
 * @file RegisterPage.tsx
 * @description Client registration view.
 * Provides form validation for unique national ID (DNI), email, contact details,
 * password confirmation, and Colombian Law 1581 (Habeas Data) consent.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onGoToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });
  const [habeasData, setHabeasData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.dni.trim().length < 5) {
      setError('El Documento de Identidad (DNI) debe contener al menos 5 caracteres.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!habeasData) {
      setError('Debe aceptar las políticas de tratamiento de datos personales (Ley 1581).');
      return;
    }

    setLoading(true);
    try {
      await register({
        dni: formData.dni.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        password: formData.password,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Error al procesar el registro. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    formData.password.length >= 6 &&
    formData.confirmPassword.length >= 6 &&
    formData.password === formData.confirmPassword;

  return (
    <div className="max-w-2xl mx-auto my-12 px-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#707072]">
            Membresía Librería Central
          </p>
          <h1 className="text-[32px] font-medium text-[#111111] leading-[1.15]">
            Crea tu cuenta de cliente
          </h1>
          <p className="text-sm text-[#707072]">
            Accede a tu billetera virtual, seguimiento de ejemplares físicos y envíos a domicilio.
          </p>
        </div>

        {error && (
          <div className="p-4 border border-[#d30005] bg-white text-[#d30005] text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Documento de Identidad (DNI) *
              </label>
              <input
                type="text"
                name="dni"
                required
                minLength={5}
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ej. 1088123456"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="su_correo@dominio.com"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Nombres *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Carlos Alberto"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Gómez Restrepo"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 3125554321"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Dirección de Envío
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej. Carrera 27 # 4-10, Pereira"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="nike-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita la contraseña"
                className="nike-input"
              />
              {passwordsMatch && (
                <p className="text-xs text-[#007d48] font-medium pt-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Las contraseñas coinciden</span>
                </p>
              )}
            </div>
          </div>

          {/* Habeas Data Consent */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 text-xs text-[#707072] cursor-pointer leading-relaxed">
              <input
                type="checkbox"
                checked={habeasData}
                onChange={(e) => setHabeasData(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#111111]"
              />
              <span>
                Autorizo el tratamiento de mis datos personales de conformidad con la Ley 1581 de
                2012 de Colombia y las políticas de privacidad de Librería Central.
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="nike-btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div className="pt-6 border-t border-[#cacacb] text-center">
          <p className="text-sm text-[#707072]">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={onGoToLogin}
              className="text-[#111111] font-medium underline underline-offset-4 hover:text-[#707072] transition-colors"
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
