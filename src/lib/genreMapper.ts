import { BookGenre } from "@/types/book";
import { GENRES } from "@/lib/constants";

export function mapSubjectsToGenre(subjects: string[]): BookGenre {
  const lower = subjects.map((s) => s.toLowerCase());
  const check = (...terms: string[]) =>
    terms.some((t) => lower.some((s) => s.includes(t)));

  if (check("fantasy", "fantasia", "magic")) return "Fantasia";
  if (check("science fiction", "sci-fi", "ficção científica", "speculative fiction"))
    return "Ficção Científica";
  if (check("horror", "terror")) return "Terror";
  if (check("mystery", "mistério", "detective", "crime fiction")) return "Mistério";
  if (check("thriller", "suspense")) return "Thriller";
  if (check("romance", "love stories")) return "Romance";
  if (check("biography", "autobiography", "biografia", "memoir")) return "Biografia";
  if (check("history", "história", "historical")) return "História";
  if (check("philosophy", "filosofia")) return "Filosofia";
  if (check("self-help", "personal development", "autoajuda", "motivational"))
    return "Autoajuda";
  if (check("technology", "computer", "programming", "tecnologia")) return "Tecnologia";
  if (check("science", "ciência", "biology", "physics", "chemistry")) return "Ciência";
  if (check("art", "arte", "design", "drawing")) return "Arte";
  if (check("nonfiction", "non-fiction", "não-ficção", "essays")) return "Não-Ficção";

  return "Ficção";
}

// Ensure the mapped genre is in our GENRES list, else fall back to "Outro"
export function safeGenre(subjects: string[]): BookGenre {
  const mapped = mapSubjectsToGenre(subjects);
  return (GENRES as readonly string[]).includes(mapped) ? mapped : "Outro";
}
