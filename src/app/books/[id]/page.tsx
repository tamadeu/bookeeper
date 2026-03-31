"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBooks } from "@/context/BooksContext";
import { StarRating } from "@/components/StarRating";
import { BookFormModal } from "@/components/BookFormModal";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getBook, deleteBook } = useBooks();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const book = getBook(params.id as string);

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Livro não encontrado</p>
        <Link
          href="/"
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          Voltar para a biblioteca
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteBook(book.id);
    router.push("/");
  };

  const formatDate = (date: string | null) =>
    date
      ? new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Biblioteca</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Remover</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row gap-0">
              {/* Cover */}
              <div className="relative sm:w-48 w-full h-64 sm:h-auto bg-slate-100 shrink-0">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={`Capa de ${book.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                    {book.title}
                  </h1>
                  <span
                    className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[book.status]}`}
                  >
                    {STATUS_LABELS[book.status]}
                  </span>
                </div>

                <p className="text-slate-500 text-base mb-4">{book.author}</p>

                <div className="flex items-center gap-3 flex-wrap mb-6">
                  <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {book.genre}
                  </span>
                  {book.rating !== null && (
                    <StarRating value={book.rating} readonly />
                  )}
                </div>

                {/* Publisher metadata */}
                {(book.publisher || book.publishedDate || book.pageCount) && (
                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
                    {book.publisher && (
                      <span>
                        <span className="text-slate-400">Editora: </span>
                        {book.publisher}
                      </span>
                    )}
                    {book.publishedDate && (
                      <span>
                        <span className="text-slate-400">Publicado: </span>
                        {book.publishedDate}
                      </span>
                    )}
                    {book.pageCount && (
                      <span>
                        <span className="text-slate-400">Páginas: </span>
                        {book.pageCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      <span className="text-slate-400">Adicionado: </span>
                      {formatDate(book.createdAt)}
                    </span>
                  </div>
                  {book.startedAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <span className="text-slate-400">Iniciado: </span>
                        {formatDate(book.startedAt)}
                      </span>
                    </div>
                  )}
                  {book.finishedAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <span className="text-slate-400">Concluído: </span>
                        {formatDate(book.finishedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {book.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Notas pessoais
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {book.notes}
                    </p>
                  </div>
                )}

                {/* External links */}
                {(book.previewLink || book.buyLink) && (
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                    {book.previewLink && (
                      <a
                        href={book.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ler amostra
                      </a>
                    )}
                    {book.buyLink && (
                      <a
                        href={book.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Comprar livro
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />

      {/* Edit modal */}
      <BookFormModal
        isOpen={editing}
        onClose={() => setEditing(false)}
        editingBook={book}
      />

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Remover livro?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              "{book.title}" será removido permanentemente da sua biblioteca.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
