import axios from 'axios';
import type {
  AuthResponse,
  GenericMessage,
  User,
  Book,
  BookCopy,
  CartSummary,
  Order,
  WalletBalance,
} from '../types';

// Reads backend API URL dynamically from environment (Vercel) or falls back to local FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token automatically
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

  libros: {
    getAll: async (params?: {
      q?: string;
      genero?: string;
      es_novedad?: boolean;
      solo_disponibles?: boolean;
    }): Promise<Book[]> => {
      const res = await apiClient.get<Book[]>('/libros', { params });
      return res.data;
    },
    getById: async (id: number): Promise<Book> => {
      const res = await apiClient.get<Book>(`/libros/${id}`);
      return res.data;
    },
    create: async (data: {
      isbn: string;
      titulo: string;
      autor: string;
      editorial: string;
      genero: string;
      idioma?: string;
      anio_publicacion?: number;
      numero_paginas?: number;
      estado_libro?: string;
      precio: number;
      descripcion?: string;
      portada_url?: string;
      cantidad_ejemplares?: number;
      sede?: string;
    }): Promise<Book> => {
      const res = await apiClient.post<Book>('/libros', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Book>): Promise<Book> => {
      const res = await apiClient.put<Book>(`/libros/${id}`, data);
      return res.data;
    },
    addCopies: async (id: number, cantidad: number, sede: string = 'Sede Principal Pereira'): Promise<Book> => {
      const res = await apiClient.post<Book>(`/libros/${id}/ejemplares`, { cantidad, sede });
      return res.data;
    },
    decommissionCopy: async (copyId: number, motivo: string = 'Deterioro físico'): Promise<BookCopy> => {
      const res = await apiClient.patch<BookCopy>(`/libros/ejemplares/${copyId}/dar-de-baja`, { motivo });
      return res.data;
    },
  },

  compras: {
    validarPermiso: async (data: { libro_id: number; cantidad: number; modalidad: string }): Promise<GenericMessage> => {
      const res = await apiClient.post<GenericMessage>('/compras/validar-permiso-compra-reserva', data);
      return res.data;
    },
    getCart: async (): Promise<CartSummary> => {
      const res = await apiClient.get<CartSummary>('/compras/carrito');
      return res.data;
    },
    addToCart: async (libro_id: number, cantidad: number = 1): Promise<CartSummary> => {
      const res = await apiClient.post<CartSummary>('/compras/carrito', { libro_id, cantidad });
      return res.data;
    },
    updateCartItem: async (cart_item_id: number, cantidad: number): Promise<CartSummary> => {
      const res = await apiClient.put<CartSummary>(`/compras/carrito/${cart_item_id}`, { cantidad });
      return res.data;
    },
    removeCartItem: async (cart_item_id: number): Promise<CartSummary> => {
      const res = await apiClient.delete<CartSummary>(`/compras/carrito/${cart_item_id}`);
      return res.data;
    },
    clearCart: async (): Promise<GenericMessage> => {
      const res = await apiClient.delete<GenericMessage>('/compras/carrito');
      return res.data;
    },
    checkout: async (direccion_envio?: string): Promise<Order> => {
      const res = await apiClient.post<Order>('/compras/checkout', { direccion_envio });
      return res.data;
    },
    getOrders: async (): Promise<Order[]> => {
      const res = await apiClient.get<Order[]>('/compras/ordenes');
      return res.data;
    },
    getOrder: async (orden_id: number): Promise<Order> => {
      const res = await apiClient.get<Order>(`/compras/ordenes/${orden_id}`);
      return res.data;
    },
    cancelOrder: async (orden_id: number): Promise<Order> => {
      const res = await apiClient.post<Order>(`/compras/ordenes/${orden_id}/cancelar`);
      return res.data;
    },
    getWalletBalance: async (): Promise<WalletBalance> => {
      const res = await apiClient.get<WalletBalance>('/compras/billetera/saldo');
      return res.data;
    },
    topupWallet: async (monto: number): Promise<WalletBalance> => {
      const res = await apiClient.post<WalletBalance>('/compras/billetera/recargar', { monto });
      return res.data;
    },
  },
};
