export type BookStatus = "want_to_read" | "reading" | "read";

export type BookGenre =
  | "Ficção"
  | "Fantasia"
  | "Ficção Científica"
  | "Romance"
  | "Terror"
  | "Mistério"
  | "Thriller"
  | "Não-Ficção"
  | "Biografia"
  | "História"
  | "Ciência"
  | "Filosofia"
  | "Autoajuda"
  | "Tecnologia"
  | "Arte"
  | "Outro";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;
  status: BookStatus;
  rating: number | null; // 1–5
  coverUrl: string;
  notes: string;
  publisher: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  buyLink: string | null;
  previewLink: string | null;
  startedAt: string | null; // ISO date string
  finishedAt: string | null;
  createdAt: string;
}
