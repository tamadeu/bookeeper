"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Plus, Loader2, Compass } from "lucide-react";
import { BookFormModal } from "@/components/BookFormModal";
import { BottomNav } from "@/components/BottomNav";
import { safeGenre } from "@/lib/genreMapper";
import type { BookGenre } from "@/types/book";
import type { ISBNBookPreview } from "@/components/ISBNSearchTab";
import type { ExploreBook } from "@/app/api/books/explore/route";

const SECTIONS = [
  { id: "alta",     title: "Em Alta",            q: "bestseller romance thriller suspense" },
  { id: "novos",    title: "Novidades",           q: "lançamento livro 2025", orderBy: "newest" },
  { id: "ficcao",   title: "Ficção",              q: "ficção romance literário" },
  { id: "suspense", title: "Suspense & Terror",   q: "suspense thriller policial mistério" },
  { id: "nonfic",   title: "Não-Ficção",          q: "história biografia autoajuda" },
  { id: "fantasia", title: "Fantasia",            q: "fantasia magia aventura" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function BookSkeleton() {
  return (
    <div className="flex-none w-[108px] animate-pulse">
      <div className="w-[108px] h-[160px] bg-slate-200 rounded-xl mb-2" />
      <div className="h-3 bg-slate-200 rounded w-4/5 mb-1.5" />
      <div className="h-3 bg-slate-200 rounded w-3/5" />
    </div>
  );
}

function ExploreBookCard({
  book,
  onAdd,
}: {
  book: ExploreBook;
  onAdd: (book: ExploreBook) => void;
}) {
  return (
    <div className="flex-none w-[108px] group">
      <div className="relative w-[108px] h-[160px] rounded-xl overflow-hidden shadow-md mb-2">
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          sizes="108px"
          className="object-cover"
          unoptimized
        />
        <button
          onClick={() => onAdd(book)}
          className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity active:scale-95"
          aria-label={`Adicionar ${book.title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
        {book.title}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{book.author}</p>
    </div>
  );
}

function Section({
  title,
  q,
  orderBy,
  onAdd,
}: {
  title: string;
  q: string;
  orderBy?: string;
  onAdd: (book: ExploreBook) => void;
}) {
  const [books, setBooks] = useState<ExploreBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ q, maxResults: "12" });
    if (orderBy) params.set("orderBy", orderBy);

    fetch(`/api/books/explore?${params}`)
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [q, orderBy]);

  if (!loading && books.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-800 px-4 mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide pl-4 pr-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <BookSkeleton key={i} />)
          : books.map((book) => (
              <ExploreBookCard key={book.id} book={book} onAdd={onAdd} />
            ))}
      </div>
    </section>
  );
}

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

export default function ExplorePage() {
  const [prefill, setPrefill] = useState<ISBNBookPreview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = useCallback((book: ExploreBook) => {
    setPrefill(toISBNPreview(book));
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setPrefill(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-800">Bookeeper</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Biblioteca
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-4 pt-8 pb-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3 mb-1">
          <Compass className="w-6 h-6 text-white/80" />
          <h2 className="text-2xl font-bold text-white">Explorar</h2>
        </div>
        <p className="max-w-6xl mx-auto text-indigo-100 text-sm">
          Descubra novos livros para adicionar à sua biblioteca
        </p>
      </div>

      {/* Sections */}
      <div className="mt-8 flex flex-col gap-8 max-w-6xl mx-auto">
        {SECTIONS.map((s) => (
          <Section
            key={s.id}
            title={s.title}
            q={s.q}
            orderBy={"orderBy" in s ? s.orderBy : undefined}
            onAdd={handleAdd}
          />
        ))}
      </div>

      <BookFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        prefillData={prefill}
      />

      <BottomNav />
    </div>
  );
}
