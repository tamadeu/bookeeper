import { BookStatus } from "@/types/book";

export const STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "Quero Ler",
  reading: "Lendo",
  read: "Lido",
};

export const STATUS_COLORS: Record<BookStatus, string> = {
  want_to_read: "bg-slate-100 text-slate-700",
  reading: "bg-blue-100 text-blue-700",
  read: "bg-green-100 text-green-700",
};

export const GENRES = [
  "Ficção",
  "Fantasia",
  "Ficção Científica",
  "Romance",
  "Terror",
  "Mistério",
  "Thriller",
  "Não-Ficção",
  "Biografia",
  "História",
  "Ciência",
  "Filosofia",
  "Autoajuda",
  "Tecnologia",
  "Arte",
  "Outro",
] as const;
