import React, { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CartSummary, Order } from '../types';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const [direccionEnvio, setDireccionEnvio] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.compras.getCart();
      setCart(data);
      if (user?.direccion && !direccionEnvio) {
        setDireccionEnvio(user.direccion);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al cargar el carrito de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1 || newQty > 3) return;
    try {
      setUpdatingId(itemId);
      setErrorMsg(null);
      const updated = await api.compras.updateCartItem(itemId, newQty);
      setCart(updated);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al actualizar cantidad.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setUpdatingId(itemId);
      setErrorMsg(null);
      const updated = await api.compras.removeCartItem(itemId);
      setCart(updated);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al eliminar producto.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('¿Deseas vaciar todos los libros de tu carrito?')) return;
    try {
      setLoading(true);
      await api.compras.clearCart();
      await fetchCart();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al vaciar carrito.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setErrorMsg(null);
    setCheckingOut(true);
    try {
      const order = await api.compras.checkout(direccionEnvio);
      setSuccessOrder(order);
      setCart(null);
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || 'Error al procesar la compra.';
      if (status === 409) {
        setErrorMsg(`Conflicto de Stock: ${detail}`);
        fetchCart();
      } else {
        setErrorMsg(detail);
      }
    } finally {
      setCheckingOut(false);
    }
  };

  if (role !== 'CLIENTE') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-5">
        <h2 className="text-2xl font-medium text-[#111111]">
          Acceso Restringido para Personal Interno
        </h2>
        <p className="text-sm text-[#707072] leading-relaxed">
          Tu rol actual es <strong className="text-[#111111]">{role}</strong>. Las cuentas con
          privilegios administrativos no están habilitadas para realizar compras de catálogo.
        </p>
        <button onClick={() => onNavigate('home')} className="nike-btn-primary">
          Volver al Catálogo
        </button>
      </div>
    );
  }

  // Order Confirmation View
  if (successOrder) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3 border-b border-[#cacacb] pb-8">
          <p className="text-sm font-medium text-[#007d48] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Compra Confirmada con Billetera Virtual</span>
          </p>
          <h1 className="text-3xl sm:text-[32px] font-medium text-[#111111]">
            Orden #{successOrder.id}
          </h1>
          <p className="text-sm text-[#707072]">
            El pago se debitó automáticamente de tu saldo y los ejemplares físicos han sido asignados.
          </p>
        </div>

        <div className="divide-y divide-[#cacacb] border-b border-[#cacacb] text-sm">
          <div className="py-4 flex justify-between">
            <span className="text-[#707072]">Total Pagado</span>
            <span className="font-medium text-[#111111]">
              ${successOrder.total.toLocaleString('es-CO')} COP
            </span>
          </div>
          <div className="py-4 flex justify-between">
            <span className="text-[#707072]">Dirección de Entrega</span>
            <span className="font-medium text-[#111111]">{successOrder.direccion_envio}</span>
          </div>
          <div className="py-4 flex justify-between">
            <span className="text-[#707072]">Estado</span>
            <span className="font-medium text-[#007d48]">{successOrder.estado}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#111111]">Ejemplares Físicos Asignados</h3>
          <div className="space-y-2">
            {successOrder.detalles?.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#f5f5f5] flex items-center justify-between text-sm"
              >
                <span className="font-medium text-[#111111]">{item.titulo_libro}</span>
                <span className="font-mono text-xs text-[#707072]">{item.codigo_ejemplar}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button onClick={() => onNavigate('orders')} className="nike-btn-primary">
            Ver Mis Compras
          </button>
          <button
            onClick={() => {
              setSuccessOrder(null);
              onNavigate('home');
            }}
            className="nike-btn-secondary"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#cacacb]">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.2]">
            Carrito
          </h1>
          <p className="text-sm text-[#707072] mt-1">
            El stock físico se reserva y descuenta únicamente al confirmar tu pago.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCart}
            disabled={loading}
            className="nike-btn-icon"
            title="Actualizar disponibilidad"
            aria-label="Actualizar disponibilidad"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm font-medium text-[#707072] hover:text-[#d30005] underline underline-offset-4 transition-colors"
            >
              Vaciar Carrito
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 border border-[#d30005] text-[#d30005] text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {loading && !cart ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#707072]">Cargando tu carrito...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="py-16 text-center space-y-5 bg-[#f5f5f5] max-w-lg mx-auto p-10">
          <ShoppingBag className="w-10 h-10 text-[#707072] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-[#111111]">Tu carrito está vacío</h3>
            <p className="text-sm text-[#707072]">
              Explora el catálogo y agrega los títulos que desees adquirir.
            </p>
          </div>
          <button onClick={() => onNavigate('home')} className="nike-btn-primary">
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items Column (8 cols) */}
          <div className="lg:col-span-8 divide-y divide-[#cacacb] border-b border-[#cacacb]">
            {cart.items.map((item) => {
              const hasEnoughStock = item.stock_disponible >= item.cantidad;
              return (
                <div
                  key={item.id}
                  className="py-6 first:pt-0 flex flex-col sm:flex-row items-start justify-between gap-6"
                >
                  <div className="flex items-start space-x-5 flex-1">
                    <div className="w-24 h-32 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                      {item.portada_url ? (
                        <img
                          src={getImageUrl(item.portada_url)}
                          alt={item.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#707072]">
                          Libro
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-base font-medium text-[#111111] leading-snug">
                        {item.titulo}
                      </h4>
                      <p className="text-sm text-[#707072]">{item.autor}</p>
                      <p className="text-sm text-[#707072]">
                        ${item.precio_unitario.toLocaleString('es-CO')} COP c/u
                      </p>

                      {/* Semantic Stock Signal */}
                      <div className="pt-1 text-xs font-medium">
                        {item.stock_disponible === 0 ? (
                          <span className="text-[#d30005]">Agotado en tienda</span>
                        ) : hasEnoughStock ? (
                          <span className="text-[#007d48]">
                            {item.stock_disponible} ejemplares disponibles
                          </span>
                        ) : (
                          <span className="text-[#d30005]">
                            Solo {item.stock_disponible} disponibles (solicitas {item.cantidad})
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls + Trash */}
                      <div className="pt-3 flex items-center space-x-4">
                        <div className="inline-flex items-center border border-[#cacacb] rounded-full h-9 px-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1 || updatingId === item.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] disabled:opacity-30"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-[#111111]">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                            disabled={item.cantidad >= 3 || updatingId === item.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] disabled:opacity-30"
                            title="Máximo 3 unidades por título"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingId === item.id}
                          className="text-[#707072] hover:text-[#d30005] p-2 transition-colors"
                          title="Eliminar"
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-base font-medium text-[#111111] sm:text-right">
                    ${item.subtotal.toLocaleString('es-CO')} COP
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-medium text-[#111111]">Resumen</h2>

            <div className="space-y-3 text-sm border-b border-[#cacacb] pb-5">
              <div className="flex justify-between">
                <span className="text-[#707072]">Títulos distintos</span>
                <span className="text-[#111111] font-medium">{cart.titulos_distintos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707072]">Total de ejemplares</span>
                <span className="text-[#111111] font-medium">{cart.total_items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707072]">Envío estándar</span>
                <span className="text-[#007d48] font-medium">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline border-b border-[#cacacb] pb-5">
              <span className="text-base font-medium text-[#111111]">Total</span>
              <span className="text-lg font-medium text-[#111111]">
                ${cart.subtotal.toLocaleString('es-CO')} COP
              </span>
            </div>

            {/* Wallet Info */}
            <div className="p-4 bg-[#f5f5f5] space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#707072]">Saldo Billetera Virtual</span>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-xs font-medium text-[#111111] underline underline-offset-4"
                >
                  Recargar
                </button>
              </div>
              <div
                className={`text-base font-medium ${
                  cart.alcance_saldo ? 'text-[#007d48]' : 'text-[#d30005]'
                }`}
              >
                ${cart.saldo_cliente.toLocaleString('es-CO')} COP
              </div>
              {!cart.alcance_saldo && (
                <p className="text-xs text-[#d30005]">
                  Saldo insuficiente para completar esta compra.
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Dirección de Envío
              </label>
              <input
                type="text"
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
                placeholder="Ej: Carrera 27 # 4-10, Pereira"
                className="nike-input"
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut || !cart.alcance_saldo || !cart.todos_disponibles}
              className="nike-btn-primary w-full"
            >
              {checkingOut ? 'Procesando pago...' : 'Pagar con Billetera Virtual'}
            </button>

            {!cart.todos_disponibles && (
              <p className="text-xs text-[#d30005] text-center">
                Algunos libros están agotados o tienen stock insuficiente. Ajusta las cantidades
                para continuar.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
