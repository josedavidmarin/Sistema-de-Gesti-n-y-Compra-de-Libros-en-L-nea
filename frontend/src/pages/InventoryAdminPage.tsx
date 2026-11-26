import React, { useEffect, useState, useRef } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  Boxes,
  BookPlus,
  AlertTriangle,
  Barcode,
  Search,
  CheckCircle2,
  Building2,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Star,
  Trash2,
  Camera,
  X,
} from 'lucide-react';

export const InventoryAdminPage: React.FC = () => {
  const { role } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [addingCopiesCount, setAddingCopiesCount] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [detailTab, setDetailTab] = useState<'ejemplares' | 'fotos'>('ejemplares');

  const [refUrlInput, setRefUrlInput] = useState<string>('');
  const [uploadingRefImg, setUploadingRefImg] = useState<boolean>(false);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [modalImages, setModalImages] = useState<{ url: string; es_portada: boolean }[]>([]);
  const [modalUrlInput, setModalUrlInput] = useState<string>('');
  const [uploadingModalImg, setUploadingModalImg] = useState<boolean>(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  const [newBook, setNewBook] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    editorial: '',
    genero: 'Ingeniería de Software',
    idioma: 'Español',
    anio_publicacion: 2024,
    numero_paginas: 250,
    estado_libro: 'NUEVO',
    precio: 60000,
    descripcion: '',
    cantidad_ejemplares: 3,
    sede: 'Sede Principal Pereira',
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await api.libros.getAll();
      setBooks(data);
      if (selectedBook) {
        const refreshed = data.find((b) => b.id === selectedBook.id);
        if (refreshed) setSelectedBook(refreshed);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al cargar inventario.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'ROOT' || role === 'ADMINISTRADOR') {
      fetchBooks();
    }
  }, [role]);

  const handleModalUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingModalImg(true);
      const res = await api.libros.uploadImage(file);
      const isFirst = modalImages.length === 0;
      setModalImages((prev) => [...prev, { url: res.url, es_portada: isFirst }]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al subir la imagen.');
    } finally {
      setUploadingModalImg(false);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  const handleModalAddUrl = () => {
    if (!modalUrlInput.trim()) return;
    const isFirst = modalImages.length === 0;
    setModalImages((prev) => [...prev, { url: modalUrlInput.trim(), es_portada: isFirst }]);
    setModalUrlInput('');
  };

  const handleModalSetCover = (index: number) => {
    setModalImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        es_portada: i === index,
      }))
    );
  };

  const handleModalRemoveImage = (index: number) => {
    setModalImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.es_portada)) {
        next[0].es_portada = true;
      }
      return next;
    });
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const coverObj = modalImages.find((img) => img.es_portada);
      const mainCover = coverObj ? coverObj.url : modalImages[0]?.url || undefined;
      const extraUrls = modalImages.map((img) => img.url);

      const created = await api.libros.create({
        ...newBook,
        portada_url: mainCover,
        imagenes_urls: extraUrls.length > 0 ? extraUrls : undefined,
      });

      await fetchBooks();
      setSelectedBook(created);
      setShowCreateModal(false);
      setFeedback({
        type: 'success',
        message: `Libro '${created.titulo}' registrado exitosamente con ${newBook.cantidad_ejemplares} ejemplares.`,
      });

      setNewBook({
        isbn: '',
        titulo: '',
        autor: '',
        editorial: '',
        genero: 'Ingeniería de Software',
        idioma: 'Español',
        anio_publicacion: 2024,
        numero_paginas: 250,
        estado_libro: 'NUEVO',
        precio: 60000,
        descripcion: '',
        cantidad_ejemplares: 3,
        sede: 'Sede Principal Pereira',
      });
      setModalImages([]);
      setModalUrlInput('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al registrar libro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadRefImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBook) return;

    try {
      setUploadingRefImg(true);
      const res = await api.libros.uploadImage(file);
      const updated = await api.libros.addImage(selectedBook.id, res.url, false);
      setSelectedBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setFeedback({ type: 'success', message: 'Foto de referencia subida y agregada con éxito.' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al subir la foto de referencia.');
    } finally {
      setUploadingRefImg(false);
      if (refFileInputRef.current) refFileInputRef.current.value = '';
    }
  };

  const handleAddRefUrl = async () => {
    if (!selectedBook || !refUrlInput.trim()) return;
    try {
      setUploadingRefImg(true);
      const updated = await api.libros.addImage(selectedBook.id, refUrlInput.trim(), false);
      setSelectedBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setRefUrlInput('');
      setFeedback({ type: 'success', message: 'URL de foto de referencia agregada con éxito.' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al agregar URL de imagen.');
    } finally {
      setUploadingRefImg(false);
    }
  };

  const handleSetCover = async (imagenId: number) => {
    if (!selectedBook) return;
    try {
      const updated = await api.libros.setCoverImage(selectedBook.id, imagenId);
      setSelectedBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setFeedback({ type: 'success', message: 'Portada principal actualizada exitosamente.' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al actualizar portada.');
    }
  };

  const handleDeleteImage = async (imagenId: number) => {
    if (!selectedBook) return;
    if (!window.confirm('¿Desea eliminar esta foto de referencia?')) return;
    try {
      const updated = await api.libros.deleteImage(selectedBook.id, imagenId);
      setSelectedBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setFeedback({ type: 'success', message: 'Foto de referencia eliminada.' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al eliminar foto.');
    }
  };

  const handleAddCopies = async (bookId: number) => {
    if (addingCopiesCount < 1) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const updated = await api.libros.addCopies(bookId, addingCopiesCount);
      setBooks(books.map((b) => (b.id === bookId ? updated : b)));
      setSelectedBook(updated);
      setFeedback({
        type: 'success',
        message: `Se han añadido ${addingCopiesCount} nuevos ejemplares físicos al título.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al añadir ejemplares.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecommissionCopy = async (copyId: number) => {
    const motivo = window.prompt(
      'Ingrese el motivo de la baja (ej. Deterioro físico, Extraviado):',
      'Deterioro físico'
    );
    if (!motivo) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.libros.decommissionCopy(copyId, motivo);
      await fetchBooks();
      setFeedback({
        type: 'success',
        message: 'Ejemplar físico dado de baja exitosamente.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al dar de baja el ejemplar.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (role !== 'ROOT' && role !== 'ADMINISTRADOR') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#d30005] mx-auto" />
        <h2 className="text-2xl font-medium text-[#111111]">Acceso No Autorizado (403)</h2>
        <p className="text-sm text-[#707072]">
          Solo el personal con rol de <strong className="text-[#111111]">ADMINISTRADOR</strong> o{' '}
          <strong className="text-[#111111]">ROOT</strong> puede gestionar el inventario físico.
        </p>
      </div>
    );
  }

  const filteredBooks = books.filter(
    (b) =>
      b.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#cacacb]">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#707072]">
            Operaciones · Bodega & Catálogo
          </p>
          <h1 className="text-2xl sm:text-[32px] font-medium text-[#111111] leading-[1.2] mt-1">
            Control de Inventario y Ejemplares Físicos
          </h1>
          <p className="text-sm text-[#707072] mt-1">
            Gestión granular por copia única con código de barras y galería de fotos de referencia.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBooks}
            disabled={loading}
            className="nike-btn-icon"
            title="Refrescar inventario"
            aria-label="Refrescar inventario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setModalImages([]);
              setModalUrlInput('');
              setShowCreateModal(true);
            }}
            className="nike-btn-primary-sm space-x-2"
          >
            <BookPlus className="w-4 h-4" />
            <span>Nuevo Libro</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 border text-sm flex items-start space-x-2.5 ${
            feedback.type === 'success'
              ? 'border-[#007d48] text-[#007d48]'
              : 'border-[#d30005] text-[#d30005]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Search Pill */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título, autor o ISBN..."
          className="nike-search-pill w-full pl-11 pr-4"
        />
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Catalog List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-medium uppercase tracking-widest text-[#707072]">
            Títulos Registrados ({filteredBooks.length})
          </div>

          <div className="divide-y divide-[#cacacb] border-t border-b border-[#cacacb]">
            {filteredBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              const photoCount = book.imagenes?.length || (book.portada_url ? 1 : 0);

              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`py-4 px-3 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#f5f5f5] border-l-4 border-l-[#111111]'
                      : 'bg-white hover:bg-[#f5f5f5]/60'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="relative flex-shrink-0 w-14 h-[74px] bg-[#f5f5f5] overflow-hidden">
                      {book.portada_url ? (
                        <img
                          src={getImageUrl(book.portada_url)}
                          alt={book.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#707072] text-[10px]">
                          Libro
                        </div>
                      )}
                      {photoCount > 1 && (
                        <span className="absolute bottom-1 right-1 bg-[#111111] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                          <Camera className="w-2.5 h-2.5" />
                          <span>{photoCount}</span>
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[#111111] text-base leading-snug">
                          {book.titulo}
                        </span>
                        {book.es_novedad && (
                          <span className="nike-badge-promo text-[11px] py-0.5 px-2">Novedad</span>
                        )}
                      </div>
                      <p className="text-sm text-[#707072] truncate">{book.autor}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#707072]">
                        <span className="font-mono">ISBN {book.isbn}</span>
                        <span>·</span>
                        <span className="font-medium text-[#111111]">
                          ${book.precio.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Semantic Counter */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto flex-shrink-0 gap-1">
                    <span
                      className={`text-sm font-medium ${
                        book.stock_disponible > 0 ? 'text-[#007d48]' : 'text-[#d30005]'
                      }`}
                    >
                      {book.stock_disponible} disponibles
                    </span>
                    <span className="text-xs text-[#707072]">{book.stock_vendido} vendidos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Book Detail Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            {selectedBook ? (
              <div className="bg-white border border-[#cacacb] p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#707072]">
                    Control Granular · ID #{selectedBook.id}
                  </p>
                  <h3 className="text-xl font-medium text-[#111111] leading-snug">
                    {selectedBook.titulo}
                  </h3>
                  <p className="text-xs font-mono text-[#707072]">ISBN: {selectedBook.isbn}</p>
                </div>

                {/* Nike-style Underline Tabs */}
                <div className="flex border-b border-[#e5e5e5] space-x-6 text-sm font-medium">
                  <button
                    onClick={() => setDetailTab('ejemplares')}
                    className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                      detailTab === 'ejemplares'
                        ? 'border-[#111111] text-[#111111]'
                        : 'border-transparent text-[#707072] hover:text-[#111111]'
                    }`}
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Ejemplares ({selectedBook.ejemplares?.length || 0})</span>
                  </button>
                  <button
                    onClick={() => setDetailTab('fotos')}
                    className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                      detailTab === 'fotos'
                        ? 'border-[#111111] text-[#111111]'
                        : 'border-transparent text-[#707072] hover:text-[#111111]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Fotos ({selectedBook.imagenes?.length || 0})</span>
                  </button>
                </div>

                {/* TAB 1: EJEMPLARES */}
                {detailTab === 'ejemplares' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#f5f5f5] space-y-3">
                      <p className="text-sm font-medium text-[#111111]">
                        Generar Nuevos Ejemplares Físicos
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={addingCopiesCount}
                          onChange={(e) => setAddingCopiesCount(parseInt(e.target.value) || 1)}
                          className="w-20 h-10 bg-white border border-[#cacacb] rounded-full text-sm font-medium text-center focus:outline-none focus:border-[#111111]"
                        />
                        <button
                          onClick={() => handleAddCopies(selectedBook.id)}
                          disabled={isSubmitting}
                          className="nike-btn-primary-sm flex-1"
                        >
                          Añadir Copias
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-[#e5e5e5]">
                      {selectedBook.ejemplares && selectedBook.ejemplares.length > 0 ? (
                        selectedBook.ejemplares.map((copy) => (
                          <div
                            key={copy.id}
                            className="py-3 flex items-center justify-between text-xs gap-2"
                          >
                            <div>
                              <div className="font-mono font-medium text-[#111111]">
                                {copy.codigo_unico}
                              </div>
                              <div className="text-[#707072] flex items-center space-x-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                <span>{copy.sede}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {copy.estado === 'DISPONIBLE' && (
                                <>
                                  <span className="font-medium text-[#007d48]">DISPONIBLE</span>
                                  <button
                                    onClick={() => handleDecommissionCopy(copy.id)}
                                    className="text-[#d30005] hover:underline font-medium"
                                  >
                                    Dar de Baja
                                  </button>
                                </>
                              )}
                              {copy.estado === 'VENDIDO' && (
                                <span className="font-medium text-[#111111]">VENDIDO</span>
                              )}
                              {copy.estado === 'DADO_DE_BAJA' && (
                                <span className="font-medium text-[#707072]">DE BAJA</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-[#707072] text-sm">
                          No hay ejemplares registrados.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: FOTOS DE REFERENCIA */}
                {detailTab === 'fotos' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#f5f5f5] space-y-3">
                      <p className="text-sm font-medium text-[#111111]">Añadir Fotos</p>

                      <div>
                        <input
                          type="file"
                          ref={refFileInputRef}
                          onChange={handleUploadRefImage}
                          accept="image/*"
                          className="hidden"
                          id="ref-upload-input"
                        />
                        <button
                          type="button"
                          onClick={() => refFileInputRef.current?.click()}
                          disabled={uploadingRefImg}
                          className="nike-btn-primary-sm w-full space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>
                            {uploadingRefImg
                              ? 'Subiendo imagen...'
                              : 'Subir desde PC (.jpg, .png, .webp)'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#e5e5e5]">
                        <input
                          type="url"
                          value={refUrlInput}
                          onChange={(e) => setRefUrlInput(e.target.value)}
                          placeholder="O pegar URL externa (https://...)"
                          className="flex-1 bg-white border border-[#cacacb] rounded-full h-10 px-4 text-xs focus:outline-none focus:border-[#111111]"
                        />
                        <button
                          onClick={handleAddRefUrl}
                          disabled={uploadingRefImg || !refUrlInput.trim()}
                          className="nike-btn-secondary-sm bg-white border border-[#111111]"
                        >
                          Añadir
                        </button>
                      </div>
                    </div>

                    {selectedBook.imagenes && selectedBook.imagenes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {selectedBook.imagenes.map((img) => (
                          <div
                            key={img.id}
                            className={`border p-2 bg-white flex flex-col justify-between ${
                              img.es_portada ? 'border-[#111111] border-2' : 'border-[#cacacb]'
                            }`}
                          >
                            <div
                              onClick={() => setPreviewZoomUrl(img.url)}
                              className="relative aspect-[4/5] bg-[#f5f5f5] overflow-hidden cursor-pointer"
                            >
                              <img
                                src={getImageUrl(img.url)}
                                alt="Foto libro"
                                className="w-full h-full object-cover"
                              />
                              {img.es_portada && (
                                <span className="nike-badge-promo absolute top-2 left-2 text-[10px] py-0.5 px-2">
                                  Portada
                                </span>
                              )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                              {!img.es_portada ? (
                                <button
                                  onClick={() => handleSetCover(img.id)}
                                  className="text-[#111111] hover:underline font-medium flex items-center space-x-1"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Hacer Portada</span>
                                </button>
                              ) : (
                                <span className="text-[#007d48] font-medium">Principal</span>
                              )}

                              <button
                                onClick={() => handleDeleteImage(img.id)}
                                className="text-[#707072] hover:text-[#d30005] p-1"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-[#f5f5f5] text-[#707072] text-sm">
                        No hay fotos registradas para este título.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#f5f5f5] p-10 text-center space-y-2">
                <Boxes className="w-8 h-8 text-[#707072] mx-auto" />
                <h4 className="font-medium text-[#111111] text-base">Selecciona un Libro</h4>
                <p className="text-sm text-[#707072]">
                  Haz clic en cualquier título de la lista para gestionar sus ejemplares físicos y
                  fotos de referencia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Book */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-[#111111]/70 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#cacacb] max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto relative"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#cacacb]">
              <h3 className="text-xl font-medium text-[#111111]">
                Registrar Nuevo Título en Catálogo
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="nike-btn-icon"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">ISBN / ISSN *</label>
                  <input
                    type="text"
                    required
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-0134494166"
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Título *</label>
                  <input
                    type="text"
                    required
                    value={newBook.titulo}
                    onChange={(e) => setNewBook({ ...newBook, titulo: e.target.value })}
                    placeholder="Título del libro"
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Autor(es) *</label>
                  <input
                    type="text"
                    required
                    value={newBook.autor}
                    onChange={(e) => setNewBook({ ...newBook, autor: e.target.value })}
                    placeholder="Nombre del autor"
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Editorial *</label>
                  <input
                    type="text"
                    required
                    value={newBook.editorial}
                    onChange={(e) => setNewBook({ ...newBook, editorial: e.target.value })}
                    placeholder="Editorial"
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Género / Categoría *</label>
                  <input
                    type="text"
                    required
                    value={newBook.genero}
                    onChange={(e) => setNewBook({ ...newBook, genero: e.target.value })}
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={newBook.precio}
                    onChange={(e) =>
                      setNewBook({ ...newBook, precio: parseFloat(e.target.value) || 0 })
                    }
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">
                    Ejemplares Iniciales *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={newBook.cantidad_ejemplares}
                    onChange={(e) =>
                      setNewBook({ ...newBook, cantidad_ejemplares: parseInt(e.target.value) || 1 })
                    }
                    className="nike-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-[#111111]">Sede *</label>
                  <input
                    type="text"
                    value={newBook.sede}
                    onChange={(e) => setNewBook({ ...newBook, sede: e.target.value })}
                    className="nike-input"
                  />
                </div>
              </div>

              {/* Photos Section */}
              <div className="p-4 bg-[#f5f5f5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#111111]">
                    Fotos del Libro (Portada y Referencias)
                  </span>
                  <span className="text-xs text-[#707072]">{modalImages.length} agregada(s)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    onChange={handleModalUploadFile}
                    accept="image/*"
                    className="hidden"
                    id="modal-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    disabled={uploadingModalImg}
                    className="nike-btn-primary-sm space-x-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingModalImg ? 'Subiendo...' : 'Subir desde PC'}</span>
                  </button>

                  <div className="flex flex-1 gap-2">
                    <input
                      type="url"
                      value={modalUrlInput}
                      onChange={(e) => setModalUrlInput(e.target.value)}
                      placeholder="O pegar URL externa (https://...)"
                      className="flex-1 bg-white border border-[#cacacb] rounded-full h-10 px-4 text-xs focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="button"
                      onClick={handleModalAddUrl}
                      className="nike-btn-secondary-sm bg-white border border-[#111111]"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {modalImages.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pt-2">
                    {modalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`w-20 flex-shrink-0 border p-1 bg-white space-y-1 ${
                          img.es_portada ? 'border-[#111111] border-2' : 'border-[#cacacb]'
                        }`}
                      >
                        <div className="aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                          <img
                            src={getImageUrl(img.url)}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          {!img.es_portada ? (
                            <button
                              type="button"
                              onClick={() => handleModalSetCover(idx)}
                              className="text-[#111111] font-medium hover:underline"
                            >
                              Portada
                            </button>
                          ) : (
                            <span className="text-[#007d48] font-medium">★ Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleModalRemoveImage(idx)}
                            className="text-[#d30005]"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-[#111111]">Sinopsis / Descripción</label>
                <textarea
                  rows={3}
                  value={newBook.descripcion}
                  onChange={(e) => setNewBook({ ...newBook, descripcion: e.target.value })}
                  className="nike-input"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#cacacb]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="nike-btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="nike-btn-primary">
                  {isSubmitting ? 'Registrando...' : 'Registrar Libro y Ejemplares'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Zoom Modal */}
      {previewZoomUrl && (
        <div
          onClick={() => setPreviewZoomUrl(null)}
          className="fixed inset-0 bg-[#111111]/85 flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white p-4 border border-[#cacacb]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewZoomUrl(null)}
              className="nike-btn-icon absolute top-4 right-4 z-10"
              aria-label="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={getImageUrl(previewZoomUrl)}
              alt="Vista ampliada"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
