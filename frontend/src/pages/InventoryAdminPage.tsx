import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
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
  Layers
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
    portada_url: '',
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
    fetchBooks();
  }, []);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const created = await api.libros.create(newBook);
      setBooks([created, ...books]);
      setShowCreateModal(false);
      setFeedback({
        type: 'success',
        message: `Libro '${created.titulo}' registrado exitosamente con ${newBook.cantidad_ejemplares} ejemplares iniciales.`,
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
        portada_url: '',
        cantidad_ejemplares: 3,
        sede: 'Sede Principal Pereira',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al registrar libro.',
      });
    } finally {
      setIsSubmitting(false);
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
        message: `Ejemplar físico dado de baja exitosamente (RF-004).`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Control de Inventario y Ejemplares Físicos</h1>
            <p className="text-xs text-slate-500">
              Gestión granular por copia única con código LIB-XXX-EJYYY (RF-001, RF-002, RF-004, RF-005, RF-006).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBooks}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refrescar inventario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
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
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition shadow-xs flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    {book.portada_url ? (
                      <img
                        src={book.portada_url}
                        alt={book.titulo}
                        className="w-12 h-16 object-cover rounded-md shadow-xs border border-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 font-bold text-[10px] flex-shrink-0">
                        Libro
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
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
                      <p className="text-xs text-slate-500 truncate">{book.autor}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>ISBN: {book.isbn}</span>
                        <span>•</span>
                        <span className="font-sans font-bold text-slate-700">
                          ${book.precio.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Counters */}
                  <div className="text-right flex-shrink-0 space-y-1">
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

        {/* Selected Book Copies Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            {selectedBook ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Control Granular de Ejemplares</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {selectedBook.titulo}
                  </h3>
                  <p className="text-xs text-slate-500">ID Libro: #{selectedBook.id}</p>
                </div>

                {/* Add Copies Form */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Generar Nuevos Ejemplares Físicos (RF-005)</span>
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
                    Ejemplares Físicos ({selectedBook.ejemplares?.length || 0})
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
                                  title="Dar de baja este ejemplar físico (RF-004)"
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
                      <p className="text-xs text-slate-400 italic">No hay ejemplares registrados.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
                <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">
                  Selecciona un libro de la lista para inspeccionar y administrar sus copias físicas únicas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Book */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <BookPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Registrar Nuevo Título en Catálogo</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL de Portada</label>
                <input
                  type="url"
                  value={newBook.portada_url}
                  onChange={(e) => setNewBook({ ...newBook, portada_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
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
    </div>
  );
};
