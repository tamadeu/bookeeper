"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BookMarked,
  ExternalLink,
  ShoppingCart,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { BookFormModal } from "@/components/BookFormModal";
import { useBooks } from "@/context/BooksContext";
import { safeGenre } from "@/lib/genreMapper";
import type { ExploreBook } from "@/app/api/books/explore/route";
import type { ISBNBookPreview } from "@/components/ISBNSearchTab";
import type { BookGenre } from "@/types/book";

function toISBNPreview(book: ExploreBook): ISBNBookPreview {
  return {
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    genre: safeGenre(book.categories) as BookGenre,
    notes: book.description,
    publisher: book.publisher,
    publishedDate: book.publishedDate,
    pageCount: book.pageCount,
    buyLink: book.buyLink,
    previewLink: book.previewLink,
  };
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <header className="bg-white border-b border-slate-200 h-14" />
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex gap-5">
          <div className="w-28 h-40 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 bg-slate-200 rounded w-4/5" />
            <div className="h-4 bg-slate-200 rounded w-3/5" />
            <div className="h-4 bg-slate-200 rounded w-2/5" />
            <div className="h-10 bg-slate-200 rounded-xl mt-4 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function ExploreBookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { books } = useBooks();

  const [book, setBook] = useState<ExploreBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    fetch(`/api/books/google/${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setBook(data.book ?? null))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => setModalOpen(false), []);

  // Check if already in library (by title+author match)
  const alreadyAdded = book
    ? books.some(
        (b) =>
          b.title.toLowerCase() === book.title.toLowerCase() &&
          b.author.toLowerCase() === book.author.toLowerCase()
      )
    : false;

  if (loading) return <DetailSkeleton />;

  if (notFound || !book) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Livro não encontrado</p>
        <Link href="/explore" className="text-indigo-600 text-sm font-medium hover:underline">
          Voltar para Explorar
        </Link>
      </div>
    );
  }

  const preview = toISBNPreview(book);
  const genre = safeGenre(book.categories);

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-28">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-600 truncate flex-1">
              {book.title}
            </span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Hero: capa + info principal */}
          <div className="flex gap-5">
            {/* Capa */}
            <div className="relative w-28 h-[168px] rounded-xl overflow-hidden shadow-lg shrink-0">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`Capa de ${book.title}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1 flex flex-col gap-2">
              <h1 className="text-lg font-bold text-slate-800 leading-snug">
                {book.title}
              </h1>
              <p className="text-sm text-slate-500">{book.author}</p>

              {genre && (
                <span className="self-start text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                  {genre}
                </span>
              )}

              {/* CTA */}
              {alreadyAdded ? (
                <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Na sua biblioteca
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="mt-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200"
                >
                  <BookMarked className="w-4 h-4" />
                  Adicionar à biblioteca
                </button>
              )}
            </div>
          </div>

          {/* Metadados */}
          {(book.publisher || book.publishedDate || book.pageCount) && (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {book.publisher && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400 w-20 shrink-0">Editora</span>
                  <span className="text-sm text-slate-700 truncate">{book.publisher}</span>
                </div>
              )}
              {book.publishedDate && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400 w-20 shrink-0">Publicado</span>
                  <span className="text-sm text-slate-700">{book.publishedDate}</span>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400 w-20 shrink-0">Páginas</span>
                  <span className="text-sm text-slate-700">{book.pageCount}</span>
                </div>
              )}
            </div>
          )}

          {/* Descrição */}
          {book.description && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Sinopse</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {book.description.replace(/<[^>]*>/g, "")}
              </p>
            </div>
          )}

          {/* Links externos */}
          {(book.previewLink || book.buyLink) && (
            <div className="flex flex-col gap-2">
              {book.previewLink && (
                <a
                  href={book.previewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver prévia no Google Books
                </a>
              )}
              {book.buyLink && (
                <a
                  href={book.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar livro
                </a>
              )}
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      <BookFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        prefillData={preview}
      />
    </>
  );
}
