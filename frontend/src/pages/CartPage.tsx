import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CartSummary, Order } from '../types';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ArrowRight,
  MapPin,
  RefreshCw,
  PackageCheck
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
        // Concurrency error: Book out of stock
        setErrorMsg(`⚠️ Conflicto de Stock: ${detail}`);
        // Refresh cart to show updated real-time stock
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Restricción de Negocio (RF-031)</h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          Tu rol actual es <strong>{role}</strong>. De acuerdo con las políticas del sistema,
          las cuentas de administración y root tienen prohibido realizar compras o reservas personales.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  // Success view
  if (successOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <PackageCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ¡Compra Exitosa con Billetera Virtual!
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Orden #{successOrder.id} Confirmada
            </h1>
            <p className="text-slate-600">
              El pago se debitó automáticamente de tu saldo y los ejemplares físicos han sido asignados.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Pagado:</span>
              <span className="font-bold text-emerald-700 text-base">
                ${successOrder.total.toLocaleString('es-CO')} COP
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Dirección de Entrega:</span>
              <span className="font-medium text-slate-800">{successOrder.direccion_envio}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Estado:</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                {successOrder.estado}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-bold uppercase text-slate-400 mb-2">
                Ejemplares Físicos Asignados (RF-002 / FIFO):
              </div>
              <div className="space-y-1">
                {successOrder.detalles?.map((item) => (
                  <div key={item.id} className="text-xs text-slate-700 flex justify-between bg-white p-2 rounded border border-slate-100">
                    <span>
                      <strong>{item.titulo_libro}</strong>
                    </span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">
                      {item.codigo_ejemplar}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('orders')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition flex items-center space-x-2"
            >
              <span>Ver Mis Compras</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccessOrder(null);
                onNavigate('home');
              }}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Carrito de Compras</h1>
              <p className="text-xs text-slate-500">
                Los libros permanecen en tu carrito. El stock físico se descuenta únicamente al confirmar tu compra.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCart}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refrescar disponibilidad de stock"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
            >
              Vaciar Carrito
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {loading && !cart ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Cargando tu carrito de compras...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-5 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Tu carrito está vacío</h3>
            <p className="text-sm text-slate-500">
              Explora nuestro catálogo con cientos de títulos y añade los que más te interesen.
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        /* Cart Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const hasEnoughStock = item.stock_disponible >= item.cantidad;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !hasEnoughStock ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {item.portada_url ? (
                      <img
                        src={item.portada_url}
                        alt={item.titulo}
                        className="w-16 h-20 object-cover rounded-lg shadow-sm border border-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 font-bold text-xs">
                        Libro
                      </div>
                    )}
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">
                        {item.titulo}
                      </h4>
                      <p className="text-xs text-slate-500">{item.autor}</p>
                      <div className="text-xs font-semibold text-blue-600">
                        ${item.precio_unitario.toLocaleString('es-CO')} COP c/u
                      </div>

                      {/* Stock Status Badge */}
                      <div className="pt-1">
                        {item.stock_disponible === 0 ? (
                          <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Agotado en tienda
                          </span>
                        ) : hasEnoughStock ? (
                          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.stock_disponible} ejemplares disponibles
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ⚠️ Solo {item.stock_disponible} disponibles (solicitas {item.cantidad})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1 || updatingId === item.id}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-slate-800">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                        disabled={item.cantidad >= 3 || updatingId === item.id}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition shadow-xs"
                        title="Máximo 3 unidades por título (regla de negocio)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ${item.subtotal.toLocaleString('es-CO')} COP
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingId === item.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout & Summary Column */}
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Tu Billetera Virtual</span>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Recargar
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Saldo Disponible
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    ${cart.saldo_cliente.toLocaleString('es-CO')} COP
                  </div>
                </div>
                {cart.alcance_saldo ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                )}
              </div>

              {!cart.alcance_saldo && (
                <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  Saldo insuficiente para cubrir ${cart.subtotal.toLocaleString('es-CO')} COP.
                  Por favor recarga saldo antes de finalizar.
                </div>
              )}
            </div>

            {/* Order Summary & Final Checkout */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Resumen del Pedido</h3>

              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Títulos distintos:</span>
                  <span className="font-semibold text-slate-800">{cart.titulos_distintos}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total ejemplares:</span>
                  <span className="font-semibold text-slate-800">{cart.total_items}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total a Pagar:</span>
                  <span className="text-blue-700">
                    ${cart.subtotal.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dirección de Envío</span>
                </label>
                <input
                  type="text"
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  placeholder="Ej: Carrera 27 # 4-10, Pereira"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut || !cart.alcance_saldo || !cart.todos_disponibles}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                {checkingOut ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando y Comprando...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-5 h-5" />
                    <span>Pagar con Billetera Virtual</span>
                  </>
                )}
              </button>

              {!cart.todos_disponibles && (
                <p className="text-[11px] text-amber-700 text-center font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚠️ Algunos libros tienen unidades agotadas o insuficientes. Ajusta las cantidades para proceder.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
