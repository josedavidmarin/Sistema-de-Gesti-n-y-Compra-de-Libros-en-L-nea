import React, { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  Search,
  ShoppingCart,
  Sparkles,
  BookOpen,
  Check,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Eye
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

  // Gallery Modal state
  const [activeModalBook, setActiveModalBook] = useState<Book | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

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

  const handleAddToCart = async (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (role !== 'CLIENTE') {
      alert('Las cuentas con rol administrativo no están habilitadas para realizar compras de catálogo.');
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

  const handleOpenGalleryModal = (book: Book) => {
    setActiveModalBook(book);
    setActivePhotoIdx(0);
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
            <span>Catálogo Oficial de Librería Central • Envíos a Nivel Nacional</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Descubre y Adquiere tus Libros Favoritos
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Inventario en tiempo real con fotos de referencia reales y despacho garantizado. Agrega tus títulos
            favoritos al carrito y finaliza tu compra con saldo de tu Billetera Virtual de forma instantánea.
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
              const photoCount = book.imagenes?.length || (book.portada_url ? 1 : 0);

              return (
                <div
                  key={book.id}
                  onClick={() => handleOpenGalleryModal(book)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  {/* Book Cover Image & Badges */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    {book.portada_url ? (
                      <img
                        src={getImageUrl(book.portada_url)}
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

                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                      {isAvailable ? (
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {book.stock_disponible} disponibles
                        </span>
                      ) : (
                        <span className="bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Agotado
                        </span>
                      )}

                      {/* Photo count pill */}
                      {photoCount > 1 && (
                        <span
                          className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center space-x-1"
                          title="Haz clic para ver todas las fotos de referencia"
                        >
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>{photoCount} fotos</span>
                        </span>
                      )}
                    </div>

                    {/* Quick view overlay on hover */}
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver fotos y detalles</span>
                      </span>
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
                          title="Cuentas administrativas no realizan compras comerciales"
                        >
                          Rol Admin
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(book, e)}
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

      {/* Book Details and Photos Gallery Modal */}
      {activeModalBook && (
        <div
          onClick={() => setActiveModalBook(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden relative"
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalBook(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Gallery Column */}
            <div className="md:w-1/2 p-6 bg-slate-50 border-r border-slate-100 flex flex-col justify-between space-y-4">
              {(() => {
                const photos =
                  activeModalBook.imagenes && activeModalBook.imagenes.length > 0
                    ? activeModalBook.imagenes.map((img) => img.url)
                    : activeModalBook.portada_url
                    ? [activeModalBook.portada_url]
                    : [];

                const currentPhoto = photos[activePhotoIdx] || activeModalBook.portada_url;

                return (
                  <div className="space-y-4">
                    {/* Main image viewer with next/prev controls */}
                    <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      {currentPhoto ? (
                        <img
                          src={getImageUrl(currentPhoto)}
                          alt={activeModalBook.titulo}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                          Sin Portada Disponible
                        </div>
                      )}

                      {/* Navigation arrows if >1 photo */}
                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition shadow"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition shadow"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/70 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                            Foto {activePhotoIdx + 1} de {photos.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {photos.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {photos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-14 h-18 rounded-lg overflow-hidden border-2 cursor-pointer transition flex-shrink-0 ${
                              activePhotoIdx === idx
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={getImageUrl(url)}
                              alt="thumb"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right: Book Details Column */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {activeModalBook.genero}
                  </span>
                  {activeModalBook.es_novedad && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      Novedad
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    Estado: {activeModalBook.estado_libro}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {activeModalBook.titulo}
                  </h2>
                  <p className="text-sm text-slate-600 font-medium mt-1">
                    Por <strong className="text-slate-800">{activeModalBook.autor}</strong>
                  </p>
                </div>

                {/* Stock and Price highlight */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Precio de Venta</div>
                    <div className="text-2xl font-black text-slate-900">
                      ${activeModalBook.precio.toLocaleString('es-CO')}{' '}
                      <span className="text-xs font-semibold text-slate-500">COP</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activeModalBook.stock_disponible > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {activeModalBook.stock_disponible > 0
                      ? `${activeModalBook.stock_disponible} disponibles`
                      : 'Agotado'}
                  </span>
                </div>

                {/* Bibliographic details grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400">Editorial:</span>{' '}
                    <strong className="text-slate-700">{activeModalBook.editorial}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">ISBN:</span>{' '}
                    <strong className="text-slate-700 font-mono">{activeModalBook.isbn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Páginas:</span>{' '}
                    <strong className="text-slate-700">{activeModalBook.numero_paginas}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Idioma:</span>{' '}
                    <strong className="text-slate-700">{activeModalBook.idioma}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Año de Edición:</span>{' '}
                    <strong className="text-slate-700">{activeModalBook.anio_publicacion}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Fotos de Referencia:</span>{' '}
                    <strong className="text-slate-700">
                      {activeModalBook.imagenes?.length || (activeModalBook.portada_url ? 1 : 0)}
                    </strong>
                  </div>
                </div>

                {/* Synopsis */}
                {activeModalBook.descripcion && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinopsis</h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {activeModalBook.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalBook(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cerrar
                </button>

                {role === 'ADMINISTRADOR' || role === 'ROOT' ? (
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-xl font-medium">
                    Cuenta Administrativa (Solo Consulta)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      handleAddToCart(activeModalBook);
                    }}
                    disabled={activeModalBook.stock_disponible <= 0 || addingId === activeModalBook.id}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {addingId === activeModalBook.id ? 'Añadiendo...' : 'Añadir al Carrito'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
