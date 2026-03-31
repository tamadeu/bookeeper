"use client";

import { useState, KeyboardEvent } from "react";
import Image from "next/image";
import { Search, Loader2, AlertCircle, BookOpen, CheckCircle2 } from "lucide-react";
import { BookGenre } from "@/types/book";
import { safeGenre } from "@/lib/genreMapper";
import type { ISBNBookPreview } from "./ISBNSearchTab";
import type { BookSearchResult } from "@/app/api/books/search/route";

interface BookTextSearchTabProps {
  onUse: (data: ISBNBookPreview) => void;
}

type SearchStatus = "idle" | "loading" | "found" | "error";

export function BookTextSearchTab({ onUse }: BookTextSearchTabProps) {
  const [titleQuery, setTitleQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const search = async () => {
    if (!titleQuery.trim() && !authorQuery.trim()) return;

    setStatus("loading");
    setResults([]);

    const params = new URLSearchParams();
    if (titleQuery.trim()) params.set("title", titleQuery.trim());
    if (authorQuery.trim()) params.set("author", authorQuery.trim());

    try {
      const res = await fetch(`/api/books/search?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Erro ao buscar livros.");
        setStatus("error");
        return;
      }

      if (!json.results?.length) {
        setErrorMsg("Nenhum livro encontrado para essa pesquisa.");
        setStatus("error");
        return;
      }

      setResults(json.results);
      setStatus("found");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
  };

  const handleUse = (book: BookSearchResult) => {
    const coverUrl =
      book.imageLinks?.thumbnail ?? book.imageLinks?.smallThumbnail ?? "";
    onUse({
      title: book.title ?? "",
      author: book.authors?.[0] ?? "",
      coverUrl,
      genre: safeGenre(book.categories ?? []) as BookGenre,
      notes: book.description ?? "",
      publisher: book.publisher ?? "",
      publishedDate: book.publishedDate ?? "",
      pageCount: book.pageCount ?? null,
      buyLink: book.buyLink ?? "",
      previewLink: book.previewLink ?? "",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search fields */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: O Senhor dos Anéis"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Autor
          </label>
          <input
            type="text"
            value={authorQuery}
            onChange={(e) => setAuthorQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: J.R.R. Tolkien"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <button
          type="button"
          onClick={search}
          disabled={
            status === "loading" ||
            (!titleQuery.trim() && !authorQuery.trim())
          }
          className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Buscar
        </button>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            >
              <div className="w-14 h-20 rounded-lg bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {status === "found" && results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((book, index) => {
            const coverUrl =
              book.imageLinks?.thumbnail ??
              book.imageLinks?.smallThumbnail ??
              "";
            return (
              <div
                key={`${book.id}-${index}`}
                className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                {/* Cover */}
                <div className="relative w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={book.title ?? "Capa"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Info + button */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                      {book.title ?? "Sem título"}
                    </p>
                    {book.authors && book.authors.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {book.authors.join(", ")}
                      </p>
                    )}
                    {book.publishedDate && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {book.publishedDate}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUse(book)}
                    className="mt-2 self-start flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Usar este livro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Search className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm text-center">
            Pesquise pelo título ou autor do livro
          </p>
        </div>
      )}
    </div>
  );
}
