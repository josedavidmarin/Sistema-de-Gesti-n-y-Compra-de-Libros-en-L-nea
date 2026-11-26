import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import {
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
    if (
      !window.confirm(
        '¿Seguro que deseas cancelar esta orden? El dinero será devuelto a tu Billetera Virtual y los ejemplares físicos volverán al inventario.'
      )
    ) {
      return;
    }

    try {
      setCancelingId(orderId);
      setNotification(null);
      const canceledOrder = await api.compras.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? canceledOrder : o)));
      setNotification({
        type: 'success',
        message: `Orden #${orderId} cancelada. Se reembolsaron $${canceledOrder.total.toLocaleString('es-CO')} COP a tu Billetera Virtual.`,
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

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'EN_PREPARACION':
        return <span className="text-sm font-medium text-[#111111]">En Preparación</span>;
      case 'ENVIADO':
        return <span className="text-sm font-medium text-[#1151ff]">Enviado</span>;
      case 'ENTREGADO':
        return <span className="text-sm font-medium text-[#007d48]">Entregado</span>;
      case 'CANCELADA':
        return <span className="text-sm font-medium text-[#d30005]">Cancelada (Reembolsada)</span>;
      default:
        return <span className="text-sm font-medium text-[#707072]">{estado}</span>;
    }
  };

  if (role !== 'CLIENTE') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-5">
        <h2 className="text-2xl font-medium text-[#111111]">Acceso Exclusivo de Clientes</h2>
        <p className="text-sm text-[#707072]">
          El historial de compras y pedidos está destinado únicamente a clientes registrados.
        </p>
        <button onClick={() => onNavigate('home')} className="nike-btn-primary">
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#cacacb]">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.2]">
            Mis Compras
          </h1>
          <p className="text-sm text-[#707072] mt-1">
            Seguimiento de pedidos, códigos de ejemplares físicos y reembolsos.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="nike-btn-icon self-start sm:self-auto"
          title="Actualizar órdenes"
          aria-label="Actualizar órdenes"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 border text-sm flex items-start space-x-2.5 ${
            notification.type === 'success'
              ? 'border-[#007d48] text-[#007d48]'
              : 'border-[#d30005] text-[#d30005]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{notification.message}</div>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#707072]">Cargando tus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-5 bg-[#f5f5f5] max-w-lg mx-auto p-10">
          <Package className="w-10 h-10 text-[#707072] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-[#111111]">Aún no tienes compras</h3>
            <p className="text-sm text-[#707072]">
              Los títulos que adquieras aparecerán aquí con el código único de cada copia física.
            </p>
          </div>
          <button onClick={() => onNavigate('home')} className="nike-btn-primary">
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#cacacb] border-b border-[#cacacb]">
          {orders.map((order) => {
            const isCancelable = order.estado === 'EN_PREPARACION';
            return (
              <div key={order.id} className="py-8 first:pt-0 space-y-5">
                {/* Order Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xl font-medium text-[#111111]">
                        Orden #{order.id}
                      </span>
                      <span className="text-[#cacacb]">·</span>
                      {getStatusText(order.estado)}
                    </div>
                    <p className="text-xs text-[#707072]">
                      {new Date(order.fecha_compra).toLocaleString('es-CO')} · Envío a:{' '}
                      <span className="text-[#111111]">{order.direccion_envio}</span>
                    </p>
                    {order.fecha_cancelacion && (
                      <p className="text-xs text-[#d30005]">
                        Cancelada el {new Date(order.fecha_cancelacion).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>

                  <div className="text-lg font-medium text-[#111111]">
                    ${order.total.toLocaleString('es-CO')} COP
                  </div>
                </div>

                {/* Physical Copies List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.detalles?.map((det) => (
                    <div
                      key={det.id}
                      className="p-4 bg-[#f5f5f5] flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-[#111111] truncate">
                          {det.titulo_libro}
                        </div>
                        <div className="text-xs text-[#707072]">
                          ${det.precio_unitario.toLocaleString('es-CO')} COP
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#111111] bg-white px-2.5 py-1 border border-[#cacacb] flex-shrink-0">
                        {det.codigo_ejemplar}
                      </span>
                    </div>
                  ))}
                </div>

                {isCancelable && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelingId === order.id}
                      className="nike-btn-secondary-sm text-[#d30005] hover:bg-[#f5f5f5] border border-[#d30005]"
                    >
                      {cancelingId === order.id
                        ? 'Cancelando y reembolsando...'
                        : 'Cancelar Orden y Reembolsar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
