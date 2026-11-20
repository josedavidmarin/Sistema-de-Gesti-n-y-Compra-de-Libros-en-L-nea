export type RoleType = 'VISITANTE' | 'CLIENTE' | 'ADMINISTRADOR' | 'ROOT';

export interface User {
  id: number;
  dni: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol: RoleType;
  saldo_disponible: number;
  is_active: boolean;
  fecha_registro: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  rol: RoleType;
  nombre: string;
  apellido: string;
  email: string;
  user_id: number;
}

export interface GenericMessage {
  mensaje: string;
  detalle?: string;
}

export interface BookCopy {
  id: number;
  codigo_unico: string;
  libro_id: number;
  sede: string;
  estado: 'DISPONIBLE' | 'VENDIDO' | 'DADO_DE_BAJA';
  fecha_ingreso: string;
}

export interface Book {
  id: number;
  isbn: string;
  titulo: string;
  autor: string;
  editorial: string;
  genero: string;
  idioma: string;
  anio_publicacion: number;
  numero_paginas: number;
  estado_libro: 'NUEVO' | 'USADO';
  precio: number;
  descripcion?: string;
  portada_url?: string;
  es_novedad: boolean;
  historico_agotado: boolean;
  fecha_registro: string;
  stock_disponible: number;
  stock_vendido: number;
  stock_total_activo: number;
  ejemplares?: BookCopy[];
}

export interface CartItemDetail {
  id: number;
  libro_id: number;
  titulo: string;
  autor: string;
  portada_url?: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  stock_disponible: number;
}

export interface CartSummary {
  items: CartItemDetail[];
  total_items: number;
  titulos_distintos: number;
  subtotal: number;
  saldo_cliente: number;
  alcance_saldo: boolean;
  todos_disponibles: boolean;
}

export interface OrderItem {
  id: number;
  libro_id: number;
  ejemplar_id: number;
  titulo_libro: string;
  codigo_ejemplar: string;
  precio_unitario: number;
}

export interface Order {
  id: number;
  cliente_id: number;
  total: number;
  direccion_envio: string;
  estado: 'EN_PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADA';
  fecha_compra: string;
  fecha_cancelacion?: string;
  detalles: OrderItem[];
}

export interface WalletBalance {
  email: string;
  nombre_completo: string;
  saldo_disponible: number;
}
