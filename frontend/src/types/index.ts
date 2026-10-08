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
