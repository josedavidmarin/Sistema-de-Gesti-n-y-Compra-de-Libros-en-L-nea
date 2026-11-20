import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import {
  Package,
  Calendar,
  MapPin,
  Barcode,
  XCircle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.compras.getOrders();
      setOrders(data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Error al cargar el historial de órdenes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta orden? El dinero será devuelto a tu Billetera Virtual y los ejemplares físicos volverán al inventario.')) {
      return;
    }

    try {
      setCancelingId(orderId);
      setNotification(null);
      const canceledOrder = await api.compras.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? canceledOrder : o)));
      setNotification({
        type: 'success',
        message: `Orden #${orderId} cancelada exitosamente. Se han reembolsado $${canceledOrder.total.toLocaleString('es-CO')} COP a tu Billetera Virtual.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'No se pudo cancelar la orden.',
      });
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'EN_PREPARACION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>En Preparación</span>
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Package className="w-3 h-3" />
            <span>Enviado</span>
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Entregado</span>
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelada (Reembolsada)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  if (role !== 'CLIENTE') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Exclusivo de Clientes</h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          El módulo de compras y pedidos está destinado exclusivamente a cuentas de clientes registrados.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Compras y Órdenes</h1>
            <p className="text-xs text-slate-500">
              Historial de pedidos, seguimiento de copias físicas y gestión de cancelaciones.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition self-end sm:self-auto"
          title="Refrescar órdenes"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start space-x-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{notification.message}</div>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Cargando tus compras...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aún no tienes compras realizadas</h3>
          <p className="text-sm text-slate-500">
            Los libros que compres con tu Billetera Virtual aparecerán listados aquí con sus ejemplares físicos únicos.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition"
          >
            Ir a Comprar Libros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isCancelable = order.estado === 'EN_PREPARACION';
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-slate-900 text-lg">
                      Orden #{order.id}
                    </span>
                    {getStatusBadge(order.estado)}
                  </div>

                  <div className="flex items-center space-x-6 text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(order.fecha_compra).toLocaleString('es-CO')}</span>
                    </div>

                    <div className="font-extrabold text-slate-900 text-base">
                      ${order.total.toLocaleString('es-CO')} COP
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6 space-y-4">
                  {/* Shipping address & cancellation date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>
                        Envío a: <strong>{order.direccion_envio}</strong>
                      </span>
                    </div>

                    {order.fecha_cancelacion && (
                      <div className="text-rose-600 font-medium">
                        Cancelada el: {new Date(order.fecha_cancelacion).toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>

                  {/* Physical items list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Copias Físicas Incluidas en la Orden:
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.detalles?.map((det) => (
                        <div
                          key={det.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{det.titulo_libro}</div>
                            <div className="text-slate-500">
                              Precio: ${det.precio_unitario.toLocaleString('es-CO')} COP
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-md border border-slate-200 text-blue-700 font-mono font-bold">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            <span>{det.codigo_ejemplar}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {isCancelable && (
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelingId === order.id}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center space-x-1.5"
                      >
                        {cancelingId === order.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Cancelando y Reembolsando...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancelar Orden y Reembolsar Saldo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
