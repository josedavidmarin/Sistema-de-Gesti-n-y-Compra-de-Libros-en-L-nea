import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  Search,
  ShoppingCart,
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  'Todos',
  'Ingeniería de Software',
  'Literatura Latinoamericana',
  'Bases de Datos y Sistemas Distribuidos',
  'Literatura Colombiana',
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isAuthenticated, role } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [onlyNovelties, setOnlyNovelties] = useState<boolean>(false);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedCategory !== 'Todos') params.genero = selectedCategory;
      if (onlyNovelties) params.es_novedad = true;
      if (onlyAvailable) params.solo_disponibles = true;

      const data = await api.libros.getAll(params);
      setBooks(data);
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, onlyNovelties, onlyAvailable]);

  const handleAddToCart = async (book: Book) => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (role !== 'CLIENTE') {
      alert('Regla de Negocio RF-031: Los administradores y Root tienen prohibido comprar libros.');
      return;
    }

    try {
      setAddingId(book.id);
      await api.compras.addToCart(book.id, 1);
      setToastMessage(`¡'${book.titulo}' agregado a tu carrito!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'No se pudo agregar al carrito.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => onNavigate('cart')}
            className="text-blue-400 hover:underline pl-2 border-l border-slate-700"
          >
            Ver Carrito →
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-transparent pt-12 pb-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Sprint 2 — Catálogo, Stock Granular & Billetera Virtual</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Descubre y Adquiere tus Libros Favoritos
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Inventario en tiempo real con control físico único por ejemplar. Sin bloqueos previos en el carrito:
            el stock se descuenta de forma atómica en el checkout con tu Billetera Virtual.
          </p>

          {/* Search bar inside Hero */}
          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="w-5 h-5 absolute left-4 top-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, autor o ISBN (ej. Clean Architecture)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            />
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          {/* Categories Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNovelties}
                onChange={(e) => setOnlyNovelties(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Solo Novedades</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Con Stock Disponible</span>
            </label>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Buscando libros en el catálogo...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8 shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron títulos</h3>
            <p className="text-xs text-slate-500">
              Prueba cambiando los términos de búsqueda o limpiando los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => {
              const isAvailable = book.stock_disponible > 0;
              const isAdministrative = role === 'ADMINISTRADOR' || role === 'ROOT';

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                >
                  {/* Book Cover Image & Badges */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    {book.portada_url ? (
                      <img
                        src={book.portada_url}
                        alt={book.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                        Sin Portada
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {book.es_novedad && (
                        <span className="bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Novedad
                        </span>
                      )}
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                        {book.estado_libro}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {book.stock_disponible} disponibles
                        </span>
                      ) : (
                        <span className="bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {book.genero}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                        {book.titulo}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{book.autor}</p>
                      <p className="text-[11px] text-slate-400 font-mono">ISBN: {book.isbn}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Precio</div>
                        <div className="font-extrabold text-base text-slate-900">
                          ${book.precio.toLocaleString('es-CO')} <span className="text-[10px]">COP</span>
                        </div>
                      </div>

                      {/* Add to Cart button */}
                      {isAdministrative ? (
                        <span
                          className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded font-medium"
                          title="Restricción RF-031: Cuentas de administración no compran"
                        >
                          Rol Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(book)}
                          disabled={!isAvailable || addingId === book.id}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
