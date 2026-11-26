import React, { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  Search,
  ShoppingBag,
  BookOpen,
  Check,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
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

  // PDP / Gallery Modal state
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
      setToastMessage(`'${book.titulo}' agregado a tu carrito`);
      setTimeout(() => setToastMessage(null), 3500);
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

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-12 bg-white">
      {/* Toast Notification (Ink Pill) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-6 py-3.5 rounded-full flex items-center space-x-3 text-sm font-medium border border-[#39393b]">
          <Check className="w-4 h-4 text-[#1eaa52] flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => onNavigate('cart')}
            className="underline underline-offset-4 pl-3 border-l border-[#4b4b4d] hover:text-[#cacacb] transition-colors"
          >
            Ver Carrito
          </button>
        </div>
      )}

      {/* Editorial Campaign Hero (Full-Bleed Campaign Tile, Rounded None) */}
      <section className="w-full bg-[#111111] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-end pb-12 sm:pb-16 pt-20">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-widest text-[#e5e5e5]">
              Colección Oficial 2026 · Inventario Físico Real
            </p>
            <h1 className="nike-display-campaign text-[48px] sm:text-[64px] lg:text-[96px] text-white">
              LEE SIN LÍMITES.
            </h1>
            <p className="text-sm sm:text-base text-[#e5e5e5] max-w-xl leading-relaxed">
              Literatura, ingeniería y pensamiento crítico con trazabilidad por ejemplar único,
              fotografías reales y despacho garantizado a toda Colombia.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button onClick={scrollToCatalog} className="nike-btn-on-image">
                Explorar Catálogo
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center rounded-full border border-white/60 text-white font-medium text-sm sm:text-base px-6 h-11 hover:bg-white/10 transition-colors"
                >
                  Hazte Miembro
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section (PLP) */}
      <section
        id="catalogo-section"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8"
      >
        {/* Sub-nav / Header & Search Pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 shadow-inset-hairline">
          <div>
            <h2 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.2]">
              Catálogo Editorial{' '}
              <span className="text-[#707072] text-lg sm:text-2xl font-normal">
                ({books.length})
              </span>
            </h2>
          </div>

          {/* Search Pill */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#111111] pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar título, autor o ISBN..."
              className="nike-search-pill w-full pl-11 pr-4"
            />
          </div>
        </div>

        {/* Filter Chips & Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 h-10 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#111111] text-white'
                      : 'bg-white text-[#111111] border border-[#cacacb] hover:border-[#111111]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#111111]">
            <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyNovelties}
                onChange={(e) => setOnlyNovelties(e.target.checked)}
                className="w-4 h-4 accent-[#111111] cursor-pointer"
              />
              <span>Solo Novedades</span>
            </label>

            <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#111111] cursor-pointer"
              />
              <span>Con Stock Disponible</span>
            </label>
          </div>
        </div>

        {/* Product Grid (3-up desktop / 4-up xl, 2-up tablet, 1-up mobile, flat zero-radius cards) */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#707072]">Cargando catálogo...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#f5f5f5] max-w-lg mx-auto p-10">
            <BookOpen className="w-10 h-10 text-[#707072] mx-auto" />
            <h3 className="text-lg font-medium text-[#111111]">No se encontraron títulos</h3>
            <p className="text-sm text-[#707072]">
              Prueba ajustando tu búsqueda o limpiando los filtros activos.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setOnlyNovelties(false);
                setOnlyAvailable(false);
              }}
              className="nike-btn-primary-sm"
            >
              Ver Todo el Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {books.map((book) => {
              const isAvailable = book.stock_disponible > 0;
              const isAdministrative = role === 'ADMINISTRADOR' || role === 'ROOT';
              const photoCount = book.imagenes?.length || (book.portada_url ? 1 : 0);

              return (
                <article
                  key={book.id}
                  onClick={() => handleOpenGalleryModal(book)}
                  className="bg-white rounded-none p-0 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Product Image staged on Soft Cloud (#f5f5f5), zero radius */}
                    <div className="relative aspect-[4/5] bg-[#f5f5f5] overflow-hidden rounded-none">
                      {book.portada_url ? (
                        <img
                          src={getImageUrl(book.portada_url)}
                          alt={book.titulo}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#707072] text-sm font-medium">
                          Sin Portada
                        </div>
                      )}

                      {/* Top-left Promo Badge (badge-promo) */}
                      {book.es_novedad && (
                        <span className="nike-badge-promo absolute top-3 left-3">
                          Novedad
                        </span>
                      )}

                      {/* Top-right Photo Count Pill */}
                      {photoCount > 1 && (
                        <span
                          className="absolute top-3 right-3 inline-flex items-center space-x-1 rounded-full bg-white/95 border border-[#cacacb] text-[#111111] text-xs font-medium px-2.5 py-1"
                          title="Ver fotos de referencia"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{photoCount}</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata directly below image with 8px spacing */}
                    <div className="pt-3 space-y-1">
                      {/* Semantic Stock Signal (text-only per DESIGN.md) */}
                      <div className="text-sm font-medium">
                        {isAvailable ? (
                          <span className="text-[#007d48]">
                            Disponible · {book.stock_disponible}{' '}
                            {book.stock_disponible === 1 ? 'copia' : 'copias'}
                          </span>
                        ) : (
                          <span className="text-[#d30005]">Agotado</span>
                        )}
                      </div>

                      <h3 className="text-base font-medium text-[#111111] leading-snug line-clamp-2">
                        {book.titulo}
                      </h3>

                      <p className="text-sm text-[#707072] line-clamp-1">
                        {book.autor} · {book.genero}
                      </p>

                      <p className="text-xs text-[#707072]">
                        {book.estado_libro} · ISBN {book.isbn}
                      </p>
                    </div>
                  </div>

                  {/* Price & Pill CTA */}
                  <div className="pt-3 flex items-center justify-between gap-2">
                    <div className="text-base font-medium text-[#111111]">
                      ${book.precio.toLocaleString('es-CO')}{' '}
                      <span className="text-xs text-[#707072] font-normal">COP</span>
                    </div>

                    {isAdministrative ? (
                      <span className="text-xs font-medium text-[#707072]">
                        Solo consulta
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(book, e)}
                        disabled={!isAvailable || addingId === book.id}
                        className="nike-btn-primary-sm space-x-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{addingId === book.id ? '...' : 'Agregar'}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PDP Book Details & Photo Gallery Modal */}
      {activeModalBook && (
        <div
          onClick={() => setActiveModalBook(null)}
          className="fixed inset-0 bg-[#111111]/70 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-none max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-[#cacacb] flex flex-col md:flex-row relative"
          >
            {/* Close Circular Button */}
            <button
              onClick={() => setActiveModalBook(null)}
              className="nike-btn-icon absolute top-4 right-4 z-20"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Studio Gallery Column (#f5f5f5 stage + vertical/horizontal thumbnails) */}
            <div className="md:w-1/2 p-6 bg-[#f5f5f5] flex flex-col justify-between gap-4">
              {(() => {
                const photos =
                  activeModalBook.imagenes && activeModalBook.imagenes.length > 0
                    ? activeModalBook.imagenes.map((img) => img.url)
                    : activeModalBook.portada_url
                    ? [activeModalBook.portada_url]
                    : [];

                const currentPhoto = photos[activePhotoIdx] || activeModalBook.portada_url;

                return (
                  <div className="flex flex-col sm:flex-row gap-4 h-full">
                    {/* Vertical Thumbnail Rail (Desktop) */}
                    {photos.length > 1 && (
                      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto order-2 sm:order-1 sm:w-16 flex-shrink-0">
                        {photos.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-14 h-16 sm:w-16 sm:h-20 bg-white overflow-hidden border flex-shrink-0 transition-opacity ${
                              activePhotoIdx === idx
                                ? 'border-[#111111] border-2 opacity-100'
                                : 'border-[#cacacb] opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={getImageUrl(url)}
                              alt={`Vista ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Main Studio Viewer */}
                    <div className="relative flex-1 aspect-[4/5] bg-white overflow-hidden order-1 sm:order-2 flex items-center justify-center">
                      {currentPhoto ? (
                        <img
                          src={getImageUrl(currentPhoto)}
                          alt={activeModalBook.titulo}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-sm text-[#707072] font-medium">
                          Sin Portada Disponible
                        </div>
                      )}

                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setActivePhotoIdx((prev) =>
                                prev > 0 ? prev - 1 : photos.length - 1
                              )
                            }
                            className="nike-btn-icon absolute left-3 top-1/2 -translate-y-1/2 bg-white/90"
                            aria-label="Foto anterior"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setActivePhotoIdx((prev) =>
                                prev < photos.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="nike-btn-icon absolute right-3 top-1/2 -translate-y-1/2 bg-white/90"
                            aria-label="Foto siguiente"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <span className="absolute bottom-3 left-3 nike-badge-promo">
                            {activePhotoIdx + 1} / {photos.length}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: PDP Product Details */}
            <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#707072]">
                    {activeModalBook.genero}
                  </span>
                  {activeModalBook.es_novedad && (
                    <span className="nike-badge-promo">Novedad</span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.15]">
                    {activeModalBook.titulo}
                  </h2>
                  <p className="text-base text-[#707072] mt-1">
                    {activeModalBook.autor}
                  </p>
                </div>

                {/* Price & Stock Row */}
                <div className="flex items-baseline justify-between pt-2">
                  <div className="text-2xl font-medium text-[#111111]">
                    ${activeModalBook.precio.toLocaleString('es-CO')}{' '}
                    <span className="text-sm text-[#707072] font-normal">COP</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      activeModalBook.stock_disponible > 0
                        ? 'text-[#007d48]'
                        : 'text-[#d30005]'
                    }`}
                  >
                    {activeModalBook.stock_disponible > 0
                      ? `${activeModalBook.stock_disponible} disponibles`
                      : 'Agotado'}
                  </span>
                </div>

                {/* Synopsis */}
                {activeModalBook.descripcion && (
                  <p className="text-sm text-[#39393b] leading-relaxed pt-2">
                    {activeModalBook.descripcion}
                  </p>
                )}

                {/* PDP Hairline Disclosure Specs */}
                <div className="border-t border-[#cacacb] divide-y divide-[#cacacb] text-sm pt-2">
                  <div className="py-3 flex justify-between">
                    <span className="text-[#707072]">Editorial</span>
                    <span className="font-medium text-[#111111]">{activeModalBook.editorial}</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#707072]">ISBN</span>
                    <span className="font-medium text-[#111111] font-mono">{activeModalBook.isbn}</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#707072]">Estado / Edición</span>
                    <span className="font-medium text-[#111111]">
                      {activeModalBook.estado_libro} · {activeModalBook.anio_publicacion}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#707072]">Extensión e Idioma</span>
                    <span className="font-medium text-[#111111]">
                      {activeModalBook.numero_paginas} págs · {activeModalBook.idioma}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Pills */}
              <div className="space-y-3 pt-4">
                {role === 'ADMINISTRADOR' || role === 'ROOT' ? (
                  <div className="p-4 bg-[#f5f5f5] text-sm text-[#707072] text-center">
                    Cuenta administrativa (solo consulta de catálogo)
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(activeModalBook)}
                    disabled={
                      activeModalBook.stock_disponible <= 0 ||
                      addingId === activeModalBook.id
                    }
                    className="nike-btn-primary w-full space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {addingId === activeModalBook.id
                        ? 'Añadiendo...'
                        : activeModalBook.stock_disponible > 0
                        ? 'Añadir al Carrito'
                        : 'Agotado'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveModalBook(null)}
                  className="nike-btn-secondary w-full"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
