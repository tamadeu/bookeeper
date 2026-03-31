"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  BookOpen,
  RefreshCw,
  Library,
} from "lucide-react";
import { safeGenre } from "@/lib/genreMapper";
import type { ISBNBookPreview } from "./ISBNSearchTab";
import type { BookSearchResult } from "@/app/api/books/search/route";

interface ShelfScanTabProps {
  onBulkAdd: (books: ISBNBookPreview[]) => Promise<void>;
}

type ScanStatus = "idle" | "scanning" | "enriching" | "done" | "error";

interface DetectedBook {
  title: string;
  author: string;
  enriched: ISBNBookPreview | null;
  selected: boolean;
}

export function ShelfScanTab({ onBulkAdd }: ShelfScanTabProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [books, setBooks] = useState<DetectedBook[]>([]);
  const [enrichProgress, setEnrichProgress] = useState({ done: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setStatus("idle");
    setBooks([]);
    setErrorMsg("");
    setImagePreview(URL.createObjectURL(file));
  };

  const scan = async () => {
    if (!imageFile) return;

    setStatus("scanning");
    setBooks([]);
    setErrorMsg("");

    // Step 1: Gemini identifies books from the photo
    const formData = new FormData();
    formData.append("image", imageFile);

    let identified: { title: string; author: string }[] = [];
    try {
      const res = await fetch("/api/books/scan-shelf", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Erro ao analisar a imagem.");
        setStatus("error");
        return;
      }
      identified = json.books ?? [];
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
      return;
    }

    if (!identified.length) {
      setErrorMsg(
        "Nenhum livro identificado na imagem. Tente uma foto com as lombadas mais visíveis e bem iluminadas."
      );
      setStatus("error");
      return;
    }

    // Step 2: Enrich each book with Google Books data
    setStatus("enriching");
    setEnrichProgress({ done: 0, total: identified.length });

    const enriched: DetectedBook[] = await Promise.all(
      identified.map(async ({ title, author }) => {
        try {
          const params = new URLSearchParams();
          if (title) params.set("title", title);
          if (author) params.set("author", author);
          const res = await fetch(`/api/books/search?${params.toString()}`);
          const json = await res.json();
          const first: BookSearchResult | undefined = json.results?.[0];
          const coverUrl =
            first?.imageLinks?.thumbnail ??
            first?.imageLinks?.smallThumbnail ??
            "";
          const preview: ISBNBookPreview = {
            title: first?.title ?? title,
            author: first?.authors?.[0] ?? author,
            coverUrl,
            genre: safeGenre(first?.categories ?? []),
            notes: first?.description ?? "",
            publisher: first?.publisher ?? "",
            publishedDate: first?.publishedDate ?? "",
            pageCount: first?.pageCount ?? null,
            buyLink: first?.buyLink ?? "",
            previewLink: first?.previewLink ?? "",
          };
          return { title: preview.title, author: preview.author, enriched: preview, selected: true };
        } catch {
          return { title, author, enriched: null, selected: true };
        } finally {
          setEnrichProgress((p) => ({ ...p, done: p.done + 1 }));
        }
      })
    );

    setBooks(enriched);
    setStatus("done");
  };

  const toggleBook = (idx: number) => {
    setBooks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, selected: !b.selected } : b))
    );
  };

  const toggleAll = () => {
    const allSelected = books.every((b) => b.selected);
    setBooks((prev) => prev.map((b) => ({ ...b, selected: !allSelected })));
  };

  const selectedBooks = books.filter((b) => b.selected && b.enriched);

  const handleAdd = async () => {
    setAdding(true);
    await onBulkAdd(selectedBooks.map((b) => b.enriched!));
    setAdding(false);
  };

  const reset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setStatus("idle");
    setBooks([]);
    setErrorMsg("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload / preview area */}
      {!imagePreview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 w-full h-44 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors"
        >
          <Camera className="w-10 h-10" />
          <span className="text-sm font-medium">Tire uma foto da estante</span>
          <span className="text-xs">ou clique para selecionar uma imagem</span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Estante de livros"
            className="w-full max-h-52 object-cover"
          />
          {status === "idle" && (
            <button
              type="button"
              onClick={reset}
              title="Trocar imagem"
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
          e.target.value = "";
        }}
      />

      {/* Scan button */}
      {imagePreview && status === "idle" && (
        <button
          type="button"
          onClick={scan}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Library className="w-4 h-4" />
          Identificar livros com IA
        </button>
      )}

      {/* Phase 1: Gemini analyzing */}
      {status === "scanning" && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Identificando livros com IA...</p>
          <p className="text-xs text-slate-400">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Phase 2: Enriching with Google Books */}
      {status === "enriching" && (
        <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">
            Buscando dados dos livros... ({enrichProgress.done}/{enrichProgress.total})
          </p>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  enrichProgress.total
                    ? (enrichProgress.done / enrichProgress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="text-xs underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {status === "done" && books.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {books.length} livro{books.length !== 1 ? "s" : ""} identificado
              {books.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-indigo-600 hover:underline"
            >
              {books.every((b) => b.selected) ? "Desmarcar todos" : "Selecionar todos"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {books.map((book, idx) => {
              const cover = book.enriched?.coverUrl ?? "";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleBook(idx)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${
                    book.selected
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-slate-200 bg-white opacity-50"
                  }`}
                >
                  {book.selected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden bg-slate-200">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={book.enriched?.title ?? book.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                      {book.enriched?.title ?? book.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {book.enriched?.author ?? book.author}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedBooks.length || adding}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Library className="w-4 h-4" />
            )}
            {adding
              ? "Adicionando..."
              : `Adicionar ${selectedBooks.length} livro${selectedBooks.length !== 1 ? "s" : ""}`}
          </button>
        </>
      )}

      {/* Idle empty state */}
      {status === "idle" && !imagePreview && (
        <p className="text-center text-xs text-slate-400 pb-2">
          A IA vai identificar os livros pela lombada automaticamente
        </p>
      )}
    </div>
  );
}
