import { NextResponse } from "next/server";
import type { GoogleBookData } from "@/app/api/isbn/[isbn]/route";

export interface ExploreBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  categories: string[];
  publisher: string;
  publishedDate: string;
  pageCount: number | null;
  description: string;
  buyLink: string;
  previewLink: string;
}

function upgradeHttps(url?: string): string {
  return url?.replace(/^http:\/\//, "https://") ?? "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const orderBy = searchParams.get("orderBy") === "newest" ? "newest" : "relevance";
  const maxResults = Math.min(Number(searchParams.get("maxResults") ?? "12"), 20);

  if (!q) {
    return NextResponse.json({ error: "Parâmetro q é obrigatório." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}&orderBy=${orderBy}&langRestrict=pt${
    apiKey ? `&key=${apiKey}` : ""
  }`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro na API do Google Books." }, { status: 502 });
    }

    const data = await res.json();

    if (!data.items?.length) {
      return NextResponse.json({ books: [] });
    }

    const books: ExploreBook[] = (
      data.items as Array<{
        id: string;
        volumeInfo: GoogleBookData;
        saleInfo?: { buyLink?: string };
      }>
    )
      .filter((item) => {
        const thumb =
          item.volumeInfo.imageLinks?.thumbnail ??
          item.volumeInfo.imageLinks?.smallThumbnail;
        return !!thumb;
      })
      .map((item) => {
        const v = item.volumeInfo;
        return {
          id: item.id,
          title: v.title ?? "Sem título",
          author: v.authors?.[0] ?? "Autor desconhecido",
          coverUrl: upgradeHttps(
            v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail
          ),
          categories: v.categories ?? [],
          publisher: v.publisher ?? "",
          publishedDate: v.publishedDate ?? "",
          pageCount: v.pageCount ?? null,
          description: v.description ?? "",
          buyLink: upgradeHttps(item.saleInfo?.buyLink),
          previewLink: upgradeHttps(v.previewLink),
        };
      });

    return NextResponse.json({ books });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível contactar o Google Books." },
      { status: 502 }
    );
  }
}
