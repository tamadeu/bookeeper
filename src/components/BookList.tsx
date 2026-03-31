"use client";

import { useState, useMemo } from "react";
import { useBooks } from "@/context/BooksContext";
import { BookCard } from "@/components/BookCard";
import { BookStatus } from "@/types/book";
import { STATUS_LABELS, GENRES } from "@/lib/constants";
import Link from "next/link";
import { Search, Plus, BookOpen, SlidersHorizontal, X, TrendingUp } from "lucide-react";

interface FiltersState {
  search: string;
  status: BookStatus | "all";
  genre: string;
}

interface BookListProps {
  onAddBook: () => void;
}

export function BookList({ onAddBook }: BookListProps) {
  const { books } = useBooks();
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "all",
    genre: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        filters.search === "" ||
        book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" || book.status === filters.status;

      const matchesGenre =
        filters.genre === "all" || book.genre === filters.genre;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [books, filters]);

  const stats = useMemo(
    () => ({
      total: books.length,
      read: books.filter((b) => b.status === "read").length,
      reading: books.filter((b) => b.status === "reading").length,
      want_to_read: books.filter((b) => b.status === "want_to_read").length,
    }),
    [books]
  );

  const hasActiveFilters =
    filters.status !== "all" || filters.genre !== "all" || filters.search !== "";

  const clearFilters = () =>
    setFilters({ search: "", status: "all", genre: "all" });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-800">Bookeeper</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={onAddBook}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar livro
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-slate-700" },
            { label: "Lidos", value: stats.read, color: "text-green-600" },
            { label: "Lendo", value: stats.reading, color: "text-blue-600" },
            {
              label: "Quero ler",
              value: stats.want_to_read,
              color: "text-slate-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                {(["all", "want_to_read", "reading", "read"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilters((f) => ({ ...f, status }))}
                      className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                        filters.status === status
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {status === "all" ? "Todos" : STATUS_LABELS[status]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Gênero
              </p>
              <select
                value={filters.genre}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, genre: e.target.value }))
                }
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="all">Todos os gêneros</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {filtered.length === books.length
            ? `${books.length} livros`
            : `${filtered.length} de ${books.length} livros`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum livro encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              Tente ajustar os filtros ou adicionar um novo livro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
