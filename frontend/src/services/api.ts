import axios from 'axios';
import type { AuthResponse, GenericMessage, User } from '../types';

// Reads backend API URL dynamically from environment (Vercel) or falls back to local FastAPI
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return res.data;
    },
    register: async (userData: {
      dni: string;
      email: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      direccion?: string;
      password: string;
    }): Promise<User> => {
      const res = await apiClient.post<User>('/auth/register', userData);
      return res.data;
    },
    getProfile: async (): Promise<User> => {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    },
    updateProfile: async (data: { telefono?: string; direccion?: string }): Promise<User> => {
      const res = await apiClient.put<User>('/auth/me', data);
      return res.data;
    },
    changePassword: async (data: { current_password: string; new_password: string }): Promise<GenericMessage> => {
      const res = await apiClient.put<GenericMessage>('/auth/change-password', data);
      return res.data;
    },
    logout: async (): Promise<GenericMessage> => {
      const res = await apiClient.post<GenericMessage>('/auth/logout');
      return res.data;
    },
  },
  admin: {
    createAdmin: async (adminData: {
      dni: string;
      email: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      password: string;
    }): Promise<User> => {
      const res = await apiClient.post<User>('/admin/create-admin', adminData);
      return res.data;
    },
    getUsers: async (rol?: string): Promise<User[]> => {
      const res = await apiClient.get<User[]>('/admin/users', {
        params: rol ? { rol } : {},
      });
      return res.data;
    },
    toggleStatus: async (userId: number): Promise<GenericMessage> => {
      const res = await apiClient.put<GenericMessage>(`/admin/users/${userId}/toggle-status`);
      return res.data;
    },
  },
  compras: {
    validarPermiso: async (data: { libro_id: number; cantidad: number; modalidad: string }): Promise<GenericMessage> => {
      const res = await apiClient.post<GenericMessage>('/compras/validar-permiso-compra-reserva', data);
      return res.data;
    },
  },
};
