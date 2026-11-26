import React, { useEffect, useState, useRef } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types';
import {
  Boxes,
  BookPlus,
  PlusCircle,
  AlertTriangle,
  Barcode,
  Search,
  CheckCircle2,
  Building2,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  Upload,
  Star,
  Trash2,
  Camera,
  X
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

  // Tab for selected book details: 'ejemplares' | 'fotos'
  const [detailTab, setDetailTab] = useState<'ejemplares' | 'fotos'>('ejemplares');

  // Photo management state for selected book
  const [refUrlInput, setRefUrlInput] = useState<string>('');
  const [uploadingRefImg, setUploadingRefImg] = useState<boolean>(false);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Photo management state for new book modal
  const [modalImages, setModalImages] = useState<{ url: string; es_portada: boolean }[]>([]);
  const [modalUrlInput, setModalUrlInput] = useState<string>('');
  const [uploadingModalImg, setUploadingModalImg] = useState<boolean>(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Image zoom preview
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // New Book form state
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

  // Handle uploading image in Create Book modal
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

  // Handle Create Book submission
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const coverObj = modalImages.find((img) => img.es_portada);
      const mainCover = coverObj ? coverObj.url : (modalImages[0]?.url || undefined);
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
        message: `Libro '${created.titulo}' registrado exitosamente con ${newBook.cantidad_ejemplares} ejemplares y sus fotos de referencia.`,
      });

      // Reset form
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

  // Selected book photo management
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
    const motivo = window.prompt('Ingrese el motivo de la baja (ej. Deterioro físico, Extraviado):', 'Deterioro físico');
    if (!motivo) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.libros.decommissionCopy(copyId, motivo);
      await fetchBooks();
      setFeedback({
        type: 'success',
        message: `Ejemplar físico dado de baja exitosamente.`,
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso No Autorizado (403)</h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          Solo el personal con rol de <strong>ADMINISTRADOR</strong> o <strong>ROOT</strong> puede gestionar
          el inventario físico y catálogo bibliográfico.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Control de Inventario y Ejemplares Físicos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión granular por copia única con trazabilidad de código de barras y fotos de referencia.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 self-stretch sm:self-auto justify-end">
          <button
            onClick={fetchBooks}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 sm:border-0 transition"
            title="Refrescar inventario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setModalImages([]);
              setModalUrlInput('');
              setShowCreateModal(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
          >
            <BookPlus className="w-4 h-4" />
            <span>Nuevo Libro</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start space-x-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título, autor o ISBN..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Main Grid: Catalog on left, Selected Book Copies on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Books List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Títulos Registrados ({filteredBooks.length})
          </div>

          <div className="space-y-3">
            {filteredBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              const photoCount = book.imagenes?.length || (book.portada_url ? 1 : 0);

              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      {book.portada_url ? (
                        <img
                          src={getImageUrl(book.portada_url)}
                          alt={book.titulo}
                          className="w-12 h-16 object-cover rounded-md shadow-xs border border-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 font-bold text-[10px]">
                          Libro
                        </div>
                      )}
                      {photoCount > 1 && (
                        <span
                          className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md shadow-xs flex items-center space-x-0.5"
                          title={`${photoCount} fotos de referencia disponibles`}
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>{photoCount}</span>
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {book.titulo}
                        </span>
                        {book.es_novedad && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                            Novedad
                          </span>
                        )}
                        {book.historico_agotado && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                            Agotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{book.autor}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                        <span>ISBN: {book.isbn}</span>
                        <span>•</span>
                        <span className="font-sans font-bold text-slate-700">
                          ${book.precio.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Counters */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex-shrink-0 gap-1">
                    <span
                      className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                        book.stock_disponible > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {book.stock_disponible} disponibles
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {book.stock_vendido} vendidos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Book Details (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            {selectedBook ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Control Granular de Libro</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {selectedBook.titulo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID Libro: #{selectedBook.id} • ISBN: {selectedBook.isbn}
                  </p>
                </div>

                {/* Tabs switcher: Ejemplares vs Fotos */}
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                  <button
                    onClick={() => setDetailTab('ejemplares')}
                    className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                      detailTab === 'ejemplares'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Ejemplares ({selectedBook.ejemplares?.length || 0})</span>
                  </button>
                  <button
                    onClick={() => setDetailTab('fotos')}
                    className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                      detailTab === 'fotos'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotos de Referencia ({selectedBook.imagenes?.length || 0})</span>
                  </button>
                </div>

                {/* TAB 1: EJEMPLARES FÍSICOS */}
                {detailTab === 'ejemplares' && (
                  <div className="space-y-6">
                    {/* Add Copies Form */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Generar Nuevos Ejemplares Físicos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={addingCopiesCount}
                          onChange={(e) => setAddingCopiesCount(parseInt(e.target.value) || 1)}
                          className="w-20 text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-center"
                        />
                        <button
                          onClick={() => handleAddCopies(selectedBook.id)}
                          disabled={isSubmitting}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Añadir Copias
                        </button>
                      </div>
                    </div>

                    {/* Individual Copies Table */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Códigos de Ejemplares Físicos
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {selectedBook.ejemplares && selectedBook.ejemplares.length > 0 ? (
                          selectedBook.ejemplares.map((copy) => (
                            <div
                              key={copy.id}
                              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-800">
                                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{copy.codigo_unico}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-0.5">
                                  <Building2 className="w-3 h-3" />
                                  <span>{copy.sede}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {copy.estado === 'DISPONIBLE' && (
                                  <>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      DISPONIBLE
                                    </span>
                                    <button
                                      onClick={() => handleDecommissionCopy(copy.id)}
                                      className="text-[10px] text-rose-600 hover:text-rose-800 hover:underline font-semibold"
                                      title="Dar de baja este ejemplar físico"
                                    >
                                      Dar de Baja
                                    </button>
                                  </>
                                )}
                                {copy.estado === 'VENDIDO' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                    VENDIDO
                                  </span>
                                )}
                                {copy.estado === 'DADO_DE_BAJA' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                                    DE BAJA
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No hay ejemplares registrados para este título.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FOTOS DE REFERENCIA */}
                {detailTab === 'fotos' && (
                  <div className="space-y-6">
                    {/* Add Photo Tools */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Añadir Fotos de Referencia</span>
                      </div>

                      {/* File upload button */}
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
                          className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition flex items-center justify-center space-x-2"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{uploadingRefImg ? 'Subiendo imagen...' : 'Subir Archivo desde PC (.jpg, .png, .webp)'}</span>
                        </button>
                      </div>

                      {/* URL input */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                        <input
                          type="url"
                          value={refUrlInput}
                          onChange={(e) => setRefUrlInput(e.target.value)}
                          placeholder="O pegar URL directa (https://...)"
                          className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={handleAddRefUrl}
                          disabled={uploadingRefImg || !refUrlInput.trim()}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                        >
                          Añadir
                        </button>
                      </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Fotos de este Libro ({selectedBook.imagenes?.length || 0})
                      </div>

                      {selectedBook.imagenes && selectedBook.imagenes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                          {selectedBook.imagenes.map((img) => (
                            <div
                              key={img.id}
                              className={`relative rounded-xl border p-2 bg-white flex flex-col justify-between group transition ${
                                img.es_portada
                                  ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div
                                onClick={() => setPreviewZoomUrl(img.url)}
                                className="relative aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
                              >
                                <img
                                  src={getImageUrl(img.url)}
                                  alt="Foto libro"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                {img.es_portada && (
                                  <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center space-x-0.5">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>Portada</span>
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                                {!img.es_portada ? (
                                  <button
                                    onClick={() => handleSetCover(img.id)}
                                    className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center space-x-1"
                                    title="Definir esta imagen como la portada principal"
                                  >
                                    <Star className="w-3 h-3" />
                                    <span>Portada</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Principal</span>
                                  </span>
                                )}

                                <button
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition"
                                  title="Eliminar esta foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                          <p>No hay fotos registradas para este libro.</p>
                          <p className="text-[11px] text-slate-400">Sube fotos o añade URLs arriba.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
                <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Selecciona un Libro</h4>
                <p className="text-xs">
                  Haz clic en cualquier título de la lista para gestionar sus ejemplares físicos y sus fotos de referencia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Book */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <BookPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Registrar Nuevo Título en Catálogo</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISBN / ISSN *</label>
                  <input
                    type="text"
                    required
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-0134494166"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título de la Obra *</label>
                  <input
                    type="text"
                    required
                    value={newBook.titulo}
                    onChange={(e) => setNewBook({ ...newBook, titulo: e.target.value })}
                    placeholder="Título del libro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Autor(es) *</label>
                  <input
                    type="text"
                    required
                    value={newBook.autor}
                    onChange={(e) => setNewBook({ ...newBook, autor: e.target.value })}
                    placeholder="Nombre del autor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Editorial *</label>
                  <input
                    type="text"
                    required
                    value={newBook.editorial}
                    onChange={(e) => setNewBook({ ...newBook, editorial: e.target.value })}
                    placeholder="Editorial"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Género / Categoría *</label>
                  <input
                    type="text"
                    required
                    value={newBook.genero}
                    onChange={(e) => setNewBook({ ...newBook, genero: e.target.value })}
                    placeholder="Ingeniería de Software"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio de Venta (COP) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={newBook.precio}
                    onChange={(e) => setNewBook({ ...newBook, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cantidad de Ejemplares Iniciales *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={newBook.cantidad_ejemplares}
                    onChange={(e) => setNewBook({ ...newBook, cantidad_ejemplares: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sede de Almacenamiento *</label>
                  <input
                    type="text"
                    value={newBook.sede}
                    onChange={(e) => setNewBook({ ...newBook, sede: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Photos & References Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Fotos del Libro (Portada y Referencias)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {modalImages.length} foto(s) agregada(s)
                  </span>
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
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{uploadingModalImg ? 'Subiendo...' : 'Subir desde PC'}</span>
                  </button>

                  <div className="flex flex-1 gap-2">
                    <input
                      type="url"
                      value={modalUrlInput}
                      onChange={(e) => setModalUrlInput(e.target.value)}
                      placeholder="O pegar URL directa de imagen (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleModalAddUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Previews Strip */}
                {modalImages.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-1">
                    {modalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative w-20 flex-shrink-0 rounded-xl border p-1 bg-white space-y-1 transition ${
                          img.es_portada
                            ? 'border-emerald-500 ring-2 ring-emerald-300'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="relative aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden">
                          <img
                            src={getImageUrl(img.url)}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          {img.es_portada && (
                            <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded shadow-xs">
                              Portada
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          {!img.es_portada ? (
                            <button
                              type="button"
                              onClick={() => handleModalSetCover(idx)}
                              className="text-emerald-700 font-bold hover:underline"
                              title="Marcar como portada"
                            >
                              Portada
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold">★ Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleModalRemoveImage(idx)}
                            className="text-rose-500 hover:text-rose-700"
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinopsis / Descripción</label>
                <textarea
                  rows={3}
                  value={newBook.descripcion}
                  onChange={(e) => setNewBook({ ...newBook, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={getImageUrl(previewZoomUrl)}
              alt="Vista ampliada"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
