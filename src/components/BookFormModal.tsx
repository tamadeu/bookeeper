"use client";

import { useState, useEffect, FormEvent } from "react";
import { Book, BookStatus, BookGenre } from "@/types/book";
import { useBooks } from "@/context/BooksContext";
import { StarRating } from "./StarRating";
import { STATUS_LABELS, GENRES } from "@/lib/constants";
import { ISBNSearchTab, type ISBNBookPreview } from "./ISBNSearchTab";
import { BookTextSearchTab } from "./BookTextSearchTab";
import { ShelfScanTab } from "./ShelfScanTab";
import { X, PenLine, Barcode, TextSearch, Library } from "lucide-react";

type ModalTab = "manual" | "isbn" | "search" | "shelf";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBook?: Book | null;
}

const DEFAULT_FORM = {
  title: "",
  author: "",
  genre: "Ficção" as BookGenre,
  status: "want_to_read" as BookStatus,
  rating: null as number | null,
  coverUrl: "",
  notes: "",
  publisher: "",
  publishedDate: "",
  pageCount: null as number | null,
  buyLink: "",
  previewLink: "",
  startedAt: "",
  finishedAt: "",
};

export function BookFormModal({ isOpen, onClose, editingBook }: BookFormModalProps) {
  const { addBook, updateBook } = useBooks();
  const [tab, setTab] = useState<ModalTab>("isbn");
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (editingBook) {
      setTab("manual");
      setForm({
        title: editingBook.title,
        author: editingBook.author,
        genre: editingBook.genre,
        status: editingBook.status,
        rating: editingBook.rating,
        coverUrl: editingBook.coverUrl ?? "",
        notes: editingBook.notes ?? "",
        publisher: editingBook.publisher ?? "",
        publishedDate: editingBook.publishedDate ?? "",
        pageCount: editingBook.pageCount ?? null,
        buyLink: editingBook.buyLink ?? "",
        previewLink: editingBook.previewLink ?? "",
        startedAt: editingBook.startedAt ?? "",
        finishedAt: editingBook.finishedAt ?? "",
      });
    } else {
      setTab("isbn");
      setForm(DEFAULT_FORM);
    }
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      status: form.status,
      rating: form.rating,
      coverUrl: form.coverUrl.trim() || "",
      notes: form.notes.trim(),
      publisher: form.publisher.trim() || null,
      publishedDate: form.publishedDate.trim() || null,
      pageCount: form.pageCount,
      buyLink: form.buyLink.trim() || null,
      previewLink: form.previewLink.trim() || null,
      startedAt: form.startedAt || null,
      finishedAt: form.finishedAt || null,
    };
    if (editingBook) {
      updateBook(editingBook.id, payload);
    } else {
      addBook(payload);
    }
    onClose();
  };

  const handleBulkAdd = async (previews: ISBNBookPreview[]) => {
    for (const preview of previews) {
      await addBook({
        title: preview.title,
        author: preview.author,
        genre: preview.genre,
        status: "want_to_read",
        rating: null,
        coverUrl: preview.coverUrl,
        notes: preview.notes,
        publisher: preview.publisher || null,
        publishedDate: preview.publishedDate || null,
        pageCount: preview.pageCount,
        buyLink: preview.buyLink || null,
        previewLink: preview.previewLink || null,
        startedAt: null,
        finishedAt: null,
      });
    }
    onClose();
  };

  // Called when user picks a book from the ISBN tab
  const handleISBNSelect = (preview: ISBNBookPreview) => {
    setForm((f) => ({
      ...f,
      title: preview.title,
      author: preview.author,
      coverUrl: preview.coverUrl,
      genre: preview.genre,
      notes: preview.notes,
      publisher: preview.publisher,
      publishedDate: preview.publishedDate,
      pageCount: preview.pageCount,
      buyLink: preview.buyLink,
      previewLink: preview.previewLink,
    }));
    setTab("manual");
  };

  const field = (label: string, node: React.ReactNode, required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {node}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingBook ? "Editar livro" : "Adicionar livro"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs — only shown when adding */}
        {!editingBook && (
          <div className="flex border-b border-slate-200 px-6">
            {(
              [
                { key: "isbn", label: "Buscar por ISBN", icon: Barcode },
                { key: "search", label: "Buscar por nome", icon: TextSearch },
                { key: "shelf", label: "Escanear estante", icon: Library },
                { key: "manual", label: "Formulário", icon: PenLine },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ISBN tab */}
        {tab === "isbn" && (
          <div className="overflow-y-auto px-6 py-5">
            <ISBNSearchTab onUse={handleISBNSelect} />
          </div>
        )}

        {/* Text search tab */}
        {tab === "search" && (
          <div className="overflow-y-auto px-6 py-5">
            <BookTextSearchTab onUse={handleISBNSelect} />
          </div>
        )}

        {/* Shelf scan tab */}
        {tab === "shelf" && (
          <div className="overflow-y-auto px-6 py-5">
            <ShelfScanTab onBulkAdd={handleBulkAdd} />
          </div>
        )}

        {/* Manual form tab */}
        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {field(
              "Título",
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: O Senhor dos Anéis"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />,
              true
            )}

            {field(
              "Autor",
              <input
                required
                type="text"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="Ex: J.R.R. Tolkien"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />,
              true
            )}

            <div className="grid grid-cols-2 gap-4">
              {field(
                "Gênero",
                <select
                  value={form.genre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, genre: e.target.value as BookGenre }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}

              {field(
                "Status",
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as BookStatus }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {(["want_to_read", "reading", "read"] as BookStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {field(
              "URL da capa",
              <input
                type="url"
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              {field(
                "Início da leitura",
                <input
                  type="date"
                  value={form.startedAt}
                  onChange={(e) => setForm((f) => ({ ...f, startedAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
              {field(
                "Término da leitura",
                <input
                  type="date"
                  value={form.finishedAt}
                  onChange={(e) => setForm((f) => ({ ...f, finishedAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Avaliação
              </label>
              <StarRating
                value={form.rating}
                onChange={(r) =>
                  setForm((f) => ({ ...f, rating: f.rating === r ? null : r }))
                }
              />
            </div>

            {field(
              "Notas pessoais",
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Suas impressões, citações favoritas..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingBook ? "Salvar alterações" : "Adicionar livro"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

