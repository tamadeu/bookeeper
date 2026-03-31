"use client";

import { useState, useRef, KeyboardEvent } from "react";
import Image from "next/image";
import { Search, Loader2, AlertCircle, BookOpen, CheckCircle2, Camera, ScanBarcode } from "lucide-react";
import { BookGenre } from "@/types/book";
import { safeGenre } from "@/lib/genreMapper";
import type { GoogleBookData } from "@/app/api/isbn/[isbn]/route";

export interface ISBNBookPreview {
  title: string;
  author: string;
  coverUrl: string;
  genre: BookGenre;
  notes: string;
  publisher: string;
  publishedDate: string;
  pageCount: number | null;
  buyLink: string;
  previewLink: string;
}

interface ISBNSearchTabProps {
  onUse: (data: ISBNBookPreview) => void;
}

type SearchStatus = "idle" | "loading" | "found" | "error";

export function ISBNSearchTab({ onUse }: ISBNSearchTabProps) {
  const [isbn, setIsbn] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [book, setBook] = useState<GoogleBookData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    const clean = isbn.replace(/[\s-]/g, "");
    if (!clean) return;

    setStatus("loading");
    setBook(null);

    try {
      const res = await fetch(`/api/isbn/${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Livro não encontrado.");
        setStatus("error");
        return;
      }

      setBook(json as GoogleBookData);
      setStatus("found");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
  };

  const handleBarcodeImage = async (file: File) => {
    setScanning(true);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      });

      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);
      URL.revokeObjectURL(imageUrl);

      const decoded = result.getText().replace(/[\s-]/g, "");
      setIsbn(decoded);
      setScanning(false);

      // Dispara busca automaticamente
      setStatus("loading");
      setBook(null);
      const res = await fetch(`/api/isbn/${encodeURIComponent(decoded)}`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Livro não encontrado.");
        setStatus("error");
      } else {
        setBook(json as GoogleBookData);
        setStatus("found");
      }
    } catch {
      setScanning(false);
      setErrorMsg("Não foi possível ler o código de barras. Tente novamente.");
      setStatus("error");
    }
  };

  const coverUrl = book?.imageLinks?.thumbnail ?? book?.imageLinks?.smallThumbnail ?? "";

  const handleUse = () => {
    if (!book) return;
    onUse({
      title: book.title ?? "",
      author: book.authors?.[0] ?? "",
      coverUrl,
      genre: safeGenre(book.categories ?? []),
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
      {/* ISBN input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ISBN
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 9788535914048"
            maxLength={17}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning || status === "loading"}
            title="Escanear código de barras com câmera"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={search}
            disabled={status === "loading" || !isbn.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Buscar
          </button>
        </div>
        {/* hidden file input for barcode scanning */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleBarcodeImage(file);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-slate-400 mt-1.5">
          Digite um ISBN-10 ou ISBN-13, ou use a câmera para escanear o código de barras
        </p>
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
        <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse">
          <div className="w-20 h-28 rounded-lg bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
        </div>
      )}

      {/* Result preview */}
      {status === "found" && book && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 overflow-hidden">
          <div className="flex gap-4 p-4">
            {/* Cover */}
            <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-200 shadow-sm">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={book.title ?? "Capa"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                {book.title ?? "Sem título"}
              </p>
              {book.authors && book.authors.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {book.authors.join(", ")}
                </p>
              )}
              {book.categories && book.categories.length > 0 && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {book.categories.slice(0, 4).join(" · ")}
                </p>
              )}
              {book.publishedDate && (
                <p className="text-xs text-slate-400 mt-1">
                  Publicado: {book.publishedDate}
                </p>
              )}
            </div>
          </div>

          {/* Use button */}
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleUse}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Usar este livro
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <ScanBarcode className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Digite um ISBN ou escaneie o código de barras</p>
        </div>
      )}
    </div>
  );
}
